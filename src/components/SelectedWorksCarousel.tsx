'use client';

import React, { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Link from 'next/link';

export interface SelectedWorkItem {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
  coverImageAspectRatio?: number;
}

interface SelectedWorksCarouselProps {
  items: SelectedWorkItem[];
}

export default function SelectedWorksCarousel({ items }: SelectedWorksCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    dragFree: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        scrollNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext]);

  // For at karusellen garantert skal kunne loope (endeløst),
  // trenger Embla nok slides til å fylle skjermen mer enn én gang.
  // Vi dupliserer listen med items hvis det er få av dem for å sikre perfekt loop.
  const displayItems = items.length > 0 && items.length < 6 
    ? [...items, ...items, ...items, ...items].slice(0, 8) 
    : items;

  if (!displayItems || displayItems.length === 0) return null;

  return (
    // Økt padding på toppen (pt-24 md:pt-32) for å skyve kvadratene godt ned under meny og tittel
    <div className="w-full bg-white pt-24 pb-8 md:pt-32 md:pb-10 overflow-hidden relative">
      <div className="embla" ref={emblaRef}>
        {/* Bruker negativ margin og items-center for midtre horisontal akse */}
        <div className="embla__container flex touch-pan-y -ml-4 md:-ml-8 items-center">
          {displayItems.map((item, index) => {
            return (
              <div
                key={`${item._id}-${index}`}
                // Fast bredde som før, men vi justerer litt for å passe kvadrater
                className="embla__slide flex-[0_0_65%] sm:flex-[0_0_45%] md:flex-[0_0_35%] lg:flex-[0_0_30%] min-w-0 pl-4 md:pl-8"
              >
                <Link href={`/work/${item.slug}`} className="block w-full cursor-pointer group">
                  {/* Det "usynlige kvadratet" */}
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      // object-contain gjør at bildet aldri beskjæres, men "toucher" kantene
                      className="object-contain"
                      sizes="(max-width: 768px) 65vw, 30vw"
                    />
                  </div>
                  {/* Tittel under bildet siden bildet nå kan ha ulik form inni kvadratet */}
                  <div className="mt-3 text-black text-lg md:text-xl font-medium">
                    {item.title}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
