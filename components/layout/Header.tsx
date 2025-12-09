'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-[var(--color-surface)] border-b-2 border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold text-[var(--color-espresso)]">
            Kaffee Katalog
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8">
              <Link
                href="/kaffees"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-espresso)] transition-colors"
              >
                Kaffees
              </Link>
              <Link
                href="/regionen"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-espresso)] transition-colors"
              >
                Regionen
              </Link>
              <Link
                href="/admin"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-espresso)] transition-colors"
              >
                Admin
              </Link>
            </nav>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-hover)] transition-colors"
              aria-label={resolvedTheme === 'dark' ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
            >
              {resolvedTheme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--color-text-primary)]">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--color-text-primary)]">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--color-hover)] transition-colors"
              aria-label={resolvedTheme === 'dark' ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
            >
              {resolvedTheme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--color-text-primary)]">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-[var(--color-text-primary)]">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex items-center justify-center"
              aria-label="Menu"
            >
              <div className="space-y-1.5">
                <span
                  className={`block w-6 h-0.5 bg-[var(--color-espresso)] transition-all ${
                    mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-[var(--color-espresso)] transition-all ${
                    mobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-[var(--color-espresso)] transition-all ${
                    mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            <Link
              href="/kaffees"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-espresso)] transition-colors"
            >
              Kaffees
            </Link>
            <Link
              href="/regionen"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-espresso)] transition-colors"
            >
              Regionen
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-espresso)] transition-colors"
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
