'use client';

import { ResponsiveSunburst } from '@nivo/sunburst';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { FlavorWheelNode } from '@/lib/types';

interface FlavorWheelProps {
  data: FlavorWheelNode;
  highlightedNotes?: string[];
  highlightedNoteIds?: string[];
}

function hexToRgba(hex: string, alpha: number): string {
  if (!hex || !hex.startsWith('#')) return `rgba(200, 200, 200, ${alpha})`;
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getContrastColor(color: string): string {
  let r = 200, g = 200, b = 200;
  if (color.startsWith('#')) {
    const num = parseInt(color.replace('#', ''), 16);
    r = (num >> 16) & 255;
    g = (num >> 8) & 255;
    b = num & 255;
  } else if (color.startsWith('rgba')) {
    const parts = color
      .replace('rgba(', '')
      .replace(')', '')
      .split(',')
      .map((v) => parseFloat(v.trim()));
    if (parts.length >= 3) {
      [r, g, b] = parts;
    }
  } else if (color.startsWith('rgb')) {
    const parts = color
      .replace('rgb(', '')
      .replace(')', '')
      .split(',')
      .map((v) => parseFloat(v.trim()));
    if (parts.length >= 3) {
      [r, g, b] = parts;
    }
  }
  // relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1f2933' : '#ffffff';
}

const fallbackPalette: Record<string, string> = {
  Floral: '#FFB6C1',
  Fruity: '#FF6347',
  'Sour/Fermented': '#FFD700',
  'Green/Vegetative': '#32CD32',
  Other: '#87CEEB',
  Roasted: '#8B4513',
  Spices: '#CD853F',
  'Nutty/Cocoa': '#A0522D',
  Sweet: '#DEB887',
};

function findHighlightedPaths(
  node: FlavorWheelNode,
  highlightedNotes: string[],
  highlightedNoteIds: string[],
  path: string[] = []
): Set<string> {
  const result = new Set<string>();
  const currentPath = [...path, node.name];
  
  const isHighlighted =
    highlightedNotes.some((note) => note.toLowerCase() === node.name?.toLowerCase()) ||
    (node.id ? highlightedNoteIds.includes(node.id) : false);
  
  if (isHighlighted) {
    currentPath.forEach((p) => result.add(p.toLowerCase()));
  }
  
  if (node.children) {
    node.children.forEach((child) => {
      const childPaths = findHighlightedPaths(child, highlightedNotes, highlightedNoteIds, currentPath);
      childPaths.forEach((p) => result.add(p));
    });
  }
  
  return result;
}

function transformData(
  node: FlavorWheelNode,
  highlightedNotes: string[],
  highlightedPaths: Set<string>,
  hasHighlights: boolean,
  highlightedNoteIds: string[],
  parentColor?: string,
  level1Color?: string
): FlavorWheelNode {
  const baseColor = node.color || parentColor || level1Color || fallbackPalette[node.name] || '#cccccc';
  const currentLevel1Color = node.level === 1 ? baseColor : level1Color;
  
  const isHighlighted =
    highlightedNotes.some((note) => note.toLowerCase() === node.name?.toLowerCase()) ||
    (node.id ? highlightedNoteIds.includes(node.id) : false);
  const isOnHighlightPath = highlightedPaths.has(node.name?.toLowerCase() || '');
  
  let finalColor: string;
  let finalValue: number | undefined;
  
  if (!hasHighlights) {
    finalColor = hexToRgba(baseColor, 0.7);
    finalValue = node.children ? undefined : 1;
  } else if (isHighlighted) {
    finalColor = baseColor;
    finalValue = node.children ? undefined : 6;
  } else if (isOnHighlightPath) {
    finalColor = hexToRgba(baseColor, 0.8);
    finalValue = node.children ? undefined : 3;
  } else {
    finalColor = hexToRgba(baseColor, 0.25);
    finalValue = node.children ? undefined : 0.4;
  }
  
  if (node.children) {
    return {
      ...node,
      color: finalColor,
      labelVisible: node.level === 1 ? true : isHighlighted || isOnHighlightPath,
      children: node.children.map((child) =>
        transformData(child, highlightedNotes, highlightedPaths, hasHighlights, highlightedNoteIds, baseColor, currentLevel1Color)
      ),
    };
  }
  
  return {
    ...node,
    color: finalColor,
    labelVisible: isHighlighted || isOnHighlightPath,
    value: finalValue,
  };
}

export function FlavorWheel({ data, highlightedNotes = [], highlightedNoteIds = [] }: FlavorWheelProps) {
  const transformedData = useMemo(() => {
    const hasHighlights = highlightedNotes.length > 0 || highlightedNoteIds.length > 0;
    const highlightedPaths = hasHighlights
      ? findHighlightedPaths(data, highlightedNotes, highlightedNoteIds)
      : new Set<string>();
    
    return {
      ...data,
      children: data.children?.map((child) =>
        transformData(child, highlightedNotes, highlightedPaths, hasHighlights, highlightedNoteIds)
      ),
    };
  }, [data, highlightedNotes, highlightedNoteIds]);

  return (
    <div className="w-full h-[600px] relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        <ResponsiveSunburst
          data={transformedData}
          id="id"
          value="value"
          cornerRadius={2}
          borderWidth={1}
          borderColor="#ffffff"
          colors={(node: any) => node.data?.color || '#cccccc'}
          inheritColorFromParent={false}
          enableArcLabels={true}
          arcLabel={(node: any) => {
            if (node.depth === 1) {
              return node.data?.label || node.data?.name || '';
            }
            if (node.data?.labelVisible) {
              return node.data?.label || node.data?.name || '';
            }
            return '';
          }}
          arcLabelsSkipAngle={5}
          arcLabelsTextColor={(node: any) => getContrastColor(node.data?.color || '#cccccc')}
          arcLabelsRadiusOffset={0.5}
          tooltip={(node) => {
            const nodeNameRaw =
              node.data?.name ||
              node.data?.label ||
              node.id ||
              '';
            const nodeName = typeof nodeNameRaw === 'string' ? nodeNameRaw : String(nodeNameRaw);
            
            const isHighlighted = highlightedNotes.some(
              (note) => note.toLowerCase() === nodeName.toLowerCase()
            );
            const pathNodes = (node as any).path || [];
            const pathNames = pathNodes
              .map((a: any) => a.data?.name || a.id)
              .filter((n: string) => !!n && n !== 'Flavor Wheel');
            
            if (!nodeName) return null;
            
            return (
              <div
                style={{
                  background: 'white',
                  padding: '10px 14px',
                  border: `2px solid ${isHighlighted ? '#16a34a' : '#ccc'}`,
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  fontSize: '14px',
                  minWidth: '120px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ color: isHighlighted ? '#16a34a' : '#333' }}>
                    {nodeName}
                  </strong>
                  {isHighlighted && (
                    <span style={{ color: '#16a34a', fontSize: '16px' }}>✓</span>
                  )}
                </div>
                {pathNames.length > 1 && (
                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '12px',
                      color: '#666',
                      lineHeight: 1.35,
                    }}
                  >
                    Pfad: {pathNames.join(' → ')}
                  </div>
                )}
              </div>
            );
          }}
          animate={true}
          motionConfig="gentle"
          isInteractive={true}
          layers={['arcs', 'arcLabels']}
        />
      </motion.div>
      
      {highlightedNotes.length > 0 && (
        <div className="mt-4 text-sm text-[var(--color-text-muted)]">
          Hervorgehobene Noten: {highlightedNotes.join(', ')}
        </div>
      )}
    </div>
  );
}
