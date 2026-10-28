'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { PortableText } from '@portabletext/react';
import { formatPortableText, renderTypography, portableTextComponents } from '@/utils/typography';

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
  const lang = locale === 'en' ? 'en-GB' : 'nb';
  const rawTitle = locale === 'en' ? (titleEn || title) : title;
  const rawText = locale === 'en' && Array.isArray(textEn) && textEn.length > 0 ? textEn : text;
  const currentText = rawText ? (formatPortableText(rawText, lang) || rawText) : undefined;

  return (
    <div className="text-measure" lang={lang}>
      {rawTitle && <h2 className="font-normal mb-4 text-[1.33rem]">{renderTypography(rawTitle, lang)}</h2>}
      {currentText && (
        <div className="news-content !m-0 !max-w-none text-[1.125rem] md:text-[1.2rem] leading-(--line-height)" lang={lang}>
          <PortableText value={currentText} components={portableTextComponents} />
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
  const lang = locale === 'en' ? 'en-GB' : 'nb';
  const rawCaption = locale === 'en' ? (captionEn || caption) : caption;

  if (!rawCaption) return null;

  return (
    <div
      lang={lang}
      className={className || "mt-[calc(1em*var(--line-height))] text-[calc(1rem-3px)] text-center leading-(--line-height)"}
      style={{ color: 'var(--secondary-color)' }}
    >
      {renderTypography(rawCaption, lang)}
    </div>
  );
}
