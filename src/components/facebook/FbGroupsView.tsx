import React, { useState, useEffect } from 'react';
import { INITIAL_GROUPS } from '../../data/islamicPosts';
import { IslamicGroup, UserProfile } from '../../types';
import {
  Users,
  Check,
  Plus,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Search,
  Lock,
  Globe,
  Camera,
  Image as ImageIcon,
  Send,
  Share2,
  ThumbsUp,
  X,
  Compass
} from 'lucide-react';

interface FbGroupsViewProps {
  onBack?: () => void;
  userProfile?: UserProfile;
}

const PRESET_GROUP_COVERS = [
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
];

export const FbGroupsView: React.FC<FbGroupsViewProps> = ({ onBack, userProfile }) => {
  const [groups, setGroups] = useState<IslamicGroup[]>(() => {
    try {
      const stored = localStorage.getItem('qalby_fb_groups');
      return stored ? JSON.parse(stored) : INITIAL_GROUPS;
    } catch {
      return INITIAL_GROUPS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('qalby_fb_groups', JSON.stringify(groups));
    } catch {}
  }, [groups]);

  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'discover'>('all');
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<IslamicGroup | null>(null);

  // Create Group Modal
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState<'public' | 'private'>('public');
  const [newGroupCategory, setNewGroupCategory] = useState('কুরআন ও হাদিস চর্চা');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCover, setNewGroupCover] = useState(PRESET_GROUP_COVERS[0]);

  // Group Posts State
  const [groupPosts, setGroupPosts] = useState<Record<string, Array<{ id: string; author: string; avatar: string; text: string; time: string; likes: number }>>>({
    'grp-1': [
      {
        id: 'gp-1',
        author: 'মাওলানা মাহমুদ হাসান',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        text: 'আলহামদুলিল্লাহ! আজকের তাজবীদ ক্লাসে সূরা আল-ফাতিহার মাখরাজ আলোচনা করা হয়েছে। যারা যুক্ত হতে চান কমেন্ট করুন।',
        time: '১ ঘণ্টা আগে',
        likes: 38,
      },
    ],
  });
  const [newPostText, setNewPostText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleJoin = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const next = !g.isJoined;
          showToast(next ? 'গ্রুপে সফলভাবে যোগ দিয়েছেন! ✓' : 'গ্রুপ থেকে লিভ নিয়েছেন');
          return { ...g, isJoined: next };
        }
        return g;
      })
    );

    if (selectedGroup && selectedGroup.id === groupId) {
      setSelectedGroup((prev) => (prev ? { ...prev, isJoined: !prev.isJoined } : null));
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      showToast('দয়া করে গ্রুপের নাম লিখুন');
      return;
    }

    const created: IslamicGroup = {
      id: `grp-${Date.now()}`,
      name: newGroupName.trim(),
      avatar: newGroupCover,
      coverImage: newGroupCover,
      membersCount: '১ সদস্য (আপনি অ্যাডমিন)',
      description: newGroupDesc.trim() || `${newGroupName} - একটি দ্বীনি ও শিক্ষণীয় প্ল্যাটফর্ম।`,
      postsPerDay: 'নতুন গ্রুপ',
      isJoined: true,
      category: newGroupCategory,
      privacy: newGroupPrivacy,
    };

    setGroups((prev) => [created, ...prev]);
    setShowCreateGroupModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setSelectedGroup(created);
    showToast(`🎉 "${created.name}" গ্রুপটি তৈরি হয়েছে!`);
  };

  const handleAddGroupPost = () => {
    if (!newPostText.trim() || !selectedGroup) return;

    const post = {
      id: `gp-${Date.now()}`,
      author: userProfile?.name || 'Sharif Hasan',
      avatar: userProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      text: newPostText.trim(),
      time: 'এখনই',
      likes: 1,
    };

    setGroupPosts((prev) => ({
      ...prev,
      [selectedGroup.id]: [post, ...(prev[selectedGroup.id] || [])],
    }));

    setNewPostText('');
    showToast('গ্রুপে পোস্ট করা হয়েছে!');
  };

  const filteredGroups = groups.filter((g) => {
    const match = g.name.toLowerCase().includes(search.toLowerCase()) || g.category.toLowerCase().includes(search.toLowerCase());
    if (!match) return false;
    if (activeTab === 'joined') return g.isJoined;
    if (activeTab === 'discover') return !g.isJoined;
    return true;
  });

  // Group Details View
  if (selectedGroup) {
    const posts = groupPosts[selectedGroup.id] || [];

    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-24">
        {/* Top Sticky Bar */}
        <div className="sticky top-0 z-30 bg-[#242526]/95 backdrop-blur-md px-3 py-2.5 flex items-center justify-between border-b border-[#393a3b]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedGroup(null)}
              className="p-2 rounded-full hover:bg-[#3a3b3c] text-white"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div>
              <h2 className="font-bold text-sm text-white line-clamp-1">{selectedGroup.name}</h2>
              <p className="text-[10px] text-[#b0b3b8] flex items-center gap-1">
                {selectedGroup.privacy === 'private' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                <span>{selectedGroup.membersCount}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedGroup(null)}
            className="px-3 py-1.5 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-bold text-white"
          >
            ব্যাক
          </button>
        </div>

        {/* Group Cover */}
        <div className="h-44 w-full relative overflow-hidden rounded-2xl bg-neutral-800">
          <img src={selectedGroup.coverImage} alt={selectedGroup.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        </div>

        {/* Group Header Card */}
        <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">{selectedGroup.name}</h1>
              <p className="text-xs text-[#b0b3b8] flex items-center gap-1.5 mt-0.5">
                <Users className="w-3.5 h-3.5 text-teal-400" />
                <span>{selectedGroup.membersCount} • {selectedGroup.postsPerDay}</span>
              </p>
            </div>

            <button
              onClick={() => toggleJoin(selectedGroup.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedGroup.isJoined
                  ? 'bg-[#3a3b3c] text-white hover:bg-[#4e4f50]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
              }`}
            >
              {selectedGroup.isJoined ? 'যুক্ত আছেন ✓' : '+ যোগ দিন (Join)'}
            </button>
          </div>

          <p className="text-xs text-[#b0b3b8] leading-relaxed bg-[#18191a] p-3 rounded-xl border border-[#393a3b]">
            {selectedGroup.description}
          </p>
        </div>

        {/* Post in Group Box */}
        {selectedGroup.isJoined && (
          <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-3.5 space-y-3 shadow-md">
            <p className="text-xs font-bold text-white">গ্রুপে কিছু লিখুন বা প্রশ্ন করুন:</p>
            <textarea
              rows={2}
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="দ্বীনি আলোচনা, জিজ্ঞাসা বা উপদেশ লিখুন..."
              className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-3 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-teal-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddGroupPost}
                disabled={!newPostText.trim()}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>পোস্ট করুন</span>
              </button>
            </div>
          </div>
        )}

        {/* Group Posts Feed */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="bg-[#242526] rounded-2xl p-6 text-center border border-[#393a3b] text-xs text-[#b0b3b8]">
              এই গ্রুপে এখনও কোনো নতুন পোস্ট নেই।
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-[#242526] rounded-2xl border border-[#393a3b] p-3.5 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <img src={post.avatar} alt={post.author} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white">{post.author}</h4>
                    <p className="text-[10px] text-[#b0b3b8]">{post.time} • গ্রুপ সদস্য</p>
                  </div>
                </div>
                <p className="text-xs text-[#e4e6eb] leading-relaxed whitespace-pre-wrap">{post.text}</p>
                <div className="flex items-center gap-4 pt-2 border-t border-[#393a3b]/60 text-xs text-[#b0b3b8]">
                  <button onClick={() => showToast('লাইক দেওয়া হয়েছে')} className="flex items-center gap-1.5 hover:text-white">
                    <ThumbsUp className="w-4 h-4 text-teal-400" />
                    <span>{post.likes} লাইক</span>
                  </button>
                  <button onClick={() => showToast('কমেন্ট করুন')} className="flex items-center gap-1.5 hover:text-white">
                    <MessageSquare className="w-4 h-4" />
                    <span>মন্তব্য</span>
                  </button>
                  <button onClick={() => showToast('পোস্ট শেয়ার করা হয়েছে')} className="flex items-center gap-1.5 hover:text-white">
                    <Share2 className="w-4 h-4" />
                    <span>শেয়ার</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      {/* Top Header Card */}
      <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-white transition-colors"
              title="পেছনে যান (Back)"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
          )}
          <div className="p-2.5 rounded-xl bg-teal-950/80 border border-teal-500/30 text-teal-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Groups (গ্রুপসমূহ)</h2>
            <p className="text-xs text-[#b0b3b8]">
              দ্বীনি আলোচনা ও ইসলামিক কমিউনিটি ({groups.length})
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="px-3.5 py-1.5 rounded-full bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white transition-all flex items-center gap-1.5 shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>গ্রুপ খুলুন (Create)</span>
        </button>
      </div>

      {/* Action Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setShowCreateGroupModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 hover:bg-teal-500 hover:text-white text-xs font-bold whitespace-nowrap transition-colors"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ নতুন গ্রুপ খুলুন</span>
        </button>

        <button
          onClick={() => setActiveTab('joined')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'joined'
              ? 'bg-[#3a3b3c] text-white'
              : 'bg-[#242526] border border-[#393a3b] text-[#b0b3b8] hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>আপনার গ্রুপসমূহ (Joined)</span>
        </button>

        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            activeTab === 'discover'
              ? 'bg-[#3a3b3c] text-white'
              : 'bg-[#242526] border border-[#393a3b] text-[#b0b3b8] hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>নতুন গ্রুপ আবিষ্কার</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="গ্রুপের নাম খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#242526] border border-[#393a3b] rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-teal-500"
        />
        <Search className="w-4 h-4 text-[#b0b3b8] absolute left-3 top-2.5" />
      </div>

      {/* Groups List */}
      <div className="space-y-3.5">
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="bg-[#242526] rounded-2xl border border-[#393a3b] overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all"
          >
            {/* Cover image */}
            <div
              onClick={() => setSelectedGroup(group)}
              className="h-28 w-full overflow-hidden relative cursor-pointer group"
            >
              <img
                src={group.coverImage}
                alt={group.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div
                  onClick={() => setSelectedGroup(group)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={group.avatar}
                    alt={group.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-[#242526] -mt-8 shadow-lg z-10 bg-neutral-900"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors leading-tight">
                      {group.name}
                    </h3>
                    <p className="text-[11px] text-[#b0b3b8]">
                      {group.membersCount} • {group.postsPerDay}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleJoin(group.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    group.isJoined
                      ? 'bg-[#3a3b3c] text-[#e4e6eb] hover:bg-[#4e4f50]'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {group.isJoined ? 'যুক্ত আছেন ✓' : '+ যোগ দিন (Join)'}
                </button>
              </div>

              <p className="text-xs text-[#b0b3b8] leading-relaxed">
                {group.description}
              </p>

              <div className="pt-1">
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="w-full py-1.5 rounded-xl bg-[#18191a] hover:bg-[#3a3b3c] text-xs font-semibold text-[#e4e6eb] transition-colors border border-[#393a3b]"
                >
                  গ্রুপে প্রবেশ করুন →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE GROUP MODAL */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#242526] w-full max-w-lg rounded-2xl border border-[#393a3b] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-4 py-3 border-b border-[#393a3b] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm text-white">নতুন গ্রুপ খুলুন (Create Group)</h3>
              </div>
              <button onClick={() => setShowCreateGroupModal(false)} className="p-1 rounded-full text-[#b0b3b8] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  গ্রুপের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: প্রতিদিনের হাদিস পাঠ ও দাওয়াহ..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">গোপনীয়তা (Privacy)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewGroupPrivacy('public')}
                    className={`p-2.5 rounded-xl text-left border text-xs ${
                      newGroupPrivacy === 'public'
                        ? 'border-teal-500 bg-teal-500/10 text-white font-bold'
                        : 'border-[#393a3b] bg-[#18191a] text-[#b0b3b8]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-teal-400" />
                      <span>পাবলিক (Public)</span>
                    </div>
                    <p className="text-[10px] text-[#8a8d91] mt-1">যে কেউ গ্রুপ ও পোস্ট দেখতে পাবে</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewGroupPrivacy('private')}
                    className={`p-2.5 rounded-xl text-left border text-xs ${
                      newGroupPrivacy === 'private'
                        ? 'border-teal-500 bg-teal-500/10 text-white font-bold'
                        : 'border-[#393a3b] bg-[#18191a] text-[#b0b3b8]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>প্রাইভেট (Private)</span>
                    </div>
                    <p className="text-[10px] text-[#8a8d91] mt-1">শুধু সদস্যরা পোস্ট দেখতে পাবে</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">বিবরণ (Description)</label>
                <textarea
                  rows={2}
                  placeholder="গ্রুপের নিয়মাবলী ও উদ্দেশ্য লিখুন..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-teal-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">কভার ছবি নির্বাচন করুন</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_GROUP_COVERS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Cover"
                      onClick={() => setNewGroupCover(url)}
                      className={`w-20 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        newGroupCover === url ? 'border-teal-500 scale-105' : 'border-transparent opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#3a3b3c] text-xs font-bold text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>গ্রুপ তৈরি করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-teal-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
