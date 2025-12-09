import { PageContainer } from '@/components/layout/PageContainer';
import { getRegions, getFlavorNotes, getBrewMethods } from '@/lib/queries';
import { CoffeeForm } from '@/components/admin/CoffeeForm';

export const revalidate = 0;

export default async function NewCoffeePage() {
  const [regions, flavorNotes, brewMethods] = await Promise.all([
    getRegions(),
    getFlavorNotes(),
    getBrewMethods(),
  ]);

  return (
    <PageContainer>
      <h1 className="mb-8">Neuer Kaffee</h1>
      <CoffeeForm regions={regions} flavorNotes={flavorNotes} brewMethods={brewMethods} />
    </PageContainer>
  );
}


