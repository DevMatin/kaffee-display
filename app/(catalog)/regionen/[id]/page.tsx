import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CoffeeCard } from '@/components/catalog/CoffeeCard';
import { RegionMap } from '@/components/catalog/RegionMap';
import { getRegionById, getCoffees } from '@/lib/queries';

export default async function RegionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [region, allCoffees] = await Promise.all([getRegionById(id), getCoffees()]);

  if (!region) {
    notFound();
  }

  const regionCoffees = allCoffees.filter((coffee) => coffee.region_id === region.id);

  return (
    <PageContainer>
      <Link href="/regionen">
        <Button variant="outline" size="sm" className="mb-6">
          ← Zurück zu Regionen
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <Card>
            {region.emblem_url && (
              <div className="relative w-32 h-32 mx-auto mb-6">
                <Image
                  src={region.emblem_url}
                  alt={region.region_name}
                  fill
                  className="object-contain"
                  sizes="128px"
                />
              </div>
            )}
            <h1 className="mb-4 text-center">{region.region_name}</h1>
            <p className="text-[var(--color-text-secondary)] text-center mb-4">{region.country}</p>
            {region.description && (
              <p className="text-[var(--color-text-secondary)] whitespace-pre-line mb-4">{region.description}</p>
            )}
          </Card>

          <Card className="mt-4">
            <RegionMap
              latitude={region.latitude || undefined}
              longitude={region.longitude || undefined}
              regionName={region.region_name}
              country={region.country}
            />
          </Card>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-6">Kaffees aus dieser Region ({regionCoffees.length})</h2>
          {regionCoffees.length === 0 ? (
            <p className="text-[var(--color-text-secondary)]">Noch keine Kaffees aus dieser Region.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {regionCoffees.map((coffee) => (
                <CoffeeCard key={coffee.id} coffee={coffee} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}


