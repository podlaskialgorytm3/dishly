"use client";

import { createPage, updatePage } from "@/actions/pages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageCategory } from "@prisma/client";
import Link from "next/link";

interface PageFormProps {
  page?: {
    id: string;
    title: string;
    slug: string;
    category: PageCategory;
    content: string;
    metaDescription: string | null;
    isPublished: boolean;
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
    sortOrder: page?.sortOrder || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (page) {
        // Edytowanie istniejącej strony
        result = await updatePage(page.id, formData);
      } else {
        // Tworzenie nowej strony
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
    setFormData({ ...formData, title: value });
    // Auto-generuj slug tylko dla nowych stron
    if (!page) {
      setFormData({ ...formData, title: value, slug: generateSlug(value) });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          Tytuł strony <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          placeholder="np. O nas, Regulamin"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">
          Slug (URL) <span className="text-red-500">*</span>
        </Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          placeholder="np. o-nas, regulamin"
          pattern="[a-z0-9\-]+"
          title="Tylko małe litery, cyfry i myślniki"
        />
        <p className="text-xs text-muted-foreground">
          Strona będzie dostępna pod adresem: /{formData.slug}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">
          Kategoria <span className="text-red-500">*</span>
        </Label>
        <Select
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value as PageCategory,
            })
          }
          required
        >
          <option value="NAVIGATION">Nawigacja</option>
          <option value="INFORMATION">Informacje</option>
        </Select>
        <p className="text-xs text-muted-foreground">
          Nawigacja: menu główne, Informacje: stopka
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">
          Treść <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          required
          rows={15}
          placeholder="Wpisz treść strony..."
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Możesz używać HTML lub Markdown
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">Opis meta (SEO)</Label>
        <Textarea
          id="metaDescription"
          value={formData.metaDescription}
          onChange={(e) =>
            setFormData({ ...formData, metaDescription: e.target.value })
          }
          rows={3}
          placeholder="Krótki opis strony dla wyszukiwarek (150-160 znaków)"
          maxLength={160}
        />
        <p className="text-xs text-muted-foreground">
          {formData.metaDescription.length}/160 znaków
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">Kolejność sortowania</Label>
        <Input
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
        />
        <p className="text-xs text-muted-foreground">
          Mniejsza wartość = wyższa pozycja w menu
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isPublished"
          checked={formData.isPublished}
          onChange={(e) =>
            setFormData({ ...formData, isPublished: e.target.checked })
          }
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="isPublished" className="cursor-pointer">
          Opublikuj stronę (widoczna dla użytkowników)
        </Label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Zapisywanie..."
            : page
              ? "Zapisz zmiany"
              : "Utwórz stronę"}
        </Button>
        <Link href="/dashboard/content-management">
          <Button type="button" variant="outline">
            Anuluj
          </Button>
        </Link>
      </div>
    </form>
  );
}
