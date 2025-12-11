import { createNavigation } from 'next-intl/navigation';
import { defaultLocale, isLocale, type Locale, locales, localePrefix } from '@/i18n';

export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ locales, localePrefix });

export function getLocalizedPath(path: string, locale: Locale): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${normalized === '/' ? '' : normalized}`;
}

export function getAlternateLocale(current: Locale): Locale {
  return current === 'de' ? 'en' : 'de';
}

export function normalizeLocale(input?: string | null): Locale {
  if (input && isLocale(input)) return input;
  return defaultLocale;
}

export function getSupportedLocales(): Locale[] {
  return [...locales];
}

