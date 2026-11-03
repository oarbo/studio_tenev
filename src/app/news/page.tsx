import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import { client, getNewsQuery } from '@/sanity/client';
import NewsList, { ExpandingListItem } from '@/components/NewsList';
import { SanityHotspot } from '@/components/SanityImage';
import { formatTypography, renderTypography } from '@/utils/typography';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'News — Studio Tenev',
  description:
    'Nyheter, publikasjoner, pågående prosjekter og oppdateringer fra Studio Tenev Arkitekter i Bergen.',
  alternates: {
    canonical: '/news',
  },
  openGraph: {
    title: 'News — Studio Tenev',
    description:
      'Nyheter, publikasjoner, pågående prosjekter og oppdateringer fra Studio Tenev Arkitekter i Bergen.',
    url: '/news',
    siteName: 'Studio Tenev',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'News — Studio Tenev',
    description:
      'Nyheter, publikasjoner, pågående prosjekter og oppdateringer fra Studio Tenev Arkitekter i Bergen.',
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
        <div className="flex flex-col">
          {n.summary.split(/\n\s*\n/).map((para, i) => (
            <p key={i}>{renderTypography(para.trim(), 'nb')}</p>
          ))}
        </div>
      ) : null,
      contentEn: n.summaryEn ? (
        <div className="flex flex-col">
          {n.summaryEn.split(/\n\s*\n/).map((para, i) => (
            <p key={i}>{renderTypography(para.trim(), 'en')}</p>
          ))}
        </div>
      ) : undefined,
      link: n.link,
    };
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studiotenev.com';
  const newsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Nyheter, priser og publikasjoner — Studio Tenev',
    itemListElement: news.map((n: NewsData, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'NewsArticle',
        headline: n.title,
        alternativeHeadline: n.titleEn && n.titleEn !== n.title ? n.titleEn : undefined,
        datePublished: n.date,
        description: [n.summary, n.summaryEn].filter(Boolean).join(' — ') || undefined,
        image: n.image ? `${n.image}?w=1200&auto=format` : undefined,
        url: n.link || `${siteUrl}/news#news-${n._id}`,
        author: {
          '@type': 'Organization',
          '@id': `${siteUrl}/#organization`,
          name: 'Studio Tenev',
        },
      },
    })),
  };

  return (
    <Layout noPadding>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsJsonLd) }}
      />
      <div className="w-full flex flex-col mb-[calc(7*var(--fm))] md:mb-42 pt-content-top">
        <h1 className="sr-only">News — Nyheter, priser og publikasjoner fra Studio Tenev</h1>
        {expandingItems.length > 0 && (
          <div className="w-full px-side-padding">
            <NewsList items={expandingItems} />
          </div>
        )}
      </div>
    </Layout>
  );
}
