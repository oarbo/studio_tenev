import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import HomeGrid from '@/components/HomeGrid';
import { client, getFrontpageQuery } from '@/sanity/client';

export const revalidate = 60; 

export default async function Page() {
  const data = await client.fetch(getFrontpageQuery).catch(() => null);
  const siteSettings = data || {};
  
  const featuredContent = siteSettings?.featuredContent || [];
  const dynamicLocations: string[] = Array.isArray(siteSettings?.projectLocations)
    ? siteSettings.projectLocations.filter(Boolean)
    : [];
  const dynamicCountries: string[] = Array.isArray(siteSettings?.projectCountries)
    ? siteSettings.projectCountries.filter(Boolean)
    : [];
  const locationsSummary = Array.from(new Set([...dynamicLocations, ...dynamicCountries])).join(', ');

  return (
    <Layout>
      <div id="home-container" className="w-full">
        <h1 className="sr-only">Studio Tenev — Arkitekt i Bergen | Sivilarkitekt MNAL Daniel Tenev</h1>
        {featuredContent.length > 0 && (
          <div id="main-content">
            <HomeGrid items={featuredContent} />
          </div>
        )}

        <section className="sr-only" aria-label="Om Studio Tenev — Arkitektkontor i Bergen og Norge">
          <h2>Arkitektkontor i Bergen sentrum — Prosjekter i hele Norge</h2>
          <p>
            Studio Tenev er et arkitektkontor etablert i 2024 av sivilarkitekt MNAL Daniel Tenev, med base i Strandgaten 86 i hjertet av Bergen sentrum.
            Vi arbeider med arkitekturprosjekter i Bergen, på Vestlandet, i Oslo og på Østlandet samt over hele Norge og internasjonalt – fra interiørarkitektur, tilbygg, påbygg, ombygging, totalrenovering, rehabilitering og transformasjon av eksisterende bygninger til arkitekttegnede eneboliger, hytter og fritidsboliger på fjellet og ved kysten (blant annet Geilo, Hallingdal, Voss, Hardanger, Tjøme og Vestfold), kontorbygg, næringsbygg samt nasjonale kultur- og reiselivsbygg (som Urnes Verdensarvsenter i Luster, Loen, Domkirkeodden og Preikestolen).
            {locationsSummary ? ` Aktuelle prosjektsteder og lokasjoner i porteføljen inkluderer: ${locationsSummary}.` : ''}
          </p>
          <p>
            Vår spesialitet er å skape stedegne, varige og gode rom ved å utforske form, dagslys, materialitet, trekonstruksjoner og atmosfære gjennom både fysiske modeller, skisser og høyteknologiske digitale verktøy. Daniel Tenev er utdannet ved Arkitektur- og designhøgskolen i Oslo (AHO) og Det Kongelige Akademi i København, og kontoret er medlem av Norske arkitekters landsforbund (NAL) og NAL Wildcard.
          </p>

          <h2>Arkitekttjenester fra befaring og skisseprosjekt til byggesøknad og ferdigstillelse</h2>
          <p>
            Som arkitekt og ansvarlig søker bistår vi private tiltakshavere, utbyggere og offentlige oppdragsgivere trygt gjennom hele byggeprosessen i Bergen kommune, Oslo og kommuner over hele landet: uforpliktende befaring og 3D-oppmåling, mulighetsstudier, regulering, skisseprosjekt, forprosjekt, fotorealistisk 3D-visualisering, byggesøknad og dispensasjonssøknader, anbudsgrunnlag, detaljprosjektering, arbeidstegninger og oppfølging på byggeplass.
          </p>

          <div lang="en-GB">
            <h2>Studio Tenev — Contemporary Norwegian Architecture Practice</h2>
            <p>
              Studio Tenev is a Norwegian architecture and interior architecture studio founded in 2024 by architect MNAL Daniel Tenev, situated in the historic centre of Bergen, Norway, working across Norway, Scandinavia, and Europe. Educated at the Oslo School of Architecture and Design (AHO) and the Royal Danish Academy in Copenhagen, Daniel Tenev leads a practice dedicated to bespoke residential architecture, private houses, Nordic timber cabins and holiday homes, adaptive reuse, heritage transformation, interior architecture, workplace design, and public and cultural buildings.
              {locationsSummary ? ` Current project locations include: ${locationsSummary}.` : ''}
            </p>
            <p>
              Combining tactile spatial craft, physical model-making, and advanced digital light and atmospheric simulation, Studio Tenev develops site-specific architecture rooted in Scandinavian materiality and craft. The studio’s work has been recognised in the Architizer Vision Awards, selected for the Association of Norwegian Architects (NAL) Wildcard programme, and featured in international publications including New Norm Magazine, Leibal, Imagicasa, and Nytt Rom.
            </p>
          </div>

          <nav aria-label="Hurtiglenker">
            <ul>
              <li><Link href="/work">Se alle arkitekturprosjekter / Selected Architecture Projects (Residential, Cabins, Transformation, Interior & Cultural Buildings)</Link></li>
              <li><Link href="/tjenester">Våre arkitekttjenester i Bergen og Norge — fra befaring og skisseprosjekt til byggesøknad og byggeplassoppfølging</Link></li>
              <li><Link href="/studio">Om Studio Tenev og sivilarkitekt MNAL Daniel Tenev / About the Studio</Link></li>
              <li><Link href="/kontakt">Kontakt arkitekt for befaring eller uforpliktende prat / Contact Studio Tenev</Link></li>
              <li><Link href="/news">Nyheter, priser og internasjonale publikasjoner / News, Awards & Publications</Link></li>
            </ul>
          </nav>

          <address>
            Studio Tenev, Strandgaten 86, 5004 Bergen, Norway. E-post: hello@studiotenev.com. Telefon: +47 950 40 910.
          </address>
        </section>
      </div>
    </Layout>
  );
}
