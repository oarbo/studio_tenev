import type { Metadata } from "next";
import "./globals.css";
import GridOverlay from "@/components/GridOverlay";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { WorkCategoryProvider } from "@/context/WorkCategoryContext";

import { client, getSiteSettingsQuery } from "@/sanity/client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://studiotenev.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Studio Tenev — Arkitekt Bergen",
    template: "%s",
  },
  description:
    "Studio Tenev er et arkitektkontor i Bergen sentrum etablert av sivilarkitekt MNAL Daniel Tenev. Vi arbeider med nybygg, eneboliger, fritidsboliger, transformasjon, rehabilitering, interiørarkitektur og kultur- og næringsbygg.",
  keywords: [
    "Studio Tenev",
    "Daniel Tenev",
    "Arkitekt Bergen",
    "Sivilarkitekt Bergen",
    "Arkitektkontor Bergen",
    "MNAL",
    "Enebolig arkitekt",
    "Hytte arkitekt",
    "Rehabilitering og transformasjon",
    "Interiørarkitektur",
    "Kulturbygg",
    "Norwegian Architecture",
  ],
  authors: [{ name: "Daniel Tenev", url: SITE_URL }],
  creator: "Studio Tenev",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  formatDetection: {
    telephone: false,
    email: false,
  },
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: SITE_URL,
    siteName: "Studio Tenev",
    title: "Studio Tenev — Arkitekt Bergen",
    description:
      "Arkitektkontor i Bergen etablert av Daniel Tenev. Nybygg, eneboliger, fritidsboliger, transformasjon, interiør og offentlige bygg.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio Tenev — Arkitekt Bergen",
    description:
      "Arkitektkontor i Bergen etablert av Daniel Tenev. Nybygg, eneboliger, fritidsboliger, transformasjon, interiør og offentlige bygg.",
  },
};

export const revalidate = 60;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";
  const settings = await client.fetch(getSiteSettingsQuery).catch(() => null);
  const showGridOverlay = isDev && settings?.showGridOverlay === true;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Architect", "LocalBusiness"],
    name: settings?.studioName || "Studio Tenev",
    url: SITE_URL,
    description:
      "Studio Tenev er et arkitektkontor med base i Bergen sentrum, etablert i 2024 av sivilarkitekt MNAL Daniel Tenev. Kontoret arbeider med nybygg, eneboliger, fritidsboliger, transformasjon, rehabilitering, interiørarkitektur samt nærings- og kulturbygg.",
    founder: {
      "@type": "Person",
      name: "Daniel Tenev",
      jobTitle: "Architect MNAL / Founder",
      alumniOf: [
        {
          "@type": "CollegeOrUniversity",
          name: "Arkitektur- og designhøgskolen i Oslo (AHO)",
        },
        {
          "@type": "CollegeOrUniversity",
          name: "Det Kongelige Akademi i København",
        },
      ],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Strandgaten 86",
      postalCode: "5004",
      addressLocality: "Bergen",
      addressCountry: "NO",
    },
    email: settings?.contactEmail || "hello@studiotenev.com",
    telephone: settings?.contactPhone || "+47 950 40 910",
    areaServed: ["Bergen", "Vestland", "Oslo", "Norway"],
    memberOf: {
      "@type": "Organization",
      name: "Norske arkitekters landsforbund",
      alternateName: "NAL",
    },
    sameAs: [
      settings?.instagram || "https://www.instagram.com/studiotenev",
      "https://no.linkedin.com/company/studio-tenev",
    ].filter(Boolean),
  };

  return (
    <html lang="nb" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/qvj5iro.css" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans text-base antialiased bg-white text-black min-h-full flex flex-col">
        <LanguageProvider customTagTranslations={settings?.tagTranslations}>
          <WorkCategoryProvider>
            {children}
            {showGridOverlay && <GridOverlay />}
          </WorkCategoryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
