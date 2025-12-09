'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/kaffees', label: 'Kaffees', icon: '☕' },
    { href: '/admin/regionen', label: 'Regionen', icon: '🌍' },
    { href: '/admin/aromen', label: 'Aromen', icon: '🌸' },
    { href: '/admin/zubereitungen', label: 'Zubereitungen', icon: '🍵' },
    { href: '/admin/import', label: 'Import', icon: '⬆️' },
  ];

  return (
    <aside className="w-64 bg-[var(--color-surface)] border-r-2 border-[var(--color-border)] min-h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-[var(--color-espresso)] mb-8">Admin</h2>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[var(--color-beige-light)] text-[var(--color-espresso)] font-medium'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-beige-light)]'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}


