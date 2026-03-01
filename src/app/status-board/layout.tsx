import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tablica Zamówień — DISHLY",
  description: "Tablica statusu zamówień na żywo",
};

export default function StatusBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
