'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  translations,
  statusTranslations,
  tagTranslations,
  Locale,
  TranslationKeys,
} from './translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKeys) => string;
  translateStatus: (status?: string | null) => string;
  translateTag: (tag: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Kartlegger internt språkvalg til BCP 47 språkkoder for nettleserens orddelingsordbøker:
// - Norsk: 'nb' (Norsk bokmål)
// - Engelsk: 'en-GB' (Britisk engelsk)
export const getHtmlLang = (loc: Locale): string => (loc === 'en' ? 'en-GB' : 'nb');

export function LanguageProvider({
  children,
  initialLocale = 'no',
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    // 1. Sjekk om språket er eksplisitt overstyrt i URL med ?lang=
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryLang = params.get('lang');
      if (queryLang === 'no' || queryLang === 'en') {
        setLocaleState(queryLang);
        document.cookie = `NEXT_LOCALE=${queryLang}; path=/; max-age=31536000; SameSite=Lax`;
        document.documentElement.lang = getHtmlLang(queryLang);
        return;
      }

      // 2. Sjekk lagret cookie
      const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
      if (match) {
        const val = match[1] as Locale;
        if (val === 'no' || val === 'en') {
          setLocaleState(val);
          document.documentElement.lang = getHtmlLang(val);
          return;
        }
      }

      // 3. Fallback: Sjekk nettleserens systemspråk
      const navLangs = navigator.languages || [navigator.language];
      const isNorwegian = navLangs.some((l) => /^(no|nb|nn|da|sv)/i.test(l));
      const detected: Locale = isNorwegian ? 'no' : 'en';

      setLocaleState(detected);
      document.cookie = `NEXT_LOCALE=${detected}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = getHtmlLang(detected);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof document !== 'undefined') {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = getHtmlLang(newLocale);
    }
    startTransition(() => {
      router.refresh();
    });
  };

  const t = (key: TranslationKeys): string => {
    return translations[locale]?.[key] ?? translations.no?.[key] ?? key;
  };

  const translateStatus = (status?: string | null): string => {
    if (!status) return '';
    if (locale === 'en') {
      return statusTranslations[status]?.en || status;
    }
    return statusTranslations[status]?.no || status;
  };

  const translateTag = (tag: string): string => {
    if (!tag) return '';
    const cleanTag = tag.trim();

    // 1. Direkte oppslag
    if (tagTranslations[cleanTag]) {
      return locale === 'en' ? tagTranslations[cleanTag].en : tagTranslations[cleanTag].no;
    }

    // 2. Case-insensitivt oppslag på norsk nøkkel
    const matchKey = Object.keys(tagTranslations).find(
      (k) => k.toLowerCase() === cleanTag.toLowerCase()
    );
    if (matchKey) {
      return locale === 'en' ? tagTranslations[matchKey].en : tagTranslations[matchKey].no;
    }

    // 3. Oppslag hvis taggen er skrevet på engelsk i kilden
    const matchByEn = Object.keys(tagTranslations).find(
      (k) => tagTranslations[k].en.toLowerCase() === cleanTag.toLowerCase()
    );
    if (matchByEn) {
      return locale === 'en' ? tagTranslations[matchByEn].en : tagTranslations[matchByEn].no;
    }

    return cleanTag;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, translateStatus, translateTag }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
