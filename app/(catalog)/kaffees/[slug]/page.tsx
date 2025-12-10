import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SafeImage } from '@/components/ui/SafeImage';
import { AltitudeDisplay } from '@/components/catalog/AltitudeDisplay';
import { RegionMap } from '@/components/catalog/RegionMap';
import { FlavorWheelSection } from '@/components/catalog/FlavorWheelSection';
import { getCoffeeBySlug, getFlavorWheel } from '@/lib/queries';

export const revalidate = 3600; // ISR: 1h, unterstützt SW-Cache für Detailseiten

export default async function CoffeeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const coffee = await getCoffeeBySlug(slug);
  const flavorWheelData = await getFlavorWheel();

  if (!coffee) {
    notFound();
  }

  const roastColors: Record<string, string> = {
    light: 'var(--color-light-roast)',
    medium: 'var(--color-medium-roast)',
    dark: 'var(--color-dark-roast)',
  };

  const roastColor = coffee.roast_level ? roastColors[coffee.roast_level.toLowerCase()] : 'var(--color-brown)';

  const mainImage = coffee.image_url || coffee.images?.[0]?.image_url;
  const additionalImages = coffee.images?.filter((img) => img.image_url !== mainImage) || [];

  return (
    <PageContainer>
      <Link href="/kaffees">
        <Button variant="outline" size="sm" className="mb-6">
          ← Zurück zur Übersicht
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

          {coffee.roast_level && (
            <div className="mb-6">
              <span className="text-sm text-[var(--color-text-muted)] block mb-2">Röstgrad</span>
              <Badge
                color="primary"
                style={{
                  backgroundColor: roastColor,
                }}
              >
                {coffee.roast_level}
              </Badge>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {(() => {
              const regions = coffee.regions && coffee.regions.length > 0 ? coffee.regions : coffee.region ? [coffee.region] : [];
              if (regions.length === 0) return null;

              return (
                <>
                  <Card padding="md">
                    <span className="text-sm text-[var(--color-text-muted)] block mb-2">Regionen</span>
                    <RegionMap
                      regions={regions.map((r) => ({
                        latitude: r.latitude,
                        longitude: r.longitude,
                        regionName: r.region_name,
                        country: r.country,
                      }))}
                    />
                  </Card>

                  {regions.map((region, idx) => (
                    <Card key={region.id || idx} padding="md">
                      <Link
                        href={`/regionen/${region.id}`}
                        className="inline-flex items-center gap-2 text-[var(--color-text-primary)] hover:text-[var(--color-espresso)] transition-colors mb-4"
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
                          {region.region_name}, {region.country}
                        </span>
                      </Link>

                      {region.description && (
                        <p className="text-sm text-[var(--color-text-secondary)] mt-2">{region.description}</p>
                      )}
                    </Card>
                  ))}
                </>
              );
            })()}

            {coffee.altitude_min && coffee.altitude_max && (
              <AltitudeDisplay altitudeMin={coffee.altitude_min} altitudeMax={coffee.altitude_max} />
            )}

            {(coffee.processing_methods && coffee.processing_methods.length > 0
              ? coffee.processing_methods
              : coffee.processing_method
              ? [{ name: coffee.processing_method, description: null }]
              : []
            ).map((method: any, index: number) => (
              <Card key={index} padding="md">
                <span className="text-sm text-[var(--color-text-muted)] block mb-2">Verarbeitung</span>
                <p className="text-[var(--color-text-primary)] font-medium mb-2">{method.name}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {method.description ||
                    (method.name.toLowerCase().includes('gewaschen') &&
                      'Bei der gewaschenen Verarbeitung werden die Kaffeekirschen entpulpt und fermentiert, bevor die Bohnen getrocknet werden. Dies führt zu einem sauberen, klaren Geschmacksprofil.') ||
                    ((method.name.toLowerCase().includes('natürlich') ||
                      method.name.toLowerCase().includes('natural')) &&
                      'Bei der natürlichen Verarbeitung werden die Kaffeekirschen in der Sonne getrocknet, bevor die Bohnen entfernt werden. Dies verleiht dem Kaffee fruchtige, süße Noten.') ||
                    (method.name.toLowerCase().includes('honey') &&
                      'Bei der Honey-Verarbeitung wird ein Teil des Fruchtfleisches an der Bohne belassen, was zu einem ausgewogenen Geschmacksprofil zwischen gewaschen und natürlich führt.') ||
                    'Die Verarbeitungsmethode bestimmt maßgeblich das Geschmacksprofil des Kaffees und beeinflusst Süße, Körper und Komplexität.'}
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
                <span className="text-sm text-[var(--color-text-muted)] block mb-2">Varietät</span>
                <p className="text-[var(--color-text-primary)] font-medium mb-2">{varietal.name}</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {varietal.description ||
                    'Die Kaffeevarietät bestimmt die genetischen Eigenschaften der Pflanze und beeinflusst Geschmack, Ertrag und Widerstandsfähigkeit. Verschiedene Varietäten haben charakteristische Aromen und Eigenschaften.'}
                </p>
              </Card>
            ))}
          </div>

          {coffee.flavor_notes && coffee.flavor_notes.length > 0 && (
            <div className="mb-6">
              <span className="text-sm text-[var(--color-text-muted)] block mb-3">Geschmacksnoten</span>
              <div className="flex flex-wrap gap-2 mb-6">
                {coffee.flavor_notes.map((note) => (
                  <Badge key={note.id} color="secondary">
                    {note.name}
                  </Badge>
                ))}
              </div>
              <Card padding="md">
                <h3 className="text-lg font-semibold mb-4">Flavor Wheel</h3>
                <FlavorWheelSection
                  data={flavorWheelData}
                  highlightedNotes={coffee.flavor_notes.map((note) => note.name)}
                  highlightedNoteIds={coffee.flavor_notes.map((note) => note.id)}
                />
              </Card>
            </div>
          )}

          {coffee.brew_methods && coffee.brew_methods.length > 0 && (
            <div>
              <span className="text-sm text-[var(--color-text-muted)] block mb-3">Empfohlene Zubereitung</span>
              <div className="flex flex-wrap gap-2">
                {coffee.brew_methods.map((method) => (
                  <Badge key={method.id} color="accent">
                    {method.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {coffee.description && (
        <Card>
          <h2 className="mb-4">Beschreibung</h2>
          <p className="text-[var(--color-text-secondary)] whitespace-pre-line">{coffee.description}</p>
        </Card>
      )}
    </PageContainer>
  );
}

