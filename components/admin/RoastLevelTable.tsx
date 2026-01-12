'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { RoastLevel } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface RoastLevelTableProps {
  roastLevels: RoastLevel[];
}

export function RoastLevelTable({ roastLevels }: RoastLevelTableProps) {
  const t = useTranslations('admin');
  return (
    <Card padding="lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[var(--color-beige)]">
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">{t('tables.name')}</th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">{t('tables.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {roastLevels.map((level) => (
              <tr
                key={level.id}
                className="border-b border-[var(--color-beige)] hover:bg-[var(--color-beige-light)] transition-colors"
              >
                <td className="py-4 px-4 text-[var(--color-text-primary)]">{level.name}</td>
                <td className="py-4 px-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/roestgrade/${level.id}`}>
                      <Button variant="outline" size="sm">
                        {t('edit')}
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {roastLevels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-secondary)]">Noch keine Röstgrade vorhanden.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
