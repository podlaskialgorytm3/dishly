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
    } = body;

    // Walidacja danych
    if (!email || !password || !restaurantName) {
      return NextResponse.json(
        { error: "Email, password, and restaurant name are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Sprawdzenie czy użytkownik już istnieje
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Generowanie slug dla restauracji
    const slug = restaurantName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Sprawdzenie czy slug jest unikalny
    const existingRestaurant = await db.restaurant.findUnique({
      where: { slug },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant with this name already exists" },
        { status: 409 },
      );
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

        return { user, restaurant };
      },
    );

    return NextResponse.json(
      {
        message:
          "Restaurant owner registered successfully. Awaiting admin approval.",
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
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
