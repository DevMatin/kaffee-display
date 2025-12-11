'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SafeImage } from '@/components/ui/SafeImage';
import { Link } from '@/lib/i18n-utils';
import type { Coffee } from '@/lib/types';

interface CoffeeCardProps {
  coffee: Coffee;
}

export function CoffeeCard({ coffee }: CoffeeCardProps) {
  const t = useTranslations('common');
  const filterT = useTranslations('filter');
  const roastColors: Record<string, string> = {
    light: 'var(--color-light-roast)',
    medium: 'var(--color-medium-roast)',
    dark: 'var(--color-dark-roast)',
  };

  const roastColor = coffee.roast_level ? roastColors[coffee.roast_level.toLowerCase()] : 'var(--color-brown)';
  
  const getRoastLabel = (roastLevel: string) => {
    const key = roastLevel.toLowerCase();
    if (key === 'light' || key === 'medium' || key === 'dark') {
      return filterT(key);
    }
    return roastLevel;
  };

  return (
    <Link href={`/kaffees/${coffee.slug || coffee.id}`}>
      <Card className="h-full">
        {coffee.image_url ? (
          <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden">
            <SafeImage
              src={coffee.image_url}
              alt={coffee.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ) : (
          <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-[var(--color-beige-light)] flex items-center justify-center">
            <span className="text-[var(--color-text-muted)] text-sm">{t('noImage')}</span>
          </div>
        )}
        <h3 className="mb-2">{coffee.name}</h3>
        {coffee.short_description && (
          <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">
            {coffee.short_description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 items-center">
          {coffee.roast_level && (
            <Badge
              color="primary"
              style={{
                backgroundColor: roastColor,
              }}
            >
              {getRoastLabel(coffee.roast_level)}
            </Badge>
          )}
          {coffee.region && (
            <span className="text-sm text-[var(--color-text-muted)]">
              {coffee.region.region_name}, {coffee.region.country}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}

