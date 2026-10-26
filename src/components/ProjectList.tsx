'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SanityImage, { SanityHotspot } from './SanityImage';
import { formatTypography, formatYearRange } from '@/utils/typography';
import { useLanguage } from '@/i18n/LanguageContext';

export interface ProjectListItem {
  _id: string;
  title: string;
  titleEn?: string;
  slug?: string;
  category?: string;
  startYear?: number;
  completionYear?: number;
  buildYear?: number | string;
  location?: string;
  type?: string | string[];
  use?: string | string[];
  status?: string;
  statusEn?: string;
  tags?: string[];
  coverImage?: string;
  coverImageLqip?: string;
  coverImageHotspot?: SanityHotspot;
  coverImageAspectRatio?: number;
  coverImageAlt?: string;
  summary?: string;
  summaryEn?: string;
  body?: React.ReactNode;
  bodyEn?: React.ReactNode;
  hasProjectPage?: boolean;
  client?: string;
  contractor?: string;
  photographer?: string;
  size?: { value: number; unit: string };
}

export interface ProjectListProps {
  items: ProjectListItem[];
  totalCount?: number;
  forceExpandAll?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (option: string) => void;
  selectedTags?: string[];
  onToggleTag?: (tag: string) => void;
  onClearTags?: () => void;
}

export const getProjectTags = (item: Pick<ProjectListItem, 'type' | 'use'>): string[] => {
  const raw = [
    ...(Array.isArray(item.type) ? item.type : item.type ? [item.type] : []),
    ...(Array.isArray(item.use) ? item.use : item.use ? [item.use] : []),
  ];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of raw) {
    if (typeof entry !== 'string') continue;
    for (const part of entry.split(',')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const lower = trimmed.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        result.push(trimmed);
      }
    }
  }

  return result;
};

function ClampedText({
  text,
  maxLines = 6,
  className,
}: {
  text: string;
  maxLines?: number;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLParagraphElement>(null);
  const [displayText, setDisplayText] = React.useState(text);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || !text) {
      setDisplayText(text);
      return;
    }

    const compute = () => {
      // 1. Measure true single line height
      el.textContent = '\u00A0';
      const singleLineHeight = el.scrollHeight || 24;
      // Allow up to maxLines (e.g. 6 lines), but strictly not an extra 7th line
      const maxAllowedHeight = Math.floor(singleLineHeight * maxLines) + 2;

      // 2. Temporarily render full text to check if it fits within maxLines
      el.textContent = text;
      if (el.scrollHeight <= maxAllowedHeight) {
        setDisplayText(text);
        return;
      }

      // 3. Overflows maxLines: binary search for max words that fit with non-breaking ellipsis "\u00A0…"
      const words = text.split(/\s+/).filter(Boolean);
      let low = 0;
      let high = words.length;
      let best = 0;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        el.textContent = words.slice(0, mid).join(' ') + '\u00A0…';
        if (el.scrollHeight <= maxAllowedHeight) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (best > 0 && best < words.length) {
        let candidateWords = words.slice(0, best);
        candidateWords[candidateWords.length - 1] = candidateWords[candidateWords.length - 1].replace(/[,.;:–—\s]+$/, '');
        let candidateText = candidateWords.join(' ') + '\u00A0…';
        el.textContent = candidateText;

        // Verify and pull back word if ellipsis causes it to spill onto line 7
        while (candidateWords.length > 1 && el.scrollHeight > maxAllowedHeight) {
          candidateWords.pop();
          candidateWords[candidateWords.length - 1] = candidateWords[candidateWords.length - 1].replace(/[,.;:–—\s]+$/, '');
          candidateText = candidateWords.join(' ') + '\u00A0…';
          el.textContent = candidateText;
        }

        setDisplayText(candidateText);
      } else {
        setDisplayText(text);
      }
    };

    compute();

    const ro = new ResizeObserver(() => {
      compute();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [text, maxLines]);

  return (
    <p
      ref={containerRef}
      className={`line-clamp-6 ${className || ''}`}
      style={{
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {displayText}
    </p>
  );
}

export const isProjectExpandable = (
  item: Pick<ProjectListItem, 'coverImage' | 'summary' | 'body'>
): boolean => {
  return Boolean(
    item.coverImage ||
    (typeof item.summary === 'string' && item.summary.trim().length > 0) ||
    item.body
  );
};

export default function ProjectList({
  items,
  totalCount,
  forceExpandAll,
  sortBy,
  sortDir,
  onSort,
  selectedTags = [],
  onToggleTag,
  onClearTags,
}: ProjectListProps) {
  const { locale, t, translateStatus, translateTag } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#project-')) {
        const targetId = hash.replace('#project-', '');
        const targetItem = items.find((it) => it._id === targetId);
        if (targetItem && isProjectExpandable(targetItem)) {
          setActiveId(targetId);
          setTimeout(() => {
            const el = document.getElementById(`project-${targetId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 150);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [items]);

  const toggleItem = (id: string) => {
    const targetItem = items.find((it) => it._id === id);
    if (!targetItem || !isProjectExpandable(targetItem)) return;
    setActiveId((prev) => (prev === id ? null : id));
  };

  const formatDateRange = (item: ProjectListItem) => {
    return formatYearRange(item.startYear, item.completionYear, item.buildYear);
  };

  const renderSortHeader = (label: string, sortKey: string, colSpan: string, mobileHidden: boolean = false) => {
    const isActive = sortBy === sortKey;
    
    return (
      <button 
        type="button"
        onClick={() => onSort && onSort(sortKey)}
        className={`${colSpan} ${mobileHidden ? 'hidden md:flex' : 'flex'} items-center justify-between hover:opacity-70 transition-opacity text-left cursor-pointer font-normal`}
      >
        <span>{label}</span>
        {isActive && (
          <span className="flex-shrink-0 opacity-50 relative top-[2px]">
            {sortDir === 'asc' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            )}
          </span>
        )}
      </button>
    );
  };

  const renderTagList = (tags: string[]) => {
    if (tags.length === 0) return null;
    return tags.map((tag, idx) => {
      const isTagActive = selectedTags.some((t) => t.toLowerCase() === tag.toLowerCase());
      const translated = translateTag(tag);
      return (
        <React.Fragment key={tag}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleTag?.(tag);
            }}
            title={isTagActive ? `${t('removeFilter')}: ${translated}` : `${t('filterOn')} ${translated}`}
            className={`inline text-left cursor-pointer hover:underline underline-offset-4 decoration-1 transition-opacity ${
              isTagActive ? 'underline' : ''
            }`}
          >
            {translated}
          </button>
          {idx < tags.length - 1 ? ', ' : ''}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full px-side-padding">
        
        {/* Header Wrapper: relative so the filter bar sits in the whitespace above without shifting the list */}
        <div className="relative">
          {/* Active Filter Bar (anchored above the Type column on desktop so the table never jumps) */}
          <div
            aria-hidden={selectedTags.length === 0}
            className={`
              absolute bottom-full left-0 right-0 pb-2
              grid grid-cols-2 md:grid-cols-12 gap-x-fm-1 text-[calc(1rem-3px)] text-black
              transition-opacity duration-150
              ${selectedTags.length > 0 ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}
          >
            <div className="col-span-2 md:col-start-5 md:col-span-6 flex flex-wrap items-center gap-x-3.5 gap-y-1">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  tabIndex={selectedTags.length > 0 ? 0 : -1}
                  onClick={() => onToggleTag?.(tag)}
                  className="inline-flex items-center gap-1 cursor-pointer hover:opacity-60 transition-opacity"
                >
                  <span className="underline underline-offset-4 decoration-1">{translateTag(tag)}</span>
                  <span aria-hidden="true" className="text-[0.9em] leading-none">×</span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Header Row */}
          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-fm-1 text-[1rem] text-black pb-1.5">
            {renderSortHeader(t('name'), 'name', 'col-span-1 md:col-start-3 md:col-span-2')}
            {renderSortHeader(t('type'), 'type', 'md:col-span-2', true)}
            {renderSortHeader(t('size'), 'size', 'md:col-span-1', true)}
            {renderSortHeader(t('year'), 'date', 'col-span-1 md:col-span-1 text-right md:text-left')}
            {renderSortHeader(t('status'), 'status', 'md:col-span-2', true)}
          </div>
        </div>

        {/* Project Rows */}
        {items.map((item) => {
          const dateStr = formatDateRange(item);
          const isExpandable = isProjectExpandable(item);
          const isExpanded = Boolean(isExpandable && (forceExpandAll || activeId === item._id));
          const canVisitProjectPage = Boolean(item.slug && (item.hasProjectPage ?? item.coverImage));
          const projectHref = item.slug ? `/work/${item.slug}` : undefined;
          const projectTags = getProjectTags(item);
          const displayTitle = (locale === 'en' && item.titleEn) ? item.titleEn : item.title;
          const displaySummary = (locale === 'en' && item.summaryEn) ? item.summaryEn : item.summary;
          const displayStatus = (locale === 'en' && item.statusEn) ? item.statusEn : translateStatus(item.status);

          return (
            <div
              key={item._id}
              id={`project-${item._id}`}
              className="w-full block text-[1rem] text-black scroll-mt-32"
            >
              <div className="grid grid-cols-2 md:grid-cols-12 gap-x-fm-1">
                {/* Continuous Line spanning col 3 to 10 */}
                <div className="col-span-2 md:col-start-3 md:col-span-8 border-t border-black" />

                {/* Row Container spanning col 3 to 10 */}
                {isExpandable ? (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onClick={() => toggleItem(item._id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleItem(item._id);
                      }
                    }}
                    className="col-span-2 md:col-start-3 md:col-span-8 grid grid-cols-2 md:grid-cols-8 gap-x-fm-1 pt-1.5 pb-[calc(0.5*var(--fm))] text-left cursor-pointer group focus:outline-none"
                  >
                    {/* Name */}
                    <div className="col-span-1 md:col-span-2 font-normal group-hover:opacity-70 transition-opacity">
                      {formatTypography(displayTitle)}
                    </div>

                    {/* Type (hidden on mobile; each tag is individually clickable) */}
                    <div className="hidden md:block md:col-span-2">
                      {renderTagList(projectTags)}
                    </div>

                    {/* Size (hidden on mobile) */}
                    <div className="hidden md:block md:col-span-1 tabular-nums whitespace-nowrap group-hover:opacity-70 transition-opacity">
                      {item.size?.value ? `${item.size.value}\u00A0${(item.size.unit || 'm²').trim()}` : ''}
                    </div>

                    {/* Year */}
                    <div className="col-span-1 md:col-span-1 tabular-nums whitespace-nowrap text-right md:text-left group-hover:opacity-70 transition-opacity">
                      {dateStr || ''}
                    </div>

                    {/* Status (hidden on mobile) */}
                    <div className="hidden md:block md:col-span-2 group-hover:opacity-70 transition-opacity">
                      {displayStatus}
                    </div>
                  </div>
                ) : (
                  <div
                    className="col-span-2 md:col-start-3 md:col-span-8 grid grid-cols-2 md:grid-cols-8 gap-x-fm-1 pt-1.5 pb-[calc(0.5*var(--fm))] text-left cursor-default"
                  >
                    {/* Name */}
                    <div className="col-span-1 md:col-span-2 font-normal">
                      {formatTypography(displayTitle)}
                    </div>

                    {/* Type (hidden on mobile; each tag is individually clickable) */}
                    <div className="hidden md:block md:col-span-2">
                      {renderTagList(projectTags)}
                    </div>

                    {/* Size (hidden on mobile) */}
                    <div className="hidden md:block md:col-span-1 tabular-nums whitespace-nowrap">
                      {item.size?.value ? `${item.size.value}\u00A0${(item.size.unit || 'm²').trim()}` : ''}
                    </div>

                    {/* Year */}
                    <div className="col-span-1 md:col-span-1 tabular-nums whitespace-nowrap text-right md:text-left">
                      {dateStr || ''}
                    </div>

                    {/* Status (hidden on mobile) */}
                    <div className="hidden md:block md:col-span-2">
                      {displayStatus}
                    </div>
                  </div>
                )}

                {/* Expanded Content (snappy & instantaneous) */}
                {isExpandable && isExpanded && (
                  <div className="col-span-2 md:col-start-3 md:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-8 gap-x-fm-1 pb-8 md:pb-10">
                      {/* Left Column (Col 3–4): Thumbnail Image if available */}
                      <div className="md:col-span-2 mb-6 md:mb-0 md:pr-4 md:pt-[0.28em]">
                        {item.coverImage ? (
                          <div
                            className="relative w-full overflow-hidden bg-gray-50"
                            style={{ aspectRatio: item.coverImageAspectRatio || 1.33 }}
                          >
                            <SanityImage
                              src={item.coverImage}
                              alt={item.coverImageAlt || displayTitle}
                              fill
                              lqip={item.coverImageLqip}
                              hotspot={item.coverImageHotspot}
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 25vw"
                            />
                          </div>
                        ) : null}
                      </div>

                      {/* Right Column (Col 5–10): Description & Link */}
                      <div
                        className="md:col-span-6 flex flex-col items-start"
                        style={{ gap: 'var(--fm-half)' }}
                      >
                        {(displaySummary || item.body) && (
                          displaySummary ? (
                            <ClampedText
                              text={formatTypography(displaySummary)}
                              maxLines={6}
                              className="text-measure-left"
                            />
                          ) : (
                            <div className="text-measure-left line-clamp-6">
                              {item.body}
                            </div>
                          )
                        )}

                        {canVisitProjectPage && projectHref && (
                          <div>
                            <Link
                              href={projectHref}
                              prefetch={true}
                              className="inline-block border-b border-black hover:opacity-60 transition-opacity"
                            >
                              {t('goToProject')}
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="grid grid-cols-2 md:grid-cols-12 gap-x-fm-1 pt-8 text-black/60">
            <div className="col-span-2 md:col-start-3 md:col-span-8">
              {t('noProjectsFound')}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
