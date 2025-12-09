import { PageContainer } from '@/components/layout/PageContainer';
import { getRegions } from '@/lib/queries';
import { RegionCard } from '@/components/catalog/RegionCard';

export default async function RegionenPage() {
  const regions = await getRegions();

  const countries = Array.from(new Set(regions.map((r) => r.country))).sort();

  return (
    <PageContainer>
      <h1 className="mb-8">Regionen</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {regions.map((region) => (
          <RegionCard key={region.id} region={region} />
        ))}
      </div>
    </PageContainer>
  );
}


