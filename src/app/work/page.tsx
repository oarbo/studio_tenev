import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import { client, getProjectsQuery } from '@/sanity/client';
import WorkFilter from '@/components/WorkFilter';
import ProjectCarousel from '@/components/ProjectCarousel';
import { ProjectListItem } from '@/components/ProjectList';
import { SanityHotspot } from '@/components/SanityImage';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Work — Studio Tenev',
  description:
    'Utvalgte prosjekter og komplett prosjektoversikt fra Studio Tenev Arkitekter i Bergen. Eneboliger, fritidsboliger, transformasjon, rehabilitering, interiør og kulturbygg.',
  alternates: {
    canonical: '/work',
  },
};

interface ProjectData {
  _id: string;
  title: string;
  titleEn?: string;
  slug?: string;
  showInCarousel?: boolean;
  summary?: string;
  summaryEn?: string;
  firstTextBlock?: PortableTextBlock[];
  body?: PortableTextBlock[];
  hasProjectPage?: boolean;
  category?: string;
  startYear?: number;
  completionYear?: number;
  location?: string;
  type?: string[];
  use?: string[];
  status?: string;
  statusEn?: string;
  client?: string;
  contractor?: string;
  photographer?: string;
  size?: { value: number; unit: string };
  coverImage?: string;
  coverImageLqip?: string;
  coverImageAspectRatio?: number;
  coverImageHotspot?: SanityHotspot;
  coverImageAlt?: string;
}

export default async function ProjectsPage() {
  const projects: ProjectData[] = await client.fetch(getProjectsQuery).catch(() => []);

  const projectItems: ProjectListItem[] = projects.map((p: ProjectData) => {
    const rawBlocks = p.firstTextBlock || p.body;
    const extractedText = Array.isArray(rawBlocks)
      ? rawBlocks
          .map((block) => {
            if (block?._type !== 'block' || !Array.isArray(block.children)) return '';
            return block.children
              .map((child) => (typeof child?.text === 'string' ? child.text : ''))
              .join('')
              .trim();
          })
          .filter(Boolean)
          .join(' ')
      : '';

    return {
      _id: p._id,
      title: p.title,
      titleEn: p.titleEn,
      slug: p.slug,
      category: p.category,
      startYear: p.startYear,
      completionYear: p.completionYear,
      location: p.location,
      type: p.type,
      use: p.use,
      status: p.status,
      statusEn: p.statusEn,
      client: p.client,
      contractor: p.contractor,
      photographer: p.photographer,
      size: p.size,
      coverImage: p.coverImage,
      coverImageLqip: p.coverImageLqip,
      coverImageHotspot: p.coverImageHotspot,
      coverImageAspectRatio: p.coverImageAspectRatio,
      coverImageAlt: p.coverImageAlt,
      summary: p.summary?.trim() || extractedText || undefined,
      summaryEn: p.summaryEn?.trim() || undefined,
      hasProjectPage: p.hasProjectPage,
    };
  });

  // Vis kun prosjekter som er huket av for karusellen (fallback til alle med bilde hvis ingen er huket av ennå)
  const projectsWithImage = projects.filter((p) => Boolean(p.coverImage));
  const selectedForCarousel = projectsWithImage.filter((p) => p.showInCarousel !== false);
  const carouselSource = selectedForCarousel.length > 0 ? selectedForCarousel : projectsWithImage;

  const carouselItems = carouselSource.map((p: ProjectData) => ({
    _id: p._id,
    _type: 'project',
    title: p.title,
    titleEn: p.titleEn,
    slug: p.slug,
    category: p.category,
    image: p.coverImage
      ? {
          url: p.coverImage,
          aspectRatio: p.coverImageAspectRatio || 1.4,
          lqip: p.coverImageLqip,
          hotspot: p.coverImageHotspot,
        }
      : undefined,
    coverImage: p.coverImage,
  }));

  return (
    <Layout noPadding={true}>
      <div className="w-full flex flex-col mb-fm-5">
        <h1 className="sr-only">Work — Prosjekter av Studio Tenev</h1>
        <div id="project-carousel" className="w-full">
          <ProjectCarousel items={carouselItems} />
        </div>
        {projectItems.length > 0 && (
          <div id="project-list" className="w-full mt-0 scroll-mt-20">
            <WorkFilter items={projectItems} />
          </div>
        )}
      </div>
    </Layout>
  );
}
