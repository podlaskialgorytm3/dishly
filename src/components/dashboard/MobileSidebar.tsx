"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  X,
  Store,
  ShieldCheck,
  Users,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";
import { getIcon, type IconName } from "@/lib/icon-map";

type MenuItem = {
  name: string;
  href: string;
  iconName: IconName;
  roles: string[];
  disabled?: boolean;
  panelKey?: string;
};

type Session = {
  user: {
    email?: string | null;
    role?: string | null;
    restaurantId?: string | null;
  };
};

interface MobileSidebarProps {
  menuItems: MenuItem[];
  session: Session;
}

export function MobileSidebar({ menuItems, session }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggleMobileSidebar", handleToggle);
    return () =>
      window.removeEventListener("toggleMobileSidebar", handleToggle);
  }, []);

  // Close on route change
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 md:hidden"
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-[280px] border-r border-[#EEEEEE] bg-white md:hidden animate-in slide-in-from-left duration-300">
        <div className="flex h-full flex-col">
          {/* Header with Logo and Close Button */}
          <div className="flex h-16 items-center justify-between border-b border-[#EEEEEE] px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4D4F] to-[#FF3B30] shadow-lg">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#1F1F1F]">DISHLY</h1>
                <p className="text-xs text-[#8C8C8C]">
                  {session.user.role === "ADMIN"
                    ? "Panel Admina"
                    : session.user.role === "OWNER"
                      ? "Panel Właściciela"
                      : session.user.role === "MANAGER"
                        ? "Panel Menadżera"
                        : session.user.role === "WORKER"
                          ? "Panel Pracownika"
                          : "Panel Klienta"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#FAFAFA] transition-colors"
            >
              <X className="h-5 w-5 text-[#1F1F1F]" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {menuItems.map((item) => {
              const Icon = getIcon(item.iconName);
              const isDisabled = item.disabled || false;

              if (isDisabled) {
                return (
                  <div
                    key={item.href}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#8C8C8C] opacity-50 cursor-not-allowed"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="ml-auto text-xs bg-[#EEEEEE] px-2 py-0.5 rounded-full">
                      Wkrótce
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 text-[#1F1F1F] transition-all duration-200 hover:bg-[#FAFAFA]"
                >
                  <Icon className="h-5 w-5 transition-colors group-hover:text-[#FF4D4F]" />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-[#EEEEEE] p-4">
            <div className="mb-3 rounded-xl bg-[#FAFAFA] p-3">
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    session.user.role === "ADMIN"
                      ? "bg-gradient-to-br from-purple-500 to-purple-600"
                      : session.user.role === "OWNER"
                        ? "bg-gradient-to-br from-[#FF4D4F] to-[#FF3B30]"
                        : "bg-gradient-to-br from-blue-500 to-blue-600"
                  }`}
                >
                  {session.user.role === "ADMIN" ? (
                    <ShieldCheck className="h-4 w-4 text-white" />
                  ) : session.user.role === "OWNER" ? (
                    <Store className="h-4 w-4 text-white" />
                  ) : (
                    <Users className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#1F1F1F] truncate">
                    {session.user.email}
                  </p>
                  <p className="text-xs text-[#8C8C8C]">
                    {session.user.role === "ADMIN"
                      ? "Administrator"
                      : session.user.role === "OWNER"
                        ? "Właściciel"
                        : session.user.role === "MANAGER"
                          ? "Menadżer"
                          : session.user.role === "WORKER"
                            ? "Pracownik"
                            : "Klient"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-2 rounded-xl border border-[#EEEEEE] bg-white px-4 py-2 text-sm font-medium text-[#1F1F1F] transition-colors hover:bg-[#FAFAFA] hover:border-[#FF4D4F] hover:text-[#FF4D4F]"
            >
              <LogOut className="h-4 w-4" />
              Wyloguj
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
