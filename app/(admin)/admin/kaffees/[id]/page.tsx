import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getCoffeeById, getRegions, getFlavorNotes, getBrewMethods } from '@/lib/queries';
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

  const [regions, flavorNotes, brewMethods] = await Promise.all([
    getRegions(),
    getFlavorNotes(),
    getBrewMethods(),
  ]);

  return (
    <PageContainer>
      <h1 className="mb-8">{t('pages.editCoffee')}</h1>
      <CoffeeForm coffee={coffee} regions={regions} flavorNotes={flavorNotes} brewMethods={brewMethods} />
    </PageContainer>
  );
}

