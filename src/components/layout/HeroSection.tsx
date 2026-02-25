"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--dishly-primary)] to-[var(--dishly-accent)] px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
          Zamów coś pysznego 🍕
        </h1>
        <p className="mb-8 text-lg text-white/90 md:text-xl">
          Najlepsze restauracje w Twojej okolicy
        </p>

        {/* Search Bar */}
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-full bg-white p-2 shadow-2xl">
          <Input
            type="text"
            placeholder="Szukaj restauracji lub dań..."
            className="flex-1 border-0 text-base focus-visible:ring-0"
          />
          <Button
            size="lg"
            className="rounded-full bg-[var(--dishly-primary)] px-8 hover:bg-[var(--dishly-accent)]"
          >
            <Search className="mr-2 h-5 w-5" />
            Szukaj
          </Button>
        </div>

        {/* Quick Tags */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {["🍕 Pizza", "🍔 Burgery", "🍣 Sushi", "🥗 Zdrowe", "🍰 Desery"].map(
            (tag) => (
              <button
                key={tag}
                className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
              >
                {tag}
              </button>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
