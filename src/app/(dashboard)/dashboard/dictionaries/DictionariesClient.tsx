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
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  createCuisineType,
  updateCuisineType,
  deleteCuisineType,
  createRestaurantTag,
  updateRestaurantTag,
  deleteRestaurantTag,
  createDishTag,
  updateDishTag,
  deleteDishTag,
  approveTagRequest,
  rejectTagRequest,
} from "@/actions/admin/dictionaries";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tag = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type TagRequest = {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: Date;
  requester: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
};

function TagTypeLabel(type: string) {
  if (type === "CUISINE") return "Kuchnia";
  if (type === "AMENITY") return "Udogodnienie";
  if (type === "DISH") return "Danie";
  return type;
}

function AddTagForm({
  onAdd,
  placeholder,
}: {
  onAdd: (name: string) => Promise<{ success: boolean; error?: string }>;
  placeholder: string;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const result = await onAdd(name.trim());
      if (!result.success) {
        toast.error(result.error || "Błąd podczas dodawania");
      } else {
        setName("");
        toast.success("Dodano pomyślnie");
      }
    } catch {
      toast.error("Wystąpił nieoczekiwany błąd");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={placeholder}
        className="border-[#EEEEEE]"
        required
      />
      <Button
        type="submit"
        disabled={loading}
        className="bg-[#FF4D4F] hover:bg-[#FF3B30] text-white gap-1 shrink-0"
      >
        <Plus className="h-4 w-4" />
        Dodaj
      </Button>
    </form>
  );
}

function EditTagDialog({
  tag,
  onSave,
  onClose,
}: {
  tag: Tag;
  onSave: (
    id: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}) {
  const [name, setName] = useState(tag.name);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      const result = await onSave(tag.id, name);
      if (!result.success) {
        toast.error(result.error || "Błąd podczas zapisywania");
      } else {
        toast.success("Zaktualizowano");
        onClose();
      }
    } catch {
      toast.error("Wystąpił nieoczekiwany błąd");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edytuj etykietę</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nazwa</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
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
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-[#FF4D4F] hover:bg-[#FF3B30] text-white"
          >
            {loading ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

function TagTable({
  tags,
  onCreate,
  onUpdate,
  onDelete,
  addPlaceholder,
}: {
  tags: Tag[];
  onCreate: (name: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate: (
    id: string,
    name: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
  addPlaceholder: string;
}) {
  const router = useRouter();
  const [editTag, setEditTag] = useState<Tag | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Usuń "${name}"?`)) return;
    try {
      const result = await onDelete(id);
      if (!result.success) toast.error(result.error || "Błąd podczas usuwania");
      else {
        toast.success("Usunięto");
        router.refresh();
      }
    } catch {
      toast.error("Wystąpił nieoczekiwany błąd");
    }
  }

  const columns: ColumnDef<Tag>[] = [
    { accessorKey: "name", header: "Nazwa" },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="text-xs text-[#8C8C8C]">{row.original.slug}</span>
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
          {row.original.isActive ? "Aktywna" : "Nieaktywna"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Akcje",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Dialog
            open={editTag?.id === row.original.id}
            onOpenChange={(o) => !o && setEditTag(null)}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditTag(row.original)}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4 text-[#8C8C8C]" />
              </Button>
            </DialogTrigger>
            {editTag?.id === row.original.id && (
              <EditTagDialog
                tag={editTag}
                onSave={async (id, name) => {
                  const result = await onUpdate(id, name);
                  if (result.success) router.refresh();
                  return result;
                }}
                onClose={() => setEditTag(null)}
              />
            )}
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
    <div className="space-y-4">
      <AddTagForm
        onAdd={async (name) => {
          const result = await onCreate(name);
          if (result.success) router.refresh();
          return result;
        }}
        placeholder={addPlaceholder}
      />
      <DataTable
        columns={columns}
        data={tags}
        filterColumn="name"
        filterPlaceholder="Szukaj..."
      />
    </div>
  );
}

function TagRequestsTable({ requests }: { requests: TagRequest[] }) {
  const router = useRouter();

  async function handleApprove(id: string) {
    const result = await approveTagRequest(id);
    if (result.success) {
      toast.success("Zatwierdzona i dodana do słownika");
      router.refresh();
    } else toast.error(result.error || "Błąd");
  }

  async function handleReject(id: string) {
    const result = await rejectTagRequest(id);
    if (result.success) {
      toast.success("Odrzucona");
      router.refresh();
    } else toast.error("Błąd");
  }

  const columns: ColumnDef<TagRequest>[] = [
    { accessorKey: "name", header: "Proponowana etykieta" },
    {
      accessorKey: "type",
      header: "Typ",
      cell: ({ row }) => (
        <Badge variant="outline">{TagTypeLabel(row.original.type)}</Badge>
      ),
    },
    {
      header: "Zgłoszone przez",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">
            {row.original.requester.firstName} {row.original.requester.lastName}
          </p>
          <p className="text-xs text-[#8C8C8C]">
            {row.original.requester.email}
          </p>
        </div>
      ),
    },
    {
      header: "Data",
      cell: ({ row }) => (
        <span className="text-sm text-[#8C8C8C]">
          {new Date(row.original.createdAt).toLocaleDateString("pl-PL")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Akcje",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleApprove(row.original.id)}
            className="bg-green-500 hover:bg-green-600 text-white gap-1 h-8"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Zatwierdź
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleReject(row.original.id)}
            className="border-red-200 text-red-500 hover:bg-red-50 gap-1 h-8"
          >
            <XCircle className="h-3.5 w-3.5" /> Odrzuć
          </Button>
        </div>
      ),
    },
  ];

  if (requests.length === 0) {
    return (
      <p className="text-sm text-[#8C8C8C] py-8 text-center">
        Brak oczekujących wniosków
      </p>
    );
  }

  return <DataTable columns={columns} data={requests} />;
}

export function DictionariesClient({
  cuisineTypes,
  restaurantTags,
  dishTags,
  tagRequests,
}: {
  cuisineTypes: Tag[];
  restaurantTags: Tag[];
  dishTags: Tag[];
  tagRequests: TagRequest[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F1F1F]">Słowniki Globalne</h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Zarządzaj etykietami dostępnymi dla restauratorów
        </p>
      </div>

      {tagRequests.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800 mb-1">
            {tagRequests.length} oczekujących wniosków o nowe etykiety
          </p>
        </div>
      )}

      <div className="rounded-xl border border-[#EEEEEE] bg-white">
        <Tabs defaultValue="cuisine">
          <div className="border-b border-[#EEEEEE] px-6 pt-4">
            <TabsList className="bg-transparent gap-1">
              <TabsTrigger
                value="cuisine"
                className="data-[state=active]:bg-[#FAFAFA] data-[state=active]:border data-[state=active]:border-[#EEEEEE]"
              >
                Kuchnie ({cuisineTypes.length})
              </TabsTrigger>
              <TabsTrigger
                value="amenities"
                className="data-[state=active]:bg-[#FAFAFA] data-[state=active]:border data-[state=active]:border-[#EEEEEE]"
              >
                Udogodnienia ({restaurantTags.length})
              </TabsTrigger>
              <TabsTrigger
                value="dish"
                className="data-[state=active]:bg-[#FAFAFA] data-[state=active]:border data-[state=active]:border-[#EEEEEE]"
              >
                Etykiety dań ({dishTags.length})
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="data-[state=active]:bg-[#FAFAFA] data-[state=active]:border data-[state=active]:border-[#EEEEEE]"
              >
                Wnioski{" "}
                {tagRequests.length > 0 && (
                  <Badge className="ml-1.5 h-4 w-4 p-0 text-xs bg-amber-500">
                    {tagRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="p-6">
            <TabsContent value="cuisine">
              <TagTable
                tags={cuisineTypes}
                onCreate={async (name) => {
                  const result = await createCuisineType(name);
                  if (result.success) router.refresh();
                  return result;
                }}
                onUpdate={async (id, name) => {
                  const result = await updateCuisineType(id, name);
                  if (result.success) router.refresh();
                  return result;
                }}
                onDelete={async (id) => {
                  const result = await deleteCuisineType(id);
                  if (result.success) router.refresh();
                  return result;
                }}
                addPlaceholder="np. Włoska, Japońska, Fusion..."
              />
            </TabsContent>
            <TabsContent value="amenities">
              <TagTable
                tags={restaurantTags}
                onCreate={async (name) => {
                  const result = await createRestaurantTag(name);
                  if (result.success) router.refresh();
                  return result;
                }}
                onUpdate={async (id, name) => {
                  const result = await updateRestaurantTag(id, name);
                  if (result.success) router.refresh();
                  return result;
                }}
                onDelete={async (id) => {
                  const result = await deleteRestaurantTag(id);
                  if (result.success) router.refresh();
                  return result;
                }}
                addPlaceholder="np. Wi-Fi, Ogródek letni, Przyjazne dzieciom..."
              />
            </TabsContent>
            <TabsContent value="dish">
              <TagTable
                tags={dishTags}
                onCreate={async (name) => {
                  const result = await createDishTag(name);
                  if (result.success) router.refresh();
                  return result;
                }}
                onUpdate={async (id, name) => {
                  const result = await updateDishTag(id, name);
                  if (result.success) router.refresh();
                  return result;
                }}
                onDelete={async (id) => {
                  const result = await deleteDishTag(id);
                  if (result.success) router.refresh();
                  return result;
                }}
                addPlaceholder="np. Wegetariańskie, Ostre, Bezglutenowe..."
              />
            </TabsContent>
            <TabsContent value="requests">
              <TagRequestsTable requests={tagRequests} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
