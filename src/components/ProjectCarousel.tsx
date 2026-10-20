'use client';

import React, { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import SanityImage, { SanityHotspot } from './SanityImage';
import { useLanguage } from '@/i18n/LanguageContext';
import { useWorkCategory } from '@/context/WorkCategoryContext';

export interface ProjectCarouselItem {
  _id: string;
  title: string;
  titleEn?: string;
  slug?: string;
  category?: string;
  coverImage?: string;
  image?: {
    url: string;
    aspectRatio: number;
    lqip?: string;
    hotspot?: SanityHotspot;
  };
}

interface ProjectCarouselProps {
  items: ProjectCarouselItem[];
}

/**
 * Statisk visning når listen eller valgt kategori kun har ett prosjekt.
 * Bildet midtstilles perfekt i visningsfeltet og fungerer ikke som en karusell.
 */
function ProjectCarouselStaticView({ item }: { item: ProjectCarouselItem }) {
  const { locale } = useLanguage();
  const imgUrl = item.coverImage || item.image?.url;
  const aspectRatio = item.image?.aspectRatio || 1.4;
  const linkHref = item.slug ? `/work/${item.slug}` : `/work#project-${item._id}`;

  return (
    <div className="w-full bg-white pt-20 md:pt-32 pb-16 md:pb-24 overflow-hidden relative cursor-default select-none [--carousel-h:50vh] sm:[--carousel-h:58vh] md:[--carousel-h:70vh]">
      <div className="w-full flex justify-center items-center">
        <div
          className="relative select-none"
          style={{
            width: `calc(var(--carousel-h) * ${aspectRatio})`,
            maxWidth: '86vw',
          }}
        >
          <Link
            href={linkHref}
            prefetch={true}
            className="block w-full group cursor-pointer"
            draggable={false}
          >
            <div
              className="relative w-full overflow-hidden bg-gray-50"
              style={{ height: 'var(--carousel-h)' }}
            >
              {imgUrl && (
                <SanityImage
                  src={imgUrl}
                  alt={item.title}
                  fill
                  lqip={item.image?.lqip}
                  hotspot={item.image?.hotspot}
                  loading="eager"
                  fetchPriority="high"
                  className="object-cover select-none pointer-events-none"
                  sizes="(max-width: 768px) 85vw, 55vw"
                  draggable={false}
                />
              )}
            </div>
            {/* Title under */}
            <div className="mt-3 text-black text-[1rem] md:text-[1.125rem] font-normal leading-tight truncate hover:underline underline-offset-4 decoration-1 cursor-pointer">
              {locale === 'en' && item.titleEn ? item.titleEn : item.title}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Karusellvisning for 2 eller flere prosjekter.
 * Ved kun 2 prosjekter dupliseres prosjekt 2 slik at det vises både før og etter prosjekt 1 [B, A, B, A, B, A, B, A].
 */
function ProjectCarouselInner({
  displayItems,
  activeCategory,
}: {
  displayItems: ProjectCarouselItem[];
  activeCategory: string;
}) {
  const { locale } = useLanguage();
  const isTwoItems = displayItems.length === 2;

  // Bygger sekvens for ekte uendelig loop
  const infiniteItems = React.useMemo(() => {
    if (isTwoItems) {
      const [A, B] = displayItems;
      return [B, A, B, A, B, A, B, A];
    }
    let repeated = [...displayItems];
    while (repeated.length < 8) {
      repeated = [...repeated, ...displayItems];
    }
    return repeated;
  }, [displayItems, isTwoItems]);

  const startIndex = isTwoItems ? 1 : 0;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex,
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false, // Snapper alltid til sentrert bilde, aldri halvveis scrollet
  });

  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [hoveredRole, setHoveredRole] = React.useState<'prev' | 'center' | 'next'>('center');

  const updateSlideRole = useCallback((el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const slideCenter = rect.left + rect.width / 2;
    const viewportCenter = window.innerWidth / 2;
    const diff = slideCenter - viewportCenter;
    const threshold = Math.min(window.innerWidth * 0.20, rect.width * 0.35);

    if (diff < -threshold) {
      setHoveredRole('prev');
    } else if (diff > threshold) {
      setHoveredRole('next');
    } else {
      setHoveredRole('center');
    }
  }, []);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(activeTag)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        scrollNext();
      } else if (e.key === 'ArrowDown') {
        const listEl = document.getElementById('project-list');
        if (listEl) {
          e.preventDefault();
          listEl.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext]);

  // Web-standard wheel gesture handler over karusellen
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

  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const didDragRef = React.useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    didDragRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = Math.abs(e.clientX - pointerStartRef.current.x);
    const dy = Math.abs(e.clientY - pointerStartRef.current.y);
    if (dx > 6 || dy > 6) {
      didDragRef.current = true;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    pointerStartRef.current = null;
  }, []);

  const handleSlideClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
      if (didDragRef.current) {
        e.preventDefault();
        didDragRef.current = false;
        return;
      }

      if (!emblaApi || !containerRef.current) return;

      const slideNodes = emblaApi.slideNodes();
      const clickedNode = slideNodes[index];
      if (!clickedNode) return;

      const rect = clickedNode.getBoundingClientRect();
      const slideCenter = rect.left + rect.width / 2;
      const viewportCenter = window.innerWidth / 2;
      const diff = slideCenter - viewportCenter;
      const threshold = Math.min(window.innerWidth * 0.20, rect.width * 0.35);

      if (diff < -threshold) {
        e.preventDefault();
        emblaApi.scrollPrev();
        return;
      }

      if (diff > threshold) {
        e.preventDefault();
        emblaApi.scrollNext();
        return;
      }
    },
    [emblaApi]
  );

  // Ved bytte av kategori: sentrer initialt bilde
  const prevCategoryRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!emblaApi) return;
    if (prevCategoryRef.current !== activeCategory) {
      prevCategoryRef.current = activeCategory;
      emblaApi.reInit();
      emblaApi.scrollTo(startIndex, true);
    }
  }, [activeCategory, emblaApi, startIndex]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="w-full bg-white pt-20 md:pt-32 pb-16 md:pb-24 overflow-hidden relative cursor-default select-none [--carousel-h:50vh] sm:[--carousel-h:58vh] md:[--carousel-h:70vh]"
    >
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex touch-pan-y items-start">
          {infiniteItems.map((item, index) => {
            const imgUrl = item.coverImage || item.image?.url;
            const aspectRatio = item.image?.aspectRatio || 1;
            const linkHref = item.slug ? `/work/${item.slug}` : `/work#project-${item._id}`;
            const isInitialSlide = index === startIndex;
            const isSecondaryVisible =
              index === startIndex + 1 ||
              index === (startIndex - 1 >= 0 ? startIndex - 1 : infiniteItems.length - 1);

            const isHovered = hoveredIndex === index;
            const cursorClass = isHovered
              ? hoveredRole === 'prev'
                ? 'cursor-carousel-prev'
                : hoveredRole === 'next'
                ? 'cursor-carousel-next'
                : 'cursor-carousel-center'
              : 'cursor-default';

            return (
              <div
                key={`${item._id}-${index}`}
                className="embla__slide flex-none relative min-w-0 select-none mr-[calc(1rem*4/3)] md:mr-[calc(2rem*4/3)]"
                style={{
                  width: `calc(var(--carousel-h) * ${aspectRatio})`,
                  maxWidth: '86vw',
                }}
              >
                <Link
                  href={linkHref}
                  prefetch={true}
                  onClick={(e) => handleSlideClick(e, index)}
                  className="block w-full group cursor-default"
                  draggable={false}
                >
                  <div
                    className={`relative w-full overflow-hidden bg-gray-50 ${cursorClass}`}
                    style={{ height: 'var(--carousel-h)' }}
                    onPointerEnter={(e) => {
                      setHoveredIndex(index);
                      updateSlideRole(e.currentTarget);
                    }}
                    onPointerMove={(e) => {
                      if (hoveredIndex !== index) setHoveredIndex(index);
                      updateSlideRole(e.currentTarget);
                    }}
                    onPointerLeave={() => {
                      setHoveredIndex(null);
                    }}
                  >
                    {imgUrl && (
                      <SanityImage
                        src={imgUrl}
                        alt={item.title}
                        fill
                        lqip={item.image?.lqip}
                        hotspot={item.image?.hotspot}
                        loading={isInitialSlide || isSecondaryVisible ? 'eager' : 'lazy'}
                        fetchPriority={isInitialSlide ? 'high' : isSecondaryVisible ? undefined : 'low'}
                        className="object-cover select-none pointer-events-none"
                        sizes="(max-width: 768px) 85vw, 55vw"
                        draggable={false}
                      />
                    )}
                  </div>
                  {/* Title under */}
                  <div className="mt-3 text-black text-[1rem] md:text-[1.125rem] font-normal leading-tight truncate hover:underline underline-offset-4 decoration-1 cursor-pointer">
                    {locale === 'en' && item.titleEn ? item.titleEn : item.title}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProjectCarousel({ items }: ProjectCarouselProps) {
  const { activeCategory } = useWorkCategory();

  // Filtrerer unike prosjekter basert på aktiv kategori
  const displayItems = React.useMemo(() => {
    const categoryFiltered =
      activeCategory === 'all'
        ? items
        : items.filter((item) => item.category?.toLowerCase() === activeCategory.toLowerCase());

    const valid = categoryFiltered.filter((item) => item.coverImage || item.image?.url);

    const seen = new Set<string>();
    const result: ProjectCarouselItem[] = [];
    for (const item of valid) {
      if (!seen.has(item._id)) {
        seen.add(item._id);
        result.push(item);
      }
    }
    return result;
  }, [items, activeCategory]);

  if (!displayItems || displayItems.length === 0) return null;

  // Om karusellen kun har ett bilde/prosjekt: midtstilles og er statisk
  if (displayItems.length === 1) {
    return <ProjectCarouselStaticView item={displayItems[0]} />;
  }

  // Om man har flere bilder/prosjekter: blir automatisk til karusell
  return <ProjectCarouselInner displayItems={displayItems} activeCategory={activeCategory} />;
}
