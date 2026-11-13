import { SupportedLanguage } from '../i18n/languages';

export interface GlobalCity {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  lat: number;
  lng: number;
  timezoneOffsetHours: number;
  method?: number;
}

export const GLOBAL_CITIES: GlobalCity[] = [
  { id: 'mecca', city: 'Mecca', country: 'Saudi Arabia', countryCode: 'SA', flag: '🇸🇦', lat: 21.4225, lng: 39.8262, timezoneOffsetHours: 3, method: 4 },
  { id: 'medina', city: 'Medina', country: 'Saudi Arabia', countryCode: 'SA', flag: '🇸🇦', lat: 24.5247, lng: 39.5692, timezoneOffsetHours: 3, method: 4 },
  { id: 'london', city: 'London', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', lat: 51.5074, lng: -0.1278, timezoneOffsetHours: 0, method: 3 },
  { id: 'new-york', city: 'New York', country: 'United States', countryCode: 'US', flag: '🇺🇸', lat: 40.7128, lng: -74.006, timezoneOffsetHours: -5, method: 2 },
  { id: 'dhaka', city: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', flag: '🇧🇩', lat: 23.8103, lng: 90.4125, timezoneOffsetHours: 6, method: 1 },
  { id: 'istanbul', city: 'Istanbul', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', lat: 41.0082, lng: 28.9784, timezoneOffsetHours: 3, method: 13 },
  { id: 'jakarta', city: 'Jakarta', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', lat: -6.2088, lng: 106.8456, timezoneOffsetHours: 7, method: 20 },
  { id: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', flag: '🇲🇾', lat: 3.139, lng: 101.6869, timezoneOffsetHours: 8, method: 17 },
  { id: 'paris', city: 'Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', lat: 48.8566, lng: 2.3522, timezoneOffsetHours: 1, method: 12 },
  { id: 'dubai', city: 'Dubai', country: 'UAE', countryCode: 'AE', flag: '🇦🇪', lat: 25.2048, lng: 55.2708, timezoneOffsetHours: 4, method: 16 },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', countryCode: 'EG', flag: '🇪🇬', lat: 30.0444, lng: 31.2357, timezoneOffsetHours: 2, method: 5 },
  { id: 'karachi', city: 'Karachi', country: 'Pakistan', countryCode: 'PK', flag: '🇵🇰', lat: 24.8607, lng: 67.0011, timezoneOffsetHours: 5, method: 1 },
  { id: 'toronto', city: 'Toronto', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', lat: 43.6532, lng: -79.3832, timezoneOffsetHours: -5, method: 2 },
];

export interface PrayerSchedule {
  city: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  hijriDate: string;
  gregorianDate: string;
  times: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  nextPrayer: {
    name: string;
    time: string;
    remainingText: string;
  };
  source: 'aladhan' | 'calculated';
}

const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

/**
 * Great-circle Qibla bearing in degrees clockwise from True North (0..360)
 */
export function calculateQiblaBearing(lat: number, lng: number): number {
  const phiK = (KAABA_LAT * Math.PI) / 180;
  const lambdaK = (KAABA_LNG * Math.PI) / 180;
  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;

  const y = Math.sin(lambdaK - lambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
  let deg = (Math.atan2(y, x) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return Math.round(deg * 10) / 10;
}

export function getCompassCardinal(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const idx = Math.round(deg / 22.5) % 16;
  return dirs[idx];
}

/**
 * Distance to Kaaba in kilometers (Haversine)
 */
export function calculateDistanceToKaabaKm(lat: number, lng: number): number {
  const R = 6371;
  const dLat = ((KAABA_LAT - lat) * Math.PI) / 180;
  const dLng = ((KAABA_LNG - lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatMinutesToHHMM(totalMinutes: number): string {
  let mins = Math.round(totalMinutes) % 1440;
  if (mins < 0) mins += 1440;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Offline astronomical prayer times calculator fallback
 */
function calculateFallbackPrayerTimes(city: GlobalCity): PrayerSchedule['times'] {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  // Solar declination & equation of time approximation
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1);
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma);

  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));

  const latRad = (city.lat * Math.PI) / 180;
  const solarNoonMin = 720 - 4 * city.lng - eqTime + city.timezoneOffsetHours * 60;

  const hourAngleForElevation = (angleDeg: number): number => {
    const rad = (angleDeg * Math.PI) / 180;
    const cosH = (Math.sin(rad) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
    const clamped = Math.max(-0.98, Math.min(0.98, cosH));
    return (Math.acos(clamped) * 180) / Math.PI * 4;
  };

  const sunriseDiff = hourAngleForElevation(-0.833);
  const fajrDiff = hourAngleForElevation(-18);
  const ishaDiff = hourAngleForElevation(-17);
  const asrAngle = (Math.atan(1 / (1 + Math.tan(Math.abs(latRad - decl)))) * 180) / Math.PI;
  const asrDiff = hourAngleForElevation(asrAngle);

  return {
    Fajr: formatMinutesToHHMM(solarNoonMin - fajrDiff),
    Sunrise: formatMinutesToHHMM(solarNoonMin - sunriseDiff),
    Dhuhr: formatMinutesToHHMM(solarNoonMin + 2),
    Asr: formatMinutesToHHMM(solarNoonMin + asrDiff),
    Maghrib: formatMinutesToHHMM(solarNoonMin + sunriseDiff + 2),
    Isha: formatMinutesToHHMM(solarNoonMin + ishaDiff),
  };
}

export function computeNextPrayer(times: PrayerSchedule['times']): PrayerSchedule['nextPrayer'] {
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const order: Array<keyof PrayerSchedule['times']> = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (const name of order) {
    const raw = (times[name] || '12:00').split(' ')[0];
    const [hh, mm] = raw.split(':').map((n) => parseInt(n, 10));
    if (!Number.isNaN(hh) && !Number.isNaN(mm)) {
      const targetMins = hh * 60 + mm;
      if (targetMins > nowMins) {
        const diff = targetMins - nowMins;
        const hrs = Math.floor(diff / 60);
        const mins = diff % 60;
        return {
          name,
          time: raw,
          remainingText: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`,
        };
      }
    }
  }

  // Next is tomorrow's Fajr
  const rawFajr = (times.Fajr || '05:00').split(' ')[0];
  const [fh, fm] = rawFajr.split(':').map((n) => parseInt(n, 10));
  const fajrMins = (fh || 5) * 60 + (fm || 0) + 1440;
  const diff = fajrMins - nowMins;
  return {
    name: 'Fajr',
    time: rawFajr,
    remainingText: `${Math.floor(diff / 60)}h ${diff % 60}m`,
  };
}

/**
 * Detect user city automatically via timezone, browser geolocation, or IP lookup
 */
export async function detectUserGlobalCity(): Promise<GlobalCity> {
  // 1. Check saved city preference
  try {
    const savedId = localStorage.getItem('peaceworld_selected_city');
    if (savedId) {
      const found = GLOBAL_CITIES.find((c) => c.id === savedId);
      if (found) return found;
    }
  } catch {}

  // 2. Timezone fast mapping
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Riyadh')) return GLOBAL_CITIES[0];
    if (tz.includes('London')) return GLOBAL_CITIES[2];
    if (tz.includes('New_York') || tz.includes('America/')) return GLOBAL_CITIES[3];
    if (tz.includes('Dhaka')) return GLOBAL_CITIES[4];
    if (tz.includes('Istanbul')) return GLOBAL_CITIES[5];
    if (tz.includes('Jakarta')) return GLOBAL_CITIES[6];
    if (tz.includes('Kuala_Lumpur')) return GLOBAL_CITIES[7];
    if (tz.includes('Paris')) return GLOBAL_CITIES[8];
    if (tz.includes('Dubai')) return GLOBAL_CITIES[9];
    if (tz.includes('Cairo')) return GLOBAL_CITIES[10];
    if (tz.includes('Karachi')) return GLOBAL_CITIES[11];
    if (tz.includes('Toronto')) return GLOBAL_CITIES[12];
  } catch {}

  // 3. IP Geolocation fallback
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
    clearTimeout(tid);
    if (res.ok) {
      const data = await res.json();
      if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
        return {
          id: 'auto-ip',
          city: data.cityName || data.countryName || 'Global City',
          country: data.countryName || 'Worldwide',
          countryCode: (data.countryCode || 'UN').toUpperCase(),
          flag: '📍',
          lat: data.latitude,
          lng: data.longitude,
          timezoneOffsetHours: Math.round(data.longitude / 15),
          method: 3,
        };
      }
    }
  } catch {}

  return GLOBAL_CITIES[0]; // Default Mecca
}

const PRAYER_CACHE_KEY = 'peaceverse_cached_prayer_times';

function savePrayerCache(schedule: PrayerSchedule) {
  try {
    const todayKey = new Date().toISOString().slice(0, 10);
    localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify({ date: todayKey, schedule }));
  } catch {
    // ignore storage quota errors
  }
}

function getFallbackCitySync(): GlobalCity {
  try {
    const savedId = localStorage.getItem('peaceworld_selected_city');
    if (savedId) {
      const found = GLOBAL_CITIES.find((c) => c.id === savedId);
      if (found) return found;
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Riyadh')) return GLOBAL_CITIES[0];
    if (tz.includes('London')) return GLOBAL_CITIES[2];
    if (tz.includes('New_York') || tz.includes('America/')) return GLOBAL_CITIES[3];
    if (tz.includes('Dhaka')) return GLOBAL_CITIES[4];
    if (tz.includes('Istanbul')) return GLOBAL_CITIES[5];
    if (tz.includes('Jakarta')) return GLOBAL_CITIES[6];
    if (tz.includes('Kuala_Lumpur')) return GLOBAL_CITIES[7];
    if (tz.includes('Paris')) return GLOBAL_CITIES[8];
    if (tz.includes('Dubai')) return GLOBAL_CITIES[9];
    if (tz.includes('Cairo')) return GLOBAL_CITIES[10];
    if (tz.includes('Karachi')) return GLOBAL_CITIES[11];
    if (tz.includes('Toronto')) return GLOBAL_CITIES[12];
  } catch {}
  return GLOBAL_CITIES[4]; // Dhaka / default
}

export function getCachedOrFallbackPrayerSchedule(): PrayerSchedule {
  const todayKey = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(PRAYER_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.date === todayKey && parsed?.schedule?.times) {
        return parsed.schedule as PrayerSchedule;
      }
    }
  } catch {}

  const city = getFallbackCitySync();
  const times = calculateFallbackPrayerTimes(city);
  const cleanDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const fallback: PrayerSchedule = {
    city: city.city,
    country: city.country,
    flag: city.flag,
    lat: city.lat,
    lng: city.lng,
    hijriDate: 'Global Hijri Calendar',
    gregorianDate: cleanDate,
    times,
    nextPrayer: computeNextPrayer(times),
    source: 'calculated',
  };
  savePrayerCache(fallback);
  return fallback;
}

/**
 * Checks whether the current local clock time falls within [prayerStart, prayerStart + pauseMinutes)
 * for any of the 5 obligatory prayers (Fajr, Dhuhr, Asr, Maghrib, Isha).
 */
export function getActivePrayerPauseStatus(pauseMinutes: number = 15): {
  paused: boolean;
  prayerName: string | null;
  untilTime: string | null;
  schedule: PrayerSchedule;
} {
  const schedule = getCachedOrFallbackPrayerSchedule();
  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const windowLen = Math.max(5, Math.min(60, pauseMinutes || 15));
  const prayers: Array<keyof PrayerSchedule['times']> = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  for (const name of prayers) {
    const raw = (schedule.times[name] || '').split(' ')[0];
    const [hh, mm] = raw.split(':').map((n) => parseInt(n, 10));
    if (Number.isNaN(hh) || Number.isNaN(mm)) continue;
    const startMins = hh * 60 + mm;
    const endMins = startMins + windowLen;
    if (nowMins >= startMins && nowMins < endMins) {
      return {
        paused: true,
        prayerName: name,
        untilTime: formatMinutesToHHMM(endMins),
        schedule,
      };
    }
  }

  return {
    paused: false,
    prayerName: null,
    untilTime: null,
    schedule,
  };
}

export async function fetchPrayerTimesForCity(city: GlobalCity): Promise<PrayerSchedule> {
  const cleanDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 4500);
    const method = city.method ?? 3;
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${city.lat}&longitude=${city.lng}&method=${method}`,
      { signal: controller.signal }
    );
    clearTimeout(tid);

    if (res.ok) {
      const json = await res.json();
      const t = json?.data?.timings;
      const hijri = json?.data?.date?.hijri;
      if (t) {
        const times = {
          Fajr: String(t.Fajr).split(' ')[0],
          Sunrise: String(t.Sunrise).split(' ')[0],
          Dhuhr: String(t.Dhuhr).split(' ')[0],
          Asr: String(t.Asr).split(' ')[0],
          Maghrib: String(t.Maghrib).split(' ')[0],
          Isha: String(t.Isha).split(' ')[0],
        };
        const schedule: PrayerSchedule = {
          city: city.city,
          country: city.country,
          flag: city.flag,
          lat: city.lat,
          lng: city.lng,
          hijriDate: hijri ? `${hijri.day} ${hijri.month?.en || ''} ${hijri.year} AH` : 'Islamic Hijri Calendar',
          gregorianDate: cleanDate,
          times,
          nextPrayer: computeNextPrayer(times),
          source: 'aladhan',
        };
        savePrayerCache(schedule);
        return schedule;
      }
    }
  } catch {
    // Fallback to offline solar calculation
  }

  const times = calculateFallbackPrayerTimes(city);
  const fallbackSchedule: PrayerSchedule = {
    city: city.city,
    country: city.country,
    flag: city.flag,
    lat: city.lat,
    lng: city.lng,
    hijriDate: 'Global Hijri Calendar',
    gregorianDate: cleanDate,
    times,
    nextPrayer: computeNextPrayer(times),
    source: 'calculated',
  };
  savePrayerCache(fallbackSchedule);
  return fallbackSchedule;
}

export interface DailyVerse {
  surahRef: string;
  arabic: string;
  translations: Record<'en' | 'bn' | 'ar' | 'ur' | 'tr' | 'fr', string>;
}

export const DAILY_QURAN_VERSES: DailyVerse[] = [
  {
    surahRef: 'Surah Ar-Ra’d 13:28',
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translations: {
      en: 'Unquestionably, by the remembrance of Allah hearts are assured.',
      bn: 'জেনে রাখো, আল্লাহর জিকিরেই অন্তরসমূহ প্রশান্তি লাভ করে।',
      ar: 'تفسير: بذكر الله وطاعته تسكن قلوب المؤمنين وتطمئن.',
      ur: 'جان لو کہ اللہ کے ذکر ہی سے دلوں کو اطمینان نصیب ہوتا ہے۔',
      tr: 'Bilesiniz ki, kalpler ancak Allah’ı anmakla huzur bulur.',
      fr: "N'est-ce point par l'évocation d'Allah que se tranquillisent les cœurs ?",
    },
  },
  {
    surahRef: 'Surah Ash-Sharh 94:5-6',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translations: {
      en: 'For indeed, with hardship will be ease. Indeed, with hardship will be ease.',
      bn: 'নিশ্চয়ই কষ্টের সাথেই স্বস্তি রয়েছে। অবশ্যই কষ্টের সাথেই স্বস্তি রয়েছে।',
      ar: 'إن مع الضيق والشدة فرجاً ويسراً قريباً من الله.',
      ur: 'بے شک مشکل کے ساتھ آسانی ہے۔ بے شک ہر مشکل کے ساتھ آسانی ہے۔',
      tr: 'Şüphesiz güçlükle beraber bir kolaylık vardır. Gerçekten, güçlükle beraber bir kolaylık vardır.',
      fr: 'À côté de la difficulté est, certes, une facilité ! Oui, à côté de la difficulté est une facilité.',
    },
  },
  {
    surahRef: 'Surah Al-Baqarah 2:152',
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    translations: {
      en: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
      bn: 'সুতরাং তোমরা আমাকে স্মরণ করো, আমিও তোমাদের স্মরণ করবো। এবং আমার কৃতজ্ঞতা প্রকাশ করো।',
      ar: 'اذكروني بالطاعة والدعاء أذكركم بالرحمة والمغفرة.',
      ur: 'پس تم مجھے یاد رکھو، میں تمہیں یاد رکھوں گا اور میرا شکر ادا کرو۔',
      tr: 'Öyleyse siz beni anın ki ben de sizi anayım. Bana şükredin, sakın nankörlük etmeyin.',
      fr: 'Souvenez-vous de Moi donc, Je vous récompenserai. Remerciez-Moi et ne soyez pas ingrats.',
    },
  },
  {
    surahRef: 'Surah Al-Hujurat 49:10',
    arabic: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ فَأَصْلِحُوا بَيْنَ أَخَوَيْكُمْ',
    translations: {
      en: 'The believers are but brothers, so make settlement between your brothers.',
      bn: 'নিশ্চয়ই মুমিনগণ পরস্পর ভাই ভাই; কাজেই তোমরা তোমাদের ভাইদের মধ্যে মীমাংসা করে দাও।',
      ar: 'المؤمنون في مشارق الأرض ومغاربها إخوة في الدين، فأصلحوا ذات بينكم.',
      ur: 'بے شک تمام مسلمان آپس میں بھائی بھائی ہیں، پس اپنے بھائیوں کے درمیان صلح کراؤ۔',
      tr: 'Müminler ancak kardeştirler. Öyleyse iki kardeşinizin arasını düzeltin.',
      fr: 'Les croyants ne sont que des frères. Établissez la concorde entre vos frères.',
    },
  },
];

export function getDailyQuranVerse(lang: SupportedLanguage): { surahRef: string; arabic: string; localized: string } {
  const dayIdx = Math.floor(Date.now() / 86400000) % DAILY_QURAN_VERSES.length;
  const verse = DAILY_QURAN_VERSES[dayIdx];
  const key = (['en', 'bn', 'ar', 'ur', 'tr', 'fr'].includes(lang) ? lang : 'en') as keyof DailyVerse['translations'];
  return {
    surahRef: verse.surahRef,
    arabic: verse.arabic,
    localized: verse.translations[key] || verse.translations.en,
  };
}
