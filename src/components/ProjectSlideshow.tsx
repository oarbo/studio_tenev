'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import SanityImage, { SanityHotspot } from './SanityImage';
import type { ProjectMediaSlide } from './ProjectMediaCarousel';
import { ProjectLocalizedCaption } from './ProjectLocalizedText';

export interface SlideshowImage {
  _key?: string;
  url?: string;
  videoUrl?: string;
  posterUrl?: string;
  type?: 'image' | 'video';
  alt?: string;
  caption?: string;
  captionEn?: string;
  aspectRatio?: number;
  lqip?: string;
  hotspot?: SanityHotspot;
}

interface ProjectSlideshowProps {
  images?: SlideshowImage[];
  slides?: ProjectMediaSlide[];
  title?: string;
  size?: string;
}

export default function ProjectSlideshow({ images, slides, title, size }: ProjectSlideshowProps) {
  const items = slides || images || [];

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start', 
    duration: 20,
    dragFree: false,
    skipSnaps: false
  });

  const [slideHoverRole, setSlideHoverRole] = useState<'prev' | 'center' | 'next'>('center');
  const isHoveredRef = useRef(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Tastaturnavigasjon gjelder kun det slideshowet brukeren holder musepekeren over eller har fokusert
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isHoveredRef.current) return;
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [scrollPrev, scrollNext]);

  // Horisontal trackpad-swipe navigerer slides uten å blokkere vertikal scrolling nedover siden
  useEffect(() => {
    if (!emblaApi) return;
    const node = emblaApi.rootNode();
    if (!node) return;

    let accumulatedDelta = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let isCoolingDown = false;

    const handleWheel = (e: WheelEvent) => {
      let dx = e.deltaX;
      let dy = e.deltaY;
      if (e.deltaMode === 1) {
        dx *= 24;
        dy *= 24;
      } else if (e.deltaMode === 2) {
        dx *= window.innerWidth;
        dy *= window.innerHeight;
      }

      // Fang kun opp horisontale swipes slik at vertikal scrolling nedover artikkelen aldri låser seg
      if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) < 2) {
        return;
      }

      e.preventDefault();

      if (isCoolingDown) return;

      accumulatedDelta += dx;

      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        accumulatedDelta = 0;
      }, 150);

      const threshold = 35;
      if (Math.abs(accumulatedDelta) >= threshold) {
        if (accumulatedDelta > 0) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollPrev();
        }
        accumulatedDelta = 0;
        isCoolingDown = true;
        setTimeout(() => {
          isCoolingDown = false;
        }, 320);
      }
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', handleWheel);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, [emblaApi]);

  if (!items || items.length === 0) return null;

  return (
    <div 
      className="w-full flex flex-col gap-3"
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
    >
      {title && (
        <div className="text-[1rem] text-black font-normal mb-2">
          {title}
        </div>
      )}

      <div className="relative w-full group">
        {/* Carousel Viewport */}
        <div className="w-full overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {items.map((item, idx) => (
              <div 
                key={item._key || idx} 
                className="flex-[0_0_100%] min-w-0 relative group/slide flex flex-col"
              >
                <div 
                  className={`relative w-full bg-gray-50 select-none ${
                    items.length > 1
                      ? slideHoverRole === 'prev'
                        ? 'cursor-carousel-prev'
                        : slideHoverRole === 'next'
                        ? 'cursor-carousel-next'
                        : 'cursor-carousel-center'
                      : 'cursor-default'
                  }`}
                  style={{ aspectRatio: item.aspectRatio || 1.5 }}
                  onPointerMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = (e.clientX - rect.left) / rect.width;
                    if (ratio < 0.35) {
                      setSlideHoverRole('prev');
                    } else if (ratio > 0.65) {
                      setSlideHoverRole('next');
                    } else {
                      setSlideHoverRole('center');
                    }
                  }}
                  onClick={(e) => {
                    if (items.length <= 1) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    if (clickX < rect.width / 2) {
                      scrollPrev();
                    } else {
                      scrollNext();
                    }
                  }}
                >
                  {item.videoUrl ? (
                    <video
                      src={item.videoUrl}
                      poster={item.posterUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover select-none pointer-events-none"
                    />
                  ) : item.url ? (
                    <SanityImage 
                      src={item.url} 
                      alt={item.caption || item.alt || title || `Slide ${idx + 1}`} 
                      fill 
                      lqip={item.lqip}
                      hotspot={item.hotspot}
                      loading="lazy"
                      fetchPriority={idx === 0 ? undefined : 'low'}
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 75vw"
                    />
                  ) : null}
                </div>
                {(item.caption || item.captionEn || item.alt) && (
                  <div
                    className={`mt-[calc(1em*var(--line-height))] text-[calc(1rem-3px)] text-center leading-(--line-height) ${size === 'full' ? 'px-side-padding' : 'px-0'}`}
                    style={{ color: 'var(--secondary-color)' }}
                  >
                    <ProjectLocalizedCaption
                      caption={item.caption || item.alt}
                      captionEn={item.captionEn}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Navigation Controls */}
        {items.length > 1 && (
          <>
            <button 
              onClick={scrollPrev}
              className="absolute top-1/2 -translate-y-1/2 left-2 md:-left-12 p-2 text-black hover:opacity-60 transition-opacity focus:outline-none cursor-pointer select-none z-20"
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
              className="absolute top-1/2 -translate-y-1/2 right-2 md:-right-12 p-2 text-black hover:opacity-60 transition-opacity focus:outline-none cursor-pointer select-none z-20"
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
