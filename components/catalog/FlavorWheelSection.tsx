'use client';

import dynamic from 'next/dynamic';
import type { FlavorWheelNode } from '@/lib/types';

const D3FlavorWheel = dynamic(() => import('./D3FlavorWheel').then((mod) => ({ default: mod.D3FlavorWheel })), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] flex items-center justify-center">Lade Flavor Wheel...</div>,
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

