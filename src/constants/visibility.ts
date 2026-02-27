// Definicja wszystkich paneli UI które można kontrolować
export const UI_PANELS = [
  {
    key: "statistics",
    label: "Karta Statystyk",
    description: "Wykresy i wskaźniki sprzedaży",
  },
  {
    key: "revenue",
    label: "Strona Główna z Przychodem",
    description: "Przychody i podsumowanie finansowe",
  },
  {
    key: "reports",
    label: "Raporty",
    description: "Szczegółowe raporty okresowe",
  },
  {
    key: "menu",
    label: "Zarządzanie Menu",
    description: "Edycja dań, cen i kategorii",
  },
  {
    key: "orders",
    label: "Zamówienia",
    description: "Lista i obsługa zamówień",
  },
  {
    key: "opening_hours",
    label: "Godziny Otwarcia",
    description: "Edycja godzin pracy lokalizacji",
  },
] as const;

export type PanelKey = (typeof UI_PANELS)[number]["key"];
export type TargetRole = "MANAGER" | "WORKER";
