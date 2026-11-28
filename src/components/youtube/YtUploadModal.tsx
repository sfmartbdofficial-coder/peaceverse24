import React, { useState } from 'react';
import {
  X,
  Video,
  Film,
  Radio,
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { PostItem, UserProfile } from '../../types';
import { uploadMediaFile } from '../../lib/mediaStorage';
import { sanitizeInput } from '../../utils/security';

interface YtUploadModalProps {
  isOpen: boolean;
  initialMode?: 'choose' | 'video' | 'short';
  userProfile: UserProfile;
  onClose: () => void;
  onPostCreated: (post: PostItem) => Promise<void> | void;
  onSelectGoLive: () => void;
}

const CATEGORY_MAP: Record<string, PostItem['category']> = {
  Quran: 'Quran',
  Lectures: 'Lecture',
  Nasheed: 'Nasheed',
  Kids: 'Community',
  Hadith: 'Hadith',
  Bangla: 'Community',
};

const CATEGORIES = ['Quran', 'Lectures', 'Nasheed', 'Kids', 'Hadith', 'Bangla'];

function formatSeconds(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem < 10 ? '0' : ''}${rem}`;
}

async function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const vid = document.createElement('video');
    vid.preload = 'metadata';
    vid.onloadedmetadata = () => {
      const dur = Number.isFinite(vid.duration) ? vid.duration : 0;
      URL.revokeObjectURL(url);
      resolve(dur);
    };
    vid.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    vid.src = url;
  });
}

export const YtUploadModal: React.FC<YtUploadModalProps> = ({
  isOpen,
  initialMode = 'choose',
  userProfile,
  onClose,
  onPostCreated,
  onSelectGoLive,
}) => {
  const [step, setStep] = useState<'choose' | 'video' | 'short'>(initialMode);
  const [title, setTitle] = useState('');
  const [hashtagsText, setHashtagsText] = useState('#Peaceverse24 #Halal');
  const [category, setCategory] = useState('Lectures');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [videoDurationSec, setVideoDurationSec] = useState<number>(0);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setStep(initialMode);
      setErrorMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const isShortMode = step === 'short';

  const handleVideoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please select a valid MP4, MOV, or WebM video file.');
      return;
    }
    const dur = await readVideoDuration(file);
    if (isShortMode && dur > 0 && (dur < 15 || dur > 60)) {
      setErrorMsg(
        `Peace Shorts must be 15 sec to 1 min (detected ${Math.round(dur)}s). Switch to "Upload Video" for longer videos.`
      );
      return;
    }
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(file);
    setVideoDurationSec(dur);
    setVideoPreviewUrl(URL.createObjectURL(file));
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 90));
    }
  };

  const handleThumbPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (thumbPreviewUrl) URL.revokeObjectURL(thumbPreviewUrl);
    setThumbFile(file);
    setThumbPreviewUrl(URL.createObjectURL(file));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!videoFile) {
      setErrorMsg('Please select a video to upload.');
      return;
    }
    const cleanTitle = sanitizeInput(title.trim(), 140);
    if (!cleanTitle) {
      setErrorMsg('Please enter a video title.');
      return;
    }

    setUploading(true);
    setProgress(5);
    try {
      const uploadedVideoUrl = await uploadMediaFile(videoFile, {
        mimeType: videoFile.type || 'video/mp4',
        fileName: cleanTitle,
        onProgress: (pct: number) =>
          setProgress(Math.min(90, Math.max(5, Math.round(pct * 0.9)))),
      });

      let uploadedThumbUrl: string | undefined;
      if (thumbFile) {
        uploadedThumbUrl = await uploadMediaFile(thumbFile, {
          mimeType: thumbFile.type || 'image/jpeg',
          fileName: `${cleanTitle}-thumb`,
        });
      }

      setProgress(96);
      const tags = hashtagsText
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (t.startsWith('#') ? t : `#${t}`))
        .slice(0, 8);

      const newPost: PostItem = {
        id: `pv-vid-${Date.now()}`,
        authorId: userProfile.id,
        author: {
          name: userProfile.name,
          avatar: userProfile.avatar,
          verified: userProfile.verified ?? true,
          subtitle: `${category} · Peaceverse24`,
        },
        timeAgo: 'Just now',
        isPublic: true,
        privacy: 'public',
        status: 'approved',
        contentBangla: cleanTitle,
        mediaType: 'video',
        mediaUrl: uploadedVideoUrl,
        thumbnailUrl: uploadedThumbUrl,
        duration: videoDurationSec > 0 ? formatSeconds(videoDurationSec) : isShortMode ? '0:45' : '02:30',
        durationSeconds: videoDurationSec > 0 ? Math.round(videoDurationSec) : isShortMode ? 45 : 150,
        videoKind: isShortMode ? 'reel' : 'long',
        isShort: isShortMode,
        category: CATEGORY_MAP[category] || 'Community',
        hashtags: tags,
        viewsCount: 1,
        channelSubscribers: 120,
        reactions: { total: 0, likeCount: 0, loveCount: 0, subhanallahCount: 0, mashaallahCount: 0 },
        comments: [],
        sharesCount: 0,
        createdAtMillis: Date.now(),
      };

      await onPostCreated(newPost);
      setProgress(100);
      setTitle('');
      setVideoFile(null);
      setThumbFile(null);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Upload failed. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step !== 'choose' && (
              <button
                type="button"
                onClick={() => {
                  if (!uploading) setStep('choose');
                }}
                className="w-8 h-8 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="text-base font-extrabold text-zinc-950">
              {step === 'choose'
                ? 'Create on Peaceverse24'
                : isShortMode
                ? 'Upload Peace Short (15s – 1 min)'
                : 'Upload Peace Video'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!uploading) onClose();
            }}
            className="w-9 h-9 rounded-full hover:bg-zinc-100 flex items-center justify-center text-zinc-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Easy Chooser (Upload Video / Peace Short / Go Live) */}
        {step === 'choose' ? (
          <div className="p-5 space-y-3">
            <button
              type="button"
              onClick={() => setStep('video')}
              className="w-full p-4 rounded-2xl border border-zinc-200 hover:border-[#DC2626] hover:bg-red-50/40 flex items-center gap-4 text-left transition-all cursor-pointer"
            >
              <span className="w-12 h-12 rounded-2xl bg-[#DC2626] text-white flex items-center justify-center shrink-0">
                <Video className="w-6 h-6" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-zinc-950">Upload Video</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Lectures, Quran tilawat, Nasheed, or Kids stories (16:9 YouTube style)
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStep('short')}
              className="w-full p-4 rounded-2xl border border-zinc-200 hover:border-[#DC2626] hover:bg-red-50/40 flex items-center gap-4 text-left transition-all cursor-pointer"
            >
              <span className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                <Film className="w-6 h-6" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-zinc-950">Upload Peace Short</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Vertical swipe-up short video · 15 sec to 1 min
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectGoLive();
              }}
              className="w-full p-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 flex items-center gap-4 text-left transition-all cursor-pointer"
            >
              <span className="w-12 h-12 rounded-2xl bg-[#16A34A] text-white flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-zinc-950">Go Live (6-Seat Peace Room)</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  1 Big Host + 5 Guests · Live Chat, Gifts &amp; 5-min Halal PK (18+ NID required)
                </p>
              </div>
            </button>
          </div>
        ) : (
          /* Step 2: Easy Upload Form (Video -> Title, Hashtag, Thumbnail -> Done!) */
          <form onSubmit={handlePublish} className="p-5 space-y-4 overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Video Picker */}
            <label className="block border-2 border-dashed border-zinc-300 hover:border-[#16A34A] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-zinc-50">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoPick}
                disabled={uploading}
                className="hidden"
              />
              {videoFile ? (
                <div className="space-y-2">
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="w-full max-h-44 rounded-xl bg-black mx-auto"
                  />
                  <p className="text-xs font-bold text-[#16A34A] flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="truncate max-w-[260px]">{videoFile.name}</span>
                    {videoDurationSec > 0 && <span>({formatSeconds(videoDurationSec)})</span>}
                  </p>
                </div>
              ) : (
                <div className="py-4 space-y-1.5">
                  <Upload className="w-7 h-7 text-[#DC2626] mx-auto" />
                  <p className="text-sm font-extrabold text-zinc-900">
                    Choose {isShortMode ? 'Short Video (15s–1 min)' : 'Video File'}
                  </p>
                  <p className="text-xs text-zinc-500">MP4, MOV, WebM · Halal &amp; Peaceful only</p>
                </div>
              )}
            </label>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">Video Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write a clear, peaceful video title..."
                maxLength={140}
                className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 text-sm text-zinc-950 focus:outline-none focus:border-[#16A34A]"
              />
            </div>

            {/* Hashtags & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Hashtags</label>
                <input
                  type="text"
                  value={hashtagsText}
                  onChange={(e) => setHashtagsText(e.target.value)}
                  placeholder="#Quran #Peace #Bangladesh"
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:border-[#16A34A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-900 bg-white focus:outline-none focus:border-[#16A34A]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Thumbnail Picker */}
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbPick}
                disabled={uploading}
                className="hidden"
              />
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {thumbPreviewUrl ? (
                    <img src={thumbPreviewUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-zinc-500" />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-zinc-900 truncate">
                    {thumbFile ? thumbFile.name : 'Add Custom Thumbnail (Optional)'}
                  </p>
                  <p className="text-[11px] text-zinc-500">16:9 JPG or PNG recommended</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#16A34A] shrink-0">Choose</span>
            </label>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#DC2626]" />
                    <span>Uploading to Peaceverse24...</span>
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-zinc-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#DC2626] to-[#16A34A] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full h-12 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-60 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing ({progress}%)...</span>
                </>
              ) : (
                <span>Publish Now — Done!</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
