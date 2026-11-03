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
    default: "Studio Tenev — Arkitekt i Bergen | Sivilarkitekt MNAL",
    template: "%s",
  },
  description:
    "Studio Tenev er et arkitektkontor i Bergen sentrum ledet av sivilarkitekt MNAL Daniel Tenev. Vi utfører nybygg, enebolig, hytte, tilbygg, rehabilitering, transformasjon, byggesøknad, interiørarkitektur og nærings- og kulturbygg.",
  keywords: [
    "Arkitekt Bergen",
    "Arkitekt i Bergen",
    "Arkitektkontor Bergen",
    "Sivilarkitekt Bergen",
    "Sivilarkitekt MNAL",
    "Studio Tenev",
    "Daniel Tenev",
    "Enebolig arkitekt Bergen",
    "Tilbygg arkitekt Bergen",
    "Hytte arkitekt",
    "Hyttearkitekt Geilo",
    "Fritidsbolig arkitekt Tjøme",
    "Arkitekt Oslo",
    "Totalrenovering og rehabilitering Bergen",
    "Transformasjon og gjenbruk arkitektur",
    "Byggesøknad arkitekt Bergen",
    "Interiørarkitekt Bergen",
    "Kulturbygg og næringsbygg",
    "Norwegian Architecture",
    "Norwegian Architecture Studio",
    "Contemporary Nordic Architecture",
    "Timber Cabin Architect Norway",
    "Architects Bergen Norway",
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
    alternateLocale: ["en_GB", "en_US"],
    url: SITE_URL,
    siteName: "Studio Tenev",
    title: "Studio Tenev — Arkitekt i Bergen | Sivilarkitekt MNAL",
    description:
      "Arkitektkontor i Bergen sentrum etablert av sivilarkitekt MNAL Daniel Tenev. Enebolig, fritidsbolig, tilbygg, rehabilitering, transformasjon, byggesøknad, interiør og offentlige bygg i hele Norge.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Studio Tenev — Arkitekt i Bergen | Sivilarkitekt MNAL",
    description:
      "Arkitektkontor i Bergen sentrum etablert av sivilarkitekt MNAL Daniel Tenev. Enebolig, fritidsbolig, tilbygg, rehabilitering, transformasjon, byggesøknad, interiør og offentlige bygg.",
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

  const basePlaces = ["Bergen", "Vestland", "Oslo", "Geilo", "Tjøme", "Stavanger", "Norge", "Scandinavia & Europe"];
  const dynamicLocations: string[] = Array.isArray(settings?.projectLocations) ? settings.projectLocations : [];
  const dynamicCountries: string[] = Array.isArray(settings?.projectCountries) ? settings.projectCountries : [];
  const allAreaNames = Array.from(
    new Set(
      [...basePlaces, ...dynamicLocations, ...dynamicCountries]
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean)
    )
  );

  const baseKnowsAbout = [
    "Arkitektur",
    "Boligarkitektur og enebolig",
    "Hytte og fritidsbolig",
    "Tilbygg, påbygg og ombygging",
    "Rehabilitering, transformasjon og gjenbruk",
    "Interiørarkitektur",
    "Byggesøknad og ansvarlig søker",
    "Mulighetsstudier og regulering",
    "3D-visualisering og romlig simulering",
    "Næringsbygg, kontorbygg og offentlige kulturbygg",
    "Contemporary Norwegian Architecture",
    "Nordic Timber Architecture & Cabin Design",
    "Adaptive Reuse & Architectural Transformation",
    "Cultural & Public Architecture",
  ];
  const dynamicTypes: string[] = Array.isArray(settings?.projectTypes) ? settings.projectTypes : [];
  const dynamicUses: string[] = Array.isArray(settings?.projectUses) ? settings.projectUses : [];
  const allKnowsAbout = Array.from(
    new Set(
      [...baseKnowsAbout, ...dynamicTypes, ...dynamicUses]
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean)
    )
  );

  const rawTeamNames: string[] = [
    ...(Array.isArray(settings?.teamItems) ? settings.teamItems : []),
    ...(Array.isArray(settings?.teamMembers) ? settings.teamMembers : []),
  ];
  const uniqueEmployees = Array.from(
    new Set(
      rawTeamNames
        .map((n) => (typeof n === "string" ? n.split(",")[0].split("—")[0].split("–")[0].trim() : ""))
        .filter(Boolean)
    )
  );

  const addrLines = typeof settings?.address === "string"
    ? settings.address.split("\n").map((l: string) => l.trim()).filter(Boolean)
    : [];
  const streetAddress = addrLines[0] || "Strandgaten 86";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["Architect", "LocalBusiness", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: settings?.studioName || "Studio Tenev",
    alternateName: "Studio Tenev Arkitekt Bergen",
    url: SITE_URL,
    description:
      "Studio Tenev er et arkitektkontor med base i Bergen sentrum, etablert i 2024 av sivilarkitekt MNAL Daniel Tenev. Kontoret arbeider med nybygg, eneboliger, fritidsboliger, tilbygg, påbygg, transformasjon, rehabilitering, byggesøknad, interiørarkitektur samt nærings- og kulturbygg.",
    foundingDate: "2024",
    taxID: settings?.orgNumber || "932 534 134 MVA",
    founder: {
      "@type": "Person",
      name: "Daniel Tenev",
      jobTitle: "Sivilarkitekt MNAL / Daglig leder",
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
    employee:
      uniqueEmployees.length > 0
        ? uniqueEmployees.map((name) => ({
            "@type": "Person",
            name,
          }))
        : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress,
      postalCode: "5004",
      addressLocality: "Bergen",
      addressRegion: "Vestland",
      addressCountry: "NO",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 60.3948,
      longitude: 5.3189,
    },
    email: settings?.contactEmail || "hello@studiotenev.com",
    telephone: settings?.contactPhone || "+47 950 40 910",
    availableLanguage: ["nb-NO", "en-GB", "Norwegian", "English"],
    areaServed: allAreaNames.map((name) => ({
      "@type": "Place",
      name,
    })),
    knowsAbout: allKnowsAbout,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Arkitekttjenester i Bergen og Norge",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Befaring og oppmåling",
            description: "Uforpliktende befaring, kartlegging av tomt eller eksisterende bygningsmasse og digital 3D-oppmåling.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Mulighetsstudier og skisseprosjekt",
            description: "Utforsking av konsept, volum, lysforhold, planløsninger og tomteutnyttelse for nybygg, tilbygg og transformasjon.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Forprosjekt og 3D-visualisering",
            description: "Fotorealistisk 3D-visualisering, materialvalg, konstruksjonsprinsipper og bearbeiding av arkitektonisk uttrykk.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Byggesøknad og ansvarlig søker",
            description: "Komplett utarbeidelse og innsending av byggesøknad, nabovarsling, dispensasjonssøknader og dialog med Bergen kommune og plan- og bygningsmyndigheter.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Anbudsgrunnlag, detaljprosjektering og arbeidstegninger",
            description: "Komplett tegningsgrunnlag, beskrivelse til entreprenører, detaljprosjektering og oppfølging på byggeplass frem til ferdigattest.",
          },
        },
      ],
    },
    award: [
      "Architizer Vision Awards",
      "NAL Wildcard (Norske arkitekters landsforbund)",
    ],
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
