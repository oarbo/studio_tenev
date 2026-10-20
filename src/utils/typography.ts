import type { PortableTextBlock } from '@portabletext/types';

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
 */
export function formatTypography(text: string): string {
  if (!text || typeof text !== 'string') return text;

  const formatted = applySmartQuotes(text);

  return (
    formatted
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
  );
}

/**
 * Formaterer alle tekst-spans inne i Sanity PortableText-blokker med harde mellomrom.
 */
export function formatPortableText<T extends PortableTextBlock>(blocks?: T[]): T[] | undefined {
  if (!Array.isArray(blocks)) return blocks;

  return blocks.map((block) => {
    if (block?._type !== 'block' || !Array.isArray(block.children)) {
      return block;
    }

    return {
      ...block,
      children: block.children.map((child) => {
        if (typeof child?.text === 'string') {
          return {
            ...child,
            text: formatTypography(child.text),
          };
        }
        return child;
      }),
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
