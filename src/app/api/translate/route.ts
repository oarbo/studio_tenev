import { NextResponse } from 'next/server';
import { applySmartQuotes } from '@/utils/typography';
import { toBritishEnglish } from '@/utils/britishEnglish';

async function translateWithGooglePost(text: string, from: string, to: string): Promise<string> {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: from,
    tl: to,
    dt: 't',
    q: text.trim(),
  });

  const res = await fetch('https://translate.googleapis.com/translate_a/single', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    throw new Error(`Google POST upstream returned ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0]
      .map((segment: any) => (Array.isArray(segment) ? segment[0] : ''))
      .filter(Boolean)
      .join('');
  }
  throw new Error('Google POST unexpected format');
}

async function translateWithMyMemory(text: string, from: string, to: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text.trim()
  )}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
    },
  });

  if (!res.ok) {
    throw new Error(`MyMemory upstream returned ${res.status}`);
  }

  const data = await res.json();
  if (data?.responseData?.translatedText) {
    // Decode basic HTML entities if any
    return data.responseData.translatedText
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  }
  throw new Error('MyMemory empty response');
}

async function translateWithGoogleGet(text: string, from: string, to: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=${encodeURIComponent(
    from
  )}&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text.trim())}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });

  if (!res.ok) {
    throw new Error(`Google GET upstream returned ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0]
      .map((segment: any) => (Array.isArray(segment) ? segment[0] : ''))
      .filter(Boolean)
      .join('');
  }
  throw new Error('Google GET unexpected format');
}

async function translateSingleChunk(chunk: string, from: string, to: string): Promise<string> {
  const trimmed = chunk.trim();
  if (!trimmed) return '';

  // 1. Forsøk Google POST (raskest og støtter lengre tekst)
  try {
    return await translateWithGooglePost(trimmed, from, to);
  } catch (err: any) {
    console.warn('Translate provider 1 (Google POST) failed:', err?.message);
  }

  // 2. Fallback til MyMemory (uavhengig motor, aldri rammet av Google 429)
  try {
    return await translateWithMyMemory(trimmed, from, to);
  } catch (err: any) {
    console.warn('Translate provider 2 (MyMemory) failed:', err?.message);
  }

  // 3. Fallback til Google GET Chrome extension client
  try {
    return await translateWithGoogleGet(trimmed, from, to);
  } catch (err: any) {
    console.warn('Translate provider 3 (Google GET) failed:', err?.message);
  }

  throw new Error('Alle oversettelsestjenester var midlertidig utilgjengelige.');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, from = 'no', to = 'en-GB' } = body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json({ translatedText: '' });
    }

    // Del opp i avsnitt dersom teksten inneholder flere blokker
    const paragraphs = text.split(/\n\s*\n/);
    const translatedParagraphs: string[] = [];

    for (const para of paragraphs) {
      if (!para.trim()) {
        translatedParagraphs.push('');
      } else {
        const translated = await translateSingleChunk(para, from, to);
        translatedParagraphs.push(translated);
      }
    }

    let result = translatedParagraphs.join('\n\n');

    // Sikre konsekvent britisk engelsk (British English) ved oversettelse til engelsk
    if (to.toLowerCase().startsWith('en')) {
      result = toBritishEnglish(result);
    }

    result = applySmartQuotes(result);
    return NextResponse.json({ translatedText: result || applySmartQuotes(text) });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Kunne ikke oversette teksten', details: error?.message },
      { status: 500 }
    );
  }
}
