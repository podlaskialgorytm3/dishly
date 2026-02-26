import { getAllPages } from "@/actions/pages";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { DeletePageButton } from "./DeletePageButton";

export default async function ContentManagementPage() {
  const result = await getAllPages();

  if (!result.success) {
    return (
      <div>
        <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-2xl font-bold text-[#1F1F1F]">
              Zarządzanie treścią
            </h1>
          </div>
        </div>
        <div className="px-8 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[20px] border border-[#FFEBEE] bg-[#FFF5F5] p-6 text-[#F44336]">
              Błąd: {result.error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pages = result.data || [];

  const getCategoryLabel = (category: string) => {
    return category === "NAVIGATION" ? "Nawigacja" : "Informacje";
  };

  const getCategoryColor = (category: string) => {
    return category === "NAVIGATION"
      ? { bg: "#E3F2FD", text: "#2196F3" }
      : { bg: "#FFF4E6", text: "#FF8C42" };
  };

  return (
    <div>
      {/* Topbar */}
      <div className="border-b border-[#EEEEEE] bg-white px-8 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1F1F1F]">
                Zarządzanie treścią
              </h1>
              <p className="mt-1 text-sm text-[#8C8C8C]">
                Zarządzaj stronami statycznymi i ich publikacją
              </p>
            </div>
            <Link href="/dashboard/content-management/new">
              <button className="flex items-center gap-2 rounded-[14px] bg-[#FF4D4F] px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#FF3B30] hover:shadow-md">
                <Plus className="h-4 w-4" />
                Dodaj nową stronę
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {pages.length === 0 ? (
            <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-12 text-center shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <div className="mx-auto max-w-md">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FAFAFA]">
                    <Eye className="h-8 w-8 text-[#8C8C8C]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[#1F1F1F]">
                  Brak stron
                </h3>
                <p className="mt-2 text-sm text-[#8C8C8C]">
                  Zacznij od dodania pierwszej strony do serwisu
                </p>
                <Link href="/dashboard/content-management/new">
                  <button className="mt-6 rounded-[14px] bg-[#FF4D4F] px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#FF3B30]">
                    Dodaj pierwszą stronę
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info cards */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8C8C8C]">Nawigacja</p>
                      <p className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                        {
                          pages.filter((p) => p.category === "NAVIGATION")
                            .length
                        }
                      </p>
                      <p className="mt-1 text-xs text-[#8C8C8C]">
                        Menu główne
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E3F2FD]">
                      <span className="text-xl text-[#2196F3]">📍</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-[#EEEEEE] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#8C8C8C]">Informacje</p>
                      <p className="mt-1 text-2xl font-bold text-[#1F1F1F]">
                        {
                          pages.filter((p) => p.category === "INFORMATION")
                            .length
                        }
                      </p>
                      <p className="mt-1 text-xs text-[#8C8C8C]">Stopka</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF4E6]">
                      <span className="text-xl text-[#FF8C42]">ℹ️</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pages table */}
              <div className="rounded-[20px] border border-[#EEEEEE] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#EEEEEE] bg-[#FAFAFA]">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#8C8C8C]">
                          TYTUŁ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#8C8C8C]">
                          SLUG
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#8C8C8C]">
                          KATEGORIA
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#8C8C8C]">
                          STATUS
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#8C8C8C]">
                          KOLEJNOŚĆ
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#8C8C8C]">
                          AKTUALIZACJA
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-[#8C8C8C]">
                          AKCJE
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEEEEE]">
                      {pages.map((page: any) => {
                        const categoryColors = getCategoryColor(page.category);
                        return (
                          <tr
                            key={page.id}
                            className="transition-colors hover:bg-[#FAFAFA]"
                          >
                            <td className="px-6 py-4">
                              <p className="font-medium text-[#1F1F1F]">
                                {page.title}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <code className="rounded-lg bg-[#FAFAFA] px-2 py-1 text-xs text-[#1F1F1F]">
                                /{page.slug}
                              </code>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="inline-flex rounded-full px-3 py-1 text-xs font-medium"
                                style={{
                                  backgroundColor: categoryColors.bg,
                                  color: categoryColors.text,
                                }}
                              >
                                {getCategoryLabel(page.category)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {page.isPublished ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#E8F5E9] px-3 py-1 text-xs font-medium text-[#4CAF50]">
                                  <div className="h-1.5 w-1.5 rounded-full bg-[#4CAF50]" />
                                  Opublikowana
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[#EEEEEE] px-3 py-1 text-xs font-medium text-[#8C8C8C]">
                                  <div className="h-1.5 w-1.5 rounded-full bg-[#8C8C8C]" />
                                  Szkic
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#1F1F1F]">
                              {page.sortOrder}
                            </td>
                            <td className="px-6 py-4 text-sm text-[#8C8C8C]">
                              {new Date(page.updatedAt).toLocaleDateString(
                                "pl-PL",
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/dashboard/content-management/${page.id}`}
                                >
                                  <button className="rounded-xl border border-[#EEEEEE] bg-white p-2 text-[#1F1F1F] transition-colors hover:border-[#FF4D4F] hover:bg-[#FFF1F1] hover:text-[#FF4D4F]">
                                    <Edit className="h-4 w-4" />
                                  </button>
                                </Link>
                                <DeletePageButton
                                  pageId={page.id}
                                  pageTitle={page.title}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
