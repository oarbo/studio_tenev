'use client';

import React, { useState, useCallback } from 'react';
import ProjectList, { ProjectListItem, getProjectTags } from './ProjectList';
import { useLanguage } from '@/i18n/LanguageContext';
import { useWorkCategory, WorkCategory } from '@/context/WorkCategoryContext';

export type SortOption = 'date' | 'name' | 'use' | 'type' | 'size' | 'status';
export type SortDirection = 'asc' | 'desc';

interface WorkFilterProps {
  items: ProjectListItem[];
  initialTag?: string;
}

export default function WorkFilter({ items, initialTag }: WorkFilterProps) {
  const { locale, t } = useLanguage();
  const { activeCategory, setCategory } = useWorkCategory();
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc'); // 'desc' default for date (nyeste øverst)
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    initialTag ? [initialTag] : []
  );

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tag = params.get('tag');
      if (tag && tag !== 'All') {
        setSelectedTags([tag]);
      }
    }
  }, []);

  const handleSortClick = (option: string) => {
    const validOption = option as SortOption;
    if (sortBy === validOption) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(validOption);
      setSortDir(validOption === 'date' || validOption === 'size' ? 'desc' : 'asc');
    }
  };

  const scrollToHeaderIfNeeded = useCallback(() => {
    if (typeof window === 'undefined') return;
    const listEl = document.getElementById('project-list');
    if (listEl) {
      const rect = listEl.getBoundingClientRect();
      // Hvis listen er scrollet ovenfor toppen av viewporten, gli mykt opp til start
      if (rect.top < 0) {
        listEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const handleToggleTag = useCallback((tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (!normalized) return;

    setSelectedTags((prev) => {
      const exists = prev.some((t) => t.toLowerCase() === normalized);
      if (exists) {
        return prev.filter((t) => t.toLowerCase() !== normalized);
      }
      return [...prev, tag.trim()];
    });

    scrollToHeaderIfNeeded();
  }, [scrollToHeaderIfNeeded]);

  const handleClearTags = useCallback(() => {
    setSelectedTags([]);
    scrollToHeaderIfNeeded();
  }, [scrollToHeaderIfNeeded]);

  // Filter by category first
  const categoryFilteredItems =
    activeCategory === 'all'
      ? items
      : items.filter((item) => item.category?.toLowerCase() === activeCategory.toLowerCase());

  // Multi-tag AND filtering: every selected tag must be present on the project
  const filteredItems =
    selectedTags.length === 0
      ? categoryFilteredItems
      : categoryFilteredItems.filter((item) => {
          const itemTagsLower = getProjectTags(item).map((t) => t.toLowerCase());
          return selectedTags.every((selected) =>
            itemTagsLower.includes(selected.toLowerCase())
          );
        });

  // Sorting logic with natural alphanumeric comparison (0-9, A-Å) and numeric size sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    let result = 0;

    if (sortBy === 'date') {
      const yearA = a.completionYear || a.startYear || (typeof a.buildYear === 'number' ? a.buildYear : 0);
      const yearB = b.completionYear || b.startYear || (typeof b.buildYear === 'number' ? b.buildYear : 0);
      result = yearA - yearB;
    } else if (sortBy === 'size') {
      const sizeA = a.size?.value ?? -1;
      const sizeB = b.size?.value ?? -1;
      result = sizeA - sizeB;
    } else {
      let strA = '';
      let strB = '';

      if (sortBy === 'name') {
        strA = (locale === 'en' && a.titleEn) ? a.titleEn : (a.title || '');
        strB = (locale === 'en' && b.titleEn) ? b.titleEn : (b.title || '');
      } else if (sortBy === 'type' || sortBy === 'use') {
        strA = getProjectTags(a).join(', ');
        strB = getProjectTags(b).join(', ');
      } else if (sortBy === 'status') {
        strA = a.status || '';
        strB = b.status || '';
      }

      result = strA.localeCompare(strB, 'no', { numeric: true, sensitivity: 'base' });
    }

    return sortDir === 'asc' ? result : -result;
  });

  const categories: { key: WorkCategory; label: string }[] = [
    { key: 'all', label: t('viewAll') },
    { key: 'bolig', label: t('categoryResidential') },
    { key: 'naering', label: t('categoryCommercial') },
    { key: 'destinasjonsutvikling', label: t('categoryDestination') },
  ];

  return (
    <div className="w-full flex flex-col pt-0">
      {/* Category filter menu (centered, can wrap over multiple lines) */}
      <nav
        aria-label="Kategorier"
        className="w-full flex flex-wrap items-center justify-center gap-x-[1.25em] gap-y-2 pt-content-top pb-8 md:pb-12 text-[1rem] leading-tight text-center px-side-padding"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategory(cat.key)}
              className={`cursor-pointer whitespace-nowrap hover:underline hover:underline-offset-4 hover:decoration-1 ${
                isActive ? 'underline underline-offset-4 decoration-1 font-normal text-black' : 'text-black/60 font-normal'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </nav>

      <div className="w-full min-h-[calc(100vh-10rem)] min-h-[calc(100dvh-10rem)]">
        <ProjectList
          items={sortedItems}
          totalCount={categoryFilteredItems.length}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSortClick}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          onClearTags={handleClearTags}
        />
      </div>
    </div>
  );
}
