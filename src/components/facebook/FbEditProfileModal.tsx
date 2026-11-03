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
  Sparkles,
  Plus,
  Check,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { UserProfile } from '../../types';

interface FbEditProfileModalProps {
  userProfile: UserProfile;
  onClose: () => void;
  onSave: (updatedProfile: UserProfile) => void;
}

const PRESET_AVATARS = [
  { label: 'Original', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80' },
  { label: 'Peace Verse Logo', url: '/public/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg' },
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
  const [thoughtBubble, setThoughtBubble] = useState(userProfile.thoughtBubble || 'Drop a thought...');
  const [location, setLocation] = useState(userProfile.location || 'Dhaka, Bangladesh');
  const [hometown, setHometown] = useState(userProfile.hometown || 'Sylhet, Bangladesh');
  const [work, setWork] = useState(userProfile.work || 'Islamic Content Creator & Designer at Qalby');
  const [education, setEducation] = useState(userProfile.education || 'Studied Islamic Studies at Dhaka University');
  const [relationship, setRelationship] = useState(userProfile.relationship || 'Married');
  const [website, setWebsite] = useState(userProfile.website || 'https://qalby.islamic.app');
  const [hobbies, setHobbies] = useState<string[]>(userProfile.hobbies || [
    'কুরআন তিলাওয়াত',
    'হাদিস অধ্যয়ন',
    'ইসলামিক ক্যালিগ্রাফি',
    'মসজিদ ভ্রমণ'
  ]);

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
      hobbies,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#242526] w-full max-w-lg rounded-2xl border border-[#393a3b] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
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
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#393a3b]">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#e4e6eb] transition-colors"
              title="পিছনে যান (Back)"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h2 className="text-base font-bold text-white">Edit profile</h2>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs transition-colors shadow-sm"
          >
            Save (সংরক্ষণ)
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">

          {/* 1. Name Edit Section */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#b0b3b8]">নাম (Profile Name)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#18191a] border border-[#393a3b] focus:border-[#1877F2] rounded-xl px-3 py-2 text-sm text-white font-semibold outline-none"
              placeholder="আপনার নাম লিখুন..."
            />
          </div>

          {/* 2. Profile Picture Section */}
          <div className="space-y-2 border-t border-[#393a3b] pt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">Profile picture</span>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="text-xs font-semibold text-[#1877F2] hover:underline"
              >
                {showAvatarPicker ? 'Hide' : 'Edit'}
              </button>
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#3a3b3c] shadow-lg"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    avatarInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-white border-2 border-[#242526] shadow-md"
                  title="গ্যালারি বা ক্যামেরা থেকে ছবি তুলুন"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Avatar Preset & Upload Drawer */}
            {showAvatarPicker && (
              <div className="p-3 bg-[#18191a] rounded-xl border border-[#393a3b] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#b0b3b8]">পছন্দের ছবি বাছাই বা ডিভাইস থেকে আপলোড</span>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs text-white font-medium"
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
                      className={`relative rounded-full aspect-square overflow-hidden border-2 transition-transform ${
                        avatar === p.url ? 'border-[#1877F2] scale-105' : 'border-neutral-700 hover:border-neutral-400'
                      }`}
                      title={p.label}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      {avatar === p.url && (
                        <div className="absolute inset-0 bg-[#1877F2]/40 flex items-center justify-center">
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
          <div className="space-y-2 border-t border-[#393a3b] pt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">Cover photo</span>
              <button
                type="button"
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                className="text-xs font-semibold text-[#1877F2] hover:underline"
              >
                {showCoverPicker ? 'Hide' : 'Edit'}
              </button>
            </div>

            <div className="relative h-28 sm:h-36 w-full rounded-xl overflow-hidden border border-[#393a3b] group cursor-pointer" onClick={() => coverInputRef.current?.click()}>
              <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  coverInputRef.current?.click();
                }}
                className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-[#3a3b3c]/90 hover:bg-[#4e4f50] text-xs font-semibold text-white flex items-center gap-1.5 shadow-md"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Edit cover</span>
              </button>
            </div>

            {/* Cover presets */}
            {showCoverPicker && (
              <div className="p-3 bg-[#18191a] rounded-xl border border-[#393a3b] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#b0b3b8]">কভার ফটো নির্বাচন বা আপলোড</span>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs text-white font-medium"
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
                      className={`relative h-16 rounded-lg overflow-hidden border-2 transition-transform ${
                        coverPhoto === c.url ? 'border-[#1877F2] scale-[1.02]' : 'border-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      <img src={c.url} alt={c.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white px-1 py-0.5 truncate text-left">
                        {c.label}
                      </span>
                      {coverPhoto === c.url && (
                        <div className="absolute top-1 right-1 p-0.5 bg-[#1877F2] rounded-full text-white">
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
          <div className="space-y-2 border-t border-[#393a3b] pt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">Bio</span>
              <button
                type="button"
                onClick={() => setShowBioEdit(!showBioEdit)}
                className="text-xs font-semibold text-[#1877F2] hover:underline"
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
                  className="w-full bg-[#18191a] border border-[#393a3b] focus:border-[#1877F2] rounded-xl p-3 text-sm text-[#e4e6eb] outline-none resize-none font-bengali"
                />
                <div className="flex items-center justify-between text-xs text-[#b0b3b8]">
                  <span>{101 - bio.length} characters left</span>
                  <div className="flex gap-1 text-[11px]">
                    {['আলহামদুলিল্লাহ আলা কুল্লি হাল 🌸', 'দ্বীনের পথে এক মুসাফির 🤲'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBio(preset)}
                        className="px-2 py-0.5 bg-[#3a3b3c] rounded-md hover:bg-[#4e4f50] text-emerald-300"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#b0b3b8] text-center italic py-1 font-bengali">
                {bio || 'Add a short bio to tell people more about yourself.'}
              </p>
            )}
          </div>

          {/* 5. Thought Bubble Section */}
          <div className="space-y-2 border-t border-[#393a3b] pt-4">
            <label className="text-xs font-bold text-[#b0b3b8]">মাথার ওপরের বাবল থট (Thought Bubble)</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={thoughtBubble}
                onChange={(e) => setThoughtBubble(e.target.value)}
                placeholder="Drop a thought..."
                className="flex-1 bg-[#18191a] border border-[#393a3b] focus:border-[#1877F2] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <div className="flex gap-1">
                {['শান্তিতে আছি 🤍', 'সুবহানাল্লাহ 🌸'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setThoughtBubble(q)}
                    className="px-2 py-1 bg-[#3a3b3c] hover:bg-[#4e4f50] text-[10px] text-white rounded-lg"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Customize your details */}
          <div className="space-y-3 border-t border-[#393a3b] pt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">Details (ব্যক্তিগত বিবরণ)</span>
              <button
                type="button"
                onClick={() => setShowDetailsEdit(!showDetailsEdit)}
                className="text-xs font-semibold text-[#1877F2] hover:underline"
              >
                {showDetailsEdit ? 'Done' : 'Edit'}
              </button>
            </div>

            {showDetailsEdit ? (
              <div className="space-y-3 bg-[#18191a] p-3 rounded-xl border border-[#393a3b] animate-in fade-in">
                {/* Work */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b0b3b8] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400" /> কর্মক্ষেত্র (Workplace)
                  </label>
                  <input
                    type="text"
                    value={work}
                    onChange={(e) => setWork(e.target.value)}
                    className="w-full bg-[#242526] border border-[#393a3b] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#1877F2]"
                  />
                </div>

                {/* Education */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b0b3b8] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> শিক্ষা প্রতিষ্ঠান (Education)
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full bg-[#242526] border border-[#393a3b] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#1877F2]"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b0b3b8] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" /> বর্তমান শহর (Current City)
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#242526] border border-[#393a3b] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#1877F2]"
                  />
                </div>

                {/* Hometown */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b0b3b8] flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-amber-400" /> নিজ শহর (Hometown)
                  </label>
                  <input
                    type="text"
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    className="w-full bg-[#242526] border border-[#393a3b] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#1877F2]"
                  />
                </div>

                {/* Relationship */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b0b3b8] flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-400" /> বৈবাহিক অবস্থা (Relationship Status)
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-[#242526] border border-[#393a3b] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#1877F2]"
                  >
                    <option value="Married">Married (বিবাহিত)</option>
                    <option value="Single">Single (অবিবাহিত)</option>
                    <option value="Engaged">Engaged (বাগদান সম্পন্ন)</option>
                  </select>
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b0b3b8] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-teal-400" /> ওয়েবসাইট বা সোশ্যাল লিংক (Website/Link)
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full bg-[#242526] border border-[#393a3b] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-[#e4e6eb]">
                {work && (
                  <div className="flex items-center gap-2.5">
                    <Briefcase className="w-4 h-4 text-[#b0b3b8]" />
                    <span>Works at <span className="font-semibold text-white">{work}</span></span>
                  </div>
                )}
                {education && (
                  <div className="flex items-center gap-2.5">
                    <GraduationCap className="w-4 h-4 text-[#b0b3b8]" />
                    <span>{education}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#b0b3b8]" />
                    <span>Lives in <span className="font-semibold text-white">{location}</span></span>
                  </div>
                )}
                {hometown && (
                  <div className="flex items-center gap-2.5">
                    <Home className="w-4 h-4 text-[#b0b3b8]" />
                    <span>From <span className="font-semibold text-white">{hometown}</span></span>
                  </div>
                )}
                {relationship && (
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#b0b3b8]" />
                    <span>{relationship}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. Hobbies Section */}
          <div className="space-y-2 border-t border-[#393a3b] pt-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">Hobbies (পছন্দ ও শখ)</span>
              <button
                type="button"
                onClick={() => setShowHobbiesEdit(!showHobbiesEdit)}
                className="text-xs font-semibold text-[#1877F2] hover:underline"
              >
                {showHobbiesEdit ? 'Done' : 'Edit'}
              </button>
            </div>

            {showHobbiesEdit ? (
              <div className="space-y-2 p-3 bg-[#18191a] rounded-xl border border-[#393a3b] animate-in fade-in">
                <p className="text-xs text-[#b0b3b8]">শখ বা আগ্রহ নির্বাচন করুন:</p>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_HOBBIES.map((h) => {
                    const isSelected = hobbies.includes(h);
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleHobby(h)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#1877F2] text-white'
                            : 'bg-[#242526] text-[#b0b3b8] hover:text-white border border-[#393a3b]'
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
                    className="px-3 py-1 rounded-full bg-[#3a3b3c] text-xs text-[#e4e6eb] font-medium"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Big Bottom Save Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
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
