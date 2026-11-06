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
    <div className="fixed inset-0 z-50 bg-[#18191a] text-white flex flex-col justify-between animate-in fade-in">
      
      {/* Hidden file input that triggers user's real phone/PC gallery */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,video/*"
        className="hidden"
        onChange={handleDeviceUpload}
      />

      {/* Top Header matching Screenshot 2: [ ✕ ] "New post" [ ••• ] */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#393a3b] bg-[#242526]">
        <button
          onClick={onClose}
          className="p-1 rounded-full text-white hover:bg-[#3a3b3c] transition-colors"
          title="বন্ধ করুন"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-base font-bold text-white">New post</h1>

        <button
          onClick={() => {}}
          className="p-1.5 rounded-full text-white hover:bg-[#3a3b3c] transition-colors"
          title="More options"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        
        {/* Author row matching Screenshot 2 */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#393a3b] bg-neutral-800">
            <img
              src={userProfile.avatar}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h2 className="font-bold text-base text-white">{userProfile.name}</h2>
            
            {/* Privacy Selector Dropdown Pill */}
            <div className="relative inline-block mt-0.5">
              <button
                type="button"
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] text-xs font-semibold border border-[#4e4f50] transition-colors"
              >
                {privacy === 'public' && (
                  <>
                    <Globe className="w-3 h-3 text-[#1877F2]" />
                    <span>Public</span>
                  </>
                )}
                {privacy === 'friends' && (
                  <>
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>Friends</span>
                  </>
                )}
                {privacy === 'private' && (
                  <>
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>Only Me</span>
                  </>
                )}
                <span className="text-[9px] text-[#b0b3b8]">▼</span>
              </button>

              {showPrivacyMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPrivacyMenu(false)} />
                  <div className="absolute left-0 top-8 z-50 w-64 bg-[#242526] border border-[#393a3b] rounded-xl shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95">
                    <p className="text-[11px] font-bold text-[#b0b3b8] px-2 py-1">পোস্টের প্রাইভেসী নির্বাচন করুন</p>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setPrivacy('public');
                        setShowPrivacyMenu(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        privacy === 'public' ? 'bg-[#1877F2]/20 border border-[#1877F2]/40' : 'hover:bg-[#3a3b3c]'
                      }`}
                    >
                      <Globe className="w-4 h-4 text-[#1877F2] mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">Public (পাবলিক)</p>
                        <p className="text-[10px] text-[#b0b3b8]">Peace World এর যেকোনো ব্যক্তি দেখতে পারবে</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrivacy('friends');
                        setShowPrivacyMenu(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        privacy === 'friends' ? 'bg-emerald-500/20 border border-emerald-500/40' : 'hover:bg-[#3a3b3c]'
                      }`}
                    >
                      <Users className="w-4 h-4 text-emerald-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">Friends (বন্ধুরা)</p>
                        <p className="text-[10px] text-[#b0b3b8]">শুধুমাত্র আপনার ফ্রেন্ডলিস্টের ব্যক্তিরা দেখতে পারবে</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPrivacy('private');
                        setShowPrivacyMenu(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        privacy === 'private' ? 'bg-amber-500/20 border border-amber-500/40' : 'hover:bg-[#3a3b3c]'
                      }`}
                    >
                      <Lock className="w-4 h-4 text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white">Only Me (শুধুমাত্র আমি)</p>
                        <p className="text-[10px] text-[#b0b3b8]">শুধুমাত্র আপনি নিজে দেখতে পারবেন, ফিডে থাকবে না</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {selectedFeeling && (
              <p className="text-xs text-amber-300 mt-1">is {selectedFeeling}</p>
            )}
            {taggedFriends.length > 0 && (
              <p className="text-xs text-blue-300 mt-0.5">
                with {taggedFriends.join(', ')}
              </p>
            )}
            {selectedLocation && (
              <p className="text-xs text-emerald-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-red-400" />
                <span>at {selectedLocation}</span>
              </p>
            )}
          </div>
        </div>

        {/* Halal AI Verification Indicator */}
        {isVerifyingHalal && (
          <div className="p-3 bg-blue-950/40 border border-[#1877F2]/50 rounded-xl flex items-center gap-2.5 text-xs text-blue-200">
            <Loader2 className="w-4 h-4 animate-spin text-[#1877F2]" />
            <span>Peace World Halal AI কনটেন্ট ও হালাল নীতিমালা যাচাই করছে...</span>
          </div>
        )}

        {/* Moderation Block Banner (Only shows when BLOCK_WORDS matched) */}
        {moderationError && (
          <div className="p-3.5 bg-[#242526] border border-amber-500/60 rounded-xl flex items-center gap-2.5 text-xs text-amber-200 animate-in fade-in">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-semibold text-[13px] text-amber-200">
              দুঃখিত, এই পোস্টে নিষিদ্ধ কনটেন্ট আছে
            </span>
          </div>
        )}

        {/* 4 Interactive Pills under Author matching Screenshot 2:
            [ 🎵 Music ] [ 👤 Tag/collaborate ] [ 📍 Location ] [ 😊 Feeling ] */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {/* Music */}
          <button
            onClick={() => setShowMusicPicker(!showMusicPicker)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              selectedMusic ? 'bg-teal-950 border-teal-500 text-teal-300' : 'bg-[#242526] border-[#393a3b] text-[#e4e6eb] hover:bg-[#3a3b3c]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>{selectedMusic || 'Music'}</span>
          </button>

          {/* Tag/collaborate */}
          <button
            onClick={() => setShowTagModal(!showTagModal)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              taggedFriends.length > 0 ? 'bg-blue-950 border-blue-500 text-blue-300' : 'bg-[#242526] border-[#393a3b] text-[#e4e6eb] hover:bg-[#3a3b3c]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{taggedFriends.length > 0 ? `Tagged (${taggedFriends.length})` : 'Tag/collaborate'}</span>
          </button>

          {/* Location */}
          <button
            onClick={() => setShowLocationModal(!showLocationModal)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              selectedLocation ? 'bg-red-950 border-red-500 text-red-300' : 'bg-[#242526] border-[#393a3b] text-[#e4e6eb] hover:bg-[#3a3b3c]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>{selectedLocation ? selectedLocation.split(',')[0] : 'Location'}</span>
          </button>

          {/* Feeling */}
          <button
            onClick={() => setShowFeelingModal(!showFeelingModal)}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 ${
              selectedFeeling ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-[#242526] border-[#393a3b] text-[#e4e6eb] hover:bg-[#3a3b3c]'
            }`}
          >
            <Smile className="w-3.5 h-3.5 text-amber-400" />
            <span>{selectedFeeling ? 'Feeling added' : 'Feeling'}</span>
          </button>
        </div>

        {/* Music Picker subdrawer */}
        {showMusicPicker && (
          <div className="p-3 bg-[#242526] rounded-xl border border-teal-500/40 space-y-2 animate-in fade-in">
            <p className="text-xs font-bold text-teal-400">ইসলামিক তিলাওয়াত বা নাসহীদ নির্বাচন করুন:</p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'সূরা আর-রহমান তিলাওয়াত 🎵',
                'আয়াতুল কুরসি তিলাওয়াত 🕊️',
                'তাওবার পবিত্র দোয়া 🤲',
                'সুমিষ্ট আযান ও সালাত 🕌'
              ].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedMusic(m);
                    setShowMusicPicker(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#18191a] text-xs text-[#e4e6eb] hover:bg-teal-900"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tag Friends Modal */}
        {showTagModal && (
          <div className="p-3 bg-[#242526] rounded-xl border border-blue-500/40 space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400">বন্ধুদের ট্যাগ করুন</span>
              <button onClick={() => setShowTagModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
              {AVAILABLE_FRIENDS.map((f) => {
                const isTagged = taggedFriends.includes(f.name);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFriendTag(f.name)}
                    className={`w-full p-2 rounded-lg flex items-center justify-between text-xs ${
                      isTagged ? 'bg-blue-950 text-white' : 'hover:bg-[#3a3b3c] text-[#e4e6eb]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={f.avatar} alt={f.name} className="w-6 h-6 rounded-full object-cover" />
                      <span>{f.name}</span>
                    </div>
                    {isTagged && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Location Picker */}
        {showLocationModal && (
          <div className="p-3 bg-[#242526] rounded-xl border border-red-500/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400">অবস্থান নির্বাচন করুন</span>
              <button onClick={() => setShowLocationModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1 max-h-36 overflow-y-auto no-scrollbar">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowLocationModal(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-[#3a3b3c] text-xs text-[#e4e6eb] flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{loc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feeling Picker */}
        {showFeelingModal && (
          <div className="p-3 bg-[#242526] rounded-xl border border-amber-500/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">অনুভূতি বা কার্যকলাপ</span>
              <button onClick={() => setShowFeelingModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
              {ISLAMIC_FEELINGS.map((feel, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedFeeling(`${feel.label} ${feel.emoji}`);
                    setShowFeelingModal(false);
                  }}
                  className="p-2 rounded-lg bg-[#18191a] hover:bg-[#3a3b3c] text-left text-xs flex items-center gap-1.5"
                >
                  <span className="text-base">{feel.emoji}</span>
                  <span className="truncate">{feel.bn}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Area matching Screenshot 2 */}
        <div className="min-h-[110px]">
          <textarea
            rows={4}
            placeholder="What's on your mind? / মনের কথা বা দ্বীনি উপদেশ লিখুন..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent placeholder-[#b0b3b8] focus:outline-none resize-none leading-relaxed text-[#e4e6eb] text-base font-bengali"
          />
        </div>

        {/* Direct Button to open Phone Gallery if no photo is picked yet */}
        {!selectedPhoto && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-2xl bg-[#242526] hover:bg-[#3a3b3c] border border-dashed border-[#45bd62]/60 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-sm"
          >
            <div className="p-1.5 rounded-lg bg-[#45bd62]/20 text-[#45bd62]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span>আপনার ফোনের গ্যালারি থেকে ছবি বা ভিডিও সিলেক্ট করুন (Open Gallery)</span>
          </button>
        )}

        {/* Photo / Video Preview with ✕ button */}
        {selectedPhoto && (
          <div className="relative rounded-2xl overflow-hidden border border-[#393a3b] bg-neutral-900 group animate-in fade-in">
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
                className="px-2.5 py-1 rounded-full bg-black/75 hover:bg-black text-xs font-bold text-white flex items-center gap-1 backdrop-blur-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>পরিবর্তন করুন</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1.5 rounded-full bg-black/75 hover:bg-black text-white backdrop-blur-sm"
                title="মুছে ফেলুন"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* Ayah Box Form */}
        {showAyahBox && (
          <div className="p-3 rounded-xl bg-[#242526] border border-emerald-500/40 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> কুরআনের আয়াত বা হাদিস কার্ড
              </span>
              <button onClick={() => setShowAyahBox(false)} className="text-neutral-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="মূল আরবি পাঠ লিখুন..."
              value={arabicText}
              onChange={(e) => setArabicText(e.target.value)}
              className="w-full bg-[#18191a] border border-[#393a3b] rounded-lg p-2 text-right font-arabic text-sm text-emerald-100 outline-none"
            />
            <input
              type="text"
              placeholder="বাংলা অনুবাদ..."
              value={translationText}
              onChange={(e) => setTranslationText(e.target.value)}
              className="w-full bg-[#18191a] border border-[#393a3b] rounded-lg px-2.5 py-1.5 text-xs text-[#e4e6eb] outline-none"
            />
          </div>
        )}

      </div>

      {/* Bottom Horizontal Action Cards matching Screenshot 2:
          [ 🖼️ Gallery ] [ 👾 GIF / কার্ড ] [ 📹 Live ] [ 💬 WhatsApp ] */}
      <div className="bg-[#242526] border-t border-[#393a3b] p-3 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {/* 1. Gallery -> Directly triggers device's native gallery picker! */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-1 bg-[#18191a] hover:bg-[#3a3b3c] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border border-[#393a3b] active:scale-95"
            title="আপনার মোবাইল বা কম্পিউটারের নিজস্ব গ্যালারি খুলুন"
          >
            <ImageIcon className="w-6 h-6 text-[#45bd62]" />
            <span className="text-[11px] font-bold text-white">Gallery</span>
          </button>

          {/* 2. GIF / কার্ড */}
          <button
            type="button"
            onClick={() => setShowAyahBox(!showAyahBox)}
            className="py-2.5 px-1 bg-[#18191a] hover:bg-[#3a3b3c] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border border-[#393a3b] active:scale-95"
          >
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <span className="text-[11px] font-bold text-white">কুরআন কার্ড</span>
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
            className="py-2.5 px-1 bg-[#18191a] hover:bg-[#3a3b3c] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border border-[#393a3b] active:scale-95"
          >
            <Radio className="w-6 h-6 text-red-500" />
            <span className="text-[11px] font-bold text-white">Live</span>
          </button>

          {/* 4. WhatsApp / শেয়ার */}
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Qalby Halal',
                  text: content || 'Join Qalby Halal Community',
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            className="py-2.5 px-1 bg-[#18191a] hover:bg-[#3a3b3c] rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border border-[#393a3b] active:scale-95"
          >
            <MessageSquare className="w-6 h-6 text-emerald-400" />
            <span className="text-[11px] font-bold text-white">WhatsApp</span>
          </button>
        </div>

        {/* Bottom Footer matching Screenshot 2: [ 🌐 Privacy ] and [ Next / Post ] */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#18191a] border border-[#393a3b] text-xs font-semibold text-[#e4e6eb] hover:bg-[#3a3b3c] transition-colors"
          >
            {privacy === 'public' && <><Globe className="w-3.5 h-3.5 text-[#1877F2]" /><span>Public (পাবলিক)</span></>}
            {privacy === 'friends' && <><Users className="w-3.5 h-3.5 text-emerald-400" /><span>Friends (বন্ধুরা)</span></>}
            {privacy === 'private' && <><Lock className="w-3.5 h-3.5 text-amber-400" /><span>Only Me (গোপনীয়)</span></>}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={(!content.trim() && !arabicText.trim() && !selectedPhoto) || isVerifyingHalal}
            className="px-6 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] disabled:opacity-40 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2"
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
