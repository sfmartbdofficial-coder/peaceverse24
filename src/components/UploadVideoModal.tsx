import React, { useState } from 'react';
import { X, Upload, Video, ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';
import { IslamicVideo, CategoryType } from '../types';

interface UploadVideoModalProps {
  onClose: () => void;
  onUploadSuccess: (video: IslamicVideo) => void;
}

export const UploadVideoModal: React.FC<UploadVideoModalProps> = ({
  onClose,
  onUploadSuccess,
}) => {
  const [titleBangla, setTitleBangla] = useState('');
  const [titleEnglish, setTitleEnglish] = useState('');
  const [category, setCategory] = useState<CategoryType>('Quran');
  const [youtubeId, setYoutubeId] = useState('');
  const [channelName, setChannelName] = useState('My Islamic Channel');
  const [description, setDescription] = useState('');
  const [arabicSnippet, setArabicSnippet] = useState('');
  const [translationSnippet, setTranslationSnippet] = useState('');
  const [tags, setTags] = useState('Quran, Recitation, Peaceverse24.com, Halal');
  const [halalConfirmed, setHalalConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract YouTube ID if full URL pasted
  const handleUrlChange = (value: string) => {
    let cleanId = value.trim();
    if (cleanId.includes('v=')) {
      cleanId = cleanId.split('v=')[1]?.split('&')[0] || cleanId;
    } else if (cleanId.includes('youtu.be/')) {
      cleanId = cleanId.split('youtu.be/')[1]?.split('?')[0] || cleanId;
    }
    setYoutubeId(cleanId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleBangla.trim()) {
      setErrorMsg('দয়া করে ভিডিওটির বাংলা শিরোনাম লিখুন।');
      return;
    }
    if (!youtubeId.trim()) {
      setErrorMsg('দয়া করে ইউটিউব ভিডিও লিঙ্ক বা ভিডিও আইডি প্রদান করুন।');
      return;
    }
    if (!halalConfirmed) {
      setErrorMsg('ভিডিওটি ১০০% হালাল ও বাদ্যযন্ত্রমুক্ত তা নিশ্চিত করতে টিক দিন।');
      return;
    }

    const newVideo: IslamicVideo = {
      id: `user-vid-${Date.now()}`,
      title: titleEnglish.trim() || titleBangla.trim(),
      titleBangla: titleBangla.trim(),
      category: category,
      duration: '10:00',
      views: '1',
      timestamp: 'Just now',
      thumbnail: `https://img.youtube.com/vi/${youtubeId.trim()}/hqdefault.jpg`,
      youtubeId: youtubeId.trim(),
      channel: {
        id: `ch-user-${Date.now()}`,
        name: channelName.trim() || 'Halal Creator',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        verified: true,
        subscribers: '1K',
        isSubscribed: true,
      },
      description: description.trim() || '100% Halal Islamic content uploaded to Peaceverse24.com.',
      arabicSnippet: arabicSnippet.trim() || undefined,
      translationSnippet: translationSnippet.trim() || undefined,
      reference: 'Peaceverse24.com User Submission',
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      likes: '1',
    };

    onUploadSuccess(newVideo);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white text-black w-full max-w-xl rounded-2xl border border-[#E4E6EB] shadow-2xl flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E4E6EB] bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-black flex items-center gap-1.5">
                Peaceverse24.com Studio - কন্টেন্ট আপলোড (Upload Video)
              </h2>
              <p className="text-[11px] text-[#65676B]">
                ইউটিউবের বিকল্প ১০০% হালাল প্ল্যাটফর্মে আপনার কন্টেন্ট প্রকাশ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#65676B] hover:text-black hover:bg-[#F0F2F5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[78vh] overflow-y-auto no-scrollbar text-xs bg-white">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title Bangla */}
          <div>
            <label className="block font-semibold text-black mb-1">
              ভিডিওর বাংলা শিরোনাম (Bengali Title) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="যেমন: সূরা আর-রহমান তিলাওয়াত অথবা নামাজের সঠিক নিয়ম"
              value={titleBangla}
              onChange={(e) => setTitleBangla(e.target.value)}
              className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF]"
            />
          </div>

          {/* Title English */}
          <div>
            <label className="block font-semibold text-black mb-1">
              ইংরেজি শিরোনাম (English Title)
            </label>
            <input
              type="text"
              placeholder="e.g., Beautiful Surah Rahman Recitation"
              value={titleEnglish}
              onChange={(e) => setTitleEnglish(e.target.value)}
              className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF]"
            />
          </div>

          {/* YouTube Video URL or ID */}
          <div>
            <label className="block font-semibold text-black mb-1">
              ইউটিউব ভিডিও লিঙ্ক অথবা আইডি (YouTube Link / ID) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="https://www.youtube.com/watch?v=... অথবা BvWfq37j9_4"
              value={youtubeId}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF] font-mono text-xs"
            />
            <span className="text-[10px] text-[#65676B] mt-1 block">
              যেকোনো ইসলামিক ইউটিউব ভিডিওর লিঙ্ক পেস্ট করলে স্বয়ংক্রিয়ভাবে আইডি গ্রহণ করবে।
            </span>
          </div>

          {/* Category & Channel Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-black mb-1">
                ক্যাটাগরি (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2.5 text-black focus:outline-none focus:border-[#0866FF]"
              >
                <option value="Quran">Quran (পবিত্র কুরআন)</option>
                <option value="Hadith">Hadith (সহীহ হাদিস)</option>
                <option value="Dua">Dua (মাসনূন দোয়া)</option>
                <option value="Video">Video (ইসলামিক লেকচার)</option>
                <option value="Nasheed">Nasheed (বাদ্যহীন নাশিদ)</option>
                <option value="Live">Live (লাইভ স্ট্রিম)</option>
                <option value="Kids">Kids (শিশুতোষ ইসলামিক শিক্ষা)</option>
                <option value="Seerah">Seerah (নবীদের জীবনী)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-black mb-1">
                চ্যানেল বা বক্তার নাম (Channel Name)
              </label>
              <input
                type="text"
                placeholder="যেমন: Sheikh Mishary অথবা My Islamic Channel"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2.5 text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF]"
              />
            </div>
          </div>

          {/* Arabic snippet & Bengali translation (Optional) */}
          <div className="p-3 rounded-xl bg-white border border-[#E4E6EB] space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>মূল আরবি আয়াত ও অর্থ (ঐচ্ছিক)</span>
            </div>
            <textarea
              rows={2}
              placeholder="মূল আরবি টেক্সট (যদি কুরআন বা হাদিস হয়)..."
              value={arabicSnippet}
              onChange={(e) => setArabicSnippet(e.target.value)}
              className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg p-2 text-right font-arabic text-sm text-black focus:outline-none focus:border-[#0866FF]"
            />
            <input
              type="text"
              placeholder="বাংলা অনুবাদ..."
              value={translationSnippet}
              onChange={(e) => setTranslationSnippet(e.target.value)}
              className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-[#0866FF]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-black mb-1">
              বিস্তারিত বিবরণ (Description)
            </label>
            <textarea
              rows={3}
              placeholder="ভিডিও সম্পর্কে প্রয়োজনীয় তথ্য ও উপদেশ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-black placeholder-[#65676B] focus:outline-none focus:border-[#0866FF]"
            />
          </div>

          {/* 100% Halal Assurance Checkbox */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <input
              type="checkbox"
              id="halalConfirm"
              checked={halalConfirmed}
              onChange={(e) => setHalalConfirmed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-emerald-300 cursor-pointer"
            />
            <label htmlFor="halalConfirm" className="text-xs text-black leading-relaxed cursor-pointer">
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ১০০% হালাল কন্টেন্ট অঙ্গীকার
              </span>
              আমি সাক্ষ্য দিচ্ছি যে এই ভিডিওটিতে কোনো বাদ্যযন্ত্র, অনৈসলামিক বিজ্ঞাপন বা হারাম বিষয়বস্তু নেই এবং এটি কুরআন-সুন্নাহ সম্মত।
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E4E6EB]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F0F2F5] text-black hover:bg-[#E4E6EB] font-semibold transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#0866FF] hover:bg-[#166fe5] text-white font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Peaceverse24.com-এ প্রকাশ করুন (Publish)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
