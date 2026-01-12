'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Region, BrewMethod } from '@/lib/types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (value: string) => void;
  selectedRoast: string;
  onRoastChange: (value: string) => void;
  selectedBrewMethod: string;
  onBrewMethodChange: (value: string) => void;
  regions: Region[];
  brewMethods: BrewMethod[];
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedRoast,
  onRoastChange,
  selectedBrewMethod,
  onBrewMethodChange,
  regions,
  brewMethods,
}: FilterBarProps) {
  const t = useTranslations('filter');

  const roastOptions = [
    { value: '', label: t('allRoasts') },
    { value: 'light', label: t('light') },
    { value: 'medium', label: t('medium') },
    { value: 'dark', label: t('dark') },
  ];

  const regionOptions = [
    { value: '', label: t('allRegions') },
    ...regions.map((r) => ({ value: r.id, label: `${r.region_name}, ${r.country}` })),
  ];

  const brewMethodOptions = [
    { value: '', label: t('allBrewMethods') },
    ...brewMethods.map((bm) => ({ value: bm.id, label: bm.name })),
  ];

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-6 shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label={t('search')}
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t('searchPlaceholder')}
        />
        <Select
          label={t('region')}
          value={selectedRegion}
          onChange={onRegionChange}
          options={regionOptions}
        />
        <Select
          label={t('roast')}
          value={selectedRoast}
          onChange={onRoastChange}
          options={roastOptions}
        />
        <Select
          label={t('brewMethod')}
          value={selectedBrewMethod}
          onChange={onBrewMethodChange}
          options={brewMethodOptions}
        />
      </div>
    </div>
  );
}


