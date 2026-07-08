import React from 'react';
import { GridSection } from './Layout';

interface NewsItem {
  _id: string;
  title: string;
  date: string;
  link?: string;
}

export default function NewsSection({ news }: { news: NewsItem[] }) {
  return (
    <GridSection id="news">
      <h2 className="text-sm font-semibold uppercase tracking-widest mb-fm-1 text-gray-500">News</h2>
      {/* Horisontal listestruktur med dato til venstre */}
      <ul className="flex flex-col border-t border-black">
        {news.map((item) => (
          <li key={item._id} className="py-fm-1 border-b border-gray-300 flex flex-col md:flex-row md:items-baseline gap-fm-1 md:gap-fm-2">
            <span className="text-gray-500 tabular-nums min-w-[120px] text-sm">
              {new Date(item.date).toLocaleDateString('no-NO')}
            </span>
            {item.link ? (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {item.title}
              </a>
            ) : (
              <span>{item.title}</span>
            )}
          </li>
        ))}
        {news.length === 0 && <li className="py-fm-1 text-gray-500">Ingen nyheter tilgjengelig.</li>}
      </ul>
    </GridSection>
  );
}
