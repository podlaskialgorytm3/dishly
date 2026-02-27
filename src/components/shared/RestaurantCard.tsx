"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface RestaurantCardProps {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  minOrder: number;
  deliveryFee: number;
  categories?: string[];
}

export function RestaurantCard({
  id,
  slug,
  name,
  imageUrl,
  rating,
  reviewCount,
  deliveryTime,
  minOrder,
  deliveryFee,
  categories,
}: RestaurantCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Link href={`/${slug}`} className="block">
      <Card className="group overflow-hidden rounded-3xl border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-200">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-6xl">
              🍽️
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorite
                  ? "fill-[var(--dishly-promo)] text-[var(--dishly-promo)]"
                  : "text-gray-600"
              }`}
            />
          </button>

          {/* Free Delivery Badge */}
          {deliveryFee === 0 && (
            <div className="absolute left-3 top-3 rounded-full bg-[var(--dishly-success)] px-3 py-1 text-xs font-bold text-white">
              Darmowa dostawa
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 text-lg font-bold text-[var(--dishly-text)]">
            {name}
          </h3>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <p className="mb-3 text-sm text-[var(--dishly-text-muted)]">
              {categories.join(" • ")}
            </p>
          )}

          {/* Stats */}
          <div className="mb-4 flex items-center gap-4 text-sm text-[var(--dishly-text-muted)]">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-[var(--dishly-text)]">
                {rating.toFixed(1)}
              </span>
              <span>({reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{deliveryTime}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--dishly-text-muted)]">
              Min. {minOrder.toFixed(2)} zł
            </div>
            <div className="text-sm font-semibold text-[var(--dishly-primary)]">
              {deliveryFee === 0
                ? "Darmowa dostawa"
                : `Dostawa ${deliveryFee.toFixed(2)} zł`}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
