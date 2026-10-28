'use client';

import React, { useRef, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Locale } from '@/i18n/translations';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const switchLanguage = (newLocale: Locale) => {
    if (newLocale === locale) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const el = containerRef.current;
    if (el) {
      // Lagre den eksakte vertikale posisjonen til språkvelgeren/footeren på skjermen
      const targetTop = el.getBoundingClientRect().top;
      let isUserScrolling = false;
      let rafId: number | null = null;

      const cancelEvents = ['wheel', 'touchmove', 'keydown'] as const;
      const onUserInteraction = () => {
        isUserScrolling = true;
        cleanup();
      };

      const cleanup = () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        cancelEvents.forEach((evt) => window.removeEventListener(evt, onUserInteraction));
        cleanupRef.current = null;
      };

      cleanupRef.current = cleanup;
      cancelEvents.forEach((evt) => window.addEventListener(evt, onUserInteraction, { passive: true }));

      const startTime = performance.now();
      const duration = 1000; // Overvåk i 1000ms for å fange opp både React re-render og Next.js router.refresh()

      const keepAnchor = () => {
        if (isUserScrolling || !containerRef.current) {
          cleanup();
          return;
        }

        const currentTop = containerRef.current.getBoundingClientRect().top;
        const diff = currentTop - targetTop;

        // Hvis innholdet over har utvidet seg eller krympet, korriger scroll umiddelbart
        // slik at footeren og språkvelgeren forblir 100% i ro på skjermen.
        if (Math.abs(diff) >= 0.5) {
          window.scrollBy({ top: diff, behavior: 'instant' as ScrollBehavior });
        }

        if (performance.now() - startTime < duration) {
          rafId = requestAnimationFrame(keepAnchor);
        } else {
          cleanup();
        }
      };

      setLocale(newLocale);
      rafId = requestAnimationFrame(keepAnchor);
    } else {
      setLocale(newLocale);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      switchLanguage('en');
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      switchLanguage('no');
    }
  };

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={locale === 'en' ? 'Language switcher' : 'Språkvelger'}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center rounded-full p-[3px] bg-[#f4f4f5] border border-black/[0.04] select-none font-sans ${className}`}
    >
      {/* Glidende hvit pille-indikator */}
      <div
        aria-hidden="true"
        className={`absolute top-[3px] left-[3px] w-[32px] h-[24px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.06)] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none ${
          locale === 'no' ? 'translate-x-0' : 'translate-x-[32px]'
        }`}
      />

      <button
        type="button"
        role="radio"
        tabIndex={locale === 'no' ? 0 : -1}
        onClick={() => switchLanguage('no')}
        aria-label="Norsk"
        aria-checked={locale === 'no'}
        className={`relative z-10 flex items-center justify-center w-[32px] h-[24px] text-[12px] leading-none uppercase tracking-[0.02em] transition-colors duration-150 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20 ${
          locale === 'no'
            ? 'text-neutral-900 font-medium'
            : 'text-neutral-500 hover:text-neutral-900 font-normal'
        }`}
      >
        NO
      </button>

      <button
        type="button"
        role="radio"
        tabIndex={locale === 'en' ? 0 : -1}
        onClick={() => switchLanguage('en')}
        aria-label="English"
        aria-checked={locale === 'en'}
        className={`relative z-10 flex items-center justify-center w-[32px] h-[24px] text-[12px] leading-none uppercase tracking-[0.02em] transition-colors duration-150 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20 ${
          locale === 'en'
            ? 'text-neutral-900 font-medium'
            : 'text-neutral-500 hover:text-neutral-900 font-normal'
        }`}
      >
        EN
      </button>
    </div>
  );
}
