import React from 'react';
import type { Metadata } from 'next';
import Layout from '@/components/Layout';
import KontaktContent from '@/components/KontaktContent';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Kontakt — Studio Tenev',
  description:
    'Ta kontakt med Studio Tenev i Bergen for en uforpliktende prat eller befaring. Fortell oss om dine planer og prosjekt.',
  alternates: {
    canonical: '/kontakt',
  },
};

export default function KontaktPage() {
  return (
    <Layout noPadding>
      <KontaktContent />
    </Layout>
  );
}
