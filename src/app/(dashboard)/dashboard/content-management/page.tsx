import { getAllPages } from "@/actions/pages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { DeletePageButton } from "./DeletePageButton";

export default async function ContentManagementPage() {
  const result = await getAllPages();

  if (!result.success) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Zarządzanie treścią</h1>
        <div className="text-red-500">Błąd: {result.error}</div>
      </div>
    );
  }

  const pages = result.data || [];

  const getCategoryLabel = (category: string) => {
    return category === "NAVIGATION" ? "Nawigacja" : "Informacje";
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Zarządzanie treścią</h1>
        <Link href="/dashboard/content-management/new">
          <Button>+ Dodaj nową stronę</Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tytuł</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Kolejność</TableHead>
              <TableHead>Ostatnia aktualizacja</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">
                  Brak stron. Dodaj pierwszą stronę.
                </TableCell>
              </TableRow>
            ) : (
              pages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell className="font-medium">{page.title}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      /{page.slug}
                    </code>
                  </TableCell>
                  <TableCell>{getCategoryLabel(page.category)}</TableCell>
                  <TableCell>
                    {page.isPublished ? (
                      <Badge variant="default">Opublikowana</Badge>
                    ) : (
                      <Badge variant="secondary">Szkic</Badge>
                    )}
                  </TableCell>
                  <TableCell>{page.sortOrder}</TableCell>
                  <TableCell>
                    {new Date(page.updatedAt).toLocaleDateString("pl-PL")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/content-management/${page.id}`}>
                        <Button size="sm" variant="outline">
                          Edytuj
                        </Button>
                      </Link>
                      <DeletePageButton
                        pageId={page.id}
                        pageTitle={page.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>
          <strong>Nawigacja:</strong> Strony wyświetlane w menu nawigacyjnym (O
          nas, Jak to działa, Kariera, Blog, Kontakt)
        </p>
        <p>
          <strong>Informacje:</strong> Strony w stopce (Regulamin, Polityka
          prywatności, Polityka cookies)
        </p>
      </div>
    </div>
  );
}
