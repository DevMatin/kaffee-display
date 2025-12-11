'use client';

import { useLocale } from 'next-intl';
import { usePathname } from '@/lib/i18n-utils';
import type { Locale } from '@/i18n';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  
  const deHref = `/de${pathname}`;
  const enHref = `/en${pathname}`;

  return (
    <div className={className}>
      <a
        href={deHref}
        className={`px-3 py-1 rounded-md ${locale === 'de' ? 'bg-[var(--color-hover)]' : ''}`}
        aria-label="Deutsch"
      >
        DE
      </a>
      <a
        href={enHref}
        className={`px-3 py-1 rounded-md ml-2 ${locale === 'en' ? 'bg-[var(--color-hover)]' : ''}`}
        aria-label="English"
      >
        EN
      </a>
    </div>
  );
}

