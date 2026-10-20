'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function FooterBackToTop() {
  const { t } = useLanguage();

  return (
    <button 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="hover:opacity-70 transition-opacity text-left block cursor-pointer"
    >
      {t('backToTop')}
    </button>
  );
}
