import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStaff } from "@/actions/owner/staff";
import StaffForm from "../StaffForm";

export default async function NewStaffPage() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") redirect("/dashboard");

  const { locations } = await getStaff();

  return (
    <div className="min-h-screen">
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-[#1F1F1F]">Nowy pracownik</h1>
          <p className="mt-1 text-sm text-[#8C8C8C]">
            Utwórz konto dla menadżera lub pracownika
          </p>
        </div>
      </div>
      <div className="px-8 py-8">
        <div className="mx-auto max-w-3xl">
          <StaffForm locations={locations} />
        </div>
      </div>
    </div>
  );
}
