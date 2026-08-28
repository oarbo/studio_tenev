'use client';
import React from 'react';
import type { TypedObject } from '@portabletext/types';
import SanityImage from './SanityImage';
import Link from 'next/link';

export interface GridItemRef {
  _id: string;
  _type: 'project' | 'news';
  title: string;
  date?: string;
  slug?: string;
  summary?: string;
  link?: string;
  image?: { url: string; aspectRatio: number };
  videoUrl?: string;
  body?: TypedObject | TypedObject[];
  gallery?: { url: string; alt?: string }[];
  buildYear?: number;
  location?: string;
  status?: string;
  client?: string;
  contractor?: string;
  size?: { value: number; unit: string };
  coverImage?: string; // used for ProjectModal fallback
}

export default function HomeGrid({ items }: { items: GridItemRef[] }) {

  if (!items || items.length === 0) return null;

  const getGridClasses = (index: number) => {
    return 'col-span-4 md:col-span-6';
  };

  return (
    <>
      <ol className="grid grid-cols-4 md:grid-cols-12 gap-fm w-full px-side-padding pb-[15vw]">
        {items.map((item, index) => {
          if (!item) return null;

          const getBoxPattern = (idx: number) => {
            const p = idx % 5;
            // All images are centered, but we vary the inset to give them different scales/margins
            switch(p) {
              case 0: return { inset: 'inset-[5%]', objectFit: 'contain' };
              case 1: return { inset: 'inset-[15%]', objectFit: 'contain' };
              case 2: return { inset: 'inset-y-[5%] inset-x-[15%]', objectFit: 'contain' };
              case 3: return { inset: 'inset-y-[15%] inset-x-[5%]', objectFit: 'contain' };
              case 4: return { inset: 'inset-[10%]', objectFit: 'contain' };
              default: return { inset: 'inset-0', objectFit: 'contain' };
            }
          };
          const pattern = getBoxPattern(index);

          const href = item._type === 'project'
            ? (item.slug ? `/work/${item.slug}` : `/work#project-${item._id}`)
            : `/news#news-${item._id}`;

          const aspectRatio = item.image?.aspectRatio || (item.videoUrl ? 1.77 : 1);
          const imgWidth = 1000;
          const imgHeight = Math.round(imgWidth / aspectRatio);

          const content = (
            <figure className="relative block w-full aspect-[5/4] media-box">
              <div className={`absolute ${pattern.inset} flex items-center justify-center`}>
                <Link href={href} className="relative flex max-w-full max-h-full group/link focus:outline-none cursor-pointer">
                  {/* Image Layer */}
                  {item.videoUrl ? (
                    <video src={item.videoUrl} autoPlay muted loop playsInline className="max-w-full max-h-full w-auto h-auto object-contain" />
                  ) : item.image?.url ? (
                    <SanityImage 
                      src={item.image.url} 
                      alt={item.title} 
                      width={imgWidth}
                      height={imgHeight}
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw" 
                    />
                  ) : null}
                  
                  {/* Hover Title Layer */}
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center opacity-0 group-hover/link:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-white px-2 pt-[3px] pb-1 flex flex-col items-center justify-center max-w-[90%]">
                      {item.date && (
                        <div className="text-[1rem] leading-[1.3] text-black mb-1">
                          {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                      <h2 className="m-0 text-[1rem] leading-[1.3] text-black text-center line-clamp-2" style={{ fontWeight: 600 }}>{item.title}</h2>
                    </div>
                  </div>
                </Link>
              </div>
            </figure>
          );

          return (
            <li key={item._id || index} className="col-span-4 md:col-span-6 block">
              {content}
            </li>
          );
        })}
      </ol>

    </>
  );
}
