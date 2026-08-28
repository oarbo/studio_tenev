'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface GapRegion {
  id: string;
  top: number;
  height: number;
  label: string;
}

export default function GridOverlay() {
  const [gridVisible, setGridVisible] = useState(false);
  const [spacingVisible, setSpacingVisible] = useState(false);
  const [gaps, setGaps] = useState<GapRegion[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    // Les lagrede preferanser fra localStorage
    const savedGrid = localStorage.getItem('studiotenev_grid_overlay');
    const savedSpacing = localStorage.getItem('studiotenev_spacing_overlay');
    
    let initTimer: NodeJS.Timeout | undefined;
    if (savedGrid !== null || savedSpacing !== null) {
      initTimer = setTimeout(() => {
        if (savedGrid !== null) setGridVisible(savedGrid === 'true');
        if (savedSpacing !== null) setSpacingVisible(savedSpacing === 'true');
      }, 0);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName) ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // 'G' toggler kolonne-grid (blå)
      if (e.key === 'g' || e.key === 'G') {
        setGridVisible((prev) => {
          const next = !prev;
          localStorage.setItem('studiotenev_grid_overlay', String(next));
          return next;
        });
      }

      // 'V' toggler dynamisk vertikalt mellomrom / InDesign lilla linjer
      if (e.key === 'v' || e.key === 'V') {
        setSpacingVisible((prev) => {
          const next = !prev;
          localStorage.setItem('studiotenev_spacing_overlay', String(next));
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (initTimer) clearTimeout(initTimer);
    };
  }, []);

  // Deterministisk og universell skanning av 168px vertikale mellomrom på alle sider
  const scanGaps = useCallback(() => {
    if (!spacingVisible) return;

    const pageYOffset = window.scrollY;
    const detectedGaps: GapRegion[] = [];

    // 1. Toppmarg (fra toppen av vinduet ned til innholdet)
    const topEl = document.querySelector('.pt-content-top, main.pt-\\[168px\\], .pt-\\[168px\\]') as HTMLElement;
    if (topEl) {
      detectedGaps.push({
        id: 'top-gap-system',
        top: 0,
        height: 168,
        label: 'Toppmarg: 168px (5 blanklinjer)',
      });
    }

    // 2. CSS Grid beholdere med eksplisitt gap-y-[168px]
    const gridContainers = Array.from(
      document.querySelectorAll('[class*="gap-y-[168px]"], [class*="gap-y-168"], .gap-y-168')
    ) as HTMLElement[];
    gridContainers.forEach((container, cIdx) => {
      const children = Array.from(container.children).filter((child) => {
        const style = getComputedStyle(child);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.position !== 'absolute';
      }) as HTMLElement[];

      for (let i = 0; i < children.length - 1; i++) {
        const rect1 = children[i].getBoundingClientRect();
        const rect2 = children[i + 1].getBoundingClientRect();

        const gapTop = Math.round(rect1.bottom + pageYOffset);
        const gapBottom = Math.round(rect2.top + pageYOffset);
        const gapHeight = Math.max(168, Math.round(gapBottom - gapTop));

        detectedGaps.push({
          id: `grid-gap-${cIdx}-${i}`,
          top: gapTop,
          height: gapHeight,
          label: 'Mellomrom: 168px (5 blanklinjer)',
        });
      }
    });

    // 3. Generisk layout-blokk skanner (fanger opp alle andre 168px seksjonsoverganger)
    const selectorList = [
      'header',
      'footer',
      'section',
      'article',
      'figure',
      'main [class*="col-start-"]',
      'main [class*="col-span-"]',
      '.news-content',
      '.cf-item',
    ].join(',');

    const rawElements = Array.from(document.querySelectorAll(selectorList)) as HTMLElement[];
    const validBlocks: { top: number; bottom: number; height: number; el: HTMLElement }[] = [];

    rawElements.forEach((el) => {
      const style = getComputedStyle(el);
      if (
        el.closest('.z-\\[99999\\]') ||
        el.closest('.z-\\[99990\\]') ||
        el.closest('.z-\\[99991\\]') ||
        style.position === 'fixed' ||
        style.position === 'absolute' ||
        style.display === 'none' ||
        style.visibility === 'hidden'
      ) {
        return;
      }

      const rect = el.getBoundingClientRect();
      if (rect.height < 15 || rect.width < 15) return;

      const top = Math.round(rect.top + pageYOffset);
      const bottom = Math.round(rect.bottom + pageYOffset);
      validBlocks.push({ top, bottom, height: rect.height, el });
    });

    const topLevelBlocks = validBlocks.filter((b) => {
      return !validBlocks.some((other) => other.el !== b.el && other.el.contains(b.el));
    });

    topLevelBlocks.sort((a, b) => a.top - b.top);

    const mergedBands: { top: number; bottom: number }[] = [];
    topLevelBlocks.forEach((b) => {
      if (mergedBands.length === 0) {
        mergedBands.push({ top: b.top, bottom: b.bottom });
      } else {
        const last = mergedBands[mergedBands.length - 1];
        if (b.top <= last.bottom + 8) {
          last.bottom = Math.max(last.bottom, b.bottom);
        } else {
          mergedBands.push({ top: b.top, bottom: b.bottom });
        }
      }
    });

    for (let i = 0; i < mergedBands.length - 1; i++) {
      const gapTop = mergedBands[i].bottom;
      const gapBottom = mergedBands[i + 1].top;
      const gapHeight = Math.round(gapBottom - gapTop);

      if (Math.abs(gapHeight - 168) <= 50) {
        detectedGaps.push({
          id: `gap-${i}`,
          top: gapTop,
          height: gapHeight,
          label: 'Mellomrom: 168px (5 blanklinjer)',
        });
      }
    }

    // 4. Sjekk eksplisitt mellomrommet før footer (fra siste innholdsblokk ned til footer)
    const footerEl = document.querySelector('footer') as HTMLElement;
    if (footerEl) {
      const footerRect = footerEl.getBoundingClientRect();
      const footerTop = Math.round(footerRect.top + pageYOffset);

      const mainContentElements = Array.from(
        document.querySelectorAll('main section, main article, main [class*="col-span-"], main [class*="col-start-"], main > div > div')
      ) as HTMLElement[];

      let maxBottom = 0;
      mainContentElements.forEach((el) => {
        const style = getComputedStyle(el);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.position !== 'absolute') {
          const rect = el.getBoundingClientRect();
          const b = Math.round(rect.bottom + pageYOffset);
          if (b > maxBottom && b <= footerTop) {
            maxBottom = b;
          }
        }
      });

      if (maxBottom > 0 && footerTop > maxBottom) {
        const gapHeight = Math.round(footerTop - maxBottom);
        if (Math.abs(gapHeight - 168) <= 50 || gapHeight >= 140) {
          detectedGaps.push({
            id: 'footer-gap-system',
            top: maxBottom,
            height: gapHeight > 0 ? gapHeight : 168,
            label: 'Mellomrom: 168px (5 blanklinjer)',
          });
        }
      }
    }

    // Filtrer duplikater basert på topp-posisjon
    const uniqueGaps: GapRegion[] = [];
    detectedGaps.forEach((g) => {
      if (!uniqueGaps.some((existing) => Math.abs(existing.top - g.top) < 15)) {
        uniqueGaps.push(g);
      }
    });

    setGaps(uniqueGaps);
  }, [spacingVisible]);

  useEffect(() => {
    if (!spacingVisible) return;

    const initTimer = setTimeout(() => scanGaps(), 0);

    const handleResize = () => scanGaps();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, { passive: true });

    const observer = new MutationObserver(() => scanGaps());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    const timer = setTimeout(scanGaps, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
      observer.disconnect();
      clearTimeout(timer);
      clearTimeout(initTimer);
    };
  }, [spacingVisible, pathname, scanGaps]);

  // Ikke vis grid eller hjelpelinjer på Sanity Admin-siden (/admin)
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const toggleGrid = () => {
    setGridVisible((prev) => {
      const next = !prev;
      localStorage.setItem('studiotenev_grid_overlay', String(next));
      return next;
    });
  };

  const toggleSpacing = () => {
    setSpacingVisible((prev) => {
      const next = !prev;
      localStorage.setItem('studiotenev_spacing_overlay', String(next));
      return next;
    });
  };

  return (
    <>
      {/* UX Controls Panel i nedre høyre hjørne */}
      <div className="fixed bottom-4 right-4 z-99999 flex items-center gap-2 select-none">
        {/* Kolonne Grid Knapp (Blå) */}
        <button
          onClick={toggleGrid}
          title="Toggle Kolonne-Grid (Snarvei: G)"
          className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 shadow-md border cursor-pointer ${
            gridVisible
              ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20'
              : 'bg-white/95 text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-black'
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${gridVisible ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            Grid {gridVisible ? 'ON' : 'OFF'}
            <kbd className={`px-1 py-0.5 text-[10px] rounded font-semibold ${gridVisible ? 'bg-blue-700 text-blue-100' : 'bg-gray-200 text-gray-600'}`}>
              G
            </kbd>
          </span>
        </button>

        {/* Dynamisk Vertikalt Mellomrom Knapp (InDesign Lilla) */}
        <button
          onClick={toggleSpacing}
          title="Toggle Dynamisk Vertikalt Mellomrom / InDesign-linjer (Snarvei: V)"
          className={`px-3 py-1.5 rounded-full text-xs font-mono tracking-wider transition-all duration-200 shadow-md border cursor-pointer ${
            spacingVisible
              ? 'bg-purple-600 text-white border-purple-700 shadow-purple-500/20'
              : 'bg-white/95 text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-black'
          }`}
        >
          <span className="inline-flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${spacingVisible ? 'bg-white animate-pulse' : 'bg-gray-400'}`} />
            Spacing {spacingVisible ? 'ON' : 'OFF'}
            <kbd className={`px-1 py-0.5 text-[10px] rounded font-semibold ${spacingVisible ? 'bg-purple-700 text-purple-100' : 'bg-gray-200 text-gray-600'}`}>
              V
            </kbd>
          </span>
        </button>
      </div>

      {/* 1. Kolonne-grid (Blå tone) */}
      {gridVisible && (
        <div className="fixed inset-0 w-full h-full pointer-events-none z-99990 flex justify-center">
          <div className="w-full h-full px-side-padding">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 w-full h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-full bg-blue-500/10 border-x border-blue-500/20 relative ${
                    i >= 1 ? 'hidden md:block' : ''
                  }`}
                >
                  <span className="absolute top-2 left-2 text-[10px] font-mono text-blue-600/70 font-semibold select-none">
                    Col {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Dynamisk Vertikalt Mellomrom & InDesign Lilla Linjer (Treffer nøyaktig der blokkene slutter) */}
      {spacingVisible && (
        <div className="absolute top-0 left-0 w-full pointer-events-none z-99991">
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="absolute left-0 w-full bg-purple-500/15 border-y-2 border-purple-600 flex items-center justify-between px-side-padding transition-all duration-150"
              style={{
                top: `${gap.top}px`,
                height: `${gap.height}px`,
              }}
            >
              {/* InDesign lilla topp- og bunn-linje markør */}
              <div className="w-full h-full flex items-center justify-end relative">
                <span className="text-[11px] font-mono text-purple-900 bg-purple-100/95 px-2 py-0.5 rounded border border-purple-400 font-semibold shadow-xs select-none">
                  {gap.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
