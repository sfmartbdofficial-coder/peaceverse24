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
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
  coverPhoto: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
  friendsCount: 331,
  location: 'Dhaka, Bangladesh',
  birthDate: 'August 17, 1991',
  thoughtBubble: 'Drop a thought...',
  bio: '',
  work: '',
  education: '',
  hometown: 'Dhaka, Bangladesh',
  relationship: 'Married',
  website: '',
  hobbies: [],
};

// 100% EMPTY by default per Part 1 instructions - Genuine posts & stories will load from Supabase / Firestore
export const INITIAL_STORIES: StoryItem[] = [];

export const INITIAL_POSTS: PostItem[] = [
  {
    id: 'post-user-first-post-2026',
    authorId: 'user-siddik',
    author: {
      name: 'Siddik',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      verified: true,
      subtitle: 'Just now • 🌐',
    },
    timeAgo: 'Just now',
    isPublic: true,
    privacy: 'public',
    status: 'approved',
    contentBangla: 'আপনারা সবাই আমার পরিবারের সদস্য। আপনাদের দোয়া ও ভালোবাসায় এগিয়ে যেতে চাই।\n\n#PeaceVerse24 #FirstPost #Islamic #Alhamdulillah',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    category: 'Community',
    reactions: {
      total: 15,
      likeCount: 12,
      loveCount: 3,
      subhanallahCount: 0,
      mashaallahCount: 0,
    },
    userReaction: 'like',
    comments: [],
    sharesCount: 1,
    isSaved: false,
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_MARKETPLACE: MarketplaceItem[] = [];

export const INITIAL_GROUPS: IslamicGroup[] = [];

export const INITIAL_CHAT_FRIENDS: ChatFriend[] = [];
