import {
  PostItem,
  StoryItem,
  IslamicGroup,
  ChatFriend,
  NotificationItem,
  MarketplaceItem,
  UserProfile
} from '../types';

export const USER_PROFILE: UserProfile = {
  name: 'Abdulla',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Abdulla&backgroundColor=1877f2,0ea5e9,3b82f6',
  coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  friendsCount: 0,
  location: 'Dhaka, Bangladesh',
  birthDate: 'August 17, 1995',
  thoughtBubble: 'Drop a thought...',
  bio: 'Peaceverse24 এর সাথে শান্তির পথে।',
  work: 'Member at Peaceverse24',
  education: 'Peaceverse Global Community',
  hometown: 'Dhaka, Bangladesh',
  relationship: 'Single',
  website: 'https://peaceverse24.com',
  hobbies: ['কুরআন তিলাওয়াত', 'ভিডিও দেখা', 'ইসলামিক ক্যালিগ্রাফি'],
};

// 100% EMPTY by default per Part 1 instructions - Genuine posts & stories will load from Supabase / Firestore
export const INITIAL_STORIES: StoryItem[] = [];

export const INITIAL_POSTS: PostItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_MARKETPLACE: MarketplaceItem[] = [];

export const INITIAL_GROUPS: IslamicGroup[] = [];

export const INITIAL_CHAT_FRIENDS: ChatFriend[] = [];
