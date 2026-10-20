'use client';

import React, { useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export interface ProjectCreditItem {
  _id?: string;
  title?: string;
  titleEn?: string;
  slug?: string;
  photographer?: string;
}

interface ImprintContentProps {
  studioName?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  credits?: (ProjectCreditItem | string)[];
}

export default function ImprintContent({
  studioName = 'Studio Tenev AS',
  address = 'Strandgaten 86, 5004 Bergen',
  contactEmail = 'hello@studiotenev.com',
  contactPhone = '+47 950 40 910',
  credits = [],
}: ImprintContentProps) {
  const { locale } = useLanguage();
  const isEn = locale === 'en';
  const currentYear = new Date().getFullYear();

  // Ekstraher unike fotografer og visualiseringsstudioer, alfabetisk sortert
  const photographersList = useMemo(() => {
    const names = new Set<string>();
    credits.forEach((item) => {
      const raw = typeof item === 'string' ? item : item?.photographer;
      if (raw) {
        raw.split(',').forEach((name) => {
          const trimmed = name.trim();
          if (trimmed) names.add(trimmed);
        });
      }
    });

    // Fallback hvis ingen er hentet fra Sanity ennå
    if (names.size === 0) {
      ['Elisabeth Heier', 'Ivar Kvaal', 'Mir', 'NRML Studio'].forEach((n) => names.add(n));
    }

    return Array.from(names).sort((a, b) => a.localeCompare(b, 'nb'));
  }, [credits]);

  const photographersString = photographersList.join(', ');

  return (
    <div className="w-full px-side-padding pt-content-top mb-42">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 gap-y-fm-2">
        <div className="md:col-start-3 md:col-span-8">
          <div className="text-measure flex flex-col gap-10 md:gap-14 text-black text-[1rem]">
            {/* Page Title */}
            <div>
              <h1 className="font-normal mb-4">
                {isEn ? 'Imprint and Privacy policy' : 'Imprint and Privacy policy'}
              </h1>
            </div>

            {/* 1. Privacy Policy */}
            <div className="border-t border-black pt-1.5">
              <h2 className="font-normal mb-4">
                {isEn ? 'Privacy policy' : 'Personvern'}
              </h2>

              {isEn ? (
                <div className="flex flex-col gap-4 leading-(--line-height)">
                  <p>
                    In accordance with the EU GDPR (General Data Protection Regulation) requirements
                    and the Norwegian Personal Data Act, we are committed to protecting and respecting
                    your privacy. Essential cookies are used on this website but personal information
                    is not tracked or retained.
                  </p>
                  <div>
                    <h3 className="font-normal mb-0">Enquiries</h3>
                    <p>
                      When you submit an enquiry via our website or contact form, we collect only the
                      information you provide yourself (name, email address, phone number, and project details).
                      This information is used solely to respond to your enquiry, discuss potential projects,
                      or arrange a consultation. We never sell your personal information or share it with
                      third parties without your explicit consent. You can at any time request access to,
                      rectification of, or erasure of your personal data by contacting{' '}
                      <a href={`mailto:${contactEmail}`} className="underline underline-offset-2 hover:opacity-70">
                        {contactEmail}
                      </a>.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-normal mb-0">Analytics &amp; Cookies</h3>
                    <p>
                      This website does not use third-party tracking, advertising cookies, or behavioural profiling.
                    </p>
                  </div>
                  <p className="text-[calc(1rem-3px)] text-black">
                    Updated October 2026
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 leading-(--line-height)">
                  <p>
                    I samsvar med EUs personvernforordning (GDPR) og den norske personopplysningsloven
                    er vi forpliktet til å beskytte og respektere ditt personvern. Nødvendige tekniske
                    informasjonskapsler benyttes for nettsidens funksjonalitet, men personopplysninger
                    spores eller lagres ikke uten ditt samtykke.
                  </p>
                  <div>
                    <h3 className="font-normal mb-0">Henvendelser</h3>
                    <p>
                      Når du sender inn en henvendelse via vårt kontaktskjema, samler vi kun inn den
                      informasjonen du selv oppgir (navn, e-post, telefonnummer og prosjektopplysninger).
                      Denne informasjonen brukes utelukkende til å besvare din forespørsel, diskutere prosjektidéer
                      eller avtale befaring. Vi selger aldri personopplysninger til tredjeparter, og deler ikke
                      dine opplysninger uten ditt samtykke. Du kan når som helst be om innsyn i, retting eller
                      sletting av dine opplysninger ved å kontakte{' '}
                      <a href={`mailto:${contactEmail}`} className="underline underline-offset-2 hover:opacity-70">
                        {contactEmail}
                      </a>.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-normal mb-0">Informasjonskapsler og analyse</h3>
                    <p>
                      Nettsiden benytter ingen tredjeparts sporings-, markedsførings- eller analysekapsler.
                    </p>
                  </div>
                  <p className="text-[calc(1rem-3px)] text-black">
                    Sist oppdatert: oktober 2026
                  </p>
                </div>
              )}
            </div>

            {/* 2. Copyright */}
            <div className="border-t border-black pt-1.5">
              <h2 className="font-normal mb-4">
                {isEn ? 'Copyright' : 'Opphavsrett'}
              </h2>
              <div className="flex flex-col gap-4 leading-(--line-height)">
                <p>
                  &copy;{currentYear} {studioName}. {isEn ? 'All rights reserved.' : 'Alle rettigheter reservert.'}
                </p>

                {isEn ? (
                  <>
                    <p>
                      Unless otherwise indicated, all materials on these pages are copyrighted.
                      No part of these pages, either text or images may be used for any purpose other
                      than personal use, unless explicit authorisation is given. Therefore reproduction,
                      modification, storage in a retrieval system or retransmission, in any form or
                      by any means – electronic, mechanical or otherwise, for reasons other than personal
                      use, is strictly prohibited without prior written permission.
                    </p>
                    <p>
                      Photography and visualisations have been provided by: {photographersString}.
                    </p>
                    <p>
                      We thank all copyright owners for the permission to include their material on our
                      website. If, despite our efforts, any copyrights and credits have not been correctly
                      noted, please contact Studio Tenev AS ({contactEmail}) so that the relevant pages can be updated.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Med mindre annet er angitt, er alt materiale på disse sidene opphavsrettslig beskyttet.
                      Ingen del av disse sidene, verken tekst eller bilder, kan brukes til andre formål enn
                      personlig bruk, med mindre det foreligger uttrykkelig tillatelse. Reproduksjon, endring,
                      lagring i et gjenfinningssystem eller videresending, i enhver form eller på enhver måte –
                      elektronisk, mekanisk eller på annen måte – til andre formål enn personlig bruk, er derfor
                      strengt forbudt uten skriftlig forhåndstillatelse.
                    </p>
                    <p>
                      Fotografier og visualiseringer er levert av: {photographersString}.
                    </p>
                    <p>
                      Vi takker alle rettighetshavere for tillatelsen til å inkludere deres materiale på vår
                      nettside. Dersom noen opphavsrettigheter eller krediteringer mot formodning ikke er oppgitt
                      korrekt, ber vi om at Studio Tenev AS kontaktes ({contactEmail}) slik at de aktuelle sidene kan oppdateres.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* 3. Sustainability and accessibility */}
            <div className="border-t border-black pt-1.5">
              <h2 className="font-normal mb-4">
                {isEn ? 'Sustainability and accessibility' : 'Bærekraft og tilgjengelighet'}
              </h2>
              <div className="flex flex-col gap-4 leading-(--line-height)">
                <p>
                  {isEn
                    ? 'This website has been designed to be in accordance with accessibility and sustainability best practices to ensure an inclusive and energy-efficient experience. This includes using responsive design features and progressive enhancement, keeping to a strict network performance budget and minimal digital footprint.'
                    : 'Denne nettsiden er utformet i tråd med beste praksis for tilgjengelighet og digital bærekraft for å sikre en inkluderende og energieffektiv opplevelse. Dette inkluderer responsiv design, progressiv forbedring, strengt ytelsesbudsjett og et lavt digitalt klimaavtrykk.'}
                </p>
              </div>
            </div>

            {/* 4. Website */}
            <div className="border-t border-black pt-1.5">
              <h2 className="font-normal mb-4">
                {isEn ? 'Website' : 'Nettside'}
              </h2>
              <p className="leading-(--line-height)">
                Designed and built by Øystein Arbo studio
              </p>
            </div>

            {/* 5. Imprint */}
            <div className="border-t border-black pt-1.5">
              <h2 className="font-normal mb-4">
                {isEn ? 'Imprint' : 'Impressum'}
              </h2>
              <div className="leading-(--line-height)">
                {isEn ? (
                  <>
                    Studio Tenev AS, registered in Norway<br />
                    Registered office: Strandgaten 86, 5004 Bergen<br />
                    Organisation number 932 534 134 MVA
                  </>
                ) : (
                  <>
                    Studio Tenev AS, registrert i Foretaksregisteret<br />
                    Forretningsadresse: Strandgaten 86, 5004 Bergen<br />
                    Organisasjonsnummer 932 534 134 MVA
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
