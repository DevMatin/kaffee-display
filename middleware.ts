import createMiddleware from 'next-intl/middleware';
import { defaultLocale, localePrefix, locales } from './i18n';

export default createMiddleware({
  defaultLocale,
  locales,
  localePrefix,
  alternateLinks: true,
});

export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*|favicon.ico|manifest.webmanifest|service-worker.js|admin|offline).*)',
  ],
};

