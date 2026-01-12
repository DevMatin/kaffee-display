import { PageContainer } from '@/components/layout/PageContainer';
import { getRegions, getFlavorNotes, getBrewMethods } from '@/lib/queries';
import { CoffeeForm } from '@/components/admin/CoffeeForm';
import { getTranslations } from 'next-intl/server';

export const revalidate = 0;

export default async function NewCoffeePage() {
  const t = await getTranslations('admin');
  const [regions, flavorNotes, brewMethods] = await Promise.all([
    getRegions(),
    getFlavorNotes(),
    getBrewMethods(),
  ]);

  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.newCoffee')}</h1>
      <CoffeeForm regions={regions} flavorNotes={flavorNotes} brewMethods={brewMethods} />
    </PageContainer>
  );
}


