import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import { client, getNewsQuery } from '@/sanity/client';
import NewsList, { ExpandingListItem } from '@/components/NewsList';
import { SanityHotspot } from '@/components/SanityImage';
import { formatTypography } from '@/utils/typography';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'News — Studio Tenev',
  description:
    'Nyheter, publikasjoner, pågående prosjekter og oppdateringer fra Studio Tenev Arkitekter i Bergen.',
  alternates: {
    canonical: '/news',
  },
};

interface NewsData {
  _id: string;
  title: string;
  titleEn?: string;
  image?: string;
  imageLqip?: string;
  imageAspectRatio?: number;
  imageHotspot?: SanityHotspot;
  link?: string;
  date: string;
  tag?: string;
  summary?: string;
  summaryEn?: string;
}

export default async function NewsPage() {
  const news = await client.fetch(getNewsQuery).catch(() => []);

  const expandingItems: ExpandingListItem[] = news.map((n: NewsData) => {
    const dateObj = new Date(n.date);
    const formattedDate = !isNaN(dateObj.getTime()) 
      ? dateObj.toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
      : n.date;

    return {
      _id: n._id,
      tag: n.tag,
      date: formattedDate,
      title: formatTypography(n.title),
      titleEn: n.titleEn ? formatTypography(n.titleEn) : undefined,
      image: n.image,
      imageLqip: n.imageLqip,
      imageAspectRatio: n.imageAspectRatio,
      imageHotspot: n.imageHotspot,
      content: n.summary ? (
        <div>
          <p>{formatTypography(n.summary)}</p>
        </div>
      ) : null,
      contentEn: n.summaryEn ? (
        <div>
          <p>{formatTypography(n.summaryEn)}</p>
        </div>
      ) : undefined,
      link: n.link,
    };
  });

  return (
    <Layout noPadding stickyHeader={false}>
      <div className="w-full flex flex-col mb-42 pt-content-top">
        <h1 className="sr-only">News — Studio Tenev</h1>
        {expandingItems.length > 0 && (
          <div className="w-full px-side-padding">
            <NewsList items={expandingItems} />
          </div>
        )}
      </div>
    </Layout>
  );
}
