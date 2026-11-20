import { AdSlot } from '../types/admin';
import { INITIAL_ADS } from '../data/adminData';
import { PageItem } from '../types';

export const AD_PLACEMENTS_CONFIG_KEY = 'peaceverse_ad_placements_config';
export const PAGE_MONETIZATION_STORAGE_KEY = 'peaceverse_page_monetization';
export const ADMIN_USER_OVERRIDES_KEY = 'peaceverse_admin_user_overrides';
export const ADMIN_SYNC_EVENT = 'peaceverse:admin-sync';

export interface AdPlacementConfig {
  home_feed_enabled: boolean;
  home_feed_frequency: number; // Show an ad after every N posts
  reels_preroll_enabled: boolean;
  marketplace_top_enabled: boolean;
  story_ad_enabled: boolean;
}

export const DEFAULT_AD_PLACEMENT_CONFIG: AdPlacementConfig = {
  home_feed_enabled: true,
  home_feed_frequency: 3,
  reels_preroll_enabled: true,
  marketplace_top_enabled: true,
  story_ad_enabled: true,
};

export interface PageMonetizationControl {
  pageId: string;
  pageName: string;
  category: string;
  avatar: string;
  followersCount: number;
  status: 'approved' | 'pending' | 'paused' | 'rejected';
  inStreamAdsEnabled: boolean;
  reelsAdsEnabled: boolean;
  starsEnabled: boolean;
  revenueShareCreatorPct: number;
  totalEarnings: number;
  pendingBalance: number;
  updatedAt: string;
}

export interface AdminUserOverride {
  uid: string;
  verifiedOverride?: boolean;
  suspended?: boolean;
  role?: 'user' | 'creator' | 'moderator';
  updatedAt?: string;
}

export function emitAdminSyncEvent(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ADMIN_SYNC_EVENT));
  }
}

export function loadAdPlacementConfig(): AdPlacementConfig {
  try {
    const raw = localStorage.getItem(AD_PLACEMENTS_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_AD_PLACEMENT_CONFIG,
        ...parsed,
        home_feed_frequency: Math.max(1, Number(parsed.home_feed_frequency) || 3),
      };
    }
  } catch {}
  return DEFAULT_AD_PLACEMENT_CONFIG;
}

export function saveAdPlacementConfig(config: AdPlacementConfig): AdPlacementConfig {
  const normalized: AdPlacementConfig = {
    ...DEFAULT_AD_PLACEMENT_CONFIG,
    ...config,
    home_feed_frequency: Math.max(1, Number(config.home_feed_frequency) || 3),
  };
  try {
    localStorage.setItem(AD_PLACEMENTS_CONFIG_KEY, JSON.stringify(normalized));
  } catch {}
  emitAdminSyncEvent();
  return normalized;
}

export function loadAdminAds(): AdSlot[] {
  try {
    const raw = localStorage.getItem('qalby_admin_ads');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return INITIAL_ADS;
}

export function saveAdminAds(ads: AdSlot[]): void {
  try {
    localStorage.setItem('qalby_admin_ads', JSON.stringify(ads));
  } catch {}
  emitAdminSyncEvent();
}

export function trackAdClick(adId: string): void {
  const ads = loadAdminAds();
  const updated = ads.map((ad) =>
    ad.id === adId
      ? {
          ...ad,
          clicks: ad.clicks + 1,
          totalEarnings: Math.round(ad.totalEarnings + (ad.cpcRate || 5)),
        }
      : ad
  );
  saveAdminAds(updated);
}

export function loadUserCreatedPagesFromStorage(): PageItem[] {
  try {
    const raw = localStorage.getItem('qalby_fb_pages');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function loadPageMonetizationList(): PageMonetizationControl[] {
  let savedList: PageMonetizationControl[] = [];
  try {
    const raw = localStorage.getItem(PAGE_MONETIZATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        savedList = parsed;
      }
    }
  } catch {}

  const userPages = loadUserCreatedPagesFromStorage();
  const mergedMap = new Map<string, PageMonetizationControl>();

  for (const item of savedList) {
    if (item?.pageId) {
      mergedMap.set(item.pageId, item);
    }
  }

  for (const p of userPages) {
    if (!p?.id) continue;
    const existing = mergedMap.get(p.id);
    if (existing) {
      mergedMap.set(p.id, {
        ...existing,
        pageName: p.name || existing.pageName,
        category: p.category || existing.category,
        avatar: p.avatar || existing.avatar,
        followersCount: typeof p.followersCount === 'number' ? p.followersCount : existing.followersCount,
      });
    } else {
      mergedMap.set(p.id, {
        pageId: p.id,
        pageName: p.name,
        category: p.category || 'Creator Page',
        avatar: p.avatar || '',
        followersCount: p.followersCount || 0,
        status: (p.followersCount || 0) >= 5000 ? 'approved' : 'pending',
        inStreamAdsEnabled: true,
        reelsAdsEnabled: true,
        starsEnabled: true,
        revenueShareCreatorPct: 55,
        totalEarnings: 0,
        pendingBalance: 0,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return Array.from(mergedMap.values());
}

export function savePageMonetizationList(list: PageMonetizationControl[]): void {
  try {
    localStorage.setItem(PAGE_MONETIZATION_STORAGE_KEY, JSON.stringify(list));
  } catch {}
  emitAdminSyncEvent();
}

export function getPageMonetizationById(pageId: string): PageMonetizationControl | null {
  const list = loadPageMonetizationList();
  return list.find((p) => p.pageId === pageId) || null;
}

export function loadAdminUserOverrides(): Record<string, AdminUserOverride> {
  try {
    const raw = localStorage.getItem(ADMIN_USER_OVERRIDES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

export function saveAdminUserOverrides(overrides: Record<string, AdminUserOverride>): void {
  try {
    localStorage.setItem(ADMIN_USER_OVERRIDES_KEY, JSON.stringify(overrides));
  } catch {}
  emitAdminSyncEvent();
}
