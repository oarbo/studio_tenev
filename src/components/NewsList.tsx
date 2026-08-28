'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SanityImage from './SanityImage';
import { ExpandingListItem } from './ExpandingList';

interface NewsListProps {
  items: ExpandingListItem[];
}

export default function NewsList({ items }: NewsListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

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
          // Ytre container er et perfekt 8-kolonne grid på desktop
          <div 
            key={item._id} 
            id={`news-${item._id}`}
            className="w-full grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 group scroll-mt-32"
          >
            {/* Inner Container: List Item (Kolonne 3-10 av 12) */}
            {/* Spenner over de 8 sentrerte kolonnene */}
            <div className={`md:col-start-3 md:col-span-8 border-black ${index === 0 ? 'border-t' : ''} ${index === items.length - 1 ? '' : 'border-b'}`}>
              
              {/* Header / Closed State */}
              <button
                onClick={() => toggleItem(item._id)}
                className="w-full grid grid-cols-1 md:grid-cols-8 gap-x-fm-1 text-left items-start pt-1.5 pb-8 cursor-pointer focus:outline-none group"
              >
                {/* Date */}
                <div className="md:col-span-2 shrink-0 text-black text-[1rem] tabular-nums group-hover:opacity-70 transition-opacity">
                  {item.date}
                </div>
                
                {/* Title */}
                <div className="md:col-span-6 text-black text-[1rem] group-hover:opacity-70 transition-opacity">
                  {item.title}
                </div>
              </button>

              {/* Expanded Content */}
              {isActive && (
                <div className="w-full grid grid-cols-1 md:grid-cols-8 gap-x-fm-1 pb-10">
                  
                  {/* Mobile Image (Vises bare på mobil) */}
                  <div className="md:hidden w-full mb-6 mt-2">
                    {item.image && (
                      <div 
                        className="relative w-full"
                        style={{ aspectRatio: item.imageAspectRatio || 1 }}
                      >
                        <SanityImage 
                          src={item.image} 
                          alt={item.title} 
                          fill 
                          className="object-contain object-left"
                          sizes="100vw"
                        />
                      </div>
                    )}
                  </div>

                  {/* Desktop Image (under date, Kolonne 1-2 av 8 -> Hovedgrid kol 3-4) */}
                  <div className="hidden md:block md:col-span-2 relative pr-4 mt-2">
                    {item.image && (
                      <div 
                        className="relative w-full"
                        style={{ aspectRatio: item.imageAspectRatio || 1 }}
                      >
                        <SanityImage 
                          src={item.image} 
                          alt={item.title} 
                          fill 
                          className="object-contain object-top"
                          sizes="(max-width: 768px) 25vw, 25vw"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Text Content */}
                  <div className="md:col-span-4 text-black text-[1rem] flex flex-col gap-6">
                    <div>
                      {item.content}
                    </div>
                    
                    {item.link && (
                      <div className="pt-2">
                        <Link 
                          href={item.link}
                          className="inline-block border-b border-black hover:opacity-60 transition-opacity"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Go to project
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
