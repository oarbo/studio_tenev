import React from 'react';
import Layout from '@/components/Layout';
import { client, getNewsQuery } from '@/sanity/client';
import HorizontalSlider, { SliderItem } from '@/components/HorizontalSlider';
import NewsList from '@/components/NewsList';
import { ExpandingListItem } from '@/components/ExpandingList';

export const revalidate = 60;

interface NewsData {
  _id: string;
  title: string;
  image: string;
  link?: string;
  date: string;
  summary?: string;
  imageAspectRatio?: number;
}

export default async function NewsPage() {
  const news = await client.fetch(getNewsQuery).catch(() => []);

  // Map to slider items (take first 5)
  const sliderItems: SliderItem[] = news.slice(0, 5).map((n: NewsData) => ({
    _id: n._id,
    title: n.title,
    image: n.image,
    link: n.link,
  }));

  // Map to expanding list items
  const expandingItems: ExpandingListItem[] = news.map((n: NewsData) => {
    const dateObj = new Date(n.date);
    const formattedDate = !isNaN(dateObj.getTime()) 
      ? dateObj.toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
      : n.date;

    return {
      _id: n._id,
      tag: 'Nyhet',
      date: formattedDate,
      title: n.title,
      image: n.image,
      imageAspectRatio: n.imageAspectRatio,
      content: (
        <div>
          {n.summary && <p>{n.summary}</p>}
        </div>
      ),
      link: n.link,
    };
  });

  // De tre nyeste sakene til kortene på toppen
  const topCards = expandingItems.slice(0, 3);

  return (
    <Layout noPadding stickyHeader={false} projectTitle="News">
      <div className="w-full flex flex-col mb-42 pt-content-top">
        
        {/* Topp-kort (Recent News) */}
        {topCards.length > 0 && (
          <div className="w-full mb-42">
            {/* Tittel for Topp-kort */}
            <div className="w-full px-side-padding mb-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 items-baseline">
                <div className="md:col-start-3 md:col-span-8 text-[1rem] font-normal text-black">
                  Recent news
                </div>
              </div>
            </div>

            {/* Kort-grid */}
            <div className="w-full px-side-padding">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
                <div className="md:col-start-3 md:col-span-8">
                  <div className="flex flex-col md:flex-row gap-x-fm-1 gap-y-4 w-full">
                    {topCards.map((card) => {
                      return (
                        <div 
                          key={card._id}
                          className="flex-1 border border-black bg-white hover:bg-gray-50 transition-colors"
                        >
                          <a href={`#news-${card._id}`} className="block w-full h-full px-4 lg:px-6 pt-2 pb-5 lg:pt-3 lg:pb-6 group">
                            <div className="font-medium text-[20px] tabular-nums mb-2">{card.date}</div>
                            <div className="text-[1rem] font-medium group-hover:opacity-70 transition-opacity">
                              {card.title}
                            </div>
                            <div className="mt-4 text-[17px] underline hover:opacity-60 transition-opacity">
                              Read more
                            </div>
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nyhetsliste (News) */}
        {expandingItems.length > 0 && (
          <div className="w-full flex flex-col">
            {/* Tittel for Nyhetsliste */}
            <div className="w-full px-side-padding mb-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 items-baseline">
                <div className="md:col-start-3 md:col-span-8 text-[1rem] font-normal text-black">
                  News
                </div>
              </div>
            </div>

            {/* Nyhetsliste-elementer */}
            <div className="w-full px-side-padding">
              <NewsList items={expandingItems} />
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
