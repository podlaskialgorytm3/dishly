import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await db.page.findUnique({
    where: { slug },
  });

  if (!page) {
    return {
      title: "Strona nie znaleziona",
    };
  }

  return {
    title: page.title,
    description: page.metaDescription || undefined,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await db.page.findUnique({
    where: { slug },
  });

  // Jeśli strona nie istnieje lub nie jest opublikowana, pokaż 404
  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6 text-[#1F1F1F]">{page.title}</h1>

        <div
          className="dynamic-content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>
    </div>
  );
}

// Generuj statyczne ścieżki dla opublikowanych stron
export async function generateStaticParams() {
  const pages = await db.page.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });

  return pages.map((page) => ({
    slug: page.slug,
  }));
}
