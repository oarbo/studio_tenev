'use client';

import React, { ReactNode, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SanityHotspot } from './SanityImage';
import { useLanguage } from '@/i18n/LanguageContext';
import { useWorkCategory, WorkCategory } from '@/context/WorkCategoryContext';

interface HeaderProps {
  sticky?: boolean;
  projectTitle?: ReactNode | string;
  projectTitleEn?: string;
  heroImage?: string;
  heroImageLqip?: string;
  heroImageHotspot?: SanityHotspot;
  heroTextColor?: 'auto' | 'white' | 'black';
}

interface CachedLuminanceMap {
  width: number;
  height: number;
  /** Luminans (0–255) per piksel, rad-for-rad */
  lum: Uint8Array;
}

/**
 * Dekoder bildet kun ÉN gang til en lettvekts luminans-tabell i minnet (ca. 15–20 KB).
 * Dermed trenger vi aldri å opprette <canvas> eller kjøre getImageData() ved resize.
 */
function buildLuminanceMap(img: HTMLImageElement): CachedLuminanceMap | null {
  try {
    const srcW = img.naturalWidth || img.width;
    const srcH = img.naturalHeight || img.height;
    if (!srcW || !srcH) return null;

    // Skaler ned til maks 160px bredde for lynrask oppslag med høy presisjon
    const width = Math.min(160, srcW);
    const height = Math.max(1, Math.round((srcH / srcW) * width));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, width, height);
    const rgba = ctx.getImageData(0, 0, width, height).data;
    const lum = new Uint8Array(width * height);

    for (let i = 0, p = 0; i < lum.length; i++, p += 4) {
      lum[i] = Math.round(0.2126 * rgba[p] + 0.7152 * rgba[p + 1] + 0.0722 * rgba[p + 2]);
    }

    return { width, height, lum };
  } catch {
    return null;
  }
}

/**
 * Gjør et rent matematisk oppslag i minnet (< 0.01 ms, ingen DOM/Canvas-allokering)
 * for de faktiske posisjonene til tekst-elementene i headeren mot det beskårne bildet.
 */
function computeHeaderIsDarkFromMap(
  map: CachedLuminanceMap,
  hotspot: SanityHotspot | undefined,
  textElements: (HTMLElement | null)[]
): boolean {
  const heroEl = document.querySelector('[data-hero-image]');
  const heroRect = heroEl?.getBoundingClientRect();
  const viewW = heroRect && heroRect.width > 0 ? heroRect.width : window.innerWidth;
  const viewH = heroRect && heroRect.height > 0 ? heroRect.height : window.innerHeight;
  const heroLeft = heroRect ? heroRect.left : 0;

  const { width: imgW, height: imgH, lum } = map;
  const posX = hotspot && typeof hotspot.x === 'number' ? hotspot.x : 0.5;
  const posY = hotspot && typeof hotspot.y === 'number' ? hotspot.y : 0.5;

  // Eksakt samme matte som CSS object-fit: cover + object-position
  const scale = Math.max(viewW / imgW, viewH / imgH);
  const renderedW = imgW * scale;
  const renderedH = imgH * scale;
  const cropX = (renderedW - viewW) * posX;
  const cropY = (renderedH - viewH) * posY;

  // Mål gjennomsnittlig luminans innenfor et rektangel i viewport-koordinater (relativt til toppen av bildet)
  const sampleViewportBox = (boxLeft: number, boxTop: number, boxWidth: number, boxHeight: number): number => {
    const x0 = Math.max(0, Math.min(imgW - 1, Math.floor((cropX + boxLeft) / scale)));
    const x1 = Math.max(x0, Math.min(imgW - 1, Math.ceil((cropX + boxLeft + boxWidth) / scale)));
    const y0 = Math.max(0, Math.min(imgH - 1, Math.floor((cropY + boxTop) / scale)));
    const y1 = Math.max(y0, Math.min(imgH - 1, Math.ceil((cropY + boxTop + boxHeight) / scale)));

    let sum = 0;
    let count = 0;
    for (let y = y0; y <= y1; y++) {
      const rowOffset = y * imgW;
      for (let x = x0; x <= x1; x++) {
        sum += lum[rowOffset + x];
        count++;
      }
    }
    return count > 0 ? sum / count : 255;
  };

  const rootPx = getRootFontSize();
  const defaultTop = 1.3 * rootPx;
  const defaultHeight = 1.33 * rootPx;

  const zoneLuminances: number[] = [];

  for (const el of textElements) {
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;
    // Bruk tekstens horisontale plassering og dens u-transformerte hvileposisjon i toppen av bildet
    const relLeft = Math.max(0, rect.left - heroLeft);
    const relTop = el.offsetTop > 0 ? el.offsetTop : defaultTop;
    zoneLuminances.push(sampleViewportBox(relLeft, relTop, rect.width, rect.height));
  }

  // Fallback dersom ref-elementer ikke er målt ennå
  if (zoneLuminances.length === 0) {
    zoneLuminances.push(
      sampleViewportBox(viewW * 0.02, defaultTop, viewW * 0.16, defaultHeight),
      sampleViewportBox(viewW * 0.42, defaultTop, viewW * 0.16, defaultHeight),
      sampleViewportBox(viewW * 0.78, defaultTop, viewW * 0.20, defaultHeight)
    );
  }

  const meanLum = zoneLuminances.reduce((a, b) => a + b, 0) / zoneLuminances.length;
  const maxZoneLum = Math.max(...zoneLuminances);

  // Hvis noen av tekstsonene har fått lys bakgrunn (f.eks. lys himmel >= 155),
  // blir hvit tekst uleselig mot det lyse partiet -> bytt til sort tekst.
  // Ellers bruk hvit tekst når snittluminansen i tekstsonene er mørk (< 140).
  if (maxZoneLum >= 155) {
    return false;
  }
  return meanLum < 140;
}

function getRootFontSize(): number {
  if (typeof window === 'undefined') return 16;
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

export default function Header({ 
  projectTitle, 
  projectTitleEn,
  heroImage, 
  heroImageLqip,
  heroImageHotspot,
  heroTextColor = 'auto' 
}: HeaderProps) {
  const { locale, t } = useLanguage();
  const { activeCategory, setCategory } = useWorkCategory();
  const displayProjectTitle = (locale === 'en' && projectTitleEn) ? projectTitleEn : projectTitle;
  const pathname = usePathname();
  const [isDarkHero, setIsDarkHero] = useState(heroTextColor === 'white');
  const [isPastHero, setIsPastHero] = useState(false);

  const leftRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const lumMapRef = useRef<CachedLuminanceMap | null>(null);

  // Rekalkulerer kun fra tabellen i minnet (< 0.01 ms)
  const evaluateContrast = () => {
    if (heroTextColor === 'white') {
      setIsDarkHero(true);
      return;
    }
    if (heroTextColor === 'black') {
      setIsDarkHero(false);
      return;
    }
    const map = lumMapRef.current;
    if (!map) return;
    const isDark = computeHeaderIsDarkFromMap(map, heroImageHotspot, [
      leftRef.current,
      titleRef.current,
      rightRef.current,
    ]);
    setIsDarkHero(isDark);
  };

  // Dekod bildet kun ved sidelasting (først LQIP umiddelbart, deretter skarpt 160px miniatyrbilde)
  useEffect(() => {
    if (!heroImage && !heroImageLqip) {
      lumMapRef.current = null;
      setIsDarkHero(false);
      return;
    }

    if (heroTextColor === 'white') {
      setIsDarkHero(true);
      return;
    }
    if (heroTextColor === 'black') {
      setIsDarkHero(false);
      return;
    }

    let isMounted = true;

    const loadAndDecode = (src: string, isHighRes: boolean) => {
      const img = new Image();
      if (src.startsWith('http')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = src;
      img.onload = () => {
        if (!isMounted) return;
        // Ikke la en treg LQIP overskrive det skarpe miniatyrbildet
        if (!isHighRes && lumMapRef.current && lumMapRef.current.width > 30) return;
        const map = buildLuminanceMap(img);
        if (map) {
          lumMapRef.current = map;
          evaluateContrast();
        }
      };
    };

    // 1. Umiddelbar 0ms analyse fra innebygd base64 LQIP
    if (heroImageLqip) {
      loadAndDecode(heroImageLqip, false);
    }

    // 2. Nøyaktig, u-blurret 160px analyse (~3 KB) for skarpe overganger mellom himmel og bygg/vegetasjon
    if (heroImage) {
      let thumbSrc = heroImage;
      if (thumbSrc.includes('cdn.sanity.io') && !thumbSrc.includes('?w=')) {
        thumbSrc += '?w=160&auto=format';
      }
      loadAndDecode(thumbSrc, true);
    }

    return () => {
      isMounted = false;
    };
  }, [heroImage, heroImageLqip, heroImageHotspot, heroTextColor]);

  // Hendelsesstyrt scroll + ResizeObserver (ingen bakgrunnspolling, rAF-throttlet)
  useEffect(() => {
    let rafId: number | null = null;

    const updateHeaderState = () => {
      rafId = null;
      const rootPx = getRootFontSize();
      const el = titleRef.current;

      if (heroImage) {
        const hero = document.querySelector('[data-hero-image]');
        const headerCenter = el
          ? el.offsetTop + el.offsetHeight / 2
          : (1.3 + 0.67) * rootPx;
        const heroBottom = hero
          ? hero.getBoundingClientRect().bottom
          : window.innerHeight - window.scrollY;
        setIsPastHero(heroBottom <= headerCenter);
      } else {
        setIsPastHero(false);
      }

      if (el && projectTitle) {
        const first = document.querySelector('#project-details > div > *');
        if (!first) {
          el.style.transform = '';
        } else {
          const gap = 1.33 * rootPx;
          const restBottom = el.offsetTop + el.offsetHeight;
          const textTop = first.getBoundingClientRect().top;
          const dy = Math.min(0, textTop - gap - restBottom);
          el.style.transform = `translateY(${dy}px)`;
        }
      }
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateHeaderState);
      }
    };

    let resizeRafId: number | null = null;
    const handleGeometryChange = () => {
      if (resizeRafId === null) {
        resizeRafId = window.requestAnimationFrame(() => {
          resizeRafId = null;
          evaluateContrast();
          updateHeaderState();
        });
      }
    };

    updateHeaderState();
    evaluateContrast();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', handleGeometryChange, { passive: true });

    // Lytt direkte på størrelsesendringer på hero-containeren via ResizeObserver
    const heroEl = document.querySelector('[data-hero-image]');
    let resizeObserver: ResizeObserver | null = null;
    if (heroEl && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleGeometryChange);
      resizeObserver.observe(heroEl);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleGeometryChange);
      if (resizeObserver) resizeObserver.disconnect();
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (resizeRafId !== null) window.cancelAnimationFrame(resizeRafId);
    };
  }, [heroImage, heroImageHotspot, heroTextColor, projectTitle, pathname]);

  // Kun to rene tilstander: Hvit over mørkt forsidebilde, alltid Sort så snart man scroller forbi
  const isWhiteText = isDarkHero && !isPastHero;
  const textColorClass = isWhiteText ? 'text-white' : 'text-black';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lukk mobilmeny ved ruteendring
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lås scrolling i bakgrunnen når mobilmenyen er åpen
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: t('work'), href: '/work', key: 'work' },
    { name: t('studio'), href: '/studio', key: 'studio' },
    { name: t('news'), href: '/news', key: 'news' },
  ];

  return (
    <>
      <header 
        className="fixed top-0 left-0 w-full z-[9999] bg-transparent pointer-events-none flex justify-center"
        style={{ paddingTop: '1.3em' }}
      >
        {/* TOP RIGHT: Desktop Navigation & Mobile Menu Button */}
        <div 
          ref={rightRef}
          className="absolute right-0 px-side-padding pointer-events-auto"
        >
          {/* Desktop Nav */}
          <nav className={`hidden md:flex justify-end text-[1.33rem] font-normal ${textColorClass}`}>
            <ul className="flex gap-[1em] leading-tight whitespace-nowrap">
              {navLinks.map((link) => {
                const isActive = 
                  pathname === link.href || 
                  pathname.startsWith(link.href + '/') ||
                  (link.key === 'work' && pathname.startsWith('/projects/'));
                  
                return (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      prefetch={true}
                      className={`hover:underline hover:underline-offset-4 hover:decoration-1 ${isActive ? 'underline underline-offset-4 decoration-1' : ''}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? (locale === 'en' ? 'Close menu' : 'Lukk meny') : (locale === 'en' ? 'Open menu' : 'Åpne meny')}
            className={`flex md:hidden items-center justify-end text-[1.33rem] font-normal leading-tight cursor-pointer hover:underline underline-offset-4 decoration-1 bg-transparent border-0 p-0 ${textColorClass}`}
          >
            {isMobileMenuOpen ? (locale === 'en' ? 'Close' : 'Lukk') : (locale === 'en' ? 'Menu' : 'Meny')}
          </button>
        </div>

        {/* TOP LEFT: Site Title (Logo) */}
        <div
          ref={leftRef}
          className="absolute left-0 px-side-padding pointer-events-auto flex flex-col items-start"
        >
          <Link
            href="/"
            prefetch={true}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`whitespace-nowrap leading-tight text-[1.33rem] font-normal ${textColorClass}`}
          >
            Studio Tenev
          </Link>
        </div>

        {/* TOP CENTER: Categories on /work OR Project Title on detail page */}
        {displayProjectTitle ? (
          <div ref={titleRef} className="absolute left-1/2 -translate-x-1/2 pointer-events-auto flex items-center h-[2.13rem] -mt-[0.4rem] max-w-[calc(100%-14rem)] md:max-w-[calc(100%-18rem)] overflow-hidden">
            <span className={`whitespace-nowrap truncate py-[0.2em] leading-tight text-[1.15rem] md:text-[1.33rem] font-normal ${textColorClass}`}>
              {displayProjectTitle}
            </span>
          </div>
        ) : pathname === '/work' ? (
          <div ref={titleRef} className="absolute left-1/2 -translate-x-1/2 pointer-events-auto hidden md:block pt-[0.29rem]">
            <nav className={`text-[1rem] font-normal ${textColorClass}`}>
              <ul className="flex gap-[1em] leading-tight whitespace-nowrap">
                {[
                  { key: 'all' as WorkCategory, label: t('viewAll') },
                  { key: 'bolig' as WorkCategory, label: t('categoryResidential') },
                  { key: 'naering' as WorkCategory, label: t('categoryCommercial') },
                  { key: 'destinasjonsutvikling' as WorkCategory, label: t('categoryDestination') },
                ].map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <li key={cat.key}>
                      <button
                        type="button"
                        onClick={() => setCategory(cat.key)}
                        className={`cursor-pointer p-0 m-0 leading-tight bg-transparent border-0 font-normal hover:underline hover:underline-offset-4 hover:decoration-1 ${
                          isActive ? 'underline underline-offset-4 decoration-1 font-normal' : ''
                        }`}
                      >
                        {cat.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        ) : null}
      </header>

      {/* Fullskjerm minimalistisk mobilmeny */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-white text-black flex flex-col justify-between px-side-padding pt-[5.5rem] pb-10 md:hidden animate-in fade-in duration-200">
          <nav className="flex flex-col gap-6 text-[2rem] font-normal">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + '/') ||
                (link.key === 'work' && pathname.startsWith('/projects/'));

              return (
                <Link
                  key={link.key}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`hover:underline underline-offset-8 decoration-1 ${
                    isActive ? 'underline underline-offset-8 decoration-1' : ''
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-4 text-[1rem] text-black/70 border-t border-black/15 pt-6">
            <Link
              href="/kontakt"
              prefetch={true}
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:underline underline-offset-4 decoration-1 text-black"
            >
              {locale === 'en' ? 'Contact' : 'Kontakt'}
            </Link>
            <div className="text-[0.95rem]">
              Strandgaten 86, 5004 Bergen
            </div>
          </div>
        </div>
      )}
    </>
  );
}
