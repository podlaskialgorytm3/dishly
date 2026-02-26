"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PageCategory } from "@prisma/client";

// Sprawdzenie czy użytkownik jest adminem
async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session;
}

// Pobierz wszystkie strony
export async function getAllPages() {
  await requireAdmin();

  try {
    const pages = await db.page.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
    });

    return { success: true, data: pages };
  } catch (error) {
    console.error("Error fetching pages:", error);
    return { success: false, error: "Nie udało się pobrać stron" };
  }
}

// Pobierz stronę po slug
export async function getPageBySlug(slug: string) {
  try {
    const page = await db.page.findUnique({
      where: { slug },
    });

    if (!page) {
      return { success: false, error: "Strona nie została znaleziona" };
    }

    return { success: true, data: page };
  } catch (error) {
    console.error("Error fetching page:", error);
    return { success: false, error: "Nie udało się pobrać strony" };
  }
}

// Pobierz stronę po ID
export async function getPageById(id: string) {
  await requireAdmin();

  try {
    const page = await db.page.findUnique({
      where: { id },
    });

    if (!page) {
      return { success: false, error: "Strona nie została znaleziona" };
    }

    return { success: true, data: page };
  } catch (error) {
    console.error("Error fetching page:", error);
    return { success: false, error: "Nie udało się pobrać strony" };
  }
}

// Pobierz strony dla użytkowników (tylko opublikowane)
export async function getPublishedPages(category?: PageCategory) {
  try {
    const pages = await db.page.findMany({
      where: {
        isPublished: true,
        ...(category && { category }),
      },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        metaDescription: true,
      },
    });

    return { success: true, data: pages };
  } catch (error) {
    console.error("Error fetching published pages:", error);
    return { success: false, error: "Nie udało się pobrać stron" };
  }
}

// Utwórz nową stronę
export async function createPage(data: {
  title: string;
  slug: string;
  category: PageCategory;
  content: string;
  metaDescription?: string;
  isPublished?: boolean;
  sortOrder?: number;
}) {
  await requireAdmin();

  try {
    // Sprawdź czy slug jest unikalny
    const existingPage = await db.page.findUnique({
      where: { slug: data.slug },
    });

    if (existingPage) {
      return { success: false, error: "Strona z tym slugiem już istnieje" };
    }

    const page = await db.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        content: data.content,
        metaDescription: data.metaDescription,
        isPublished: data.isPublished ?? false,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    revalidatePath("/dashboard/content-management");
    revalidatePath(`/${page.slug}`);

    return { success: true, data: page };
  } catch (error) {
    console.error("Error creating page:", error);
    return { success: false, error: "Nie udało się utworzyć strony" };
  }
}

// Aktualizuj stronę
export async function updatePage(
  id: string,
  data: {
    title?: string;
    slug?: string;
    category?: PageCategory;
    content?: string;
    metaDescription?: string;
    isPublished?: boolean;
    sortOrder?: number;
  },
) {
  await requireAdmin();

  try {
    // Jeśli zmienia się slug, sprawdź czy nowy slug jest unikalny
    if (data.slug) {
      const existingPage = await db.page.findUnique({
        where: { slug: data.slug },
      });

      if (existingPage && existingPage.id !== id) {
        return { success: false, error: "Strona z tym slugiem już istnieje" };
      }
    }

    const page = await db.page.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/content-management");
    revalidatePath(`/${page.slug}`);

    return { success: true, data: page };
  } catch (error) {
    console.error("Error updating page:", error);
    return { success: false, error: "Nie udało się zaktualizować strony" };
  }
}

// Usuń stronę
export async function deletePage(id: string) {
  await requireAdmin();

  try {
    const page = await db.page.delete({
      where: { id },
    });

    revalidatePath("/dashboard/content-management");
    revalidatePath(`/${page.slug}`);

    return { success: true, data: page };
  } catch (error) {
    console.error("Error deleting page:", error);
    return { success: false, error: "Nie udało się usunąć strony" };
  }
}
