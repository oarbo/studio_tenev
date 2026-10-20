'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export type WorkCategory = 'all' | 'bolig' | 'naering' | 'destinasjonsutvikling';

interface WorkCategoryContextType {
  activeCategory: WorkCategory;
  setCategory: (category: WorkCategory) => void;
}

const WorkCategoryContext = createContext<WorkCategoryContextType>({
  activeCategory: 'all',
  setCategory: () => {},
});

function WorkCategorySync({
  activeCategory,
  setActiveCategory,
}: {
  activeCategory: WorkCategory;
  setActiveCategory: (cat: WorkCategory) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const cat = searchParams.get('category') || searchParams.get('cat');
    if (cat === 'bolig' || cat === 'naering' || cat === 'destinasjonsutvikling') {
      if (activeCategory !== cat) {
        setActiveCategory(cat);
      }
    } else if (cat === null || cat === 'all' || cat === 'vis-alle') {
      if (activeCategory !== 'all') {
        setActiveCategory('all');
      }
    }
  }, [searchParams, activeCategory, setActiveCategory]);

  return null;
}

export function WorkCategoryProvider({ children }: { children: ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>('all');
  const pathname = usePathname();

  const setCategory = useCallback((cat: WorkCategory) => {
    setActiveCategory(cat);
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (cat === 'all') {
      url.searchParams.delete('category');
      url.searchParams.delete('cat');
    } else {
      url.searchParams.set('category', cat);
      url.searchParams.delete('cat');
    }
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, []);

  return (
    <WorkCategoryContext.Provider value={{ activeCategory, setCategory }}>
      <Suspense fallback={null}>
        <WorkCategorySync activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      </Suspense>
      {children}
    </WorkCategoryContext.Provider>
  );
}

export function useWorkCategory() {
  return useContext(WorkCategoryContext);
}
