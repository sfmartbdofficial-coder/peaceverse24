// Privacy masking, Screen-Time tracking & Halal Deeds Log utilities

export function isSyntheticPhoneEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith('@phone.peaceverse.app');
}

export function maskEmailAddress(email?: string | null, maskPersonal = true): string {
  if (!email) return '';
  const trimmed = email.trim();
  if (!trimmed) return '';

  // Strictly mask synthetic phone-generated emails everywhere by default
  if (isSyntheticPhoneEmail(trimmed)) {
    return '***@***.app';
  }

  if (!maskPersonal) return trimmed;

  const atIdx = trimmed.indexOf('@');
  if (atIdx <= 0) return '***';

  const local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx + 1);
  const dotIdx = domain.lastIndexOf('.');
  const tld = dotIdx > -1 ? domain.slice(dotIdx) : '';
  const domainName = dotIdx > -1 ? domain.slice(0, dotIdx) : domain;

  const maskedLocal = local.length <= 2 ? `${local[0] || '*'}***` : `${local.slice(0, 2)}***`;
  const maskedDomain = domainName.length <= 1 ? '***' : `${domainName[0]}***`;
  return `${maskedLocal}@${maskedDomain}${tld}`;
}

// Track active app screen time per calendar day in localStorage
const SCREEN_TIME_KEY = 'peaceverse_screen_time_v1';

interface ScreenTimeStore {
  days: Record<string, number>; // YYYY-MM-DD -> total seconds
}

function getTodayDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function tickScreenTimeSeconds(deltaSeconds = 15): number {
  try {
    const raw = localStorage.getItem(SCREEN_TIME_KEY);
    const parsed: ScreenTimeStore = raw ? JSON.parse(raw) : { days: {} };
    const days = parsed && typeof parsed.days === 'object' ? { ...parsed.days } : {};
    const key = getTodayDateKey();
    days[key] = (Number(days[key]) || 0) + deltaSeconds;

    // Keep only last 14 days
    const sortedKeys = Object.keys(days).sort().slice(-14);
    const trimmed: Record<string, number> = {};
    sortedKeys.forEach((k) => {
      trimmed[k] = days[k];
    });

    localStorage.setItem(SCREEN_TIME_KEY, JSON.stringify({ days: trimmed }));
    return trimmed[key];
  } catch {
    return 0;
  }
}

export interface ScreenTimeDayPoint {
  label: string;
  dateKey: string;
  minutes: number;
  isToday: boolean;
}

const BN_DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export function getWeeklyScreenTimeStats(): {
  todayMinutes: number;
  dailyAvgMinutes: number;
  days: ScreenTimeDayPoint[];
} {
  let daysMap: Record<string, number> = {};
  try {
    const raw = localStorage.getItem(SCREEN_TIME_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.days === 'object') {
        daysMap = parsed.days;
      }
    }
  } catch {}

  const today = new Date();
  const points: ScreenTimeDayPoint[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    const key = getTodayDateKey(d);
    const secs = Number(daysMap[key]) || 0;
    const mins = secs > 0 ? Math.max(1, Math.round(secs / 60)) : 0;
    points.push({
      label: BN_DAYS[d.getDay()],
      dateKey: key,
      minutes: mins,
      isToday: offset === 0,
    });
  }

  const todayMinutes = points[points.length - 1]?.minutes || 0;
  const activeDays = points.filter((p) => p.minutes > 0);
  const totalMinutes = points.reduce((sum, p) => sum + p.minutes, 0);
  const dailyAvgMinutes =
    activeDays.length > 0 ? Math.max(1, Math.round(totalMinutes / activeDays.length)) : 0;

  return { todayMinutes, dailyAvgMinutes, days: points };
}

// Halal Deeds Log (আখিরাত / আমলনামা ট্র্যাকার)
export interface DeedLogItem {
  id: string;
  title: string;
  category: 'Salah' | 'Quran' | 'Dhikr' | 'Sadaqah' | 'Sunnah';
  countToday: number;
  target: number;
  completedToday: boolean;
  updatedAt: string;
}

const DEEDS_STORAGE_KEY = 'peaceverse_deeds_log_v1';

const DEFAULT_DEEDS: DeedLogItem[] = [
  {
    id: 'deed-salah-5',
    title: '৫ ওয়াক্ত জামাআতে / সময়মতো সালাত',
    category: 'Salah',
    countToday: 0,
    target: 5,
    completedToday: false,
    updatedAt: '',
  },
  {
    id: 'deed-quran',
    title: 'কুরআন তিলাওয়াত (ন্যূনতম ১ রুকু)',
    category: 'Quran',
    countToday: 0,
    target: 1,
    completedToday: false,
    updatedAt: '',
  },
  {
    id: 'deed-durood',
    title: 'দরুদ ও ইস্তিগফার (১০০ বার)',
    category: 'Dhikr',
    countToday: 0,
    target: 100,
    completedToday: false,
    updatedAt: '',
  },
  {
    id: 'deed-sadaqah',
    title: 'সদকা / মানুষের কল্যাণমূলক কাজ',
    category: 'Sadaqah',
    countToday: 0,
    target: 1,
    completedToday: false,
    updatedAt: '',
  },
];

export function loadDeedsLog(scopeId = 'personal'): DeedLogItem[] {
  try {
    const raw = localStorage.getItem(`${DEEDS_STORAGE_KEY}_${scopeId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_DEEDS;
}

export function saveDeedsLog(items: DeedLogItem[], scopeId = 'personal'): void {
  try {
    localStorage.setItem(`${DEEDS_STORAGE_KEY}_${scopeId}`, JSON.stringify(items));
  } catch {}
}
