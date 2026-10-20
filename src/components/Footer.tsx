import React from 'react';
import { client, getSiteSettingsQuery } from '@/sanity/client';
import FooterClient from './FooterClient';

export default async function Footer() {
  const siteSettings = await client.fetch(getSiteSettingsQuery).catch(() => null);
  const currentYear = new Date().getFullYear();
  const phone = siteSettings?.contactPhone || '+47 950 40 910';
  const phoneHref = `tel:${phone.replace(/\s+/g, '')}`;

  return (
    <FooterClient
      instagram={siteSettings?.instagram}
      studioName={siteSettings?.studioName}
      address={siteSettings?.address}
      contactEmail={siteSettings?.contactEmail || 'hello@studiotenev.com'}
      phone={phone}
      phoneHref={phoneHref}
      currentYear={currentYear}
    />
  );
}
