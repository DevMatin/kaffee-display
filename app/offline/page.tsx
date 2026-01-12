import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { defaultLocale } from '@/i18n';
import { OfflinePageContent } from './OfflinePageContent';

export const dynamic = 'force-dynamic';

export default async function OfflinePage() {
  const locale = defaultLocale;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <OfflinePageContent />
    </NextIntlClientProvider>
  );
}

