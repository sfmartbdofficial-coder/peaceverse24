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
  name: 'Sharif Hasan',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
  coverPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  friendsCount: 330,
  location: 'Dhaka, Bangladesh',
  birthDate: 'August 17, 1991',
  thoughtBubble: 'Drop a thought...',
  bio: 'আলহামদুলিল্লাহ আলা কুল্লি হাল। হালাল রিজিক ও উত্তম আখলাক।',
  work: 'Content Creator & Designer at Peaceverse24',
  education: 'Studied Islamic Studies at Dhaka University',
  hometown: 'Sylhet, Bangladesh',
  relationship: 'Married',
  website: 'https://peaceverse24.com',
  hobbies: ['কুরআন তিলাওয়াত', 'হাদিস অধ্যয়ন', 'ইসলামিক ক্যালিগ্রাফি', 'মসজিদ ভ্রমণ'],
};

// 100% EMPTY by default per Part 1 instructions - Genuine posts & stories will load from Supabase / Firestore
export const INITIAL_STORIES: StoryItem[] = [];

export const INITIAL_POSTS: PostItem[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_MARKETPLACE: MarketplaceItem[] = [];

export const INITIAL_GROUPS: IslamicGroup[] = [];

export const INITIAL_CHAT_FRIENDS: ChatFriend[] = [];
