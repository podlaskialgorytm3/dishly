import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStaff } from "@/actions/owner/staff";
import { db } from "@/lib/db";
import StaffForm from "../StaffForm";

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") redirect("/dashboard");

  const { id } = await params;
  const { locations } = await getStaff();

  const member = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      locationId: true,
      isActive: true,
    },
  });

  if (!member) redirect("/dashboard/owner/staff");

  return (
    <div className="min-h-screen">
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-[#1F1F1F]">
            Edytuj pracownika
          </h1>
          <p className="mt-1 text-sm text-[#8C8C8C]">
            {member.firstName} {member.lastName}
          </p>
        </div>
      </div>
      <div className="px-8 py-8">
        <div className="mx-auto max-w-3xl">
          <StaffForm locations={locations} member={member} />
        </div>
      </div>
    </div>
  );
}
