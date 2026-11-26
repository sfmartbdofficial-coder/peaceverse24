import React, { useState, useRef } from 'react';
import { ArrowLeft, Instagram, Heart, Bookmark, Plus, Camera, ShieldCheck } from 'lucide-react';
import { PostItem, UserProfile } from '../../types';
import { sanitizeInput, validateMediaUpload } from '../../utils/security';

interface PeaceInstaItem {
  id: string;
  authorName: string;
  caption: string;
  imageUrl: string;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
  timeAgo: string;
}

interface PeaceInstaViewProps {
  userProfile: UserProfile;
  posts: PostItem[];
  onBack: () => void;
}

export const PeaceInstaView: React.FC<PeaceInstaViewProps> = ({
  userProfile,
  posts,
  onBack,
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const initialPhotos: PeaceInstaItem[] = posts
    .filter((p) => p.mediaType === 'image' && p.mediaUrl)
    .slice(0, 12)
    .map((p) => ({
      id: p.id,
      authorName: p.author.name,
      caption: p.contentBangla || 'আলহামদুলিল্লাহ • Peace Insta',
      imageUrl: p.mediaUrl || '',
      likes: p.reactions?.total || 0,
      timeAgo: p.timeAgo,
    }));

  const [items, setItems] = useState<PeaceInstaItem[]>(initialPhotos);

  const handleSelectPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const check = validateMediaUpload(file, ['image']);
    if (!check.valid) {
      setUploadError(check.error || 'অবৈধ ছবি ফাইল (সর্বোচ্চ ৫ মেগাবাইট)।');
      return;
    }
    setUploadError(null);
    setSelectedFileUrl(URL.createObjectURL(file));
  };

  const handlePostPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileUrl) return;
    const newItem: PeaceInstaItem = {
      id: `insta-${Date.now()}`,
      authorName: sanitizeInput(
        userProfile.name && userProfile.name !== 'New Member' ? userProfile.name : 'Member'
      ),
      caption: sanitizeInput(captionDraft.trim()) || 'হালাল ভিজ্যুয়াল স্টোরি • Peace Insta',
      imageUrl: selectedFileUrl,
      likes: 0,
      isLiked: false,
      timeAgo: 'এইমাত্র',
    };
    setItems((prev) => [newItem, ...prev]);
    setSelectedFileUrl(null);
    setCaptionDraft('');
  };

  return (
    <div className="min-h-screen bg-white text-black pb-16">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelectPhoto}
      />

      <header className="sticky top-0 z-30 h-14 bg-white border-b border-[#E4E6EB] px-3 sm:px-6">
        <div className="max-w-2xl mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="min-w-[44px] min-h-[44px] -ml-2 rounded-full hover:bg-[#F0F2F5] flex items-center justify-center text-black cursor-pointer"
              aria-label="Back to Peaceverse24.com"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                <Instagram className="w-4 h-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight truncate whitespace-nowrap text-black">
                Peace Insta
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ছবি</span>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {uploadError && (
          <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {uploadError}
          </div>
        )}
        {selectedFileUrl && (
          <form
            onSubmit={handlePostPhoto}
            className="bg-white border border-[#E4E6EB] rounded-2xl p-4 space-y-3"
          >
            <img
              src={selectedFileUrl}
              alt="Preview"
              className="w-full max-h-72 object-cover rounded-xl"
            />
            <input
              type="text"
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              placeholder="ছবির ক্যাপশন লিখুন..."
              className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-sm text-black focus:outline-none focus:border-[#0866FF]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedFileUrl(null)}
                className="px-4 py-2 rounded-xl bg-[#E4E6EB] text-black text-xs font-semibold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0866FF] text-white text-xs font-bold cursor-pointer"
              >
                পোস্ট করুন
              </button>
            </div>
          </form>
        )}

        {items.length === 0 ? (
          <div className="bg-white border border-[#E4E6EB] rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F0F2F5] flex items-center justify-center mx-auto text-[#65676B]">
              <Camera className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-black">Peace Insta ভিজ্যুয়াল স্টোরিজ</h2>
            <p className="text-xs text-[#65676B] max-w-sm mx-auto">
              প্রকৃতি, ইসলামিক ক্যালিগ্রাফি ও হালাল ফটোগ্রাফি শেয়ার করতে উপরের "নতুন ছবি" বাটনে ক্লিক করুন।
            </p>
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-[#E4E6EB] rounded-2xl overflow-hidden"
            >
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-bold text-black truncate">{item.authorName}</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0866FF] shrink-0" />
                  <span className="text-xs text-[#65676B]">· {item.timeAgo}</span>
                </div>
              </div>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.caption}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[420px] object-cover bg-[#F0F2F5]"
                />
              )}
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x.id === item.id
                            ? {
                                ...x,
                                isLiked: !x.isLiked,
                                likes: Math.max(0, x.likes + (x.isLiked ? -1 : 1)),
                              }
                            : x
                        )
                      )
                    }
                    className={`flex items-center gap-1.5 text-xs font-semibold tabular-nums cursor-pointer ${
                      item.isLiked ? 'text-rose-600' : 'text-[#65676B]'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${item.isLiked ? 'fill-current' : ''}`} />
                    <span>{item.likes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((x) => (x.id === item.id ? { ...x, isSaved: !x.isSaved } : x))
                      )
                    }
                    className={`cursor-pointer ${
                      item.isSaved ? 'text-[#0866FF]' : 'text-[#65676B]'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${item.isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <p className="text-sm leading-relaxed text-black">{item.caption}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};
