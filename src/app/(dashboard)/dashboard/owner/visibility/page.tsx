import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVisibilitySettings, UI_PANELS } from "@/actions/owner/visibility";
import VisibilityClient from "./VisibilityClient";

export default async function VisibilityPage() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") redirect("/dashboard");

  const { visibilityMap } = await getVisibilitySettings();

  return (
    <div className="min-h-screen">
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-[#1F1F1F]">
            Widoczność paneli
          </h1>
          <p className="mt-1 text-sm text-[#8C8C8C]">
            Zarządzaj tym, co widzą Menadżerowie i Pracownicy w swoim panelu
          </p>
        </div>
      </div>
      <div className="px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <VisibilityClient
            panels={UI_PANELS as any}
            visibilityMap={visibilityMap}
          />
        </div>
      </div>
    </div>
  );
}
