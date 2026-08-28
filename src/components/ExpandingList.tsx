'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SanityImage from './SanityImage';

export interface ExpandingListItem {
  _id: string;
  tag: string;
  date: string | number;
  title: string;
  image?: string;
  imageAspectRatio?: number;
  content: React.ReactNode;
  link?: string;
}

interface ExpandingListProps {
  items: ExpandingListItem[];
}

export default function ExpandingList({ items }: ExpandingListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="w-full flex flex-col border-t border-gray-200">
      {items.map((item) => {
        const isActive = activeId === item._id;
        
        return (
          <div 
            key={item._id} 
            className="w-full border-b border-gray-200 group flex flex-col"
          >
            {/* Header / Closed State */}
            <button
              onClick={() => toggleItem(item._id)}
              className="w-full grid grid-cols-4 gap-4 px-side-padding py-6 text-left items-center hover:bg-gray-50 transition-colors focus:outline-none"
            >
              <div className="col-span-1 text-gray-500">{item.tag}</div>
              <div className="col-span-1 text-gray-500">{item.date}</div>
              <div className="col-span-1 md:col-span-1 font-medium">{item.title}</div>
              <div className="col-span-1 flex justify-end items-center">
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                  className={`transform transition-transform duration-300 ${isActive ? 'rotate-90' : 'group-hover:rotate-90'}`}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="square" />
                </svg>
              </div>
            </button>

            {/* Expanded Content */}
            {isActive && (
              <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8 px-side-padding pb-12 pt-4">
                {/* Image (Cols 1-2) */}
                <div className="col-span-1 md:col-span-2">
                  {item.image ? (
                    <div 
                      className="relative w-full bg-gray-100 overflow-hidden"
                      style={{ aspectRatio: item.imageAspectRatio || 1.5 }}
                    >
                      <SanityImage 
                        src={item.image} 
                        alt={item.title} 
                        fill 
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[1.5] bg-gray-100 flex items-center justify-center text-gray-400">
                      Bilde mangler
                    </div>
                  )}
                </div>

                {/* Content (Cols 3-4) */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                  <div className="prose prose-lg prose-gray max-w-none">
                    {item.content}
                  </div>
                  
                  {item.link && (
                    <div className="mt-auto pt-4">
                      <Link 
                        href={item.link}
                        className="inline-flex items-center gap-2 font-medium hover:opacity-70 transition-opacity"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Les mer
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="square" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
