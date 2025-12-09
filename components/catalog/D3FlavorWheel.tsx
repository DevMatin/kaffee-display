'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import type { FlavorWheelNode } from '@/lib/types';

interface D3FlavorWheelProps {
  data: FlavorWheelNode;
  highlightedNotes?: string[];
  highlightedNoteIds?: string[];
  width?: number;
  height?: number;
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
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1f2933' : '#ffffff';
}

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
      labelVisible: isHighlighted || isOnHighlightPath,
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

export function D3FlavorWheel({
  data,
  highlightedNotes = [],
  highlightedNoteIds = [],
  width: propWidth = 800,
  height: propHeight = 800,
}: D3FlavorWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: propWidth, height: propHeight });
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; content: string; visible: boolean } | null>(null);

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

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight || 600;
      const size = Math.min(containerWidth, containerHeight);
      
      setDimensions({ width: size, height: size });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !transformedData) return;
    
    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2 - 10;
    const centerX = width / 2;
    const centerY = height / 2;

    const root = d3
      .hierarchy<FlavorWheelNode>(transformedData)
      .sum((d) => (d.children && d.children.length > 0 ? 0 : d.value || 1))
      .sort((a, b) => {
        const aVal = a.value ?? 0;
        const bVal = b.value ?? 0;
        if (aVal === bVal) {
          return (a.data.name || '').localeCompare(b.data.name || '');
        }
        return bVal - aVal;
      });

    const partition = d3.partition<FlavorWheelNode>()
      .size([2 * Math.PI, radius])
      .padding(0.001)
      .round(false);

    const rootNode = partition(root);
    
    function normalizeAngles(node: any) {
      if (!node.children || node.children.length === 0) return;
      
      const children = node.children;
      let totalSpan = 0;
      children.forEach((child: any) => {
        totalSpan += child.x1 - child.x0;
      });
      
      if (totalSpan > 0 && Math.abs(totalSpan - (node.x1 - node.x0)) > 0.001) {
        const parentSpan = node.x1 - node.x0;
        const scale = parentSpan / totalSpan;
        let currentX = node.x0;
        
        children.forEach((child: any) => {
          const childSpan = child.x1 - child.x0;
          child.x0 = currentX;
          child.x1 = currentX + childSpan * scale;
          currentX = child.x1;
          normalizeAngles(child);
        });
      } else {
        children.forEach((child: any) => {
          normalizeAngles(child);
        });
      }
    }
    
    if (rootNode.children) {
      const level1Nodes = rootNode.children;
      let totalAngle = 0;
      level1Nodes.forEach((node: any) => {
        totalAngle += node.x1 - node.x0;
      });
      
      if (Math.abs(totalAngle - 2 * Math.PI) > 0.001) {
        const scale = (2 * Math.PI) / totalAngle;
        let currentAngle = 0;
        
        level1Nodes.forEach((node: any) => {
          const span = node.x1 - node.x0;
          node.x0 = currentAngle;
          node.x1 = currentAngle + span * scale;
          currentAngle = node.x1;
          normalizeAngles(node);
        });
      } else {
        normalizeAngles(rootNode);
      }
    }

    const arc = d3.arc()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .innerRadius((d: any) => Math.max(0, d.y0))
      .outerRadius((d: any) => Math.max(0, d.y1))
      .cornerRadius(2)
      .padAngle(0.001);

    const g = svg.append('g')
      .attr('transform', `translate(${centerX},${centerY})`);

    const allNodes = rootNode.descendants().filter((d: any) => d.depth > 0);
    
    const paths = g.selectAll('path')
      .data(allNodes)
      .enter()
      .append('path')
      .attr('d', arc as any)
      .attr('fill', (d: any) => {
        const color = d.data.color || '#cccccc';
        return color;
      })
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .style('transition', 'opacity 0.15s ease')
      .on('mouseenter', function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 0.85)
          .attr('stroke-width', 2);
        
        const nodeName = d.data.name || d.data.label || '';
        const isHighlighted = highlightedNotes.some(
          (note) => note.toLowerCase() === nodeName.toLowerCase()
        ) || (d.data.id && highlightedNoteIds.includes(d.data.id));
        
        const ancestors = [];
        let current = d.parent;
        while (current && current.depth > 0) {
          ancestors.unshift(current.data.name || current.data.label || '');
          current = current.parent;
        }
        
        const midAngle = (d.x0 + d.x1) / 2;
        const midRadius = (d.y0 + d.y1) / 2;
        const tooltipRadius = midRadius * 0.6;
        const tooltipX = centerX + Math.cos(midAngle - Math.PI / 2) * tooltipRadius;
        const tooltipY = centerY + Math.sin(midAngle - Math.PI / 2) * tooltipRadius;
        
        const content = `
          <div style="display: flex; align-items: center; gap: 6px;">
            <strong style="color: ${isHighlighted ? '#16a34a' : '#333'}">${nodeName}</strong>
            ${isHighlighted ? '<span style="color: #16a34a; font-size: 16px;">✓</span>' : ''}
          </div>
          ${ancestors.length > 0 ? `<div style="margin-top: 4px; font-size: 12px; color: #666;">Pfad: ${ancestors.join(' → ')}</div>` : ''}
        `;
        
        setTooltipData({
          x: tooltipX,
          y: tooltipY,
          content,
          visible: true,
        });
      })
      .on('click', function(event, d: any) {
        const nodeName = d.data.name || d.data.label || '';
        const isHighlighted = highlightedNotes.some(
          (note) => note.toLowerCase() === nodeName.toLowerCase()
        ) || (d.data.id && highlightedNoteIds.includes(d.data.id));
        
        const ancestors = [];
        let current = d.parent;
        while (current && current.depth > 0) {
          ancestors.unshift(current.data.name || current.data.label || '');
          current = current.parent;
        }
        
        const midAngle = (d.x0 + d.x1) / 2;
        const midRadius = (d.y0 + d.y1) / 2;
        const tooltipRadius = midRadius * 0.6;
        const tooltipX = centerX + Math.cos(midAngle - Math.PI / 2) * tooltipRadius;
        const tooltipY = centerY + Math.sin(midAngle - Math.PI / 2) * tooltipRadius;
        
        const content = `
          <div style="display: flex; align-items: center; gap: 6px;">
            <strong style="color: ${isHighlighted ? '#16a34a' : '#333'}">${nodeName}</strong>
            ${isHighlighted ? '<span style="color: #16a34a; font-size: 16px;">✓</span>' : ''}
          </div>
          ${ancestors.length > 0 ? `<div style="margin-top: 4px; font-size: 12px; color: #666;">Pfad: ${ancestors.join(' → ')}</div>` : ''}
        `;
        
        setTooltipData({
          x: tooltipX,
          y: tooltipY,
          content,
          visible: true,
        });
      })
      .on('mouseleave', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('opacity', 1)
          .attr('stroke-width', 1);
        setTooltipData(null);
      });

    paths
      .attr('opacity', 0)
      .transition()
      .duration(500)
      .delay((d: any, i: number) => i * 10)
      .attrTween('d', function(d: any) {
        const interpolate = d3.interpolate({ x0: 0, x1: 0, y0: 0, y1: 0 }, d);
        return function(t: number) {
          return arc(interpolate(t)) || '';
        };
      })
      .attr('opacity', 1);

    const defs = g.append('defs');
    const textGroup = g.append('g').attr('class', 'labels');

    rootNode.descendants().forEach((d: any, index: number) => {
      if (d.depth === 0) return;

      const shouldShowLabel = d.data.labelVisible === true;
      if (!shouldShowLabel) return;

      const angleSpan = d.x1 - d.x0;
      if (angleSpan < 0.03) return;

      const midRadius = (d.y0 + d.y1) / 2;
      if (midRadius < 10) return;
      
      const midAngle = (d.x0 + d.x1) / 2;
      
      let startAngle = d.x0;
      let endAngle = d.x1;
      
      const isUpsideDown = midAngle > Math.PI / 2 && midAngle < (3 * Math.PI) / 2;
      
      if (isUpsideDown) {
        [startAngle, endAngle] = [endAngle, startAngle];
      }
      
      const startX = Math.cos(startAngle - Math.PI / 2) * midRadius;
      const startY = Math.sin(startAngle - Math.PI / 2) * midRadius;
      const endX = Math.cos(endAngle - Math.PI / 2) * midRadius;
      const endY = Math.sin(endAngle - Math.PI / 2) * midRadius;
      
      const largeArc = angleSpan > Math.PI ? 1 : 0;
      const sweepFlag = isUpsideDown ? 0 : 1;
      
      const pathId = `text-path-${d.data.id || `node-${index}`}`;
      const pathD = `M ${startX},${startY} A ${midRadius},${midRadius} 0 ${largeArc} ${sweepFlag} ${endX},${endY}`;
      
      defs.append('path')
        .attr('id', pathId)
        .attr('d', pathD)
        .attr('fill', 'none');
      
      const label = d.data.label || d.data.name || '';
      if (!label) return;
      
      const textColor = getContrastColor(d.data.color || '#cccccc');
      const fontSize = d.depth === 1 ? 13 : 11;
      const fontWeight = d.depth === 1 ? 600 : 500;
      
      const textElement = textGroup.append('text')
        .attr('font-size', fontSize)
        .attr('font-weight', fontWeight)
        .attr('fill', textColor)
        .style('pointer-events', 'none')
        .style('opacity', 0);
      
      textElement.append('textPath')
        .attr('href', `#${pathId}`)
        .attr('startOffset', '50%')
        .attr('text-anchor', 'middle')
        .text(label);
      
      textElement.transition()
        .duration(300)
        .delay(500 + index * 15)
        .style('opacity', 1);
    });
    
    return () => {
      svg.selectAll('*').remove();
      setTooltipData(null);
    };

  }, [transformedData, dimensions, highlightedNotes, highlightedNoteIds]);

  if (!transformedData || !transformedData.children || transformedData.children.length === 0) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Keine Daten verfügbar</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-[600px] relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full flex items-center justify-center"
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          style={{ maxWidth: '100%', height: 'auto' }}
          preserveAspectRatio="xMidYMid meet"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setTooltipData(null);
            }
          }}
        >
          {tooltipData && tooltipData.visible && (
            <g>
              <circle
                cx={tooltipData.x}
                cy={tooltipData.y}
                r="4"
                fill="#16a34a"
                opacity="0.3"
              />
              <foreignObject
                x={tooltipData.x - 125}
                y={tooltipData.y - 50}
                width="250"
                height="100"
                style={{ pointerEvents: 'none' }}
              >
                <div
                  style={{
                    background: 'white',
                    padding: '10px 14px',
                    border: '2px solid #16a34a',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    fontSize: '14px',
                    pointerEvents: 'none',
                    maxWidth: '250px',
                    textAlign: 'center',
                  }}
                  dangerouslySetInnerHTML={{ __html: tooltipData.content }}
                />
              </foreignObject>
            </g>
          )}
        </svg>
      </motion.div>
      
      {highlightedNotes.length > 0 && (
        <div className="mt-4 text-sm text-[var(--color-text-muted)]">
          Hervorgehobene Noten: {highlightedNotes.join(', ')}
        </div>
      )}
    </div>
  );
}

