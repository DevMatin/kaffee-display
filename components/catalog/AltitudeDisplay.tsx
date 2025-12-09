'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface AltitudeDisplayProps {
  altitudeMin: number;
  altitudeMax: number;
}

const MAX_ALTITUDE = 3000;
const MIN_ALTITUDE = 0;

export function AltitudeDisplay({ altitudeMin, altitudeMax }: AltitudeDisplayProps) {
  const [minDisplay, setMinDisplay] = useState(altitudeMin);
  const [maxDisplay, setMaxDisplay] = useState(altitudeMax);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const timeout = setTimeout(() => {
      if (!isVisible) {
        setIsVisible(true);
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      setMinDisplay(altitudeMin);
      setMaxDisplay(altitudeMax);
      return;
    }

    const duration = 2000;
    const startTime = Date.now();
    const startMin = 0;
    const startMax = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutCubic = 1 - Math.pow(1 - progress, 3);

      setMinDisplay(Math.floor(startMin + (altitudeMin - startMin) * easeOutCubic));
      setMaxDisplay(Math.floor(startMax + (altitudeMax - startMax) * easeOutCubic));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setMinDisplay(altitudeMin);
        setMaxDisplay(altitudeMax);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, altitudeMin, altitudeMax]);

  const minPercent = ((MAX_ALTITUDE - altitudeMin) / (MAX_ALTITUDE - MIN_ALTITUDE)) * 100;
  const maxPercent = ((MAX_ALTITUDE - altitudeMax) / (MAX_ALTITUDE - MIN_ALTITUDE)) * 100;

  return (
    <Card padding="md" ref={containerRef}>
      <span className="text-sm text-[var(--color-text-muted)] block mb-4">Höhe</span>
      <div className="relative h-64 w-full">
        <svg
          viewBox="0 0 400 300"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
        >
          <defs>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-brown-light)" stopOpacity="0.6" />
              <stop offset="50%" stopColor="var(--color-brown)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--color-brown-dark)" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="mountainGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-brown)" stopOpacity="0.7" />
              <stop offset="100%" stopColor="var(--color-brown-dark)" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          <path
            d="M 0 300 L 80 200 L 150 180 L 220 160 L 280 140 L 350 120 L 400 100 L 400 300 Z"
            fill="url(#mountainGradient)"
            className="transition-opacity duration-1000"
            style={{ opacity: isVisible ? 1 : 0.3 }}
          />
          <path
            d="M 0 300 L 100 220 L 200 200 L 300 170 L 400 150 L 400 300 Z"
            fill="url(#mountainGradient2)"
            className="transition-opacity duration-1000 delay-200"
            style={{ opacity: isVisible ? 1 : 0.3 }}
          />

          <g style={{ opacity: isVisible ? 1 : 0.5 }} className="transition-opacity duration-1000 delay-500">
            <line
              x1="0"
              y1={minPercent * 3}
              x2="400"
              y2={minPercent * 3}
              stroke="var(--color-accent-warm)"
              strokeWidth="3"
              strokeDasharray="8,4"
            />
            <line
              x1="0"
              y1={maxPercent * 3}
              x2="400"
              y2={maxPercent * 3}
              stroke="var(--color-accent-warm)"
              strokeWidth="3"
              strokeDasharray="8,4"
            />
            <rect
              x="0"
              y={maxPercent * 3}
              width="400"
              height={Math.max((minPercent - maxPercent) * 3, 2)}
              fill="var(--color-accent-warm)"
              fillOpacity="0.2"
            />
          </g>
        </svg>

        <div
          className="absolute left-4"
          style={{
            top: `${minPercent}%`,
            transform: 'translateY(-50%)',
            transition: 'opacity 0.5s ease-out 0.8s',
            opacity: isVisible ? 1 : 0.7,
          }}
        >
          <div className="bg-[var(--color-surface)] px-3 py-1.5 rounded-lg shadow-md border border-[var(--color-border)]">
            <span className="text-lg font-semibold text-[var(--color-accent-warm)] tabular-nums">
              {minDisplay} m
            </span>
          </div>
        </div>

        <div
          className="absolute right-4"
          style={{
            top: `${maxPercent}%`,
            transform: 'translateY(-50%)',
            transition: 'opacity 0.5s ease-out 1s',
            opacity: isVisible ? 1 : 0.7,
          }}
        >
          <div className="bg-[var(--color-surface)] px-3 py-1.5 rounded-lg shadow-md border border-[var(--color-border)]">
            <span className="text-lg font-semibold text-[var(--color-accent-warm)] tabular-nums">
              {maxDisplay} m
            </span>
          </div>
        </div>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mt-4">
        Die Anbauhöhe beeinflusst das Geschmacksprofil des Kaffees. Höhere Lagen führen zu langsameren
        Reifeprozessen und komplexeren Aromen.
      </p>
    </Card>
  );
}

