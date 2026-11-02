'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { renderTypography, formatYearRange } from '@/utils/typography';
import { getProjectTags } from './ProjectList';

export interface ProjectDetailHeaderRowProps {
  project: {
    _id?: string;
    title: string;
    titleEn?: string;
    startYear?: number;
    completionYear?: number;
    buildYear?: number | string;
    type?: string | string[];
    use?: string | string[];
    status?: string;
    statusEn?: string;
    size?: { value: number; unit: string };
  };
}

export default function ProjectDetailHeaderRow({ project }: ProjectDetailHeaderRowProps) {
  const { locale, t, translateStatus, translateTag } = useLanguage();

  const displayTitle = (locale === 'en' && project.titleEn) ? project.titleEn : project.title;
  const displayStatus = (locale === 'en' && project.statusEn) ? project.statusEn : translateStatus(project.status);
  const dateStr = formatYearRange(project.startYear, project.completionYear, project.buildYear);
  const projectTags = getProjectTags({ type: project.type, use: project.use });

  return (
    <div className="w-full px-side-padding text-[1rem] text-black">
      {/* Table Header Row: matcher kolonneoppsettet i ProjectList for tablet (12 cols) og desktop (12 cols med innhold i col 3-10) */}
      <div className="grid grid-cols-12 gap-x-fm-1 pb-1.5 font-normal">
        <div className="col-span-5 xl:col-start-3 xl:col-span-2 text-left">
          {t('name')}
        </div>
        <div className="col-span-4 xl:col-span-2 text-left">
          {t('type')}
        </div>
        <div className="col-span-1 xl:col-span-1 text-left">
          {t('size')}
        </div>
        <div className="col-span-2 xl:col-span-1 text-right xl:text-left">
          {t('year')}
        </div>
        <div className="hidden xl:block xl:col-span-2 text-left">
          {t('status')}
        </div>
      </div>

      {/* Skillelinje */}
      <div className="grid grid-cols-12 gap-x-fm-1">
        <div className="col-span-12 xl:col-start-3 xl:col-span-8 border-t border-black" />
      </div>

      {/* Prosjektets rad */}
      <div className="grid grid-cols-12 gap-x-fm-1 pt-1.5 pb-[calc(0.5*var(--fm))] text-left items-baseline font-normal">
        <div className="col-span-5 xl:col-start-3 xl:col-span-2">
          {renderTypography(displayTitle, locale === 'en' ? 'en-GB' : 'nb')}
        </div>

        <div className="col-span-4 xl:col-span-2">
          {projectTags.map((tag, idx) => (
            <React.Fragment key={tag}>
              <Link
                href={`/work?tag=${encodeURIComponent(tag)}`}
                className="hover:underline underline-offset-4 decoration-1 transition-opacity"
              >
                {translateTag(tag)}
              </Link>
              {idx < projectTags.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}
        </div>

        <div className="col-span-1 xl:col-span-1 tabular-nums whitespace-nowrap">
          {project.size?.value ? `${project.size.value}\u00A0${(project.size.unit || 'm²').trim()}` : ''}
        </div>

        <div className="col-span-2 xl:col-span-1 tabular-nums whitespace-nowrap text-right xl:text-left">
          {dateStr || ''}
        </div>

        <div className="hidden xl:block xl:col-span-2">
          {displayStatus}
        </div>
      </div>
    </div>
  );
}
