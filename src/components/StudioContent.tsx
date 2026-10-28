'use client';

import React from 'react';
import Link from 'next/link';
import SanityImage, { SanityHotspot } from '@/components/SanityImage';
import ProjectSlideshow, { SlideshowImage } from '@/components/ProjectSlideshow';
import { PortableText } from '@portabletext/react';
import { formatPortableText, portableTextComponents, renderTypography } from '@/utils/typography';
import { useLanguage } from '@/i18n/LanguageContext';

export interface ContentBlock {
  _key: string;
  _type: 'textBlock' | 'imageBlock' | 'videoBlock' | 'slideshowBlock' | 'teamBlock' | 'peopleListBlock' | 'applicationsBlock' | 'contactBlock';
  text?: any;
  textEn?: any;
  title?: string;
  titleEn?: string;
  size?: string;
  caption?: string;
  captionEn?: string;
  image?: string;
  imageLqip?: string;
  imageAspectRatio?: number;
  imageHotspot?: SanityHotspot;
  videoUrl?: string;
  images?: SlideshowImage[];
  members?: Array<{
    name: string;
  }>;
  items?: string[];
  studioName?: string;
  address?: string;
  email?: string;
  phone?: string;
  instagram?: string;
}

function studioImageGridClass(size?: string): { gridClass: string; sizes: string } {
  if (size === 'full') {
    return { gridClass: 'col-span-full', sizes: '100vw' };
  }
  if (size === 'large' || size === '8' || size === 'cols8') {
    return { gridClass: 'md:col-start-3 md:col-span-8', sizes: '(max-width: 768px) 100vw, 85vw' };
  }
  if (size === 'medium' || size === '6' || size === 'cols6') {
    return { gridClass: 'md:col-start-4 md:col-span-6', sizes: '(max-width: 768px) 100vw, 67vw' };
  }
  if (size === 'small' || size === '4' || size === 'cols4') {
    return { gridClass: 'md:col-start-5 md:col-span-4', sizes: '(max-width: 768px) 100vw, 50vw' };
  }
  if (size === 'xsmall' || size === 'x-small' || size === '2' || size === 'cols2') {
    return { gridClass: 'md:col-start-6 md:col-span-2', sizes: '(max-width: 768px) 100vw, 33vw' };
  }
  return { gridClass: 'md:col-start-4 md:col-span-6', sizes: '(max-width: 768px) 100vw, 67vw' };
}

function renderTextWithEmail(text: string) {
  const parts = text.split(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
  return parts.map((part, i) => {
    if (part.includes('@')) {
      return (
        <a
          key={i}
          href={`mailto:${part}`}
          className="underline underline-offset-4 hover:opacity-70 transition-opacity whitespace-nowrap"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

interface StudioContentProps {
  studioData: any;
  siteSettings: any;
}

export default function StudioContent({ studioData, siteSettings }: StudioContentProps) {
  const { locale, t } = useLanguage();
  const contentBlocks: ContentBlock[] = studioData?.contentBlocks || [];

  const renderStudioContactDetails = () => {
    const sName = studioData?.studioName || siteSettings?.studioName || 'Studio Tenev';
    const addr = studioData?.address || siteSettings?.address || 'Strandgaten 86\n5004 Bergen';
    const addrLines = addr.split('\n').map((l: string) => l.trim()).filter(Boolean);
    const rawOrg = studioData?.orgNumber || '932 534 134 MVA';
    const orgLabel = locale === 'en' ? 'Org. no.' : 'Org. nr.';
    const mail = studioData?.contactEmail || siteSettings?.contactEmail || 'hello@studiotenev.com';
    const ph = studioData?.contactPhone || siteSettings?.contactPhone || '+47 950 40 910';

    return (
      <div className="border-t border-black pt-1.5 text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
        <h2 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
          {t('contact')}
        </h2>
        <div className="flex flex-col gap-y-[var(--fm)]">
          <div className="flex flex-col gap-0">
            <div>{renderTypography(sName, locale === 'en' ? 'en-GB' : 'nb')}</div>
            {addrLines.map((line: string, i: number) => (
              <div key={i}>{renderTypography(line, locale === 'en' ? 'en-GB' : 'nb')}</div>
            ))}
            <div>
              {orgLabel}{' '}
              <span className="tabular-nums whitespace-nowrap">
                {renderTypography(rawOrg, locale === 'en' ? 'en-GB' : 'nb')}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-0">
            {mail && (
              <div>
                <a
                  href={`mailto:${mail}`}
                  className="hover:underline underline-offset-4 decoration-1 whitespace-nowrap cursor-pointer"
                >
                  {mail}
                </a>
              </div>
            )}
            {ph && (
              <div>
                <a
                  href={`tel:${ph.replace(/\s+/g, '')}`}
                  className="hover:underline underline-offset-4 decoration-1 whitespace-nowrap cursor-pointer tabular-nums"
                >
                  {ph}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col mb-42">
      {contentBlocks && contentBlocks.length > 0 ? (
        <div className="px-side-padding pt-content-top">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 gap-y-fm-2">
            {contentBlocks.map((block, index) => {
              /* Tekstblokk */
              if (block._type === 'textBlock') {
                const isIntroBlock = index === 0;
                const displayText = (locale === 'en' && block.textEn) ? block.textEn : block.text;
                const displayTitle = (locale === 'en' && block.titleEn) ? block.titleEn : block.title;

                return (
                  <div key={block._key} className="md:col-start-3 md:col-span-8">
                    <div
                      className={`text-measure ${!isIntroBlock ? 'border-t border-black pt-1.5' : ''}`}
                      lang={locale === 'en' ? 'en-GB' : 'nb'}
                    >
                      {displayTitle && (
                        <h2 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                          {displayTitle}
                        </h2>
                      )}
                      {displayText && (
                        <div className="news-content !m-0 !max-w-none text-[1.125rem] md:text-[1.2rem] leading-(--line-height)" lang={locale === 'en' ? 'en-GB' : 'nb'}>
                          <PortableText value={formatPortableText(displayText, locale === 'en' ? 'en-GB' : 'nb') || displayText} components={portableTextComponents} />
                        </div>
                      )}
                      {isIntroBlock && (
                        <div className="mt-[calc(2*var(--fm))] flex justify-between md:justify-start items-baseline gap-x-4 md:gap-x-[2em] w-full !indent-0 [text-indent:0] text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                          <div className="text-left">
                            <Link
                              href="/tjenester"
                              className="hover:underline underline-offset-4 decoration-1 cursor-pointer inline-block"
                            >
                              {t('ourServices')}
                            </Link>
                          </div>
                          <div className="text-right md:text-left">
                            <Link
                              href="/kontakt"
                              className="hover:underline underline-offset-4 decoration-1 cursor-pointer inline-block text-right md:text-left"
                            >
                              {t('bookConsultation')}
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              /* Bildeblokk (låst til samme bredde som teksten) */
              if (block._type === 'imageBlock' && block.image) {
                const displayCaption = (locale === 'en' && block.captionEn) ? block.captionEn : block.caption;

                return (
                  <div key={block._key} className="md:col-start-3 md:col-span-8">
                    <div className="text-measure group">
                      <div
                        className="relative w-full bg-gray-100"
                        style={{ aspectRatio: block.imageAspectRatio || 1.33 }}
                      >
                        <SanityImage
                          src={block.image}
                          alt={displayCaption || 'Studio bilde'}
                          fill
                          lqip={block.imageLqip}
                          hotspot={block.imageHotspot}
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, var(--text-width-desktop)"
                        />
                      </div>
                      {displayCaption && (
                        <div
                          className="mt-[calc(1em*var(--line-height))] text-[calc(1rem-3px)] text-center leading-(--line-height)"
                          style={{ color: 'var(--secondary-color)' }}
                        >
                          {displayCaption}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              /* Videoblokk (låst til samme bredde som teksten) */
              if (block._type === 'videoBlock' && block.videoUrl) {
                const displayCaption = (locale === 'en' && block.captionEn) ? block.captionEn : block.caption;

                return (
                  <div key={block._key} className="md:col-start-3 md:col-span-8">
                    <div className="text-measure group">
                      <div className="relative w-full bg-gray-100 aspect-video">
                        <video
                          src={block.videoUrl}
                          width={1280}
                          height={720}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover overflow-hidden"
                        />
                      </div>
                      {displayCaption && (
                        <div
                          className="mt-[calc(1em*var(--line-height))] text-[calc(1rem-3px)] text-center leading-(--line-height)"
                          style={{ color: 'var(--secondary-color)' }}
                        >
                          {displayCaption}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              /* Slideshowblokk */
              if (block._type === 'slideshowBlock' && block.images && block.images.length > 0) {
                const { gridClass } = studioImageGridClass(block.size);
                const displayTitle = (locale === 'en' && block.titleEn) ? block.titleEn : block.title;
                return (
                  <div key={block._key} className={gridClass}>
                    <ProjectSlideshow images={block.images} title={displayTitle} size={block.size || 'medium'} />
                  </div>
                );
              }

              /* Ansatte / Teamblokk */
              if (block._type === 'teamBlock') {
                const names: string[] = [
                  ...(block.items || []),
                  ...((block.members || []).map((m) => m.name).filter(Boolean)),
                ];
                if (names.length === 0) return null;
                const displayTitle = (locale === 'en' && block.titleEn) ? block.titleEn : (block.title || t('team'));

                return (
                  <div key={block._key} className="md:col-start-3 md:col-span-8">
                    <div className="text-measure border-t border-black pt-1.5 text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                      <h2 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">{displayTitle}</h2>
                      <ul className="flex flex-col">
                        {names.map((name, i) => (
                          <li key={i}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }

              /* Tidligere ansatte / Personliste */
              if (block._type === 'peopleListBlock' && block.items && block.items.length > 0) {
                const displayTitle = (locale === 'en' && block.titleEn) ? block.titleEn : (block.title || t('previousTeam'));

                return (
                  <div key={block._key} className="md:col-start-3 md:col-span-8">
                    <div className="text-measure text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                      <h2 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">{displayTitle}</h2>
                      <ul className="flex flex-col">
                        {block.items.map((item, i) => (
                          <li key={i}>{renderTypography(item, locale === 'en' ? 'en-GB' : 'nb')}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              }

              /* Søknadsblokk */
              if (block._type === 'applicationsBlock' && (block.text || block.textEn)) {
                const displayTitle = (locale === 'en' && block.titleEn) ? block.titleEn : (block.title || t('applications'));
                const displayText = (locale === 'en' && block.textEn) ? block.textEn : block.text;

                return (
                  <div key={block._key} className="md:col-start-3 md:col-span-8">
                    <div className="text-measure text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                      <h2 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">{displayTitle}</h2>
                      <p className="whitespace-pre-wrap">
                        {renderTextWithEmail(displayText || '')}
                      </p>
                    </div>
                  </div>
                );
              }

              /* Kontaktblokk */
              if (block._type === 'contactBlock') {
                const sName = block.studioName || studioData?.studioName || siteSettings?.studioName || 'Studio Tenev';
                const addr  = block.address  || studioData?.address       || siteSettings?.address;
                const mail  = block.email    || studioData?.contactEmail  || siteSettings?.contactEmail;
                const ph    = block.phone    || studioData?.contactPhone  || siteSettings?.contactPhone;
                const insta = block.instagram || studioData?.instagram    || siteSettings?.instagram;
                const displayTitle = (locale === 'en' && block.titleEn) ? block.titleEn : (block.title || t('contact'));

                return (
                  <div key={block._key} className="md:col-start-3 md:col-span-8">
                    <div className="text-measure border-t border-black pt-1.5 text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                      <h2 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">{displayTitle}</h2>
                      <div className="flex flex-col gap-y-[var(--fm)]">
                        <div className="flex flex-col gap-0">
                          <div>{sName}</div>
                          {addr && <div className="whitespace-pre-wrap">{addr}</div>}
                        </div>
                        <div className="flex flex-col gap-0">
                          {mail && <div><a href={`mailto:${mail}`} className="hover:underline underline-offset-4 decoration-1 whitespace-nowrap cursor-pointer">{mail}</a></div>}
                          {ph   && <div><a href={`tel:${ph}`}       className="hover:underline underline-offset-4 decoration-1 whitespace-nowrap cursor-pointer tabular-nums">{ph}</a></div>}
                        </div>
                        {insta && (
                          <div>
                            <a href={insta} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4 decoration-1 whitespace-nowrap cursor-pointer">
                              Instagram
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}
            {!contentBlocks.some((b) => b._type === 'contactBlock') && (
              <div className="md:col-start-3 md:col-span-8">
                <div className="text-measure">
                  {renderStudioContactDetails()}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Fallback-layout i 12-kolonne grid */
        <div className="px-side-padding pt-content-top">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 gap-y-fm-2">
            <div className="md:col-start-3 md:col-span-8">
              <div className="text-measure flex flex-col gap-10 md:gap-14 text-black text-[1.125rem] md:text-[1.2rem] leading-(--line-height) hyphens-none">
                <div>
                  <h1 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                    {locale === 'en' ? 'Studio Tenev — Architects Bergen' : 'Studio Tenev — Arkitekt Bergen'}
                  </h1>
                  <p>
                    {locale === 'en'
                      ? 'Studio Tenev is an architecture practice established in 2024 by Daniel Tenev, based in the heart of Bergen, Norway. We work on a wide range of projects, from interior architecture and renovation to new construction, private houses, cabins, office buildings, and public and cultural spaces.'
                      : 'Studio Tenev er et arkitektkontor etablert i 2024 av Daniel Tenev, med base i hjertet av Bergen sentrum. Vi arbeider med et bredt spekter av prosjekter, fra interiørarkitektur og rehabilitering til nybygg, eneboliger, hytter, kontorbygg og offentlige og kulturelle bygg.'}
                  </p>
                  <div className="mt-[calc(2*var(--fm))] flex justify-between md:justify-start items-baseline gap-x-4 md:gap-x-[2em] w-full !indent-0 [text-indent:0] text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                    <div className="text-left">
                      <Link
                        href="/tjenester"
                        className="hover:underline underline-offset-4 decoration-1 cursor-pointer inline-block"
                      >
                        {t('ourServices')}
                      </Link>
                    </div>
                    <div className="text-right md:text-left">
                      <Link
                        href="/kontakt"
                        className="hover:underline underline-offset-4 decoration-1 cursor-pointer inline-block text-right md:text-left"
                      >
                        {t('bookConsultation')}
                      </Link>
                    </div>
                  </div>
                </div>
                {renderStudioContactDetails()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
