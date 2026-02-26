"use client";

import { deletePage } from "@/actions/pages";
import { Button } from "@/components/ui/button";
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
    <Button
      size="sm"
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? "Usuwanie..." : "Usuń"}
    </Button>
  );
}
