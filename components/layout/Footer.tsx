export function Footer() {
  return (
    <footer className="bg-[var(--color-beige-light)] border-t-2 border-[var(--color-beige)] mt-auto">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <p className="text-center text-[var(--color-text-secondary)] text-sm">
          © {new Date().getFullYear()} Kaffee Katalog
        </p>
      </div>
    </footer>
  );
}


