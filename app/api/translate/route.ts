import { NextRequest, NextResponse } from 'next/server';

// Server-side cache across requests to save API calls
const translationCache = new Map<string, string>();

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function translateSingleText(text: string, from: string, to: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return text;

  const cacheKey = `${from}_${to}_${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=${from}|${to}&de=contact@lien-bio.site`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Lien-Bio-Translation/1.0',
      },
      next: { revalidate: 86400 }, // Cache on Next.js server for 24h
    });

    if (!res.ok) {
      return text;
    }

    const data = await res.json();
    if (data?.responseData?.translatedText) {
      const translated = decodeHtmlEntities(data.responseData.translatedText).trim();
      if (!translated.toUpperCase().includes('MYMEMORY WARNING:')) {
        translationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch (error) {
    console.error('Translation fetch error:', error);
  }

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { texts, from = 'fr', to = 'en' } = body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ translations: {} });
    }

    const itemsToTranslate = texts.slice(0, 30);
    const results: Record<string, string> = {};

    await Promise.all(
      itemsToTranslate.map(async (str) => {
        if (!str || typeof str !== 'string' || !str.trim()) return;
        const translated = await translateSingleText(str, from, to);
        results[str] = translated;
      })
    );

    return NextResponse.json({ translations: results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error translating' }, { status: 500 });
  }
}
