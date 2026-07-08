'use client';

import React, { useState } from 'react';
import SanityImage from './SanityImage';

interface Project {
  _id: string;
  title: string;
  slug: string;
  completionYear: number;
  coverImage: string;
  coverImageAlt?: string;
}

interface ProjectsOverviewProps {
  projects: Project[];
}

export default function ProjectsOverview({ projects }: ProjectsOverviewProps) {
  // Lokal tilstand for veksling av visningsmodus
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="w-full mb-fm-4">
      {/* Meny for å bytte modus */}
      <div className="flex justify-end gap-fm-1 mb-fm-2 text-sm uppercase tracking-wide">
        <button 
          onClick={() => setViewMode('grid')}
          className={viewMode === 'grid' ? 'underline decoration-1 underline-offset-4' : 'opacity-50 hover:opacity-100'}
        >
          Image view
        </button>
        <button 
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'underline decoration-1 underline-offset-4' : 'opacity-50 hover:opacity-100'}
        >
          Text view
        </button>
      </div>

      {/* Bildevisning: 2 kolonner desktop (tilsvarer 4+4 i hovedgrid), 1 kolonne mobil */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-fm">
          {projects.map((project) => (
            <div key={project._id} className="w-full relative group">
              {/* Proposjonal bildecontainer (f.eks. 4:3) */}
              <div className="w-full aspect-[4/3] relative bg-gray-100 overflow-hidden">
                {project.coverImage ? (
                  <SanityImage
                    src={project.coverImage}
                    alt={project.coverImageAlt || project.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Intet bilde</div>
                )}
              </div>
              <div className="mt-2 text-sm flex justify-between">
                <span>{project.title}</span>
                <span>{project.completionYear}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tekstvisning: Minimalistisk typografisk liste */}
      {viewMode === 'list' && (
        <ul className="flex flex-col gap-0 border-t border-black">
          {projects.map((project) => (
            <li key={project._id} className="flex justify-between items-baseline py-fm-1 border-b border-gray-300 hover:bg-gray-50 cursor-pointer">
              <span className="text-lg md:text-xl font-medium">{project.title}</span>
              <span className="text-sm text-gray-500 tabular-nums">{project.completionYear}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
