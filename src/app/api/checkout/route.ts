import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const body = await request.json();

    const {
      locationId,
      restaurantName,
      restaurantSlug,
      items,
      subtotal,
      deliveryFee,
      discountPercent,
      totalPrice,
      deliveryAddress,
      customerLat,
      customerLng,
      guestName,
      guestEmail,
      guestPhone,
      notes,
      orderType,
    } = body;

    // Validate location exists
    const location = await db.location.findUnique({
      where: { id: locationId },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        restaurant: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: "Lokalizacja nie istnieje" },
        { status: 400 },
      );
    }

    // Verify restaurant is still available/open (basic check)
    // Re-verify prices by checking current meal data
    const mealIds = items.map((item: any) => item.mealId);
    const currentMeals = await db.meal.findMany({
      where: {
        id: { in: mealIds },
        isAvailable: true,
        approvalStatus: "APPROVED",
      },
      select: {
        id: true,
        basePrice: true,
        name: true,
        variants: {
          select: { id: true, priceModifier: true, isAvailable: true },
        },
        addons: { select: { id: true, price: true, isAvailable: true } },
      },
    });

    if (currentMeals.length !== mealIds.length) {
      return NextResponse.json(
        { error: "Niektóre dania nie są już dostępne. Odśwież stronę." },
        { status: 400 },
      );
    }

    // Generate order number
    const now = new Date();
    const date = now.toISOString().slice(2, 10).replace(/-/g, "");
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    const orderNumber = `DSH-${date}-${random}`;

    // Estimate delivery time
    const totalItems = items.reduce(
      (sum: number, item: any) => sum + item.quantity,
      0,
    );
    const basePrep = 15;
    const perItem = 3;
    const deliveryTime = orderType === "PICKUP" ? 0 : 20;
    const estimatedMinutes =
      basePrep + Math.min(totalItems * perItem, 30) + deliveryTime;
    const estimatedDeliveryAt = new Date(
      Date.now() + estimatedMinutes * 60 * 1000,
    );

    // Geocode if needed
    let finalLat = customerLat || null;
    let finalLng = customerLng || null;
    if ((!finalLat || !finalLng) && deliveryAddress && orderType !== "PICKUP") {
      try {
        const query = encodeURIComponent(deliveryAddress);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=pl`,
          {
            headers: { "User-Agent": "DISHLY/1.0 (food delivery app)" },
            signal: AbortSignal.timeout(5000),
          },
        );
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            finalLat = parseFloat(data[0].lat);
            finalLng = parseFloat(data[0].lon);
          }
        }
      } catch {
        // geocoding optional
      }
    }

    // Create order in DB with PENDING payment status
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id ?? null,
        locationId,
        type: orderType === "PICKUP" ? "PICKUP" : "DELIVERY",
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        deliveryFee,
        discountPercent: discountPercent || 0,
        totalPrice,
        notes: notes || null,
        estimatedTime: estimatedMinutes,
        estimatedDeliveryAt,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        deliveryAddress: deliveryAddress || null,
        customerLat: finalLat,
        customerLng: finalLng,
        restaurantName,
        restaurantSlug,
        items: {
          create: items.map((item: any) => {
            const addonTotal = (item.addons || []).reduce(
              (sum: number, a: any) => sum + a.price * a.quantity,
              0,
            );
            const itemTotalPrice =
              (item.basePrice + (item.variantPriceModifier || 0) + addonTotal) *
              item.quantity;

            return {
              mealId: item.mealId,
              variantId: item.variantId || null,
              quantity: item.quantity,
              basePrice: item.basePrice,
              totalPrice: itemTotalPrice,
              note: item.note || null,
              mealName: item.mealName,
              addons: {
                create: (item.addons || []).map((addon: any) => ({
                  addonId: addon.addonId,
                  quantity: addon.quantity,
                  price: addon.price,
                })),
              },
            };
          }),
        },
      },
    });

    // Build Stripe line items
    const lineItems = items.map((item: any) => {
      const addonTotal = (item.addons || []).reduce(
        (sum: number, a: any) => sum + a.price * a.quantity,
        0,
      );
      const unitPrice =
        item.basePrice + (item.variantPriceModifier || 0) + addonTotal;
      const description = [
        item.variantName && `Wariant: ${item.variantName}`,
        ...(item.addons || []).map(
          (a: any) => `+ ${a.name}${a.quantity > 1 ? ` x${a.quantity}` : ""}`,
        ),
      ]
        .filter(Boolean)
        .join(", ");

      return {
        price_data: {
          currency: "pln",
          product_data: {
            name: item.mealName,
            ...(description ? { description } : {}),
          },
          unit_amount: Math.round(unitPrice * 100), // Stripe uses grosze/cents
        },
        quantity: item.quantity,
      };
    });

    // Add delivery fee as line item
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "pln",
          product_data: {
            name: "Dostawa",
            description: `Dostawa z ${restaurantName}`,
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // Apply discount as coupon if has discount
    let discounts: any[] = [];
    if (discountPercent && discountPercent > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: discountPercent,
        duration: "once",
      });
      discounts = [{ coupon: coupon.id }];
    }

    // Create Stripe Checkout Session
    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "blik", "p24"],
      line_items: lineItems,
      discounts,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      customer_email: guestEmail || session?.user?.email || undefined,
      success_url: `${origin}/order/success/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/order/cancelled/${order.id}`,
      locale: "pl",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes
    });

    // Save Stripe session ID to order
    await db.order.update({
      where: { id: order.id },
      data: { stripePaymentId: checkoutSession.id },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Nie udało się utworzyć sesji płatności" },
      { status: 500 },
    );
  }
}
