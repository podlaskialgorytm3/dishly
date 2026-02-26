"use client";

import Link from "next/link";
import {
  Bell,
  ShoppingCart,
  User,
  UtensilsCrossed,
  Home,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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
    <>
      <header className="sticky top-0 z-[1000] bg-white/90 backdrop-blur-[10px] border-b border-[#EEEEEE] transition-all duration-300">
        <div className="mx-auto max-w-7xl px-8 h-[75px]">
          <div className="flex items-center justify-between h-full gap-8">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 transition-opacity duration-200 hover:opacity-85"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4D4F] to-[#FF8C42] shadow-lg">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#FF4D4F]">DISHLY</span>
            </Link>

            {/* Navigation Links - Desktop */}
            {navigationPages.length > 0 && (
              <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
                {navigationPages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/${page.slug}`}
                    className="text-sm font-medium text-[#1F1F1F] hover:text-[#FF4D4F] hover:font-semibold transition-all duration-300 relative group"
                  >
                    {page.title}
                    <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#FF4D4F] transition-all duration-300 ease-out group-hover:w-full group-hover:left-0"></span>
                  </Link>
                ))}
              </nav>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-5">
              {user ? (
                <>
                  {/* Home Button (only for CLIENT) */}
                  {user.role === "CLIENT" && (
                    <Link href="/">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-transparent transition-all duration-200 hover:scale-105 group"
                        title="Strona Główna"
                      >
                        <Home className="h-5 w-5 text-[#1F1F1F] group-hover:text-[#FF4D4F] transition-colors duration-200" />
                      </Button>
                    </Link>
                  )}

                  {/* Notifications */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-transparent transition-all duration-200 hover:scale-105 group"
                  >
                    <Bell className="h-5 w-5 text-[#1F1F1F] group-hover:text-[#FF4D4F] transition-colors duration-200" />
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4D4F] text-[10px] font-bold text-white">
                      3
                    </span>
                  </Button>

                  {/* Cart (only for CLIENT) */}
                  {user.role === "CLIENT" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full hover:bg-transparent transition-all duration-200 hover:scale-105 group"
                    >
                      <ShoppingCart className="h-5 w-5 text-[#1F1F1F] group-hover:text-[#FF4D4F] transition-colors duration-200" />
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4D4F] text-[10px] font-bold text-white">
                        2
                      </span>
                    </Button>
                  )}

                  {/* User Avatar with Name */}
                  <Link href="/dashboard">
                    <div className="hidden md:flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-1.5 pr-4 transition-all duration-200 hover:bg-gray-200">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF4D4F] to-[#FF8C42] font-semibold text-white text-sm">
                        {getInitials()}
                      </div>
                      <span className="text-sm font-medium text-[#1F1F1F]">
                        {getFullName()}
                      </span>
                    </div>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden md:block">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#1F1F1F] hover:text-[#FF4D4F]"
                    >
                      Zaloguj się
                    </Button>
                  </Link>
                  <Link href="/register" className="hidden md:block">
                    <Button
                      size="sm"
                      className="bg-[#FF4D4F] hover:bg-[#FF8C42] transition-colors duration-200"
                    >
                      Zarejestruj się
                    </Button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full hover:bg-transparent transition-all duration-200 hover:scale-105 group"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-[#1F1F1F] group-hover:text-[#FF4D4F] transition-colors duration-200" />
                ) : (
                  <Menu className="h-6 w-6 text-[#1F1F1F] group-hover:text-[#FF4D4F] transition-colors duration-200" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#EEEEEE]">
                <span className="text-lg font-bold text-[#FF4D4F]">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col p-6 space-y-4">
                {navigationPages.map((page) => (
                  <Link
                    key={page.slug}
                    href={`/${page.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-[#1F1F1F] hover:text-[#FF4D4F] transition-colors duration-200 py-2"
                  >
                    {page.title}
                  </Link>
                ))}
              </nav>

              {/* Mobile User Actions */}
              <div className="mt-auto p-6 border-t border-[#EEEEEE]">
                {user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FF4D4F] to-[#FF8C42] font-semibold text-white">
                        {getInitials()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1F1F1F]">
                          {getFullName()}
                        </p>
                        <p className="text-xs text-[#8C8C8C]">
                          Przejdź do panelu
                        </p>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block"
                    >
                      <Button variant="outline" className="w-full">
                        Zaloguj się
                      </Button>
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block"
                    >
                      <Button className="w-full bg-[#FF4D4F] hover:bg-[#FF8C42]">
                        Zarejestruj się
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
