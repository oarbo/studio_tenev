'use client';

import React, { useState } from 'react';
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
    location?: string;
    country?: string;
    client?: string;
    contractor?: string;
    photographer?: string;
    renderingFirm?: string;
    team?: string[] | string;
  };
}

function formatTeamList(team?: string[] | string): string {
  if (!team) return '';

  const rawList = Array.isArray(team) ? team : [team];
  const names: string[] = [];

  for (const item of rawList) {
    if (typeof item === 'string') {
      const parts = item.split(',').map((p) => p.trim()).filter(Boolean);
      names.push(...parts);
    }
  }

  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;

  const allExceptLast = names.slice(0, -1).join(', ');
  const last = names[names.length - 1];
  return `${allExceptLast} & ${last}`;
}

export default function ProjectDetailHeaderRow({ project }: ProjectDetailHeaderRowProps) {
  const { locale, t, translateStatus, translateTag } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const displayTitle = (locale === 'en' && project.titleEn) ? project.titleEn : project.title;
  const displayStatus = (locale === 'en' && project.statusEn) ? project.statusEn : translateStatus(project.status);
  const dateStr = formatYearRange(project.startYear, project.completionYear, project.buildYear);
  const projectTags = getProjectTags({ type: project.type, use: project.use });

  const sizeStr = project.size?.value
    ? `${project.size.value}\u00A0${(project.size.unit || 'm²').trim()}`
    : '';

  // Kun sted (uten land)
  let locationStr = '';
  if (project.location) {
    let locValue = project.location.trim();
    locValue = locValue
      .replace(/,\s*(Norge|Norway|Tyskland|Germany|Litauen|Lithuania)$/i, '')
      .trim();
    locationStr = locValue;
  }

  // ----------------------------------------------------
  // MOBILVISNING (< 768px):
  // 1. Default rader: Navn, Sted, Type, Størrelse, År, Status
  // ----------------------------------------------------
  const defaultMobileRows: { label: string; valueNode: React.ReactNode }[] = [
    {
      label: t('name'),
      valueNode: renderTypography(displayTitle, locale === 'en' ? 'en-GB' : 'nb'),
    },
    ...(locationStr
      ? [
          {
            label: t('location'),
            valueNode: locationStr,
          },
        ]
      : []),
    ...(projectTags.length > 0
      ? [
          {
            label: t('type'),
            valueNode: (
              <>
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
              </>
            ),
          },
        ]
      : []),
    ...(sizeStr
      ? [
          {
            label: t('size'),
            valueNode: <span className="tabular-nums">{sizeStr}</span>,
          },
        ]
      : []),
    ...(dateStr
      ? [
          {
            label: t('year'),
            valueNode: <span className="tabular-nums">{dateStr}</span>,
          },
        ]
      : []),
    ...(displayStatus
      ? [
          {
            label: t('status'),
            valueNode: displayStatus,
          },
        ]
      : []),
  ];

  // ----------------------------------------------------
  // 2. Ekstra rader (skjult default, foldes ut med "Les mer"):
  // Oppdragsgiver, Team, Entreprenør, Foto, Illustrasjon etc.
  // ----------------------------------------------------
  const teamFormatted = formatTeamList(project.team);

  const extraMobileRows: { label: string; valueNode: React.ReactNode }[] = [
    ...(project.client
      ? [
          {
            label: t('client'),
            valueNode: project.client,
          },
        ]
      : []),
    ...(teamFormatted
      ? [
          {
            label: t('team'),
            valueNode: teamFormatted,
          },
        ]
      : []),
    ...(project.contractor
      ? [
          {
            label: t('contractor'),
            valueNode: project.contractor,
          },
        ]
      : []),
    ...(project.photographer
      ? [
          {
            label: t('photographer'),
            valueNode: project.photographer,
          },
        ]
      : []),
    ...(project.renderingFirm
      ? [
          {
            label: t('rendering'),
            valueNode: project.renderingFirm,
          },
        ]
      : []),
  ];

  const hasExtraRows = extraMobileRows.length > 0;

  return (
    <div className="w-full px-side-padding text-[1.125rem] md:text-[1rem] text-black">
      {/* ----------------------------------------------------
          MOBILVISNING (< 768px):
          Tabell med Name <tab> input, linje, type <tab> input osv.
          Venstrejustert tag (label) og høyrejustert input (value).
          Samme skriftstørrelse som brødtekst (1.125rem) og 100% sort.
          ---------------------------------------------------- */}
      <div className="flex md:hidden flex-col w-full font-normal">
        {/* Standardrader */}
        {defaultMobileRows.map((row, idx) => (
          <div key={row.label} className="w-full">
            <div className="w-full border-t border-black" />
            <div className="w-full flex justify-between items-baseline gap-4 py-1.5 text-left text-black">
              <span className="flex-shrink-0 text-left text-black font-normal">
                {row.label}
              </span>
              <span className="text-right text-black font-normal">
                {row.valueNode}
              </span>
            </div>
            {/* Avsluttende linje under siste standardrad */}
            {idx === defaultMobileRows.length - 1 && (
              <div className="w-full border-t border-black" />
            )}
          </div>
        ))}

        {/* Ekstrarader (glir mykt ned ved ekspansjon) */}
        {hasExtraRows && (
          <div
            className={`w-full grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isExpanded
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            }`}
          >
            <div className="overflow-hidden min-h-0">
              <div className="flex flex-col w-full font-normal">
                {extraMobileRows.map((row) => (
                  <div key={row.label} className="w-full">
                    <div className="w-full flex justify-between items-baseline gap-4 py-1.5 text-left text-black">
                      <span className="flex-shrink-0 text-left text-black font-normal">
                        {row.label}
                      </span>
                      <span className="text-right text-black font-normal">
                        {row.valueNode}
                      </span>
                    </div>
                    <div className="w-full border-t border-black" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Høyrejustert "Les mer"-knapp med mindre skriftstørrelse og pil */}
        {hasExtraRows && (
          <div className="w-full flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
              className="flex items-center gap-1.5 text-[calc(1rem-3px)] text-black hover:opacity-70 transition-opacity cursor-pointer py-1"
            >
              <span>
                {isExpanded
                  ? (locale === 'en' ? 'Show less' : 'Mindre')
                  : (locale === 'en' ? 'Read more' : 'Les mer')}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------
          TABLET OG DESKTOP (≥ 768px):
          Tabellstruktur med alle default tags:
          Navn, Sted, Type, Størrelse, År, Status.
          Dedikert 6-kolonners rutenett der Navn får mest plass,
          og alle inputs holdes på 1 linje uten kollisjon.
          ---------------------------------------------------- */}
      <div className="hidden md:block w-full">
        <div className="grid grid-cols-12 gap-x-fm-1">
          <div className="col-span-12 xl:col-start-3 xl:col-span-8">
            {/* Table Header Row */}
            <div className="grid grid-cols-[minmax(0,2.5fr)_minmax(max-content,1fr)_minmax(max-content,1.4fr)_minmax(max-content,1fr)_minmax(max-content,1fr)_minmax(max-content,1.4fr)] gap-x-4 lg:gap-x-fm-1 pb-1.5 font-normal text-left items-baseline">
              <div className="text-left whitespace-nowrap">{t('name')}</div>
              <div className="text-left whitespace-nowrap">{t('location')}</div>
              <div className="text-left whitespace-nowrap">{t('type')}</div>
              <div className="text-left whitespace-nowrap">{t('size')}</div>
              <div className="text-left whitespace-nowrap">{t('year')}</div>
              <div className="text-left whitespace-nowrap">{t('status')}</div>
            </div>

            {/* Skillelinje */}
            <div className="w-full border-t border-black" />

            {/* Prosjektets rad */}
            <div className="grid grid-cols-[minmax(0,2.5fr)_minmax(max-content,1fr)_minmax(max-content,1.4fr)_minmax(max-content,1fr)_minmax(max-content,1fr)_minmax(max-content,1.4fr)] gap-x-4 lg:gap-x-fm-1 pt-1.5 pb-[calc(0.5*var(--fm))] text-left items-baseline font-normal">
              <div className="whitespace-nowrap truncate pr-2">
                {renderTypography(displayTitle, locale === 'en' ? 'en-GB' : 'nb')}
              </div>

              <div className="whitespace-nowrap">
                {locationStr || ''}
              </div>

              <div className="whitespace-nowrap">
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

              <div className="whitespace-nowrap tabular-nums">
                {sizeStr}
              </div>

              <div className="whitespace-nowrap tabular-nums text-left">
                {dateStr || ''}
              </div>

              <div className="whitespace-nowrap">
                {displayStatus}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
