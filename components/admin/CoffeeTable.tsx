'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SafeImage } from '@/components/ui/SafeImage';
import type { Coffee } from '@/lib/types';

interface CoffeeTableProps {
  coffees: Coffee[];
}

export function CoffeeTable({ coffees }: CoffeeTableProps) {
  return (
    <Card padding="lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[var(--color-beige)]">
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Bild</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Name</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Region</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Röstgrad</th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {coffees.map((coffee) => (
              <tr key={coffee.id} className="border-b border-[var(--color-beige)] hover:bg-[var(--color-beige-light)] transition-colors">
                <td className="py-4 px-4">
                  {coffee.image_url && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <SafeImage
                        src={coffee.image_url}
                        alt={coffee.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <Link
                    href={`/kaffees/${coffee.slug || coffee.id}`}
                    className="text-[var(--color-espresso)] hover:text-[var(--color-brown)] transition-colors font-medium"
                  >
                    {coffee.name}
                  </Link>
                </td>
                <td className="py-4 px-4 text-[var(--color-text-secondary)]">
                  {coffee.region ? `${coffee.region.region_name}, ${coffee.region.country}` : '-'}
                </td>
                <td className="py-4 px-4 text-[var(--color-text-secondary)]">{coffee.roast_level || '-'}</td>
                <td className="py-4 px-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/kaffees/${coffee.id}`}>
                      <Button variant="outline" size="sm">
                        Bearbeiten
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coffees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-secondary)]">Noch keine Kaffees vorhanden.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

