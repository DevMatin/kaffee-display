import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { CoffeeCard } from '@/components/catalog/CoffeeCard';
import { FilterBar } from '@/components/catalog/FilterBar';
import { getCoffees, getRegions, getBrewMethods } from '@/lib/queries';
import { CoffeeListClient } from '@/components/catalog/CoffeeListClient';
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-dynamic';
export const prerender = false;

export const revalidate = 3600;

export default async function KaffeesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'navigation' });

  const [coffees, regions, brewMethods] = await Promise.all([
    getCoffees(locale),
    getRegions(locale),
    getBrewMethods(locale),
  ]);

  return (
    <PageContainer>
      <h1 className="mb-8">{t('coffees')}</h1>
      <CoffeeListClient initialCoffees={coffees} regions={regions} brewMethods={brewMethods} />
    </PageContainer>
  );
}

