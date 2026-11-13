export interface PeaceSettingsPrefs {
  // Section 1: Account
  salahReminder: boolean;
  quietModeSalah: boolean;
  dailyReminderMins: number;
  twoFactorEnabled: boolean;

  // Section 2: Preferences
  dataSaver: boolean;
  autoplayWifiOnly: boolean;
  selectedAppIcon: 'classic' | 'emerald' | 'gold' | 'midnight';
  bkashNumber: string;
  nagadNumber: string;
  defaultPaymentMethod: 'bkash' | 'nagad' | 'cod';

  // Section 3: Peace Apps
  whoCanMessage: 'everyone' | 'friends_of_friends' | 'friends_only';
  messageRequestsEnabled: boolean;
  halalMessageFilter: boolean;
  editsDefaultQuality: '720p' | '1080p' | '4K';
  editsAutoHalalCheck: boolean;
  editsWatermarkOff: boolean;
  businessShopVerification: boolean;
  businessOrderNotifications: boolean;
  businessWhatsappOrderSync: boolean;

  // Section 4: Halal Safety
  halalContentFilter: boolean;
  blockHaramMusic: boolean;
  prayerTimePause: boolean;
  prayerPauseMinutes: 15 | 20 | 30;
  familyBlock18Plus: boolean;
  familySafeSearch: boolean;
  kidsSafeReels: boolean;
  blockedUsers: string[];
  blockedKeywords: string[];

  // Section 5: Creator Broadcast & User Notification Settings
  creatorNotifyFollowersOnPost: boolean;
  creatorSendPushToAllUsers: boolean;
  notifyFavoriteCreator: boolean;
  notifyPriyoDada: boolean;
  notifSound: boolean;
  notifVibration: boolean;
  fcmPushSubscribed: boolean;
}

export const DEFAULT_PEACE_SETTINGS: PeaceSettingsPrefs = {
  salahReminder: true,
  quietModeSalah: true,
  dailyReminderMins: 45,
  twoFactorEnabled: true,

  dataSaver: true,
  autoplayWifiOnly: true,
  selectedAppIcon: 'classic',
  bkashNumber: '01711-234567',
  nagadNumber: '01822-987654',
  defaultPaymentMethod: 'bkash',

  whoCanMessage: 'everyone',
  messageRequestsEnabled: true,
  halalMessageFilter: true,
  editsDefaultQuality: '1080p',
  editsAutoHalalCheck: true,
  editsWatermarkOff: true,
  businessShopVerification: true,
  businessOrderNotifications: true,
  businessWhatsappOrderSync: true,

  halalContentFilter: true,
  blockHaramMusic: true,
  prayerTimePause: true,
  prayerPauseMinutes: 20,
  familyBlock18Plus: true,
  familySafeSearch: true,
  kidsSafeReels: true,
  blockedUsers: ['SpamBot24', 'FakePromoBD'],
  blockedKeywords: ['casino', 'gambling', 'haram', '18+'],

  creatorNotifyFollowersOnPost: true,
  creatorSendPushToAllUsers: true,
  notifyFavoriteCreator: true,
  notifyPriyoDada: true,
  notifSound: true,
  notifVibration: true,
  fcmPushSubscribed: false,
};

const STORAGE_KEY = 'peaceverse_halal_settings';

export function loadPeaceSettings(): PeaceSettingsPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PEACE_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PEACE_SETTINGS,
      ...parsed,
      blockedUsers: Array.isArray(parsed.blockedUsers)
        ? parsed.blockedUsers
        : DEFAULT_PEACE_SETTINGS.blockedUsers,
      blockedKeywords: Array.isArray(parsed.blockedKeywords)
        ? parsed.blockedKeywords
        : DEFAULT_PEACE_SETTINGS.blockedKeywords,
    };
  } catch {
    return DEFAULT_PEACE_SETTINGS;
  }
}

export function savePeaceSettings(next: PeaceSettingsPrefs): PeaceSettingsPrefs {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}
