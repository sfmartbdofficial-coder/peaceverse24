import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  MoreHorizontal,
  Music,
  Users,
  MapPin,
  Smile,
  Image as ImageIcon,
  Radio,
  BookOpen,
  Globe,
  Upload,
  Check,
  Search,
  MessageSquare,
  Sparkles,
  Camera,
  Film,
  Lock,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { PostItem, UserProfile } from '../../types';
import { checkPost, runHalalContentFilter } from '../../lib/halalFilter';
import { createRealtimePost } from '../../lib/firebase';

interface FbCreatePostModalProps {
  userProfile: UserProfile;
  initialPhoto?: string | null;
  onClose: () => void;
  onPostCreated: (newPost: PostItem) => void;
  onOpenLive?: () => void;
}

const AVAILABLE_FRIENDS = [
  { id: 'f1', name: 'Sujon Ahme', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
  { id: 'f2', name: 'Hassan Abdullah', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
  { id: 'f3', name: 'M Mo Ali Khan', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
  { id: 'f4', name: 'Robel Mahmud', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' },
  { id: 'f5', name: 'Tanzil Ahmed', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80' },
  { id: 'f6', name: 'Sohel Rana', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80' },
];

const ISLAMIC_FEELINGS = [
  { label: 'feeling grateful', emoji: '😇', bn: 'কৃতজ্ঞ অনুভব করছি' },
  { label: 'saying Alhamdulillah', emoji: '🤲', bn: 'আলহামদুলিল্লাহ' },
  { label: 'feeling blessed', emoji: '✨', bn: 'ধন্য বোধ করছি' },
  { label: 'feeling peaceful', emoji: '🕊️', bn: 'শান্তিময় অনুভব' },
  { label: 'saying SubhanAllah', emoji: '🌸', bn: 'সুবহানাল্লাহ' },
  { label: 'reciting Quran', emoji: '📖', bn: 'কুরআন তিলাওয়াতরত' },
  { label: 'fasting', emoji: '🌙', bn: 'রোজা পালনরত' },
  { label: 'making Dua', emoji: '🤍', bn: 'দোয়ায় মগ্ন' },
];

const LOCATIONS = [
  'লক্ষ্মীপুর - Lakshmipur, Bangladesh',
  'Baitul Mukarram National Mosque, Dhaka',
  'Makkah Al-Mukarramah, Saudi Arabia',
  'Al-Masjid an-Nabawi, Madinah',
  'Lalbagh Fort Mosque, Dhaka',
  'Sylhet Shahi Eidgah, Sylhet',
  'Dhaka, Bangladesh',
];

export const FbCreatePostModal: React.FC<FbCreatePostModalProps> = ({
  userProfile,
  initialPhoto = null,
  onClose,
  onPostCreated,
  onOpenLive,
}) => {
  const [content, setContent] = useState('');
  
  // Privacy selector: public | friends | private
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false);

  // Moderation state
  const [isVerifyingHalal, setIsVerifyingHalal] = useState(false);
  const [moderationError, setModerationError] = useState<{ status: string; reason: string } | null>(null);

  // Media / Photo / Video from user's device
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(initialPhoto || null);
  const [isVideo, setIsVideo] = useState(false);

  // Quran Verse / Hadith
  const [showAyahBox, setShowAyahBox] = useState(false);
  const [arabicText, setArabicText] = useState('');
  const [translationText, setTranslationText] = useState('');

  // Pills state
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);

  const [taggedFriends, setTaggedFriends] = useState<string[]>([]);
  const [showTagModal, setShowTagModal] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [showFeelingModal, setShowFeelingModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPhoto) {
      setSelectedPhoto(initialPhoto);
    }
  }, [initialPhoto]);

  // Real device gallery selection handler
  const handleDeviceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVid = file.type.startsWith('video');
      setIsVideo(isVid);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFriendTag = (friendName: string) => {
    if (taggedFriends.includes(friendName)) {
      setTaggedFriends(taggedFriends.filter((f: string) => f !== friendName));
    } else {
      setTaggedFriends([...taggedFriends, friendName]);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !arabicText.trim() && !selectedPhoto) return;

    setIsVerifyingHalal(true);
    setModerationError(null);

    // Run content moderation per user specification:
    // Step 1: যদি ALLOW_ALWAYS এর কোনো শব্দ থাকে, সাথে সাথে ALLOW
    // Step 2: শুধু BLOCK_WORDS 100% মিললে ব্লক
    // Step 3: বাকি সব ALLOW
    const filterResult = checkPost(content + ' ' + (arabicText || ''));

    setIsVerifyingHalal(false);

    if (!filterResult.isApproved) {
      setModerationError({
        status: 'blocked',
        reason: 'দুঃখিত, এই পোস্টে নিষিদ্ধ কনটেন্ট আছে',
      });
      return;
    }

    const privacyIcons: Record<'public' | 'friends' | 'private', string> = {
      public: '🌐',
      friends: '👥',
      private: '🔒',
    };

    const hasQuranVerse = filterResult.isQuranVerse || !!arabicText.trim();
    const finalArabic = arabicText.trim() || (filterResult.isQuranVerse ? content.trim() : undefined);

    const newPost: PostItem = {
      id: `post-${Date.now()}`,
      authorId: userProfile.id || userProfile.name,
      author: {
        name: userProfile.name,
        avatar: userProfile.avatar,
        verified: true,
        subtitle: `Just now • ${privacyIcons[privacy]}`,
      },
      timeAgo: 'Just now',
      isPublic: privacy === 'public',
      privacy,
      status: 'approved',
      contentBangla: content.trim(),
      arabicVerse: finalArabic,
      translation: translationText.trim() || undefined,
      mediaType: selectedPhoto ? (isVideo ? 'video' : 'image') : hasQuranVerse ? 'verseCard' : 'none',
      mediaUrl: selectedPhoto || undefined,
      category: hasQuranVerse ? 'Quran' : 'Community',
      location: selectedLocation || undefined,
      feeling: selectedFeeling || undefined,
      taggedFriends: taggedFriends.length > 0 ? taggedFriends : undefined,
      reactions: {
        total: 1,
        likeCount: 1,
        loveCount: 0,
        subhanallahCount: 0,
        mashaallahCount: 0,
      },
      userReaction: 'like',
      comments: [],
      sharesCount: 0,
      isSaved: false,
    };

    // Push to Firestore Real-time database
    await createRealtimePost(newPost);

    onPostCreated(newPost);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-[#050505] flex flex-col justify-between animate-in fade-in font-sans">
      
      {/* Hidden file input that triggers user's real phone/PC gallery */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        className="hidden"
        onChange={handleDeviceUpload}
      />

      {/* Top Header: [ ✕ ] "New post" [ ••• ] */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E6EB] bg-white">
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-full text-[#050505] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
          title="বন্ধ করুন"
          aria-label="Close"
        >
          <X className="w-6 h-6 stroke-[2.4]" />
        </button>

        <h1 className="text-[17px] font-bold text-[#050505]">New post</h1>

        <button
          type="button"
          onClick={() => {}}
          className="p-1.5 rounded-full text-[#050505] hover:bg-[#F0F2F5] transition-colors cursor-pointer"
          title="More options"
          aria-label="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 bg-white">
        
        {/* Author row */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#E4E6EB] bg-[#E7F3FF] text-[#0866FF] flex items-center justify-center font-extrabold text-lg shrink-0">
            {userProfile.avatar ? (
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{userProfile.name.trim().charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>

          <div className="flex-1">
            <h2 className="font-bold text-[15px] text-[#050505]">{userProfile.name}</h2>
            
            {/* Privacy Selector Dropdown Pill */}
            <div className="relative inline-block mt-0.5">
              <button
                type="button"
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E7F3FF] hover:bg-[#DBE7F2] text-[#0866FF] text-xs font-bold border border-[#0866FF]/20 transition-colors cursor-pointer"
              >
                {privacy === 'public' && (
                  <>
                    <Globe className="w-3 h-3 text-[#0866FF]" />
                    <span>Public</span>
                  </>
                )}
                {privacy === 'friends' && (
                  <>
                    <Users className="w-3 h-3 text-emerald-600" />
                    <span>Friends</span>
                  </>
                )}
                {privacy === 'private' && (
                  <>
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Only Me</span>
                  </>
                )}
                <span className="text-[9px] text-[#0866FF]">▼</span>
              </button>

              {showPrivacyMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPrivacyMenu(false)} />
                  <div className="absolute left-0 top-8 z-50 w-64 bg-white border border-[#E4E6EB] rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95">
                    <p className="text-[11px] font-bold text-[#65676B] px-2 py-1">পোস্টের প্রাইভেসী নির্বাচন করুন</p>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setPrivacy('public');
                        setShowPrivacyMenu(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                        privacy === 'public' ? 'bg-[#E7F3FF] border border-[#0866FF]/30' : 'hover:bg-[#F0F2F5]'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-[#0866FF] mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#050505]">Public (পাবলিক)</p>
                        <p className="text-[10px] text-[#65676B]">Peace World এর যেকোনো ব্যক্তি দেখতে পারবে</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrivacy('friends');
                        setShowPrivacyMenu(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                        privacy === 'friends' ? 'bg-emerald-50 border border-emerald-300' : 'hover:bg-[#F0F2F5]'
                      }`}
                    >
                      <Users className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#050505]">Friends (বন্ধুরা)</p>
                        <p className="text-[10px] text-[#65676B]">শুধুমাত্র আপনার ফ্রেন্ডলিস্টের ব্যক্তিরা দেখতে পারবে</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrivacy('private');
                        setShowPrivacyMenu(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                        privacy === 'private' ? 'bg-amber-50 border border-amber-300' : 'hover:bg-[#F0F2F5]'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-[#050505]">Only Me (শুধুমাত্র আমি)</p>
                        <p className="text-[10px] text-[#65676B]">শুধুমাত্র আপনি নিজে দেখতে পারবেন, ফিডে থাকবে না</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {selectedFeeling && (
              <p className="text-xs font-medium text-amber-700 mt-1">is {selectedFeeling}</p>
            )}
            {taggedFriends.length > 0 && (
              <p className="text-xs font-medium text-[#0866FF] mt-0.5">
                with {taggedFriends.join(', ')}
              </p>
            )}
            {selectedLocation && (
              <p className="text-xs font-medium text-emerald-700 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-500" />
                <span>at {selectedLocation}</span>
              </p>
            )}
          </div>
        </div>

        {/* Halal AI Verification Indicator */}
        {isVerifyingHalal && (
          <div className="p-3 bg-[#E7F3FF] border border-[#0866FF]/30 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-[#0866FF]">
            <Loader2 className="w-4 h-4 animate-spin text-[#0866FF]" />
            <span>Peace World Halal AI কনটেন্ট ও হালাল নীতিমালা যাচাই করছে...</span>
          </div>
        )}

        {/* Moderation Block Banner (Only shows when BLOCK_WORDS matched) */}
        {moderationError && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 animate-in fade-in">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="font-semibold text-[13px] text-amber-900">
              দুঃখিত, এই পোস্টে নিষিদ্ধ কনটেন্ট আছে
            </span>
          </div>
        )}

        {/* 4 Interactive Pills under Author:
            [ 🎵 Music ] [ 👤 Tag/collaborate ] [ 📍 Location ] [ 😊 Feeling ] */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Music */}
          <button
            type="button"
            onClick={() => setShowMusicPicker(!showMusicPicker)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
              selectedMusic
                ? 'bg-teal-50 border-teal-400 text-teal-700'
                : 'bg-[#F0F2F5] border-[#E4E6EB] text-[#050505] hover:bg-[#E4E6EB]'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-teal-600" />
            <span>{selectedMusic || 'Music'}</span>
          </button>

          {/* Tag/collaborate */}
          <button
            type="button"
            onClick={() => setShowTagModal(!showTagModal)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
              taggedFriends.length > 0
                ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                : 'bg-[#F0F2F5] border-[#E4E6EB] text-[#050505] hover:bg-[#E4E6EB]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#0866FF]" />
            <span>{taggedFriends.length > 0 ? `Tagged (${taggedFriends.length})` : 'Tag/collaborate'}</span>
          </button>

          {/* Location */}
          <button
            type="button"
            onClick={() => setShowLocationModal(!showLocationModal)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
              selectedLocation
                ? 'bg-red-50 border-red-400 text-red-700'
                : 'bg-[#F0F2F5] border-[#E4E6EB] text-[#050505] hover:bg-[#E4E6EB]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span>{selectedLocation ? selectedLocation.split(',')[0] : 'Location'}</span>
          </button>

          {/* Feeling */}
          <button
            type="button"
            onClick={() => setShowFeelingModal(!showFeelingModal)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer ${
              selectedFeeling
                ? 'bg-amber-50 border-amber-400 text-amber-800'
                : 'bg-[#F0F2F5] border-[#E4E6EB] text-[#050505] hover:bg-[#E4E6EB]'
            }`}
          >
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            <span>{selectedFeeling ? 'Feeling added' : 'Feeling'}</span>
          </button>
        </div>

        {/* Music Picker subdrawer */}
        {showMusicPicker && (
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-teal-300 space-y-2 animate-in fade-in">
            <p className="text-xs font-bold text-teal-700">ইসলামিক তিলাওয়াত বা নাসহীদ নির্বাচন করুন:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'সূরা আর-রহমান তিলাওয়াত 🎵',
                'আয়াতুল কুরসি তিলাওয়াত 🕊️',
                'তাওবার পবিত্র দোয়া 🤲',
                'সুমিষ্ট আযান ও সালাত 🕌'
              ].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setSelectedMusic(m);
                    setShowMusicPicker(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white border border-[#E4E6EB] text-xs font-medium text-[#050505] hover:bg-teal-50 hover:border-teal-400 cursor-pointer"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Friends Modal */}
        {showTagModal && (
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#0866FF]/30 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0866FF]">বন্ধুদের ট্যাগ করুন</span>
              <button type="button" onClick={() => setShowTagModal(false)} className="text-[#65676B] hover:text-[#050505] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
              {AVAILABLE_FRIENDS.map((f) => {
                const isTagged = taggedFriends.includes(f.name);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFriendTag(f.name)}
                    className={`w-full p-2 rounded-lg flex items-center justify-between text-xs cursor-pointer ${
                      isTagged ? 'bg-[#E7F3FF] text-[#0866FF] font-semibold' : 'hover:bg-[#E4E6EB] text-[#050505]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={f.avatar} alt={f.name} className="w-6 h-6 rounded-full object-cover" />
                      <span>{f.name}</span>
                    </div>
                    {isTagged && <Check className="w-3.5 h-3.5 text-[#0866FF]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Location Picker */}
        {showLocationModal && (
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-red-300 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600">অবস্থান নির্বাচন করুন</span>
              <button type="button" onClick={() => setShowLocationModal(false)} className="text-[#65676B] hover:text-[#050505] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowLocationModal(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#E4E6EB] text-xs text-[#050505] flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{loc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feeling Picker */}
        {showFeelingModal && (
          <div className="p-3 bg-[#F7F8FA] rounded-xl border border-amber-300 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700">অনুভূতি বা কার্যকলাপ</span>
              <button type="button" onClick={() => setShowFeelingModal(false)} className="text-[#65676B] hover:text-[#050505] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {ISLAMIC_FEELINGS.map((feel, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setSelectedFeeling(`${feel.label} ${feel.emoji}`);
                    setShowFeelingModal(false);
                  }}
                  className="p-2 rounded-lg bg-white border border-[#E4E6EB] hover:bg-amber-50 text-left text-xs text-[#050505] flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="text-base">{feel.emoji}</span>
                  <span className="truncate">{feel.bn}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Area */}
        <div className="min-h-[110px] bg-white">
          <textarea
            rows={4}
            placeholder="What's on your mind? / মনের কথা বা দ্বীনি উপদেশ লিখুন..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-white placeholder-[#65676B] focus:outline-none resize-none leading-relaxed text-[#050505] text-[16px] font-bengali"
          />
        </div>

        {/* Light Gray Dashed Gallery Selector Box on White Background */}
        {!selectedPhoto && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#F7F8FA] border-2 border-dashed border-[#CED0D4] text-emerald-600 font-bold text-xs flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-2xs cursor-pointer"
          >
            <div className="p-1.5 rounded-lg bg-emerald-50 text-[#45bd62]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span>আপনার ফোনের গ্যালারি থেকে ছবি বা ভিডিও সিলেক্ট করুন (Open Gallery)</span>
          </button>
        )}

        {/* Photo / Video Preview with ✕ button */}
        {selectedPhoto && (
          <div className="relative rounded-2xl overflow-hidden border border-[#E4E6EB] bg-[#F0F2F5] group animate-in fade-in">
            {isVideo ? (
              <video
                src={selectedPhoto}
                controls
                className="w-full max-h-80 object-cover"
              />
            ) : (
              <img
                src={selectedPhoto}
                alt="Selected"
                className="w-full max-h-80 object-cover"
              />
            )}
            
            {/* Remove / Change photo buttons */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-full bg-white/95 hover:bg-white text-xs font-bold text-[#050505] flex items-center gap-1 shadow-md border border-[#E4E6EB] cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#0866FF]" />
                <span>পরিবর্তন করুন</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-full bg-white/95 hover:bg-white text-[#050505] shadow-md border border-[#E4E6EB] cursor-pointer"
                title="মুছে ফেলুন"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Ayah Box Form */}
        {showAyahBox && (
          <div className="p-3 rounded-xl bg-[#F7F8FA] border border-emerald-300 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-emerald-700 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> কুরআনের আয়াত বা হাদিস কার্ড
              </span>
              <button type="button" onClick={() => setShowAyahBox(false)} className="text-[#65676B] hover:text-[#050505] cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="মূল আরবি পাঠ লিখুন..."
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              className="w-full bg-white border border-[#E4E6EB] rounded-lg p-2 text-right font-arabic text-sm text-[#050505] placeholder-[#65676B] outline-none focus:border-[#0866FF]"
            />
            <input
              type="text"
              placeholder="বাংলা অনুবাদ..."
              value={translationText}
              onChange={(e) => setTranslationText(e.target.value)}
              className="w-full bg-white border border-[#E4E6EB] rounded-lg px-2.5 py-1.5 text-xs text-[#050505] placeholder-[#65676B] outline-none focus:border-[#0866FF]"
            />
          </div>
        )}

      </div>

      {/* Bottom Action Bar: Light Gray Surface with Clean White Action Cards */}
      <div className="bg-[#F0F2F5] border-t border-[#E4E6EB] p-3 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {/* 1. Gallery */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-1 bg-white hover:bg-[#F7F8FA] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border border-[#E4E6EB] shadow-2xs active:scale-95 cursor-pointer"
            title="আপনার মোবাইল বা কম্পিউটারের নিজস্ব গ্যালারি খুলুন"
          >
            <ImageIcon className="w-6 h-6 text-[#45bd62]" />
            <span className="text-[11px] font-bold text-[#050505]">Gallery</span>
          </button>

          {/* 2. কুরআন কার্ড */}
          <button
            type="button"
            onClick={() => setShowAyahBox(!showAyahBox)}
            className="py-2.5 px-1 bg-white hover:bg-[#F7F8FA] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border border-[#E4E6EB] shadow-2xs active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-6 h-6 text-emerald-600" />
            <span className="text-[11px] font-bold text-[#050505]">কুরআন কার্ড</span>
          </button>

          {/* 3. Live */}
          <button
            type="button"
            onClick={() => {
              if (onOpenLive) {
                onClose();
                onOpenLive();
              }
            }}
            className="py-2.5 px-1 bg-white hover:bg-[#F7F8FA] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border border-[#E4E6EB] shadow-2xs active:scale-95 cursor-pointer"
          >
            <Radio className="w-6 h-6 text-red-500" />
            <span className="text-[11px] font-bold text-[#050505]">Live</span>
          </button>

          {/* 4. WhatsApp */}
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Peace World',
                  text: content || 'Join Peace World Community',
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            className="py-2.5 px-1 bg-white hover:bg-[#F7F8FA] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border border-[#E4E6EB] shadow-2xs active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-6 h-6 text-[#25D366]" />
            <span className="text-[11px] font-bold text-[#050505]">WhatsApp</span>
          </button>
        </div>

        {/* Bottom Footer: [ 🌐 Public (পাবলিক) ] and [ পোস্ট করুন (Post) ] */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#CED0D4] text-xs font-semibold text-[#050505] hover:bg-[#E4E6EB] transition-colors cursor-pointer"
          >
            {privacy === 'public' && <><Globe className="w-3.5 h-3.5 text-[#0866FF]" /><span>Public (পাবলিক)</span></>}
            {privacy === 'friends' && <><Users className="w-3.5 h-3.5 text-emerald-600" /><span>Friends (বন্ধুরা)</span></>}
            {privacy === 'private' && <><Lock className="w-3.5 h-3.5 text-amber-600" /><span>Only Me (গোপনীয়)</span></>}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!content.trim() && !arabicText.trim() && !selectedPhoto) || isVerifyingHalal}
            className="px-6 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] disabled:opacity-40 text-white font-bold text-sm shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
          >
            {isVerifyingHalal ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>যাচাই হচ্ছে...</span>
              </>
            ) : (
              <span>পোস্ট করুন (Post)</span>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
