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
  singleSlide?: boolean;
  isInline?: boolean;
}

/**
 * Statisk visning når prosjektet kun har ett enkelt bilde eller én video.
 * Bildet midtstilles perfekt i visningsfeltet og fungerer ikke som en karusell.
 */
function ProjectMediaStaticView({
  slide,
  title,
  singleSlide = false,
  isInline = false,
}: {
  slide: ProjectMediaSlide;
  title?: string;
  isDrawings?: boolean;
  singleSlide?: boolean;
  isInline?: boolean;
}) {
  const aspectRatio = slide.aspectRatio || 1.4;

  return (
    <div
      className={`w-full bg-white ${
        isInline
          ? 'py-4 md:py-6'
          : 'carousel-hero-container pt-20 pb-16'
      } overflow-hidden relative select-none cursor-default`}
    >
      <div
        className="w-full flex justify-center items-center h-[var(--carousel-h)]"
        style={{ height: 'var(--carousel-h)' }}
      >
        <div
          className="relative select-none h-[var(--carousel-h)] max-w-[86vw]"
          style={
            {
              '--aspect': aspectRatio,
              width: `calc(var(--carousel-h) * ${aspectRatio})`,
              height: 'var(--carousel-h)',
            } as React.CSSProperties
          }
        >
          <div
            className="relative w-full h-full overflow-hidden bg-white"
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
                preload="auto"
                ref={(el) => {
                  if (el && el.paused) {
                    el.play().catch(() => {});
                  }
                }}
                className={`w-full h-full ${singleSlide ? 'object-contain' : 'object-cover'} select-none pointer-events-none`}
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
                className={`${singleSlide ? 'object-contain' : 'object-cover'} select-none pointer-events-none`}
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
  singleSlide = false,
  isInline = false,
}: {
  displaySlides: ProjectMediaSlide[];
  title?: string;
  isDrawings?: boolean;
  singleSlide?: boolean;
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

      // Tradisjonelt rullehjul med fysiske klikk / Shift+rullehjul
      const isDiscreteWheel = isShiftScroll || e.deltaMode !== 0;

      if (isDiscreteWheel) {
        const now = Date.now();
        if (now - lastWheelTime > 120) {
          lastWheelTime = now;
          engine.scrollBody.useDuration(22).useFriction(0.72);
          if (horizontalDelta > 0) {
            emblaApi.scrollNext();
          } else {
            emblaApi.scrollPrev();
          }
        }
        return;
      }

      // Kontinuerlig rulling (Magic Mouse og Trackpad):
      // Følg bevegelsen og momentum 1:1 uten forsinkelse eller motstand,
      // og la brukeren rulle fritt helt til de stopper.
      engine.scrollBody.useDuration(0).useFriction(0);
      engine.animation.start();
      engine.target.add(-horizontalDelta);

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        engine.scrollBody.useDuration(22).useFriction(0.72);
        engine.scrollTo.distance(0, true);
      }, 140);
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
      onClick={handleSlideClick}
      className={`w-full bg-white ${
        isInline
          ? 'py-4 md:py-6'
          : 'carousel-hero-container pt-20 pb-16'
      } overflow-hidden relative select-none ${cursorClass}`}
    >
      <div
        className={`embla overflow-hidden h-[var(--carousel-h)] ${cursorClass}`}
        style={{ height: 'var(--carousel-h)' }}
        ref={(node) => {
          emblaRef(node);
          (bandRef as any).current = node;
        }}
      >
        <div className="embla__container flex touch-pan-y items-start h-[var(--carousel-h)]" style={{ height: 'var(--carousel-h)' }}>
          {infiniteSlides.map((slide, index) => {
            const aspectRatio = slide.aspectRatio || 1.4;
            const isInitialSlide = index === startIndex;
            const isSecondaryVisible = index === (startIndex + 1) || index === (startIndex - 1 >= 0 ? startIndex - 1 : infiniteSlides.length - 1);

            return (
              <div
                key={`${slide.videoUrl || slide.url || index}-${index}`}
                className={`embla__slide flex-none relative min-w-0 select-none h-[var(--carousel-h)] ${
                  singleSlide
                    ? 'w-full min-w-full max-w-full mr-0 px-4 md:px-12 flex justify-center items-center'
                    : 'w-[calc(var(--carousel-h)*var(--aspect))] mr-8 md:mr-[calc(7vw+3.5rem)]'
                }`}
                style={
                  singleSlide
                    ? { height: 'var(--carousel-h)' }
                    : ({
                        '--aspect': aspectRatio,
                        width: `calc(var(--carousel-h) * ${aspectRatio})`,
                        height: 'var(--carousel-h)',
                      } as React.CSSProperties)
                }
              >
                <div
                  className={`block h-full ${
                    singleSlide
                      ? 'w-[calc(var(--carousel-h)*var(--aspect))] max-w-[86vw] mx-auto flex items-center justify-center'
                      : 'w-full'
                  }`}
                  style={
                    singleSlide
                      ? ({
                          '--aspect': aspectRatio,
                          height: 'var(--carousel-h)',
                        } as React.CSSProperties)
                      : { height: 'var(--carousel-h)' }
                  }
                >
                  <div
                    className="relative w-full h-full overflow-hidden bg-white"
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
                        preload="auto"
                        ref={(el) => {
                          if (el && el.paused) {
                            el.play().catch(() => {});
                          }
                        }}
                        className={`w-full h-full ${singleSlide ? 'object-contain' : 'object-cover'} select-none pointer-events-none`}
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
                        className={`${singleSlide ? 'object-contain' : 'object-cover'} select-none pointer-events-none`}
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
  singleSlide = false,
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
        singleSlide={singleSlide}
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
      singleSlide={singleSlide}
      isInline={isInline}
    />
  );
}
