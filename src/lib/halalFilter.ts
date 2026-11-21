/**
 * CONTENT MODERATION FOR PeaceVerse24
 * Rule per owner requirement:
 * - Allow ALL normal/general posts, photos, videos, music, comedy, news, business, family, Islamic, etc.
 * - Strictly BLOCK ONLY explicit XXX / adult / pornography / nudity / sexually indecent text, photos & videos.
 */

export const BLOCK_WORDS = [
  'নগ্ন ছবি',
  'নগ্ন ভিডিও',
  'উলঙ্গ ছবি',
  'উলঙ্গ ভিডিও',
  'উলঙ্গ',
  'পর্ন',
  'পর্নোগ্রাফি',
  'অশ্লীল ছবি',
  'অশ্লীল ভিডিও',
  'যৌন ভিডিও',
  'যৌন ছবি',
  'সেক্স ভিডিও',
  'ব্লু ফিল্ম',
  'এক্স এক্স এক্স',
  'নটি ভিডিও',
  'চটি গল্প',
  'sex video',
  'porn video',
  'pornography',
  'pornhub',
  'xvideos',
  'xnxx',
  'xhamster',
  'redtube',
  'youporn',
  'brazzers',
  'onlyfans',
  'blue film',
  'nude photo',
  'nude video',
  'naked video',
  'hentai',
  'nsfw',
];

const ADULT_EXPLICIT_PATTERNS: RegExp[] = [
  /\bxxx+\b/i,
  /\bxnxx\b/i,
  /\bxvideos\b/i,
  /\bxhamster\b/i,
  /\bporn(?:o|ography|hub|star)?\b/i,
  /\bsex[\s._-]*(?:video|clip|movie|tape|chat|cam)\b/i,
  /\bnude(?:s)?\b/i,
  /\bnaked\b/i,
  /\bhentai\b/i,
  /\berotic(?:a)?\b/i,
  /\bbdsm\b/i,
  /\bonlyfans\b/i,
  /\bblowjob\b/i,
  /\bhandjob\b/i,
  /\bgangbang\b/i,
  /\bmilf\b/i,
  /\bmasturbat(?:e|ion)\b/i,
];

export const ALLOW_ALWAYS = [
  'গান',
  'বাদ্যযন্ত্র',
  'বাউল',
  'লালন',
  'গজল',
  'তেলাওয়াত',
  'ওয়াজ',
  'হারমোনিয়াম',
  'ঢোল',
  'গিটার',
  'পরিবার',
  'ভালোবাসা',
  'দোয়া',
  'দোয়া',
  'শিক্ষণীয় গল্প',
  'ইসলামিক',
  'Alhamdulillah',
  'PeaceVerse24',
  'FirstPost',
  'বন্ধু',
  'গল্প',
  'ছবি',
];

export const ADULT_BLOCK_MESSAGE =
  'দুঃখিত! নোংরা, অশ্লীল, নগ্ন বা XXX ধরনের ছবি ও ভিডিও আপলোড করা সম্পূর্ণ নিষিদ্ধ। বাকি সব স্বাভাবিক পোস্ট করতে পারবেন।';

export interface HalalCheckResult {
  isApproved: boolean;
  status: 'approved' | 'blocked' | 'rejected';
  reason?: string;
  category?: string;
  isQuranVerse?: boolean;
  tag?: string;
  score: number;
}

export function isExplicitAdultText(text: string): boolean {
  const normalizedText = (text || '').toLowerCase();
  if (!normalizedText.trim()) return false;

  if (BLOCK_WORDS.some((phrase) => normalizedText.includes(phrase.toLowerCase()))) {
    return true;
  }
  return ADULT_EXPLICIT_PATTERNS.some((regex) => regex.test(normalizedText));
}

/**
 * Checks post text/caption strictly for explicit adult/XXX content.
 * Everything else is approved.
 */
export function checkPost(text: string): HalalCheckResult {
  if (isExplicitAdultText(text)) {
    return {
      isApproved: false,
      status: 'blocked',
      reason: ADULT_BLOCK_MESSAGE,
      score: 0,
    };
  }

  return {
    isApproved: true,
    status: 'approved',
    score: 100,
  };
}

/**
 * Checks selected file names (and optional caption) instantly on device before reading/uploading.
 */
export function checkMediaFilenamesSafe(
  files: File[],
  extraText = ''
): { safe: boolean; reason?: string } {
  if (extraText && isExplicitAdultText(extraText)) {
    return { safe: false, reason: ADULT_BLOCK_MESSAGE };
  }
  for (const file of files) {
    const cleanName = (file.name || '').replace(/[._-]+/g, ' ');
    if (isExplicitAdultText(cleanName)) {
      return { safe: false, reason: ADULT_BLOCK_MESSAGE };
    }
  }
  return { safe: true };
}

/**
 * Calls server visual safety check (Gemini Vision) when available to detect explicit
 * nudity / XXX / sexually explicit photos or video frames.
 * Fails open if AI key/route is unavailable so legitimate user posts are never stuck.
 */
export async function checkMediaVisualSafety(params: {
  mediaDataUrls?: string[];
  caption?: string;
  fileNames?: string[];
}): Promise<{ safe: boolean; reason?: string }> {
  const joinedMeta = [params.caption || '', ...(params.fileNames || [])]
    .join(' ')
    .replace(/[._-]+/g, ' ');
  if (isExplicitAdultText(joinedMeta)) {
    return { safe: false, reason: ADULT_BLOCK_MESSAGE };
  }

  const samples = (params.mediaDataUrls || [])
    .filter((u) => typeof u === 'string' && u.startsWith('data:image/'))
    .slice(0, 3);

  if (samples.length === 0) {
    return { safe: true };
  }

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 4500);
    const res = await fetch('/api/ai/moderate-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        images: samples,
        caption: params.caption || '',
        fileNames: params.fileNames || [],
      }),
    });
    window.clearTimeout(timer);

    if (!res.ok) return { safe: true };
    const data: any = await res.json().catch(() => null);
    if (data && data.isExplicitAdult === true) {
      return { safe: false, reason: data.reason || ADULT_BLOCK_MESSAGE };
    }
    return { safe: true };
  } catch {
    return { safe: true };
  }
}

// Backward-compatible alias for existing imports
export function checkHalalLocally(
  text: string,
  _mediaType?: string,
  _mediaUrl?: string
): HalalCheckResult {
  return checkPost(text);
}

export async function runHalalContentFilter(
  text: string,
  _mediaType?: string,
  mediaUrl?: string
): Promise<HalalCheckResult> {
  const textCheck = checkPost(text);
  if (!textCheck.isApproved) return textCheck;

  if (mediaUrl && mediaUrl.startsWith('data:image/')) {
    const visual = await checkMediaVisualSafety({ mediaDataUrls: [mediaUrl], caption: text });
    if (!visual.safe) {
      return {
        isApproved: false,
        status: 'blocked',
        reason: visual.reason || ADULT_BLOCK_MESSAGE,
        score: 0,
      };
    }
  }
  return textCheck;
}
