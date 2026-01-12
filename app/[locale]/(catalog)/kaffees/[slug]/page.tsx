import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { AltitudeDisplay } from '@/components/catalog/AltitudeDisplay';
import { RegionMap } from '@/components/catalog/RegionMap';
import { FlavorWheelSection } from '@/components/catalog/FlavorWheelSection';
import { getCoffeeBySlug, getFlavorWheel } from '@/lib/queries';
import { Link } from '@/lib/i18n-utils';
import { locales } from '@/i18n';

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const dynamic = 'force-dynamic';
export const prerender = false;

export default async function CoffeeDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const coffee = await getCoffeeBySlug(slug, locale);
  const flavorWheelData = await getFlavorWheel(locale);
  const t = await getTranslations({ locale, namespace: 'coffee' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const filterT = await getTranslations({ locale, namespace: 'filter' });
  const detailT = await getTranslations({ locale, namespace: 'coffeeDetail' });

  if (!coffee) {
    notFound();
  }

  const roastColors: Record<string, string> = {
    light: 'var(--color-light-roast)',
    medium: 'var(--color-medium-roast)',
    dark: 'var(--color-dark-roast)',
  };

  const roastLevelName = coffee.roast_level_obj?.name || (typeof coffee.roast_level === 'string' ? coffee.roast_level : coffee.roast_level_old || '');
  const roastLevelKey = coffee.roast_level_obj?.name?.toLowerCase() || (typeof coffee.roast_level === 'string' ? coffee.roast_level.toLowerCase() : coffee.roast_level_old?.toLowerCase() || '');
  
  const roastColor = roastLevelKey ? roastColors[roastLevelKey] : 'var(--color-brown)';
  
  const getRoastLabel = (roastLevel: string) => {
    if (!roastLevel) return '';
    const key = roastLevel.toLowerCase();
    if (key === 'light' || key === 'medium' || key === 'dark') {
      return filterT(key);
    }
    return roastLevel;
  };

  const mainImage = coffee.image_url || coffee.images?.[0]?.image_url;
  const additionalImages = coffee.images?.filter((img) => img.image_url !== mainImage) || [];

  return (
    <PageContainer>
      <Link href="/kaffees">
        <Button variant="outline" size="sm" className="mb-6">
          ← {common('back')}
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          {mainImage && (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4">
              <SafeImage
                src={mainImage}
                alt={coffee.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={mainImage.includes('amir-kaffeemann.de') || mainImage.includes('example.com')}
              />
            </div>
          )}
          {additionalImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {additionalImages.slice(0, 4).map((img) => (
                <div key={img.id} className="relative w-full aspect-square rounded-lg overflow-hidden">
                  <SafeImage
                    src={img.image_url}
                    alt={img.alt || coffee.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 25vw, 12.5vw"
                    unoptimized={img.image_url.includes('amir-kaffeemann.de') || img.image_url.includes('example.com')}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="mb-4">{coffee.name}</h1>
          {coffee.short_description && (
            <p className="text-[var(--color-text-secondary)] mb-6">{coffee.short_description}</p>
          )}

          {(coffee.roast_level_obj || coffee.roast_level) && (
            <Card padding="md" className="mb-6">
              <span className="text-sm text-[var(--color-text-muted)] block mb-2">{t('roastLevel')}</span>
              <span className="font-medium">
                {coffee.roast_level_obj?.name || getRoastLabel(coffee.roast_level || '')}
              </span>
              {coffee.roast_level_obj?.description && (
                <p className="text-sm text-[var(--color-text-secondary)] mt-4">
                  {coffee.roast_level_obj.description}
                </p>
              )}
              {!coffee.roast_level_obj?.description && roastLevelKey && (() => {
                let roastExplanation = '';
                if (roastLevelKey === 'light') roastExplanation = detailT('roastLight');
                else if (roastLevelKey === 'medium') roastExplanation = detailT('roastMedium');
                else if (roastLevelKey === 'dark') roastExplanation = detailT('roastDark');
                else roastExplanation = detailT('roastGeneric');
                
                return (
                  <p className="text-sm text-[var(--color-text-secondary)] mt-4">
                    {roastExplanation}
                  </p>
                );
              })()}
            </Card>
          )}

          <div className="space-y-4 mb-6">
            {(() => {
              const regions = coffee.regions && coffee.regions.length > 0 ? coffee.regions : coffee.region ? [coffee.region] : [];
              if (regions.length === 0) return null;

              return (
                <Card padding="md">
                  <span className="text-sm text-[var(--color-text-muted)] block mb-2">{t('region')}</span>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {regions.map((region, idx) => (
                      <span key={region.id || idx} className="inline-flex items-center gap-2">
                        <Link
                          href={`/regionen/${region.id}`}
                          className="inline-flex items-center gap-2 text-[var(--color-text-primary)] hover:text-[var(--color-espresso)] transition-colors"
                        >
                          {region.emblem_url && (
                            <SafeImage
                              src={region.emblem_url}
                              alt={region.region_name}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          )}
                          <span className="font-medium">
                            {region.region_name}
                          </span>
                        </Link>
                        {idx < regions.length - 1 && <span className="text-[var(--color-text-muted)]">,</span>}
                      </span>
                    ))}
                  </div>

                  <RegionMap
                    regions={regions.map((r) => ({
                      latitude: r.latitude,
                      longitude: r.longitude,
                      regionName: r.region_name,
                      country: r.country,
                    }))}
                  />
                </Card>
              );
            })()}

            {coffee.altitude_min && coffee.altitude_max && (
              <AltitudeDisplay altitudeMin={coffee.altitude_min} altitudeMax={coffee.altitude_max} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(coffee.processing_methods && coffee.processing_methods.length > 0
                ? coffee.processing_methods
                : coffee.processing_method
                ? [{ name: coffee.processing_method, description: null }]
                : []
              ).map((method: any, index: number) => (
                <Card key={index} padding="md">
                  <span className="text-sm text-[var(--color-text-muted)] block mb-2">{detailT('processing')}</span>
                  <p className="text-[var(--color-text-primary)] font-medium mb-2">{method.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {method.description ||
                      (method.name.toLowerCase().includes('gewaschen') && detailT('processingWashed')) ||
                      ((method.name.toLowerCase().includes('natürlich') ||
                        method.name.toLowerCase().includes('natural')) &&
                        detailT('processingNatural')) ||
                      (method.name.toLowerCase().includes('honey') && detailT('processingHoney')) ||
                      detailT('processingGeneric')}
                  </p>
                </Card>
              ))}

              {(coffee.varietals && coffee.varietals.length > 0
                ? coffee.varietals
                : coffee.varietal
                ? coffee.varietal.split(',').map((v: string) => ({ name: v.trim(), description: null }))
                : []
              ).map((varietal: any, index: number) => (
                <Card key={index} padding="md">
                  <span className="text-sm text-[var(--color-text-muted)] block mb-2">{detailT('varietal')}</span>
                  <p className="text-[var(--color-text-primary)] font-medium mb-2">{varietal.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {varietal.description || detailT('processingGeneric')}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {coffee.flavor_categories && coffee.flavor_categories.length > 0 && (
            <Card padding="md" className="mb-6">
              <span className="text-sm text-[var(--color-text-muted)] block mb-3">{detailT('flavorNotes')}</span>
              <div className="flex flex-wrap gap-2 mb-6">
                {coffee.flavor_categories.map((category) => (
                  <Badge key={category.id} color="secondary">
                    {category.name}
                  </Badge>
                ))}
              </div>
              <FlavorWheelSection
                data={flavorWheelData}
                highlightedNotes={coffee.flavor_categories.map((category) => category.name)}
                highlightedNoteIds={coffee.flavor_categories.map((category) => category.id)}
              />
            </Card>
          )}

          {coffee.brew_methods && coffee.brew_methods.length > 0 && (
            <Card padding="md">
              <span className="text-sm text-[var(--color-text-muted)] block mb-2">{detailT('recommendedBrew')}</span>
              <div className="flex flex-wrap gap-2">
                {coffee.brew_methods.map((method) => (
                  <Badge key={method.id} color="accent">
                    {method.name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {coffee.description && (
        <Card>
          <h2 className="mb-4">{detailT('description')}</h2>
          <p className="text-[var(--color-text-secondary)] whitespace-pre-line">{coffee.description}</p>
        </Card>
      )}
    </PageContainer>
  );
}

