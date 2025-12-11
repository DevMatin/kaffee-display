import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { getRegions } from '@/lib/queries';
import { RegionCard } from '@/components/catalog/RegionCard';
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-dynamic';
export const prerender = false;

export default async function RegionenPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'region' });
  const regions = await getRegions(locale);

  return (
    <PageContainer>
      <h1 className="mb-8">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {regions.map((region) => (
          <RegionCard key={region.id} region={region} />
        ))}
      </div>
    </PageContainer>
  );
}

