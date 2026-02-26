import Link from "next/link";
import {
  UtensilsCrossed,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
} from "lucide-react";
import { db } from "@/lib/db";

export async function Footer() {
  // Pobierz strony do wyświetlenia w nagłówku i stopce
  const headerPages = await db.page.findMany({
    where: {
      isPublished: true,
      showInHeader: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      title: true,
      slug: true,
    },
  });

  const footerPages = await db.page.findMany({
    where: {
      isPublished: true,
      showInFooter: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
    select: {
      title: true,
      slug: true,
    },
  });

  return (
    <footer className="bg-gradient-to-b from-white to-[#FAFAFA] border-t border-[#EEEEEE]">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 group mb-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--dishly-primary)] to-[var(--dishly-accent)] shadow-md transition-transform group-hover:scale-105">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-[var(--dishly-primary)]">
                DISHLY
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#8C8C8C] mb-6">
              Twoja ulubiona platforma do zamawiania jedzenia online. Najlepsze
              restauracje w zasięgu ręki.
            </p>

            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Facebook"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EEEEEE] text-[#8C8C8C] transition-all hover:border-[var(--dishly-primary)] hover:text-[var(--dishly-primary)] hover:scale-110">
                  <Facebook className="h-5 w-5" />
                </div>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Instagram"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EEEEEE] text-[#8C8C8C] transition-all hover:border-[var(--dishly-primary)] hover:text-[var(--dishly-primary)] hover:scale-110">
                  <Instagram className="h-5 w-5" />
                </div>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
                aria-label="Twitter"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#EEEEEE] text-[#8C8C8C] transition-all hover:border-[var(--dishly-primary)] hover:text-[var(--dishly-primary)] hover:scale-110">
                  <Twitter className="h-5 w-5" />
                </div>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="mb-6 text-sm font-bold tracking-wide uppercase text-[#1F1F1F]">
              Nawigacja
            </h3>
            <ul className="space-y-3">
              {headerPages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/${page.slug}`}
                    className="group relative inline-block text-[#1F1F1F] transition-colors hover:text-[var(--dishly-primary)]"
                  >
                    <span className="relative">
                      {page.title}
                      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--dishly-primary)] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Restaurants */}
          <div>
            <h3 className="mb-6 text-sm font-bold tracking-wide uppercase text-[#1F1F1F]">
              Dla Restauracji
            </h3>
            <ul className="space-y-3">
              {[
                { label: "Dołącz do nas", href: "/register-owner" },
                { label: "Cennik", href: "#" },
                { label: "Pomoc techniczna", href: "#" },
                { label: "Dokumentacja", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group relative inline-block text-[#1F1F1F] transition-colors hover:text-[var(--dishly-primary)]"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--dishly-primary)] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="mb-6 text-sm font-bold tracking-wide uppercase text-[#1F1F1F]">
              Informacje
            </h3>
            <ul className="space-y-3 mb-6">
              {footerPages.map((page) => (
                <li key={page.slug}>
                  <Link
                    href={`/${page.slug}`}
                    className="group relative inline-block text-[#1F1F1F] transition-colors hover:text-[var(--dishly-primary)]"
                  >
                    <span className="relative">
                      {page.title}
                      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--dishly-primary)] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-[#8C8C8C]">
              <a
                href="mailto:kontakt@dishly.pl"
                className="flex items-center gap-2 transition-colors hover:text-[var(--dishly-primary)]"
              >
                <Mail className="h-4 w-4" />
                kontakt@dishly.pl
              </a>
              <a
                href="tel:+48123456789"
                className="flex items-center gap-2 transition-colors hover:text-[var(--dishly-primary)]"
              >
                <Phone className="h-4 w-4" />
                +48 123 456 789
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#EEEEEE] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-[#8C8C8C] md:flex-row">
            <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
              <p>
                © {new Date().getFullYear()} DISHLY. Wszelkie prawa zastrzeżone.
              </p>
              <span className="hidden md:inline">•</span>
              <p className="text-xs">Wersja 1.0.0</p>
            </div>
            <div className="text-xs">
              Stworzone z ❤️ dla miłośników jedzenia
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
