'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CoffeeCard } from './CoffeeCard';
import { FilterBar } from './FilterBar';
import { CoffeeChat } from './CoffeeChat';
import type { Coffee, Region, BrewMethod } from '@/lib/types';

interface CoffeeListClientProps {
  initialCoffees: Coffee[];
  regions: Region[];
  brewMethods: BrewMethod[];
}

export function CoffeeListClient({ initialCoffees, regions, brewMethods }: CoffeeListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedRoast, setSelectedRoast] = useState('');
  const [selectedBrewMethod, setSelectedBrewMethod] = useState('');
  const [recommended, setRecommended] = useState<Coffee[]>([]);
  const t = useTranslations('coffee');

  const filteredCoffees = useMemo(() => {
    let filtered = [...initialCoffees];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (coffee) =>
          coffee.name.toLowerCase().includes(query) ||
          coffee.short_description?.toLowerCase().includes(query) ||
          coffee.description?.toLowerCase().includes(query)
      );
    }

    if (selectedRegion) {
      filtered = filtered.filter((coffee) => coffee.region_id === selectedRegion);
    }

    if (selectedRoast) {
      filtered = filtered.filter(
        (coffee) => coffee.roast_level?.toLowerCase() === selectedRoast.toLowerCase()
      );
    }

    if (selectedBrewMethod) {
      filtered = filtered.filter((coffee) =>
        coffee.brew_methods?.some((bm) => bm.id === selectedBrewMethod)
      );
    }

    return filtered;
  }, [initialCoffees, searchQuery, selectedRegion, selectedRoast, selectedBrewMethod]);

  function handleRecommendations(slugs: string[]) {
    if (!slugs || slugs.length === 0) {
      setRecommended([]);
      return;
    }
    const found = initialCoffees.filter((c) => c.slug && slugs.includes(c.slug));
    setRecommended(found);
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:items-start" id="coffee-grid">
        <div className="space-y-6">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            selectedRoast={selectedRoast}
            onRoastChange={setSelectedRoast}
            selectedBrewMethod={selectedBrewMethod}
            onBrewMethodChange={setSelectedBrewMethod}
            regions={regions}
            brewMethods={brewMethods}
          />

          {recommended.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--color-espresso)]">{t('recommended')}</h3>
                <button
                  type="button"
                  onClick={() => setRecommended([])}
                  className="text-sm text-[var(--color-brown)] underline"
                >
                  {t('reset')}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommended.map((coffee) => (
                  <CoffeeCard key={coffee.id} coffee={coffee} />
                ))}
              </div>
            </div>
          )}

          {filteredCoffees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--color-text-secondary)]">{t('noneFound')}</p>
            </div>
          ) : (
            <>
              {filteredCoffees.length >= 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredCoffees.slice(0, 2).map((coffee) => (
                    <CoffeeCard key={coffee.id} coffee={coffee} />
                  ))}
                </div>
              )}
              {filteredCoffees.length === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {filteredCoffees.map((coffee) => (
                    <CoffeeCard key={coffee.id} coffee={coffee} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex h-full">
          <CoffeeChat
            preferences={{
              regionId: selectedRegion || undefined,
              roastLevel: selectedRoast || undefined,
              brewMethodId: selectedBrewMethod || undefined,
            }}
            onRecommendations={handleRecommendations}
          />
        </div>
      </div>

      {filteredCoffees.length > 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {filteredCoffees.slice(2).map((coffee) => (
            <CoffeeCard key={coffee.id} coffee={coffee} />
          ))}
        </div>
      )}
    </>
  );
}


