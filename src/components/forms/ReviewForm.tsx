"use client";

import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitReview } from "@/actions/client/reviews";
import { toast } from "sonner";

interface ReviewFormProps {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  existingReview?: {
    id: string;
    rating: number;
    content: string | null;
  };
  onSuccess?: () => void;
}

export default function ReviewForm({
  orderId,
  restaurantId,
  restaurantName,
  existingReview,
  onSuccess,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState(existingReview?.content ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Wybierz ocenę (1-5 gwiazdek)");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitReview({
        orderId,
        restaurantId,
        rating,
        content: content.trim() || undefined,
      });

      if (result.success) {
        setIsSubmitted(true);
        toast.success(
          existingReview
            ? "Opinia została zaktualizowana!"
            : "Dziękujemy za opinię!",
        );
        onSuccess?.();
      } else {
        toast.error(result.error || "Nie udało się dodać opinii");
      }
    } catch {
      toast.error("Wystąpił błąd. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl bg-green-50 p-6 text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
        </div>
        <h3 className="text-lg font-bold text-green-800">
          Dziękujemy za opinię!
        </h3>
        <p className="mt-1 text-sm text-green-600">
          Twoja ocena pomaga innym użytkownikom
        </p>
        <div className="mt-3 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-6 w-6 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-lg font-bold text-[#1F1F1F]">
        {existingReview ? "Edytuj swoją opinię" : "Oceń zamówienie"}
      </h3>
      <p className="mb-4 text-sm text-[#8C8C8C]">
        Jak oceniasz doświadczenie z {restaurantName}?
      </p>

      {/* Star Rating */}
      <div className="mb-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform hover:scale-110 focus:outline-none"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
              disabled={isSubmitting}
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 hover:text-yellow-200"
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-[#8C8C8C]">
            {rating > 0 ? `${rating}/5` : "Wybierz ocenę"}
          </span>
        </div>
        {rating > 0 && (
          <p className="mt-1 text-sm text-[#8C8C8C]">
            {rating === 1 && "Bardzo słabo"}
            {rating === 2 && "Słabo"}
            {rating === 3 && "Przeciętnie"}
            {rating === 4 && "Dobrze"}
            {rating === 5 && "Doskonale!"}
          </p>
        )}
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-[#1F1F1F]">
          Komentarz (opcjonalny)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Opisz swoje wrażenia z zamówienia..."
          className="w-full rounded-xl border border-[#EEEEEE] p-3 text-sm text-[#1F1F1F] placeholder-[#CCCCCC] focus:border-[#FF4D4F] focus:outline-none focus:ring-1 focus:ring-[#FF4D4F]"
          rows={3}
          disabled={isSubmitting}
          maxLength={1000}
        />
        <p className="mt-1 text-right text-xs text-[#CCCCCC]">
          {content.length}/1000
        </p>
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="w-full rounded-xl bg-[#FF4D4F] py-3 font-semibold text-white hover:bg-[#FF3B30] disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wysyłanie...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            {existingReview ? "Zaktualizuj opinię" : "Wyślij opinię"}
          </>
        )}
      </Button>
    </div>
  );
}
