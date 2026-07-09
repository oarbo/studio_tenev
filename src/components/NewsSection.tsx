'use client';
import React, { useState } from 'react';

interface NewsItemData {
  _id: string;
  title: string;
  date: string;
  link?: string;
}

import NewsItem from './NewsItem';

export default function NewsSection({ news }: { news: NewsItemData[] }) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItemId(openItemId === id ? null : id);
  };

  return (
    <div className="col-span-4 md:col-span-8 grid grid-cols-1 w-full min-w-0">
      {news.map((item) => (
        <NewsItem 
          key={item._id} 
          news={item} 
          isOpen={openItemId === item._id} 
          onToggle={() => toggleItem(item._id)} 
        />
      ))}
      {news.length === 0 && <div className="py-fm-1 text-gray-500">Ingen nyheter tilgjengelig.</div>}
    </div>
  );
}
