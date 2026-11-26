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
  name: 'Member',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Peaceverse&backgroundColor=1877f2,0ea5e9,3b82f6',
  coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
  friendsCount: 0,
  location: '',
  birthDate: '',
  thoughtBubble: 'Drop a thought...',
  bio: '',
  work: '',
  education: '',
  hometown: '',
  relationship: '',
  website: '',
  whatsapp: '',
  imo: '',
  viber: '',
  messengerLink: '',
  contactPrivacy: 'public',
  hobbies: [],
  goldenCoins: 0,
  earnedCoins: 0,
};

// 100% EMPTY by default - Only genuine user-created posts, stories, items, and chats appear
export const INITIAL_STORIES: StoryItem[] = [];

export const INITIAL_POSTS: PostItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_MARKETPLACE: MarketplaceItem[] = [];

export const INITIAL_GROUPS: IslamicGroup[] = [];

export const INITIAL_CHAT_FRIENDS: ChatFriend[] = [];
