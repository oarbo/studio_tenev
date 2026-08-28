'use client';

import React, { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import SanityImage from './SanityImage';

export interface SlideshowImage {
  url: string;
  alt?: string;
  caption?: string;
  aspectRatio?: number;
}

interface ProjectSlideshowProps {
  images: SlideshowImage[];
  title?: string;
  size?: string;
}

export default function ProjectSlideshow({ images, title, size }: ProjectSlideshowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start', 
    duration: 20,
    dragFree: false,
    skipSnaps: false
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scrollPrev, scrollNext]);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-3">
      {title && (
        <div className="text-[1rem] text-black font-normal mb-2">
          {title}
        </div>
      )}

      <div className="relative w-full group">
        {/* Carousel Viewport (Kun 1 bilde i valgt størrelse er synlig) */}
        <div className="w-full overflow-hidden bg-gray-50" ref={emblaRef}>
          <div className="flex">
            {images.map((img, idx) => (
              <div 
                key={idx} 
                className="flex-[0_0_100%] min-w-0 relative group/slide"
              >
                <div 
                  className="relative w-full"
                  style={{ aspectRatio: img.aspectRatio || 1.5 }}
                >
                  <SanityImage 
                    src={img.url} 
                    alt={img.caption || img.alt || title || `Slide ${idx + 1}`} 
                    fill 
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 75vw"
                  />
                  {(img.caption || img.alt) && (
                    <div className={`absolute top-full mt-2 left-0 w-full ${size === 'full' ? 'px-side-padding' : 'px-0'} text-[20px] text-black opacity-0 group-hover/slide:opacity-100 transition-opacity duration-300 pointer-events-none z-10`}>
                      {img.caption || img.alt}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Navigation Controls (Plassert på utsiden til venstre og høyre) */}
        {images.length > 1 && (
          <>
            <button 
              onClick={scrollPrev}
              className="absolute top-1/2 -translate-y-1/2 -left-8 md:-left-12 p-2 text-black hover:opacity-60 transition-opacity focus:outline-none cursor-pointer select-none z-20"
              aria-label="Forrige bilde"
            >
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="square"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button 
              onClick={scrollNext}
              className="absolute top-1/2 -translate-y-1/2 -right-8 md:-right-12 p-2 text-black hover:opacity-60 transition-opacity focus:outline-none cursor-pointer select-none z-20"
              aria-label="Neste bilde"
            >
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1" 
                strokeLinecap="square"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
