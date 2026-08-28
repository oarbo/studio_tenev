'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface SliderItem {
  _id: string;
  title: string;
  image: string;
  link?: string;
}

interface HorizontalSliderProps {
  items: SliderItem[];
}

export default function HorizontalSlider({ items }: HorizontalSliderProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full relative bg-white">
      <div 
        className="flex w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar"
        style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />
        {items.map((item) => (
          <div 
            key={item._id} 
            className="snap-start snap-always shrink-0 w-full h-[70vh] md:h-[85vh] relative"
          >
            {item.link ? (
              <Link href={item.link} className="block w-full h-full relative group">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute bottom-6 left-6 text-white text-2xl font-medium drop-shadow-md">
                  {item.title}
                </div>
              </Link>
            ) : (
              <div className="w-full h-full relative">
                <Image 
                  src={item.image} 
                  alt={item.title} 
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-6 left-6 text-white text-2xl font-medium drop-shadow-md">
                  {item.title}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
