import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocation } from "@/actions/owner/locations";
import LocationForm from "../LocationForm";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (
    !session ||
    (session.user.role !== "OWNER" && session.user.role !== "MANAGER")
  )
    redirect("/dashboard");

  const { id } = await params;
  const location = await getLocation(id);

  const isOwner = session.user.role === "OWNER";

  return (
    <div className="min-h-screen">
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-[#1F1F1F]">
            Edytuj lokalizację
          </h1>
          <p className="mt-1 text-sm text-[#8C8C8C]">{location.name}</p>
        </div>
      </div>
      <div className="px-8 py-8">
        <div className="mx-auto max-w-3xl">
          <LocationForm location={location} isOwner={isOwner} />
        </div>
      </div>
    </div>
  );
}
