import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      restaurantName,
      restaurantBio,
      planId,
    } = body;

    // Walidacja danych
    if (!email || !password || !restaurantName) {
      return NextResponse.json(
        { error: "Email, hasło i nazwa restauracji są wymagane" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Hasło musi mieć co najmniej 8 znaków" },
        { status: 400 },
      );
    }

    // Sprawdzenie czy użytkownik już istnieje
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Użytkownik z tym adresem email już istnieje" },
        { status: 409 },
      );
    }

    // Generowanie slug dla restauracji
    const slug = restaurantName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Sprawdzenie czy slug jest unikalny
    const existingRestaurant = await db.restaurant.findUnique({
      where: { slug },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { error: "Restauracja o tej nazwie już istnieje" },
        { status: 409 },
      );
    }

    // Weryfikacja planu subskrypcji jeśli podany
    let subscriptionPlan = null;
    if (planId) {
      subscriptionPlan = await db.subscriptionPlan.findUnique({
        where: { id: planId, isActive: true },
      });
      if (!subscriptionPlan) {
        return NextResponse.json(
          { error: "Wybrany plan subskrypcji nie istnieje" },
          { status: 400 },
        );
      }
    }

    // Haszowanie hasła
    const passwordHash = await hash(password, 12);

    // Utworzenie użytkownika OWNER i restauracji w transakcji
    const result = await db.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const user = await tx.user.create({
          data: {
            email,
            passwordHash,
            firstName,
            lastName,
            phone,
            role: "OWNER",
            isApproved: false, // OWNER wymaga akceptacji admina
          },
        });

        const restaurant = await tx.restaurant.create({
          data: {
            name: restaurantName,
            slug,
            bio: restaurantBio,
            ownerId: user.id,
            isActive: false, // Nieaktywna do czasu zatwierdzenia
          },
        });

        // Jeśli plan wybrany - utwórz subskrypcję (nieaktywną do zatwierdzenia)
        let subscription = null;
        if (subscriptionPlan) {
          subscription = await tx.subscription.create({
            data: {
              restaurantId: restaurant.id,
              planId: subscriptionPlan.id,
              isActive: false, // Aktywowana po zatwierdzeniu przez admina
            },
          });
        }

        return { user, restaurant, subscription };
      },
    );

    return NextResponse.json(
      {
        message:
          "Właściciel restauracji zarejestrowany pomyślnie. Oczekuje na zatwierdzenie administratora.",
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          isApproved: result.user.isApproved,
        },
        restaurant: {
          id: result.restaurant.id,
          name: result.restaurant.name,
          slug: result.restaurant.slug,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Owner registration error:", error);
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 },
    );
  }
}

