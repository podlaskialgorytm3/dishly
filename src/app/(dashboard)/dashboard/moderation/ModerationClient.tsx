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
import { deleteReview, toggleUserActive } from "@/actions/admin/moderation";
import { toast } from "sonner";
import { Trash2, Ban, UserCheck, Star, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  isApproved: boolean;
  createdAt: Date;
  _count: { orders: number; ownedRestaurants: number };
};

type Review = {
  id: string;
  rating: number;
  content: string | null;
  isVisible: boolean;
  createdAt: Date;
  user: { email: string; firstName: string | null; lastName: string | null };
  restaurant: { name: string; slug: string };
};

function roleLabel(role: string) {
  if (role === "ADMIN")
    return (
      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
        Admin
      </Badge>
    );
  if (role === "OWNER")
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
        Właściciel
      </Badge>
    );
  if (role === "MANAGER")
    return (
      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        Manager
      </Badge>
    );
  if (role === "WORKER")
    return (
      <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">
        Pracownik
      </Badge>
    );
  return (
    <Badge className="bg-[#EEEEEE] text-[#8C8C8C] hover:bg-[#EEEEEE]">
      Klient
    </Badge>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-[#EEEEEE]"}`}
        />
      ))}
      <span className="ml-1 text-xs text-[#8C8C8C]">{rating}/5</span>
    </div>
  );
}

function UsersTable({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const router = useRouter();

  async function handleToggle(userId: string, isActive: boolean) {
    const action = isActive ? "aktywować" : "dezaktywować";
    if (!confirm(`Czy na pewno chcesz ${action} to konto?`)) return;
    const result = await toggleUserActive(userId, isActive);
    if (result.success) {
      toast.success(isActive ? "Konto aktywowane" : "Konto dezaktywowane");
      router.refresh();
    } else {
      toast.error(result.error || "Błąd");
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      header: "Użytkownik",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">
            {row.original.firstName || row.original.lastName
              ? `${row.original.firstName ?? ""} ${row.original.lastName ?? ""}`.trim()
              : "—"}
          </p>
          <p className="text-xs text-[#8C8C8C]">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Rola",
      cell: ({ row }) => roleLabel(row.original.role),
    },
    {
      header: "Statystyki",
      cell: ({ row }) => (
        <div className="text-xs text-[#8C8C8C]">
          <p>{row.original._count.orders} zamówień</p>
          {row.original._count.ownedRestaurants > 0 && (
            <p>{row.original._count.ownedRestaurants} restauracji</p>
          )}
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
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.isActive
              ? "bg-green-100 text-green-700 hover:bg-green-100"
              : "bg-red-100 text-red-700 hover:bg-red-100"
          }
        >
          {row.original.isActive ? "Aktywny" : "Zablokowany"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Akcje",
      cell: ({ row }) => {
        if (row.original.id === currentUserId) {
          return <span className="text-xs text-[#8C8C8C]">Twoje konto</span>;
        }
        return row.original.isActive ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleToggle(row.original.id, false)}
            className="border-red-200 text-red-500 hover:bg-red-50 gap-1 h-8"
          >
            <Ban className="h-3.5 w-3.5" />
            Zablokuj
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => handleToggle(row.original.id, true)}
            className="bg-green-500 hover:bg-green-600 text-white gap-1 h-8"
          >
            <UserCheck className="h-3.5 w-3.5" />
            Aktywuj
          </Button>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      filterColumn="email"
      filterPlaceholder="Szukaj po emailu..."
    />
  );
}

function ReviewsTable({ reviews }: { reviews: Review[] }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [maxRating, setMaxRating] = useState<number | null>(null);

  const filtered = reviews.filter((r) => {
    const matchRating = maxRating === null || r.rating <= maxRating;
    const matchKeyword =
      !keyword ||
      (r.content?.toLowerCase().includes(keyword.toLowerCase()) ?? false);
    return matchRating && matchKeyword;
  });

  async function handleDelete(id: string) {
    if (!confirm("Czy na pewno chcesz usunąć tę recenzję?")) return;
    const result = await deleteReview(id);
    if (result.success) {
      toast.success("Recenzja usunięta");
      router.refresh();
    } else {
      toast.error("Błąd");
    }
  }

  const columns: ColumnDef<Review>[] = [
    {
      header: "Ocena",
      cell: ({ row }) => <RatingStars rating={row.original.rating} />,
    },
    {
      header: "Restauracja",
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {row.original.restaurant.name}
        </span>
      ),
    },
    {
      header: "Autor",
      cell: ({ row }) => (
        <div>
          <p className="text-sm">
            {row.original.user.firstName} {row.original.user.lastName}
          </p>
          <p className="text-xs text-[#8C8C8C]">{row.original.user.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "content",
      header: "Treść",
      cell: ({ row }) => (
        <p className="text-sm text-[#1F1F1F] max-w-xs truncate">
          {row.original.content || (
            <span className="text-[#8C8C8C] italic">Brak opisu</span>
          )}
        </p>
      ),
    },
    {
      header: "Data",
      cell: ({ row }) => (
        <span className="text-xs text-[#8C8C8C]">
          {new Date(row.original.createdAt).toLocaleDateString("pl-PL")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Akcje",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(row.original.id)}
          className="h-8 w-8 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8C8C]" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Szukaj w treści..."
            className="pl-9 border-[#EEEEEE]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#8C8C8C]">Maks. ocena:</span>
          {[null, 1, 2, 3].map((r) => (
            <Button
              key={r ?? "all"}
              size="sm"
              variant={maxRating === r ? "default" : "outline"}
              onClick={() => setMaxRating(r)}
              className={`h-8 ${maxRating === r ? "bg-[#FF4D4F] hover:bg-[#FF3B30] text-white" : "border-[#EEEEEE]"}`}
            >
              {r === null ? "Wszystkie" : `≤ ${r}★`}
            </Button>
          ))}
        </div>
      </div>
      <DataTable columns={columns} data={filtered} />
    </div>
  );
}

export function ModerationClient({
  users,
  reviews,
  currentUserId,
}: {
  users: User[];
  reviews: Review[];
  currentUserId: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F1F1F]">
          Moderacja i Bezpieczeństwo
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Zarządzaj użytkownikami i moderuj opinie
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
          <p className="text-xs text-[#8C8C8C] uppercase tracking-wide">
            Wszyscy użytkownicy
          </p>
          <p className="text-2xl font-bold text-[#1F1F1F] mt-1">
            {users.length}
          </p>
        </div>
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
          <p className="text-xs text-[#8C8C8C] uppercase tracking-wide">
            Zablokowani
          </p>
          <p className="text-2xl font-bold text-[#1F1F1F] mt-1">
            {users.filter((u) => !u.isActive).length}
          </p>
        </div>
        <div className="rounded-xl border border-[#EEEEEE] bg-white p-4">
          <p className="text-xs text-[#8C8C8C] uppercase tracking-wide">
            Wszystkich opinii
          </p>
          <p className="text-2xl font-bold text-[#1F1F1F] mt-1">
            {reviews.length}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[#EEEEEE] bg-white">
        <Tabs defaultValue="users">
          <div className="border-b border-[#EEEEEE] px-6 pt-4">
            <TabsList className="bg-transparent gap-1">
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-[#FAFAFA] data-[state=active]:border data-[state=active]:border-[#EEEEEE]"
              >
                Użytkownicy ({users.length})
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-[#FAFAFA] data-[state=active]:border data-[state=active]:border-[#EEEEEE]"
              >
                Opinie ({reviews.length})
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="p-6">
            <TabsContent value="users">
              <UsersTable users={users} currentUserId={currentUserId} />
            </TabsContent>
            <TabsContent value="reviews">
              <ReviewsTable reviews={reviews} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
