'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import SanityImage, { SanityHotspot } from './SanityImage';
import { useLanguage } from '@/i18n/LanguageContext';

export interface ProjectMediaSlide {
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

interface ProjectMediaCarouselProps {
  slides: ProjectMediaSlide[];
  title?: string;
  isDrawings?: boolean;
  isInline?: boolean;
}

/**
 * Statisk visning når prosjektet kun har ett enkelt bilde eller én video.
 * Bildet midtstilles perfekt i visningsfeltet og fungerer ikke som en karusell.
 */
function ProjectMediaStaticView({
  slide,
  title,
  isDrawings = false,
  isInline = false,
}: {
  slide: ProjectMediaSlide;
  title?: string;
  isDrawings?: boolean;
  isInline?: boolean;
}) {
  const aspectRatio = slide.aspectRatio || 1.4;

  return (
    <div
      className={`w-full bg-white ${
        isInline
          ? 'py-4 md:py-6'
          : isDrawings
          ? 'pt-12 md:pt-16 pb-16 md:pb-24'
          : 'pt-20 md:pt-32 pb-16 md:pb-24'
      } overflow-hidden relative select-none cursor-default [--carousel-h:50vh] sm:[--carousel-h:58vh] md:[--carousel-h:70vh]`}
    >
      <div
        className="w-full flex justify-center items-center h-[var(--carousel-h)]"
        style={{ height: 'var(--carousel-h)' }}
      >
        <div
          className="relative select-none h-[var(--carousel-h)]"
          style={{
            width: `calc(var(--carousel-h) * ${aspectRatio})`,
            maxWidth: '86vw',
            height: 'var(--carousel-h)',
          }}
        >
          <div
            className={`relative w-full h-full overflow-hidden ${
              isDrawings ? 'bg-white' : 'bg-gray-50'
            }`}
            style={{ height: 'var(--carousel-h)' }}
          >
            {slide.videoUrl ? (
              <video
                src={slide.videoUrl}
                poster={slide.posterUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            ) : slide.url ? (
              <SanityImage
                src={slide.url}
                alt={slide.alt || title || 'Prosjektbilde'}
                fill
                lqip={slide.lqip}
                hotspot={slide.hotspot}
                loading="eager"
                fetchPriority="high"
                className={`${isDrawings ? 'object-contain' : 'object-cover'} select-none pointer-events-none`}
                sizes="(max-width: 768px) 85vw, 55vw"
                draggable={false}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Karusellvisning når prosjektet har 2 eller flere medier.
 * Ved kun 2 medier dupliseres bilde 2 slik at det vises både før og etter bilde 1 [B, A, B, A, B, A].
 */
function ProjectMediaCarouselInner({
  displaySlides,
  title,
  isDrawings = false,
  isInline = false,
}: {
  displaySlides: ProjectMediaSlide[];
  title?: string;
  isDrawings?: boolean;
  isInline?: boolean;
}) {
  const isTwoSlides = displaySlides.length === 2;

  // Bygger sekvens for ekte uendelig rullering
  const infiniteSlides = React.useMemo(() => {
    if (isTwoSlides) {
      const [A, B] = displaySlides;
      // Viser B både før og etter A, med nok elementer til at Embla kan loope sømløst begge veier
      return [B, A, B, A, B, A];
    }
    let repeated = [...displaySlides];
    while (repeated.length < 6) {
      repeated = [...repeated, ...displaySlides];
    }
    return repeated;
  }, [displaySlides, isTwoSlides]);

  // Hvis 2 bilder, starter vi på index 1 (A), slik at bilde 2 (B) ligger til venstre (index 0) og til høyre (index 2)
  const startIndex = isTwoSlides ? 1 : 0;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex,
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false, // Snapper alltid til sentrert bilde, aldri halvveis scrollet
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);

  // Kun vis karusell-peker (< eller >) når musen faktisk er over selve bildebåndet
  const [isHoveringBand, setIsHoveringBand] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<'prev' | 'next'>('next');

  const updateCursorSide = useCallback((clientX: number) => {
    const centerAxis = window.innerWidth / 2;
    setHoveredSide(clientX < centerAxis ? 'prev' : 'next');
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    didDragRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (bandRef.current) {
      const rect = bandRef.current.getBoundingClientRect();
      if (e.clientY < rect.top || e.clientY > rect.bottom) {
        setIsHoveringBand(false);
        return;
      }
    }
    setIsHoveringBand(true);
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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleSlideClick = useCallback(
    (e: React.MouseEvent) => {
      if (didDragRef.current) {
        e.preventDefault();
        didDragRef.current = false;
        return;
      }

      if (!emblaApi) return;

      e.preventDefault();
      const centerAxis = window.innerWidth / 2;
      const engine = emblaApi.internalEngine();
      if (engine) engine.scrollBody.useDuration(25).useFriction(0.68);

      if (e.clientX < centerAxis) {
        emblaApi.scrollPrev();
      } else {
        emblaApi.scrollNext();
      }
    },
    [emblaApi]
  );

  // Tastaturnavigasjon med venstre / høyre piltaster
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) return;
      if (e.key === 'ArrowLeft') scrollPrev();
      if (e.key === 'ArrowRight') scrollNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext]);

  // Horisontal swipe/hjul-gest
  useEffect(() => {
    if (!emblaApi) return;
    const targetNode = containerRef.current;
    if (!targetNode) return;

    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastWheelTime = 0;

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

      const isShiftScroll = e.shiftKey && Math.abs(dy) > Math.abs(dx);
      const horizontalDelta = isShiftScroll ? dy : dx;

      if (!isShiftScroll && Math.abs(dx) <= Math.abs(dy) * 1.15) {
        // Vertikal rulling: la nettleseren rulle siden naturlig
        return;
      }

      if (Math.abs(horizontalDelta) < 0.5) return;

      e.preventDefault();

      const engine = emblaApi.internalEngine();
      if (!engine) return;

      const isDiscreteNotch = isShiftScroll || e.deltaMode !== 0 || Math.abs(horizontalDelta) >= 60;

      if (isDiscreteNotch) {
        const now = Date.now();
        if (now - lastWheelTime > 80) {
          lastWheelTime = now;
          engine.scrollBody.useDuration(25).useFriction(0.68);
          if (horizontalDelta > 0) {
            emblaApi.scrollNext();
          } else {
            emblaApi.scrollPrev();
          }
        }
      } else {
        engine.scrollBody.useFriction(0.35).useDuration(0.75);
        engine.animation.start();
        engine.target.add(-horizontalDelta);

        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const selected = emblaApi.selectedScrollSnap();
          emblaApi.scrollTo(selected);
        }, 80);
      }
    };

    targetNode.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      targetNode.removeEventListener('wheel', handleWheel);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [emblaApi]);

  const cursorClass = isHoveringBand
    ? hoveredSide === 'prev'
      ? 'cursor-carousel-prev'
      : 'cursor-carousel-next'
    : 'cursor-default';

  return (
    <div
      ref={containerRef}
      onPointerMove={(e) => {
        if (bandRef.current) {
          const rect = bandRef.current.getBoundingClientRect();
          if (e.clientY < rect.top || e.clientY > rect.bottom) {
            setIsHoveringBand(false);
          }
        }
      }}
      className={`w-full bg-white ${
        isInline
          ? 'py-4 md:py-6'
          : isDrawings
          ? 'pt-12 md:pt-16 pb-16 md:pb-24'
          : 'pt-20 md:pt-32 pb-16 md:pb-24'
      } overflow-hidden relative select-none cursor-default [--carousel-h:50vh] sm:[--carousel-h:58vh] md:[--carousel-h:70vh]`}
    >
      <div
        className={`embla overflow-hidden h-[var(--carousel-h)] ${cursorClass}`}
        style={{ height: 'var(--carousel-h)' }}
        ref={(node) => {
          emblaRef(node);
          (bandRef as any).current = node;
        }}
        onPointerEnter={(e) => {
          setIsHoveringBand(true);
          updateCursorSide(e.clientX);
        }}
        onPointerLeave={() => {
          setIsHoveringBand(false);
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="embla__container flex touch-pan-y items-start h-[var(--carousel-h)]" style={{ height: 'var(--carousel-h)' }}>
          {infiniteSlides.map((slide, index) => {
            const aspectRatio = slide.aspectRatio || 1.4;
            const isInitialSlide = index === startIndex;
            const isSecondaryVisible = index === (startIndex + 1) || index === (startIndex - 1 >= 0 ? startIndex - 1 : infiniteSlides.length - 1);

            return (
              <div
                key={`${slide.videoUrl || slide.url || index}-${index}`}
                className="embla__slide flex-none relative min-w-0 select-none mr-[calc(1rem*4/3)] md:mr-[calc(2rem*4/3)] h-[var(--carousel-h)]"
                style={{
                  width: `calc(var(--carousel-h) * ${aspectRatio})`,
                  maxWidth: '86vw',
                  height: 'var(--carousel-h)',
                }}
              >
                <div
                  onClick={handleSlideClick}
                  className={`block w-full h-full group ${cursorClass}`}
                >
                  <div
                    className={`relative w-full h-full overflow-hidden ${isDrawings ? 'bg-white' : 'bg-gray-50'} ${cursorClass}`}
                    style={{ height: 'var(--carousel-h)' }}
                  >
                    {slide.videoUrl ? (
                      <video
                        src={slide.videoUrl}
                        poster={slide.posterUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    ) : slide.url ? (
                      <SanityImage
                        src={slide.url}
                        alt={slide.alt || title || 'Prosjektbilde'}
                        fill
                        lqip={slide.lqip}
                        hotspot={slide.hotspot}
                        loading={isInitialSlide || isSecondaryVisible ? 'eager' : 'lazy'}
                        fetchPriority={isInitialSlide ? 'high' : isSecondaryVisible ? undefined : 'low'}
                        className={`${isDrawings ? 'object-contain' : 'object-cover'} select-none pointer-events-none`}
                        sizes="(max-width: 768px) 85vw, 55vw"
                        draggable={false}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProjectMediaCarousel({
  slides,
  title,
  isDrawings = false,
  isInline = false,
}: ProjectMediaCarouselProps) {
  // Dedupliserer medier strengt på ren url eller videoUrl
  const displaySlides = React.useMemo(() => {
    const seen = new Set<string>();
    const result: ProjectMediaSlide[] = [];
    for (const s of slides) {
      const mediaKey = (s.videoUrl || s.url || '').trim().toLowerCase();
      if (!mediaKey) continue;
      if (!seen.has(mediaKey)) {
        seen.add(mediaKey);
        result.push(s);
      }
    }
    return result;
  }, [slides]);

  if (!displaySlides || displaySlides.length === 0) return null;

  // Om hovedkarusellen kun har ett bilde: ikke fungere som karusell, men midtstilt og statisk
  if (displaySlides.length === 1) {
    return (
      <ProjectMediaStaticView
        slide={displaySlides[0]}
        title={title}
        isDrawings={isDrawings}
        isInline={isInline}
      />
    );
  }

  // Om man legger til flere bilder: blir automatisk til karusell
  return (
    <ProjectMediaCarouselInner
      displaySlides={displaySlides}
      title={title}
      isDrawings={isDrawings}
      isInline={isInline}
    />
  );
}
