'use client';

import React from 'react';
import Link from 'next/link';
import SanityImage from './SanityImage';

interface Project {
  _id: string;
  title: string;
  slug: string;
  buildYear?: number;
  coverImage: string;
  coverImageAlt?: string;
  location?: string;
  type?: string;
  status?: string;
  client?: string;
  contractor?: string;
  photographer?: string;
  size?: {
    value: number;
    unit: string;
  };
}

interface ProjectsOverviewProps {
  projects: Project[];
}

export default function ProjectsOverview({ projects }: ProjectsOverviewProps) {
  return (
    <div className="w-full mb-fm-4 px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-fm px-0 w-full">
        {projects.map((project) => (
          <Link href={`/projects/${project.slug}`} key={project._id} className="relative group w-full block">
            <div className="w-full aspect-4/3 relative bg-gray-100 overflow-hidden">
              {project.coverImage ? (
                <SanityImage
                  src={project.coverImage}
                  alt={project.coverImageAlt || project.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Bilde mangler</div>
              )}
            </div>
            <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-250 text-[23px] leading-[29px]">
              {project.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
