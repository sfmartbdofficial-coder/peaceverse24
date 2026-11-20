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
  privacyBlurPersonalInfo?: boolean;
  disableCopyOnSensitive?: boolean;
  settingsVersion?: number;
}

export const DEFAULT_PEACE_SETTINGS: PeaceSettingsPrefs = {
  salahReminder: true,
  quietModeSalah: false,
  dailyReminderMins: 30,
  twoFactorEnabled: false,

  dataSaver: false,
  autoplayWifiOnly: false,
  selectedAppIcon: 'classic',
  bkashNumber: '',
  nagadNumber: '',
  defaultPaymentMethod: 'bkash',

  whoCanMessage: 'everyone',
  messageRequestsEnabled: true,
  halalMessageFilter: true,
  editsDefaultQuality: '1080p',
  editsAutoHalalCheck: true,
  editsWatermarkOff: false,
  businessShopVerification: false,
  businessOrderNotifications: false,
  businessWhatsappOrderSync: false,

  halalContentFilter: true,
  blockHaramMusic: false,
  prayerTimePause: false,
  prayerPauseMinutes: 15,
  familyBlock18Plus: true,
  familySafeSearch: true,
  kidsSafeReels: false,
  blockedUsers: [],
  blockedKeywords: [],

  creatorNotifyFollowersOnPost: false,
  creatorSendPushToAllUsers: false,
  notifyFavoriteCreator: false,
  notifyPriyoDada: false,
  notifSound: true,
  notifVibration: true,
  fcmPushSubscribed: true,
  privacyBlurPersonalInfo: true,
  disableCopyOnSensitive: true,
  settingsVersion: 3,
};

const STORAGE_KEY = 'peaceverse_halal_settings';

export function loadPeaceSettings(): PeaceSettingsPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PEACE_SETTINGS;
    const parsed = JSON.parse(raw);

    // Strip any legacy mock/demo values if upgrading from v1 storage
    const cleanBkash =
      parsed.bkashNumber === '01711-234567' || parsed.bkashNumber === '01712345678'
        ? ''
        : typeof parsed.bkashNumber === 'string'
        ? parsed.bkashNumber
        : '';
    const cleanNagad =
      parsed.nagadNumber === '01822-987654'
        ? ''
        : typeof parsed.nagadNumber === 'string'
        ? parsed.nagadNumber
        : '';

    const version = Number(parsed.settingsVersion || 0);
    const isLegacyV1 = !parsed.settingsVersion || version < 2;
    const needsV3Upgrade = version < 3;
    const rawBlockedUsers = Array.isArray(parsed.blockedUsers) ? parsed.blockedUsers : [];
    const cleanBlockedUsers = isLegacyV1
      ? rawBlockedUsers.filter((u: string) => u !== 'SpamBot24' && u !== 'FakePromoBD')
      : rawBlockedUsers;

    const rawBlockedKeywords = Array.isArray(parsed.blockedKeywords) ? parsed.blockedKeywords : [];
    const isDefaultFakeKeywords =
      isLegacyV1 &&
      rawBlockedKeywords.length === 4 &&
      rawBlockedKeywords.includes('SpamBot24') === false &&
      ['casino', 'gambling', 'haram', '18+'].every((k) => rawBlockedKeywords.includes(k));
    const cleanBlockedKeywords = isDefaultFakeKeywords ? [] : rawBlockedKeywords;

    return {
      ...DEFAULT_PEACE_SETTINGS,
      ...parsed,
      bkashNumber: cleanBkash,
      nagadNumber: cleanNagad,
      blockedUsers: cleanBlockedUsers,
      blockedKeywords: cleanBlockedKeywords,
      ...(isLegacyV1
        ? {
            creatorNotifyFollowersOnPost: false,
            creatorSendPushToAllUsers: false,
            notifyFavoriteCreator: false,
            notifyPriyoDada: false,
          }
        : {}),
      ...(needsV3Upgrade
        ? {
            fcmPushSubscribed: true,
            halalContentFilter: true,
            familyBlock18Plus: true,
            privacyBlurPersonalInfo: parsed.privacyBlurPersonalInfo ?? true,
            settingsVersion: 3,
          }
        : {}),
    };
  } catch {
    return DEFAULT_PEACE_SETTINGS;
  }
}

export function savePeaceSettings(next: PeaceSettingsPrefs): PeaceSettingsPrefs {
  const normalized: PeaceSettingsPrefs = {
    ...next,
    settingsVersion: 3,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {}
  return normalized;
}
