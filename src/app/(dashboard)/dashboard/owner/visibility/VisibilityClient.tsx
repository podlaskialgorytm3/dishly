"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateVisibility } from "@/actions/owner/visibility";
import { Shield, Briefcase, Eye, EyeOff } from "lucide-react";

type Panel = {
  key: string;
  label: string;
  description: string;
};

type VisibilityMap = Record<string, Record<string, boolean>>;

export default function VisibilityClient({
  panels,
  visibilityMap: initial,
}: {
  panels: Panel[];
  visibilityMap: VisibilityMap;
}) {
  const [map, setMap] = useState<VisibilityMap>(initial);
  const [pending, startTransition] = useTransition();

  const toggle = (role: "MANAGER" | "WORKER", panelKey: string) => {
    const current = map[role][panelKey];
    const next = !current;

    // Optimistic update
    setMap((prev) => ({
      ...prev,
      [role]: { ...prev[role], [panelKey]: next },
    }));

    startTransition(async () => {
      try {
        await updateVisibility(role, panelKey, next);
        toast.success(
          `"${panels.find((p) => p.key === panelKey)?.label}" ${next ? "widoczne" : "ukryte"} dla ${role === "MANAGER" ? "Menadżera" : "Pracownika"}`,
        );
      } catch (e: any) {
        // Revert on error
        setMap((prev) => ({
          ...prev,
          [role]: { ...prev[role], [panelKey]: current },
        }));
        toast.error(e.message || "Błąd podczas zapisywania");
      }
    });
  };

  return (
    <div className="space-y-8">
      {(["MANAGER", "WORKER"] as const).map((role) => (
        <div
          key={role}
          className="rounded-[20px] border border-[#EEEEEE] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          {/* Header */}
          <div
            className={`flex items-center gap-3 px-6 py-4 ${role === "MANAGER" ? "bg-purple-50 border-b border-purple-100" : "bg-blue-50 border-b border-blue-100"}`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${role === "MANAGER" ? "bg-purple-100" : "bg-blue-100"}`}
            >
              {role === "MANAGER" ? (
                <Shield className="h-5 w-5 text-purple-600" />
              ) : (
                <Briefcase className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-[#1F1F1F]">
                {role === "MANAGER" ? "Menadżer" : "Pracownik"}
              </h2>
              <p className="text-xs text-[#8C8C8C]">
                {role === "MANAGER"
                  ? "Zarządzanie menu, cenami, godzinami i raportami"
                  : "Tylko zamówienia i statusy"}
              </p>
            </div>
          </div>

          {/* Panels */}
          <div className="divide-y divide-[#EEEEEE]">
            {panels.map((panel) => {
              const isVisible = map[role][panel.key] ?? true;
              return (
                <div
                  key={panel.key}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-[#FAFAFA]"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1F1F1F]">
                      {panel.label}
                    </p>
                    <p className="text-xs text-[#8C8C8C]">
                      {panel.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(role, panel.key)}
                    disabled={pending}
                    className={`relative flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isVisible
                        ? "bg-[#FF4D4F] focus:ring-[#FF4D4F]"
                        : "bg-gray-200 focus:ring-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        isVisible ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <div
                    className={`ml-3 flex h-6 w-6 items-center justify-center rounded-full ${isVisible ? "bg-[#FFF1F1]" : "bg-gray-100"}`}
                  >
                    {isVisible ? (
                      <Eye className="h-3.5 w-3.5 text-[#FF4D4F]" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-gray-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold">Jak to działa?</p>
        <p className="mt-1 text-blue-700">
          Zmiany są zapisywane natychmiast (przełącznik). Po następnym
          zalogowaniu się pracownika lub menadżera, panel stanie się widoczny
          lub zniknie z jego menu nawigacyjnego.
        </p>
      </div>
    </div>
  );
}
