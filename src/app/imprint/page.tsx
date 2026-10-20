import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import { client, getSiteSettingsQuery, getProjectCreditsQuery } from '@/sanity/client';
import ImprintContent from '@/components/ImprintContent';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Imprint and Privacy policy — Studio Tenev',
  alternates: {
    canonical: '/imprint-and-privacy-policy',
  },
};

export default async function ImprintPage() {
  const [siteSettings, credits] = await Promise.all([
    client.fetch(getSiteSettingsQuery).catch(() => null),
    client.fetch(getProjectCreditsQuery).catch(() => []),
  ]);

  return (
    <Layout noPadding>
      <ImprintContent
        studioName={siteSettings?.studioName}
        address={siteSettings?.address}
        contactEmail={siteSettings?.contactEmail}
        contactPhone={siteSettings?.contactPhone}
        credits={credits}
      />
    </Layout>
  );
}
