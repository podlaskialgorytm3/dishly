"use client";

import { Menu } from "lucide-react";

export function MobileMenuButton() {
  return (
    <button
      type="button"
      className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[#FAFAFA] transition-colors"
      onClick={() => {
        const event = new CustomEvent("toggleMobileSidebar");
        window.dispatchEvent(event);
      }}
    >
      <Menu className="h-6 w-6 text-[#1F1F1F]" />
    </button>
  );
}
