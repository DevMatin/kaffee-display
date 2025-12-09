import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getCoffees, getRegions, getFlavorNotes, getBrewMethods } from '@/lib/queries';

export default async function AdminDashboard() {
  const [coffees, regions, flavorNotes, brewMethods] = await Promise.all([
    getCoffees(),
    getRegions(),
    getFlavorNotes(),
    getBrewMethods(),
  ]);

  const stats = [
    { label: 'Kaffees', count: coffees.length, href: '/admin/kaffees', icon: '☕' },
    { label: 'Regionen', count: regions.length, href: '/admin/regionen', icon: '🌍' },
    { label: 'Aromen', count: flavorNotes.length, href: '/admin/aromen', icon: '🌸' },
    { label: 'Zubereitungen', count: brewMethods.length, href: '/admin/zubereitungen', icon: '🍵' },
  ];

  return (
    <PageContainer>
      <h1 className="mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.href} padding="lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-3xl font-semibold text-[var(--color-espresso)]">{stat.count}</span>
            </div>
            <h3 className="mb-4">{stat.label}</h3>
            <Link href={stat.href}>
              <Button variant="outline" size="sm" className="w-full">
                Verwalten
              </Button>
            </Link>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="mb-4">Schnellzugriff</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/kaffees/neu">
            <Button>Neuer Kaffee</Button>
          </Link>
          <Link href="/admin/regionen">
            <Button variant="secondary">Neue Region</Button>
          </Link>
        </div>
      </Card>
    </PageContainer>
  );
}


