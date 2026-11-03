import React, { useState } from 'react';
import {
  Menu,
  Edit2,
  Search,
  MoreHorizontal,
  Camera,
  MapPin,
  Home,
  Cake,
  Plus,
  ChevronDown,
  UserCheck,
  Sparkles,
  ArrowLeft,
  Check,
  Briefcase,
  GraduationCap,
  Heart,
  Globe,
  SlidersHorizontal,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { UserProfile, PostItem } from '../../types';
import { FbPostCard } from './FbPostCard';
import { FbEditProfileModal } from './FbEditProfileModal';
import { CreatorMonetizationModal } from '../monetization/CreatorMonetizationModal';

interface FbProfileViewProps {
  userProfile: UserProfile;
  userPosts: PostItem[];
  onOpenMenu: () => void;
  onBack: () => void;
  onAddStory: () => void;
  onToggleReaction: (postId: string, reaction: any) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onUpdateProfile: (updated: UserProfile) => void;
  onEditPost?: (postId: string, newContent: string, newArabic?: string, newTranslation?: string) => void;
  onDeletePost?: (postId: string) => void;
}

export const FbProfileView: React.FC<FbProfileViewProps> = ({
  userProfile,
  userPosts,
  onOpenMenu,
  onBack,
  onAddStory,
  onToggleReaction,
  onToggleSave,
  onAddComment,
  onUpdateProfile,
  onEditPost,
  onDeletePost,
}) => {
  const [profileTab, setProfileTab] = useState<'all' | 'photos' | 'reels'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [editingThought, setEditingThought] = useState(false);
  const [thought, setThought] = useState(userProfile.thoughtBubble || 'Drop a thought...');

  const handleSaveThought = (newThought: string) => {
    setThought(newThought);
    setEditingThought(false);
    onUpdateProfile({
      ...userProfile,
      thoughtBubble: newThought,
    });
  };

  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-[#18191a] text-[#e4e6eb] pb-24">
      
      {/* 1. Top Header matching Screenshot 4 */}
      <div className="sticky top-0 z-30 bg-[#242526] border-b border-[#393a3b] px-3 sm:px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-full text-[#e4e6eb] hover:bg-[#3a3b3c] transition-colors"
            title="পেছনে যান (Back)"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <button
            onClick={onOpenMenu}
            className="p-1 rounded-full text-[#b0b3b8] hover:bg-[#3a3b3c]"
            title="Menu"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>
          <span className="font-bold text-base sm:text-lg text-white truncate max-w-[170px]">
            {userProfile.name}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-[#e4e6eb]">
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-white transition-colors"
            title="প্রোফাইল এডিট করুন"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c]"
            title="Search profile"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c]"
            title="Settings"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Cover Photo with Camera Icon */}
      <div className="relative h-48 sm:h-56 w-full bg-neutral-800 overflow-hidden">
        <img
          src={userProfile.coverPhoto}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute bottom-3 right-3 p-2 rounded-full bg-[#3a3b3c]/90 text-white hover:bg-[#4e4f50] shadow-md border border-[#393a3b] transition-colors"
          title="কভার ছবি পরিবর্তন করুন"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Avatar + Thought Bubble + Profile Info */}
      <div className="px-4 pb-4 bg-[#242526] border-b border-[#393a3b]">
        
        {/* Big Avatar Container with Thought Bubble above */}
        <div className="relative flex flex-col items-center -mt-20 sm:-mt-24 mb-3">
          
          {/* "Drop a thought..." Thought Bubble (as in Screenshot 4) */}
          {editingThought ? (
            <div className="mb-2 bg-[#3a3b3c] p-2.5 rounded-2xl shadow-xl border border-emerald-500/50 flex flex-col items-center gap-1.5 z-20">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="Drop a thought..."
                  className="bg-[#242526] text-white text-xs px-2.5 py-1 rounded-full border border-[#4e4f50] focus:outline-none focus:border-[#1877F2]"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveThought(thought)}
                  className="p-1 rounded-full bg-[#1877F2] text-white"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                {['আলহামদুলিল্লাহ 🌸', 'দ্বীনের পথে 🤲', 'শান্তিতে আছি 🤍'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleSaveThought(preset)}
                    className="px-2 py-0.5 rounded-full bg-[#242526] text-emerald-300 hover:bg-[#18191a]"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditingThought(true)}
              className="mb-1 cursor-pointer bg-white text-neutral-900 text-[11px] font-semibold px-3 py-1 rounded-2xl shadow-lg border border-neutral-200 flex items-center gap-1.5 hover:scale-105 transition-transform relative animate-in fade-in"
              title="ক্লিক করে চিন্তা পরিবর্তন করুন"
            >
              <span>{thought}</span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
            </div>
          )}

          {/* Avatar with Camera Icon */}
          <div className="relative">
            <div
              onClick={() => setShowEditModal(true)}
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-[#242526] overflow-hidden bg-neutral-900 shadow-xl cursor-pointer"
            >
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute bottom-1.5 right-1.5 p-2 rounded-full bg-[#3a3b3c] text-white hover:bg-[#4e4f50] border-2 border-[#242526] shadow-md transition-colors"
              title="প্রোফাইল ছবি পরিবর্তন করুন"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Name: Sharif Hasan with dropdown arrow */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{userProfile.name}</h1>
            <div className="w-5 h-5 rounded-full bg-[#3a3b3c] flex items-center justify-center text-[#b0b3b8]">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <p className="text-xs text-[#b0b3b8] font-medium">{userProfile.friendsCount} friends</p>

          {/* Bio text */}
          {userProfile.bio && (
            <p className="text-xs sm:text-sm text-[#e4e6eb] max-w-md mx-auto pt-1 font-bengali">
              {userProfile.bio}
            </p>
          )}

          {/* Location badge */}
          <p className="text-xs text-[#b0b3b8] flex items-center justify-center gap-1 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#b0b3b8]" />
            <span>{userProfile.location}</span>
          </p>

          {/* Friends with things in common avatars */}
          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-[#b0b3b8]">
            <div className="flex -space-x-1.5 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
                alt="f1"
                className="inline-block h-6 w-6 rounded-full ring-2 ring-[#242526]"
              />
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80"
                alt="f2"
                className="inline-block h-6 w-6 rounded-full ring-2 ring-[#242526]"
              />
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                alt="f3"
                className="inline-block h-6 w-6 rounded-full ring-2 ring-[#242526]"
              />
            </div>
            <span>Friends with things in common</span>
          </div>
        </div>

        {/* Two Action Buttons: Add to story (blue) & Edit profile (grey) */}
        <div className="flex items-center gap-2.5 mt-4">
          <button
            onClick={onAddStory}
            className="flex-1 py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add to story</span>
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 py-2 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit profile</span>
          </button>
        </div>

        {/* Professional Dashboard & Creator Monetization Button */}
        <div className="mt-2.5">
          <button
            onClick={() => setShowMonetizationModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600/20 via-[#242526] to-[#1877F2]/20 hover:from-emerald-600/30 hover:to-[#1877F2]/30 border border-emerald-500/30 text-white font-bold text-xs flex items-center justify-between shadow-sm transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-black">
                ৳
              </span>
              <span>প্রফেশনাল ড্যাশবোর্ড ও ক্রিয়েটর মনিটাইজেশন</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              আর্নিং ও পেআউট
            </span>
          </button>
        </div>

        {/* Filter Pills: [ All ] [ Photos ] [ Reels ] */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#393a3b]">
          {(['all', 'photos', 'reels'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setProfileTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
                profileTab === tab
                  ? 'bg-[#1877F2]/20 text-[#2e89ff] border border-[#2e89ff]/40'
                  : 'bg-[#3a3b3c] text-[#b0b3b8] hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'photos' ? 'Photos' : 'Reels'}
            </button>
          ))}
        </div>

        {/* Personal Details Section (as in Screenshot 4) */}
        <div className="mt-4 pt-3 border-t border-[#393a3b] space-y-2.5 text-xs text-[#e4e6eb]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Details (ব্যক্তিগত বিবরণ)</h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="text-[#1877F2] hover:underline p-1 flex items-center gap-1 text-xs font-semibold"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-2 pt-1 text-[#b0b3b8]">
            {userProfile.work && (
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-[#b0b3b8] flex-shrink-0" />
                <span>Works at <span className="text-[#e4e6eb] font-semibold">{userProfile.work}</span></span>
              </div>
            )}
            {userProfile.education && (
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-[#b0b3b8] flex-shrink-0" />
                <span>{userProfile.education}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#b0b3b8] flex-shrink-0" />
              <span>Lives in <span className="text-[#e4e6eb] font-semibold">{userProfile.location}</span></span>
            </div>
            {userProfile.hometown && (
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-[#b0b3b8] flex-shrink-0" />
                <span>From <span className="text-[#e4e6eb] font-semibold">{userProfile.hometown}</span></span>
              </div>
            )}
            {userProfile.relationship && (
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-[#b0b3b8] flex-shrink-0" />
                <span>{userProfile.relationship}</span>
              </div>
            )}
            {userProfile.website && (
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-[#b0b3b8] flex-shrink-0" />
                <a
                  href={userProfile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline truncate"
                >
                  {userProfile.website}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Cake className="w-4 h-4 text-[#b0b3b8] flex-shrink-0" />
              <span>Born {userProfile.birthDate}</span>
            </div>
          </div>

          {/* Hobbies Pills */}
          {userProfile.hobbies && userProfile.hobbies.length > 0 && (
            <div className="pt-2">
              <p className="text-[11px] text-[#b0b3b8] font-bold mb-1.5">Hobbies:</p>
              <div className="flex flex-wrap gap-1.5">
                {userProfile.hobbies.map((h) => (
                  <span
                    key={h}
                    className="px-2.5 py-1 rounded-full bg-[#3a3b3c] text-[11px] text-[#e4e6eb] font-medium"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Edit Public Details Button */}
          <div className="pt-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full py-2 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Edit public details (পাবলিক ডিটেলস এডিট করুন)</span>
            </button>
          </div>
        </div>

      </div>

      {/* 4. User's Posts Feed */}
      <div className="p-3 sm:p-4 space-y-4">
        <h3 className="font-bold text-sm text-white px-1">Posts</h3>
        {userPosts.length === 0 ? (
          <div className="p-8 text-center bg-[#242526] rounded-2xl border border-[#393a3b] space-y-2">
            <p className="text-sm font-semibold text-white">এখনও কোনো পোস্ট নেই</p>
            <p className="text-xs text-[#b0b3b8]">নতুন কিছু শেয়ার করুন</p>
            <button
              onClick={onAddStory}
              className="px-4 py-1.5 rounded-lg bg-[#1877F2] text-white text-xs font-bold"
            >
              পোস্ট তৈরি করুন
            </button>
          </div>
        ) : (
          userPosts.map((post) => (
            <FbPostCard
              key={post.id}
              post={post}
              onToggleReaction={onToggleReaction}
              onToggleSave={onToggleSave}
              onAddComment={onAddComment}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
            />
          ))
        )}
      </div>

      {/* 5. Complete Edit Profile Modal */}
      {showEditModal && (
        <FbEditProfileModal
          userProfile={userProfile}
          onClose={() => setShowEditModal(false)}
          onSave={onUpdateProfile}
        />
      )}

      {/* 6. Creator Monetization Studio Modal */}
      {showMonetizationModal && (
        <CreatorMonetizationModal
          userProfile={userProfile}
          onClose={() => setShowMonetizationModal(false)}
        />
      )}

    </div>
  );
};
