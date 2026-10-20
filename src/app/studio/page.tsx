import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import { client, getStudioQuery, getSiteSettingsQuery } from '@/sanity/client';
import StudioContent from '@/components/StudioContent';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Studio — Studio Tenev',
  description:
    'Studio Tenev er et arkitektkontor etablert av sivilarkitekt MNAL Daniel Tenev i Bergen sentrum. Les om kontoret, bakgrunn, ansatte og kontaktinformasjon.',
  alternates: {
    canonical: '/studio',
  },
};

export default async function StudioPage() {
  const [studioData, siteSettings] = await Promise.all([
    client.fetch(getStudioQuery).catch(() => null),
    client.fetch(getSiteSettingsQuery).catch(() => null),
  ]);

  return (
    <Layout noPadding stickyHeader={false}>
      <StudioContent studioData={studioData} siteSettings={siteSettings} />
    </Layout>
  );
}
