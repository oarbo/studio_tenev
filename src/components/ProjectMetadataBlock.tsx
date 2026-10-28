'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatTypography, renderTypography } from '@/utils/typography';

interface ProjectMetadataBlockProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  projectTitle: string;
  projectTitleEn?: string;
  dateStr?: string;
  location?: string;
  country?: string;
  client?: string;
  typeTags?: string[];
  status?: string;
  statusEn?: string;
  size?: { value: number; unit: string };
  contractor?: string;
  photographer?: string;
  renderingFirm?: string;
  team?: string[] | string;
}

function formatTeamList(team?: string[] | string): string {
  if (!team) return '';

  const rawList = Array.isArray(team) ? team : [team];
  const names: string[] = [];

  for (const item of rawList) {
    if (typeof item === 'string') {
      const parts = item.split(',').map((p) => p.trim()).filter(Boolean);
      names.push(...parts);
    }
  }

  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;

  const allExceptLast = names.slice(0, -1).join(', ');
  const last = names[names.length - 1];
  return `${allExceptLast} & ${last}`;
}

export default function ProjectMetadataBlock({
  id = 'metadata',
  className = '',
  style,
  projectTitle,
  projectTitleEn,
  dateStr,
  location,
  country,
  client,
  typeTags = [],
  status,
  statusEn,
  size,
  contractor,
  photographer,
  renderingFirm,
  team,
}: ProjectMetadataBlockProps) {
  const { locale, t, translateStatus, translateTag } = useLanguage();

  const metadataFields: { label: string; value: string }[] = [];

  // 1. Status: <status>, <År>
  const displayStatus = status
    ? (locale === 'en' && statusEn ? statusEn : translateStatus(status))
    : '';

  if (displayStatus && dateStr) {
    metadataFields.push({ label: t('status'), value: `${displayStatus}, ${dateStr}` });
  } else if (displayStatus) {
    metadataFields.push({ label: t('status'), value: displayStatus });
  } else if (dateStr) {
    metadataFields.push({ label: t('status'), value: dateStr });
  }

  // 2. Location: <Sted>, <Land>
  if (location) {
    let locValue = location.trim();
    const defaultCountry = locale === 'en' ? 'Norway' : 'Norge';
    const rawCountry = country ? country.trim() : defaultCountry;
    const effectiveCountry =
      locale === 'en' && (rawCountry.toLowerCase() === 'norge' || rawCountry.toLowerCase() === 'norway')
        ? 'Norway'
        : locale === 'no' && (rawCountry.toLowerCase() === 'norway' || rawCountry.toLowerCase() === 'norge')
        ? 'Norge'
        : rawCountry;

    const lowerLoc = locValue.toLowerCase();
    const endsWithCountry =
      lowerLoc.endsWith(', norge') ||
      lowerLoc.endsWith(', norway') ||
      lowerLoc.endsWith(', tyskland') ||
      lowerLoc.endsWith(', germany') ||
      lowerLoc.endsWith(', litauen') ||
      lowerLoc.endsWith(', lithuania');

    if (!endsWithCountry && !locValue.includes(effectiveCountry)) {
      locValue = `${locValue}, ${effectiveCountry}`;
    } else if (locale === 'en') {
      locValue = locValue.replace(/,\s*Norge$/i, ', Norway');
    } else if (locale === 'no') {
      locValue = locValue.replace(/,\s*Norway$/i, ', Norge');
    }

    metadataFields.push({ label: t('location'), value: locValue });
  }

  // 3. Type: <Typetag(s)>
  if (typeTags.length > 0) {
    const translatedTypes = typeTags.map((tag) => translateTag(tag)).join(', ');
    metadataFields.push({ label: t('type'), value: translatedTypes });
  }

  // 4. Client: <ClientName>
  if (client) {
    metadataFields.push({ label: t('client'), value: client });
  }

  // 5. Contractor: <ContractorName>
  if (contractor) {
    metadataFields.push({ label: t('contractor'), value: contractor });
  }

  // 6. Size: <størrelse> <enhet>
  if (size?.value) {
    metadataFields.push({
      label: t('size'),
      value: `${size.value}\u00A0${(size.unit || 'm²').trim()}`,
    });
  }

  // 7. Fotograf
  if (photographer) {
    metadataFields.push({ label: t('photographer'), value: photographer });
  }

  // 8. Rendring
  if (renderingFirm) {
    metadataFields.push({ label: t('rendering'), value: renderingFirm });
  }

  // 9. Team (nederst i listen)
  const teamFormatted = formatTeamList(team);
  if (teamFormatted) {
    metadataFields.push({ label: t('team'), value: teamFormatted });
  }

  if (metadataFields.length === 0) return null;

  const title = (locale === 'en' && projectTitleEn) ? projectTitleEn : projectTitle;

  return (
    <div key={id} className={`flex flex-col text-[1rem] leading-(--line-height) text-black ${className}`} style={style}>
      <h1 className="sr-only">{title}</h1>
      {metadataFields.map((field) => (
        <div key={field.label} className="leading-(--line-height) text-black">
          <span>{field.label}:</span>{' '}
          <span>{renderTypography(field.value, locale === 'en' ? 'en-GB' : 'nb')}</span>
        </div>
      ))}
    </div>
  );
}
