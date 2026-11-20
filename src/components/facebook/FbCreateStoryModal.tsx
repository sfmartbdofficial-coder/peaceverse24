import React, { useState, useRef } from 'react';
import {
  X,
  Settings,
  Music,
  Type,
  LayoutGrid,
  Layers,
  Camera,
  Upload,
  Check,
  ChevronDown,
  Sparkles,
  Play
} from 'lucide-react';
import { StoryItem, UserProfile } from '../../types';
import { validateMediaUpload, sanitizeInput } from '../../utils/security';

interface FbCreateStoryModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onStoryCreated: (newStory: StoryItem) => void;
}

const GALLERY_PHOTOS = [
  {
    id: 'g-1',
    url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=600&q=80',
    title: 'শান্ত কুরআন তিলাওয়াত',
    arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
  },
  {
    id: 'g-2',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80',
    title: 'পবিত্র মক্কা মুকাররমা',
    arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ',
  },
  {
    id: 'g-3',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=600&q=80',
    title: 'মসজিদে নববী মদিনা',
    arabic: 'الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ',
  },
  {
    id: 'g-4',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    title: 'ইসলামিক ক্যালিগ্রাফি আর্ট',
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
  },
  {
    id: 'g-5',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    title: 'শান্ত স্নিগ্ধ প্রকৃতি',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
  },
  {
    id: 'g-6',
    url: '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg',
    title: 'Peace Verse ক্রাফট',
    arabic: 'السَّلَامُ عَلَيْكُمْ',
  },
  {
    id: 'g-7',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    title: 'উম্মাহ ও ভ্রাতৃত্ব',
    arabic: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ',
  },
  {
    id: 'g-8',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    title: 'শুকরিয়া ও তাওয়াক্কুল',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
  },
  {
    id: 'g-9',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    title: 'দোয়া ও মোনাজাত',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً',
  },
];

const STORY_TEMPLATES = [
  {
    id: 'tpl-jumma',
    title: 'জুমুআহ মুবারক',
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ',
    gradient: 'from-emerald-800 via-teal-900 to-black',
    img: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'tpl-kursi',
    title: 'আয়াতুল কুরসি ও সুরক্ষা',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    gradient: 'from-indigo-900 via-slate-900 to-black',
    img: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'tpl-dua',
    title: 'সকাল-সন্ধ্যার মাসনূন দোয়া',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً',
    gradient: 'from-teal-800 via-emerald-950 to-black',
    img: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'tpl-shukriya',
    title: 'আলহামদুলিল্লাহ — প্রতিদিনের শুকরিয়া',
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    gradient: 'from-amber-900 via-stone-900 to-black',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
];

export const FbCreateStoryModal: React.FC<FbCreateStoryModalProps> = ({
  userProfile,
  onClose,
  onStoryCreated,
}) => {
  const [activeMode, setActiveMode] = useState<'gallery' | 'text' | 'music' | 'collage' | 'templates'>('gallery');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [collagePhotos, setCollagePhotos] = useState<string[]>([
    GALLERY_PHOTOS[0].url,
    GALLERY_PHOTOS[1].url,
  ]);
  const [storyText, setStoryText] = useState('');
  const [arabicText, setArabicText] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-emerald-950 via-teal-900 to-black');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const check = validateMediaUpload(file, ['image']);
      if (!check.valid) {
        setUploadError(check.error || 'Max 5MB image file allowed.');
        e.target.value = '';
        return;
      }
      setUploadError(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          setUploadedPhotos((prev) => [url, ...prev]);
          setSelectedPhoto(url);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishStory = (imgUrl?: string, caption?: string, arabic?: string) => {
    const newStory: StoryItem = {
      id: `story-${Date.now()}`,
      authorName: userProfile.name,
      authorAvatar: userProfile.avatar,
      bgGradient: selectedGradient,
      previewImage: imgUrl || selectedPhoto || undefined,
      banglaText: sanitizeInput(caption || storyText || 'নতুন স্টোরি আপডেট 🌸'),
      arabicText: arabic || arabicText ? sanitizeInput(arabic || arabicText) : undefined,
      timestamp: 'এখনই',
    };
    onStoryCreated(newStory);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-black flex flex-col animate-in fade-in">
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleDeviceUpload}
      />

      {/* 1. Top Bar matching Screenshot 3 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] bg-white">
        <button
          onClick={onClose}
          className="p-1 rounded-full text-black hover:bg-[#F0F2F5] transition-colors"
          title="বন্ধ করুন (Close)"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-base font-bold text-black">Create story</h1>

        <button
          onClick={() => {}}
          className="p-1.5 rounded-full text-black hover:bg-[#F0F2F5] transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {uploadError && (
        <div className="mx-4 mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
          ⚠️ {uploadError}
        </div>
      )}

      {/* 2. Top Interactive Tiles matching Screenshot 3: [ Aa Text (New) ] [ 🎵 Music ] [ ⚏ Collage ] [ Templates ] */}
      <div className="p-3 bg-white border-b border-[#E4E6EB]">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {/* Tile 1: Aa Text */}
          <button
            onClick={() => setActiveMode('text')}
            className={`flex-1 min-w-[90px] h-24 rounded-2xl p-2.5 flex flex-col justify-between items-center text-center transition-all border ${
              activeMode === 'text'
                ? 'bg-gradient-to-tr from-purple-700 to-indigo-600 text-white border-[#0866FF] ring-2 ring-[#0866FF] scale-105'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black border-[#E4E6EB]'
            }`}
          >
            <div className="w-full flex justify-end">
              <span className="bg-[#0866FF] text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider text-white">
                New
              </span>
            </div>
            <Type className={`w-7 h-7 stroke-[2.5] ${activeMode === 'text' ? 'text-white' : 'text-black'}`} />
            <span className="text-xs font-bold">Text</span>
          </button>

          {/* Tile 2: Music / Tilawat */}
          <button
            onClick={() => {
              setActiveMode('music');
              setStoryText('সূরা আর-রহমানের মধুর তিলাওয়াত 🎵');
              setArabicText('فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ');
            }}
            className={`flex-1 min-w-[90px] h-24 rounded-2xl p-2.5 flex flex-col justify-between items-center text-center transition-all border ${
              activeMode === 'music'
                ? 'bg-gradient-to-tr from-teal-700 to-emerald-600 text-white border-[#0866FF] ring-2 ring-[#0866FF] scale-105'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black border-[#E4E6EB]'
            }`}
          >
            <div className="w-full h-3" />
            <Music className={`w-7 h-7 stroke-[2.5] ${activeMode === 'music' ? 'text-white' : 'text-teal-600'}`} />
            <span className="text-xs font-bold">Music</span>
          </button>

          {/* Tile 3: Collage */}
          <button
            onClick={() => setActiveMode('collage')}
            className={`flex-1 min-w-[90px] h-24 rounded-2xl p-2.5 flex flex-col justify-between items-center text-center transition-all border ${
              activeMode === 'collage'
                ? 'bg-[#0866FF] text-white border-[#0866FF] ring-2 ring-[#0866FF] scale-105'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black border-[#E4E6EB]'
            }`}
          >
            <div className="w-full flex justify-end">
              <span className="bg-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider text-white">
                New
              </span>
            </div>
            <LayoutGrid className={`w-7 h-7 stroke-[2.5] ${activeMode === 'collage' ? 'text-white' : 'text-[#0866FF]'}`} />
            <span className="text-xs font-bold">Collage</span>
          </button>

          {/* Tile 4: Templates */}
          <button
            onClick={() => setActiveMode('templates')}
            className={`flex-1 min-w-[90px] h-24 rounded-2xl p-2.5 flex flex-col justify-between items-center text-center transition-all border ${
              activeMode === 'templates'
                ? 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-500 scale-105'
                : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black border-[#E4E6EB]'
            }`}
          >
            <div className="w-full h-3" />
            <Layers className={`w-7 h-7 stroke-[2.5] ${activeMode === 'templates' ? 'text-white' : 'text-amber-600'}`} />
            <span className="text-xs font-bold">Templates</span>
          </button>
        </div>
      </div>

      {/* 3. Text Story Mode Screen */}
      {activeMode === 'text' && (
        <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-tr from-purple-900 via-indigo-950 to-neutral-950 animate-in fade-in">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setActiveMode('gallery')}
              className="text-xs text-[#b0b3b8] hover:text-white"
            >
              ← Back to gallery
            </button>
            <div className="flex gap-1.5">
              {[
                'from-purple-900 to-indigo-950',
                'from-emerald-900 to-teal-950',
                'from-amber-900 to-stone-950',
                'from-blue-900 to-slate-950',
              ].map((g, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedGradient(g)}
                  className={`w-6 h-6 rounded-full bg-gradient-to-tr ${g} border-2 border-white`}
                />
              ))}
            </div>
          </div>

          <div className="text-center space-y-4 my-auto">
            <textarea
              rows={3}
              placeholder="Start typing your story / মনের কথা বা দ্বীনি নসিহত লিখুন..."
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              className="w-full bg-transparent text-center text-2xl font-bold font-bengali text-white outline-none resize-none placeholder-white/50"
              autoFocus
            />
            <input
              type="text"
              placeholder="আরবি আয়াত বা দোআ (ঐচ্ছিক)..."
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              className="w-full bg-transparent text-center text-lg font-arabic text-emerald-300 outline-none placeholder-emerald-300/40"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveMode('gallery')}
              className="flex-1 py-3 rounded-xl bg-[#3a3b3c] font-bold text-sm"
            >
              বাতিল
            </button>
            <button
              onClick={() => handlePublishStory()}
              disabled={!storyText.trim() && !arabicText.trim()}
              className="flex-1 py-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] font-bold text-sm text-white disabled:opacity-40"
            >
              শেয়ার করুন
            </button>
          </div>
        </div>
      )}

      {/* 4. Full Gallery Grid matching Screenshot 3 */}
      {activeMode === 'gallery' && (
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-white">
          {/* Gallery Subheader: "Gallery ⌄" + "Select multiple" */}
          <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-20 border-b border-[#E4E6EB]">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 cursor-pointer hover:text-[#0866FF]"
              title="আপনার ফোনের গ্যালারি খুলুন"
            >
              <span className="font-bold text-sm text-black">Gallery</span>
              <ChevronDown className="w-4 h-4 text-[#65676B]" />
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-full bg-[#0866FF] hover:bg-[#166fe5] text-xs font-bold text-white flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>ফোনের গ্যালারি খুলুন</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs font-semibold text-black transition-colors"
              >
                Select multiple
              </button>
            </div>
          </div>

          {/* Prominent Banner for Device Gallery */}
          <div className="p-3 bg-white border-b border-[#E4E6EB] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-black">আপনার মোবাইল বা পিসির গ্যালারি</p>
                <p className="text-[10px] text-[#65676B]">নিজের ছবি বা তিলাওয়াত সিলেক্ট করুন</p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs font-bold text-black border border-[#CCD0D5]"
            >
              ফাইল বাছুন
            </button>
          </div>

          {/* Grid of Images matching Screenshot 3 */}
          <div className="p-1 grid grid-cols-3 gap-1 flex-1 bg-white">
            {/* Device Gallery Big Tile */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square bg-[#E7F3FF] hover:bg-[#DBEAFE] flex flex-col items-center justify-center gap-1.5 transition-all border-2 border-dashed border-[#0866FF] p-2"
            >
              <div className="w-10 h-10 rounded-full bg-[#0866FF] flex items-center justify-center text-white shadow-md">
                <Camera className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-black text-center leading-tight">
                ফোনের গ্যালারি
              </span>
            </button>

            {/* User Uploaded Photos */}
            {uploadedPhotos.map((url, i) => (
              <div
                key={`up-${i}`}
                onClick={() => handlePublishStory(url, 'আমার নতুন ফটো স্টোরি 🌸')}
                className="aspect-square relative overflow-hidden group cursor-pointer border border-[#E4E6EB]"
              >
                <img src={url} alt="Uploaded" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="px-2 py-1 rounded bg-[#0866FF] text-xs font-bold text-white">Share</span>
                </div>
              </div>
            ))}

            {/* Presets Gallery Photos matching Screenshot */}
            {GALLERY_PHOTOS.map((item) => (
              <div
                key={item.id}
                onClick={() => handlePublishStory(item.url, item.title, item.arabic)}
                className="aspect-square relative overflow-hidden group cursor-pointer bg-[#F0F2F5] border border-[#E4E6EB]"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                  <p className="text-[10px] font-bold text-white truncate drop-shadow">{item.title}</p>
                </div>
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-5 h-5 rounded-full bg-[#0866FF] text-white flex items-center justify-center shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 5. Music Story Mode */}
      {activeMode === 'music' && (
        <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-tr from-teal-950 via-emerald-950 to-neutral-950 animate-in fade-in">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setActiveMode('gallery')}
              className="text-xs text-[#b0b3b8] hover:text-white"
            >
              ← Back to gallery
            </button>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Music className="w-4 h-4" /> ইসলামিক তিলাওয়াত ও নাসহীদ
            </span>
          </div>

          <div className="text-center space-y-4 my-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-300">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
            <p className="text-xl font-bold font-bengali text-white">সূরা আর-রহমানের মধুর তিলাওয়াত</p>
            <p className="text-lg font-arabic text-emerald-200">فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveMode('gallery')}
              className="flex-1 py-3 rounded-xl bg-[#3a3b3c] text-white font-bold text-sm"
            >
              বাতিল
            </button>
            <button
              onClick={() => handlePublishStory('https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=600&q=80', 'সূরা আর-রহমানের মধুর তিলাওয়াত 🎵', 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ')}
              className="flex-1 py-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm"
            >
              Share Story
            </button>
          </div>
        </div>
      )}

      {/* 6. Collage Mode */}
      {activeMode === 'collage' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-black">Photo Collage Builder</h2>
              <p className="text-xs text-[#65676B]">২ থেকে ৪টি ছবি বাছাই করে কোলাজ স্টোরি তৈরি করুন</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveMode('gallery')}
              className="px-3 py-1 rounded-lg bg-[#F0F2F5] text-xs font-bold text-black cursor-pointer"
            >
              Back
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-[#F0F2F5] border border-[#E4E6EB] max-w-xs mx-auto">
            {collagePhotos.slice(0, 4).map((url, idx) => (
              <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-white">
                <img src={url} alt={`Collage ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[...uploadedPhotos, ...GALLERY_PHOTOS.map((g) => g.url)].map((url, i) => {
              const selected = collagePhotos.includes(url);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setCollagePhotos((prev) =>
                      prev.includes(url)
                        ? prev.length > 1
                          ? prev.filter((u) => u !== url)
                          : prev
                        : prev.length < 4
                        ? [...prev, url]
                        : [...prev.slice(1), url]
                    );
                  }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 relative cursor-pointer ${
                    selected ? 'border-emerald-600' : 'border-transparent'
                  }`}
                >
                  <img src={url} alt="Choice" className="w-full h-full object-cover" />
                  {selected && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() =>
              handlePublishStory(
                collagePhotos[0],
                `আমার ফটো কোলাজ স্টোরি (${collagePhotos.length} ছবি)`,
                'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ'
              )
            }
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
          >
            Share Collage
          </button>
        </div>
      )}

      {/* 7. Templates Mode */}
      {activeMode === 'templates' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-black">Islamic Story Templates</h2>
              <p className="text-xs text-[#65676B]">প্রস্তুতকৃত ইসলামিক কার্ড থেকে স্টোরি শেয়ার করুন</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveMode('gallery')}
              className="px-3 py-1 rounded-lg bg-[#F0F2F5] text-xs font-bold text-black cursor-pointer"
            >
              Back
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {STORY_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handlePublishStory(tpl.img, tpl.title, tpl.arabic)}
                className={`rounded-2xl overflow-hidden border border-[#E4E6EB] bg-gradient-to-b ${tpl.gradient} text-white p-3 h-48 flex flex-col justify-between cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all relative`}
              >
                <img
                  src={tpl.img}
                  alt={tpl.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-35"
                />
                <div className="relative z-10 flex justify-end">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-[10px] font-bold">
                    Use
                  </span>
                </div>
                <div className="relative z-10 space-y-1">
                  <p className="font-arabic text-sm text-emerald-200 leading-snug">{tpl.arabic}</p>
                  <p className="font-bengali text-xs font-bold text-white">{tpl.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
