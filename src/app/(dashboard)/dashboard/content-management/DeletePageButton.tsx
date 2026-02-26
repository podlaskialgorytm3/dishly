"use client";

import { deletePage } from "@/actions/pages";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeletePageButtonProps {
  pageId: string;
  pageTitle: string;
}

export function DeletePageButton({ pageId, pageTitle }: DeletePageButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Czy na pewno chcesz usunąć stronę "${pageTitle}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deletePage(pageId);
      if (result.success) {
        router.refresh();
      } else {
        alert(`Błąd: ${result.error}`);
      }
    } catch (error) {
      alert("Wystąpił błąd podczas usuwania strony");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="rounded-xl border border-[#FFEBEE] bg-white p-2 text-[#F44336] transition-colors hover:border-[#F44336] hover:bg-[#FFEBEE] disabled:cursor-not-allowed disabled:opacity-50"
      title="Usuń stronę"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
