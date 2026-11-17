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
  school?: 0 | 1; // 0 = Shafi/Standard, 1 = Hanafi (Bangladesh, Pakistan, India, Türkiye)
}

export const GLOBAL_CITIES: GlobalCity[] = [
  { id: 'mecca', city: 'Mecca', country: 'Saudi Arabia', countryCode: 'SA', flag: '🇸🇦', lat: 21.4225, lng: 39.8262, timezoneOffsetHours: 3, method: 4, school: 0 },
  { id: 'medina', city: 'Medina', country: 'Saudi Arabia', countryCode: 'SA', flag: '🇸🇦', lat: 24.5247, lng: 39.5692, timezoneOffsetHours: 3, method: 4, school: 0 },
  { id: 'dhaka', city: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', flag: '🇧🇩', lat: 23.8103, lng: 90.4125, timezoneOffsetHours: 6, method: 1, school: 1 },
  { id: 'chattogram', city: 'Chattogram', country: 'Bangladesh', countryCode: 'BD', flag: '🇧🇩', lat: 22.3569, lng: 91.7832, timezoneOffsetHours: 6, method: 1, school: 1 },
  { id: 'sylhet', city: 'Sylhet', country: 'Bangladesh', countryCode: 'BD', flag: '🇧🇩', lat: 24.8949, lng: 91.8687, timezoneOffsetHours: 6, method: 1, school: 1 },
  { id: 'rajshahi', city: 'Rajshahi', country: 'Bangladesh', countryCode: 'BD', flag: '🇧🇩', lat: 24.3745, lng: 88.6042, timezoneOffsetHours: 6, method: 1, school: 1 },
  { id: 'khulna', city: 'Khulna', country: 'Bangladesh', countryCode: 'BD', flag: '🇧🇩', lat: 22.8456, lng: 89.5403, timezoneOffsetHours: 6, method: 1, school: 1 },
  { id: 'kolkata', city: 'Kolkata', country: 'India', countryCode: 'IN', flag: '🇮🇳', lat: 22.5726, lng: 88.3639, timezoneOffsetHours: 5.5, method: 1, school: 1 },
  { id: 'new-delhi', city: 'New Delhi', country: 'India', countryCode: 'IN', flag: '🇮🇳', lat: 28.6139, lng: 77.209, timezoneOffsetHours: 5.5, method: 1, school: 1 },
  { id: 'mumbai', city: 'Mumbai', country: 'India', countryCode: 'IN', flag: '🇮🇳', lat: 19.076, lng: 72.8777, timezoneOffsetHours: 5.5, method: 1, school: 1 },
  { id: 'hyderabad', city: 'Hyderabad', country: 'India', countryCode: 'IN', flag: '🇮🇳', lat: 17.385, lng: 78.4867, timezoneOffsetHours: 5.5, method: 1, school: 1 },
  { id: 'london', city: 'London', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧', lat: 51.5074, lng: -0.1278, timezoneOffsetHours: 0, method: 3, school: 0 },
  { id: 'new-york', city: 'New York', country: 'United States', countryCode: 'US', flag: '🇺🇸', lat: 40.7128, lng: -74.006, timezoneOffsetHours: -5, method: 2, school: 0 },
  { id: 'istanbul', city: 'Istanbul', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', lat: 41.0082, lng: 28.9784, timezoneOffsetHours: 3, method: 13, school: 1 },
  { id: 'jakarta', city: 'Jakarta', country: 'Indonesia', countryCode: 'ID', flag: '🇮🇩', lat: -6.2088, lng: 106.8456, timezoneOffsetHours: 7, method: 20, school: 0 },
  { id: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', flag: '🇲🇾', lat: 3.139, lng: 101.6869, timezoneOffsetHours: 8, method: 17, school: 0 },
  { id: 'paris', city: 'Paris', country: 'France', countryCode: 'FR', flag: '🇫🇷', lat: 48.8566, lng: 2.3522, timezoneOffsetHours: 1, method: 12, school: 0 },
  { id: 'dubai', city: 'Dubai', country: 'UAE', countryCode: 'AE', flag: '🇦🇪', lat: 25.2048, lng: 55.2708, timezoneOffsetHours: 4, method: 16, school: 0 },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', countryCode: 'EG', flag: '🇪🇬', lat: 30.0444, lng: 31.2357, timezoneOffsetHours: 2, method: 5, school: 0 },
  { id: 'karachi', city: 'Karachi', country: 'Pakistan', countryCode: 'PK', flag: '🇵🇰', lat: 24.8607, lng: 67.0011, timezoneOffsetHours: 5, method: 1, school: 1 },
  { id: 'toronto', city: 'Toronto', country: 'Canada', countryCode: 'CA', flag: '🇨🇦', lat: 43.6532, lng: -79.3832, timezoneOffsetHours: -5, method: 2, school: 0 },
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

export function formatPrayerTime12h(hhmm: string): string {
  const clean = String(hhmm || '').split(' ')[0].trim();
  const [hhStr, mmStr] = clean.split(':');
  const hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return clean;
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour12}:${String(mm).padStart(2, '0')} ${period}`;
}

export function inferSchoolForRegion(countryCode?: string, tz?: string): 0 | 1 {
  const cc = (countryCode || '').toUpperCase();
  if (['BD', 'PK', 'IN', 'AF', 'TR', 'UZ', 'KZ', 'TJ', 'KG'].includes(cc)) return 1;
  const zone = tz || '';
  if (
    zone.includes('Dhaka') ||
    zone.includes('Karachi') ||
    zone.includes('Kolkata') ||
    zone.includes('Calcutta') ||
    zone.includes('Kabul') ||
    zone.includes('Istanbul')
  ) {
    return 1;
  }
  return 0;
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

  const eqTime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));

  const latRad = (city.lat * Math.PI) / 180;
  const solarNoonMin = 720 - 4 * city.lng - eqTime + city.timezoneOffsetHours * 60;

  const hourAngleForElevation = (angleDeg: number): number => {
    const rad = (angleDeg * Math.PI) / 180;
    const cosH = (Math.sin(rad) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));
    const clamped = Math.max(-0.98, Math.min(0.98, cosH));
    return ((Math.acos(clamped) * 180) / Math.PI) * 4;
  };

  const method = city.method ?? 1;
  const fajrAngle = method === 2 ? -15 : method === 4 ? -18.5 : method === 5 ? -19.5 : -18;
  const ishaAngle = method === 2 ? -15 : method === 1 ? -18 : method === 5 ? -17.5 : -17;

  const sunriseDiff = hourAngleForElevation(-0.833);
  const fajrDiff = hourAngleForElevation(fajrAngle);
  const ishaDiff = hourAngleForElevation(ishaAngle);
  const shadowFactor = (city.school ?? inferSchoolForRegion(city.countryCode)) === 1 ? 2 : 1;
  const asrAngle = (Math.atan(1 / (shadowFactor + Math.tan(Math.abs(latRad - decl)))) * 180) / Math.PI;
  const asrDiff = hourAngleForElevation(asrAngle);

  const maghribMin = solarNoonMin + sunriseDiff + 2;
  const ishaMin = method === 4 ? maghribMin + 90 : solarNoonMin + ishaDiff;

  return {
    Fajr: formatMinutesToHHMM(solarNoonMin - fajrDiff),
    Sunrise: formatMinutesToHHMM(solarNoonMin - sunriseDiff),
    Dhuhr: formatMinutesToHHMM(solarNoonMin + 2),
    Asr: formatMinutesToHHMM(solarNoonMin + asrDiff),
    Maghrib: formatMinutesToHHMM(maghribMin),
    Isha: formatMinutesToHHMM(ishaMin),
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

function getCityById(id: string): GlobalCity {
  return GLOBAL_CITIES.find((c) => c.id === id) || GLOBAL_CITIES[2];
}

function getCountryFlagEmoji(countryCode: string): string {
  const cc = (countryCode || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return '📍';
  return String.fromCodePoint(127397 + cc.charCodeAt(0), 127397 + cc.charCodeAt(1));
}

function inferMethodForRegion(countryCode: string): number {
  const cc = (countryCode || '').toUpperCase();
  if (['BD', 'PK', 'IN', 'AF'].includes(cc)) return 1; // Karachi / Islamic Foundation
  if (['US', 'CA'].includes(cc)) return 2; // ISNA
  if (['SA'].includes(cc)) return 4; // Umm al-Qura
  if (['EG'].includes(cc)) return 5; // Egypt
  if (['TR'].includes(cc)) return 13; // Diyanet
  if (['AE'].includes(cc)) return 16; // Dubai
  if (['MY'].includes(cc)) return 17; // JAKIM
  if (['ID'].includes(cc)) return 20; // Kemenag
  if (['FR'].includes(cc)) return 12; // UOIF
  return 3; // Muslim World League
}

/**
 * Detect user city automatically via saved preference, granted GPS, multi-provider IP city lookup, or timezone
 */
export async function detectUserGlobalCity(): Promise<GlobalCity> {
  // 1. Check saved user selection (including custom GPS city)
  try {
    const savedCustom = localStorage.getItem('peaceworld_custom_city');
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return parsed as GlobalCity;
      }
    }
    const savedId = localStorage.getItem('peaceworld_selected_city');
    if (savedId) {
      const found = GLOBAL_CITIES.find((c) => c.id === savedId);
      if (found) return found;
    }
  } catch {}

  const tz = (() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch {
      return '';
    }
  })();
  const exactTzOffsetHours = -new Date().getTimezoneOffset() / 60;

  // 2. If browser GPS permission is already granted, use exact GPS coordinates silently (no intrusive prompt)
  try {
    if (navigator.geolocation && navigator.permissions?.query) {
      const perm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      if (perm.state === 'granted') {
        const gpsPos = await new Promise<GeolocationPosition | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve(p),
            () => resolve(null),
            { timeout: 3000, maximumAge: 600000 }
          );
        });
        if (gpsPos) {
          const school = inferSchoolForRegion(undefined, tz);
          return {
            id: 'gps-auto',
            city: 'My Location',
            country: 'Exact GPS',
            countryCode: 'GPS',
            flag: '📍',
            lat: Math.round(gpsPos.coords.latitude * 10000) / 10000,
            lng: Math.round(gpsPos.coords.longitude * 10000) / 10000,
            timezoneOffsetHours: exactTzOffsetHours,
            method: school === 1 ? 1 : 3,
            school,
          };
        }
      }
    }
  } catch {}

  // 3. IP Geolocation (pinpoints exact city globally: e.g. Chattogram vs Dhaka, Kolkata vs Delhi, London, etc.)
  const tryIpGeo = async (): Promise<GlobalCity | null> => {
    try {
      const c1 = new AbortController();
      const t1 = setTimeout(() => c1.abort(), 3000);
      const r1 = await fetch('https://ipwho.is/', { signal: c1.signal });
      clearTimeout(t1);
      if (r1.ok) {
        const d1 = await r1.json();
        if (d1?.success !== false && typeof d1.latitude === 'number' && typeof d1.longitude === 'number') {
          const cc = String(d1.country_code || 'UN').toUpperCase();
          return {
            id: 'auto-ip',
            city: String(d1.city || d1.region || d1.country || 'Local City'),
            country: String(d1.country || 'Worldwide'),
            countryCode: cc,
            flag: getCountryFlagEmoji(cc),
            lat: d1.latitude,
            lng: d1.longitude,
            timezoneOffsetHours: exactTzOffsetHours,
            method: inferMethodForRegion(cc),
            school: inferSchoolForRegion(cc, tz),
          };
        }
      }
    } catch {}

    try {
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 3000);
      const r2 = await fetch('https://freeipapi.com/api/json', { signal: c2.signal });
      clearTimeout(t2);
      if (r2.ok) {
        const d2 = await r2.json();
        if (typeof d2.latitude === 'number' && typeof d2.longitude === 'number') {
          const cc = String(d2.countryCode || 'UN').toUpperCase();
          return {
            id: 'auto-ip',
            city: String(d2.cityName || d2.countryName || 'Local City'),
            country: String(d2.countryName || 'Worldwide'),
            countryCode: cc,
            flag: getCountryFlagEmoji(cc),
            lat: d2.latitude,
            lng: d2.longitude,
            timezoneOffsetHours: exactTzOffsetHours,
            method: inferMethodForRegion(cc),
            school: inferSchoolForRegion(cc, tz),
          };
        }
      }
    } catch {}

    return null;
  };

  const ipCity = await tryIpGeo();
  if (ipCity) return ipCity;

  // 4. Timezone fallback if offline or IP lookup blocked
  if (tz.includes('Riyadh')) return getCityById('mecca');
  if (tz.includes('London')) return getCityById('london');
  if (tz.includes('Toronto')) return getCityById('toronto');
  if (tz.includes('New_York') || tz.includes('America/')) return getCityById('new-york');
  if (tz.includes('Dhaka')) return getCityById('dhaka');
  if (tz.includes('Kolkata') || tz.includes('Calcutta')) return getCityById('kolkata');
  if (tz.includes('Istanbul')) return getCityById('istanbul');
  if (tz.includes('Jakarta')) return getCityById('jakarta');
  if (tz.includes('Kuala_Lumpur')) return getCityById('kuala-lumpur');
  if (tz.includes('Paris')) return getCityById('paris');
  if (tz.includes('Dubai')) return getCityById('dubai');
  if (tz.includes('Cairo')) return getCityById('cairo');
  if (tz.includes('Karachi')) return getCityById('karachi');

  return getCityById('dhaka');
}

const PRAYER_CACHE_KEY = 'peaceverse_cached_prayer_times_v2';

function getLocalDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function savePrayerCache(schedule: PrayerSchedule) {
  try {
    const todayKey = getLocalDateKey();
    localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify({ date: todayKey, schedule }));
  } catch {
    // ignore storage quota errors
  }
}

function getFallbackCitySync(): GlobalCity {
  try {
    const savedCustom = localStorage.getItem('peaceworld_custom_city');
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
        return parsed as GlobalCity;
      }
    }
    const savedId = localStorage.getItem('peaceworld_selected_city');
    if (savedId) {
      const found = GLOBAL_CITIES.find((c) => c.id === savedId);
      if (found) return found;
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Riyadh')) return getCityById('mecca');
    if (tz.includes('London')) return getCityById('london');
    if (tz.includes('Toronto')) return getCityById('toronto');
    if (tz.includes('New_York') || tz.includes('America/')) return getCityById('new-york');
    if (tz.includes('Dhaka')) return getCityById('dhaka');
    if (tz.includes('Kolkata') || tz.includes('Calcutta')) return getCityById('kolkata');
    if (tz.includes('Istanbul')) return getCityById('istanbul');
    if (tz.includes('Jakarta')) return getCityById('jakarta');
    if (tz.includes('Kuala_Lumpur')) return getCityById('kuala-lumpur');
    if (tz.includes('Paris')) return getCityById('paris');
    if (tz.includes('Dubai')) return getCityById('dubai');
    if (tz.includes('Cairo')) return getCityById('cairo');
    if (tz.includes('Karachi')) return getCityById('karachi');
  } catch {}
  return getCityById('dhaka');
}

export function getCachedOrFallbackPrayerSchedule(): PrayerSchedule {
  const todayKey = getLocalDateKey();
  const city = getFallbackCitySync();
  try {
    const raw = localStorage.getItem(PRAYER_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed?.date === todayKey &&
        parsed?.schedule?.times &&
        parsed?.schedule?.city === city.city
      ) {
        const cached = parsed.schedule as PrayerSchedule;
        return {
          ...cached,
          nextPrayer: computeNextPrayer(cached.times),
        };
      }
    }
  } catch {}

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
    const method = city.method ?? 1;
    const school = city.school ?? inferSchoolForRegion(city.countryCode);
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${city.lat}&longitude=${city.lng}&method=${method}&school=${school}`,
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
