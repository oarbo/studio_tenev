'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import SanityImage, { SanityHotspot } from './SanityImage';
import { useLanguage } from '@/i18n/LanguageContext';
import { ProjectLocalizedCaption } from './ProjectLocalizedText';

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
  size?: string;
}

interface ProjectMediaCarouselProps {
  slides: ProjectMediaSlide[];
  title?: string;
  isDrawings?: boolean;
  singleSlide?: boolean;
  isInline?: boolean;
}

// Global hurtigkache for videodimensjoner slik at samme video slipper probing ved sidevisninger
const videoAspectCache = new Map<string, number>();

/**
 * Beregner bredde og styling for hver enkelt slide basert på brukerens valg i Sanity:
 * - full: fyller hele skjermbredden (100vw)
 * - large (8 kol), medium (6 kol), small (4 kol), xsmall (2 kol): tilpasset kolonnebredde
 * - default: følger standard karusellhøyde (var(--carousel-h)) og proporsjonal bredde
 * Bildet/videoen bruker alltid object-contain så det aldri beskjæres.
 */
function getSlideItemDimensions(
  slide: ProjectMediaSlide,
  singleSlide: boolean,
  overrideAspect?: number,
  fallbackAspect: number = 1.4
) {
  const ar = overrideAspect || slide.aspectRatio || fallbackAspect;
  const size = slide.size || 'default';

  if (size === 'full') {
    return {
      slideWidth: '100vw',
      slideMarginClass: singleSlide ? '' : 'mr-4 md:mr-[calc(7vw+3.5rem)]',
      sizes: '100vw',
    };
  }

  // På desktop i karusellvisning (!singleSlide) skal bildene følge karusellhøyden og ha naturlig proporsjonal bredde,
  // med romslig margin slik at nabobildene flyter utenfor margen og blør (bleed) ut på begge sider.
  if (!singleSlide) {
    return {
      slideWidth: `calc(var(--carousel-h) * ${ar})`,
      slideMarginClass: 'mr-4 md:mr-[calc(7vw+3.5rem)]',
      sizes: '(max-width: 768px) 85vw, 55vw',
    };
  }

  if (size === 'large' || size === '8') {
    return {
      slideWidth: 'clamp(320px, calc(8 / 12 * 100vw), calc(100vw - 2rem))',
      slideMarginClass: singleSlide ? '' : 'mr-4 md:mr-16',
      sizes: '(max-width: 768px) 100vw, 85vw',
    };
  }

  if (size === 'medium' || size === '6') {
    return {
      slideWidth: 'clamp(300px, calc(6 / 12 * 100vw), calc(100vw - 2rem))',
      slideMarginClass: singleSlide ? '' : 'mr-4 md:mr-16',
      sizes: '(max-width: 768px) 100vw, 67vw',
    };
  }

  if (size === 'small' || size === '4') {
    return {
      slideWidth: 'clamp(240px, calc(4 / 12 * 100vw), calc(100vw - 2rem))',
      slideMarginClass: singleSlide ? '' : 'mr-4 md:mr-16',
      sizes: '(max-width: 768px) 100vw, 50vw',
    };
  }

  if (size === 'xsmall' || size === '2') {
    return {
      slideWidth: 'clamp(180px, calc(2 / 12 * 100vw), calc(100vw - 2rem))',
      slideMarginClass: singleSlide ? '' : 'mr-4 md:mr-16',
      sizes: '(max-width: 768px) 100vw, 33vw',
    };
  }

  // Default: Standard karusellhøyde og proporsjonal bredde basert på nøyaktig sideforhold
  return {
    slideWidth: `calc(var(--carousel-h) * ${ar})`,
    slideMarginClass: singleSlide ? '' : 'mr-4 md:mr-[calc(7vw+3.5rem)]',
    sizes: '(max-width: 768px) 85vw, 55vw',
  };
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
  const [videoAspect, setVideoAspect] = useState<number | undefined>(() => {
    if (slide.videoUrl && videoAspectCache.has(slide.videoUrl)) {
      return videoAspectCache.get(slide.videoUrl);
    }
    return slide.aspectRatio;
  });

  useEffect(() => {
    if (!slide.videoUrl) return;
    if (videoAspectCache.has(slide.videoUrl)) {
      setVideoAspect(videoAspectCache.get(slide.videoUrl));
      return;
    }
    const probeVid = document.createElement('video');
    probeVid.preload = 'metadata';
    probeVid.src = slide.videoUrl;
    probeVid.onloadedmetadata = () => {
      if (probeVid.videoWidth && probeVid.videoHeight) {
        const ratio = probeVid.videoWidth / probeVid.videoHeight;
        videoAspectCache.set(slide.videoUrl!, ratio);
        setVideoAspect(ratio);
      }
    };
  }, [slide.videoUrl]);

  const effectiveAspect = videoAspect || slide.aspectRatio || 1.4;

  const containerHeightCss =
    slide.size === 'full'
      ? `max(var(--carousel-h), calc(100vw / ${effectiveAspect}))`
      : 'var(--carousel-h)';

  const dims = getSlideItemDimensions(slide, true, effectiveAspect);

  return (
    <div
      className={`w-full bg-white px-side-padding md:px-0 ${
        isInline
          ? 'py-4 md:py-6'
          : 'carousel-hero-container pt-28 md:pt-20 pb-16'
      } overflow-hidden relative select-none cursor-default`}
    >
      <div
        className="w-full flex justify-center items-center"
        style={{ height: containerHeightCss }}
      >
        <div
          className="relative flex items-center justify-center overflow-hidden w-full max-w-full md:max-w-[100vw]"
          style={{
            width: dims.slideWidth,
            height: '100%',
          }}
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
              onLoadedMetadata={(e) => {
                const vid = e.currentTarget;
                if (vid.videoWidth && vid.videoHeight) {
                  const ratio = vid.videoWidth / vid.videoHeight;
                  if (videoAspectCache.get(slide.videoUrl!) !== ratio) {
                    videoAspectCache.set(slide.videoUrl!, ratio);
                    setVideoAspect(ratio);
                  }
                }
              }}
              className="w-full h-full object-contain select-none pointer-events-none"
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
              className="object-contain select-none pointer-events-none"
              sizes={dims.sizes}
              draggable={false}
            />
          ) : null}
        </div>
      </div>
      {(slide.caption || slide.captionEn) && (
        <div className="w-full px-side-padding mt-4 text-center cursor-default select-text">
          <ProjectLocalizedCaption
            caption={slide.caption}
            captionEn={slide.captionEn}
          />
        </div>
      )}
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

  // Beregner dominerende aspektforhold fra bildene i prosjektet som standardverdi før videoer er ferdig lastet
  const projectDominantAspect = React.useMemo(() => {
    const knownAspects = displaySlides
      .map((s) => s.aspectRatio)
      .filter((ar): ar is number => typeof ar === 'number' && ar > 0);
    return knownAspects.length > 0 ? knownAspects[0] : 1.4;
  }, [displaySlides]);

  const [videoAspects, setVideoAspects] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const s of displaySlides) {
      if (s.videoUrl && videoAspectCache.has(s.videoUrl)) {
        initial[s.videoUrl] = videoAspectCache.get(s.videoUrl)!;
      }
    }
    return initial;
  });

  // Henter eksakte dimensjoner for alle videoer umiddelbart med usynlig probe
  useEffect(() => {
    let isCancelled = false;
    displaySlides.forEach((slide) => {
      if (!slide.videoUrl) return;
      if (videoAspectCache.has(slide.videoUrl)) {
        const cached = videoAspectCache.get(slide.videoUrl)!;
        setVideoAspects((prev) => {
          if (prev[slide.videoUrl!] === cached) return prev;
          return { ...prev, [slide.videoUrl!]: cached };
        });
        return;
      }

      const probeVid = document.createElement('video');
      probeVid.preload = 'metadata';
      probeVid.src = slide.videoUrl;
      probeVid.onloadedmetadata = () => {
        if (isCancelled) return;
        if (probeVid.videoWidth && probeVid.videoHeight) {
          const ratio = probeVid.videoWidth / probeVid.videoHeight;
          videoAspectCache.set(slide.videoUrl!, ratio);
          setVideoAspects((prev) => {
            if (prev[slide.videoUrl!] === ratio) return prev;
            return { ...prev, [slide.videoUrl!]: ratio };
          });
        }
      };
    });

    return () => {
      isCancelled = true;
    };
  }, [displaySlides]);

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

  // Finner største høydebehov blant bildene:
  // Dersom ett eller flere bilder er satt til 'full', defineres karusellens faste høyde
  // av den høyeste fullskjerms-sliden (lavest aspect ratio gir høyest høyde ved 100vw),
  // slik at karusellen tar opp den plassen og siden aldri hopper ved blaing.
  const fullscreenSlides = displaySlides.filter((s) => s.size === 'full');
  const minFullscreenAspect =
    fullscreenSlides.length > 0
      ? Math.min(
          ...fullscreenSlides.map(
            (s) => (s.videoUrl && videoAspects[s.videoUrl]) || s.aspectRatio || 1.777
          )
        )
      : null;

  const containerHeightCss = minFullscreenAspect
    ? `max(var(--carousel-h), calc(100vw / ${minFullscreenAspect}))`
    : 'var(--carousel-h)';

  // Hvis 2 bilder, starter vi på index 1 (A), slik at bilde 2 (B) ligger til venstre (index 0) og til høyre (index 2)
  const startIndex = isTwoSlides ? 1 : 0;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex,
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false, // Snapper alltid til sentrert bilde, aldri halvveis scrollet
  });

  // Re-initialiserer Embla når videodimensjonene oppdateres slik at slide-posisjonene blir 100% nøyaktige
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [videoAspects, emblaApi]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      const snap = emblaApi.selectedScrollSnap();
      if (isTwoSlides) {
        setActiveIndex(snap % 2 === 1 ? 0 : 1);
      } else {
        setActiveIndex(snap % displaySlides.length);
      }
    };
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, isTwoSlides, displaySlides.length]);

  const activeSlide = displaySlides[activeIndex];

  const containerRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const didDragStateRef = useRef(false);

  // Desktop tilstandsmaskin for karusell-peker (<, +, >) og klikkresponsivitet
  const [isDesktop, setIsDesktop] = useState(false);
  const [cursorRole, setCursorRole] = useState<'prev' | 'next' | 'center' | 'default'>('default');

  const lastIntentRef = useRef<'next' | 'prev' | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestMousePosRef = useRef<{ x: number; y: number } | null>(null);

  const SETTLE_DELAY_CLICK_MS = 280;
  const SETTLE_DELAY_HOVER_MS = 240;

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(typeof window !== 'undefined' && window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Finner nøyaktige skjermgrenser [left, right] for det sentrerte fokusbildet
  const getCenterSlideBounds = useCallback((): { left: number; right: number } | null => {
    if (!emblaApi) return null;
    const slideNodes = emblaApi.slideNodes?.() as HTMLElement[] | undefined;
    if (!slideNodes || slideNodes.length === 0) return null;

    const screenCenter = window.innerWidth / 2;
    let closestRect: { left: number; right: number } | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < slideNodes.length; i++) {
      const node = slideNodes[i];
      const inner = (node.firstElementChild as HTMLElement) || node;
      const rect = inner.getBoundingClientRect();

      if (rect.right <= -50 || rect.left >= window.innerWidth + 50) continue;

      if (rect.left <= screenCenter && rect.right >= screenCenter) {
        return { left: rect.left, right: rect.right };
      }

      const slideCenter = (rect.left + rect.right) / 2;
      const dist = Math.abs(slideCenter - screenCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestRect = { left: rect.left, right: rect.right };
      }
    }

    return closestRect;
  }, [emblaApi]);

  // Oppdaterer pekerrolle (<, +, >) basert på museposisjon og aktiv retningsintensjon
  const updateCursorOnMove = useCallback(
    (clientX: number, clientY: number) => {
      if (typeof window === 'undefined' || window.innerWidth < 768) return;

      latestMousePosRef.current = { x: clientX, y: clientY };

      const bandEl = bandRef.current;
      if (!bandEl) return;
      const bandRect = bandEl.getBoundingClientRect();

      // Utenfor selve bildebåndet vertikalt -> normal cursor
      if (clientY < bandRect.top || clientY > bandRect.bottom) {
        setCursorRole('default');
        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        lastIntentRef.current = null;
        return;
      }

      const screenCenter = window.innerWidth / 2;
      const bounds = getCenterSlideBounds();

      // 1. Dersom brukeren har klikket med en aktiv retningsintensjon ('next' eller 'prev'):
      if (lastIntentRef.current === 'next') {
        const threshold = bounds ? bounds.left : screenCenter;
        // Hvis musen raskt flyttes over til venstre side, bryt intensjonen umiddelbart til '<'
        if (clientX < threshold) {
          lastIntentRef.current = null;
          if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
          setCursorRole('prev');
          return;
        }
        // Forbli '>' så lenge musen er på høyre side eller over senterbildet under klikk-sekvensen
        setCursorRole('next');
        return;
      }

      if (lastIntentRef.current === 'prev') {
        const threshold = bounds ? bounds.right : screenCenter;
        // Hvis musen raskt flyttes over til høyre side, bryt intensjonen umiddelbart til '>'
        if (clientX > threshold) {
          lastIntentRef.current = null;
          if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
          setCursorRole('next');
          return;
        }
        // Forbli '<' under klikk-sekvensen
        setCursorRole('prev');
        return;
      }

      // 2. Normal hovring (ingen aktiv klikk-intensjon):
      if (!bounds) {
        setCursorRole(clientX < screenCenter ? 'prev' : 'next');
        return;
      }

      if (clientX < bounds.left) {
        // Til venstre for sentrert bilde (inkludert blankrommet mellom bildene)
        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        setCursorRole('prev');
      } else if (clientX > bounds.right) {
        // Til høyre for sentrert bilde (inkludert blankrommet mellom bildene og neste bilde)
        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        setCursorRole('next');
      } else {
        // Over det midtstilte fokusbildet:
        // Dersom pekeren allerede er '+', behold den
        // Hvis pekeren feies over bildet, behold nåværende retning og start kort timer før '+' vises
        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        settleTimerRef.current = setTimeout(() => {
          const pos = latestMousePosRef.current;
          if (!pos) return;
          const curBounds = getCenterSlideBounds();
          if (curBounds && pos.x >= curBounds.left && pos.x <= curBounds.right) {
            setCursorRole('center');
          }
        }, SETTLE_DELAY_HOVER_MS);
      }
    },
    [getCenterSlideBounds]
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    didDragStateRef.current = false;
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === 'touch') return;
      updateCursorOnMove(e.clientX, e.clientY);

      if (!pointerStartRef.current) return;
      const dx = Math.abs(e.clientX - pointerStartRef.current.x);
      const dy = Math.abs(e.clientY - pointerStartRef.current.y);
      if (dx > 6 || dy > 6) {
        didDragStateRef.current = true;
      }
    },
    [updateCursorOnMove]
  );

  const handlePointerUp = useCallback(() => {
    pointerStartRef.current = null;
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Sentrerer karusellen mykt og presist i midten av vinduet vertikalt dersom den er delvis utenfor
  const centerInViewport = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const elementCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;

    // Kun animer hvis karusellens senter avviker mer enn 40px fra midten av skjermen
    if (Math.abs(elementCenter - viewportCenter) > 40) {
      const targetScrollY = window.scrollY + (elementCenter - viewportCenter);
      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'smooth',
      });
    }
  }, []);

  const handleSlideClick = useCallback(
    (e: React.MouseEvent) => {
      if (didDragStateRef.current) {
        e.preventDefault();
        didDragStateRef.current = false;
        return;
      }

      if (!emblaApi) return;

      // Mobilvisning: behold eksakt uendret standard touch/klikk-oppførsel
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        e.preventDefault();
        centerInViewport();
        const centerAxis = window.innerWidth / 2;
        const engine = emblaApi.internalEngine();
        if (engine) engine.scrollBody.useDuration(25).useFriction(0.68);

        if (e.clientX < centerAxis) {
          emblaApi.scrollPrev();
        } else {
          emblaApi.scrollNext();
        }
        return;
      }

      // Desktop: responsiv retningsbasert klikknavigering
      const bandEl = bandRef.current;
      if (bandEl) {
        const bandRect = bandEl.getBoundingClientRect();
        if (e.clientY < bandRect.top || e.clientY > bandRect.bottom) {
          return;
        }
      }

      e.preventDefault();
      centerInViewport();

      // Responsiv, kontant og presis scrolling
      const engine = emblaApi.internalEngine();
      if (engine) engine.scrollBody.useDuration(18).useFriction(0.75);

      const screenCenter = window.innerWidth / 2;
      const bounds = getCenterSlideBounds();

      const isLeft =
        cursorRole === 'prev' ||
        (bounds ? e.clientX < bounds.left : e.clientX < screenCenter);

      if (isLeft) {
        lastIntentRef.current = 'prev';
        setCursorRole('prev');
        emblaApi.scrollPrev();
      } else {
        lastIntentRef.current = 'next';
        setCursorRole('next');
        emblaApi.scrollNext();
      }

      // Nullstiller/starter kort timer: forblir '>' eller '<' under rask klikking,
      // og morpher til '+' når brukeren stopper over fokusbildet.
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      settleTimerRef.current = setTimeout(() => {
        lastIntentRef.current = null;
        const latestPos = latestMousePosRef.current;
        if (latestPos) {
          const currentBounds = getCenterSlideBounds();
          if (
            currentBounds &&
            latestPos.x >= currentBounds.left &&
            latestPos.x <= currentBounds.right
          ) {
            setCursorRole('center');
          } else if (currentBounds) {
            setCursorRole(latestPos.x < currentBounds.left ? 'prev' : 'next');
          }
        }
      }, SETTLE_DELAY_CLICK_MS);
    },
    [emblaApi, centerInViewport, cursorRole, getCenterSlideBounds]
  );

  // Når karusellen har fullført scrolling og funnet ro, oppdater peker dersom musen står i ro over bildet
  useEffect(() => {
    if (!emblaApi) return;
    const onSettle = () => {
      if (lastIntentRef.current === null && latestMousePosRef.current) {
        const pos = latestMousePosRef.current;
        const bounds = getCenterSlideBounds();
        if (bounds) {
          if (pos.x >= bounds.left && pos.x <= bounds.right) {
            setCursorRole('center');
          } else {
            setCursorRole(pos.x < bounds.left ? 'prev' : 'next');
          }
        }
      }
    };
    emblaApi.on('settle', onSettle);
    return () => {
      emblaApi.off('settle', onSettle);
    };
  }, [emblaApi, getCenterSlideBounds]);

  // Rydd opp eventuelle timere ved avmontering
  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

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
        engine.scrollBody.useDuration(16).useFriction(0.8);
        engine.scrollTo.distance(0, true);
      }, 60);
    };

    targetNode.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      targetNode.removeEventListener('wheel', handleWheel);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [emblaApi]);

  const cursorClass = isDesktop
    ? cursorRole === 'prev'
      ? 'cursor-carousel-prev'
      : cursorRole === 'next'
      ? 'cursor-carousel-next'
      : cursorRole === 'center'
      ? 'cursor-carousel-center'
      : 'cursor-default'
    : '';

  return (
    <div
      ref={containerRef}
      onPointerEnter={(e) => {
        if (e.pointerType === 'touch') return;
        updateCursorOnMove(e.clientX, e.clientY);
      }}
      onPointerLeave={() => {
        setCursorRole('default');
        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        lastIntentRef.current = null;
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleSlideClick}
      className={`w-full bg-white px-side-padding md:px-0 ${
        isInline
          ? 'py-4 md:py-6'
          : 'carousel-hero-container pt-28 md:pt-20 pb-16'
      } overflow-hidden relative select-none ${cursorClass}`}
    >
      <div
        className={`embla overflow-hidden md:overflow-visible ${cursorClass}`}
        style={{ height: containerHeightCss }}
        ref={(node) => {
          emblaRef(node);
          (bandRef as any).current = node;
        }}
      >
        <div
          className="embla__container flex touch-pan-y items-center"
          style={{ height: containerHeightCss }}
        >
          {infiniteSlides.map((slide, index) => {
            const isInitialSlide = index === startIndex;
            const dynamicAspect = slide.videoUrl ? videoAspects[slide.videoUrl] : undefined;
            const dims = getSlideItemDimensions(
              slide,
              singleSlide,
              dynamicAspect,
              projectDominantAspect
            );

            return (
              <div
                key={`${slide.videoUrl || slide.url || index}-${index}`}
                className={`embla__slide flex-none relative min-w-0 select-none flex justify-center items-center ${dims.slideMarginClass}`}
                style={{
                  width: singleSlide ? '100%' : 'var(--slide-w)',
                  '--slide-w-desktop': dims.slideWidth,
                  height: containerHeightCss,
                } as React.CSSProperties}
              >
                <div
                  className="relative flex items-center justify-center overflow-hidden w-full h-full"
                  style={{
                    width: singleSlide ? 'var(--slide-w)' : '100%',
                    height: '100%',
                  } as React.CSSProperties}
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
                      onLoadedMetadata={(e) => {
                        const vid = e.currentTarget;
                        if (vid.videoWidth && vid.videoHeight) {
                          const ratio = vid.videoWidth / vid.videoHeight;
                          if (videoAspectCache.get(slide.videoUrl!) !== ratio) {
                            videoAspectCache.set(slide.videoUrl!, ratio);
                            setVideoAspects((prev) => ({ ...prev, [slide.videoUrl!]: ratio }));
                          }
                        }
                      }}
                      className={`w-full h-full ${singleSlide ? 'object-contain' : 'object-contain md:object-cover'} select-none pointer-events-none`}
                    />
                  ) : slide.url ? (
                    <SanityImage
                      src={slide.url}
                      alt={slide.alt || title || 'Prosjektbilde'}
                      fill
                      lqip={slide.lqip}
                      hotspot={slide.hotspot}
                      loading="eager"
                      fetchPriority={isInitialSlide ? 'high' : undefined}
                      className={`${singleSlide ? 'object-contain' : 'object-contain md:object-cover'} select-none pointer-events-none`}
                      sizes={dims.sizes}
                      draggable={false}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {(activeSlide?.caption || activeSlide?.captionEn) && (
        <div
          className="w-full px-side-padding mt-4 text-center cursor-default select-text relative z-10"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onPointerMove={(e) => {
            e.stopPropagation();
            setCursorRole('default');
          }}
        >
          <ProjectLocalizedCaption
            caption={activeSlide.caption}
            captionEn={activeSlide.captionEn}
          />
        </div>
      )}
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
