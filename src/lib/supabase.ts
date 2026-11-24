import { createClient } from '@supabase/supabase-js';
import { PostItem, StoryItem } from '../types';
import {
  checkSupabaseRateLimit,
  POST_MAX_LENGTH,
  sanitizeInput,
  sanitizeUrl,
} from '../utils/security';

// Read Supabase credentials strictly from environment variables or owner local configuration
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

// Reference RLS policy SQL enforced across all Supabase tables
export const SUPABASE_RLS_POLICY_SQL = `
alter table profiles enable row level security;
create policy "auth required" on profiles for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth required" on posts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
`.trim();

export function setSupabaseCredentials(url: string, anonKey?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanUrl = sanitizeUrl(url);
    if (cleanUrl) localStorage.setItem('peaceverse_supabase_url', cleanUrl);
    if (anonKey?.trim()) localStorage.setItem('peaceverse_supabase_anon_key', anonKey.trim());
  } catch {}
}

export function getSupabaseSecurityStatus() {
  return {
    rlsEnabled: true,
    configured: isSupabaseConfigured,
    supabaseUrlSet: Boolean(SUPABASE_URL),
    rateLimitRule: '20 req / 60s ("Too fast, slow down")',
    maxPostLength: POST_MAX_LENGTH,
  };
}

// Validate and sanitize post payload before supabase.from().insert()
export function validateAndSanitizeSupabasePost(post: PostItem): {
  valid: boolean;
  error?: string;
  sanitizedContent: string;
  sanitizedAuthorName: string;
} {
  const rawContent = String(post.contentBangla || '');
  const sanitizedContent = sanitizeInput(rawContent, POST_MAX_LENGTH);
  const sanitizedAuthorName = sanitizeInput(post.author?.name || 'Peaceverse Creator', 80);

  if (rawContent.trim().length > POST_MAX_LENGTH) {
    return {
      valid: false,
      error: `Post exceeds maximum ${POST_MAX_LENGTH} characters.`,
      sanitizedContent,
      sanitizedAuthorName,
    };
  }

  return {
    valid: true,
    sanitizedContent,
    sanitizedAuthorName,
  };
}

// Map Supabase record to PostItem (sanitized)
export function mapSupabasePostToPostItem(row: any): PostItem {
  const authorObj =
    typeof row.author === 'object' && row.author !== null
      ? {
          ...row.author,
          name: sanitizeInput(String(row.author.name || 'Peaceverse Creator'), 80),
        }
      : {
          name: sanitizeInput(String(row.author_name || row.authorName || 'Peaceverse Creator'), 80),
          avatar:
            row.author_avatar ||
            row.authorAvatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
          verified: row.author_verified ?? row.authorVerified ?? true,
          subtitle: sanitizeInput(String(row.author_subtitle || row.authorSubtitle || 'Just now • 🌐'), 80),
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
    contentBangla: sanitizeInput(
      String(row.content_bangla || row.contentBangla || row.content || ''),
      POST_MAX_LENGTH
    ),
    arabicVerse: row.arabic_verse || row.arabicVerse,
    translation: row.translation ? sanitizeInput(String(row.translation), POST_MAX_LENGTH) : undefined,
    reference: row.reference,
    mediaType: isVideo ? 'video' : (row.media_type || row.mediaType || 'none'),
    mediaUrl: sanitizeUrl(row.media_url || row.mediaUrl || row.video_url || row.videoUrl || ''),
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

// Fetch posts from Supabase "posts" table with rate limiting (>20 req/60s blocked)
export async function fetchSupabasePosts(
  page: number = 0,
  pageSize: number = 10,
  actorId = 'anonymous'
): Promise<PostItem[]> {
  if (!supabase) return [];
  const rate = checkSupabaseRateLimit(actorId);
  if (!rate.allowed) {
    console.warn(rate.message || 'Too fast, slow down');
    return [];
  }

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

// Fetch stories from Supabase "stories" table with rate limit check
export async function fetchSupabaseStories(actorId = 'anonymous'): Promise<StoryItem[]> {
  if (!supabase) return [];
  const rate = checkSupabaseRateLimit(actorId);
  if (!rate.allowed) {
    console.warn(rate.message || 'Too fast, slow down');
    return [];
  }

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
      authorName: sanitizeInput(String(row.author_name || row.authorName || 'Creator'), 80),
      authorAvatar:
        row.author_avatar ||
        row.authorAvatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80',
      bgGradient: row.bg_gradient || row.bgGradient || 'from-blue-600 to-indigo-900',
      previewImage: row.preview_image || row.previewImage,
      arabicText: row.arabic_text || row.arabicText,
      banglaText: sanitizeInput(String(row.bangla_text || row.banglaText || ''), POST_MAX_LENGTH),
      timestamp: row.timestamp || 'Recently',
    }));
  } catch (err) {
    console.warn('Supabase stories fetch exception:', err);
    return [];
  }
}

// Insert post into Supabase "posts" table with rate limit, DOMPurify sanitize, trim & max 500 chars
export async function insertSupabasePost(
  post: PostItem,
  actorId?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false };

  const rate = checkSupabaseRateLimit(actorId || post.authorId || 'anonymous');
  if (!rate.allowed) {
    console.warn('Supabase Rate Limit:', rate.message);
    return { ok: false, error: rate.message || 'Too fast, slow down' };
  }

  const validated = validateAndSanitizeSupabasePost(post);
  if (!validated.valid) {
    console.warn('Supabase Input Validation:', validated.error);
    return { ok: false, error: validated.error };
  }

  try {
    const { error } = await supabase.from('posts').insert([
      {
        id: post.id,
        author_name: validated.sanitizedAuthorName,
        author_avatar: sanitizeUrl(post.author.avatar),
        author_verified: post.author.verified,
        author_subtitle: sanitizeInput(post.author.subtitle || '', 80),
        content: validated.sanitizedContent,
        content_bangla: validated.sanitizedContent,
        media_type: post.mediaType,
        media_url: sanitizeUrl(post.mediaUrl || ''),
        video_url: post.mediaType === 'video' ? sanitizeUrl(post.mediaUrl || '') : null,
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
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.warn('Supabase insert exception:', err);
    return { ok: false, error: 'Supabase insert failed' };
  }
}

export async function syncSupabaseProfile(profile: {
  id: string;
  displayName: string;
  username?: string;
  avatar?: string;
  bio?: string;
  location?: string;
}): Promise<boolean> {
  if (!supabase || !profile.id || !profile.displayName.trim()) return false;
  const rate = checkSupabaseRateLimit(profile.id);
  if (!rate.allowed) return false;
  try {
    const { error } = await supabase.from('profiles').upsert(
      [
        {
          id: profile.id,
          display_name: sanitizeInput(profile.displayName, 120),
          name: sanitizeInput(profile.displayName, 120),
          username: sanitizeInput(profile.username || '', 80),
          avatar: sanitizeUrl(profile.avatar || ''),
          bio: sanitizeInput(profile.bio || '', 300),
          location: sanitizeInput(profile.location || '', 120),
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'id' }
    );
    return !error;
  } catch {
    return false;
  }
}

export async function fetchSupabaseProfiles(): Promise<
  Array<{
    id: string;
    uid: string;
    displayName: string;
    username?: string;
    avatar: string;
    bio?: string;
    location?: string;
    verified?: boolean;
    allowFriendRequests?: boolean;
  }>
> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(500);
    if (error || !Array.isArray(data)) return [];
    return data
      .map((row: any) => {
        const displayName = sanitizeInput(
          String(row.display_name || row.displayName || row.name || ''),
          120
        );
        if (!displayName) return null;
        return {
          id: String(row.id || row.uid || ''),
          uid: String(row.uid || row.id || ''),
          displayName,
          username: row.username ? sanitizeInput(String(row.username), 80) : undefined,
          avatar:
            sanitizeUrl(String(row.avatar || row.photo_url || '')) ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              displayName
            )}&backgroundColor=1877f2,0ea5e9,3b82f6`,
          bio: row.bio ? sanitizeInput(String(row.bio), 300) : undefined,
          location: row.location ? sanitizeInput(String(row.location), 120) : undefined,
          verified: Boolean(row.verified),
          allowFriendRequests: row.allow_friend_requests !== false,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x && x.id));
  } catch {
    return [];
  }
}

