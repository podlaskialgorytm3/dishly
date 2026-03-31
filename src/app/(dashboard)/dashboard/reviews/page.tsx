import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRestaurantReviews } from "@/actions/client/reviews";
import ReviewsClient from "./ReviewsClient";

export default async function ReviewsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Only OWNER, MANAGER or ADMIN can see reviews panel
  const hasAccess =
    session.user.role === "OWNER" ||
    session.user.role === "MANAGER" ||
    session.user.role === "ADMIN";

  if (!hasAccess) {
    redirect("/dashboard");
  }

  const reviews = await getRestaurantReviews();

  return <ReviewsClient reviews={reviews} userRole={session.user.role} />;
}
