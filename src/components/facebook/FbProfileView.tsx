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
  ArrowLeft,
  Check,
  Briefcase,
  GraduationCap,
  Heart,
  Globe,
  SlidersHorizontal,
  Flag,
  DollarSign,
  ShieldCheck,
  Activity,
  Copy,
  X,
  Music,
  Phone,
} from 'lucide-react';
import { UserProfile, PostItem } from '../../types';
import { FbPostCard } from './FbPostCard';
import { FbEditProfileModal } from './FbEditProfileModal';
import { CreatorMonetizationModal } from '../monetization/CreatorMonetizationModal';

interface FbProfileViewProps {
  userProfile: UserProfile;
  userPosts: PostItem[];
  onOpenMenu: () => void;
  onOpenPages?: () => void;
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
  onOpenPages,
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
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState<'main' | 'sf-mart' | 'sharif-story'>('main');
  const [showAccountsCenterModal, setShowAccountsCenterModal] = useState(false);
  const [switchFeedback, setSwitchFeedback] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [editingThought, setEditingThought] = useState(false);
  const [thought, setThought] = useState(
    userProfile.thoughtBubble && userProfile.thoughtBubble !== 'Share a song...'
      ? userProfile.thoughtBubble
      : 'Drop a thought...'
  );

  const handleSaveThought = (newThought: string) => {
    setThought(newThought);
    setEditingThought(false);
    onUpdateProfile({
      ...userProfile,
      thoughtBubble: newThought,
    });
  };

  const handleCopyProfileLink = () => {
    const link = `${window.location.origin}/user/${encodeURIComponent(userProfile.name)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="max-w-[500px] mx-auto min-h-screen bg-[#121212] text-[#e4e6eb] pb-24 font-sans selection:bg-[#0866FF]/30">
      
      {/* 1. Top Header Bar (Matching Facebook Katana) */}
      <div className="sticky top-0 z-30 bg-[#121212] border-b border-[#222222] px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenMenu}
            className="p-1.5 rounded-full text-white hover:bg-[#3a3b3c] transition-colors"
            title="Menu"
          >
            <Menu className="w-6 h-6 stroke-[2.2]" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-white">
          {/* Edit / Pencil icon */}
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 rounded-full hover:bg-[#3a3b3c] text-white transition-colors"
            title="Edit profile"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          {/* Search icon */}
          <button
            onClick={onOpenMenu}
            className="p-2 rounded-full hover:bg-[#3a3b3c] text-white transition-colors cursor-pointer"
            title="Search & Menu"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Three dots menu */}
          <button
            onClick={() => setShowSettingsSheet(true)}
            className="p-2 rounded-full hover:bg-[#3a3b3c] text-white transition-colors"
            title="Profile settings"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Cover Photo Section: Height 180px, border-radius 0, with camera icon bottom-right (white circle, black icon) */}
      <div className="relative h-[180px] w-full bg-neutral-900 rounded-none overflow-hidden">
        <img
          src={userProfile.coverPhoto || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {/* White circle, black camera icon bottom-right */}
        <button
          onClick={() => setShowEditModal(true)}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center text-black shadow-md hover:bg-neutral-100 transition-colors"
          title="Update cover photo"
        >
          <Camera className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* 3. Profile Picture & Thought Bubble Section */}
      <div className="bg-[#121212] px-4 pb-4">
        
        {/* Container overlapping cover photo by -40px, center aligned */}
        <div className="relative flex flex-col items-center -mt-[40px]">
          
          {/* "Drop a thought..." bubble above profile pic: white background, grey text, rounded 20px */}
          {editingThought ? (
            <div className="mb-2 bg-white text-neutral-800 p-2 rounded-[20px] shadow-xl flex items-center gap-1.5 z-20">
              <input
                type="text"
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder="Drop a thought..."
                className="bg-neutral-100 text-neutral-900 text-xs px-3 py-1 rounded-full outline-none w-44"
                autoFocus
              />
              <button
                onClick={() => handleSaveThought(thought)}
                className="p-1 rounded-full bg-[#0866FF] text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setEditingThought(true)}
              className="mb-2 cursor-pointer bg-white text-[#65676B] text-[13px] font-medium px-4 py-1.5 rounded-[20px] shadow-lg flex items-center gap-1.5 relative hover:scale-105 transition-transform"
              title="Click to drop a thought"
            >
              <span>{thought || "Drop a thought..."}</span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rotate-45" />
            </div>
          )}

          {/* Profile Picture: 168px x 168px, circular, blue border 4px */}
          <div className="relative">
            <div
              onClick={() => setShowEditModal(true)}
              className="w-[168px] h-[168px] min-w-[168px] min-h-[168px] rounded-full border-4 border-[#0866FF] overflow-hidden bg-neutral-900 shadow-2xl cursor-pointer"
            >
              <img
                src={userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"}
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Small camera icon bottom-right of profile pic: grey circle with black camera */}
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute bottom-1 right-2 w-9 h-9 rounded-full bg-[#E4E6EB] hover:bg-neutral-300 flex items-center justify-center text-black border-2 border-[#121212] shadow-md transition-colors"
              title="Change profile picture"
            >
              <Camera className="w-5 h-5 text-black" />
            </button>
          </div>
        </div>

        {/* 4. NAME SECTION:
            - Name "Sharif Hasan" style: Bold 24px, center.
            - Below "331 friends" 14px grey.
            - Right side dropdown arrow button grey circle with red notification dot top-right. */}
        <div className="mt-3 text-center space-y-1">
          <div className="relative flex items-center justify-center px-2">
            <h1 className="text-[24px] font-bold text-white tracking-tight leading-tight">
              {activeProfileId === 'sf-mart'
                ? 'SF MART BD'
                : activeProfileId === 'sharif-story'
                ? "Sharif's Life Story"
                : (userProfile.name && userProfile.name !== 'New Member' ? userProfile.name : 'Sharif Hasan')}
            </h1>

            {/* Right side dropdown arrow button: grey circle with red notification dot top-right */}
            <button
              onClick={() => setShowProfileSwitcher(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer p-0 rounded-full hover:opacity-95 active:scale-95 transition-all group"
              title="Switch profile or page"
            >
              <div className="w-9 h-9 rounded-full bg-[#3A3B3C] group-hover:bg-[#4E4F50] flex items-center justify-center text-[#E4E6EB] shadow-sm transition-colors border border-white/5">
                <ChevronDown className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#E41E3F] ring-2 ring-[#121212]" />
            </button>
          </div>

          {/* Below "331 friends" 14px grey */}
          <p className="text-[14px] text-[#B0B3B8] font-normal">
            {userProfile.friendsCount || 331} friends
          </p>

          {/* Below that: show 3 friend avatars overlapping, then text "Friends with things in common" grey 13px */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#121212] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="Friend 1" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#121212] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80" alt="Friend 2" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-[#121212] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80" alt="Friend 3" />
            </div>
            <span className="text-[13px] text-[#B0B3B8]">Friends with things in common</span>
          </div>
        </div>

        {/* Two buttons:
            "Add to story" blue #0866FF, white text, + icon, width 60%.
            "Edit profile" grey #3A3B3C, white text, pencil icon, width 38%.
            Both height 36px, border-radius 8px, flex row gap 8px */}
        <div className="flex items-center gap-2 mt-4 w-full">
          <button
            onClick={onAddStory}
            className="w-[60%] h-[36px] rounded-[8px] bg-[#0866FF] hover:bg-[#1877F2] text-white font-semibold text-[14px] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add to story</span>
          </button>

          <button
            onClick={() => setShowEditModal(true)}
            className="w-[38%] h-[36px] rounded-[8px] bg-[#3A3B3C] hover:bg-[#4E4F50] text-white font-semibold text-[14px] flex items-center justify-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit profile</span>
          </button>
        </div>

        {/* 5. TABS:
            Tabs: All, Photos, Reels.
            All is selected with light blue background #E7F3FF, blue text. Others grey #3A3B3C background.
            Height 32px, border-radius 20px */}
        <div className="flex items-center gap-2 mt-4">
          {(['all', 'photos', 'reels'] as const).map((tab) => {
            const isSelected = profileTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setProfileTab(tab)}
                className={`h-[32px] rounded-[20px] px-4 text-[13px] font-semibold flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-[#E7F3FF] text-[#0866FF] font-bold'
                    : 'bg-[#3A3B3C] text-white hover:bg-[#4E4F50]'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'photos' ? 'Photos' : 'Reels'}
              </button>
            );
          })}
        </div>

        {/* 6. AT A GLANCE SECTION:
            - Title "At a glance" bold 16px left, "See all" blue right
            - List items with icons: location icon, home icon, birthday cake, heart. Text 15px. Icons 20px grey
            - Lives in Dhaka, From Dhaka, Born August 17, 1991, Married */}
        <div className="mt-5 pt-4 border-t border-[#222222] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[16px] text-white">At a glance</h3>
            <button
              onClick={() => setShowEditModal(true)}
              className="text-[#0866FF] hover:underline font-semibold text-[14px] transition-colors"
            >
              See all
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {/* 1. Location: Lives in Dhaka, Bangladesh */}
            <div className="flex items-center gap-3 text-[15px] text-[#E4E6EB]">
              <MapPin className="w-5 h-5 text-[#B0B3B8] shrink-0" />
              <span>
                Lives in <span className="font-semibold text-white">{userProfile.location || 'Dhaka, Bangladesh'}</span>
              </span>
            </div>

            {/* 2. Home: From Dhaka, Bangladesh */}
            <div className="flex items-center gap-3 text-[15px] text-[#E4E6EB]">
              <Home className="w-5 h-5 text-[#B0B3B8] shrink-0" />
              <span>
                From <span className="font-semibold text-white">{userProfile.hometown || 'Dhaka, Bangladesh'}</span>
              </span>
            </div>

            {/* 3. Birthday cake: Born August 17, 1991 */}
            <div className="flex items-center gap-3 text-[15px] text-[#E4E6EB]">
              <Cake className="w-5 h-5 text-[#B0B3B8] shrink-0" />
              <span>
                Born <span className="font-semibold text-white">{userProfile.birthDate || 'August 17, 1991'}</span>
              </span>
            </div>

            {/* 4. Heart: Married */}
            <div className="flex items-center gap-3 text-[15px] text-[#E4E6EB]">
              <Heart className="w-5 h-5 text-[#B0B3B8] shrink-0" />
              <span>
                <span className="font-semibold text-white">{userProfile.relationship || 'Married'}</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 7. User's Posts Feed */}
      <div className="p-3 sm:p-4 space-y-3 border-t border-[#222222] bg-[#121212]">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-[16px] text-white">Posts</h3>
          <button
            onClick={() => setShowEditModal(true)}
            className="text-xs text-[#B0B3B8] hover:text-white"
          >
            Manage posts
          </button>
        </div>
        {userPosts.length === 0 ? (
          <div className="p-8 text-center bg-[#1C1C1D] rounded-[10px] border border-[#222222] space-y-2">
            <p className="text-sm font-semibold text-white">এখনও কোনো পোস্ট নেই</p>
            <p className="text-xs text-[#B0B3B8]">নতুন কিছু শেয়ার করুন</p>
            <button
              onClick={onAddStory}
              className="px-4 py-1.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold"
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

      {/* 7. Facebook Profile Settings Action Sheet (Triggered by ⋯ or Dropdown) */}
      {showSettingsSheet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#242526] border border-[#393a3b] rounded-t-2xl sm:rounded-2xl p-4 text-white shadow-2xl space-y-3 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-[#393a3b]">
              <h2 className="font-bold text-base">Profile settings</h2>
              <button
                onClick={() => setShowSettingsSheet(false)}
                className="p-1 rounded-full text-[#b0b3b8] hover:bg-[#3a3b3c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-sm font-medium">
              {/* Pages & Followers */}
              <button
                onClick={() => {
                  setShowSettingsSheet(false);
                  if (onOpenPages) onOpenPages();
                  else onOpenMenu();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#3a3b3c] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">Pages (পেইজসমূহ)</p>
                  <p className="text-xs text-[#b0b3b8]">পেইজ তৈরি, ফলোয়ার ও ভিডিও পরিচালনা করুন</p>
                </div>
              </button>

              {/* Creator Monetization */}
              <button
                onClick={() => {
                  setShowSettingsSheet(false);
                  setShowMonetizationModal(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#3a3b3c] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">Professional dashboard & Monetization</p>
                  <p className="text-xs text-[#b0b3b8]">আর্নিং, স্টারস ও পেআউট বিবরণ</p>
                </div>
              </button>

              {/* Profile Status */}
              <button
                onClick={() => {
                  setShowSettingsSheet(false);
                  setShowEditModal(true);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#3a3b3c] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">Profile status</p>
                  <p className="text-xs text-[#b0b3b8]">Good standing • ইসলামিক গাইডলাইন ভেরিফাইড</p>
                </div>
              </button>

              {/* Activity Log */}
              <button
                onClick={() => {
                  setShowSettingsSheet(false);
                  onOpenMenu();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#3a3b3c] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">Activity log</p>
                  <p className="text-xs text-[#b0b3b8]">আপনার পোস্ট ও লাইক হিস্টোরি</p>
                </div>
              </button>

              {/* Copy Profile Link */}
              <button
                onClick={handleCopyProfileLink}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#3a3b3c] text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-neutral-700 text-[#e4e6eb] flex items-center justify-center shrink-0">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-white">
                    {copyFeedback ? '✓ লিংক কপি হয়েছে!' : 'Copy link to profile'}
                  </p>
                  <p className="text-xs text-[#b0b3b8]">আপনার প্রোফাইলের সরাসরি শেয়ারযোগ্য লিংক</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Facebook Profile & Page Switcher Bottom Sheet (Matching Screenshot 1 Pixel-by-Pixel) */}
      {showProfileSwitcher && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-end justify-center p-0 animate-in fade-in"
          onClick={() => setShowProfileSwitcher(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-[28px] p-4 text-neutral-900 shadow-2xl animate-in slide-in-from-bottom duration-200 max-h-[92vh] overflow-y-auto no-scrollbar font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drag Handle */}
            <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-3.5" />

            {/* Switch Feedback Toast */}
            {switchFeedback && (
              <div className="mb-3 p-2.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl text-center border border-emerald-200 animate-in fade-in">
                {switchFeedback}
              </div>
            )}

            {/* Upper Section: Main Profile & Pages Card (Exact Screenshot 1) */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-neutral-100">
              
              {/* 1. Main Personal Profile (Sharif Hasan) */}
              <button
                onClick={() => {
                  setActiveProfileId('main');
                  setSwitchFeedback(`সুইচ করা হয়েছে: ${userProfile.name}`);
                  setTimeout(() => {
                    setSwitchFeedback(null);
                    setShowProfileSwitcher(false);
                  }, 700);
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200 shadow-sm shrink-0">
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-base text-neutral-900 leading-tight">
                      {userProfile.name}
                    </p>
                  </div>
                </div>

                {activeProfileId === 'main' && (
                  <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* 2. Page 1: SF MART BD */}
              <button
                onClick={() => {
                  setActiveProfileId('sf-mart');
                  setSwitchFeedback('সুইচ করা হয়েছে: SF MART BD');
                  setTimeout(() => {
                    setSwitchFeedback(null);
                    setShowProfileSwitcher(false);
                  }, 700);
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200 shadow-sm shrink-0 bg-neutral-100 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=200&q=80"
                      alt="SF MART BD"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[15px] text-neutral-900 leading-tight">
                      SF MART BD
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span>10 notifications</span>
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-[11px] font-medium">
                      Page
                    </span>
                  </div>
                </div>

                {activeProfileId === 'sf-mart' && (
                  <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* 3. Page 2: Sharif's Life Story */}
              <button
                onClick={() => {
                  setActiveProfileId('sharif-story');
                  setSwitchFeedback("সুইচ করা হয়েছে: Sharif's Life Story");
                  setTimeout(() => {
                    setSwitchFeedback(null);
                    setShowProfileSwitcher(false);
                  }, 700);
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200 shadow-sm shrink-0 bg-neutral-100 flex items-center justify-center">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                      alt="Sharif's Life Story"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-[15px] text-neutral-900 leading-tight">
                      Sharif's Life Story
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span>50 notifications</span>
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-[11px] font-medium">
                      Page
                    </span>
                  </div>
                </div>

                {activeProfileId === 'sharif-story' && (
                  <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>

              {/* 4. Create Facebook Page */}
              <button
                onClick={() => {
                  setShowProfileSwitcher(false);
                  if (onOpenPages) onOpenPages();
                  else onOpenMenu();
                }}
                className="w-full flex items-center gap-3.5 p-3.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 shrink-0">
                  <Plus className="w-6 h-6 stroke-[2.2]" />
                </div>
                <p className="font-medium text-[15px] text-neutral-900">
                  Create Facebook Page
                </p>
              </button>

            </div>

            {/* Lower Section: Other profiles (Exact Screenshot 1) */}
            <div className="pt-4">
              <h3 className="text-sm font-semibold text-neutral-600 px-1 pb-2">
                Other profiles
              </h3>

              <div className="bg-white rounded-2xl border border-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-neutral-100">
                
                {/* 1. Instagram profile (sfmartbd.official) */}
                <div className="flex items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-12 h-12 shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=200&q=80"
                        alt="sfmartbd.official"
                        className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                      />
                      {/* Instagram camera badge overlay */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white ring-2 ring-white">
                        <Camera className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-[15px] text-neutral-900 leading-tight">
                        sfmartbd.official
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <span>36 notifications</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowSettingsSheet(true)}
                    className="p-2 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* 2. WhatsApp linked phone (+880 1951-230477) */}
                <div className="flex items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-12 h-12 shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=200&q=80"
                        alt="WhatsApp"
                        className="w-12 h-12 rounded-full object-cover border border-neutral-200"
                      />
                      {/* WhatsApp phone badge overlay */}
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white ring-2 ring-white">
                        <Phone className="w-2.5 h-2.5" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-[15px] text-neutral-900 leading-tight">
                        +880 1951-230477
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Button: Go to Accounts Center (Exact Screenshot 1) */}
            <div className="pt-4 pb-2">
              <button
                onClick={() => {
                  setShowProfileSwitcher(false);
                  setShowAccountsCenterModal(true);
                }}
                className="w-full py-2.5 px-4 rounded-full border border-neutral-300 hover:bg-neutral-50 active:scale-[0.99] text-sm font-semibold text-neutral-800 transition-all text-center shadow-xs"
              >
                Go to Accounts Center
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 9. Meta Accounts Center Modal */}
      {showAccountsCenterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 text-neutral-900 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-[#0866FF] font-black text-lg">∞ Meta</span>
                <span className="font-bold text-base text-neutral-800">Accounts Center</span>
              </div>
              <button
                onClick={() => setShowAccountsCenterModal(false)}
                className="p-1 rounded-full text-neutral-500 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Manage your connected experiences and account settings across Meta technologies like Facebook, Instagram, and WhatsApp.
            </p>

            <div className="space-y-2 text-sm font-medium">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">Profiles & Accounts</p>
                  <p className="text-xs text-neutral-500">Facebook, Instagram, WhatsApp</p>
                </div>
                <span className="text-xs text-[#0866FF] font-bold">3 connected</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">Password & Security</p>
                  <p className="text-xs text-neutral-500">Two-factor auth, saved logins</p>
                </div>
                <span className="text-xs text-emerald-600 font-bold">Secured ✓</span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">Personal Details</p>
                  <p className="text-xs text-neutral-500">Contact info, birthday, identity verification</p>
                </div>
                <span className="text-xs text-[#0866FF] font-bold">Edit</span>
              </div>
            </div>

            <button
              onClick={() => setShowAccountsCenterModal(false)}
              className="w-full py-2.5 rounded-full bg-[#0866FF] text-white font-semibold text-sm hover:bg-[#1877F2] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
