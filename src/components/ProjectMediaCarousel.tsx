'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import SanityImage, { SanityHotspot } from './SanityImage';
import { useLanguage } from '@/i18n/LanguageContext';
import { ProjectLocalizedCaption } from './ProjectLocalizedText';
import MediaLightbox from './MediaLightbox';

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
  const marginClass = singleSlide ? 'mr-0' : 'mr-4 md:mr-[calc(7vw+3.5rem)]';

  if (size === 'full') {
    return {
      slideWidth: '100vw',
      slideMarginClass: marginClass,
      sizes: '100vw',
    };
  }

  if (size === 'large' || size === '8' || size === 'cols8') {
    return {
      slideWidth: 'clamp(320px, calc(8 / 12 * 100vw), calc(100vw - 2rem))',
      slideMarginClass: marginClass,
      sizes: '(max-width: 768px) 100vw, 85vw',
    };
  }

  if (size === 'medium' || size === '6' || size === 'cols6') {
    return {
      slideWidth: 'clamp(300px, calc(6 / 12 * 100vw), calc(100vw - 2rem))',
      slideMarginClass: marginClass,
      sizes: '(max-width: 768px) 100vw, 67vw',
    };
  }

  if (size === 'small' || size === '4' || size === 'cols4') {
    return {
      slideWidth: 'clamp(240px, calc(4 / 12 * 100vw), calc(100vw - 2rem))',
      slideMarginClass: marginClass,
      sizes: '(max-width: 768px) 100vw, 50vw',
    };
  }

  if (size === 'xsmall' || size === 'x-small' || size === '2' || size === 'cols2') {
    return {
      slideWidth: 'clamp(180px, calc(2 / 12 * 100vw), calc(100vw - 2rem))',
      slideMarginClass: marginClass,
      sizes: '(max-width: 768px) 100vw, 33vw',
    };
  }

  // Default: Følger standard karusellhøyde (var(--carousel-h)) og proporsjonal bredde basert på nøyaktig sideforhold
  return {
    slideWidth: `calc(var(--carousel-h) * ${ar})`,
    slideMarginClass: marginClass,
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
  const { locale } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
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
      className={`w-full bg-white carousel-hero-container carousel-tablet-view ${
        isInline
          ? 'carousel-inline py-6 md:py-10'
          : 'project-detail-hero pt-20 pb-16'
      } overflow-hidden relative select-none cursor-default`}
    >
      <div
        className="w-full flex justify-center items-start xl:items-center carousel-band"
        style={{ height: containerHeightCss }}
      >
        <div
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1280) {
              setLightboxOpen(true);
            }
          }}
          className="relative flex items-center justify-center overflow-hidden w-full max-w-full md:max-w-[100vw] carousel-image-container carousel-static-card cursor-pointer xl:cursor-default"
          style={{
            '--aspect': effectiveAspect,
            width: dims.slideWidth,
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
        <div className="w-full px-side-padding mt-4 text-center cursor-default select-text carousel-caption">
          <ProjectLocalizedCaption
            caption={slide.caption}
            captionEn={slide.captionEn}
          />
        </div>
      )}
      <MediaLightbox
        slides={[slide]}
        initialIndex={0}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={title}
        locale={locale}
      />
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
  const { locale } = useLanguage();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
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
    if (singleSlide) {
      if (displaySlides.length === 2) {
        return [...displaySlides, ...displaySlides];
      }
      return displaySlides;
    }
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
  }, [displaySlides, isTwoSlides, singleSlide]);

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

  // Hvis 2 bilder i fler-bilde karusellmodus (!singleSlide), starter vi på index 1 (A)
  const startIndex = isTwoSlides && !singleSlide ? 1 : 0;

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
      if (isTwoSlides && !singleSlide) {
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
  }, [emblaApi, isTwoSlides, singleSlide, displaySlides.length]);

  const activeSlide = displaySlides[activeIndex];

  const containerRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const didDragStateRef = useRef(false);

  // Desktop tilstandsmaskin for karusell-peker (<, >)
  const [isDesktop, setIsDesktop] = useState(false);
  const [cursorRole, setCursorRole] = useState<'prev' | 'next' | 'default'>('default');
  const latestMousePosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(typeof window !== 'undefined' && window.innerWidth >= 1280);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Finner den sentrale aksen (X-posisjon på skjermen) for det aktive/midtstilte bildet
  const getCenterSlideAxis = useCallback((): number => {
    if (typeof window === 'undefined') return 0;
    const screenCenter = window.innerWidth / 2;
    if (!emblaApi) return screenCenter;

    const slideNodes = emblaApi.slideNodes?.() as HTMLElement[] | undefined;
    if (!slideNodes || slideNodes.length === 0) return screenCenter;

    let closestCenter = screenCenter;
    let minDistance = Infinity;

    for (let i = 0; i < slideNodes.length; i++) {
      const node = slideNodes[i];
      const imageEl =
        (node.querySelector('.carousel-image-container') as HTMLElement) ||
        (node.firstElementChild as HTMLElement) ||
        node;
      const rect = imageEl.getBoundingClientRect();

      // Ignorer slides langt utenfor synsfeltet
      if (rect.right <= -50 || rect.left >= window.innerWidth + 50) continue;

      const slideCenter = (rect.left + rect.right) / 2;
      const dist = Math.abs(slideCenter - screenCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestCenter = slideCenter;
      }
    }

    return closestCenter;
  }, [emblaApi]);

  // Oppdaterer peker (< eller >) basert på om musen er til venstre eller høyre for bildets sentrale akse
  const updateCursorOnMove = useCallback(
    (clientX: number, clientY: number) => {
      if (typeof window === 'undefined' || window.innerWidth < 1280) return;

      latestMousePosRef.current = { x: clientX, y: clientY };

      const bandEl = bandRef.current;
      if (!bandEl) return;
      const bandRect = bandEl.getBoundingClientRect();

      // Utenfor bildebåndet vertikalt -> normal cursor
      if (clientY < bandRect.top || clientY > bandRect.bottom) {
        setCursorRole('default');
        return;
      }

      const centerAxis = getCenterSlideAxis();
      setCursorRole(clientX < centerAxis ? 'prev' : 'next');
    },
    [getCenterSlideAxis]
  );

  // Lytter til global musebevegelse for umiddelbar respons over bildebåndet på desktop
  useEffect(() => {
    if (!isDesktop) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const bandEl = bandRef.current;
      if (!bandEl) return;
      const bandRect = bandEl.getBoundingClientRect();
      if (e.clientY >= bandRect.top && e.clientY <= bandRect.bottom) {
        updateCursorOnMove(e.clientX, e.clientY);
      } else {
        setCursorRole('default');
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleWindowMouseMove);
  }, [isDesktop, updateCursorOnMove]);

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

      // Mobil og tablet (< 1280px): standard touch/klikk-oppførsel
      if (typeof window !== 'undefined' && window.innerWidth < 1280) {
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

      // Desktop (>= 1280px): del karusellen i to i den sentrale aksen av bildet
      const bandEl = bandRef.current;
      if (bandEl) {
        const bandRect = bandEl.getBoundingClientRect();
        if (e.clientY < bandRect.top || e.clientY > bandRect.bottom) {
          return;
        }
      }

      e.preventDefault();
      centerInViewport();

      const engine = emblaApi.internalEngine();
      if (engine) engine.scrollBody.useDuration(18).useFriction(0.75);

      const centerAxis = getCenterSlideAxis();
      if (e.clientX < centerAxis) {
        emblaApi.scrollPrev();
      } else {
        emblaApi.scrollNext();
      }
    },
    [emblaApi, centerInViewport, getCenterSlideAxis]
  );

  // Oppdaterer peker når karusellen scroller eller finner ro dersom musen står i ro
  useEffect(() => {
    if (!emblaApi) return;
    const onUpdate = () => {
      if (latestMousePosRef.current) {
        updateCursorOnMove(latestMousePosRef.current.x, latestMousePosRef.current.y);
      }
    };
    emblaApi.on('settle', onUpdate);
    emblaApi.on('scroll', onUpdate);
    return () => {
      emblaApi.off('settle', onUpdate);
      emblaApi.off('scroll', onUpdate);
    };
  }, [emblaApi, updateCursorOnMove]);

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
        latestMousePosRef.current = null;
        setCursorRole('default');
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleSlideClick}
      className={`w-full bg-white carousel-hero-container carousel-tablet-view ${
        isInline
          ? 'carousel-inline py-6 md:py-10'
          : 'project-detail-hero pt-20 pb-16'
      } overflow-hidden relative select-none ${cursorClass}`}
    >
      <div
        className={`embla ${singleSlide ? 'overflow-hidden' : 'overflow-hidden xl:overflow-visible'} ${cursorClass}`}
        style={{ height: containerHeightCss }}
        ref={(node) => {
          emblaRef(node);
          (bandRef as any).current = node;
        }}
      >
        <div
          className="embla__container flex touch-pan-y items-start xl:items-center"
          style={{ height: containerHeightCss }}
        >
          {infiniteSlides.map((slide, index) => {
            const isInitialSlide = index === startIndex;
            const dynamicAspect = slide.videoUrl ? videoAspects[slide.videoUrl] : undefined;
            const slideAspect = dynamicAspect || slide.aspectRatio || 1.4;
            const dims = getSlideItemDimensions(
              slide,
              singleSlide,
              dynamicAspect,
              projectDominantAspect
            );

            return (
              <div
                key={`${slide.videoUrl || slide.url || index}-${index}`}
                className={`embla__slide flex-none relative min-w-0 select-none flex justify-center items-start xl:items-center ${dims.slideMarginClass} ${cursorClass}`}
                style={{
                  '--aspect': slideAspect,
                  width: singleSlide ? '100%' : 'var(--slide-w)',
                  '--slide-w-desktop': singleSlide ? '100%' : dims.slideWidth,
                  height: containerHeightCss,
                } as React.CSSProperties}
              >
                <div
                  onClick={(e) => {
                    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
                      if (!didDragStateRef.current) {
                        e.stopPropagation();
                        setLightboxIndex(index % displaySlides.length);
                      }
                    }
                  }}
                  className={`relative flex items-center justify-center overflow-hidden h-full carousel-image-container cursor-pointer xl:cursor-inherit ${cursorClass}`}
                  style={{
                    '--aspect': slideAspect,
                    width: singleSlide ? dims.slideWidth : '100%',
                    maxWidth: '100%',
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
                      className={`w-full h-full ${singleSlide || isDrawings || isInline ? 'object-contain' : 'object-contain md:object-cover'} select-none pointer-events-none`}
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
                      className={`${singleSlide || isDrawings || isInline ? 'object-contain' : 'object-contain md:object-cover'} select-none pointer-events-none`}
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
          className="w-full px-side-padding mt-4 text-center cursor-default select-text relative z-10 carousel-caption"
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
      <MediaLightbox
        slides={displaySlides}
        initialIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        title={title}
        locale={locale}
      />
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
