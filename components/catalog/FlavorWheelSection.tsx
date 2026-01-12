'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import type { FlavorWheelNode } from '@/lib/types';

function FlavorWheelLoading() {
  const misc = useTranslations('misc');
  return <div className="w-full h-[600px] flex items-center justify-center">{misc('loadingFlavorWheel')}</div>;
}

const D3FlavorWheel = dynamic(() => import('./D3FlavorWheel').then((mod) => ({ default: mod.D3FlavorWheel })), {
  ssr: false,
  loading: () => <FlavorWheelLoading />,
});

interface FlavorWheelSectionProps {
  data: FlavorWheelNode;
  highlightedNotes?: string[];
  highlightedNoteIds?: string[];
}

export function FlavorWheelSection({ 
  data, 
  highlightedNotes = [],
  highlightedNoteIds = [],
}: FlavorWheelSectionProps) {
  return (
    <D3FlavorWheel 
      data={data} 
      highlightedNotes={highlightedNotes}
      highlightedNoteIds={highlightedNoteIds}
    />
  );
}

