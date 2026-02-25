export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 font-bold text-[var(--dishly-text)]">
              O DISHLY
            </h3>
            <ul className="space-y-2 text-sm text-[var(--dishly-text-muted)]">
              <li>
                <a href="#" className="hover:text-[var(--dishly-primary)]">
                  O nas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--dishly-primary)]">
                  Kariera
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--dishly-primary)]">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* For Restaurants */}
          <div>
            <h3 className="mb-4 font-bold text-[var(--dishly-text)]">
              Dla Restauracji
            </h3>
            <ul className="space-y-2 text-sm text-[var(--dishly-text-muted)]">
              <li>
                <a
                  href="/register-owner"
                  className="hover:text-[var(--dishly-primary)]"
                >
                  Dołącz do nas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--dishly-primary)]">
                  Cennik
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--dishly-primary)]">
                  Pomoc
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-bold text-[var(--dishly-text)]">
              Informacje Prawne
            </h3>
            <ul className="space-y-2 text-sm text-[var(--dishly-text-muted)]">
              <li>
                <a href="#" className="hover:text-[var(--dishly-primary)]">
                  Regulamin
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--dishly-primary)]">
                  Polityka prywatności
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[var(--dishly-primary)]">
                  Cookies
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-bold text-[var(--dishly-text)]">
              Kontakt
            </h3>
            <ul className="space-y-2 text-sm text-[var(--dishly-text-muted)]">
              <li>kontakt@dishly.pl</li>
              <li>+48 123 456 789</li>
              <li className="flex gap-3 pt-2">
                <a
                  href="#"
                  className="text-[var(--dishly-text-muted)] hover:text-[var(--dishly-primary)]"
                >
                  Facebook
                </a>
                <a
                  href="#"
                  className="text-[var(--dishly-text-muted)] hover:text-[var(--dishly-primary)]"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-8 text-center text-sm text-[var(--dishly-text-muted)]">
          © {new Date().getFullYear()} DISHLY. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
}
