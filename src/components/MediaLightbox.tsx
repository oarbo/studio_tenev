'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import SanityImage, { SanityHotspot } from './SanityImage';

export interface LightboxSlide {
  url?: string;
  videoUrl?: string;
  posterUrl?: string;
  alt?: string;
  caption?: string;
  captionEn?: string;
  hotspot?: SanityHotspot;
  lqip?: string;
}

interface MediaLightboxProps {
  slides: LightboxSlide[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  locale?: string;
}

export default function MediaLightbox({
  slides,
  initialIndex,
  isOpen,
  onClose,
  title,
  locale = 'no',
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [slideHoverRole, setSlideHoverRole] = useState<'prev' | 'next'>('next');
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: initialIndex,
    loop: slides.length > 1,
    align: 'center',
    duration: 20,
    dragFree: false,
    skipSnaps: false,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Sync index når initialIndex eller isOpen endres
  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(initialIndex);
    if (emblaApi) {
      emblaApi.scrollTo(initialIndex, true);
    }
  }, [initialIndex, isOpen, emblaApi]);

  // Lås bakgrunns-scroll når lightbox er åpen
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Tastatursnarveier (Escape, piler)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, scrollPrev, scrollNext, onClose]);

  // Horisontal trackpad-swipe navigerer slides
  useEffect(() => {
    if (!isOpen || !emblaApi) return;
    const node = emblaApi.rootNode();
    if (!node) return;

    let accumulatedDeltaX = 0;
    let swipeCooldown = false;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 15) {
        e.preventDefault();
        if (swipeCooldown) return;

        accumulatedDeltaX += e.deltaX;
        if (accumulatedDeltaX > 50) {
          scrollNext();
          swipeCooldown = true;
          accumulatedDeltaX = 0;
          setTimeout(() => { swipeCooldown = false; }, 350);
        } else if (accumulatedDeltaX < -50) {
          scrollPrev();
          swipeCooldown = true;
          accumulatedDeltaX = 0;
          setTimeout(() => { swipeCooldown = false; }, 350);
        }
      } else {
        accumulatedDeltaX = 0;
      }
    };

    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, emblaApi, scrollNext, scrollPrev]);

  const updateCursorSide = useCallback((clientX: number) => {
    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = (clientX - rect.left) / rect.width;
    setSlideHoverRole(ratio < 0.5 ? 'prev' : 'next');
  }, []);

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

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    if (slides.length <= 1 || !viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (ratio < 0.5) {
      scrollPrev();
    } else {
      scrollNext();
    }
  }, [slides.length, scrollPrev, scrollNext]);

  if (!isOpen || slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];
  const caption = locale === 'en'
    ? (currentSlide.captionEn || currentSlide.caption)
    : (currentSlide.caption || currentSlide.captionEn);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bildevisning"
      className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-sm text-white flex flex-col justify-between select-none animate-in fade-in duration-200"
    >
      {/* Topplinje: Teller og prosjektnavn / lukk */}
      <div className="w-full flex items-center justify-between px-4 md:px-6 py-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3 text-white font-sans text-[0.9375rem] md:text-[1rem] leading-none">
          <span className="tabular-nums">{currentIndex + 1}&nbsp;/&nbsp;{slides.length}</span>
          {title && <span>{title}</span>}
        </div>

        {/* Lukk-knapp */}
        <button
          type="button"
          onClick={onClose}
          title="Lukk (Esc)"
          aria-label="Lukk"
          className="w-9 h-9 flex items-center justify-center text-white hover:opacity-70 transition-opacity cursor-pointer z-30"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Hovedvisning: Embla-karusell */}
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        className={`relative flex-1 w-full h-full flex items-center justify-center overflow-hidden touch-pan-y ${
          slides.length > 1
            ? slideHoverRole === 'prev'
              ? 'cursor-carousel-prev-white'
              : 'cursor-carousel-next-white'
            : 'cursor-default'
        }`}
      >
        <div className="w-full h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center relative select-none px-4"
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
                    className="max-w-[95vw] max-h-[80vh] object-contain select-none pointer-events-none"
                  />
                ) : slide.url ? (
                  <div className="relative w-[95vw] h-[80vh] max-w-full max-h-full flex items-center justify-center">
                    <SanityImage
                      src={slide.url}
                      alt={slide.alt || slide.caption || title || `Bilde ${idx + 1}`}
                      fill
                      quality={95}
                      hotspot={slide.hotspot}
                      lqip={slide.lqip}
                      loading={Math.abs(idx - currentIndex) <= 1 ? 'eager' : 'lazy'}
                      fetchPriority={idx === currentIndex ? 'high' : 'auto'}
                      className="object-contain select-none pointer-events-none"
                      sizes="100vw"
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bunnlinje: Bildetekst hvis tilgjengelig */}
      <div className="w-full px-4 md:px-6 py-4 z-20 min-h-[56px] flex items-center justify-center pointer-events-none">
        {caption ? (
          <p className="text-[0.9375rem] md:text-[1rem] font-sans text-white text-center max-w-2xl line-clamp-2">
            {caption}
          </p>
        ) : null}
      </div>
    </div>
  );
}
