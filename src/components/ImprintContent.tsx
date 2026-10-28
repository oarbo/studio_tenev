'use client';

import React, { useMemo } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export interface ProjectCreditItem {
  _id?: string;
  title?: string;
  titleEn?: string;
  slug?: string;
  photographer?: string;
  renderingFirm?: string;
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

  // Ekstraher unike fotografer og visualiseringsstudioer, alfabetisk sortert (aldri duplikater)
  const photographersList = useMemo(() => {
    const namesMap = new Map<string, string>(); // lowercase -> display name

    credits.forEach((item) => {
      const stringsToProcess: string[] = [];
      if (typeof item === 'string') {
        stringsToProcess.push(item);
      } else if (item) {
        if (item.photographer) stringsToProcess.push(item.photographer);
        if (item.renderingFirm) stringsToProcess.push(item.renderingFirm);
      }

      stringsToProcess.forEach((raw) => {
        raw.split(',').forEach((name) => {
          const trimmed = name.trim();
          if (trimmed) {
            const key = trimmed.toLowerCase();
            if (!namesMap.has(key)) {
              namesMap.set(key, trimmed);
            }
          }
        });
      });
    });

    const uniqueNames = Array.from(namesMap.values());

    // Fallback hvis ingen er hentet fra Sanity ennå
    if (uniqueNames.length === 0) {
      ['Elisabeth Heier', 'Ivar Kvaal', 'Mir', 'NRML Studio'].forEach((n) => uniqueNames.push(n));
    }

    return uniqueNames.sort((a, b) => a.localeCompare(b, 'nb'));
  }, [credits]);

  const photographersString = photographersList.join(', ');

  return (
    <div className="w-full px-side-padding pt-content-top mb-42">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 gap-y-fm-2">
        <div className="md:col-start-3 md:col-span-8">
          <div className="text-measure flex flex-col gap-10 md:gap-14 text-black text-[1.125rem] md:text-[1.2rem] leading-(--line-height) hyphens-none">
            {/* Page Title */}
            <div>
              <h1 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                {isEn ? 'Imprint and Privacy policy' : 'Kolofon og personvern'}
              </h1>
            </div>

            {/* 1. Privacy Policy */}
            <div className="border-t border-black pt-1.5">
              <h2 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                {isEn ? 'Privacy policy' : 'Personvern'}
              </h2>

              {isEn ? (
                <div className="flex flex-col leading-(--line-height)">
                  <p>
                    We protect your privacy in accordance with GDPR and applicable legislation. This website uses only essential cookies for its operation, and no personal information is retained without consent.
                  </p>
                  <div className="mt-[1.5em]">
                    <h3 className="font-normal mb-0 text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">Enquiries</h3>
                    <p>
                      Information provided in the contact form is used solely for dialogue regarding your project and is never shared with third parties. For access to or deletion of your details, please contact{' '}
                      <a href={`mailto:${contactEmail}`} className="underline underline-offset-4 decoration-1 hover:opacity-70 whitespace-nowrap">
                        {contactEmail}
                      </a>.
                    </p>
                  </div>
                  <div className="mt-[1.5em]">
                    <h3 className="font-normal mb-0 text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">Analytics &amp; Cookies</h3>
                    <p>
                      This website does not use third-party tracking, advertising cookies, or behavioural profiling.
                    </p>
                  </div>
                  <p className="mt-4 mt-16px text-[1rem] leading-(--line-height) text-black" style={{ marginTop: '16px' }}>
                    Updated October 2026
                  </p>
                </div>
              ) : (
                <div className="flex flex-col leading-(--line-height)">
                  <p>
                    Vi verner om ditt personvern i tråd med GDPR og norsk lov. Nettsiden benytter kun nødvendige informasjonskapsler for drift, og vi lagrer ingen personopplysninger uten samtykke.
                  </p>
                  <div className="mt-[1.5em]">
                    <h3 className="font-normal mb-0 text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">Henvendelser</h3>
                    <p>
                      Informasjon du oppgir i kontaktskjemaet brukes utelukkende til dialog om ditt prosjekt, og deles aldri med andre. Ønsker du innsyn eller sletting av dine opplysninger, ta kontakt på{' '}
                      <a href={`mailto:${contactEmail}`} className="underline underline-offset-4 decoration-1 hover:opacity-70 whitespace-nowrap">
                        {contactEmail}
                      </a>.
                    </p>
                  </div>
                  <div className="mt-[1.5em]">
                    <h3 className="font-normal mb-0 text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">Informasjonskapsler og analyse</h3>
                    <p>
                      Nettsiden benytter ingen tredjeparts sporings-, markedsførings- eller analysekapsler.
                    </p>
                  </div>
                  <p className="mt-4 mt-16px text-[1rem] leading-(--line-height) text-black" style={{ marginTop: '16px' }}>
                    Sist oppdatert: oktober 2026
                  </p>
                </div>
              )}
            </div>

            {/* 2. Copyright */}
            <div className="border-t border-black pt-1.5">
              <h2 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                {isEn ? 'Copyright' : 'Opphavsrett'}
              </h2>
              <div className="flex flex-col leading-(--line-height)">
                <p>
                  &copy;{currentYear} {studioName}. {isEn ? 'All rights reserved.' : 'Alle rettigheter reservert.'}
                </p>

                {isEn ? (
                  <>
                    <p className="mt-half">
                      All material on these pages is protected by copyright. Text, images, and drawings may not be copied, distributed, or used without prior written permission.
                    </p>
                    <p>
                      Photography and visualisations have been provided by: {photographersString}.
                    </p>
                    <p className="mt-half">
                      If a credit is missing or incorrectly noted, please contact us at <a href={`mailto:${contactEmail}`} className="underline underline-offset-4 decoration-1 hover:opacity-70 whitespace-nowrap">{contactEmail}</a> so we can update the page.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mt-half">
                      Alt materiale på disse sidene er opphavsrettslig beskyttet. Tekst, bilder og tegninger kan ikke kopieres, videreformidles eller benyttes uten skriftlig forhåndstillatelse.
                    </p>
                    <p>
                      Fotografier og visualiseringer er levert av: {photographersString}.
                    </p>
                    <p className="mt-half">
                      Dersom en kreditering mangler eller ikke er oppgitt korrekt, vennligst ta kontakt på <a href={`mailto:${contactEmail}`} className="underline underline-offset-4 decoration-1 hover:opacity-70 whitespace-nowrap">{contactEmail}</a> slik at vi kan oppdatere siden.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* 3. Website */}
            <div className="border-t border-black pt-1.5">
              <h2 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                {isEn ? 'Website' : 'Nettside'}
              </h2>
              <p className="leading-(--line-height)">
                {isEn ? 'Designed and built by Øystein Arbo studio' : 'Designet og utviklet av Øystein Arbo studio'}
              </p>
            </div>

            {/* 4. Imprint */}
            <div className="border-t border-black pt-1.5">
              <h2 className="font-normal mb-4 mb-16px text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
                {isEn ? 'Imprint' : 'Impressum'}
              </h2>
              <div className="leading-(--line-height)">
                {isEn ? (
                  <>
                    Studio Tenev AS, registered in Norway<br />
                    Registered office: Strandgaten 86, 5004 Bergen<br />
                    Organisation number <span className="whitespace-nowrap">932 534 134 MVA</span>
                  </>
                ) : (
                  <>
                    Studio Tenev AS, registrert i Foretaksregisteret<br />
                    Forretningsadresse: Strandgaten 86, 5004 Bergen<br />
                    Organisasjonsnummer <span className="whitespace-nowrap">932 534 134 MVA</span>
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
