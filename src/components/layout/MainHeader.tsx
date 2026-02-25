"use client";

import Link from "next/link";
import { Bell, ShoppingCart, User, UtensilsCrossed, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainHeaderProps {
  user?: {
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
}

export function MainHeader({ user }: MainHeaderProps) {
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return "U";
  };

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return "Użytkownik";
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--dishly-primary)] to-[var(--dishly-promo)] shadow-lg">
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--dishly-primary)]">
              DISHLY
            </span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Home Button (only for CLIENT) */}
                {user.role === "CLIENT" && (
                  <Link href="/">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-gray-100"
                      title="Strona Główna"
                    >
                      <Home className="h-5 w-5" />
                    </Button>
                  </Link>
                )}

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--dishly-promo)] text-[10px] font-bold text-white">
                    3
                  </span>
                </Button>

                {/* Cart (only for CLIENT) */}
                {user.role === "CLIENT" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--dishly-promo)] text-[10px] font-bold text-white">
                      2
                    </span>
                  </Button>
                )}

                {/* User Avatar with Name */}
                <Link href="/dashboard">
                  <div className="flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-1.5 pr-4 transition-all hover:bg-gray-200">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--dishly-primary)] to-[var(--dishly-accent)] font-semibold text-white text-sm">
                      {getInitials()}
                    </div>
                    <span className="text-sm font-medium text-[var(--dishly-text)]">
                      {getFullName()}
                    </span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Zaloguj się
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-[var(--dishly-primary)] hover:bg-[var(--dishly-accent)]"
                  >
                    Zarejestruj się
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
