import { createClient } from '@supabase/supabase-js';
import { PostItem, StoryItem } from '../types';

// Read Supabase credentials from Vite environment or localStorage
const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof window !== 'undefined' && localStorage.getItem('peaceverse_supabase_url')) ||
  '';

const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof window !== 'undefined' && localStorage.getItem('peaceverse_supabase_anon_key')) ||
  '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Map Supabase record to PostItem
export function mapSupabasePostToPostItem(row: any): PostItem {
  const authorObj =
    typeof row.author === 'object' && row.author !== null
      ? row.author
      : {
          name: row.author_name || row.authorName || 'Peaceverse Creator',
          avatar:
            row.author_avatar ||
            row.authorAvatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
          verified: row.author_verified ?? row.authorVerified ?? true,
          subtitle: row.author_subtitle || row.authorSubtitle || 'Just now • 🌐',
        };

  const isVideo =
    row.media_type === 'video' ||
    row.mediaType === 'video' ||
    Boolean(row.video_url || row.videoUrl || row.youtube_id || row.youtubeId) ||
    Boolean(
      typeof (row.media_url || row.mediaUrl) === 'string' &&
        (row.media_url || row.mediaUrl).match(/\.(mp4|webm|ogg|mov|m4v)($|\?)/i)
    );

  return {
    id: String(row.id || `sp-${Date.now()}`),
    author: authorObj,
    timeAgo: row.time_ago || row.timeAgo || 'Just now',
    isPublic: row.privacy ? row.privacy === 'public' : row.is_public ?? true,
    privacy: row.privacy || 'public',
    status: row.status || 'approved',
    moderationReason: row.moderation_reason || row.moderationReason,
    appealStatus: row.appeal_status || row.appealStatus || 'none',
    authorId: row.author_id || row.authorId,
    contentBangla: row.content_bangla || row.contentBangla || row.content || '',
    arabicVerse: row.arabic_verse || row.arabicVerse,
    translation: row.translation,
    reference: row.reference,
    mediaType: isVideo ? 'video' : (row.media_type || row.mediaType || 'none'),
    mediaUrl: row.media_url || row.mediaUrl || row.video_url || row.videoUrl,
    youtubeId: row.youtube_id || row.youtubeId,
    duration: row.duration,
    isLive: row.is_live ?? row.isLive ?? false,
    category: row.category || 'Community',
    reactions: row.reactions || {
      total: Number(row.likes_count || row.likesCount || 0),
      likeCount: Number(row.likes_count || row.likesCount || 0),
      loveCount: 0,
      subhanallahCount: 0,
      mashaallahCount: 0,
    },
    userReaction: row.user_reaction || row.userReaction || null,
    comments: Array.isArray(row.comments) ? row.comments : [],
    sharesCount: Number(row.shares_count || row.sharesCount || 0),
    isSaved: row.is_saved ?? row.isSaved ?? false,
    bgGradient: row.bg_gradient || row.bgGradient,
    location: row.location,
    feeling: row.feeling,
    taggedFriends: row.tagged_friends || row.taggedFriends,
    typingUsers: row.typing_users || row.typingUsers || [],
  };
}

// Fetch posts from Supabase "posts" table ordered by created_at DESC with limit & offset
export async function fetchSupabasePosts(
  page: number = 0,
  pageSize: number = 10
): Promise<PostItem[]> {
  if (!supabase) return [];
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.warn('Supabase fetch posts notice:', error.message);
      return [];
    }

    if (!Array.isArray(data)) return [];
    return data.map(mapSupabasePostToPostItem);
  } catch (err) {
    console.warn('Supabase posts fetch exception:', err);
    return [];
  }
}

// Fetch stories from Supabase "stories" table
export async function fetchSupabaseStories(): Promise<StoryItem[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch stories notice:', error.message);
      return [];
    }

    if (!Array.isArray(data)) return [];
    return data.map((row: any) => ({
      id: String(row.id),
      authorName: row.author_name || row.authorName || 'Creator',
      authorAvatar:
        row.author_avatar ||
        row.authorAvatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
      bgGradient: row.bg_gradient || row.bgGradient || 'from-blue-600 to-indigo-900',
      previewImage: row.preview_image || row.previewImage,
      arabicText: row.arabic_text || row.arabicText,
      banglaText: row.bangla_text || row.banglaText || '',
      timestamp: row.timestamp || 'Recently',
    }));
  } catch (err) {
    console.warn('Supabase stories fetch exception:', err);
    return [];
  }
}

// Insert post into Supabase "posts" table
export async function insertSupabasePost(post: PostItem): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('posts').insert([
      {
        id: post.id,
        author_name: post.author.name,
        author_avatar: post.author.avatar,
        author_verified: post.author.verified,
        author_subtitle: post.author.subtitle,
        content: post.contentBangla,
        content_bangla: post.contentBangla,
        media_type: post.mediaType,
        media_url: post.mediaUrl,
        video_url: post.mediaType === 'video' ? post.mediaUrl : null,
        youtube_id: post.youtubeId,
        privacy: post.privacy || 'public',
        status: post.status || 'approved',
        likes_count: post.reactions?.total || 0,
        comments_count: post.comments?.length || 0,
        shares_count: post.sharesCount || 0,
        reactions: post.reactions,
        comments: post.comments,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.warn('Supabase post insert notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insert exception:', err);
    return false;
  }
}
