import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getCoffeeById, getRegions, getFlavorCategories, getBrewMethods, getRoastLevels } from '@/lib/queries';
import { CoffeeForm } from '@/components/admin/CoffeeForm';
import { getTranslations } from 'next-intl/server';

export const revalidate = 0;

export default async function EditCoffeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('admin');
  const coffee = await getCoffeeById(id);
  if (!coffee) {
    notFound();
  }

  const [regions, flavorCategories, brewMethods, roastLevelsResult] = await Promise.all([
    getRegions(),
    getFlavorCategories(),
    getBrewMethods(),
    getRoastLevels().catch(() => []),
  ]);
  const roastLevels = Array.isArray(roastLevelsResult) ? roastLevelsResult : [];

  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.editCoffee')}</h1>
      <CoffeeForm coffee={coffee} regions={regions} flavorCategories={flavorCategories} brewMethods={brewMethods} roastLevels={roastLevels} />
    </PageContainer>
  );
}

