import { notFound } from 'next/navigation';
import { PageContainer } from '@/components/layout/PageContainer';
import { getCoffeeById, getRegions, getFlavorNotes, getBrewMethods } from '@/lib/queries';
import { CoffeeForm } from '@/components/admin/CoffeeForm';

export const revalidate = 0;

export default async function EditCoffeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
      <h1 className="mb-8">Kaffee bearbeiten</h1>
      <CoffeeForm coffee={coffee} regions={regions} flavorNotes={flavorNotes} brewMethods={brewMethods} />
    </PageContainer>
  );
}

