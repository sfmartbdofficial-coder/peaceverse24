import { SupportedLanguage } from '../i18n/languages';

const CLIENT_TRANSLATE_CACHE = new Map<string, string>();
const STORAGE_KEY = 'peaceworld_translate_cache_v1';

// Hydrate small cache from localStorage
try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw) as Record<string, string>;
    Object.entries(parsed).forEach(([k, v]) => CLIENT_TRANSLATE_CACHE.set(k, v));
  }
} catch {
  // ignore storage errors
}

function persistCache() {
  try {
    const entries = Array.from(CLIENT_TRANSLATE_CACHE.entries()).slice(-120);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // ignore quota errors
  }
}

/**
 * Heuristic detector for the dominant script of a post
 */
export function detectTextScript(text: string): 'ar' | 'bn' | 'ur' | 'latin' {
  if (!text) return 'latin';
  const arabicMatches = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const bengaliMatches = (text.match(/[\u0980-\u09FF]/g) || []).length;

  // Urdu specific characters (پ چ ژ گ ٹ ڈ ڑ ے ہ)
  const urduSpecific = (text.match(/[\u0679\u067E\u0686\u0688\u0691\u0698\u06AF\u06BA\u06BE\u06C1\u06D2]/g) || []).length;

  if (bengaliMatches >= 3 && bengaliMatches >= arabicMatches) return 'bn';
  if (arabicMatches >= 3) {
    return urduSpecific >= 1 ? 'ur' : 'ar';
  }
  return 'latin';
}

export function shouldAutoTranslate(text: string, targetLang: SupportedLanguage): boolean {
  if (!text || text.trim().length < 4) return false;
  const script = detectTextScript(text);
  if (script === 'ar' && targetLang !== 'ar') return true;
  if (script === 'bn' && targetLang !== 'bn') return true;
  if (script === 'ur' && targetLang !== 'ur') return true;
  // For Latin script, only auto-translate when targetLang is non-English or user triggers
  if (script === 'latin' && !['en'].includes(targetLang)) return true;
  return false;
}

export interface TranslateResult {
  translatedText: string;
  detectedSourceLang: string;
  provider: string;
}

export async function translateText(
  text: string,
  targetLang: SupportedLanguage | string,
  sourceLang: string = 'auto'
): Promise<TranslateResult> {
  const clean = (text || '').trim();
  if (!clean) {
    return { translatedText: '', detectedSourceLang: sourceLang, provider: 'empty' };
  }

  const cacheKey = `${sourceLang}->${targetLang}::${clean}`;
  const cached = CLIENT_TRANSLATE_CACHE.get(cacheKey);
  if (cached) {
    return {
      translatedText: cached,
      detectedSourceLang: sourceLang,
      provider: 'client-cache',
    };
  }

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean, targetLang, sourceLang }),
    });

    if (res.ok) {
      const data = await res.json();
      const translatedText = data.translatedText || clean;
      CLIENT_TRANSLATE_CACHE.set(cacheKey, translatedText);
      persistCache();
      return {
        translatedText,
        detectedSourceLang: data.detectedSourceLang || sourceLang,
        provider: data.provider || 'google-translate',
      };
    }
  } catch {
    // Fallback below
  }

  return {
    translatedText: clean,
    detectedSourceLang: sourceLang,
    provider: 'fallback',
  };
}
