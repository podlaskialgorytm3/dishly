"use client";

import Link from "next/link";
import {
  ShoppingCart,
  UtensilsCrossed,
  Menu,
  X,
  MapPin,
  ChevronDown,
  LocateFixed,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useLocationStore } from "@/stores/location-store";

interface NavigationPage {
  title: string;
  slug: string;
}

interface MainHeaderProps {
  user?: {
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
  navigationPages?: NavigationPage[];
}

export function MainHeader({ user, navigationPages = [] }: MainHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isFloatingHeroNavbar = isHome && !isMobileViewport;

  const openDrawer = useCartStore((s) => s.openDrawer);
  const itemCount = useCartStore((s) => s.itemCount);
  const userLocation = useLocationStore((s) => s.userLocation);
  const detectLocation = useLocationStore((s) => s.detectLocation);
  const isLocationLoading = useLocationStore((s) => s.isLoading);
  const locationError = useLocationStore((s) => s.error);

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

  const normalizedPages = useMemo(
    () =>
      navigationPages.map((page) => ({
        ...page,
        normalized: `${page.title} ${page.slug}`.toLowerCase(),
      })),
    [navigationPages],
  );

  const resolvePageHref = (fallback: string, keywords: string[]) => {
    const found = normalizedPages.find((page) =>
      keywords.some((kw) => page.normalized.includes(kw)),
    );
    return found ? `/${found.slug}` : fallback;
  };

  const navItems = [
    { label: "Restauracje", href: "/" },
    {
      label: "Jak to działa",
      href: resolvePageHref("/jak-to-dziala", ["jak", "działa", "dziala"]),
    },
    { label: "Kariera", href: resolvePageHref("/kariera", ["kariera"]) },
    { label: "Blog", href: resolvePageHref("/blog", ["blog"]) },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const locationLabel = userLocation
    ? [userLocation.city, userLocation.address].filter(Boolean).join(", ") ||
      "Ustaw lokalizację"
    : "Wybierz lokalizację";

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (!locationMenuRef.current) {
        return;
      }
      if (!locationMenuRef.current.contains(event.target as Node)) {
        setLocationMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    return () => document.removeEventListener("mousedown", closeOnOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setLocationMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (!isFloatingHeroNavbar) {
      setIsScrolled(false);
      return;
    }

    const onScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isFloatingHeroNavbar]);

  const headerClass = isFloatingHeroNavbar
    ? `absolute left-0 right-0 top-0 z-[100] border-b transition-[background-color,border-color,backdrop-filter] duration-300 backdrop-blur-[12px] ${
        isScrolled
          ? "bg-[rgba(255,252,248,0.98)] border-[rgba(200,190,178,0.6)]"
          : "bg-[rgba(255,252,248,0.82)] border-[rgba(200,190,178,0.35)]"
      }`
    : "sticky top-0 z-[100] border-b border-[rgba(200,190,178,0.45)] bg-[rgba(255,252,248,0.98)]";

  return (
    <>
      <header className={headerClass}>
        <div className="mx-auto h-[68px] max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex h-full items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 md:gap-4">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
              >
                <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#E8503A]">
                  <UtensilsCrossed className="h-5 w-5 text-white" />
                </div>
                <span className="hidden text-[18px] font-medium tracking-[0.06em] text-[#E8503A] sm:block">
                  DISHLY
                </span>
              </Link>

              <div className="relative" ref={locationMenuRef}>
                <button
                  onClick={() => setLocationMenuOpen((prev) => !prev)}
                  className="hidden items-center gap-2 rounded-full border border-[rgba(200,190,178,0.55)] bg-[rgba(255,255,255,0.75)] px-3.5 py-1.5 text-left backdrop-blur-[8px] md:flex"
                  type="button"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#E8503A]" />
                  <div className="leading-tight">
                    <p className="text-[11px] text-[#9CA3AF]">Dostawa do</p>
                    <p className="max-w-[180px] truncate text-[13px] font-medium text-[#111827]">
                      {locationLabel}
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-[#7E7469]" />
                </button>

                <button
                  onClick={() => setLocationMenuOpen((prev) => !prev)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E6E6] bg-[#F8F8F8] text-[#E8503A] md:hidden"
                  type="button"
                >
                  <MapPin className="h-4 w-4" />
                </button>

                {locationMenuOpen && (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-[200] w-[260px] rounded-2xl border border-[rgba(200,190,178,0.45)] bg-[rgba(255,252,248,0.98)] p-3 shadow-lg backdrop-blur-[10px]">
                    <p className="mb-2 text-xs text-[#6B7280]">
                      Lokalizacja dostawy
                    </p>
                    <p className="mb-3 truncate text-sm font-medium text-[#111827]">
                      {locationLabel}
                    </p>
                    <button
                      onClick={async () => {
                        await detectLocation();
                      }}
                      className="mb-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E6E6E6] px-3 py-2 text-sm text-[#111827] hover:bg-[#F9F9F9]"
                      type="button"
                    >
                      <LocateFixed className="h-4 w-4" />
                      {isLocationLoading
                        ? "Pobieranie lokalizacji..."
                        : "Użyj mojej lokalizacji"}
                    </button>
                    <Link
                      href={
                        user?.role === "CLIENT"
                          ? "/delivery-settings"
                          : "/login"
                      }
                      onClick={() => setLocationMenuOpen(false)}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[#E8503A] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      Zmień adres
                    </Link>
                    {locationError && (
                      <p className="mt-2 text-xs text-[#B91C1C]">
                        {locationError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`rounded-xl px-3.5 py-1.5 text-[13.5px] transition-colors ${
                    isActive(item.href)
                      ? "font-medium text-[#E8503A]"
                      : "text-[#3D3530] hover:bg-[rgba(255,252,248,0.6)] hover:text-[#1A1612]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={openDrawer}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(200,190,178,0.5)] bg-[rgba(255,255,255,0.7)] px-3 py-1.5 text-[#1A1612] hover:bg-[rgba(255,255,255,0.92)]"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden text-[13.5px] sm:inline">Koszyk</span>
                <span className="rounded-full bg-[#E8503A] px-1.5 py-[1px] text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              </button>

              <span className="hidden h-6 w-px bg-[#E5E7EB] md:block" />

              {!user ? (
                <div className="hidden items-center gap-2 md:flex">
                  <Link
                    href="/login"
                    className="rounded-xl px-3 py-1.5 text-[13.5px] text-[#6B7280] transition-colors hover:bg-[#F5F5F5] hover:text-[#111827]"
                  >
                    Zaloguj się
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-[#E8503A] px-5 py-2 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90"
                  >
                    Zarejestruj się
                  </Link>
                </div>
              ) : (
                <Link
                  href="/dashboard"
                  className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#E8503A] text-[13px] font-medium text-white transition-opacity hover:opacity-85 md:inline-flex"
                  title={getFullName()}
                >
                  {getInitials()}
                </Link>
              )}

              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#E6E6E6] text-[#111827] transition-colors hover:bg-[#F8F8F8] xl:hidden"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[130] bg-black/45 xl:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="absolute right-0 top-0 h-full w-full max-w-[360px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] px-5 py-4">
                <p className="text-base font-medium text-[#111827]">Menu</p>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F5F5]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 px-4 py-4">
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`rounded-xl px-3 py-2 text-[14px] ${
                      isActive(item.href)
                        ? "font-medium text-[#E8503A]"
                        : "text-[#374151] hover:bg-[#F5F5F5]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto border-t border-[#EAEAEA] p-4">
                {!user ? (
                  <div className="space-y-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-xl border border-[#E6E6E6] px-3 py-2 text-center text-sm text-[#374151]"
                    >
                      Zaloguj się
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-xl bg-[#E8503A] px-3 py-2 text-center text-sm font-medium text-white"
                    >
                      Zarejestruj się
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-xl border border-[#E6E6E6] px-3 py-2 text-center text-sm text-[#374151]"
                    >
                      Panel użytkownika
                    </Link>
                    {user.role === "CLIENT" && (
                      <Link
                        href="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block rounded-xl border border-[#E6E6E6] px-3 py-2 text-center text-sm text-[#374151]"
                      >
                        Moje zamówienia
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
