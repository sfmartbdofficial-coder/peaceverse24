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
  goldenCoins: 120,
  earnedCoins: 65,
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

export const INITIAL_CHAT_FRIENDS: ChatFriend[] = [
  {
    id: 'chat-1',
    name: 'Sujon Ahmed',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    online: true,
    lastSeen: 'Active now',
    unreadCount: 1,
    messages: [
      { id: 'm-1', sender: 'them', text: 'আসসালামু আলাইকুম ভাই, কেমন আছেন?', time: '১০:৩০ AM' },
      { id: 'm-2', sender: 'me', text: 'ওয়া আলাইকুমুস সালাম ভাই। আলহামদুলিল্লাহ ভালো আছি।', time: '১০:৩২ AM' },
      { id: 'm-3', sender: 'them', text: 'Peaceverse-এ আপনার পোস্টটা দারুণ লাগলো মাশাআল্লাহ!', time: '১০:৩৫ AM' },
    ],
  },
  {
    id: 'chat-2',
    name: 'Angel Mahi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    online: true,
    lastSeen: 'Active now',
    unreadCount: 1,
    messages: [
      { id: 'm-4', sender: 'them', text: 'ভাইয়া, আপনার পেজটা খুব সুন্দর হয়েছে।', time: 'গতকাল' },
    ],
  },
  {
    id: 'chat-3',
    name: 'Hassan Abdullah',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    online: false,
    lastSeen: '15m ago',
    unreadCount: 0,
    messages: [
      { id: 'm-5', sender: 'them', text: 'জাযাকাল্লাহ খাইরান ভাই!', time: '২ দিন আগে' },
    ],
  },
  {
    id: 'chat-4',
    name: 'Robel Mahmud',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    online: true,
    lastSeen: 'Active now',
    unreadCount: 0,
    messages: [
      { id: 'm-6', sender: 'them', text: 'দোয়া রইলো আপনার জন্য ❤️', time: '৩ দিন আগে' },
    ],
  },
];
