'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

function AdminLoginContent() {
  const t = useTranslations('auth');
  const params = useSearchParams();
  const hasError = params.get('error') === '1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="w-full max-w-sm space-y-6 p-8 bg-white border border-[var(--color-border)] rounded-3xl shadow-lg">
        <div>
          <p className="text-sm text-[var(--color-brown-light)] mb-1">{t('adminArea')}</p>
          <h1 className="text-2xl font-semibold text-[var(--color-espresso)]">{t('enterPassword')}</h1>
        </div>
        {hasError && (
          <p className="text-sm text-red-600 bg-red-100 p-3 rounded-xl">
            {t('error')}
          </p>
        )}
        <form action="/api/login" method="post" className="space-y-4">
          <label className="block text-sm text-[var(--color-espresso)]">
            <span className="mb-2 inline-block">{t('password')}</span>
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
            {t('login')}
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

