import { PostItem, SearchedUserProfile } from '../types';

export const LEGACY_DUMMY_USER_IDS = new Set<string>([
  'user-siddik',
  'user-abdullah-khan',
  'user-sheikh-makkah',
  'user-ayesha-rahman',
  'user-omar-faruk',
  'user-fatima-zahra',
  'user-bilal-ahmed',
  'user-nusrat-jahan',
  'user-zayd-hasan',
  'user-sumaiya-islam',
  'user-mahmudul-hasan',
  'user-khadija-begum',
  'user-imran-hossain',
  'user-hafsa-noor',
  'user-yusuf-ali',
  'user-sadia-afrin',
  'user-hamza-chowdhury',
  'user-maryam-siddiqua',
  'user-anas-mahmud',
  'user-ariful-islam',
  'sug-1',
  'sug-2',
]);

export const LEGACY_DUMMY_POST_IDS = new Set<string>([
  'post-user-first-post-2026',
  'post-abdullah-video-1',
  'post-makkah-global-2026',
  'post-ayesha-dua-1',
  'post-omar-photo-1',
  'post-zayd-hadith-1',
  'post-fatima-status-1',
  'post-mahmudul-video-2',
  'post-bilal-photo-1',
  'post-hafsa-dua-2',
  'post-nusrat-photo-1',
  'post-anas-video-3',
  'post-imran-status-1',
  'post-yusuf-hadith-2',
  'post-khadija-photo-1',
  'post-sumaiya-status-2',
  'post-hamza-video-4',
  'post-maryam-photo-2',
  'post-sadia-status-3',
  'post-ariful-photo-3',
]);

export const DUMMY_COMMUNITY_USERS: SearchedUserProfile[] = [];

export const DUMMY_GLOBAL_POSTS: PostItem[] = [];

export function findDummyCommunityUser(_nameOrId: string): SearchedUserProfile | undefined {
  return undefined;
}
