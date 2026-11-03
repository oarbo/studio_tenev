import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import TjenesterContent from '@/components/TjenesterContent';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Arkitekttjenester i Bergen — Fra Skisseprosjekt og Byggesøknad til Ferdigstillelse | Studio Tenev',
  description:
    'Studio Tenev tilbyr helhetlig arkitekturprosjektering i Bergen og omegn: befaring, 3D-visualisering, mulighetsstudier, skisseprosjekt, byggesøknad (ansvarlig søker), detaljprosjektering og oppfølging på byggeplass for enebolig, hytte, tilbygg og rehabilitering.',
  alternates: {
    canonical: '/tjenester',
  },
  openGraph: {
    title: 'Arkitekttjenester i Bergen — Tjenester | Studio Tenev',
    description:
      'Studio Tenev tilbyr helhetlig arkitekturprosjektering i Bergen og omegn: befaring, 3D-visualisering, mulighetsstudier, skisseprosjekt, byggesøknad, detaljprosjektering og oppfølging på byggeplass.',
    url: '/tjenester',
    siteName: 'Studio Tenev',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arkitekttjenester i Bergen — Tjenester | Studio Tenev',
    description:
      'Studio Tenev tilbyr helhetlig arkitekturprosjektering i Bergen og omegn: befaring, 3D-visualisering, mulighetsstudier, skisseprosjekt, byggesøknad, detaljprosjektering og oppfølging på byggeplass.',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hvilke arkitekttjenester tilbyr Studio Tenev i Bergen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Studio Tenev tilbyr alle faser av arkitekturprosjektering i Bergen og ellers i landet: befaring og 3D-oppmåling, 3D-visualisering, mulighetsstudier, skisseprosjekt, forprosjekt, byggesøknad som ansvarlig søker, anbudsgrunnlag, detaljprosjektering, arbeidstegninger og oppfølging på byggeplass.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hvilke typer byggeprosjekter arbeider Studio Tenev med?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vi arbeider med arkitekttegnede eneboliger, hytter og fritidsboliger, tilbygg, påbygg, ombygging, totalrenovering, rehabilitering, transformasjon og gjenbruk av eldre bygningsmasse, interiørarkitektur samt kontorbygg, næringsbygg og offentlige kulturbygg.',
      },
    },
    {
      '@type': 'Question',
      name: 'Bistår dere med byggesøknad og dialog med Bergen kommune?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja, som sivilarkitekt MNAL tar Studio Tenev rollen som ansvarlig søker og håndterer hele byggesøknadsprosessen, inkludert nabovarsling, dispensasjonssøknader og dialog med Plan- og bygningsetaten i Bergen kommune eller øvrige kommuner.',
      },
    },
  ],
};

export default function TjenesterPage() {
  return (
    <Layout noPadding>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <TjenesterContent />
    </Layout>
  );
}
