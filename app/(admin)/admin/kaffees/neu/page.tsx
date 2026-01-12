import { PageContainer } from '@/components/layout/PageContainer';
import { getRegions, getFlavorCategories, getBrewMethods, getRoastLevels } from '@/lib/queries';
import { CoffeeForm } from '@/components/admin/CoffeeForm';
import { getTranslations } from 'next-intl/server';

export const revalidate = 0;

export default async function NewCoffeePage() {
  const t = await getTranslations('admin');
  const [regions, flavorCategories, brewMethods, roastLevelsResult] = await Promise.all([
    getRegions(),
    getFlavorCategories(),
    getBrewMethods(),
    getRoastLevels().catch(() => []),
  ]);
  const roastLevels = Array.isArray(roastLevelsResult) ? roastLevelsResult : [];

  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.newCoffee')}</h1>
      <CoffeeForm regions={regions} flavorCategories={flavorCategories} brewMethods={brewMethods} roastLevels={roastLevels} />
    </PageContainer>
  );
}


