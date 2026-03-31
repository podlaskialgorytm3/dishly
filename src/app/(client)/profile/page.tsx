import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getClientReviews } from "@/actions/client/reviews";
import { getClientAddresses } from "@/actions/client/addresses";
import { getClientOrders, getRecentUniqueOrders } from "@/actions/orders";
import { db } from "@/lib/db";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get user data
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Get client data in parallel
  const [reviews, addresses, orders, quickReorderOrders] = await Promise.all([
    getClientReviews(),
    getClientAddresses(),
    getClientOrders(),
    getRecentUniqueOrders(5),
  ]);

  return (
    <ProfileClient
      user={{
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        memberSince: user.createdAt.toISOString(),
      }}
      reviews={reviews}
      addresses={addresses}
      orders={orders}
      quickReorderOrders={quickReorderOrders}
    />
  );
}
