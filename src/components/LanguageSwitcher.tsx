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

  return (
    <div
      ref={containerRef}
      className={`inline-flex items-center gap-2 text-[0.9375rem] leading-none ${className}`}
    >
      <button
        type="button"
        onClick={() => switchLanguage('no')}
        aria-label="Bytt språk til norsk"
        aria-pressed={locale === 'no'}
        className={`cursor-pointer transition-opacity text-left ${
          locale === 'no'
            ? 'underline underline-offset-4 decoration-1 font-normal opacity-100 text-black'
            : 'opacity-40 hover:opacity-80 text-black'
        }`}
      >
        No
      </button>
      <span className="opacity-30 select-none text-black">/</span>
      <button
        type="button"
        onClick={() => switchLanguage('en')}
        aria-label="Switch language to English"
        aria-pressed={locale === 'en'}
        className={`cursor-pointer transition-opacity text-left ${
          locale === 'en'
            ? 'underline underline-offset-4 decoration-1 font-normal opacity-100 text-black'
            : 'opacity-40 hover:opacity-80 text-black'
        }`}
      >
        Eng
      </button>
    </div>
  );
}
