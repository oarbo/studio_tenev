import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout';
import SanityImage from '@/components/SanityImage';
import ProjectSlideshow, { SlideshowImage } from '@/components/ProjectSlideshow';
import ProjectCloseButton from '@/components/ProjectCloseButton';
import { client, getProjectBySlugQuery, getAllProjectsSummaryQuery } from '@/sanity/client';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

export const revalidate = 60;

interface GalleryItem {
  url: string;
  alt?: string;
  caption?: string;
  aspectRatio?: number;
}

interface RelatedProjectSummary {
  _id: string;
  title: string;
  slug: string;
  use?: string;
  type?: string;
  coverImage?: string;
  coverImageAspectRatio?: number;
}

interface ContentBlock {
  _type: 'textBlock' | 'imageBlock' | 'videoBlock' | 'slideshowBlock' | 'metadataBlock';
  _key: string;
  text?: PortableTextBlock[];
  caption?: string;
  size?: string;
  image?: string;
  imageAspectRatio?: number;
  videoUrl?: string;
  title?: string;
  images?: SlideshowImage[];
}

interface ProjectData {
  _id: string;
  title: string;
  slug?: string;
  startYear?: number;
  completionYear?: number;
  buildYear?: number;
  location?: string;
  type?: string;
  use?: string;
  status?: string;
  client?: string;
  contractor?: string;
  photographer?: string;
  size?: { value: number; unit: string };
  tags?: string[];
  coverImage?: string;
  coverImageAspectRatio?: number;
  coverImageAlt?: string;
  gallery?: GalleryItem[];
  body?: PortableTextBlock[];
  contentBlocks?: ContentBlock[];
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project: ProjectData | null = await client
    .fetch(getProjectBySlugQuery, { slug })
    .catch(() => null);

  if (!project) {
    notFound();
  }

  const formatDateRange = () => {
    if (project.startYear) {
      if (project.completionYear) {
        if (project.startYear === project.completionYear) {
          return `${project.startYear}`;
        }
        return `${project.startYear}–${project.completionYear}`;
      }
      return `${project.startYear}–`;
    }
    return project.buildYear ? project.buildYear.toString() : '';
  };

  const dateStr = formatDateRange();

  // Fetch all projects for related section logic at the bottom
  const allProjectsSummary: RelatedProjectSummary[] = await client
    .fetch(getAllProjectsSummaryQuery)
    .catch(() => []);

  const otherProjects = allProjectsSummary.filter(
    (p) => p._id !== project._id && p.slug !== project.slug
  );

  let categoryTitle = 'projects';
  let selectedProjects: RelatedProjectSummary[] = [];

  // Primary fallback: match `use` tag
  if (project.use) {
    const matchingUse = otherProjects.filter((p) => {
      if (!p.use || !project.use) return false;
      const pUse = Array.isArray(p.use) ? p.use[0] : p.use;
      const prjUse = Array.isArray(project.use) ? project.use[0] : project.use;
      return typeof pUse === 'string' && typeof prjUse === 'string' && pUse.trim().toLowerCase() === prjUse.trim().toLowerCase();
    });
    if (matchingUse.length > 0) {
      categoryTitle = project.use;
      const fill = otherProjects.filter((p) => !matchingUse.some((m) => m._id === p._id));
      selectedProjects = [...matchingUse, ...fill].slice(0, 5);
    }
  }

  // Secondary fallback: match `type` tag if no `use` matches
  if (selectedProjects.length === 0 && project.type) {
    const matchingType = otherProjects.filter((p) => {
      if (!p.type || !project.type) return false;
      const pType = Array.isArray(p.type) ? p.type[0] : p.type;
      const prjType = Array.isArray(project.type) ? project.type[0] : project.type;
      return typeof pType === 'string' && typeof prjType === 'string' && pType.trim().toLowerCase() === prjType.trim().toLowerCase();
    });
    if (matchingType.length > 0) {
      categoryTitle = project.type;
      const fill = otherProjects.filter((p) => !matchingType.some((m) => m._id === p._id));
      selectedProjects = [...matchingType, ...fill].slice(0, 5);
    }
  }

  // General fallback: More projects
  if (selectedProjects.length === 0) {
    categoryTitle = 'projects';
    selectedProjects = otherProjects.slice(0, 5);
  }

  // Helper renderer for Data Table (Metadata Block)
  const renderMetadataBlock = (key?: string, style?: React.CSSProperties) => (
    <div key={key || 'metadata'} className="md:col-start-3 md:col-span-8 border-t border-black pt-1.5 pb-8" style={style}>
      <div className="grid grid-cols-2 md:grid-cols-8 gap-x-fm-1 gap-y-8 text-[1rem] text-black">
        {/* Col 3: Date */}
        <div className="flex flex-col">
          <div>Date</div>
          <div>{dateStr}</div>
        </div>
        {/* Col 4: Location */}
        <div className="flex flex-col">
          {project.location && (
            <>
              <div>Location</div>
              <div>{project.location}</div>
            </>
          )}
        </div>
        {/* Col 5: Client */}
        <div className="flex flex-col">
          {project.client && (
            <>
              <div>Client</div>
              <div>{project.client}</div>
            </>
          )}
        </div>
        {/* Col 6: Type */}
        <div className="flex flex-col">
          {project.type && (
            <>
              <div>Type</div>
              <div>{Array.isArray(project.type) ? project.type.join(', ') : project.type}</div>
            </>
          )}
        </div>
        {/* Col 7: Status */}
        <div className="flex flex-col">
          {project.status && (
            <>
              <div>Status</div>
              <div>{project.status}</div>
            </>
          )}
        </div>
        {/* Col 8: Size */}
        <div className="flex flex-col">
          {project.size?.value && (
            <>
              <div>Size</div>
              <div>{`${project.size.value} ${project.size.unit || ''}`}</div>
            </>
          )}
        </div>
        {/* Col 9: Use */}
        <div className="flex flex-col">
          {project.use && (
            <>
              <div>Use</div>
              <div>{Array.isArray(project.use) ? project.use.join(', ') : project.use}</div>
            </>
          )}
        </div>
        {/* Col 10: Photographer */}
        <div className="flex flex-col">
          {project.photographer && (
            <>
              <div>Photographer</div>
              <div>{project.photographer}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout noPadding projectTitle={project.title}>

      <div className={`w-full flex flex-col ${selectedProjects.length > 0 ? '' : 'mb-35'}`}>
        
        {/* Full-height Lead Hero Image (Fyller vindusstørrelsen fra bunn til topp, midtstilt) */}
        {project.coverImage && (
          <section className="relative w-full h-dvh bg-white flex justify-center">
            <Image 
              src={project.coverImage} 
              alt={project.coverImageAlt || project.title} 
              fill
              priority
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
          </section>
        )}

        {/* Content Section: 8-column Grid */}
        <div id="project-details" className="px-side-padding">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
            
            {/* Page Builder Modular Blocks (om definert i Sanity) */}
            {project.contentBlocks && project.contentBlocks.length > 0 ? (
              project.contentBlocks.map((block, index) => {
                const prevBlock = index > 0 ? project.contentBlocks![index - 1] : null;
                
                // Spacing logic: 
                // Tekst: 1 over, 2 under.
                // Bilde/Bilde: 2 linjer (ikke doblet)
                let mt = 'calc(2 * var(--fm))'; // Default for alt (eks. bilde mot bilde)
                if (index === 0) {
                   mt = block._type === 'textBlock' ? 'calc(1 * var(--fm))' : 'calc(2 * var(--fm))';
                } else if (block._type === 'textBlock') {
                   mt = 'calc(1 * var(--fm))';
                } else if (prevBlock && prevBlock._type === 'textBlock') {
                   mt = 'calc(2 * var(--fm))';
                }

                if (block._type === 'textBlock' && (block.text || block.title)) {
                  return (
                    <div key={block._key} className="md:col-start-5 md:col-span-4 min-w-0 max-w-full text-[1rem] text-black" style={{ marginTop: mt, width: 'calc(100% + var(--spacing-fm-1))' }}>
                      {block.title && (
                        <h2 className="font-medium mb-4">{block.title}</h2>
                      )}
                      {block.text && (
                        <div className="news-content !m-0 !max-w-none">
                          <PortableText value={block.text} />
                        </div>
                      )}
                    </div>
                  );
                }

                if (block._type === 'imageBlock' && block.image) {
                  const size = block.size || 'medium';
                  let gridClass = 'md:col-start-3 md:col-span-8'; // 6 kolonner (default)
                  if (size === 'xsmall' || size === 'x-small' || size === '2' || size === 'cols2') gridClass = 'md:col-start-6 md:col-span-3'; // 2 kolonner (x-small)
                  if (size === 'small' || size === '4' || size === 'cols4') gridClass = 'md:col-start-4 md:col-span-6'; // 4 kolonner
                  if (size === 'medium' || size === '6' || size === 'cols6') gridClass = 'md:col-start-3 md:col-span-8'; // 6 kolonner
                  if (size === 'large' || size === '8' || size === 'cols8') gridClass = 'md:col-start-1 md:col-span-12'; // 8 kolonner
                  if (size === 'full') gridClass = 'col-span-full full-bleed-block'; // Fullskjerm

                  return (
                    <div key={block._key} className={`${gridClass} group relative`} style={{ marginTop: mt }}>
                      <div 
                        className="relative w-full bg-gray-100"
                        style={{ aspectRatio: block.imageAspectRatio || 1.33 }}
                      >
                        <SanityImage 
                          src={block.image} 
                          alt={block.caption || project.title} 
                          fill 
                          className="object-cover overflow-hidden"
                          sizes="100vw"
                        />
                      </div>
                      {block.caption && (
                        <div
                          className="mt-[calc(1em*var(--line-height))] text-[calc(1rem-3px)] text-center leading-(--line-height)"
                          style={{ color: 'var(--secondary-color)' }}
                        >
                          {block.caption}
                        </div>
                      )}
                    </div>
                  );
                }

                if (block._type === 'videoBlock' && block.videoUrl) {
                  const size = block.size || 'medium';
                  let gridClass = 'md:col-start-3 md:col-span-8'; // 6 kolonner (default)
                  if (size === 'xsmall' || size === 'x-small' || size === '2' || size === 'cols2') gridClass = 'md:col-start-6 md:col-span-3'; // 2 kolonner (x-small)
                  if (size === 'small' || size === '4' || size === 'cols4') gridClass = 'md:col-start-4 md:col-span-6'; // 4 kolonner
                  if (size === 'medium' || size === '6' || size === 'cols6') gridClass = 'md:col-start-3 md:col-span-8'; // 6 kolonner
                  if (size === 'large' || size === '8' || size === 'cols8') gridClass = 'md:col-start-1 md:col-span-12'; // 8 kolonner
                  if (size === 'full') gridClass = 'col-span-full full-bleed-block'; // Fullskjerm

                  return (
                    <div key={block._key} className={`${gridClass} group relative`} style={{ marginTop: mt }}>
                      <div className="relative w-full bg-gray-100 aspect-video">
                        <video 
                          src={block.videoUrl} 
                          autoPlay 
                          muted 
                          loop 
                          playsInline 
                          className="w-full h-full object-cover overflow-hidden" 
                        />
                      </div>
                      {block.caption && (
                        <div
                          className="mt-[calc(1em*var(--line-height))] text-[calc(1rem-3px)] text-center leading-(--line-height)"
                          style={{ color: 'var(--secondary-color)' }}
                        >
                          {block.caption}
                        </div>
                      )}
                    </div>
                  );
                }

                if (block._type === 'slideshowBlock' && block.images && block.images.length > 0) {
                  const size = block.size || 'medium';
                  let gridClass = 'md:col-start-3 md:col-span-8'; // 6 kolonner (default)
                  if (size === 'xsmall' || size === 'x-small' || size === '2' || size === 'cols2') gridClass = 'md:col-start-6 md:col-span-3'; // 2 kolonner (x-small)
                  if (size === 'small' || size === '4' || size === 'cols4') gridClass = 'md:col-start-4 md:col-span-6'; // 4 kolonner
                  if (size === 'medium' || size === '6' || size === 'cols6') gridClass = 'md:col-start-3 md:col-span-8'; // 6 kolonner
                  if (size === 'large' || size === '8' || size === 'cols8') gridClass = 'md:col-start-1 md:col-span-12'; // 8 kolonner
                  if (size === 'full') gridClass = 'col-span-full full-bleed-block'; // Fullskjerm

                  return (
                    <div key={block._key} className={gridClass} style={{ marginTop: mt }}>
                      <ProjectSlideshow images={block.images} title={block.title} size={size} />
                    </div>
                  );
                }

                if (block._type === 'metadataBlock') {
                  return renderMetadataBlock(block._key, { marginTop: mt });
                }

                return null;
              })
            ) : (
              /* Fallback Layout if contentBlocks array is empty */
              <>
                {/* Body Text */}
                {project.body && (
                  <div className="md:col-start-5 md:col-span-4 text-[1rem] text-black" style={{ marginTop: 'calc(1 * var(--fm))', width: 'calc(100% + var(--spacing-fm-1))' }}>
                    <div className="news-content !m-0 !max-w-none">
                      <PortableText value={project.body} />
                    </div>
                  </div>
                )}

                {/* Gallery Images (Stacked) */}
                {project.gallery && project.gallery.length > 0 && (
                  <div className="md:col-start-3 md:col-span-8 flex flex-col" style={{ marginTop: project.body ? 'calc(2 * var(--fm))' : 'calc(2 * var(--fm))', gap: 'calc(2 * var(--fm))' }}>
                    {project.gallery.map((img, idx) => (
                      <div key={idx} className="flex flex-col">
                        <div 
                          className="relative w-full bg-gray-100"
                          style={{ aspectRatio: img.aspectRatio || 1.33 }}
                        >
                          <SanityImage 
                            src={img.url} 
                            alt={img.caption || img.alt || `${project.title} bilde ${idx + 1}`} 
                            fill 
                            className="object-cover overflow-hidden"
                            sizes="(max-width: 768px) 100vw, 75vw"
                          />
                        </div>
                        {(img.caption || img.alt) && (
                          <div
                            className="mt-[calc(1em*var(--line-height))] text-[calc(1rem-3px)] text-center leading-(--line-height)"
                            style={{ color: 'var(--secondary-color)' }}
                          >
                            {img.caption || img.alt}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Data Table Metadata Block at the bottom */}
                {renderMetadataBlock('fallback-metadata', { marginTop: 'calc(2 * var(--fm))' })}
              </>
            )}

          </div>
        </div>

        {/* More Projects Section (Svart bakgrunn som sekundærdel før footer) */}
        {selectedProjects.length > 0 && (
          <section className="w-full bg-[#1a1a1a] text-white pt-16 pb-20 mt-35">
            <div className="px-side-padding">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
                <div className="md:col-start-3 md:col-span-8 flex flex-col gap-6">
                  <h2 className="text-[1rem] font-normal leading-tight text-white">
                    More {categoryTitle}
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-fm-1 gap-y-8">
                    {selectedProjects.map((p) => (
                      <Link key={p._id} href={`/work/${p.slug}`} className="flex flex-col gap-2 group">
                        <div className="relative w-full aspect-4/3 bg-gray-900 overflow-hidden">
                          {p.coverImage ? (
                            <SanityImage 
                              src={p.coverImage} 
                              alt={p.title} 
                              fill 
                              className="object-cover grayscale group-hover:grayscale-0 transition-all duration-150 ease-out"
                              sizes="(max-width: 768px) 50vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-800" />
                          )}
                        </div>
                        <div className="text-[1rem] leading-tight text-white/70 group-hover:text-white transition-colors duration-150">
                          {p.title}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </Layout>
  );
}
