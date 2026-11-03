import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import KontaktContent from '@/components/KontaktContent';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Kontakt Arkitekt i Bergen — Befaring & Uforpliktende Prat | Studio Tenev',
  description:
    'Ta kontakt med Studio Tenev i Bergen sentrum (Strandgaten 86) for en uforpliktende prat eller befaring. Vi bistår med nybygg, enebolig, hytte, tilbygg, rehabilitering og byggesøknad.',
  alternates: {
    canonical: '/kontakt',
  },
  openGraph: {
    title: 'Kontakt Arkitekt i Bergen — Befaring & Uforpliktende Prat | Studio Tenev',
    description:
      'Ta kontakt med Studio Tenev i Bergen sentrum (Strandgaten 86) for en uforpliktende prat eller befaring. Vi bistår med nybygg, enebolig, hytte, tilbygg, rehabilitering og byggesøknad.',
    url: '/kontakt',
    siteName: 'Studio Tenev',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kontakt Arkitekt i Bergen — Befaring & Uforpliktende Prat | Studio Tenev',
    description:
      'Ta kontakt med Studio Tenev i Bergen sentrum (Strandgaten 86) for en uforpliktende prat eller befaring. Vi bistår med nybygg, enebolig, hytte, tilbygg, rehabilitering og byggesøknad.',
  },
};

export default function KontaktPage() {
  return (
    <Layout noPadding>
      <KontaktContent />
    </Layout>
  );
}
