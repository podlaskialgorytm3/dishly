"use client";

import { createPage, updatePage } from "@/actions/pages";
import { Save, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageCategory } from "@prisma/client";
import Link from "next/link";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

interface PageFormProps {
  page?: {
    id: string;
    title: string;
    slug: string;
    category: PageCategory;
    content: string;
    metaDescription: string | null;
    isPublished: boolean;
    showInHeader: boolean;
    showInFooter: boolean;
    sortOrder: number;
  };
}

export function PageForm({ page }: PageFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: page?.title || "",
    slug: page?.slug || "",
    category: page?.category || ("NAVIGATION" as PageCategory),
    content: page?.content || "",
    metaDescription: page?.metaDescription || "",
    isPublished: page?.isPublished || false,
    showInHeader: page?.showInHeader || false,
    showInFooter: page?.showInFooter || false,
    sortOrder: page?.sortOrder || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (page) {
        result = await updatePage(page.id, formData);
      } else {
        result = await createPage(formData);
      }

      if (result.success) {
        router.push("/dashboard/content-management");
        router.refresh();
      } else {
        setError(result.error || "Wystąpił nieznany błąd");
      }
    } catch (err) {
      setError("Wystąpił błąd podczas zapisywania strony");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ł/g, "l")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (value: string) => {
    if (!page) {
      setFormData({ ...formData, title: value, slug: generateSlug(value) });
    } else {
      setFormData({ ...formData, title: value });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-[20px] border border-[#FFEBEE] bg-[#FFF5F5] p-4 text-[#F44336]">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-[#1F1F1F]">
          Tytuł strony <span className="text-[#F44336]">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          placeholder="np. O nas, Regulamin"
          className="w-full rounded-[14px] border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#1F1F1F] transition-all placeholder:text-[#8C8C8C] focus:border-[#FF4D4F] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium text-[#1F1F1F]">
          Slug (URL) <span className="text-[#F44336]">*</span>
        </label>
        <input
          id="slug"
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          placeholder="np. o-nas, regulamin"
          pattern="[a-z0-9\-]+"
          title="Tylko małe litery, cyfry i myślniki"
          className="w-full rounded-[14px] border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#1F1F1F] transition-all placeholder:text-[#8C8C8C] focus:border-[#FF4D4F] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/20"
        />
        <p className="text-xs text-[#8C8C8C]">
          Strona będzie dostępna pod adresem: /{formData.slug}
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="category"
          className="text-sm font-medium text-[#1F1F1F]"
        >
          Kategoria <span className="text-[#F44336]">*</span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value as PageCategory,
            })
          }
          required
          className="w-full rounded-[14px] border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#1F1F1F] transition-all focus:border-[#FF4D4F] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/20"
        >
          <option value="NAVIGATION">Nawigacja</option>
          <option value="INFORMATION">Informacje</option>
        </select>
        <p className="text-xs text-[#8C8C8C]">
          Nawigacja: menu główne, Informacje: stopka
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium text-[#1F1F1F]">
          Treść <span className="text-[#F44336]">*</span>
        </label>
        <RichTextEditor
          content={formData.content}
          onChange={(content) => setFormData({ ...formData, content })}
          placeholder="Wpisz treść strony..."
        />
        <p className="text-xs text-[#8C8C8C]">
          Użyj paska narzędzi aby sformatować tekst (nagłówki, pogrubienie, listy, itp.)
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="metaDescription"
          className="text-sm font-medium text-[#1F1F1F]"
        >
          Opis meta (SEO)
        </label>
        <textarea
          id="metaDescription"
          value={formData.metaDescription}
          onChange={(e) =>
            setFormData({ ...formData, metaDescription: e.target.value })
          }
          rows={3}
          placeholder="Krótki opis strony dla wyszukiwarek (150-160 znaków)"
          maxLength={160}
          className="w-full rounded-[14px] border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#1F1F1F] transition-all placeholder:text-[#8C8C8C] focus:border-[#FF4D4F] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/20"
        />
        <p className="text-xs text-[#8C8C8C]">
          {formData.metaDescription.length}/160 znaków
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="sortOrder"
          className="text-sm font-medium text-[#1F1F1F]"
        >
          Kolejność sortowania
        </label>
        <input
          id="sortOrder"
          type="number"
          value={formData.sortOrder}
          onChange={(e) =>
            setFormData({
              ...formData,
              sortOrder: parseInt(e.target.value) || 0,
            })
          }
          placeholder="0"
          className="w-full rounded-[14px] border border-[#EEEEEE] bg-white px-4 py-3 text-sm text-[#1F1F1F] transition-all placeholder:text-[#8C8C8C] focus:border-[#FF4D4F] focus:outline-none focus:ring-2 focus:ring-[#FF4D4F]/20"
        />
        <p className="text-xs text-[#8C8C8C]">
          Mniejsza wartość = wyższa pozycja w menu
        </p>
      </div>

      {/* Wyświetlanie w nagłówku i stopce */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#1F1F1F]">
          Wyświetlanie na stronie
        </label>
        <div className="space-y-2 rounded-[14px] border border-[#EEEEEE] bg-[#FAFAFA] p-4">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="showInHeader"
              checked={formData.showInHeader}
              onChange={(e) =>
                setFormData({ ...formData, showInHeader: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-[#EEEEEE] text-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
            />
            <div className="flex-1">
              <label
                htmlFor="showInHeader"
                className="cursor-pointer text-sm font-medium text-[#1F1F1F]"
              >
                Wyświetl w nagłówku
              </label>
              <p className="mt-0.5 text-xs text-[#8C8C8C]">
                Strona pojawi się w menu nawigacyjnym w górnej części witryny
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="showInFooter"
              checked={formData.showInFooter}
              onChange={(e) =>
                setFormData({ ...formData, showInFooter: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-[#EEEEEE] text-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
            />
            <div className="flex-1">
              <label
                htmlFor="showInFooter"
                className="cursor-pointer text-sm font-medium text-[#1F1F1F]"
              >
                Wyświetl w stopce
              </label>
              <p className="mt-0.5 text-xs text-[#8C8C8C]">
                Strona pojawi się w stopce witryny (polecane dla Regulaminu, Polityki prywatności)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-[14px] border border-[#EEEEEE] bg-[#FAFAFA] p-4">
        <input
          type="checkbox"
          id="isPublished"
          checked={formData.isPublished}
          onChange={(e) =>
            setFormData({ ...formData, isPublished: e.target.checked })
          }
          className="h-4 w-4 rounded border-[#EEEEEE] text-[#FF4D4F] focus:ring-2 focus:ring-[#FF4D4F]/20"
        />
        <label htmlFor="isPublished" className="cursor-pointer text-sm text-[#1F1F1F]">
          Opublikuj stronę (widoczna dla użytkowników)
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-[14px] bg-[#FF4D4F] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#FF3B30] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting
            ? "Zapisywanie..."
            : page
              ? "Zapisz zmiany"
              : "Utwórz stronę"}
        </button>
        <Link href="/dashboard/content-management">
          <button
            type="button"
            className="flex items-center gap-2 rounded-[14px] border border-[#EEEEEE] bg-white px-6 py-3 text-sm font-medium text-[#1F1F1F] transition-all hover:bg-[#FAFAFA]"
          >
            <X className="h-4 w-4" />
            Anuluj
          </button>
        </Link>
      </div>
    </form>
  );
}
