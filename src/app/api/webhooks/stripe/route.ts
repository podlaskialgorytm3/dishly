import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("Webhook: Brak nagłówka stripe-signature");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("Webhook: Brak STRIPE_WEBHOOK_SECRET w środowisku");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  // Handle Stripe events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (!orderId) {
        console.error("Webhook: brak orderId w metadata sesji");
        break;
      }

      // Check if order exists
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: { id: true, paymentStatus: true, status: true },
      });

      if (!order) {
        console.error(`Webhook: zamówienie ${orderId} nie istnieje`);
        break;
      }

      // Only update if payment is still pending (idempotency)
      if (order.paymentStatus === "PENDING") {
        await db.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "PENDING", // Now visible to restaurant staff as "Nowe"
            stripePaymentId: session.id,
          },
        });

        console.log(
          `Webhook: Zamówienie ${orderId} opłacone pomyślnie (session: ${session.id})`,
        );

        revalidatePath("/dashboard/orders");
        revalidatePath(`/order/${orderId}`);
      }

      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await db.order.findUnique({
          where: { id: orderId },
          select: { id: true, paymentStatus: true },
        });

        if (order && order.paymentStatus === "PENDING") {
          await db.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "FAILED",
              status: "CANCELLED",
              cancelledAt: new Date(),
            },
          });

          console.log(
            `Webhook: Sesja płatności wygasła dla zamówienia ${orderId}`,
          );
        }
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent;

      if (paymentIntentId) {
        // Find order by Stripe payment / session
        const orders = await db.order.findMany({
          where: {
            stripePaymentId: { not: null },
            paymentStatus: "PAID",
          },
          select: { id: true, stripePaymentId: true },
          take: 100,
        });

        // In a production app you'd link the payment_intent more directly
        // For now, this handles basic refund events
        console.log(`Webhook: Zwrot za charge ${charge.id}`);
      }
      break;
    }

    default:
      // Unhandled event types - log but don't error
      console.log(`Webhook: Nieobsługiwane zdarzenie: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
