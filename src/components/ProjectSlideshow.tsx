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

  const [slideHoverRole, setSlideHoverRole] = useState<'prev' | 'next'>('next');
  const isHoveredRef = useRef(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);

  const updateCursorSide = useCallback((clientX: number) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    setSlideHoverRole(ratio < 0.5 ? 'prev' : 'next');
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    didDragRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    updateCursorSide(e.clientX);
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > 6 || dy > 6) {
      didDragRef.current = true;
    }
  }, [updateCursorSide]);

  const handlePointerUp = useCallback(() => {
    pointerStartRef.current = null;
  }, []);

  const centerInViewport = useCallback(() => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;

    if (Math.abs(elementCenter - viewportCenter) > 40) {
      const targetScrollY = window.scrollY + (elementCenter - viewportCenter);
      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'smooth',
      });
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (items.length <= 1 || !viewportRef.current) return;
    centerInViewport();
    const rect = viewportRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (ratio < 0.5) {
      scrollPrev();
    } else {
      scrollNext();
    }
  }, [items.length, scrollPrev, scrollNext, centerInViewport]);

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

      <div 
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        className={`relative w-full group select-none ${
          items.length > 1
            ? slideHoverRole === 'prev'
              ? 'cursor-carousel-prev'
              : 'cursor-carousel-next'
            : 'cursor-default'
        }`}
      >
        {/* Carousel Viewport */}
        <div className="w-full overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {items.map((item, idx) => (
              <div 
                key={item._key || idx} 
                className="flex-[0_0_100%] min-w-0 relative group/slide flex flex-col"
              >
                <div 
                  className="relative w-full bg-white select-none pointer-events-none"
                  style={{ aspectRatio: item.aspectRatio || 1.5 }}
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
                      sizes={size === 'full' ? '100vw' : '(max-width: 768px) 100vw, 75vw'}
                    />
                  ) : null}
                </div>
                {(item.caption || item.captionEn) && (
                  <div
                    className={`mt-[calc(1em*var(--line-height))] text-[calc(1rem-3px)] text-center leading-(--line-height) pointer-events-auto cursor-default select-text ${size === 'full' ? 'px-side-padding' : 'px-0'}`}
                    style={{ color: 'var(--secondary-color)' }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerMove={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ProjectLocalizedCaption
                      caption={item.caption}
                      captionEn={item.captionEn}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
