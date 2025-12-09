'use client';

import { useEffect, useRef, useState } from 'react';

type RegionPoint = {
  latitude?: number | null;
  longitude?: number | null;
  regionName?: string | null;
  country: string;
};

interface RegionMapProps {
  latitude?: number | null;
  longitude?: number | null;
  regionName?: string;
  country?: string;
  regions?: RegionPoint[];
}

const COUNTRY_COORDINATES: Record<string, [number, number]> = {
  'Kolumbien': [4.7110, -74.0721],
  'Colombia': [4.7110, -74.0721],
  'Brasilien': [-14.2350, -51.9253],
  'Brazil': [-14.2350, -51.9253],
  'Äthiopien': [9.1450, 38.7667],
  'Ethiopia': [9.1450, 38.7667],
  'Indien': [20.5937, 78.9629],
  'India': [20.5937, 78.9629],
  'Peru': [-9.1900, -75.0152],
  'Guatemala': [15.7835, -90.2308],
  'Honduras': [15.2000, -86.2419],
  'Costa Rica': [9.7489, -83.7534],
  'Nicaragua': [12.2650, -85.2072],
  'El Salvador': [13.7942, -88.8965],
  'Mexiko': [23.6345, -102.5528],
  'Mexico': [23.6345, -102.5528],
  'Kenia': [-0.0236, 37.9062],
  'Kenya': [-0.0236, 37.9062],
  'Tansania': [-6.3690, 34.8888],
  'Tanzania': [-6.3690, 34.8888],
  'Rwanda': [-1.9441, 29.8739],
  'Uganda': [1.3733, 32.2903],
  'Jemen': [15.5527, 48.5164],
  'Yemen': [15.5527, 48.5164],
  'Indonesien': [-0.7893, 113.9213],
  'Indonesia': [-0.7893, 113.9213],
  'Vietnam': [14.0583, 108.2772],
  'Thailand': [15.8700, 100.9925],
  'Myanmar': [21.9162, 95.9560],
  'Papua-Neuguinea': [-6.3150, 143.9555],
  'Papua New Guinea': [-6.3150, 143.9555],
};

export function RegionMap({ latitude, longitude, regionName, country, regions }: RegionMapProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveCoordinate = (point?: RegionPoint): [number, number] | null => {
    if (!point) return null;
    if (point.latitude && point.longitude) return [point.latitude, point.longitude];
    const coords = COUNTRY_COORDINATES[point.country];
    return coords ? coords : null;
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let mounted = true;
    const points: RegionPoint[] =
      regions && regions.length > 0
        ? regions
        : latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null
        ? [{ latitude, longitude, regionName: regionName || null, country: country || '' }]
        : country
        ? [{ latitude, longitude, regionName: regionName || null, country }]
        : [];

    const coordinates = points
      .map((p) => resolveCoordinate(p))
      .filter((c): c is [number, number] => Boolean(c));

    if (coordinates.length === 0) {
      setError('Keine Koordinaten verfügbar');
      return;
    }

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        if (!mounted || !containerRef.current || mapRef.current) return;

        const map = L.map(containerRef.current, {
          center: coordinates[0],
          zoom: 5,
          scrollWheelZoom: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        const accentColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-accent-warm')
          .trim() || '#e5a87f';
        const surfaceColor = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface')
          .trim() || '#ffffff';

        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: 24px;
            height: 24px;
            background-color: ${accentColor};
            border: 3px solid ${surfaceColor};
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const markers = coordinates.map((coord, idx) => {
          const marker = L.marker(coord, { icon: customIcon });
          const point = points[idx];
          const label = point?.regionName || point?.country || 'Region';
          marker.bindTooltip(label, { permanent: false });
          marker.addTo(map);
          return marker;
        });

        if (markers.length > 1) {
          const bounds = L.latLngBounds(markers.map((m) => m.getLatLng()));
          map.fitBounds(bounds, { padding: [30, 30] });
        }

        mapRef.current = map;
        setIsLoaded(true);

        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 200);
      } catch (err) {
        console.error('Error loading map:', err);
        if (mounted) {
          setError('Karte konnte nicht geladen werden');
        }
      }
    };

    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latitude, longitude, regionName, country]);

  return (
    <div className="relative w-full h-80 rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-beige-light)]">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] text-sm">
          {error}
        </div>
      ) : !isLoaded ? (
        <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-muted)] text-sm">
          Karte wird geladen...
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      />
    </div>
  );
}

