'use client';
import React, { useRef, useState, useEffect } from 'react';
import type { TypedObject } from '@portabletext/types';
import SanityImage, { SanityHotspot } from './SanityImage';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { renderTypography } from '@/utils/typography';

export interface GridItemRef {
  _id: string;
  _type: 'project' | 'news';
  title: string;
  titleEn?: string;
  tag?: string;
  date?: string;
  slug?: string;
  summary?: string;
  summaryEn?: string;
  link?: string;
  image?: {
    url: string;
    aspectRatio: number;
    lqip?: string;
    hotspot?: SanityHotspot;
  };
  videoUrl?: string;
  body?: TypedObject | TypedObject[];
  gallery?: { url: string; alt?: string }[];
  buildYear?: number;
  location?: string;
  status?: string;
  client?: string;
  contractor?: string;
  size?: { value: number; unit: string };
  coverImage?: string;
}

function getGridClasses(index: number, aspectRatio: number) {
  const p = index % 6;
  const isPortrait = aspectRatio < 1;

  switch(p) {
    case 0: 
      return isPortrait 
        ? 'col-span-1 md:col-span-6 md:col-start-4' 
        : 'col-span-1 md:col-span-8 md:col-start-3'; // Centered large
    case 1: return 'col-span-1 md:col-span-5 md:col-start-1 md:mt-12'; // Left
    case 2: return 'col-span-1 md:col-span-5 md:col-start-8 md:mt-[15vw]'; // Right, pushed down
    case 3: 
      return isPortrait 
        ? 'col-span-1 md:col-span-4 md:col-start-5' 
        : 'col-span-1 md:col-span-8 md:col-start-3'; // Centered medium
    case 4: return 'col-span-1 md:col-span-5 md:col-start-2 md:mt-[12vw]'; // Left, pushed down
    case 5: return 'col-span-1 md:col-span-4 md:col-start-9 md:mt-12'; // Right
    default: return 'col-span-1 md:col-span-12';
  }
}

function HomeGridItem({
  item,
  index,
  locale,
  translateTag,
}: {
  item: GridItemRef;
  index: number;
  locale: string;
  translateTag: (tag: string) => string;
}) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const [mediaWidth, setMediaWidth] = useState<number | null>(null);

  let href = '';
  let isExternal = false;

  if (item._type === 'project') {
    href = item.slug ? `/work/${item.slug}` : `/work#project-${item._id}`;
  } else {
    if (item.link) {
      href = item.link;
      isExternal = item.link.startsWith('http');
    } else {
      href = `/news#news-${item._id}`;
    }
  }

  const aspectRatio = item.image?.aspectRatio || (item.videoUrl ? 1.77 : 1);
  const imgWidth = 1200;
  const imgHeight = Math.round(imgWidth / aspectRatio);
  const gridClass = getGridClasses(index, aspectRatio);
  const isFirstItem = index === 0;

  // Måler mediets (video/bilde) faktiske bredde slik at tittelen aldri går forbi høyrekanten
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;

    const measure = () => {
      // Sjekk desktop-video eller bildeelement
      const desktopVid = el.querySelector('video.object-contain') as HTMLVideoElement | null;
      if (desktopVid && window.innerWidth >= 768) {
        const rect = desktopVid.getBoundingClientRect();
        if (rect.width > 0) {
          setMediaWidth(Math.round(rect.width));
          return;
        }
      }

      const anyTarget = el.querySelector('video, img') || el;
      const rect = anyTarget.getBoundingClientRect();
      if (rect.width > 0) {
        setMediaWidth(Math.round(rect.width));
      }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const vid = el.querySelector('video');
    if (vid) {
      vid.addEventListener('loadedmetadata', measure);
    }

    return () => {
      ro.disconnect();
      if (vid) {
        vid.removeEventListener('loadedmetadata', measure);
      }
    };
  }, []);

  return (
    <li className={`${gridClass} block`}>
      <figure className="block w-full">
        <Link 
          href={href} 
          prefetch={!isExternal}
          className="inline-flex flex-col items-start max-w-full group/link focus:outline-none cursor-pointer"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {/* Media Layer (Video or Image) */}
          {item.videoUrl ? (
            <div ref={mediaRef} className="max-w-full">
              {/* Mobil: Bevares uendret */}
              <div className="md:hidden relative w-full overflow-hidden bg-gray-50" style={{ aspectRatio }}>
                <video
                  src={item.videoUrl}
                  preload="metadata"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              {/* Desktop: Vises i sin opprinnelige oppløsning uten forstørring eller cropping */}
              <div className="hidden md:inline-block relative max-w-full overflow-hidden">
                <video
                  src={item.videoUrl}
                  preload="metadata"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedMetadata={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    if (rect.width > 0) setMediaWidth(Math.round(rect.width));
                  }}
                  className="block max-w-full h-auto max-h-[70vh] object-contain"
                />
              </div>
            </div>
          ) : item.image?.url ? (
            <div ref={mediaRef} className="relative w-full overflow-hidden bg-gray-50" style={{ aspectRatio }}>
              <SanityImage 
                src={item.image.url} 
                alt={item.title} 
                width={imgWidth}
                height={imgHeight}
                lqip={item.image.lqip}
                hotspot={item.image.hotspot}
                loading={isFirstItem ? 'eager' : 'lazy'}
                fetchPriority={isFirstItem ? 'high' : undefined}
                className="absolute inset-0 w-full h-full object-cover"
                sizes="(max-width: 768px) 100vw, 60vw" 
              />
            </div>
          ) : null}
          
          {/* Text Layer (Below Image) - begrenset til mediets bredde slik at den aldri går forbi høyrekanten */}
          <div 
            className="mt-4 flex flex-col items-start justify-start w-full"
            style={mediaWidth ? { maxWidth: `${mediaWidth}px` } : undefined}
          >
            {/* Meta info ABOVE title */}
            <div className="text-[0.875rem] leading-[1.3] text-black mb-[calc(0.5rem-5px)] flex flex-row flex-wrap gap-x-4 max-w-full">
              <span>
                {item._type === 'news'
                  ? (item.tag ? translateTag(item.tag) : (locale === 'en' ? 'News' : 'Nyhet'))
                  : (locale === 'en' ? 'Project' : 'Prosjekt')}
              </span>
              {item._type === 'news' && item.date && (
                <span>
                  {new Date(item.date).toLocaleDateString(locale === 'en' ? 'en-GB' : 'no-NO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
            
            {/* Title - brekkes automatisk over til neste linje ved høyrekanten av bildet */}
            <h2 className="m-0 text-[1.33rem] leading-[calc(1.33rem*1.3-4px)] text-black font-normal max-w-full">
              {renderTypography((locale === 'en' && item.titleEn) ? item.titleEn : item.title, locale === 'en' ? 'en-GB' : 'nb')}
            </h2>
          </div>
        </Link>
      </figure>
    </li>
  );
}

export default function HomeGrid({ items }: { items: GridItemRef[] }) {
  const { locale, translateTag } = useLanguage();

  if (!items || items.length === 0) return null;

  return (
    <ol className="grid grid-cols-1 md:grid-cols-12 md:gap-x-fm-1 gap-y-16 md:gap-y-32 w-full px-side-padding pb-[15vw] pt-12">
      {items.map((item, index) => {
        if (!item) return null;
        return (
          <HomeGridItem
            key={item._id || index}
            item={item}
            index={index}
            locale={locale}
            translateTag={translateTag}
          />
        );
      })}
    </ol>
  );
}
