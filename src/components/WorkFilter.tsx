'use client';

import React, { useState } from 'react';
import ProjectList, { ProjectListItem } from './ProjectList';

export type SortOption = 'date' | 'name' | 'use' | 'type' | 'status';
export type SortDirection = 'asc' | 'desc';

interface WorkFilterProps {
  items: ProjectListItem[];
  tags?: string[];
}

export default function WorkFilter({ items }: WorkFilterProps) {
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc'); // 'desc' default for date (nyeste øverst)

  const handleSortClick = (option: string) => {
    const validOption = option as SortOption;
    if (sortBy === validOption) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(validOption);
      setSortDir(validOption === 'date' ? 'desc' : 'asc');
    }
  };

  // Sorting logic with natural alphanumeric comparison (0-9, A-Å)
  const sortedItems = [...items].sort((a, b) => {
    let result = 0;

    if (sortBy === 'date') {
      const yearA = a.completionYear || a.startYear || (typeof a.buildYear === 'number' ? a.buildYear : 0);
      const yearB = b.completionYear || b.startYear || (typeof b.buildYear === 'number' ? b.buildYear : 0);
      result = yearA - yearB;
    } else {
      let strA = '';
      let strB = '';

      if (sortBy === 'name') {
        strA = a.title || '';
        strB = b.title || '';
      } else if (sortBy === 'use') {
        strA = Array.isArray(a.use) ? a.use.join(', ') : (a.use || '');
        strB = Array.isArray(b.use) ? b.use.join(', ') : (b.use || '');
      } else if (sortBy === 'type') {
        strA = Array.isArray(a.type) ? a.type.join(', ') : (a.type || '');
        strB = Array.isArray(b.type) ? b.type.join(', ') : (b.type || '');
      } else if (sortBy === 'status') {
        strA = a.status || '';
        strB = b.status || '';
      }

      result = strA.localeCompare(strB, 'no', { numeric: true, sensitivity: 'base' });
    }

    return sortDir === 'asc' ? result : -result;
  });

  return (
    <div className="w-full flex flex-col pt-8">
      {/* Project list in text view */}
      <div className="w-full">
        <ProjectList 
          items={sortedItems} 
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSortClick}
        />
      </div>
    </div>
  );
}
