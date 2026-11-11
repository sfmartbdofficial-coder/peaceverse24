import React from 'react';
import { PostItem, ReactionType } from '../../types';
import { FbPostCard } from './FbPostCard';
import { Bookmark, ArrowLeft, Trash2 } from 'lucide-react';

interface FbSavedPostsViewProps {
  posts: PostItem[];
  onToggleReaction: (postId: string, reaction: ReactionType) => void;
  onToggleSave: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onBackToFeed: () => void;
  onOpenReel?: (post: PostItem) => void;
}

export const FbSavedPostsView: React.FC<FbSavedPostsViewProps> = ({
  posts,
  onToggleReaction,
  onToggleSave,
  onAddComment,
  onBackToFeed,
  onOpenReel,
}) => {
  const savedPosts = posts.filter((p) => p.isSaved);

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-20">
      {/* Header */}
      <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToFeed}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-emerald-400 fill-current" />
              <span>সংরক্ষিত পোস্টসমূহ (Saved Posts)</span>
            </h2>
            <p className="text-xs text-[#b0b3b8]">
              {savedPosts.length} টি সংরক্ষিত পোস্ট ও তিলাওয়াত
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {savedPosts.length === 0 ? (
        <div className="bg-[#242526] rounded-2xl border border-[#393a3b] p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#18191a] border border-[#393a3b] flex items-center justify-center text-[#b0b3b8] mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-white">কোনো সংরক্ষিত পোস্ট নেই</h3>
          <p className="text-xs text-[#b0b3b8] max-w-sm mx-auto">
            ফিডের যেকোনো পোস্টের ৩-ডট মেনু বা সেভ বাটনে ক্লিক করে প্রিয় আয়াত বা উপদেশ সংরক্ষণ করতে পারেন।
          </p>
          <button
            onClick={onBackToFeed}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
          >
            ফিডে ফিরে যান
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post) => (
            <FbPostCard
              key={post.id}
              post={post}
              onToggleReaction={onToggleReaction}
              onToggleSave={onToggleSave}
              onAddComment={onAddComment}
              onOpenReel={onOpenReel}
            />
          ))}
        </div>
      )}
    </div>
  );
};
