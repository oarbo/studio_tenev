'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SanityImage, { SanityHotspot } from './SanityImage';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatTypography } from '@/utils/typography';

export interface ExpandingListItem {
  _id: string;
  tag?: string;
  date: string | number;
  title: string;
  titleEn?: string;
  image?: string;
  imageLqip?: string;
  imageAspectRatio?: number;
  imageHotspot?: SanityHotspot;
  content: React.ReactNode;
  contentEn?: React.ReactNode;
  link?: string;
}

interface NewsListProps {
  items: ExpandingListItem[];
  initialActiveId?: string | null;
}

export default function NewsList({ items, initialActiveId }: NewsListProps) {
  const { locale, t, translateTag } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(() => {
    return initialActiveId !== undefined ? initialActiveId : (items[0]?._id ?? null);
  });

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#news-')) {
        const targetId = hash.replace('#news-', '');
        setActiveId(targetId);
        setTimeout(() => {
          const el = document.getElementById(`news-${targetId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
      }
    };
    
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const toggleItem = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="w-full flex flex-col">
      {items.map((item, index) => {
        const isActive = activeId === item._id;
        
        return (
          <div 
            key={item._id} 
            id={`news-${item._id}`}
            className="w-full grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 group scroll-mt-32"
          >
            {/* Inner Container: List Item (Kolonne 3-10 av 12) */}
            <div className={`md:col-start-3 md:col-span-8 border-black ${index === 0 ? 'border-t' : ''} ${index === items.length - 1 ? '' : 'border-b'}`}>
              
              {/* Header / Closed State */}
              <button
                onClick={() => toggleItem(item._id)}
                aria-expanded={isActive}
                className="w-full grid grid-cols-1 md:grid-cols-8 gap-x-fm-1 text-left items-start pt-1.5 pb-[calc(0.5*var(--fm))] cursor-pointer focus:outline-none group"
              >
                {/* Date + Tag (Kolonne 1-2 på desktop) */}
                <div className="md:col-span-2 text-black text-[1rem] group-hover:opacity-70 transition-opacity flex items-baseline">
                  <span className="tabular-nums shrink-0">{item.date}</span>
                  {item.tag && (
                    <span className="ml-[2em] text-[calc(1rem-3px)] whitespace-nowrap">
                      {translateTag(item.tag)}
                    </span>
                  )}
                </div>

                {/* Title (Original plassering: Kolonne 3-8 på desktop) */}
                <div className="md:col-span-6 text-black text-[1rem] group-hover:opacity-70 transition-opacity">
                  {formatTypography((locale === 'en' && item.titleEn) ? item.titleEn : item.title)}
                </div>
              </button>

              {/* Expanded Content with smooth CSS Grid slide animation */}
              <div
                className={`w-full grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive && Boolean(item.image || item.content || item.link)
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <div className="w-full grid grid-cols-1 md:grid-cols-8 gap-x-fm-1 pb-8 md:pb-10">
                    {/* Mobile Image */}
                    <div className="md:hidden w-full mb-6">
                      {item.image && (
                        <div 
                          className="relative w-full"
                          style={{ aspectRatio: item.imageAspectRatio || 1 }}
                        >
                          <SanityImage 
                            src={item.image} 
                            alt={item.title} 
                            fill 
                            lqip={item.imageLqip}
                            hotspot={item.imageHotspot}
                            className="object-contain object-left"
                            sizes="100vw"
                          />
                        </div>
                      )}
                    </div>

                    {/* Desktop Image */}
                    <div className="hidden md:block md:col-span-2 relative pr-4 md:pt-[0.28em]">
                      {item.image && (
                        <div 
                          className="relative w-full"
                          style={{ aspectRatio: item.imageAspectRatio || 1 }}
                        >
                          <SanityImage 
                            src={item.image} 
                            alt={item.title} 
                            fill 
                            lqip={item.imageLqip}
                            hotspot={item.imageHotspot}
                            className="object-contain object-top"
                            sizes="25vw"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* Text Content */}
                    <div
                      className="md:col-span-6 text-black text-[1rem] flex flex-col items-start"
                      style={{ gap: 'var(--fm-half)' }}
                    >
                      <div className="text-measure-left">
                        {(locale === 'en' && item.contentEn) ? item.contentEn : item.content}
                      </div>
                      
                      {item.link && (
                        <div>
                          <Link 
                            href={item.link}
                            className="inline-block border-b border-black hover:opacity-60 transition-opacity"
                            target={item.link.startsWith('http') ? "_blank" : undefined}
                            rel={item.link.startsWith('http') ? "noopener noreferrer" : undefined}
                          >
                            {t('readMore')}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
