"use client";

import { useState } from "react";
import {
  Star,
  Search,
  Filter,
  Eye,
  EyeOff,
  Trash2,
  TrendingUp,
  TrendingDown,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  toggleReviewVisibility,
  adminDeleteReview,
} from "@/actions/client/reviews";
import { toast } from "sonner";

// ============================================
// TYPES
// ============================================

type Review = {
  id: string;
  rating: number;
  content: string | null;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  restaurant: {
    id: string;
    name: string;
    slug: string;
  };
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function ReviewsClient({
  reviews: initialReviews,
  userRole,
}: {
  reviews: Review[];
  userRole: string;
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const isAdmin = userRole === "ADMIN";

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      !searchQuery ||
      review.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating = !ratingFilter || review.rating === ratingFilter;

    return matchesSearch && matchesRating;
  });

  // Calculate statistics
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === rating).length / reviews.length) *
          100
        : 0,
  }));

  // Handle toggle visibility (Admin only)
  const handleToggleVisibility = async (reviewId: string) => {
    const result = await toggleReviewVisibility(reviewId);
    if (result.success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, isVisible: result.newVisibility ?? !r.isVisible }
            : r,
        ),
      );
      toast.success("Widoczność opinii została zmieniona");
    } else {
      toast.error(result.error || "Nie udało się zmienić widoczności");
    }
  };

  // Handle delete (Admin only)
  const handleDelete = async (reviewId: string) => {
    if (
      !confirm(
        "Czy na pewno chcesz usunąć tę opinię? Ta operacja jest nieodwracalna.",
      )
    ) {
      return;
    }

    const result = await adminDeleteReview(reviewId);
    if (result.success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Opinia została usunięta");
    } else {
      toast.error(result.error || "Nie udało się usunąć opinii");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="border-b border-[#EEEEEE] bg-white">
        <div className="mx-auto max-w-7xl px-8 py-6">
          <h1 className="text-3xl font-bold text-[#1F1F1F]">⭐ Opinie</h1>
          <p className="text-[#8C8C8C]">
            Przeglądaj opinie klientów o Twoich restauracjach
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-8 py-6">
        {reviews.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-[#CCCCCC]" />
            <h2 className="text-xl font-bold text-[#1F1F1F]">Brak opinii</h2>
            <p className="mt-2 text-[#8C8C8C]">
              Nie masz jeszcze żadnych opinii od klientów
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 grid gap-4 md:grid-cols-4">
              {/* Average rating */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F1F1F]">
                      {avgRating.toFixed(1)}
                    </p>
                    <p className="text-sm text-[#8C8C8C]">Średnia ocena</p>
                  </div>
                </div>
              </div>

              {/* Total reviews */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <MessageSquare className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F1F1F]">
                      {reviews.length}
                    </p>
                    <p className="text-sm text-[#8C8C8C]">Wszystkich opinii</p>
                  </div>
                </div>
              </div>

              {/* Positive reviews */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F1F1F]">
                      {reviews.filter((r) => r.rating >= 4).length}
                    </p>
                    <p className="text-sm text-[#8C8C8C]">Pozytywnych (4-5★)</p>
                  </div>
                </div>
              </div>

              {/* Negative reviews */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#1F1F1F]">
                      {reviews.filter((r) => r.rating <= 2).length}
                    </p>
                    <p className="text-sm text-[#8C8C8C]">Negatywnych (1-2★)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating distribution */}
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-bold text-[#1F1F1F]">Rozkład ocen</h3>
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setRatingFilter(ratingFilter === rating ? null : rating)
                      }
                      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
                        ratingFilter === rating
                          ? "bg-[#FF4D4F] text-white"
                          : "text-[#8C8C8C] hover:bg-[#F5F5F5]"
                      }`}
                    >
                      {rating}
                      <Star className="h-3 w-3 fill-current" />
                    </button>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#F5F5F5]">
                      <div
                        className="h-full rounded-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm text-[#8C8C8C]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8C8C8C]" />
                <input
                  type="text"
                  placeholder="Szukaj opinii..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-[#EEEEEE] bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#FF4D4F] focus:outline-none"
                />
              </div>
              {ratingFilter && (
                <Button
                  onClick={() => setRatingFilter(null)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                >
                  <Filter className="mr-1 h-4 w-4" />
                  Wyczyść filtr ({ratingFilter}★)
                </Button>
              )}
            </div>

            {/* Reviews list */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <p className="text-[#8C8C8C]">
                    Nie znaleziono opinii pasujących do kryteriów
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className={`rounded-2xl bg-white p-6 shadow-sm ${
                      !review.isVisible ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5] text-lg font-bold text-[#8C8C8C]">
                          {review.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#1F1F1F]">
                              {review.user.name}
                            </p>
                            {!review.isVisible && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                                Ukryta
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#8C8C8C]">
                            {review.user.email}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-[#CCCCCC]">•</span>
                            <span className="text-xs text-[#8C8C8C]">
                              {formatDate(review.createdAt)}
                            </span>
                            <span className="text-xs text-[#CCCCCC]">•</span>
                            <span className="text-xs text-[#8C8C8C]">
                              {review.restaurant.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleVisibility(review.id)}
                            className="rounded-lg p-2 text-[#8C8C8C] hover:bg-[#F5F5F5]"
                            title={
                              review.isVisible ? "Ukryj opinię" : "Pokaż opinię"
                            }
                          >
                            {review.isVisible ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="rounded-lg p-2 text-[#8C8C8C] hover:bg-red-50 hover:text-red-500"
                            title="Usuń opinię"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {review.content && (
                      <p className="mt-4 text-[#1F1F1F]">
                        &ldquo;{review.content}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
