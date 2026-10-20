'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatTypography } from '@/utils/typography';

interface ProjectMetadataBlockProps {
  id?: string;
  style?: React.CSSProperties;
  projectTitle: string;
  projectTitleEn?: string;
  dateStr?: string;
  location?: string;
  client?: string;
  typeTags?: string[];
  status?: string;
  statusEn?: string;
  size?: { value: number; unit: string };
  contractor?: string;
  photographer?: string;
}

export default function ProjectMetadataBlock({
  id = 'metadata',
  style,
  projectTitle,
  projectTitleEn,
  dateStr,
  location,
  client,
  typeTags = [],
  status,
  statusEn,
  size,
  contractor,
  photographer,
}: ProjectMetadataBlockProps) {
  const { locale, t, translateStatus, translateTag } = useLanguage();

  const metadataFields: { label: string; value: string }[] = [];
  if (dateStr) metadataFields.push({ label: t('year'), value: dateStr });
  if (location) metadataFields.push({ label: t('location'), value: location });
  if (client) metadataFields.push({ label: t('client'), value: client });
  if (typeTags.length > 0) {
    const translatedTypes = typeTags.map((tag) => translateTag(tag)).join(', ');
    metadataFields.push({ label: t('type'), value: translatedTypes });
  }
  if (status) {
    const displayStatus = (locale === 'en' && statusEn) ? statusEn : translateStatus(status);
    metadataFields.push({ label: t('status'), value: displayStatus });
  }
  if (size?.value) {
    metadataFields.push({
      label: t('size'),
      value: `${size.value}\u00A0${(size.unit || 'm²').trim()}`,
    });
  }
  if (contractor) metadataFields.push({ label: t('contractor'), value: contractor });
  if (photographer) metadataFields.push({ label: t('photographer'), value: photographer });

  const title = (locale === 'en' && projectTitleEn) ? projectTitleEn : projectTitle;

  return (
    <div key={id} className="md:col-start-3 md:col-span-8 border-t border-black pt-1.5 pb-8" style={style}>
      <h1 className="sr-only">{title}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-x-fm-1 gap-y-8 text-[1rem] text-black">
        {metadataFields.map((field) => (
          <div key={field.label} className="flex flex-col">
            <div style={{ color: 'var(--secondary-color)' }}>{field.label}</div>
            <div>{formatTypography(field.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
