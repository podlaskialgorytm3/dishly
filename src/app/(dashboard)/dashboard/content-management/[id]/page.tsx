import { db } from "@/lib/db";
import { PageForm } from "../PageForm";
import { notFound } from "next/navigation";

interface EditPageProps {
  params: { id: string };
}

export default async function EditPagePage({ params }: EditPageProps) {
  const page = await db.page.findUnique({
    where: { id: params.id },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Edytuj stronę: {page.title}</h1>
      <div className="bg-card border rounded-lg p-6">
        <PageForm page={page} />
      </div>
    </div>
  );
}
