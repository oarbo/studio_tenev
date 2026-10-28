import React from 'react';
import type { PortableTextBlock } from '@portabletext/types';
import { toBritishEnglish } from './britishEnglish';

/**
 * Standardkomponenter for PortableText for å støtte typografisk formatering,
 * inkludert 20 unit tracking (0.02em) på 2+ CAPS (f.eks. PLATÅ, GDPR, MNAL).
 */
export const portableTextComponents = {
  marks: {
    caps: ({ children }: any) => React.createElement('span', { className: 'tracking-[0.02em]' }, children),
  },
};

/**
 * Konverterer rette anførselstegn («dumb quotes») og rette apostrofer til
 * typografiske anførselstegn (‘…’, “…”) og ekte apostrofer (’):
 * - it's, don't, user's -> it’s, don’t, user’s
 * - '90s -> ’90s
 * - 'sitat' -> ‘sitat’
 * - "sitat" -> “sitat”
 */
export function applySmartQuotes(text: string): string {
  if (!text || typeof text !== 'string') return text;

  return (
    text
      // 1. Årstallsforkortelser (f.eks. '90s, '24 -> ’90s, ’24)
      .replace(/(^|[\s(\[{])'(?=\d{2}s?\b)/g, '$1’')
      // 2. Sammentrekninger og eieform inne i ord (f.eks. it's, don't, user's, O'Connor -> it’s, don’t, user’s, O’Connor)
      .replace(/(\b[a-zA-ZæøåÆØÅ0-9]+)'([a-zA-ZæøåÆØÅ]+)/g, '$1’$2')
      // 3. Eieform i flertall eller navn som slutter på apostrof (f.eks. architects', James' -> architects’, James’)
      .replace(/([a-zA-ZæøåÆØÅ0-9]+)'(?![\w])/g, '$1’')
      // 4. Åpnende enkelt anførselstegn ‘ (foran ord/tegn)
      .replace(/(^|[\s(\[{<—–])'(?=\S)/g, '$1‘')
      // 5. Lukkende enkelt anførselstegn / apostrof ’
      .replace(/'/g, '’')
      // 6. Åpnende dobbelt anførselstegn “
      .replace(/(^|[\s(\[{<—–])"(?=\S)/g, '$1“')
      // 7. Lukkende dobbelt anførselstegn ”
      .replace(/"/g, '”')
  );
}

/**
 * Setter inn harde mellomrom (\u00A0) og typografiske anførselstegn/apostrofer
 * der god typografi krever det.
 * Hvis lang er 'en' eller 'en-GB', sikres britisk-engelsk staving automatisk.
 */
export function formatTypography(text: string, lang?: string): string {
  if (!text || typeof text !== 'string') return text;

  let source = text;
  if (lang && (lang === 'en' || lang.startsWith('en-') || lang.startsWith('en_'))) {
    source = toBritishEnglish(source);
  }

  const formatted = applySmartQuotes(source);

  return (
    formatted
      // 0. Eksplisitt hardt mellomrom (non-breaking space) satt av redaktør
      // Støtter tilde (~) mellom ord (typografisk standard, f.eks. "Studio~Tenev" -> "Studio\u00A0Tenev")
      // og "&nbsp;"
      .replace(/(?<=[^\s~])(?:~|\s+~\s+)(?=[^\s~])/g, '\u00A0')
      .replace(/&nbsp;/gi, '\u00A0')
      // 1. Tusenskillere i tall (f.eks. "1 650" -> "1\u00A0650")
      .replace(/(\b\d{1,3}) +(?=\d{3}\b)/g, '$1\u00A0')
      // 2. Tall etterfulgt av måleenhet, prosent eller valuta (f.eks. "1650 m²", "100 kvm", "50 %")
      .replace(
        /(\d) +(m²|m2|m³|m3|kvm|sqm|sq +ft|sqft|cm|mm|km|m|ha|daa|%|‰|kr\.?|NOK|MNOK|EUR|USD|etg\.?|etasjer?|stk\.?)(?![a-zæøåA-ZÆØÅ])/gi,
        (_, num: string, unit: string) => `${num}\u00A0${unit.replace(/ +/g, '\u00A0')}`
      )
      // 3. Datoer og ordenstall (f.eks. "1. november", "2. etasje", "1. premie")
      .replace(
        /(\b\d{1,2}\.) +(januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember|jan\.?|feb\.?|mar\.?|apr\.?|jun\.?|jul\.?|aug\.?|sep\.?|okt\.?|nov\.?|des\.?|etasje|etg\.?|kvartal|plass|premie)\b/gi,
        '$1\u00A0$2'
      )
      // 4. Forkortelser som aldri skal stå igjen alene på slutten av en linje (f.eks. "ca. 200", "nr. 4", "f.eks. ")
      .replace(/\b(f\.?\s*eks|bl\.?\s*a|ca|nr|kl|jf|dvs|kap|fig)\. +(?=\S)/gi, (match) =>
        match.replace(/\s+/g, '\u00A0')
      )
      // 5. Egennavn/gatenavn med stor forbokstav etterfulgt av husnummer/prosjektnummer (1–3 sifre, f.eks. "Fløenbakken 27", "Geilohovda 1")
      .replace(/(\b[A-ZÆØÅ][a-zæøå]{2,}) +(\d{1,3}[A-Za-z]?\b)/g, '$1\u00A0$2')
      // 6. Tankestrek (–) skal aldri brytes til starten av ny linje; lås mellomrommet foran tankestreken
      .replace(/ +([–—]) +/g, '\u00A0$1 ')
      // 7. Korte ord (1–2 bokstaver, f.eks. "og", "i", "på", "av", "til", "om", "en", "et") bindes til neste ord
      // med hardt mellomrom (\u00A0) slik at de aldri blir stående alene på slutten av en linje,
      // men trekkes ned til neste linje dersom det brytes
      .replace(/(?<=(?:^|[\s\u00A0(\[{]))([a-zæøåA-ZÆØÅ]{1,2})\s+(?=\S)/g, '$1\u00A0')
  );
}

/**
 * Rendrer formatert typografi som React-noder med 20 unit tracking (0.02em)
 * på alle sekvenser av 2 eller flere store bokstaver (CAPS/akronymer som PLATÅ, GDPR, MNAL).
 */
export function renderTypography(text?: string | null, lang?: string): React.ReactNode {
  if (!text || typeof text !== 'string') return null;

  const formatted = formatTypography(text, lang);
  const parts = formatted.split(/([A-ZÆØÅ]{2,})/g);
  if (parts.length <= 1) return formatted;

  return parts.map((part, i) => {
    if (/^[A-ZÆØÅ]{2,}$/.test(part)) {
      return React.createElement('span', { key: i, className: 'tracking-[0.02em]' }, part);
    }
    return part;
  });
}

/**
 * Formaterer alle tekst-spans inne i Sanity PortableText-blokker med harde mellomrom
 * og 20 unit tracking (0.02em) på alle sekvenser av 2+ CAPS (f.eks. PLATÅ, GDPR, MNAL).
 */
export function formatPortableText<T extends PortableTextBlock>(blocks?: T[], lang?: string): T[] | undefined {
  if (!Array.isArray(blocks)) return blocks;

  return blocks.map((block) => {
    if (block?._type !== 'block' || !Array.isArray(block.children)) {
      return block;
    }

    const newChildren: any[] = [];

    block.children.forEach((child, childIdx) => {
      if (typeof child?.text === 'string') {
        const formatted = formatTypography(child.text, lang);
        const parts = formatted.split(/([A-ZÆØÅ]{2,})/g);

        if (parts.length > 1) {
          parts.forEach((part, partIdx) => {
            if (!part) return;
            const isCaps = /^[A-ZÆØÅ]{2,}$/.test(part);
            const marks = isCaps
              ? [...(child.marks || []), 'caps']
              : (child.marks || []);
            newChildren.push({
              ...child,
              _key: `${child._key || childIdx}-${partIdx}`,
              text: part,
              marks,
            });
          });
          return;
        }

        newChildren.push({
          ...child,
          text: formatted,
        });
        return;
      }

      newChildren.push(child);
    });

    return {
      ...block,
      children: newChildren,
    };
  });
}

/**
 * Formaterer årstallsintervall etter norske typografiske regler:
 * - Samme århundre: forkortes til to sifre, f.eks. «2024–25», «1994–98»
 * - Ulike århundrer/tusenår: skrives fullt ut, f.eks. «1992–2025»
 * - Samme år: returnerer enkelt årstall, f.eks. «2024»
 * - Kun ett årstall: returnerer kun årstallet uten bindestrek, f.eks. «2026»
 * - Tomt: returnerer tom streng «»
 */
export function formatYearRange(
  start?: number | string | null,
  end?: number | string | null,
  fallbackSingle?: number | string | null
): string {
  const sStr = start ? start.toString().trim() : '';
  const eStr = end ? end.toString().trim() : '';

  if (sStr && eStr) {
    if (sStr === eStr) {
      return sStr;
    }
    // Sjekk om begge er 4-sifrede årstall innenfor samme århundre (f.eks. "2024" og "2025")
    if (sStr.length === 4 && eStr.length === 4) {
      if (sStr.slice(0, 2) === eStr.slice(0, 2)) {
        return `${sStr}–${eStr.slice(-2)}`;
      }
      return `${sStr}–${eStr}`;
    }
    return `${sStr}–${eStr}`;
  }

  if (sStr) return sStr;
  if (eStr) return eStr;
  if (fallbackSingle) return fallbackSingle.toString().trim();
  return '';
}
