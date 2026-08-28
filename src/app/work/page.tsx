import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { client, getProjectsQuery, getSelectedWorksQuery } from '@/sanity/client';
import WorkFilter from '@/components/WorkFilter';
import HomeGrid from '@/components/HomeGrid';
import { ProjectListItem } from '@/components/ProjectList';
import SanityImage from '@/components/SanityImage';
import { PortableText } from '@portabletext/react';
import type { PortableTextBlock } from '@portabletext/types';

export const revalidate = 60;

interface ProjectData {
  _id: string;
  title: string;
  slug?: string;
  startYear?: number;
  completionYear?: number;
  buildYear?: number;
  location?: string;
  type?: string[];
  use?: string[];
  status?: string;
  client?: string;
  contractor?: string;
  photographer?: string;
  size?: { value: number; unit: string };
  tags?: string[];
  coverImage?: string;
  coverImageAspectRatio?: number;
  coverImageAlt?: string;
  body?: PortableTextBlock[];
}

export default async function ProjectsPage(props: { searchParams: Promise<{ view?: string, tag?: string }> }) {
  const searchParams = await props.searchParams;
  const [projects] = await Promise.all([
    client.fetch(getProjectsQuery).catch(() => []),
  ]);

  const view = searchParams.view || 'gallery';
  const selectedTag = searchParams.tag || 'All';

  // Extract unique tags from the 'use' field across all projects
  const uniqueTags: string[] = Array.from(new Set<string>(
    projects.flatMap((p: ProjectData) => p.use || [])
  )).sort();

  // Filter projects by selected tag
  const filteredProjects = selectedTag === 'All' 
    ? projects 
    : projects.filter((p: ProjectData) => p.use?.includes(selectedTag));

  const projectItems: ProjectListItem[] = filteredProjects.map((p: ProjectData) => {
    let bodyNode: React.ReactNode = null;
    if (p.body) {
      bodyNode = <PortableText value={p.body} />;
    }

    return {
      _id: p._id,
      title: p.title,
      slug: p.slug,
      startYear: p.startYear,
      completionYear: p.completionYear,
      buildYear: p.buildYear,
      location: p.location,
      type: p.type,
      use: p.use,
      status: p.status,
      client: p.client,
      contractor: p.contractor,
      size: p.size,
      tags: p.tags,
      coverImage: p.coverImage,
      coverImageAspectRatio: p.coverImageAspectRatio,
      coverImageAlt: p.coverImageAlt,
      body: bodyNode,
    };
  });

  const gridItems = filteredProjects.map((p: ProjectData) => ({
    _id: p._id,
    _type: 'project',
    title: p.title,
    slug: p.slug,
    image: p.coverImage ? { url: p.coverImage, aspectRatio: p.coverImageAspectRatio || 1 } : undefined,
    coverImage: p.coverImage,
    buildYear: p.buildYear,
    location: p.location,
    status: p.status,
    client: p.client,
    contractor: p.contractor,
    size: p.size,
  }));

  const ToggleTitle = (
    <div className="group/filter flex flex-col items-center">
      <div className="flex gap-4">
        <Link 
          href={`/work?view=gallery&tag=${selectedTag}`} 
          className={`hover:underline hover:underline-offset-4 hover:decoration-1 ${view !== 'index' ? 'underline underline-offset-4 decoration-1' : ''}`}
        >
          Projects
        </Link>
        <Link 
          href={`/work?view=index&tag=${selectedTag}`} 
          className={`hover:underline hover:underline-offset-4 hover:decoration-1 ${view === 'index' ? 'underline underline-offset-4 decoration-1' : ''}`}
        >
          Index
        </Link>
      </div>
      
      {/* Tags Menu */}
      <div className="grid [grid-template-rows:0fr] group-hover/filter:[grid-template-rows:1fr] transition-all duration-300 ease-out">
        <div className="min-h-0 flex justify-center invisible opacity-0 group-hover/filter:visible group-hover/filter:opacity-100 transition-all duration-200 ease-in">
          <ul className="flex gap-4 pt-2 font-normal" style={{ fontWeight: 400 }}>
            <li>
              <Link 
                href={`/work?view=${view}`} 
                className={`hover:underline hover:underline-offset-4 hover:decoration-1 ${selectedTag === 'All' ? 'underline underline-offset-4 decoration-1' : ''}`}
              >
                All
              </Link>
            </li>
            {uniqueTags.map(tag => (
              <li key={tag}>
                <Link 
                  href={`/work?view=${view}&tag=${tag}`} 
                  className={`hover:underline hover:underline-offset-4 hover:decoration-1 ${selectedTag === tag ? 'underline underline-offset-4 decoration-1' : ''}`}
                >
                  {tag}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <Layout noPadding={view !== 'index'} projectTitle={ToggleTitle}>
      <div className="w-full flex flex-col mb-fm-5">
        {view === 'index' ? (
          projectItems.length > 0 && (
            <div className="w-full">
              <WorkFilter 
                items={projectItems} 
                tags={uniqueTags}
              />
            </div>
          )
        ) : (
          <div className="w-full pt-16 md:pt-24">
            <HomeGrid items={gridItems} />
          </div>
        )}
      </div>
    </Layout>
  );
}
