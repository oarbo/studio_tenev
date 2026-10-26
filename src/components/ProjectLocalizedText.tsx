'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { PortableText } from '@portabletext/react';
import { formatTypography, formatPortableText } from '@/utils/typography';

export function ProjectLocalizedTextBlock({
  title,
  titleEn,
  text,
  textEn,
  metadataNode,
}: {
  title?: string;
  titleEn?: string;
  text?: any;
  textEn?: any;
  metadataNode?: React.ReactNode;
}) {
  const { locale } = useLanguage();
  const rawTitle = locale === 'en' ? (titleEn || title) : title;
  const currentTitle = rawTitle ? formatTypography(rawTitle) : undefined;
  const rawText = locale === 'en' && Array.isArray(textEn) && textEn.length > 0 ? textEn : text;
  const currentText = rawText ? (formatPortableText(rawText) || rawText) : undefined;
  const lang = locale === 'en' ? 'en-GB' : 'nb';

  return (
    <div className="text-measure" lang={lang}>
      {currentTitle && <h2 className="font-normal mb-4 text-[1.33rem]">{currentTitle}</h2>}
      {currentText && (
        <div className="news-content !m-0 !max-w-none text-[1.125rem] md:text-[1.2rem] leading-(--line-height)" lang={lang}>
          <PortableText value={currentText} />
        </div>
      )}
      {metadataNode && (
        <div className={currentText ? 'mt-[1.5em]' : ''}>
          {metadataNode}
        </div>
      )}
    </div>
  );
}

export function ProjectLocalizedCaption({
  caption,
  captionEn,
  className = '',
}: {
  caption?: string;
  captionEn?: string;
  className?: string;
}) {
  const { locale } = useLanguage();
  const rawCaption = locale === 'en' ? (captionEn || caption) : caption;
  const currentCaption = rawCaption ? formatTypography(rawCaption) : undefined;
  const lang = locale === 'en' ? 'en-GB' : 'nb';

  if (!currentCaption) return null;

  return (
    <div
      lang={lang}
      className={className || "mt-[calc(1em*var(--line-height))] text-[calc(1rem-3px)] text-center leading-(--line-height)"}
      style={{ color: 'var(--secondary-color)' }}
    >
      {currentCaption}
    </div>
  );
}
