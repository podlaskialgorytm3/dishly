import { db } from "@/lib/db";
import { PageForm } from "../PageForm";
import { notFound } from "next/navigation";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: EditPageProps) {
  const { id } = await params;
  const page = await db.page.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  return (
    <div>
      {/* Topbar */}
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-[#1F1F1F]">Edytuj stronę</h1>
          <p className="mt-1 text-sm text-[#8C8C8C]">{page.title}</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-8 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <PageForm page={page} />
          </div>
        </div>
      </div>
    </div>
  );
}
