import type { MetadataRoute } from 'next';
import { client } from '@/sanity/client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://studiotenev.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects: Array<{ slug?: string; _updatedAt?: string }> = await client
    .fetch(
      `*[_type == "project" && hideFromOverview != true && defined(slug.current)]{
        "slug": slug.current,
        _updatedAt
      }`
    )
    .catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/studio`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/tjenester`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/kontakt`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/imprint-and-privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((p) => Boolean(p.slug))
    .map((p) => ({
      url: `${SITE_URL}/work/${p.slug}`,
      lastModified: p._updatedAt ? new Date(p._updatedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    }));

  return [...staticRoutes, ...projectRoutes];
}
