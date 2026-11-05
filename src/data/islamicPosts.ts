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
  name: 'New Member',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Peaceverse&backgroundColor=1877f2,0ea5e9,3b82f6',
  coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  friendsCount: 0,
  location: '',
  birthDate: '',
  thoughtBubble: 'Drop a thought...',
  bio: '',
  work: '',
  education: '',
  hometown: '',
  relationship: '',
  website: 'https://peaceverse24.com',
  hobbies: [],
};

// 100% EMPTY by default per Part 1 instructions - Genuine posts & stories will load from Supabase / Firestore
export const INITIAL_STORIES: StoryItem[] = [];

export const INITIAL_POSTS: PostItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_MARKETPLACE: MarketplaceItem[] = [];

export const INITIAL_GROUPS: IslamicGroup[] = [];

export const INITIAL_CHAT_FRIENDS: ChatFriend[] = [];
