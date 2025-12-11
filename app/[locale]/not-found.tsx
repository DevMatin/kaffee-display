import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Link } from '@/lib/i18n-utils';
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-dynamic';
export const prerender = false;

export default async function NotFound() {
  const t = await getTranslations('notFound');
  const common = await getTranslations('common');

  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card padding="lg" className="text-center max-w-md">
          <h1 className="mb-4">404</h1>
          <p className="text-[var(--color-text-secondary)] mb-8">{t('message')}</p>
          <Link href="/">
            <Button>{common('back')}</Button>
          </Link>
        </Card>
      </div>
    </PageContainer>
  );
}

