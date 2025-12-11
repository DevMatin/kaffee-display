import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CoffeeCard } from '@/components/catalog/CoffeeCard';
import { RegionMap } from '@/components/catalog/RegionMap';
import { getRegionById, getCoffees } from '@/lib/queries';
import { Link } from '@/lib/i18n-utils';
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-dynamic';
export const prerender = false;

export default async function RegionDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const [region, allCoffees, tCommon] = await Promise.all([
    getRegionById(id, locale),
    getCoffees(locale),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  if (!region) {
    notFound();
  }

  const regionCoffees = allCoffees.filter((coffee) => coffee.region_id === region.id);

  return (
    <PageContainer>
      <Link href="/regionen">
        <Button variant="outline" size="sm" className="mb-6">
          ← {tCommon('back')}
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <Card>
            {region.emblem_url && (
              <div className="relative w-32 h-32 mx-auto mb-6">
                <Image src={region.emblem_url} alt={region.region_name} fill className="object-contain" sizes="128px" />
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

