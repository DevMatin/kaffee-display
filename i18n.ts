import { getRequestConfig } from 'next-intl/server';

export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'de';
export const localePrefix = 'always' as const;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export default getRequestConfig(async ({ locale }) => ({
  locale: locale ?? defaultLocale,
  messages: (await import(`./messages/${locale ?? defaultLocale}.json`)).default,
}));

