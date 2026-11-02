'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useWorkCategory, WorkCategory } from '@/context/WorkCategoryContext';

interface WorkCategoryNavProps {
  className?: string;
}

export default function WorkCategoryNav({ className = '' }: WorkCategoryNavProps) {
  const { t } = useLanguage();
  const { activeCategory, setCategory } = useWorkCategory();

  const categories: { key: WorkCategory; label: string }[] = [
    { key: 'all', label: t('viewAll') },
    { key: 'bolig', label: t('categoryResidential') },
    { key: 'naering', label: t('categoryCommercial') },
    { key: 'destinasjonsutvikling', label: t('categoryDestination') },
  ];

  return (
    <nav aria-label="Kategorier" className={`w-full text-[1.125rem] md:text-[1rem] font-normal ${className}`}>
      <ul className="flex flex-wrap justify-center items-center gap-x-[1.25em] gap-y-2 leading-tight whitespace-nowrap">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <li key={cat.key}>
              <button
                type="button"
                onClick={() => setCategory(cat.key)}
                className={`cursor-pointer p-0 m-0 leading-tight bg-transparent border-0 font-normal hover:underline hover:underline-offset-4 hover:decoration-1 ${
                  isActive ? 'underline underline-offset-4 decoration-1 font-normal text-black' : 'text-black/60'
                }`}
              >
                {cat.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
