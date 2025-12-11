'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Link } from '@/lib/i18n-utils';
import type { Region } from '@/lib/types';

interface RegionCardProps {
  region: Region;
}

export function RegionCard({ region }: RegionCardProps) {
  return (
    <Link href={`/regionen/${region.id}`}>
      <Card className="h-full">
        {region.emblem_url && (
          <div className="relative w-16 h-16 mb-4">
            <Image
              src={region.emblem_url}
              alt={region.region_name}
              fill
              className="object-contain"
              sizes="64px"
            />
          </div>
        )}
        <h3 className="mb-2">{region.region_name}</h3>
        <p className="text-[var(--color-text-secondary)] text-sm mb-2">{region.country}</p>
        {region.description && (
          <p className="text-[var(--color-text-muted)] text-sm line-clamp-2">{region.description}</p>
        )}
      </Card>
    </Link>
  );
}


