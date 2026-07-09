'use client';

import React from 'react';
import Image, { ImageProps, ImageLoaderProps } from 'next/image';

interface SanityImageProps extends Omit<ImageProps, 'loader'> {
  src: string; // Forventer grunn-URL til bildet fra Sanity Image API
}

/**
 * Custom loader som optimaliserer bilder via Sanity Image API
 * Erstatter Next.js sin standardoptimalisering for å redusere serverminne.
 */
const sanityLoader = ({ src, width, quality }: ImageLoaderProps) => {
  const url = new URL(src);
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fm', 'webp');
  url.searchParams.set('w', width.toString());
  url.searchParams.set('q', (quality || 75).toString());
  return url.href;
};

export default function SanityImage({ src, alt, ...props }: SanityImageProps) {
  return (
    <Image
      loader={sanityLoader}
      src={src}
      alt={alt}
      // Bruker Next.js 'sizes' prop for å generere srcset
      // Definerer responsive oppløsninger fra 360px til 3840px i konfigurasjonen
      {...props}
    />
  );
}
