'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';

export interface ServicePhase {
  id: string;
  number: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
}

const PHASES: ServicePhase[] = [
  {
    id: 'befaring-og-oppmaaling',
    number: '01',
    title: 'Befaring og oppmåling',
    titleEn: 'Site visit and surveying',
    description:
      'Hvert prosjekt er unikt og påvirkes av tomtens størrelse, beliggenhet og formål. For å sikre en god forståelse av utgangspunktet tilbyr vi alltid befaring. Dette gir oss mulighet til å vurdere tomten og prosjektets rammer på en grundig måte.\n\nVed mindre oppdrag, som rehabilitering av leiligheter, kan vi selv gjennomføre nødvendige oppmålinger for å sikre en effektiv og nøyaktig prosess. For større og mer komplekse prosjekter, som nybygg av enebolig, tilbygg eller ombygging, samarbeider vi med erfarne oppmålingsfirmaer med spesialkompetanse innen presisjonsmåling.\n\nGjennom befaring og grundig oppmåling legger vi et solid grunnlag for videre arbeid, enten det gjelder rehabilitering, tilbygg eller nybygg.',
    descriptionEn:
      'Every project is unique and shaped by the size, location, and character of the site. To ensure a thorough understanding of the starting point, we always offer a site visit. This allows us to assess the site conditions and regulatory parameters comprehensively.\n\nFor smaller commissions, such as apartment renovations, we can conduct the necessary measurements ourselves to ensure an efficient and precise process. For larger and more complex projects, such as new houses, extensions, or conversions, we collaborate with experienced surveying firms specializing in high-precision measurement.\n\nThrough site visits and precise measurements, we establish a solid foundation for the subsequent design phases.',
  },
  {
    id: '3d-visualisering',
    number: '02',
    title: '3D-visualisering',
    titleEn: '3D Visualization',
    description:
      'Som en del av vår arkitekturprosjektering tilbyr vi 3D-visualisering for å gi en realistisk og detaljert fremstilling av prosjektet i tidlig fase. Dette verktøyet er en viktig del av designprosessen og gir både arkitekt og oppdragsgiver en bedre forståelse av volum, materialvalg og romlige kvaliteter før endelige beslutninger tas.\n\nMed 3D-visualisering kan vi effektivt utforske ulike løsninger og tilpasninger, noe som bidrar til en mer forutsigbar prosess og et bedre sluttresultat. Enten det gjelder eneboliger, tilbygg eller større prosjekter, gir denne metoden verdifull innsikt og sikrer at arkitektoniske visjoner realiseres på en helhetlig og gjennomtenkt måte.',
    descriptionEn:
      'As an integral part of our architectural design, we offer 3D visualization to provide a realistic and detailed representation of the project in its early stages. This tool is a key component of the design dialogue, offering both architect and client a clear understanding of massing, materials, and spatial qualities before final decisions are made.\n\nWith 3D visualization, we can explore various spatial layouts and design options, resulting in a predictable process and refined architectural outcome.',
  },
  {
    id: 'mulighetsstudier',
    number: '03',
    title: 'Mulighetsstudier / Volumstudier / Idéutvikling',
    titleEn: 'Feasibility studies / Massing / Concept development',
    description:
      'I tidlige faser av arkitekturprosjekteringen gjennomfører vi mulighetsstudier, volumstudier og idéutvikling på et skissemessig nivå. Disse analysene gir verdifull innsikt i sentrale faktorer som adkomst, geometri, størrelse og samspillet mellom bygg og tomt.\n\nFor eneboliger og tilbygg gir denne tilnærmingen et solid grunnlag før videre prosjektering, slik at ressurser brukes effektivt og løsningen optimaliseres gjennom en grundig designprosess. I eiendomsutviklingsprosjekter gir dette en tidlig indikasjon på hvilke grep som vil gi best avkastning og utnyttelse, samtidig som det skapes varige arkitektoniske kvaliteter.',
    descriptionEn:
      'In the early phases, we carry out feasibility studies, massing models, and conceptual development. These analyses provide valuable insights into access, solar orientation, site geometry, and the relationship between building and landscape.\n\nFor private houses and extensions, this approach creates a solid basis before proceeding, ensuring resources are used thoughtfully and solutions are optimized. For property development, it provides an early indication of optimal density and programmatic balance.',
  },
  {
    id: 'skisseprosjekt',
    number: '04',
    title: 'Skisseprosjekt',
    titleEn: 'Concept design',
    description:
      'Et skisseprosjekt er et viktig første steg i designprosessen, der vi som arkitekt utforsker og visualiserer mulighetene for prosjektet. Vi analyserer tomten, reguleringskrav og funksjonelle behov for å utvikle en helhetlig og gjennomtenkt løsning.\n\nSkisseprosjektet danner grunnlaget for videre prosjektering og sikrer at estetikk, funksjonalitet og kontekst balanseres optimalt for et vellykket resultat.',
    descriptionEn:
      'Concept design is an essential first step where we explore and visualize the architectural potential of the brief. We analyze the site, regulatory constraints, and functional requirements to develop a coherent and thoughtful design proposal.',
  },
  {
    id: 'forprosjekt',
    number: '05',
    title: 'Forprosjekt',
    titleEn: 'Developed design',
    description:
      'Prosjektet videreutvikles med fokus på realisering, der løsningene kvalitetssikres i henhold til tekniske forskrifter og kommunale rammebetingelser. Vi utarbeider nødvendige vedlegg, tegninger og redegjørelser for byggesøknaden, slik at prosjektet er klart for innsending.\n\nPå dette stadiet anbefaler vi å involvere tekniske fag for å verifisere løsninger og forberede teknisk prosjektering. Før innsending gjennomgår vi prosjektet grundig for å sikre at det oppfyller alle relevante krav.',
    descriptionEn:
      'The project is refined with a focus on buildability, verifying designs against technical regulations and local planning frameworks. We prepare drawings, statements, and documentation for building permit submission.',
  },
  {
    id: 'byggesoknad',
    number: '06',
    title: 'Byggesøknad',
    titleEn: 'Planning application & building permits',
    description:
      'Vårt arkitektkontor håndterer hele prosessen med byggesøknad, enten det gjelder rammesøknad, ett-trinnssøknad eller igangsettingstillatelse. Vi sikrer en effektiv og grundig saksbehandling ved å utarbeide nødvendige tegninger og dokumentasjon i henhold til gjeldende regelverk. Gjennom tett oppfølging frem til ferdigattest sørger vi for en smidig prosess, slik at prosjektet kan realiseres uten unødvendige forsinkelser.\n\nVed behov for juridisk veiledning eller bistand knyttet til kompliserte dispensasjoner, samarbeider vi med erfarne jurister med spesialisering innen eiendomsjuss. Gjennom tett og åpen dialog med kommunen og saksbehandler oppnår vi en smidig og forutsigbar søknadsprosess.',
    descriptionEn:
      'We manage the entire planning permission and building application process in Norway. We prepare all required architectural drawings, neighbor notices, and documentation in accordance with planning and building regulations, coordinating with the municipality to ensure a smooth and predictable process.',
  },
  {
    id: 'anbudsgrunnlag',
    number: '07',
    title: 'Anbudsgrunnlag',
    titleEn: 'Tender documentation',
    description:
      'Et anbudsgrunnlag er et viktig dokument for å innhente presise pristilbud i dialogen med utførende aktører og entreprenører. Som arkitekt utarbeider vi detaljerte beskrivelser og tegninger av materialer, arealer, vinduer, dører, belysning, samt innvendige og utvendige overflater.\n\nEt grundig anbudsdokument sikrer nøyaktig prising og tydelig oppgaveforståelse, slik at man unngår kostbare endringer eller uforutsette tilpasninger underveis i byggefasen.',
    descriptionEn:
      'Tender documentation is crucial for obtaining accurate pricing from contractors. We prepare detailed specifications and drawings covering materials, schedules for windows and doors, lighting, and interior and exterior finishes to avoid unforeseen adjustments during construction.',
  },
  {
    id: 'detaljprosjektering',
    number: '08',
    title: 'Detaljprosjektering',
    titleEn: 'Detailed design',
    description:
      'Detaljprosjektering er en avgjørende fase der vi som arkitekt utvikler presise tegninger og spesifikasjoner for bygging. Vi sikrer at estetikk, funksjonalitet og tekniske løsninger er grundig gjennomarbeidet, fra materialvalg til konstruksjonsdetaljer. Denne prosessen gir utførende et klart grunnlag for gjennomføring, reduserer risiko for feil og sikrer et vellykket sluttresultat med høy kvalitet.\n\nVed større prosjekter har vi god erfaring med BIM-verktøy, og sikrer at modell- og samhandlingsarbeid fungerer optimalt. Regelmessige prosjekteringsmøter avholdes for å koordinere løsningene effektivt mellom de ulike involverte fagdisiplinene.',
    descriptionEn:
      'Detailed design is the critical phase where architectural ideas are translated into precise construction drawings and specifications. We resolve all junctions, envelope details, and technical interfaces to provide clear guidance for craftsmen and contractors.',
  },
  {
    id: 'arbeidstegninger',
    number: '09',
    title: 'Arbeidstegninger',
    titleEn: 'Construction drawings',
    description:
      'Arbeidstegninger for prosjektets sentrale detaljer utarbeides i henhold til avtale, og skjemaer for bestilling av dører, vinduer, rekkverk og andre essensielle elementer produseres. Dette sikrer at utførende håndverkere har et entydig og presist grunnlag på byggeplass.',
    descriptionEn:
      'Production drawings and component schedules for windows, doors, stairs, and bespoke elements are produced to ensure accurate assembly and procurement on site.',
  },
  {
    id: 'oppfolging-pa-byggeplass',
    number: '10',
    title: 'Oppfølging på byggeplass',
    titleEn: 'Site supervision & construction follow-up',
    description:
      'Tett oppfølging og effektiv kommunikasjon er avgjørende i denne fasen for å oppnå et sluttresultat med høy estetisk kvalitet og lang levetid. Jevnlige befaringer og byggemøter gjennomføres for å sikre kontroll, kvalitet og fremdrift frem mot ferdigstillelse.',
    descriptionEn:
      'Close collaboration with the builder on site ensures the architectural qualities, details, and material choices are executed as intended through regular site visits and construction meetings.',
  },
];

export default function ServicesList() {
  const { locale, t } = useLanguage();
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const found = PHASES.find((p) => p.id === hash || `fase-${p.number}` === hash);
        if (found) {
          setActiveId(found.id);
          setTimeout(() => {
            const el = document.getElementById(found.id);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 150);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const toggleItem = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="w-full flex flex-col">
      {PHASES.map((phase, index) => {
        const isActive = activeId === phase.id;
        const title = locale === 'en' ? phase.titleEn : phase.title;
        const description = locale === 'en' ? phase.descriptionEn : phase.description;

        return (
          <div
            key={phase.id}
            id={phase.id}
            className="w-full scroll-mt-32"
          >
            <div
              className={`border-black ${
                index === PHASES.length - 1 ? '' : 'border-b'
              }`}
            >
              {/* Rad-knapp */}
              <button
                onClick={() => toggleItem(phase.id)}
                aria-expanded={isActive}
                className="w-full text-left pt-1.5 pb-[calc(0.5*var(--fm))] cursor-pointer focus:outline-none group"
              >
                <div className="text-black text-[1.125rem] md:text-[1.2rem] leading-(--line-height) group-hover:opacity-70 transition-opacity">
                  {title}
                </div>
              </button>

              {/* Ekspandert innhold med smooth CSS Grid animasjon */}
              <div
                className={`w-full grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <div className="w-full pb-6 md:pb-8 pt-1 flex flex-col gap-4 text-black text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                    {description.split('\n\n').map((para, i) => (
                      <p key={i} className="leading-(--line-height)">
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Avsluttende CTA */}
      <div className="mt-[calc(2*var(--fm))] text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
        <Link
          href="/kontakt"
          className="hover:underline underline-offset-4 decoration-1 cursor-pointer inline-block"
        >
          {t('bookConsultation')}
        </Link>
      </div>
    </div>
  );
}
