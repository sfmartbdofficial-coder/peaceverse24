import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  Briefcase,
  GraduationCap,
  Home,
  MapPin,
  Heart,
  Globe,
  Check,
  Upload,
  MessageCircle,
  Phone,
  Lock,
  Users,
  Send,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { normalizePhoneNumber } from '../../utils/contactLinks';

interface FbEditProfileModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onSave: (updatedProfile: UserProfile) => void;
}

const PRESET_AVATARS = [
  { label: 'Original', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80' },
  { label: 'Peace Verse Logo', url: '/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg' },
  { label: 'Islamic Brother', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80' },
  { label: 'Young Muslim', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80' },
  { label: 'Calligraphy', url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=240&q=80' },
  { label: 'Kaaba Crest', url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=240&q=80' },
];

const PRESET_COVERS = [
  { label: 'Islamic Geometry', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Al-Masjid an-Nabawi', url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Holy Kaaba', url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mosque Archways', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Serene Nature', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
];

const AVAILABLE_HOBBIES = [
  'কুরআন তিলাওয়াত',
  'হাদিস অধ্যয়ন',
  'ইসলামিক ক্যালিগ্রাফি',
  'মসজিদ ভ্রমণ',
  'সদকা ও সমাজসেবা',
  'ইসলামিক বই পড়া',
  'তাহাজ্জুদ ও জিকির',
  'প্রকৃতি ভ্রমণ',
  'প্রোগ্রামিং ও প্রযুক্তি',
];

export const FbEditProfileModal: React.FC<FbEditProfileModalProps> = ({
  userProfile,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [coverPhoto, setCoverPhoto] = useState(userProfile.coverPhoto);
  const [bio, setBio] = useState(userProfile.bio || '');
  const [thoughtBubble, setThoughtBubble] = useState(userProfile.thoughtBubble || 'Share a song...');
  const [location, setLocation] = useState(userProfile.location || '');
  const [hometown, setHometown] = useState(userProfile.hometown || '');
  const [work, setWork] = useState(userProfile.work || '');
  const [education, setEducation] = useState(userProfile.education || '');
  const [relationship, setRelationship] = useState(userProfile.relationship || '');
  const [website, setWebsite] = useState(userProfile.website || '');
  const [whatsapp, setWhatsapp] = useState(userProfile.whatsapp || '');
  const [imo, setImo] = useState(userProfile.imo || '');
  const [viber, setViber] = useState(userProfile.viber || '');
  const [messengerLink, setMessengerLink] = useState(userProfile.messengerLink || '');
  const [contactPrivacy, setContactPrivacy] = useState<'public' | 'friends' | 'private'>(
    userProfile.contactPrivacy || 'public'
  );
  const [hobbies, setHobbies] = useState<string[]>(
    userProfile.hobbies || [
      'কুরআন তিলাওয়াত',
      'হাদিস অধ্যয়ন',
      'ইসলামিক ক্যালিগ্রাফি',
      'মসজিদ ভ্রমণ',
    ]
  );

  // Sub-pickers toggles
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showDetailsEdit, setShowDetailsEdit] = useState(false);
  const [showBioEdit, setShowBioEdit] = useState(false);
  const [showHobbiesEdit, setShowHobbiesEdit] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
          setShowAvatarPicker(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverPhoto(event.target.result as string);
          setShowCoverPicker(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleHobby = (item: string) => {
    if (hobbies.includes(item)) {
      setHobbies(hobbies.filter((h) => h !== item));
    } else {
      setHobbies([...hobbies, item]);
    }
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...userProfile,
      name: name.trim() || userProfile.name,
      avatar,
      coverPhoto,
      bio: bio.trim(),
      thoughtBubble: thoughtBubble.trim(),
      location: location.trim(),
      hometown: hometown.trim(),
      work: work.trim(),
      education: education.trim(),
      relationship: relationship.trim(),
      website: website.trim(),
      whatsapp: whatsapp.trim(),
      imo: imo.trim(),
      viber: viber.trim(),
      messengerLink: messengerLink.trim(),
      contactPrivacy,
      hobbies,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-2 sm:p-4 font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-[#050505] animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden File inputs */}
        <input
          type="file"
          ref={avatarInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleAvatarFile}
        />
        <input
          type="file"
          ref={coverInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleCoverFile}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E4E6EB]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-[#050505] transition-colors cursor-pointer"
              title="পিছনে যান (Back)"
              aria-label="Close edit profile"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h2 className="text-[17px] font-bold text-[#050505]">Edit profile</h2>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.98] text-white font-bold text-xs sm:text-[13px] transition-all cursor-pointer"
          >
            Save (সংরক্ষণ)
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-5 bg-white">
          {/* 1. Name Edit Section */}
          <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-1.5">
            <label className="text-xs font-bold text-[#65676B] block">নাম (Profile Name)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#0866FF] focus:bg-white rounded-lg px-3 py-2 text-sm text-[#050505] font-semibold outline-none transition-colors"
              placeholder="আপনার নাম লিখুন..."
            />
          </div>

          {/* 2. Profile Picture Section */}
          <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#050505]">Profile picture</span>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="text-[13px] font-semibold text-[#0866FF] hover:underline cursor-pointer"
              >
                {showAvatarPicker ? 'Hide' : 'Edit'}
              </button>
            </div>

            <div className="flex items-center justify-center py-2">
              <div
                className="relative group cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white ring-1 ring-[#E4E6EB] shadow-md"
                />
                <div className="absolute inset-0 bg-black/25 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    avatarInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] border-2 border-white shadow-sm cursor-pointer"
                  title="গ্যালারি বা ক্যামেরা থেকে ছবি তুলুন"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Avatar Preset & Upload Drawer */}
            {showAvatarPicker && (
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E4E6EB] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#65676B]">
                    পছন্দের ছবি বাছাই বা ডিভাইস থেকে আপলোড
                  </span>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs text-[#050505] font-semibold cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from device</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AVATARS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(p.url)}
                      className={`relative rounded-full aspect-square overflow-hidden border-2 transition-transform cursor-pointer ${
                        avatar === p.url
                          ? 'border-[#0866FF] scale-105'
                          : 'border-[#E4E6EB] hover:border-[#65676B]'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      {avatar === p.url && (
                        <div className="absolute inset-0 bg-[#0866FF]/35 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Cover Photo Section */}
          <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#050505]">Cover photo</span>
              <button
                type="button"
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                className="text-[13px] font-semibold text-[#0866FF] hover:underline cursor-pointer"
              >
                {showCoverPicker ? 'Hide' : 'Edit'}
              </button>
            </div>

            <div
              className="relative h-28 sm:h-36 w-full rounded-xl overflow-hidden border border-[#E4E6EB] bg-[#F0F2F5] group cursor-pointer"
              onClick={() => coverInputRef.current?.click()}
            >
              <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  coverInputRef.current?.click();
                }}
                className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-xs font-semibold text-[#050505] border border-[#E4E6EB] flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Edit cover</span>
              </button>
            </div>

            {/* Cover presets */}
            {showCoverPicker && (
              <div className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E4E6EB] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#65676B]">
                    কভার ফটো নির্বাচন বা আপলোড
                  </span>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#E4E6EB] hover:bg-[#D8DADF] text-xs text-[#050505] font-semibold cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload cover</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_COVERS.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverPhoto(c.url)}
                      className={`relative h-16 rounded-lg overflow-hidden border-2 transition-transform cursor-pointer ${
                        coverPhoto === c.url
                          ? 'border-[#0866FF] scale-[1.02]'
                          : 'border-[#E4E6EB] hover:border-[#65676B]'
                      }`}
                    >
                      <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/55 text-[10px] text-white px-1.5 py-0.5 truncate text-left">
                        {c.label}
                      </span>
                      {coverPhoto === c.url && (
                        <div className="absolute top-1 right-1 p-0.5 bg-[#0866FF] rounded-full text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Bio Section */}
          <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#050505]">Bio</span>
              <button
                type="button"
                onClick={() => setShowBioEdit(!showBioEdit)}
                className="text-[13px] font-semibold text-[#0866FF] hover:underline cursor-pointer"
              >
                {showBioEdit ? 'Done' : 'Edit'}
              </button>
            </div>

            {showBioEdit ? (
              <div className="space-y-2 animate-in fade-in">
                <textarea
                  rows={3}
                  value={bio}
                  maxLength={101}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe who you are / আপনার সংক্ষিপ্ত বায়ো লিখুন..."
                  className="w-full bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#0866FF] focus:bg-white rounded-lg p-3 text-sm text-[#050505] placeholder-[#65676B] outline-none resize-none font-bengali"
                />
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-[#65676B]">
                  <span className="tabular-nums">{101 - bio.length} characters left</span>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    {['আলহামদুলিল্লাহ আলা কুল্লি হাল 🌸', 'দ্বীনের পথে এক মুসাফির 🤲'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBio(preset)}
                        className="px-2 py-0.5 bg-[#E7F3FF] rounded-md hover:bg-[#DBE7F2] text-[#0866FF] font-semibold cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#65676B] text-center py-1 font-bengali">
                {bio || 'Add a short bio to tell people more about yourself.'}
              </p>
            )}
          </div>

          {/* 5. Thought Bubble Section */}
          <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-2">
            <label className="text-xs font-bold text-[#65676B] block">
              মাথার ওপরের বাবল থট (Thought Bubble)
            </label>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input
                type="text"
                value={thoughtBubble}
                onChange={(e) => setThoughtBubble(e.target.value)}
                placeholder="Drop a thought..."
                className="flex-1 min-w-[160px] bg-[#F0F2F5] border border-[#E4E6EB] focus:border-[#0866FF] focus:bg-white rounded-lg px-3 py-2 text-xs text-[#050505] placeholder-[#65676B] outline-none"
              />
              <div className="flex gap-1.5 shrink-0">
                {['শান্তিতে আছি 🤍', 'সুবহানাল্লাহ 🌸'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setThoughtBubble(q)}
                    className="px-2.5 py-1.5 bg-[#F0F2F5] hover:bg-[#E4E6EB] border border-[#E4E6EB] text-[11px] font-medium text-[#050505] rounded-lg cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Customize your details */}
          <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#050505]">
                Details (ব্যক্তিগত বিবরণ)
              </span>
              <button
                type="button"
                onClick={() => setShowDetailsEdit(!showDetailsEdit)}
                className="text-[13px] font-semibold text-[#0866FF] hover:underline cursor-pointer"
              >
                {showDetailsEdit ? 'Done' : 'Edit'}
              </button>
            </div>

            {showDetailsEdit ? (
              <div className="space-y-3 bg-[#F7F8FA] p-3 rounded-xl border border-[#E4E6EB] animate-in fade-in">
                {/* Work */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#65676B] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#0866FF]" /> কর্মক্ষেত্র (Workplace)
                  </label>
                  <input
                    type="text"
                    value={work}
                    onChange={(e) => setWork(e.target.value)}
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] outline-none focus:border-[#0866FF]"
                  />
                </div>

                {/* Education */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#65676B] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> শিক্ষা প্রতিষ্ঠান (Education)
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] outline-none focus:border-[#0866FF]"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#65676B] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> বর্তমান শহর (Current City)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] outline-none focus:border-[#0866FF]"
                  />
                </div>

                {/* Hometown */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#65676B] flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-amber-500" /> নিজ শহর (Hometown)
                  </label>
                  <input
                    type="text"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] outline-none focus:border-[#0866FF]"
                  />
                </div>

                {/* Relationship */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#65676B] flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-500" /> বৈবাহিক অবস্থা (Relationship Status)
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] outline-none focus:border-[#0866FF]"
                  >
                    <option value="Married">Married (বিবাহিত)</option>
                    <option value="Single">Single (অবিবাহিত)</option>
                    <option value="Engaged">Engaged (বাগদান সম্পন্ন)</option>
                  </select>
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#65676B] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-teal-600" /> ওয়েবসাইট বা সোশ্যাল লিংক (Website/Link)
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] outline-none focus:border-[#0866FF]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-[13px] text-[#050505]">
                {work && (
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-[#65676B] shrink-0" />
                    <span>
                      Works at <span className="font-semibold text-[#050505]">{work}</span>
                    </span>
                  </div>
                )}
                {education && (
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-[#65676B] shrink-0" />
                    <span>{education}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#65676B] shrink-0" />
                    <span>
                      Lives in <span className="font-semibold text-[#050505]">{location}</span>
                    </span>
                  </div>
                )}
                {hometown && (
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-[#65676B] shrink-0" />
                    <span>
                      From <span className="font-semibold text-[#050505]">{hometown}</span>
                    </span>
                  </div>
                )}
                {relationship && (
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#65676B] shrink-0" />
                    <span>{relationship}</span>
                  </div>
                )}
                {!work && !education && !location && !hometown && !relationship && (
                  <p className="text-xs text-[#65676B]">
                    Tap Edit to add workplace, education, city or relationship status.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 6.5 Contact Info Section (WhatsApp, IMO, Viber, Messenger & Privacy) */}
          <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="font-bold text-[15px] text-[#050505] block">
                  যোগাযোগের তথ্য / Contact Info
                </span>
                <span className="text-[11px] text-[#65676B]">
                  ভিজিটররা সরাসরি আপনার WhatsApp, IMO বা Viber-এ মেসেজ দিতে পারবে
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                Direct Chat
              </span>
            </div>

            <div className="space-y-3 bg-[#F7F8FA] p-3 rounded-xl border border-[#E4E6EB]">
              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#050505] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-[#25D366] border border-emerald-200 flex items-center justify-center">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </span>
                    WhatsApp Number
                  </span>
                  {whatsapp.trim() && (
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> wa.me/{normalizePhoneNumber(whatsapp)}
                    </span>
                  )}
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+880 1712-345678 (অথবা 01712345678)"
                  className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] placeholder-[#65676B] outline-none focus:border-[#25D366]"
                />
              </div>

              {/* IMO */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#050505] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-sky-50 text-[#0088CC] border border-sky-200 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                    IMO Number
                  </span>
                  {imo.trim() && (
                    <span className="text-[10px] text-[#0088CC] font-semibold">✓ Active</span>
                  )}
                </label>
                <input
                  type="tel"
                  value={imo}
                  onChange={(e) => setImo(e.target.value)}
                  placeholder="+880 1712-345678"
                  className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] placeholder-[#65676B] outline-none focus:border-[#0088CC]"
                />
              </div>

              {/* Viber */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#050505] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-purple-50 text-[#7360F2] border border-purple-200 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                    Viber Number
                  </span>
                  {viber.trim() && (
                    <span className="text-[10px] text-[#7360F2] font-semibold">✓ Active</span>
                  )}
                </label>
                <input
                  type="tel"
                  value={viber}
                  onChange={(e) => setViber(e.target.value)}
                  placeholder="+880 1712-345678"
                  className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] placeholder-[#65676B] outline-none focus:border-[#7360F2]"
                />
              </div>

              {/* Messenger Link (Optional) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#050505] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-[#0866FF] border border-blue-200 flex items-center justify-center">
                    <Send className="w-3 h-3" />
                  </span>
                  Messenger Link <span className="text-[#65676B] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={messengerLink}
                  onChange={(e) => setMessengerLink(e.target.value)}
                  placeholder="facebook.com/username বা m.me/username"
                  className="w-full bg-white border border-[#E4E6EB] rounded-lg px-3 py-2 text-xs text-[#050505] placeholder-[#65676B] outline-none focus:border-[#0866FF]"
                />
              </div>

              {/* Contact Privacy Selector */}
              <div className="space-y-1.5 pt-2 border-t border-[#E4E6EB]">
                <label className="text-[11px] font-bold text-[#65676B] block">
                  কে আপনার যোগাযোগ নম্বর দেখতে পারবে? (Privacy)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'public', label: 'Public', sub: 'সবাই', icon: Globe },
                    { id: 'friends', label: 'Friends only', sub: 'বন্ধুরা', icon: Users },
                    { id: 'private', label: 'Only me', sub: 'শুধু আমি', icon: Lock },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const active = contactPrivacy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setContactPrivacy(opt.id as 'public' | 'friends' | 'private')
                        }
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                          active
                            ? 'bg-[#E7F3FF] border-[#0866FF] text-[#0866FF]'
                            : 'bg-white border-[#E4E6EB] text-[#65676B] hover:text-[#050505]'
                        }`}
                      >
                        <div className="flex items-center gap-1 text-[11px] font-bold">
                          <Icon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{opt.label}</span>
                        </div>
                        <span className="text-[10px] opacity-85 block mt-0.5">{opt.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 7. Hobbies Section */}
          <div className="bg-white border border-[#E4E6EB] rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[15px] text-[#050505]">
                Hobbies (পছন্দ ও শখ)
              </span>
              <button
                type="button"
                onClick={() => setShowHobbiesEdit(!showHobbiesEdit)}
                className="text-[13px] font-semibold text-[#0866FF] hover:underline cursor-pointer"
              >
                {showHobbiesEdit ? 'Done' : 'Edit'}
              </button>
            </div>

            {showHobbiesEdit ? (
              <div className="space-y-2 p-3 bg-[#F7F8FA] rounded-xl border border-[#E4E6EB] animate-in fade-in">
                <p className="text-xs font-semibold text-[#65676B]">শখ বা আগ্রহ নির্বাচন করুন:</p>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_HOBBIES.map((h) => {
                    const isSelected = hobbies.includes(h);
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleHobby(h)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#0866FF] text-white'
                            : 'bg-white text-[#050505] hover:bg-[#E4E6EB] border border-[#E4E6EB]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{h}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {hobbies.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] text-xs text-[#050505] font-medium"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Big Bottom Save Button */}
          <div className="pt-1 pb-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Save Changes (পরিবর্তন সংরক্ষণ করুন)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
