'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

export function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className = '',
  sizes,
  priority,
  unoptimized,
}: SafeImageProps) {
  const common = useTranslations('common');
  const misc = useTranslations('misc');
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  if (hasError || !imageSrc) {
    console.log('SafeImage: No image or error', { src, hasError, imageSrc });
    return (
      <div
        className={`bg-[var(--color-beige-light)] flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-[var(--color-text-muted)] text-sm">{common('noImage')}</span>
      </div>
    );
  }

  const isValidUrl = imageSrc.startsWith('http://') || imageSrc.startsWith('https://') || imageSrc.startsWith('/');

  if (!isValidUrl) {
    console.log('SafeImage: Invalid URL', { imageSrc });
    return (
      <div
        className={`bg-[var(--color-beige-light)] flex items-center justify-center ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-[var(--color-text-muted)] text-sm">{misc('invalidUrl')}</span>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={unoptimized}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}

