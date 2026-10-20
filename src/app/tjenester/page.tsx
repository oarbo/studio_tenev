import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import TjenesterContent from '@/components/TjenesterContent';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Tjenester — Studio Tenev',
  description:
    'Studio Tenev tilbyr helhetlig arkitekturprosjektering i Bergen og omegn: befaring, 3D-visualisering, mulighetsstudier, skisseprosjekt, byggesøknad, detaljprosjektering og oppfølging på byggeplass.',
  alternates: {
    canonical: '/tjenester',
  },
};

export default function TjenesterPage() {
  return (
    <Layout noPadding>
      <TjenesterContent />
    </Layout>
  );
}
