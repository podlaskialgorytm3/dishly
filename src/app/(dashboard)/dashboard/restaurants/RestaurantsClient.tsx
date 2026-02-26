"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  approveRestaurant,
  rejectRestaurant,
} from "@/actions/admin/restaurants";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  nip: string | null;
  status: string;
  rejectionNote: string | null;
  isActive: boolean;
  createdAt: Date;
  owner: { email: string; firstName: string | null; lastName: string | null };
  _count: { locations: number; subscriptions: number };
};

function statusBadge(status: string) {
  if (status === "APPROVED")
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
        Zatwierdzona
      </Badge>
    );
  if (status === "REJECTED")
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
        Odrzucona
      </Badge>
    );
  return (
    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
      Oczekuje
    </Badge>
  );
}

function RejectDialog({
  restaurant,
  onClose,
  onReject,
}: {
  restaurant: Restaurant;
  onClose: () => void;
  onReject: (id: string, note: string) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Odrzuć restaurację</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-[#8C8C8C]">
        Czy na pewno chcesz odrzucić restaurację{" "}
        <strong>{restaurant.name}</strong>?
      </p>
      <div className="space-y-1.5">
        <Label>Powód odrzucenia (opcjonalnie)</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Podaj powód odrzucenia..."
          rows={3}
        />
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 border-[#EEEEEE]"
        >
          Anuluj
        </Button>
        <Button
          onClick={() => onReject(restaurant.id, note)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white"
        >
          Odrzuć
        </Button>
      </div>
    </DialogContent>
  );
}

export function RestaurantsClient({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const router = useRouter();
  const [rejectTarget, setRejectTarget] = useState<Restaurant | null>(null);

  const pending = restaurants.filter((r) => r.status === "PENDING");
  const all = restaurants;

  async function handleApprove(id: string) {
    const result = await approveRestaurant(id);
    if (result.success) {
      toast.success("Restauracja zatwierdzona");
      router.refresh();
    } else {
      toast.error("Błąd podczas zatwierdzania");
    }
  }

  async function handleReject(id: string, note: string) {
    const result = await rejectRestaurant(id, note);
    if (result.success) {
      toast.success("Restauracja odrzucona");
      setRejectTarget(null);
      router.refresh();
    } else {
      toast.error("Błąd podczas odrzucania");
    }
  }

  const columns: ColumnDef<Restaurant>[] = [
    {
      accessorKey: "name",
      header: "Restauracja",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-[#8C8C8C]">{row.original.slug}</p>
          {row.original.nip && (
            <p className="text-xs text-[#8C8C8C]">NIP: {row.original.nip}</p>
          )}
        </div>
      ),
    },
    {
      header: "Właściciel",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">
            {row.original.owner.firstName && row.original.owner.lastName
              ? `${row.original.owner.firstName} ${row.original.owner.lastName}`
              : "—"}
          </p>
          <p className="text-xs text-[#8C8C8C]">{row.original.owner.email}</p>
        </div>
      ),
    },
    {
      header: "Data rejestracji",
      cell: ({ row }) => (
        <span className="text-sm text-[#8C8C8C]">
          {new Date(row.original.createdAt).toLocaleDateString("pl-PL")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => statusBadge(row.original.status),
    },
    {
      id: "actions",
      header: "Akcje",
      cell: ({ row }) => {
        if (row.original.status === "PENDING") {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleApprove(row.original.id)}
                className="bg-green-500 hover:bg-green-600 text-white gap-1 h-8"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Akceptuj
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectTarget(row.original)}
                className="border-red-200 text-red-500 hover:bg-red-50 gap-1 h-8"
              >
                <XCircle className="h-3.5 w-3.5" />
                Odrzuć
              </Button>
            </div>
          );
        }
        return (
          <span className="text-xs text-[#8C8C8C]">
            {row.original.status === "APPROVED" ? "Zatwierdzona" : "Odrzucona"}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F1F1F]">
          Weryfikacja Restauracji
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Zarządzaj wnioskami o rejestrację restauracji
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-amber-500" />
            <p className="text-xs text-[#8C8C8C] uppercase tracking-wide">
              Oczekujące
            </p>
          </div>
          <p className="text-2xl font-bold text-[#1F1F1F]">{pending.length}</p>
        </div>
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <p className="text-xs text-[#8C8C8C] uppercase tracking-wide">
              Zatwierdzone
            </p>
          </div>
          <p className="text-2xl font-bold text-[#1F1F1F]">
            {all.filter((r) => r.status === "APPROVED").length}
          </p>
        </div>
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <p className="text-xs text-[#8C8C8C] uppercase tracking-wide">
              Odrzucone
            </p>
          </div>
          <p className="text-2xl font-bold text-[#1F1F1F]">
            {all.filter((r) => r.status === "REJECTED").length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#EEEEEE] bg-white p-6">
        <Tabs defaultValue="pending">
          <TabsList className="mb-4 bg-[#FAFAFA]">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-white"
            >
              Oczekujące ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-white">
              Wszystkie ({all.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <DataTable
              columns={columns}
              data={pending}
              filterColumn="name"
              filterPlaceholder="Szukaj restauracji..."
            />
          </TabsContent>
          <TabsContent value="all">
            <DataTable
              columns={columns}
              data={all}
              filterColumn="name"
              filterPlaceholder="Szukaj restauracji..."
            />
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={!!rejectTarget}
        onOpenChange={(o) => !o && setRejectTarget(null)}
      >
        {rejectTarget && (
          <RejectDialog
            restaurant={rejectTarget}
            onClose={() => setRejectTarget(null)}
            onReject={handleReject}
          />
        )}
      </Dialog>
    </div>
  );
}
