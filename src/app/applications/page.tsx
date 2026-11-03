import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import ApplicationsContent from '@/components/ApplicationsContent';
import { client, getApplicationsQuery } from '@/sanity/client';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Applications — Studio Tenev',
  description:
    'Søknader og ledige stillinger hos Studio Tenev Arkitekter i Bergen. Send gjerne portefølje og CV.',
  alternates: {
    canonical: '/applications',
  },
  openGraph: {
    title: 'Applications — Studio Tenev',
    description:
      'Søknader og ledige stillinger hos Studio Tenev Arkitekter i Bergen. Send gjerne portefølje og CV.',
    url: '/applications',
    siteName: 'Studio Tenev',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Applications — Studio Tenev',
    description:
      'Søknader og ledige stillinger hos Studio Tenev Arkitekter i Bergen. Send gjerne portefølje og CV.',
  },
};

export default async function ApplicationsPage() {
  const applications = await client.fetch(getApplicationsQuery).catch(() => null);

  return (
    <Layout noPadding>
      <ApplicationsContent text={applications?.text} textEn={applications?.textEn} />
    </Layout>
  );
}
