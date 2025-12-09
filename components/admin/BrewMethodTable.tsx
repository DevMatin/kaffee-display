'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { BrewMethod } from '@/lib/types';

interface BrewMethodTableProps {
  brewMethods: BrewMethod[];
}

export function BrewMethodTable({ brewMethods }: BrewMethodTableProps) {
  return (
    <Card padding="lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[var(--color-beige)]">
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Name</th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {brewMethods.map((method) => (
              <tr
                key={method.id}
                className="border-b border-[var(--color-beige)] hover:bg-[var(--color-beige-light)] transition-colors"
              >
                <td className="py-4 px-4 text-[var(--color-text-primary)]">{method.name}</td>
                <td className="py-4 px-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/zubereitungen/${method.id}`}>
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
        {brewMethods.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-secondary)]">Noch keine Zubereitungen vorhanden.</p>
          </div>
        )}
      </div>
    </Card>
  );
}


