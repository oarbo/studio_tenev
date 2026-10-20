'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { PortableText } from '@portabletext/react';

export function ProjectLocalizedTextBlock({
  title,
  titleEn,
  text,
  textEn,
}: {
  title?: string;
  titleEn?: string;
  text?: any;
  textEn?: any;
}) {
  const { locale } = useLanguage();
  const currentTitle = locale === 'en' ? (titleEn || title) : title;
  const currentText = locale === 'en' && Array.isArray(textEn) && textEn.length > 0 ? textEn : text;
  const lang = locale === 'en' ? 'en-GB' : 'nb';

  return (
    <div className="text-measure" lang={lang}>
      {currentTitle && <h2 className="font-normal mb-4">{currentTitle}</h2>}
      {currentText && (
        <div className="news-content !m-0 !max-w-none" lang={lang}>
          <PortableText value={currentText} />
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
  const currentCaption = locale === 'en' ? (captionEn || caption) : caption;
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
