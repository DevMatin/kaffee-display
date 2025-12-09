'use client';

import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Region, FlavorNote, BrewMethod } from '@/lib/types';

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
  const roastOptions = [
    { value: '', label: 'Alle Röstgrade' },
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'dark', label: 'Dark' },
  ];

  const regionOptions = [
    { value: '', label: 'Alle Regionen' },
    ...regions.map((r) => ({ value: r.id, label: `${r.region_name}, ${r.country}` })),
  ];

  const brewMethodOptions = [
    { value: '', label: 'Alle Zubereitungen' },
    ...brewMethods.map((bm) => ({ value: bm.id, label: bm.name })),
  ];

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-6 shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Suche"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Kaffee suchen..."
        />
        <Select
          label="Region"
          value={selectedRegion}
          onChange={onRegionChange}
          options={regionOptions}
        />
        <Select
          label="Röstgrad"
          value={selectedRoast}
          onChange={onRoastChange}
          options={roastOptions}
        />
        <Select
          label="Zubereitung"
          value={selectedBrewMethod}
          onChange={onBrewMethodChange}
          options={brewMethodOptions}
        />
      </div>
    </div>
  );
}


