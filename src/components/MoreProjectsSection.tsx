'use client';

import React from 'react';
import Link from 'next/link';
import SanityImage, { SanityHotspot } from '@/components/SanityImage';
import { useLanguage } from '@/i18n/LanguageContext';

export interface RelatedProjectItem {
  _id: string;
  title: string;
  titleEn?: string;
  slug: string;
  coverImage?: string;
  coverImageLqip?: string;
  coverImageAspectRatio?: number;
  coverImageHotspot?: SanityHotspot;
}

interface MoreProjectsSectionProps {
  projects: RelatedProjectItem[];
  categoryTitle?: string;
}

export default function MoreProjectsSection({ projects, categoryTitle }: MoreProjectsSectionProps) {
  const { locale, t } = useLanguage();

  if (!projects || projects.length === 0) return null;

  return (
    <section className="w-full bg-white text-black pt-12 pb-24 mt-24 md:mt-32">
      <div className="px-side-padding">
        <div className="w-full flex flex-col gap-6">
          <h2 className="text-[1rem] font-normal leading-tight text-black">
            {locale === 'en' ? (categoryTitle ? `More ${categoryTitle}` : 'More projects') : 'Flere prosjekter'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-fm-1 gap-y-8">
            {projects.map((p) => {
              const title = (locale === 'en' && p.titleEn) ? p.titleEn : p.title;

              return (
                <Link key={p._id} href={`/work/${p.slug}`} prefetch={true} className="flex flex-col gap-2 group">
                  <div className="relative w-full aspect-4/3 bg-gray-100 overflow-hidden">
                    {p.coverImage ? (
                      <SanityImage 
                        src={p.coverImage} 
                        alt={title} 
                        fill 
                        lqip={p.coverImageLqip}
                        hotspot={p.coverImageHotspot}
                        className="object-cover group-hover:opacity-80 transition-opacity duration-150 ease-out"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>
                  <div className="text-[1rem] leading-tight text-black group-hover:opacity-70 transition-opacity duration-150">
                    {title}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
