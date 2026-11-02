'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
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
  actionLink?: {
    href: string;
    label: string;
  };
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Sync index når initialIndex endres
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

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

  // Tastatursnarveier (Escape, piler)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, slides.length, currentIndex]);

  const goToPrev = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  }, [slides.length]);

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Touch- og gest-håndtering (pinch-to-zoom, pan og swipe)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchStartDistRef = useRef<number | null>(null);
  const startScaleRef = useRef(1);
  const startPosRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      startPosRef.current = { ...position };
      setIsDragging(true);

      // Dobbelttrykk for å zoome inn / ut
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        if (scale > 1) {
          resetZoom();
        } else {
          setScale(2.5);
        }
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    } else if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      startScaleRef.current = scale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      // Pinch to zoom
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / touchStartDistRef.current;
      const newScale = Math.min(Math.max(1, startScaleRef.current * ratio), 4);
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && touchStartRef.current && scale > 1) {
      // Pan når zoomet inn
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      setPosition({
        x: startPosRef.current.x + dx,
        y: startPosRef.current.y + dy,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);

    if (e.touches.length === 0) {
      if (touchStartDistRef.current !== null) {
        touchStartDistRef.current = null;
        if (scale < 1.05) {
          resetZoom();
        }
      }

      // Swipe venstre/høyre for neste/forrige når ikke zoomet
      if (scale === 1 && touchStartRef.current) {
        const touchEnd = e.changedTouches[0];
        const dx = touchEnd.clientX - touchStartRef.current.x;
        const dy = touchEnd.clientY - touchStartRef.current.y;

        // Horisontalt sveip
        if (Math.abs(dx) > 50 && Math.abs(dy) < 80) {
          if (dx < 0) {
            goToNext();
          } else {
            goToPrev();
          }
        } else if (dy > 100 && Math.abs(dx) < 60) {
          // Sveip ned for å lukke
          onClose();
        }
      }
      touchStartRef.current = null;
    }
  };

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
      {/* Topplinje: Tittel / teller / zoom / lukk */}
      <div className="w-full flex items-center justify-between px-4 md:px-6 py-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3 text-[0.875rem] font-mono opacity-80">
          <span>{currentIndex + 1} / {slides.length}</span>
          {title && <span className="hidden sm:inline opacity-60">· {title}</span>}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom kontroller */}
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            title="Zoom ut"
            className="w-9 h-9 flex items-center justify-center hover:opacity-70 transition-opacity disabled:opacity-20 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>

          <button
            type="button"
            onClick={resetZoom}
            title="Tilbakestill zoom"
            className="px-2 py-1 text-[0.8125rem] font-mono opacity-80 hover:opacity-100 cursor-pointer"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 4}
            title="Zoom inn"
            className="w-9 h-9 flex items-center justify-center hover:opacity-70 transition-opacity disabled:opacity-20 cursor-pointer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>

          {/* Lukk-knapp */}
          <button
            type="button"
            onClick={onClose}
            title="Lukk (Esc)"
            className="w-9 h-9 ml-2 flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Hovedvisning: Bildet / Videoen ubeskåret */}
      <div
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Forrige-knapp (vises på større skjermer) */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Forrige bilde"
            className="absolute left-3 md:left-6 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Neste-knapp */}
        {slides.length > 1 && (
          <button
            type="button"
            onClick={goToNext}
            aria-label="Neste bilde"
            className="absolute right-3 md:right-6 z-10 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* Selve mediet med transform scale og pan */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
            transitionDuration: isDragging ? '0ms' : '200ms',
            cursor: scale > 1 ? 'grab' : 'zoom-in',
          }}
          onClick={(e) => {
            // Klikk på bildet: zoomer inn / ut hvis ikke dratt
            if (scale === 1) {
              setScale(2);
            } else {
              resetZoom();
            }
          }}
        >
          {currentSlide.videoUrl ? (
            <video
              src={currentSlide.videoUrl}
              poster={currentSlide.posterUrl}
              controls
              playsInline
              autoPlay
              className="max-w-[95vw] max-h-[80vh] object-contain select-none"
            />
          ) : currentSlide.url ? (
            <div className="relative w-[95vw] h-[80vh] max-w-full max-h-full flex items-center justify-center">
              <SanityImage
                src={currentSlide.url}
                alt={currentSlide.alt || title || 'Bilde'}
                fill
                quality={95}
                hotspot={currentSlide.hotspot}
                lqip={currentSlide.lqip}
                loading="eager"
                fetchPriority="high"
                className="object-contain select-none pointer-events-none"
                sizes="100vw"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Bunnlinje: Bildetekst, handling og hjelpetekst */}
      <div className="w-full px-4 md:px-6 py-4 z-20 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-2">
        {caption ? (
          <p className="text-[0.9375rem] md:text-[1rem] text-white/90 text-center max-w-2xl line-clamp-2">
            {caption}
          </p>
        ) : (
          <p className="text-[0.75rem] font-mono text-white/40 text-center">
            {scale > 1 ? 'Dra for å panorere' : 'Dobbelttrykk eller klyp for å zoome'}
          </p>
        )}

        {currentSlide.actionLink && (
          <Link
            href={currentSlide.actionLink.href}
            onClick={onClose}
            className="mt-1 inline-flex items-center px-4 py-1.5 rounded-full bg-white text-black text-[0.875rem] font-medium hover:bg-white/90 transition-colors pointer-events-auto cursor-pointer"
          >
            <span>{currentSlide.actionLink.label}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
