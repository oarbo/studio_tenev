'use client';

import React from 'react';
import Link from 'next/link';

export interface ProjectListItem {
  _id: string;
  title: string;
  slug?: string;
  startYear?: number;
  completionYear?: number;
  buildYear?: number | string;
  location?: string;
  type?: string | string[];
  use?: string | string[];
  status?: string;
  tags?: string[];
  coverImage?: string;
  coverImageAspectRatio?: number;
  coverImageAlt?: string;
  body?: React.ReactNode;
  client?: string;
  contractor?: string;
  photographer?: string;
  size?: { value: number; unit: string };
}

interface ProjectListProps {
  items: ProjectListItem[];
  forceExpandAll?: boolean;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (option: string) => void;
}

const formatTagList = (val?: string | string[]) => {
  if (!val) return '';
  if (Array.isArray(val)) return val.join(', ');
  return val;
};

export default function ProjectList({ items, forceExpandAll, sortBy, sortDir, onSort }: ProjectListProps) {
  const formatDateRange = (item: ProjectListItem) => {
    if (item.startYear) {
      if (item.completionYear) {
        if (item.startYear === item.completionYear) {
          return `${item.startYear}`;
        }
        return `${item.startYear}–${item.completionYear}`;
      }
      return `${item.startYear}–`;
    }
    return item.buildYear ? item.buildYear.toString() : '';
  };

  const renderSortHeader = (label: string, sortKey: string, colSpan: string, mobileHidden: boolean = false) => {
    const isActive = sortBy === sortKey;
    
    return (
      <button 
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

  return (
    <div className="w-full flex flex-col">
      <div className="w-full px-side-padding">
        
        {/* Table Header Row */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-fm-1 text-[1rem] text-black pb-1.5">
          {renderSortHeader('Name', 'name', 'col-span-1 md:col-start-3 md:col-span-2')}
          {renderSortHeader('Type', 'type', 'md:col-span-2', true)}
          {renderSortHeader('Size', 'size', 'md:col-span-1', true)}
          {renderSortHeader('Year', 'date', 'col-span-1 md:col-span-1 text-right md:text-left')}
          {renderSortHeader('Status', 'status', 'md:col-span-2', true)}
        </div>

        {/* Project Rows */}
        {items.map((item, index) => {
          const dateStr = formatDateRange(item);
          const projectHref = `/work/${item.slug || item._id}`;

          return (
            <div
              key={item._id}
              id={`project-${item._id}`}
              className="w-full block text-[1rem] text-black"
            >
              <div className="grid grid-cols-2 md:grid-cols-12 gap-x-fm-1">
                {/* Continuous Line spanning col 3 to 10 */}
                <div className="col-span-2 md:col-start-3 md:col-span-8 border-t border-black mb-1.5 h-0" />

                {/* Name */}
                <div className="col-span-1 md:col-start-3 md:col-span-2 font-normal pb-8">
                  <Link href={projectHref} className="hover:opacity-70 transition-opacity">
                    {item.title}
                  </Link>
                </div>

                {/* Type (hidden on mobile) */}
                <div className="hidden md:block md:col-span-2 pb-8">
                  {formatTagList(item.type)}
                </div>

                {/* Size (hidden on mobile) */}
                <div className="hidden md:block md:col-span-1 pb-8">
                  {item.size?.value ? `${item.size.value} ${item.size.unit || ''}` : ''}
                </div>

                {/* Year */}
                <div className="col-span-1 md:col-span-1 tabular-nums text-right md:text-left pb-8">
                  {dateStr || '—'}
                </div>

                {/* Status (hidden on mobile) */}
                <div className="hidden md:block md:col-span-2 pb-8">
                  {item.status}
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
