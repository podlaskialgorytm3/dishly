"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteStaff } from "@/actions/owner/staff";

export default function DeleteStaffButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteStaff(id);
      toast.success(`Pracownik "${name}" został usunięty`);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Błąd podczas usuwania pracownika");
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => setConfirming(false)}
        >
          ✕
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
      onClick={() => setConfirming(true)}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
