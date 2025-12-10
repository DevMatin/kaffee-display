'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

function AdminLoginContent() {
  const params = useSearchParams();
  const hasError = params.get('error') === '1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="w-full max-w-sm space-y-6 p-8 bg-white border border-[var(--color-border)] rounded-3xl shadow-lg">
        <div>
          <p className="text-sm text-[var(--color-brown-light)] mb-1">Adminbereich</p>
          <h1 className="text-2xl font-semibold text-[var(--color-espresso)]">Bitte Passwort eingeben</h1>
        </div>
        {hasError && (
          <p className="text-sm text-red-600 bg-red-100 p-3 rounded-xl">
            Passwort falsch oder Sitzung abgelaufen. Bitte erneut versuchen.
          </p>
        )}
        <form action="/api/login" method="post" className="space-y-4">
          <label className="block text-sm text-[var(--color-espresso)]">
            <span className="mb-2 inline-block">Passwort</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              placeholder="••••••••••"
              className="w-full px-4 py-3 rounded-2xl border-2 border-[var(--color-beige)] bg-[var(--color-cream)] text-[var(--color-espresso)] focus:outline-none focus:border-[var(--color-brown-light)] transition"
            />
          </label>
          <Button type="submit" variant="primary" size="md" className="w-full">
            Einloggen
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginContent />
    </Suspense>
  );
}

