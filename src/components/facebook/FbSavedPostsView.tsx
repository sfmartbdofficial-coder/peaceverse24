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
    <div className="max-w-2xl mx-auto space-y-4 pb-20 bg-white text-black">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-[#E4E6EB] p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToFeed}
            className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-black"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-black flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#0866FF] fill-current" />
              <span>সংরক্ষিত পোস্টসমূহ (Saved Posts)</span>
            </h2>
            <p className="text-xs text-[#65676B]">
              {savedPosts.length} টি সংরক্ষিত পোস্ট ও তিলাওয়াত
            </p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {savedPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E4E6EB] p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-[#F0F2F5] border border-[#E4E6EB] flex items-center justify-center text-[#65676B] mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-black">কোনো সংরক্ষিত পোস্ট নেই</h3>
          <p className="text-xs text-[#65676B] max-w-sm mx-auto">
            ফিডের যেকোনো পোস্টের ৩-ডট মেনু বা সেভ বাটনে ক্লিক করে প্রিয় আয়াত বা উপদেশ সংরক্ষণ করতে পারেন।
          </p>
          <button
            onClick={onBackToFeed}
            className="px-5 py-2 bg-[#0866FF] hover:bg-[#0055D4] text-white rounded-xl text-xs font-bold transition-colors"
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
