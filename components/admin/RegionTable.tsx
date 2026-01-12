'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Region } from '@/lib/types';

interface RegionTableProps {
  regions: Region[];
}

export function RegionTable({ regions }: RegionTableProps) {
  const t = useTranslations('admin');
  
  return (
    <Card padding="lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[var(--color-beige)]">
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">{t('country')}</th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">{t('region')}</th>
              <th className="text-right py-4 px-4 text-sm font-semibold text-[var(--color-text-muted)]">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr
                key={region.id}
                className="border-b border-[var(--color-beige)] hover:bg-[var(--color-beige-light)] transition-colors"
              >
                <td className="py-4 px-4 text-[var(--color-text-primary)]">{region.country}</td>
                <td className="py-4 px-4 text-[var(--color-text-primary)]">{region.region_name}</td>
                <td className="py-4 px-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/regionen/${region.id}`}>
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
        {regions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[var(--color-text-secondary)]">{t('noData')}</p>
          </div>
        )}
      </div>
    </Card>
  );
}


