import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers, getAllReviews } from "@/actions/admin/moderation";
import { ModerationClient } from "./ModerationClient";

export default async function ModerationPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [users, reviews] = await Promise.all([getAllUsers(), getAllReviews()]);

  return (
    <main className="p-8">
      <ModerationClient
        users={users as any}
        reviews={reviews as any}
        currentUserId={session.user.id}
      />
    </main>
  );
}
