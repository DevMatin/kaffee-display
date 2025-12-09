import { PageContainer } from '@/components/layout/PageContainer';
import { CoffeeCard } from '@/components/catalog/CoffeeCard';
import { FilterBar } from '@/components/catalog/FilterBar';
import { getCoffees, getRegions, getBrewMethods } from '@/lib/queries';
import { CoffeeListClient } from '@/components/catalog/CoffeeListClient';

export const revalidate = 0; // Kein Caching für diese Seite

export default async function KaffeesPage() {
  const [coffees, regions, brewMethods] = await Promise.all([
    getCoffees(),
    getRegions(),
    getBrewMethods(),
  ]);

  return (
    <PageContainer>
      <h1 className="mb-8">Kaffees</h1>
      <CoffeeListClient
        initialCoffees={coffees}
        regions={regions}
        brewMethods={brewMethods}
      />
    </PageContainer>
  );
}

