'use client';

import React from 'react';
import ServicesList from '@/components/ServicesList';
import { useLanguage } from '@/i18n/LanguageContext';

export default function TjenesterContent() {
  const { locale } = useLanguage();
  const isEn = locale === 'en';

  return (
    <div className="w-full px-side-padding pt-content-top mb-42">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1 gap-y-fm-2">
        <div className="md:col-start-3 md:col-span-8">
          <div className="text-measure flex flex-col">
            <h1 className="font-normal mb-4">
              {isEn ? 'Services' : 'Tjenester'}
            </h1>
            
            <div className="flex flex-col gap-4 mb-10 md:mb-14">
              <p>
                {isEn
                  ? 'Studio Tenev offers comprehensive architectural design for both private and commercial clients – from initial concepts and zoning analysis to detailed construction documents and site supervision.'
                  : 'Studio Tenev tilbyr helhetlig arkitekturprosjektering for både private og profesjonelle oppdragsgivere – fra idé og reguleringsavklaring til detaljtegninger og oppfølging på byggeplass.'}
              </p>
              <p>
                {isEn
                  ? 'We guide you through the entire design and construction process. Whether you are planning a new private residence, a holiday home, an extension, a renovation, or property development on a larger scale, our goal is to realize the full potential of each project through close dialogue and architectural precision.'
                  : 'Vi er med deg gjennom hele design- og byggeprosessen. Uansett om du planlegger en ny enebolig, en fritidsbolig, et tilbygg, en ombygging eller eiendomsutvikling i større skala, er vårt mål å realisere det fulle potensialet i hvert prosjekt gjennom tett dialog og faglig presisjon.'}
              </p>
            </div>

            {/* Faser 01–10 */}
            <ServicesList />
          </div>
        </div>
      </div>
    </div>
  );
}
