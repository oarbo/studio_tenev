import React from 'react';
import Layout from '@/components/Layout';
import { client, getStudioQuery, getSiteSettingsQuery } from '@/sanity/client';
import SanityImage from '@/components/SanityImage';
import ProjectSlideshow from '@/components/ProjectSlideshow';
import { PortableText } from '@portabletext/react';

export const revalidate = 60;

interface TeamMember {
  name: string;
  title: string;
  image?: string;
}

interface ContentBlock {
  _key: string;
  _type: 'textBlock' | 'imageBlock' | 'videoBlock' | 'slideshowBlock' | 'teamBlock' | 'peopleListBlock' | 'applicationsBlock' | 'contactBlock';
  text?: any;
  title?: string;
  size?: string;
  caption?: string;
  image?: string;
  imageAspectRatio?: number;
  videoUrl?: string;
  images?: Array<{
    url: string;
    caption?: string;
    aspectRatio?: number;
  }>;
  members?: Array<{
    name: string;
    title: string;
    image?: string;
  }>;
  items?: string[];
  studioName?: string;
  address?: string;
  email?: string;
  phone?: string;
  instagram?: string;
}

// Mapper Sanity size-streng til abyme-inspirert CSS-klasse
function imgSizeClass(size: string): string {
  if (size === 'full') return 'img-size-bleed';
  if (size === 'large' || size === 'cols8' || size === '8') return 'img-size-large';
  if (size === 'small' || size === 'cols4' || size === '4') return 'img-size-small';
  if (size === 'xsmall' || size === 'cols2' || size === '2') return 'img-size-xsmall';
  return 'img-size-full'; // medium / default = full bredde innenfor side-padding
}

export default async function StudioPage() {
  const studioData = await client.fetch(getStudioQuery).catch(() => null);
  const siteSettings = await client.fetch(getSiteSettingsQuery).catch(() => null);

  const contentBlocks: ContentBlock[] = studioData?.contentBlocks || [];

  return (
    <Layout noPadding>
      <div className="w-full flex flex-col mb-42">
        {contentBlocks.length > 0 ? (
          /* ── abyme flat-flow: px-side-padding på ytterkanten,
             bilder = full bredde innenfor, tekst = sentrert 30rem-kolonne ── */
          <div className="px-side-padding pt-content-top flex flex-col gap-fm-2">
            {contentBlocks.map((block) => {

              /* Tekstblokk */
              if (block._type === 'textBlock' && (block.text || block.title)) {
                return (
                  <div key={block._key} className="w-full grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
                    <div 
                      className="md:col-start-5 md:col-span-4"
                      style={{ width: 'calc(100% + var(--spacing-fm-1))' }}
                    >
                      {block.title && <h2 className="font-medium mb-4">{block.title}</h2>}
                      {block.text && (
                        <div className="news-content !m-0 !max-w-none">
                          <PortableText value={block.text} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              /* Bildeblokk */
              if (block._type === 'imageBlock' && block.image) {
                return (
                  <div key={block._key} className={`${imgSizeClass(block.size || 'medium')} group`}>
                    <div
                      className="relative w-full bg-gray-100"
                      style={{ aspectRatio: block.imageAspectRatio || 1.33 }}
                    >
                      <SanityImage
                        src={block.image}
                        alt={block.caption || 'Studio bilde'}
                        fill
                        className="object-cover"
                        sizes="100vw"
                      />
                    </div>
                    {block.caption && (
                      <div className="mt-2 text-[0.75rem] leading-[1.35] text-black opacity-60">
                        {block.caption}
                      </div>
                    )}
                  </div>
                );
              }

              /* Videoblokk */
              if (block._type === 'videoBlock' && block.videoUrl) {
                return (
                  <div key={block._key} className={`${imgSizeClass(block.size || 'medium')} group`}>
                    <div className="relative w-full bg-gray-100 aspect-video">
                      <video
                        src={block.videoUrl}
                        autoPlay muted loop playsInline
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {block.caption && (
                      <div className="mt-2 text-[0.75rem] leading-[1.35] text-black opacity-60">
                        {block.caption}
                      </div>
                    )}
                  </div>
                );
              }

              /* Slideshowblokk */
              if (block._type === 'slideshowBlock' && block.images && block.images.length > 0) {
                return (
                  <div key={block._key} className={imgSizeClass(block.size || 'medium')}>
                    <ProjectSlideshow images={block.images} title={block.title} size={block.size || 'medium'} />
                  </div>
                );
              }

              /* Teamblokk */
              if (block._type === 'teamBlock' && block.members && block.members.length > 0) {
                return (
                  <div key={block._key} className="w-full grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
                    <div 
                      className="md:col-start-5 md:col-span-4"
                      style={{ width: 'calc(100% + var(--spacing-fm-1))' }}
                    >
                    {block.title && <h2 className="font-medium mb-4">{block.title}</h2>}
                    <div className="space-y-3">
                      {block.members.map((member, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:gap-4">
                          <span>{member.name}</span>
                          {member.title && <span className="text-gray-500">{member.title}</span>}
                        </div>
                      ))}
                    </div>
                    </div>
                  </div>
                );
              }

              /* Personnettede */
              if (block._type === 'peopleListBlock' && block.items && block.items.length > 0) {
                return (
                  <div key={block._key} className="w-full grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
                    <div 
                      className="md:col-start-5 md:col-span-4"
                      style={{ width: 'calc(100% + var(--spacing-fm-1))' }}
                    >
                    {block.title && <h2 className="font-medium mb-4">{block.title}</h2>}
                    <ul className="space-y-2">
                      {block.items.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                    </div>
                  </div>
                );
              }

              /* Søknadsblokk */
              if (block._type === 'applicationsBlock' && block.text) {
                return (
                  <div key={block._key} className="w-full grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
                    <div 
                      className="md:col-start-5 md:col-span-4"
                      style={{ width: 'calc(100% + var(--spacing-fm-1))' }}
                    >
                    {block.title && <h2 className="font-medium mb-4">{block.title}</h2>}
                    <p className="whitespace-pre-wrap">{block.text}</p>
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

                return (
                  <div key={block._key} className="w-full grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
                    <div 
                      className="md:col-start-5 md:col-span-4"
                      style={{ width: 'calc(100% + var(--spacing-fm-1))' }}
                    >
                    <h2 className="font-medium mb-8">{block.title || 'Contact'}</h2>
                    <div className="mb-8">
                      <div>{sName}</div>
                      {addr && <div className="whitespace-pre-wrap">{addr}</div>}
                    </div>
                    <div className="mb-8">
                      {mail && <div><a href={`mailto:${mail}`} className="hover:opacity-70 transition-opacity">{mail}</a></div>}
                      {ph   && <div><a href={`tel:${ph}`}       className="hover:opacity-70 transition-opacity">{ph}</a></div>}
                    </div>
                    {insta && (
                      <div>
                        <a href={insta} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                          Instagram
                        </a>
                      </div>
                    )}
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>

        ) : (
          /* ── Fallback-layout (ingen Sanity-blokker) — samme abyme-mønster ── */
          <div className="px-side-padding pt-content-top flex flex-col gap-fm-2">

            <div className="text-measure">
              <h1 className="font-medium mb-4">Studio Tenev — Arkitekt Bergen</h1>
              <p>Studio Tenev er et arkitektkontor etablert i 2024 av Daniel Tenev, med base i hjertet av Bergen sentrum. Vi arbeider med et bredt spekter av prosjekter, fra interiørarkitektur og rehabilitering til nybygg, eneboliger, hytter, kontorbygg og offentlige og kulturelle bygg.</p>
              <p>Vår spesialitet er å skape gode rom ved å utforske form, lys, materialer og atmosfærer gjennom både digitale og manuelle metoder.</p>
            </div>

            {studioData?.showroomImages && studioData.showroomImages.length > 0 && (
              <div className="img-size-full">
                <div className="relative w-full aspect-4/3 bg-gray-100 overflow-hidden">
                  <SanityImage
                    src={studioData.showroomImages[0].url}
                    alt={studioData.showroomImages[0].alt || 'Showroom & Kontor'}
                    fill className="object-cover" sizes="100vw"
                  />
                </div>
                <div className="mt-2 text-[0.75rem] leading-[1.35] text-black opacity-60">
                  {studioData.showroomImages[0].alt || 'Showroom & Kontor'}
                </div>
              </div>
            )}

            <div className="text-measure">
              <h2 className="font-medium mb-4">Bakgrunn</h2>
              <p>Daniel Tenev er utdannet ved Arkitektur og Designhøyskolen i Oslo og Det Kongelige Akademi i København.</p>
              <p>Som arkitekt spenner hans erfaring fra kultur-, utdannings- og boligbygg.</p>
            </div>

            {studioData?.team && studioData.team.length > 0 && (
              <div className="text-measure">
                <h2 className="font-medium mb-4">Team</h2>
                <div className="space-y-3">
                  {studioData.team.map((member: TeamMember, i: number) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:gap-4">
                      <span>{member.name}</span>
                      {member.title && <span className="text-gray-500">{member.title}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-measure">
              <h2 className="font-medium mb-8">Contact</h2>
              <div className="mb-8">
                <div>Studio Tenev</div>
                {siteSettings?.address && <div className="whitespace-pre-wrap">{siteSettings.address}</div>}
              </div>
              <div className="mb-8">
                {siteSettings?.contactEmail && (
                  <div><a href={`mailto:${siteSettings.contactEmail}`} className="hover:opacity-70 transition-opacity">{siteSettings.contactEmail}</a></div>
                )}
                {siteSettings?.contactPhone && (
                  <div><a href={`tel:${siteSettings.contactPhone}`} className="hover:opacity-70 transition-opacity">{siteSettings.contactPhone}</a></div>
                )}
              </div>
              {siteSettings?.instagram && (
                <div>
                  <a href={siteSettings.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                    Instagram
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
