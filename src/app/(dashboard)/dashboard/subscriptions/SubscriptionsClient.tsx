"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "@/actions/admin/subscriptions";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Users,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: any;
  interval: string;
  maxLocations: number;
  maxMeals: number;
  maxStaffAccounts: number;
  isActive: boolean;
  _count: { subscriptions: number };
};

function PlanForm({ plan, onSuccess }: { plan?: Plan; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [interval, setInterval] = useState(plan?.interval ?? "MONTHLY");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("interval", interval);
      if (plan) {
        await updateSubscriptionPlan(plan.id, fd);
        toast.success("Plan zaktualizowany");
      } else {
        await createSubscriptionPlan(fd);
        toast.success("Plan dodany");
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Błąd");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="name">Nazwa planu</Label>
          <Input id="name" name="name" defaultValue={plan?.name} required />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="description">Opis</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={plan?.description ?? ""}
            rows={2}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="price">Cena (PLN)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={plan ? Number(plan.price) : ""}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Okres rozliczeniowy</Label>
          <Select
            value={interval}
            onChange={(e) => setInterval((e.target as HTMLSelectElement).value)}
            className="border-[#EEEEEE]"
          >
            <option value="MONTHLY">Miesięczny</option>
            <option value="YEARLY">Roczny</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxLocations">Maks. lokalizacji</Label>
          <Input
            id="maxLocations"
            name="maxLocations"
            type="number"
            min="1"
            defaultValue={plan?.maxLocations ?? 1}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxMeals">Maks. dań</Label>
          <Input
            id="maxMeals"
            name="maxMeals"
            type="number"
            min="1"
            defaultValue={plan?.maxMeals ?? 50}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="maxStaffAccounts">Maks. kont personelu</Label>
          <Input
            id="maxStaffAccounts"
            name="maxStaffAccounts"
            type="number"
            min="1"
            defaultValue={plan?.maxStaffAccounts ?? 5}
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#FF4D4F] hover:bg-[#FF3B30] text-white"
      >
        {loading ? "Zapisywanie..." : plan ? "Zaktualizuj plan" : "Dodaj plan"}
      </Button>
    </form>
  );
}

export function SubscriptionsClient({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [openCreate, setOpenCreate] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Czy na pewno chcesz usunąć plan "${name}"?`)) return;
    const result = await deleteSubscriptionPlan(id);
    if (result.success) {
      toast.success("Plan usunięty");
      router.refresh();
    } else {
      toast.error(result.error || "Błąd");
    }
  }

  const columns: ColumnDef<Plan>[] = [
    {
      accessorKey: "name",
      header: "Nazwa",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          {row.original.description && (
            <p className="text-xs text-[#8C8C8C] mt-0.5">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Cena",
      cell: ({ row }) => (
        <span className="font-semibold text-[#FF4D4F]">
          {Number(row.original.price).toFixed(2)} PLN
          <span className="text-xs text-[#8C8C8C] font-normal ml-1">
            /{row.original.interval === "MONTHLY" ? "mies." : "rok"}
          </span>
        </span>
      ),
    },
    {
      header: "Limity",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-xs text-[#8C8C8C]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {row.original.maxLocations} lok.
          </span>
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="h-3 w-3" /> {row.original.maxMeals} dań
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {row.original.maxStaffAccounts} kont
          </span>
        </div>
      ),
    },
    {
      accessorKey: "_count.subscriptions",
      header: "Subskrypcje",
      cell: ({ row }) => (
        <Badge variant="outline" className="border-[#EEEEEE]">
          {row.original._count.subscriptions}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.isActive
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-[#EEEEEE] text-[#8C8C8C] hover:bg-[#EEEEEE]"
          }
        >
          {row.original.isActive ? "Aktywny" : "Nieaktywny"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Akcje",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Dialog
            open={editPlan?.id === row.original.id}
            onOpenChange={(o) => !o && setEditPlan(null)}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditPlan(row.original)}
                className="h-8 w-8 hover:bg-[#FAFAFA]"
              >
                <Pencil className="h-4 w-4 text-[#8C8C8C]" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edytuj plan</DialogTitle>
              </DialogHeader>
              {editPlan && (
                <PlanForm
                  plan={editPlan}
                  onSuccess={() => {
                    setEditPlan(null);
                    router.refresh();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id, row.original.name)}
            className="h-8 w-8 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F1F1F]">
            Plany Subskrypcyjne
          </h1>
          <p className="text-sm text-[#8C8C8C] mt-1">
            Zarządzaj pakietami i limitami platformy
          </p>
        </div>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF4D4F] hover:bg-[#FF3B30] text-white gap-2">
              <Plus className="h-4 w-4" />
              Dodaj plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowy plan subskrypcyjny</DialogTitle>
            </DialogHeader>
            <PlanForm
              onSuccess={() => {
                setOpenCreate(false);
                router.refresh();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
          <p className="text-xs text-[#8C8C8C] uppercase tracking-wide">
            Wszystkich planów
          </p>
          <p className="text-2xl font-bold text-[#1F1F1F] mt-1">
            {plans.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
          <p className="text-xs text-[#8C8C8C] uppercase tracking-wide">
            Aktywnych planów
          </p>
          <p className="text-2xl font-bold text-[#1F1F1F] mt-1">
            {plans.filter((p) => p.isActive).length}
          </p>
        </div>
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
          <p className="text-xs text-[#8C8C8C] uppercase tracking-wide">
            Łącznie subskrypcji
          </p>
          <p className="text-2xl font-bold text-[#1F1F1F] mt-1">
            {plans.reduce((sum, p) => sum + p._count.subscriptions, 0)}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#EEEEEE] bg-white p-6">
        <DataTable
          columns={columns}
          data={plans}
          filterColumn="name"
          filterPlaceholder="Szukaj planu..."
        />
      </div>
    </div>
  );
}
