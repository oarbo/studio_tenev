import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Layout from '@/components/Layout';
import SanityImage, { SanityHotspot } from '@/components/SanityImage';
import ProjectSlideshow, { SlideshowImage } from '@/components/ProjectSlideshow';
import ProjectMediaCarousel, { ProjectMediaSlide } from '@/components/ProjectMediaCarousel';
import ProjectMetadataBlock from '@/components/ProjectMetadataBlock';
import MoreProjectsSection from '@/components/MoreProjectsSection';
import { ProjectLocalizedTextBlock, ProjectLocalizedCaption } from '@/components/ProjectLocalizedText';
import { client, getProjectBySlugQuery, getAllProjectsSummaryQuery, getAllProjectSlugsQuery } from '@/sanity/client';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';
import { formatTypography, formatPortableText, formatYearRange } from '@/utils/typography';

export const revalidate = 0;

export async function generateStaticParams() {
  const projects = await client.fetch(getAllProjectSlugsQuery).catch(() => []);
  return (projects || []).map((p: { slug: string }) => ({ slug: p.slug }));
}

interface GalleryItem {
  url: string;
  alt?: string;
  caption?: string;
  captionEn?: string;
  aspectRatio?: number;
  lqip?: string;
  hotspot?: SanityHotspot;
  filename?: string;
}

interface RelatedProjectSummary {
  _id: string;
  title: string;
  titleEn?: string;
  slug: string;
  use?: string | string[];
  type?: string | string[];
  coverImage?: string;
  coverImageLqip?: string;
  coverImageAspectRatio?: number;
  coverImageHotspot?: SanityHotspot;
}

interface ColumnItem {
  _type: 'columnImage' | 'columnVideo' | 'columnText' | 'columnBlank';
  _key: string;
  title?: string;
  titleEn?: string;
  text?: PortableTextBlock[];
  textEn?: PortableTextBlock[];
  caption?: string;
  captionEn?: string;
  aspectRatio?: string;
  image?: string;
  imageFilename?: string;
  imageLqip?: string;
  imageAspectRatio?: number;
  imageHotspot?: SanityHotspot;
  videoUrl?: string;
}

export interface CarouselMediaItem {
  _type?: string;
  _key?: string;
  type?: 'image' | 'video';
  url?: string;
  videoUrl?: string;
  posterUrl?: string;
  alt?: string;
  caption?: string;
  captionEn?: string;
  aspectRatio?: number;
  lqip?: string;
  hotspot?: SanityHotspot;
  filename?: string;
}

interface ContentBlock {
  _type: 'textBlock' | 'imageBlock' | 'videoBlock' | 'slideshowBlock' | 'metadataBlock' | 'columnsBlock' | 'carouselBlock' | string;
  _key: string;
  disabled?: boolean;
  text?: PortableTextBlock[];
  textEn?: PortableTextBlock[];
  caption?: string;
  captionEn?: string;
  size?: string;
  image?: string;
  imageFilename?: string;
  imageLqip?: string;
  imageAspectRatio?: number;
  imageHotspot?: SanityHotspot;
  videoUrl?: string;
  title?: string;
  titleEn?: string;
  isDrawings?: boolean;
  singleSlide?: boolean;
  items?: CarouselMediaItem[];
  images?: (SlideshowImage & { filename?: string })[];
  columnsCount?: string;
  verticalAlign?: string;
  columns?: ColumnItem[];
}

interface ProjectData {
  _id: string;
  title: string;
  titleEn?: string;
  slug?: string;
  startYear?: number;
  completionYear?: number;
  buildYear?: number;
  location?: string;
  country?: string;
  type?: string | string[];
  use?: string | string[];
  status?: string;
  statusEn?: string;
  client?: string;
  contractor?: string;
  photographer?: string;
  imageCreditType?: string;
  renderingFirm?: string;
  size?: { value: number; unit: string };
  coverImage?: string;
  coverImageFilename?: string;
  coverImageLqip?: string;
  coverImageAspectRatio?: number;
  coverImageHotspot?: SanityHotspot;
  coverImageAlt?: string;
  carouselMedia?: CarouselMediaItem[];
  heroTextColor?: 'auto' | 'white' | 'black';
  gallery?: GalleryItem[];
  body?: PortableTextBlock[];
  contentBlocks?: ContentBlock[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project: ProjectData | null = await client
    .fetch(getProjectBySlugQuery, { slug })
    .catch(() => null);

  if (!project) {
    return { title: 'Project Not Found — Studio Tenev' };
  }

  const descriptionParts = [
    project.location,
    Array.isArray(project.type) ? project.type.join(', ') : project.type,
    project.completionYear || project.startYear,
  ].filter(Boolean);

  const description =
    descriptionParts.length > 0
      ? `${project.title} (${descriptionParts.join(' · ')}) — Studio Tenev`
      : `${project.title} — Studio Tenev`;

  return {
    title: `${project.title} — Studio Tenev`,
    description,
    alternates: {
      canonical: `/work/${project.slug || slug}`,
    },
    openGraph: {
      title: `${project.title} — Studio Tenev`,
      description,
      images: project.coverImage ? [{ url: `${project.coverImage}?w=1600&auto=format` }] : undefined,
    },
  };
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
    return formatYearRange(project.startYear, project.completionYear, project.buildYear);
  };

  const dateStr = formatDateRange();

  // Fetch all projects for related section logic at the bottom
  const allProjectsSummary: RelatedProjectSummary[] = await client
    .fetch(getAllProjectsSummaryQuery)
    .catch(() => []);

  // Only include other projects that have a valid cover image
  const otherProjects = allProjectsSummary.filter(
    (p) => p._id !== project._id && p.slug !== project.slug && Boolean(p.coverImage)
  );

  let categoryTitle = 'projects';
  let selectedProjects: RelatedProjectSummary[] = [];

  // Primary match: `use` tag
  if (project.use) {
    const prjUse = Array.isArray(project.use) ? project.use[0] : project.use;
    const matchingUse = otherProjects.filter((p) => {
      if (!p.use || !prjUse) return false;
      const pUse = Array.isArray(p.use) ? p.use[0] : p.use;
      return typeof pUse === 'string' && typeof prjUse === 'string' && pUse.trim().toLowerCase() === prjUse.trim().toLowerCase();
    });
    if (matchingUse.length > 0 && prjUse) {
      categoryTitle = prjUse;
      selectedProjects = matchingUse.slice(0, 5);
    }
  }

  // Secondary match: `type` tag if no `use` matches
  if (selectedProjects.length === 0 && project.type) {
    const prjType = Array.isArray(project.type) ? project.type[0] : project.type;
    const matchingType = otherProjects.filter((p) => {
      if (!p.type || !prjType) return false;
      const pType = Array.isArray(p.type) ? p.type[0] : p.type;
      return typeof pType === 'string' && typeof prjType === 'string' && pType.trim().toLowerCase() === prjType.trim().toLowerCase();
    });
    if (matchingType.length > 0 && prjType) {
      categoryTitle = prjType;
      selectedProjects = matchingType.slice(0, 5);
    }
  }

  // General fallback: More projects (only projects with images, up to 5)
  if (selectedProjects.length === 0) {
    categoryTitle = 'projects';
    selectedProjects = otherProjects.slice(0, 5);
  }

  const combinedTypeTags = Array.from(
    new Set(
      [
        ...(Array.isArray(project.type) ? project.type : project.type ? [project.type] : []),
        ...(Array.isArray(project.use) ? project.use : project.use ? [project.use] : []),
      ]
        .map((t) => (typeof t === 'string' ? t.trim() : ''))
        .filter(Boolean)
    )
  );

  // Helper renderer for Data Table (Metadata Block)
  const renderMetadataBlock = (key?: string, style?: React.CSSProperties) => (
    <ProjectMetadataBlock
      key={key || 'metadata'}
      id={key}
      style={style}
      projectTitle={project.title}
      projectTitleEn={project.titleEn}
      dateStr={dateStr}
      location={project.location}
      country={project.country}
      client={project.client}
      typeTags={combinedTypeTags}
      status={project.status}
      statusEn={project.statusEn}
      size={project.size}
      contractor={project.contractor}
      photographer={project.photographer}
      imageCreditType={project.imageCreditType}
      renderingFirm={project.renderingFirm}
    />
  );

  // Helper for image and video sizing in Sidebygger (Page Builder)
  const getGridClassAndSizes = (size?: string) => {
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
  };

  // 1. TOP CAROUSEL: All project photos & videos from carouselMedia ONLY
  const photoSlides: ProjectMediaSlide[] = [];
  const seenUrls = new Set<string>();

  const addTopSlide = (slide: ProjectMediaSlide) => {
    const mediaKey = (slide.videoUrl || slide.url || '').trim().toLowerCase();
    if (!mediaKey) return;
    if (seenUrls.has(mediaKey)) return;
    seenUrls.add(mediaKey);
    photoSlides.push(slide);
  };

  // Kun bilder og video du legger til i selve bildekarusellmenyen skal vises i toppkarusellen
  if (project.carouselMedia && project.carouselMedia.length > 0) {
    for (const item of project.carouselMedia) {
      if (item.videoUrl) {
        addTopSlide({
          _key: item._key || item.videoUrl,
          videoUrl: item.videoUrl,
          posterUrl: item.posterUrl,
          type: 'video',
          alt: item.alt || project.title,
          aspectRatio: item.aspectRatio || 1.777,
          lqip: item.lqip,
        });
      } else if (item.url) {
        addTopSlide({
          _key: item._key || item.url,
          url: item.url,
          type: 'image',
          alt: item.alt || project.title,
          caption: item.caption,
          aspectRatio: item.aspectRatio || 1.4,
          lqip: item.lqip,
          hotspot: item.hotspot,
        });
      }
    }
  }

  // Fallback til representasjonsbilde dersom prosjektet ikke har noen medier i karusellen
  if (photoSlides.length === 0 && project.coverImage) {
    addTopSlide({
      _key: 'cover-image',
      url: project.coverImage,
      type: 'image',
      alt: project.coverImageAlt || project.title,
      aspectRatio: project.coverImageAspectRatio || 1.4,
      lqip: project.coverImageLqip,
      hotspot: project.coverImageHotspot,
    });
  }

  // Eventuelle tegnings-slides kun fra eldre/fallback galleri dersom prosjektet mangler Sidebygger
  const drawingSlides: ProjectMediaSlide[] = [];
  const isPlanOrDrawing = (
    caption?: string,
    alt?: string,
    title?: string,
    filename?: string
  ): boolean => {
    const str = `${caption || ''} ${alt || ''} ${title || ''} ${filename || ''}`.toLowerCase();
    return /\b(plan|plantegning|situasjonsplan|snitt|fasade|tegning|linjetegning|diagram|skisse|etasje|section|elevation|drawing)\b/i.test(str);
  };

  if ((!project.contentBlocks || project.contentBlocks.length === 0) && project.gallery && project.gallery.length > 0) {
    for (const item of project.gallery) {
      if (!item.url) continue;
      const isDrawing = isPlanOrDrawing(item.caption, item.alt, undefined, item.filename);
      if (isDrawing) {
        drawingSlides.push({
          _key: item.url,
          url: item.url,
          alt: item.caption || item.alt || project.title,
          caption: item.caption,
          captionEn: item.captionEn,
          aspectRatio: item.aspectRatio || 1.4,
          lqip: item.lqip,
          hotspot: item.hotspot,
        });
      }
    }
  }

  // Filter out disabled blocks and any legacy metadataBlock from sidebygger
  const activeBlocks = (project.contentBlocks || []).filter(
    (b) => !b.disabled && b._type !== 'metadataBlock'
  );

  const firstTextBlock = activeBlocks.find(
    (b) => b._type === 'textBlock' && (b.text || b.title || b.textEn || b.titleEn)
  );
  const hasTextBlock = Boolean(firstTextBlock);

  const renderGridBlock = (block: ContentBlock) => {
    /* Tekstblokk */
    if (block._type === 'textBlock' && (block.text || block.title || block.textEn || block.titleEn)) {
      const isMainTextBlock = block._key === firstTextBlock?._key;
      return (
        <div key={block._key} className="md:col-start-3 md:col-span-8 text-[1rem] text-black">
          <ProjectLocalizedTextBlock
            title={block.title}
            titleEn={block.titleEn}
            text={block.text}
            textEn={block.textEn}
            metadataNode={isMainTextBlock ? renderMetadataBlock('main-text-metadata') : undefined}
          />
        </div>
      );
    }

    /* Bildeblokk */
    if (block._type === 'imageBlock' && block.image) {
      const { gridClass, sizes } = getGridClassAndSizes(block.size);
      return (
        <div key={block._key} className={`${gridClass} group relative flex flex-col`}>
          <div 
            className="relative w-full bg-gray-100"
            style={{ aspectRatio: block.imageAspectRatio || 1.33 }}
          >
            <SanityImage 
              src={block.image} 
              alt={block.caption || project.title} 
              fill 
              className="object-cover overflow-hidden"
              sizes={sizes}
              lqip={block.imageLqip}
              hotspot={block.imageHotspot}
            />
          </div>
          {(block.caption || block.captionEn) && (
            <ProjectLocalizedCaption
              caption={block.caption}
              captionEn={block.captionEn}
            />
          )}
        </div>
      );
    }

    /* Videoblokk */
    if (block._type === 'videoBlock' && block.videoUrl) {
      const { gridClass } = getGridClassAndSizes(block.size);
      return (
        <div key={block._key} className={`${gridClass} group relative flex flex-col`}>
          <div className="relative w-full bg-gray-100 aspect-video">
            <video 
              src={block.videoUrl} 
              autoPlay 
              muted 
              loop 
              playsInline 
              preload="auto"
              className="w-full h-full object-cover overflow-hidden" 
            />
          </div>
          {(block.caption || block.captionEn) && (
            <ProjectLocalizedCaption
              caption={block.caption}
              captionEn={block.captionEn}
            />
          )}
        </div>
      );
    }

    /* Slideshow (f.eks. for plantegninger) */
    if (block._type === 'slideshowBlock' && block.images && block.images.length > 0) {
      return (
        <div key={block._key} className="md:col-start-3 md:col-span-8">
          <ProjectSlideshow images={block.images} title={block.title} size={block.size} />
        </div>
      );
    }

    /* Kolonner (2–3 kolonner) */
    if (block._type === 'columnsBlock' && block.columns && block.columns.length > 0) {
      const colsCount = block.columnsCount === '3' ? 3 : block.columnsCount === '2' ? 2 : Math.min(block.columns.length, 3);
      const colGridClass = block.size === 'large' 
        ? 'md:col-start-1 md:col-span-12' 
        : block.size === 'small' 
        ? 'md:col-start-4 md:col-span-6' 
        : 'md:col-start-3 md:col-span-8';
      const alignClass = block.verticalAlign === 'center' 
        ? 'items-center' 
        : block.verticalAlign === 'bottom' 
        ? 'items-end' 
        : 'items-start';

      return (
        <div key={block._key} className={colGridClass}>
          <div className={`grid grid-cols-1 ${colsCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-x-fm-1 gap-y-6 ${alignClass}`}>
            {block.columns.map((col) => {
              if (col._type === 'columnImage' && col.image) {
                return (
                  <div key={col._key} className="flex flex-col">
                    <div 
                      className="relative w-full bg-gray-100" 
                      style={{ aspectRatio: col.imageAspectRatio || (col.aspectRatio === 'square' ? 1 : col.aspectRatio === 'portrait' ? 0.75 : 1.33) }}
                    >
                      <SanityImage
                        src={col.image}
                        alt={col.caption || project.title}
                        fill
                        className="object-cover overflow-hidden"
                        sizes={`(max-width: 768px) 100vw, ${Math.round(100 / colsCount)}vw`}
                        lqip={col.imageLqip}
                        hotspot={col.imageHotspot}
                      />
                    </div>
                    {(col.caption || col.captionEn) && (
                      <ProjectLocalizedCaption caption={col.caption} captionEn={col.captionEn} />
                    )}
                  </div>
                );
              }
              if (col._type === 'columnVideo' && col.videoUrl) {
                return (
                  <div key={col._key} className="flex flex-col">
                    <div className="relative w-full bg-gray-100 aspect-video">
                      <video src={col.videoUrl} autoPlay muted loop playsInline preload="auto" className="w-full h-full object-cover overflow-hidden" />
                    </div>
                    {(col.caption || col.captionEn) && (
                      <ProjectLocalizedCaption caption={col.caption} captionEn={col.captionEn} />
                    )}
                  </div>
                );
              }
              if (col._type === 'columnText' && (col.text || col.title || col.textEn || col.titleEn)) {
                return (
                  <div key={col._key} className="flex flex-col text-[1rem] text-black">
                    <ProjectLocalizedTextBlock title={col.title} titleEn={col.titleEn} text={col.text} textEn={col.textEn} />
                  </div>
                );
              }
              if (col._type === 'columnBlank') {
                return <div key={col._key} className="hidden md:block" />;
              }
              return null;
            })}
          </div>
        </div>
      );
    }

    /* Prosjekt-metadata (Dersom prosjektet ikke har noen tekstblokk i sidebyggeren) */
    if (block._type === 'metadataBlock') {
      return (
        <div key={block._key} className="md:col-start-3 md:col-span-8 text-[1rem] text-black">
          <div className="text-measure">
            {renderMetadataBlock(block._key)}
          </div>
        </div>
      );
    }

    return null;
  };

  type SectionItem =
    | { type: 'grid'; id: string; blocks: ContentBlock[] }
    | { type: 'carousel'; id: string; block: ContentBlock };

  const contentSections: SectionItem[] = [];
  let currentGridBlocks: ContentBlock[] = [];

  for (const b of activeBlocks) {
    if (b._type === 'carouselBlock' && b.items && b.items.length > 0) {
      if (currentGridBlocks.length > 0) {
        contentSections.push({ type: 'grid', id: currentGridBlocks[0]._key, blocks: currentGridBlocks });
        currentGridBlocks = [];
      }
      contentSections.push({ type: 'carousel', id: b._key, block: b });
    } else {
      currentGridBlocks.push(b);
    }
  }

  if (!hasTextBlock && activeBlocks.length > 0) {
    currentGridBlocks.push({
      _type: 'metadataBlock',
      _key: 'auto-project-metadata',
    });
  }

  if (currentGridBlocks.length > 0) {
    contentSections.push({ type: 'grid', id: currentGridBlocks[0]._key, blocks: currentGridBlocks });
  }

  return (
    <Layout 
      noPadding 
      projectTitle={project.title}
      projectTitleEn={project.titleEn}
    >
      <div className={`w-full flex flex-col ${selectedProjects.length > 0 ? '' : 'mb-35'}`}>
        
        {/* 1. TOP CAROUSEL: All project photos & videos from carouselMedia */}
        {photoSlides.length > 0 && (
          <section className="w-full">
            <ProjectMediaCarousel slides={photoSlides} title={project.title} />
          </section>
        )}

        {/* 2. SIDEBYGGER / INNHOLDSBLOKKER */}
        {project.contentBlocks && project.contentBlocks.length > 0 ? (
          <div id="project-details" className="w-full">
            {contentSections.map((sec) => {
              if (sec.type === 'carousel') {
                const block = sec.block;
                const blockSlides: ProjectMediaSlide[] = (block.items || []).map((item) => ({
                  _key: item._key || item.url || item.videoUrl,
                  url: item.url,
                  videoUrl: item.videoUrl,
                  posterUrl: item.posterUrl,
                  type: item.type,
                  alt: item.alt || block.title || project.title,
                  caption: item.caption,
                  captionEn: item.captionEn,
                  aspectRatio: item.aspectRatio || 1.4,
                  lqip: item.lqip,
                  hotspot: item.hotspot,
                }));

                return (
                  <section key={sec.id} className="w-full mb-[4.75rem] md:mb-[6rem]">
                    {block.title && (
                      <div className="px-side-padding mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
                          <h3 className="md:col-start-3 md:col-span-8 text-[1rem] font-medium">{block.title}</h3>
                        </div>
                      </div>
                    )}
                    <ProjectMediaCarousel 
                      slides={blockSlides} 
                      title={block.title || project.title} 
                      singleSlide={Boolean(block.singleSlide || block.isDrawings)} 
                      isInline
                    />
                  </section>
                );
              }

              return (
                <div key={sec.id} className="px-side-padding mb-[4.75rem] md:mb-[6rem]">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 gap-y-fm-2">
                    {sec.blocks.map((block) => renderGridBlock(block))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Fallback Layout if contentBlocks array is empty */
          <div id="project-details" className="px-side-padding mb-[4.75rem] md:mb-[6rem]">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 gap-y-fm-2">
              {project.body ? (
                <div className="md:col-start-3 md:col-span-8 text-[1rem] text-black">
                  <div className="text-measure">
                    <div className="news-content !m-0 !max-w-none text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                      <PortableText value={project.body} />
                    </div>
                    <div className="mt-[1.5em]">
                      {renderMetadataBlock('fallback-metadata')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="md:col-start-3 md:col-span-8 text-[1rem] text-black">
                  <div className="text-measure">
                    {renderMetadataBlock('fallback-metadata')}
                  </div>
                </div>
              )}

              {/* Legacy Gallery Images (Stacked) dersom prosjektet har det */}
              {project.gallery && project.gallery.length > 0 && (
                <div className="md:col-start-3 md:col-span-8 flex flex-col gap-6">
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
                          lqip={img.lqip}
                          hotspot={img.hotspot}
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
            </div>
          </div>
        )}

        {/* 3. DRAWINGS & PLANS CAROUSEL (Dersom definert fra legacy galleri) */}
        {drawingSlides.length > 0 && (
          <section className="w-full flex flex-col mb-[4.75rem] md:mb-[6rem]">
            <ProjectMediaCarousel slides={drawingSlides} title={project.title} singleSlide={true} />
          </section>
        )}

        {/* 4. MORE PROJECTS SECTION */}
        {selectedProjects.length > 0 && (
          <MoreProjectsSection projects={selectedProjects} categoryTitle={categoryTitle} />
        )}

      </div>
    </Layout>
  );
}
