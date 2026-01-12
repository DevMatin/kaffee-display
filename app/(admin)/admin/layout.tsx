import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ADMIN_AUTH_COOKIE, isValidAdminToken } from '@/lib/admin-auth';
import { defaultLocale } from '@/i18n';

async function getLocale() {
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  return acceptLanguage.startsWith('en') ? 'en' : defaultLocale;
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.ADMIN_PASSWORD) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-semibold text-[var(--color-espresso)]">
            Konfigurationsfehler
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Der Admin-Bereich ist nicht konfiguriert. Bitte setze die ADMIN_PASSWORD Environment Variable.
          </p>
        </div>
      </div>
    );
  }

  const token = (await cookies()).get(ADMIN_AUTH_COOKIE.name)?.value;
  if (!isValidAdminToken(token)) {
    redirect('/admin/login');
  }

  const locale = await getLocale();
  const messages = await getMessages({ locale });
  
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 bg-[var(--color-background)]">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


