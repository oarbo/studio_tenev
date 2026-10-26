'use client';

import React, { useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import SanityImage, { SanityHotspot } from './SanityImage';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatTypography } from '@/utils/typography';
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
    <div className="w-full bg-white carousel-hero-container pt-20 pb-16 overflow-hidden relative cursor-default select-none">
      <div className="w-full flex justify-center items-center h-[var(--carousel-h)]" style={{ height: 'var(--carousel-h)' }}>
        <div
          className="relative select-none h-[var(--carousel-h)]"
          style={{
            width: `calc(var(--carousel-h) * ${aspectRatio})`,
            height: 'var(--carousel-h)',
          }}
        >
          <Link
            href={linkHref}
            prefetch={true}
            className="block w-full h-full group cursor-pointer relative"
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
            <div className="absolute top-full left-0 right-0 mt-3 text-black text-[1rem] md:text-[1.125rem] font-normal leading-tight truncate hover:underline underline-offset-4 decoration-1 cursor-pointer">
              {formatTypography(locale === 'en' && item.titleEn ? item.titleEn : item.title)}
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
  allItems,
}: {
  displayItems: ProjectCarouselItem[];
  allItems: ProjectCarouselItem[];
}) {
  const { locale } = useLanguage();
  const isOneItem = displayItems.length === 1;
  const isTwoItems = displayItems.length === 2;

  // Bygger sekvens for uendelig loop ved flere prosjekter
  const infiniteItems = React.useMemo(() => {
    if (isOneItem) {
      return [displayItems[0]];
    }
    if (isTwoItems) {
      const [A, B] = displayItems;
      return [B, A, B, A, B, A, B, A];
    }
    let repeated = [...displayItems];
    while (repeated.length < 8) {
      repeated = [...repeated, ...displayItems];
    }
    return repeated;
  }, [displayItems, isOneItem, isTwoItems]);

  const startIndex = isTwoItems ? 1 : 0;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex,
    loop: !isOneItem,
    watchDrag: (_embla, evt) => {
      if (isOneItem) return false;
      // Slå av Embla drag på mus slik at klikk/hold på bildene ikke avbryter eller fryser animasjonen
      if (evt.type === 'mousedown') return false;
      if ((evt as any)?.pointerType === 'mouse') return false;
      return true;
    },
    align: 'center',
    skipSnaps: false,
    duration: 18, // Rask og responsiv rulling uten forsinkelse
  });

  // Forhåndslaster og forhåndsdekoder alle prosjektbilder i minnet (GPU/bitmap cache)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = window.innerWidth >= 768
      ? (window.innerWidth * dpr >= 1400 ? 1920 : 1200)
      : (window.innerWidth * dpr >= 800 ? 1080 : 750);

    const buildUrl = (rawSrc: string, w: number) => {
      try {
        const u = new URL(rawSrc);
        u.searchParams.set('auto', 'format');
        u.searchParams.set('w', w.toString());
        u.searchParams.set('q', '80');
        u.searchParams.set('fit', 'max');
        return u.href;
      } catch {
        return rawSrc;
      }
    };

    allItems.forEach((item) => {
      const rawUrl = item.coverImage || item.image?.url;
      if (!rawUrl) return;

      const fullUrl = buildUrl(rawUrl, targetW);
      const img = new window.Image();
      img.src = fullUrl;
      if ('decode' in img) {
        img.decode().catch(() => {});
      }
    });
  }, [allItems]);

  // FLIP (First, Last, Invert, Play) kort-shuffling for karusellbilder
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevCardPositions = useRef<Map<string, number>>(new Map());
  const isFirstCarouselRender = useRef(true);

  // Hjelpefunksjon for å lagre nåværende skjermposisjon (X) for hvert prosjekt
  const captureCardPositions = useCallback(() => {
    const map = new Map<string, number>();
    const screenCenter = window.innerWidth / 2;

    cardRefs.current.forEach((el, key) => {
      const id = key.substring(0, key.lastIndexOf('-'));
      const rect = el.getBoundingClientRect();

      // Ta vare på posisjonen som er nærmest midten av skjermen for hvert unike prosjekt
      if (!map.has(id)) {
        map.set(id, rect.left);
      } else {
        const currentSavedLeft = map.get(id)!;
        if (Math.abs(rect.left - screenCenter) < Math.abs(currentSavedLeft - screenCenter)) {
          map.set(id, rect.left);
        }
      }
    });
    return map;
  }, []);

  // Oppdater posisjonene kontinuerlig når brukeren blar i karusellen
  useEffect(() => {
    if (!emblaApi) return;
    const save = () => {
      prevCardPositions.current = captureCardPositions();
    };
    save();
    emblaApi.on('select', save);
    emblaApi.on('settle', save);
    return () => {
      emblaApi.off('select', save);
      emblaApi.off('settle', save);
    };
  }, [emblaApi, captureCardPositions]);

  // Når kategorien endres: sentrer første bilde umiddelbart, og la kortene skli (shuffle) på plass
  useLayoutEffect(() => {
    if (!emblaApi) return;

    if (isFirstCarouselRender.current) {
      isFirstCarouselRender.current = false;
      emblaApi.reInit({ startIndex });
      prevCardPositions.current = captureCardPositions();
      return;
    }

    // 1. Sentrer umiddelbart første bilde i den nye kategorien (i fokus)
    emblaApi.reInit({ startIndex });

    // 2. Mål nye posisjoner og regn ut deltaX
    const oldPositions = prevCardPositions.current;
    const toAnimate: { el: HTMLDivElement; deltaX: number; isNew: boolean }[] = [];

    cardRefs.current.forEach((el, key) => {
      const id = key.substring(0, key.lastIndexOf('-'));
      const newRect = el.getBoundingClientRect();
      const oldLeft = oldPositions.get(id);

      if (oldLeft !== undefined) {
        const deltaX = oldLeft - newRect.left;
        if (Math.abs(deltaX) > 1) {
          toAnimate.push({ el, deltaX, isNew: false });
        }
      } else {
        // Nytt kort som sklir inn fra siden
        const isRight = newRect.left >= window.innerWidth / 2;
        toAnimate.push({ el, deltaX: isRight ? 120 : -120, isNew: true });
      }
    });

    // 3. Invert: Sett kortene til gammel posisjon før tegning
    toAnimate.forEach(({ el, deltaX }) => {
      el.style.transform = `translateX(${deltaX}px)`;
      el.style.transition = 'none';
    });

    // 4. Play: La kortene skli raskt og mykt inn på sine nye plasser (100% full styrke, kun ren horisontal bevegelse)
    const animId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toAnimate.forEach(({ el }) => {
          el.style.transition = 'transform 320ms cubic-bezier(0.2, 0, 0, 1)';
          el.style.transform = 'translateX(0)';
        });
      });
    });

    // 5. Rydd opp etter fullført animasjon
    const cleanupTimer = setTimeout(() => {
      toAnimate.forEach(({ el }) => {
        el.style.transform = '';
        el.style.transition = '';
      });
      prevCardPositions.current = captureCardPositions();
    }, 350);

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(cleanupTimer);
    };
  }, [displayItems, emblaApi, startIndex, captureCardPositions]);

  const [hoveredRole, setHoveredRole] = React.useState<'prev' | 'center' | 'next' | 'default'>('center');
  const lastPointerXRef = React.useRef<number | null>(null);
  const lastPointerYRef = React.useRef<number | null>(null);
  const isScrollingRef = React.useRef(false);
  const scrollDirectionRef = React.useRef<'prev' | 'next' | null>(null);
  const bandRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Finner bildet som faktisk er nærmest midten av skjermen akkurat nå
  const getActiveCenterSlide = useCallback(() => {
    if (!emblaApi) return null;
    const slideNodes = emblaApi.slideNodes();
    if (!slideNodes || slideNodes.length === 0) return null;

    const viewportCenter = window.innerWidth / 2;
    let closestNode: HTMLElement | null = null;
    let minDiff = Infinity;

    slideNodes.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const nodeCenter = rect.left + rect.width / 2;
      const diff = Math.abs(nodeCenter - viewportCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestNode = node as HTMLElement;
      }
    });

    if (!closestNode) return null;
    const imgBox = ((closestNode as HTMLElement).querySelector('.relative.w-full.overflow-hidden') || closestNode) as HTMLElement;
    const rect = imgBox.getBoundingClientRect();

    return {
      rect,
      diff: minDiff,
      isNearCenter: minDiff < 35, // innen 35px fra midten betyr at bildet visuelt er i fokus
    };
  }, [emblaApi]);

  const getActiveCenterRect = useCallback(() => {
    const info = getActiveCenterSlide();
    return info ? info.rect : null;
  }, [getActiveCenterSlide]);

  const updateCursorRole = useCallback(
    (clientX: number, clientY: number, force = false) => {
      lastPointerXRef.current = clientX;
      lastPointerYRef.current = clientY;

      // Pil (<, >) og kryss (+) skal KUN vises når musen er innenfor det horisontale båndet
      // hvor karusellbildene ligger. Utenfor (over, under, og på caption) vises kun standardpeker.
      if (!bandRef.current) return;
      const bandRect = bandRef.current.getBoundingClientRect();
      const isInsideBand = clientY >= bandRect.top && clientY <= bandRect.bottom;

      if (!isInsideBand) {
        setHoveredRole('default');
        return;
      }

      // Mens karusellen rullerer i en gitt retning, låser vi retningen
      // slik at pilen ALDRI flipper feil vei underveis i animasjonen
      if (!force && isScrollingRef.current && scrollDirectionRef.current) {
        setHoveredRole(scrollDirectionRef.current);
        return;
      }

      if (isOneItem) {
        const centerRect = getActiveCenterRect();
        if (centerRect && clientX >= centerRect.left && clientX <= centerRect.right) {
          setHoveredRole('center');
        } else {
          setHoveredRole('default');
        }
        return;
      }

      const centerRect = getActiveCenterRect();
      if (centerRect) {
        if (clientX < centerRect.left) {
          setHoveredRole('prev');
        } else if (clientX > centerRect.right) {
          setHoveredRole('next');
        } else {
          setHoveredRole('center');
        }
      } else {
        const mid = window.innerWidth / 2;
        if (clientX < mid - 200) setHoveredRole('prev');
        else if (clientX > mid + 200) setHoveredRole('next');
        else setHoveredRole('center');
      }
    },
    [getActiveCenterRect, isOneItem]
  );

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    const engine = emblaApi.internalEngine();
    if (engine) engine.scrollBody.useDuration(18).useFriction(0.78);
    isScrollingRef.current = true;
    scrollDirectionRef.current = 'prev';
    setHoveredRole('prev');
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    const engine = emblaApi.internalEngine();
    if (engine) engine.scrollBody.useDuration(18).useFriction(0.78);
    isScrollingRef.current = true;
    scrollDirectionRef.current = 'next';
    setHoveredRole('next');
    emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSettle = () => {
      isScrollingRef.current = false;
      scrollDirectionRef.current = null;
      if (lastPointerXRef.current !== null && lastPointerYRef.current !== null) {
        updateCursorRole(lastPointerXRef.current, lastPointerYRef.current, true);
      }
    };

    emblaApi.on('settle', onSettle);

    return () => {
      emblaApi.off('settle', onSettle);
    };
  }, [emblaApi, updateCursorRole]);

  // Oppdater peker-rolle hvis siden rulles vertikalt
  useEffect(() => {
    const handleScroll = () => {
      if (lastPointerXRef.current !== null && lastPointerYRef.current !== null) {
        updateCursorRole(lastPointerXRef.current, lastPointerYRef.current);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [updateCursorRole]);

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

      // Tradisjonelt rullehjul med fysiske klikk / Shift+rullehjul
      const isDiscreteWheel = isShiftScroll || e.deltaMode !== 0;

      if (isDiscreteWheel) {
        const now = Date.now();
        if (now - lastWheelTime > 120) {
          lastWheelTime = now;
          isScrollingRef.current = true;
          scrollDirectionRef.current = horizontalDelta > 0 ? 'next' : 'prev';
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
      // og la brukeren rulle fritt over så mange prosjekter de ønsker.
      isScrollingRef.current = true;
      scrollDirectionRef.current = horizontalDelta > 0 ? 'next' : 'prev';

      engine.scrollBody.useDuration(0).useFriction(0);
      engine.animation.start();
      engine.target.add(-horizontalDelta);

      // Først når rullingen og momentumet har stoppet helt opp,
      // låses og sentreres karusellen mykt og behagelig til nærmeste prosjektbilde.
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

  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const didDragRef = React.useRef(false);
  const hasNavigatedOnPointerDownRef = React.useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      didDragRef.current = false;
      hasNavigatedOnPointerDownRef.current = false;

      // Pil og navigasjon er KUN aktiv hvis trykket skjer innenfor det horisontale båndet
      if (!bandRef.current) return;
      const bandRect = bandRef.current.getBoundingClientRect();
      const isInsideBand = e.clientY >= bandRect.top && e.clientY <= bandRect.bottom;
      if (!isInsideBand) return;

      // Hvis brukeren trykker med mus (og ikke touch):
      // Naviger umiddelbart til neste/forrige fokusbilde selv om museknappen holdes nede!
      const isMouse = e.pointerType === 'mouse' || (!e.pointerType && e.button === 0);
      if (isMouse && e.button === 0 && !isOneItem) {
        if (hoveredRole === 'prev') {
          hasNavigatedOnPointerDownRef.current = true;
          scrollPrev();
        } else if (hoveredRole === 'next') {
          hasNavigatedOnPointerDownRef.current = true;
          scrollNext();
        }
      }
    },
    [hoveredRole, isOneItem, scrollPrev, scrollNext]
  );

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
    setTimeout(() => {
      hasNavigatedOnPointerDownRef.current = false;
    }, 80);
  }, []);

  const handleBandClick = useCallback(
    (e: React.MouseEvent) => {
      if (didDragRef.current || hasNavigatedOnPointerDownRef.current) {
        e.preventDefault();
        didDragRef.current = false;
        return;
      }

      if (isOneItem || !emblaApi) return;

      // Klikk er KUN aktivt innenfor det horisontale båndet
      if (!bandRef.current) return;
      const bandRect = bandRef.current.getBoundingClientRect();
      const isInsideBand = e.clientY >= bandRect.top && e.clientY <= bandRect.bottom;
      if (!isInsideBand) return;

      // Håndterer klikk på det blanke feltet utenfor bildene innenfor båndet
      if (hoveredRole === 'prev') {
        e.preventDefault();
        scrollPrev();
      } else if (hoveredRole === 'next') {
        e.preventDefault();
        scrollNext();
      }
    },
    [emblaApi, hoveredRole, isOneItem, scrollPrev, scrollNext]
  );

  const cursorClass =
    hoveredRole === 'prev'
      ? 'cursor-carousel-prev'
      : hoveredRole === 'next'
      ? 'cursor-carousel-next'
      : hoveredRole === 'center'
      ? 'cursor-carousel-center'
      : 'cursor-default';

  return (
    <div
      ref={containerRef}
      onPointerMove={(e) => {
        handlePointerMove(e);
        updateCursorRole(e.clientX, e.clientY);
      }}
      onPointerLeave={() => {
        lastPointerXRef.current = null;
        lastPointerYRef.current = null;
        setHoveredRole('default');
      }}
      className="w-full bg-white carousel-hero-container pt-20 pb-16 overflow-hidden relative select-none cursor-default"
    >
      {/* Det horisontale båndet med bildene hvor pil (<, >) og kryss (+) er aktivt */}
      <div
        ref={bandRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleBandClick}
        className={`relative w-full h-[var(--carousel-h)] ${cursorClass}`}
        style={{ height: 'var(--carousel-h)' }}
      >
        <div className="embla overflow-visible h-[var(--carousel-h)]" style={{ height: 'var(--carousel-h)' }} ref={emblaRef}>
          <div className="embla__container flex touch-pan-y items-start h-[var(--carousel-h)]" style={{ height: 'var(--carousel-h)' }}>
            {infiniteItems.map((item, index) => {
              const imgUrl = item.coverImage || item.image?.url;
              const aspectRatio = item.image?.aspectRatio || 1.4;
              const linkHref = item.slug ? `/work/${item.slug}` : `/work#project-${item._id}`;
              const isInitialSlide = index === startIndex;
              const isSecondaryVisible =
                index === startIndex + 1 ||
                index === (startIndex - 1 >= 0 ? startIndex - 1 : infiniteItems.length - 1);

              return (
                <div
                  key={`${item._id}-${index}`}
                  className={`embla__slide flex-none relative min-w-0 select-none mr-8 md:mr-[calc(7vw+3.5rem)] h-[var(--carousel-h)] ${cursorClass}`}
                  style={
                    {
                      '--aspect': aspectRatio,
                      width: `calc(var(--carousel-h) * ${aspectRatio})`,
                      height: 'var(--carousel-h)',
                    } as React.CSSProperties
                  }
                >
                  <div
                    ref={(el) => {
                      if (el) cardRefs.current.set(`${item._id}-${index}`, el);
                      else cardRefs.current.delete(`${item._id}-${index}`);
                    }}
                    className="w-full h-full will-change-transform relative"
                  >
                    {/* Bilde-lenke (aktivt område med karusell-peker) */}
                    <Link
                      href={linkHref}
                      prefetch={true}
                      onClick={(e) => {
                        if (didDragRef.current || hasNavigatedOnPointerDownRef.current) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }

                        // Kun hvis karusellen står i ro og pekeren er et kryss (+) over det sentrerte bildet,
                        // tillates navigasjon inn på prosjektsiden.
                        if (isScrollingRef.current || hoveredRole !== 'center') {
                          e.preventDefault();
                          e.stopPropagation();

                          if (hoveredRole === 'prev') {
                            scrollPrev();
                          } else if (hoveredRole === 'next') {
                            scrollNext();
                          }
                          return;
                        }
                      }}
                      className={`block w-full h-full group relative ${cursorClass}`}
                      draggable={false}
                    >
                      <div
                        className={`relative w-full overflow-hidden bg-gray-50 ${cursorClass}`}
                        style={{ height: 'var(--carousel-h)' }}
                      >
                        {imgUrl && (
                          <SanityImage
                            src={imgUrl}
                            alt={item.title}
                            fill
                            placeholder="empty"
                            hotspot={item.image?.hotspot}
                            loading="eager"
                            fetchPriority="high"
                            className="object-cover select-none pointer-events-none"
                            sizes="(max-width: 768px) 85vw, 55vw"
                            draggable={false}
                          />
                        )}
                      </div>
                    </Link>

                    {/* Prosjekttekst / caption under bildet - alltid vanlig pointer uten pil/kryss */}
                    <div className="absolute top-full left-0 right-0 mt-3 cursor-default select-none pointer-events-auto">
                      <Link
                        href={linkHref}
                        prefetch={true}
                        onClick={(e) => {
                          if (didDragRef.current) {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        className="inline-block text-black text-[1rem] md:text-[1.125rem] font-normal leading-tight truncate hover:underline underline-offset-4 decoration-1 cursor-pointer"
                      >
                        {formatTypography(locale === 'en' && item.titleEn ? item.titleEn : item.title)}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skjult forhåndslaster som cacher alle bildestørrelser i nettleseren */}
      <div
        className="sr-only"
        aria-hidden="true"
        style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute' }}
      >
        {allItems.map((item) => {
          const u = item.coverImage || item.image?.url;
          if (!u) return null;
          return (
            <SanityImage
              key={`precache-${item._id}`}
              src={u}
              alt=""
              fill
              sizes="(max-width: 768px) 85vw, 55vw"
              loading="eager"
              fetchPriority="low"
              placeholder="empty"
            />
          );
        })}
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

  return <ProjectCarouselInner displayItems={displayItems} allItems={items} />;
}
