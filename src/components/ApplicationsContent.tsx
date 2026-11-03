'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

interface ApplicationsContentProps {
  text?: string;
  textEn?: string;
}

function renderTextWithEmail(text: string) {
  const parts = text.split(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
  return parts.map((part, i) => {
    if (part.includes('@')) {
      return (
        <a
          key={i}
          href={`mailto:${part}`}
          className="underline underline-offset-4 hover:opacity-70 transition-opacity whitespace-nowrap"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function ApplicationsContent({ text, textEn }: ApplicationsContentProps) {
  const { locale, t } = useLanguage();
  const isEn = locale === 'en';
  const displayText = isEn ? (textEn || text) : text;

  return (
    <div className="w-full px-side-padding pt-content-top mb-[calc(7*var(--fm))] md:mb-42">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-fm-1">
        <div className="md:col-span-12 xl:col-start-3 xl:col-span-8">
          <div className="text-measure text-black text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
            <h1 className="font-normal mb-4 text-[1.125rem] md:text-[1.2rem] leading-(--line-height)">
              {t('applications')}
            </h1>
            {displayText ? (
              <p className="whitespace-pre-wrap">{renderTextWithEmail(displayText)}</p>
            ) : isEn ? (
              <p>
                We appreciate applications from talented architects and interns. Please send your
                portfolio and CV to{' '}
                <a
                  href="mailto:hello@studiotenev.com"
                  className="underline underline-offset-4 hover:opacity-70 whitespace-nowrap"
                >
                  hello@studiotenev.com
                </a>
                .
              </p>
            ) : (
              <p>
                Vi setter pris på åpne søknader fra dyktige arkitekter og praktikanter. Send gjerne
                portefølje og CV til{' '}
                <a
                  href="mailto:hello@studiotenev.com"
                  className="underline underline-offset-4 hover:opacity-70 whitespace-nowrap"
                >
                  hello@studiotenev.com
                </a>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
