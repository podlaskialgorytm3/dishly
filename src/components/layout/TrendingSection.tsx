"use client";

import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";

interface TrendingItem {
  id: string;
  name: string;
  slug: string;
  restaurantName: string;
  restaurantSlug: string;
  imageUrl: string;
  price: number;
  badge?: "Nowość" | "Hit" | "Promocja";
}

interface TrendingSectionProps {
  items: TrendingItem[];
}

export function TrendingSection({ items }: TrendingSectionProps) {
  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case "Nowość":
        return "bg-blue-500";
      case "Hit":
        return "bg-[var(--dishly-promo)]";
      case "Promocja":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  // Nie wyświetlaj sekcji, jeśli nie ma posiłków
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#FFF3E0] py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center gap-2">
          <Flame className="h-7 w-7 text-[var(--dishly-primary)]" />
          <h2 className="text-3xl font-bold text-[var(--dishly-text)]">
            Trendujące
          </h2>
        </div>

        {/* Horizontal Scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${item.restaurantSlug}/${item.slug}`}
              className="group flex-shrink-0 w-64 overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-200">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-5xl">
                    🍽️
                  </div>
                )}

                {/* Badge */}
                {item.badge && (
                  <div
                    className={`absolute left-3 top-3 rounded-full ${getBadgeColor(item.badge)} px-3 py-1 text-xs font-bold text-white`}
                  >
                    {item.badge}
                  </div>
                )}
              </div>

              <div className="p-4 text-left">
                <h3 className="mb-1 font-bold text-[var(--dishly-text)]">
                  {item.name}
                </h3>
                <p className="mb-2 text-sm text-[var(--dishly-text-muted)]">
                  {item.restaurantName}
                </p>
                <p className="text-lg font-bold text-[var(--dishly-primary)]">
                  {item.price.toFixed(2)} zł
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
