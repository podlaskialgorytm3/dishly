import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBranding } from "@/actions/owner/branding";
import BrandingClient from "./BrandingClient";

export default async function BrandingPage() {
  const session = await auth();
  if (!session || session.user.role !== "OWNER") redirect("/dashboard");

  const { restaurant, allCuisineTypes, allTags } = await getBranding();

  return (
    <div className="min-h-screen">
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-[#1F1F1F]">
            Branding restauracji
          </h1>
          <p className="mt-1 text-sm text-[#8C8C8C]">
            Konfiguruj identyfikację wizualną, kuchnię i tagi Twojej restauracji
          </p>
        </div>
      </div>
      <div className="px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <BrandingClient
            restaurant={{
              id: restaurant.id,
              name: restaurant.name,
              bio: restaurant.bio,
              logoUrl: restaurant.logoUrl,
              coverImageUrl: (restaurant as any).coverImageUrl,
              cuisineTypeIds:
                (restaurant as any).cuisineTypes?.map((c: any) => c.id) ?? [],
              tagIds: (restaurant as any).tags?.map((t: any) => t.id) ?? [],
            }}
            allCuisineTypes={allCuisineTypes}
            allTags={allTags}
          />
        </div>
      </div>
    </div>
  );
}
