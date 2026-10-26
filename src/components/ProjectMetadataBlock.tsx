'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatTypography } from '@/utils/typography';

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
  imageCreditType?: string;
  renderingFirm?: string;
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
  imageCreditType,
  renderingFirm,
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

  // 7. <Photographer> (or) <Images>: <PhotographerName> (or) <RenderingFirmName>
  if (photographer && renderingFirm && photographer !== renderingFirm) {
    metadataFields.push({ label: t('photographer'), value: photographer });
    metadataFields.push({ label: t('images'), value: renderingFirm });
  } else {
    const creditValue = renderingFirm || photographer;
    if (creditValue) {
      const isImages =
        imageCreditType === 'images' ||
        Boolean(renderingFirm) ||
        /^(mir|nrml|nrml studio|kvantit|render|rendering|visual|3d)/i.test(creditValue.trim());

      const creditLabel = isImages ? t('images') : t('photographer');
      metadataFields.push({ label: creditLabel, value: creditValue });
    }
  }

  if (metadataFields.length === 0) return null;

  const title = (locale === 'en' && projectTitleEn) ? projectTitleEn : projectTitle;

  return (
    <div key={id} className={`flex flex-col text-[1rem] leading-(--line-height) text-black ${className}`} style={style}>
      <h1 className="sr-only">{title}</h1>
      {metadataFields.map((field) => (
        <div key={field.label} className="leading-(--line-height) text-black">
          <span>{field.label}:</span>{' '}
          <span>{formatTypography(field.value)}</span>
        </div>
      ))}
    </div>
  );
}
