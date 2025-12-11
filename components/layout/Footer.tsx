import { Link } from '@/lib/i18n-utils';

export function Footer() {
  return (
    <footer className="bg-[var(--color-beige-light)] border-t-2 border-[var(--color-beige)] mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[var(--color-text-secondary)] text-sm">
          © {new Date().getFullYear()} Kaffee Katalog
        </p>
        <Link
          href="/admin"
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-espresso)] transition-colors"
        >
          Adminbereich
        </Link>
      </div>
    </footer>
  );
}


