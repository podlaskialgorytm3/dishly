import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const page = await db.page.findUnique({
    where: { slug: params.slug },
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
  const page = await db.page.findUnique({
    where: { slug: params.slug },
  });

  // Jeśli strona nie istnieje lub nie jest opublikowana, pokaż 404
  if (!page || !page.isPublished) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-6">{page.title}</h1>

        <div
          className="content"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </article>

      <style jsx>{`
        .content {
          line-height: 1.8;
        }
        .content h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .content p {
          margin-bottom: 1rem;
        }
        .content ul,
        .content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .content li {
          margin-bottom: 0.5rem;
        }
        .content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .content a:hover {
          color: #2563eb;
        }
        .content strong {
          font-weight: 700;
        }
        .content em {
          font-style: italic;
        }
        .content code {
          background-color: #f3f4f6;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .content pre {
          background-color: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin-bottom: 1rem;
        }
        .content pre code {
          background-color: transparent;
          padding: 0;
        }
        .content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          font-style: italic;
          margin-bottom: 1rem;
        }
      `}</style>
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
