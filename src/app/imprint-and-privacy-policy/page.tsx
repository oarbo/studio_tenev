import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import { client, getSiteSettingsQuery, getProjectCreditsQuery } from '@/sanity/client';
import ImprintContent from '@/components/ImprintContent';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Imprint and Privacy policy — Studio Tenev',
  description:
    'Kolofon, opphavsrett, fotografkrediteringer og personvernerklæring for Studio Tenev AS i Bergen.',
  alternates: {
    canonical: '/imprint-and-privacy-policy',
  },
  openGraph: {
    title: 'Imprint and Privacy policy — Studio Tenev',
    description:
      'Kolofon, opphavsrett, fotografkrediteringer og personvernernerklæring for Studio Tenev AS i Bergen.',
    url: '/imprint-and-privacy-policy',
    siteName: 'Studio Tenev',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Imprint and Privacy policy — Studio Tenev',
    description:
      'Kolofon, opphavsrett, fotografkrediteringer og personvernerklæring for Studio Tenev AS i Bergen.',
  },
};

export default async function ImprintAndPrivacyPolicyPage() {
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
