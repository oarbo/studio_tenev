'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface LandingCarouselItem {
  _id: string;
  title: string;
  slug: string;
  image: string;
}

interface HeroLandingProps {
  carousel?: LandingCarouselItem[];
  fallbackImageUrl?: string;
}

export default function HeroLanding({ carousel, fallbackImageUrl }: HeroLandingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hasCarousel = carousel && carousel.length > 0;

  const nextSlide = useCallback(() => {
    if (!hasCarousel) return;
    setPrevIndex(currentIndex);
    setCurrentIndex((prev) => (prev + 1) % carousel.length);
  }, [carousel, hasCarousel, currentIndex]);

  useEffect(() => {
    if (!hasCarousel || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasCarousel, isHovered, nextSlide]);

  if (!hasCarousel && !fallbackImageUrl) return null;

  if (!hasCarousel) {
    return (
      <section className="w-full h-[100svh] relative">
        <Image 
          src={fallbackImageUrl!} 
          alt="Landing page image" 
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </section>
    );
  }

  return (
    <>
      <style>{`
        @keyframes wipe-in {
          0% { clip-path: inset(0 100% 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        .slide-wipe-active {
          animation: wipe-in 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
        }
      `}</style>
      <section 
        className="w-full h-[100svh] relative overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-full">
          {carousel.map((item, index) => {
            const isCurrent = index === currentIndex;
            const isPrev = index === prevIndex;
            
            // Only render slides that are current or previous to save resources,
            // or we can just manage z-index and opacity
            const zIndex = isCurrent ? 20 : isPrev ? 10 : 0;
            const isVisible = isCurrent || isPrev;

            return (
              <div 
                key={item._id} 
                className={`absolute inset-0 w-full h-full group/link ${isCurrent ? 'slide-wipe-active' : ''}`}
                style={{ 
                  zIndex, 
                  opacity: isVisible ? 1 : 0,
                  pointerEvents: isCurrent ? 'auto' : 'none'
                }}
              >
                <Link href={`/work/${item.slug}`} className="block w-full h-full">
                  <Image 
                    src={item.image} 
                    alt={item.title} 
                    fill
                    priority={index === 0}
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                  
                  {/* Always Visible Title */}
                  <div className="absolute inset-0 z-10 flex flex-col justify-center items-center pointer-events-none p-4">
                    <div className="bg-white px-2 pt-[3px] pb-1 flex flex-col items-center justify-center max-w-[90%]">
                      <h2 className="m-0 text-[1rem] leading-[1.3] text-black text-center line-clamp-2" style={{ fontWeight: 600 }}>
                        {item.title}
                      </h2>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
