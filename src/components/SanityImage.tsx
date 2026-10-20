'use client';

import React from 'react';
import Image, { ImageProps, ImageLoaderProps } from 'next/image';

export interface SanityHotspot {
  x: number;
  y: number;
  height?: number;
  width?: number;
}

interface SanityImageProps extends Omit<ImageProps, 'loader'> {
  src: string;
  lqip?: string;
  hotspot?: SanityHotspot;
}

/**
 * Custom loader som optimaliserer bilder via Sanity Image CDN.
 * Bruker auto=format slik at nettleseren automatisk får AVIF (eller WebP).
 */
const sanityLoader = ({ src, width, quality }: ImageLoaderProps) => {
  try {
    const url = new URL(src);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('w', width.toString());
    url.searchParams.set('q', (quality || 80).toString());
    url.searchParams.set('fit', 'max');
    return url.href;
  } catch {
    return src;
  }
};

export default function SanityImage({
  src,
  alt,
  lqip,
  hotspot,
  style,
  placeholder,
  blurDataURL,
  ...props
}: SanityImageProps) {
  const computedStyle: React.CSSProperties = {
    ...(hotspot && typeof hotspot.x === 'number' && typeof hotspot.y === 'number'
      ? { objectPosition: `${Math.round(hotspot.x * 100)}% ${Math.round(hotspot.y * 100)}%` }
      : {}),
    ...style,
  };

  const resolvedPlaceholder = placeholder ?? (lqip ? 'blur' : undefined);
  const resolvedBlurDataURL = blurDataURL ?? lqip;

  return (
    <Image
      loader={sanityLoader}
      src={src}
      alt={alt}
      style={computedStyle}
      placeholder={resolvedPlaceholder}
      blurDataURL={resolvedBlurDataURL}
      {...props}
    />
  );
}
