import React from 'react';
import { ArrowLeft, Clock, Sparkles, Share2, Heart, MessageCircle } from 'lucide-react';
import { PostItem } from '../../types';

interface FbMemoriesViewProps {
  onBack: () => void;
  posts: PostItem[];
}

export const FbMemoriesView: React.FC<FbMemoriesViewProps> = ({ onBack, posts }) => {
  const memoryPosts = posts.slice(0, 3);

  return (
    <div className="max-w-[700px] mx-auto min-h-screen bg-white text-black pb-24 p-3 sm:p-4 space-y-4">
      {/* Top Header with Back button */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E4E6EB]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-[#F0F2F5] text-black transition-colors"
            title="পেছনে যান (Back)"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0866FF]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-black">Memories (স্মৃতি)</h1>
              <p className="text-xs text-[#65676B]">১ বছর আগে আজকের এই দিনে</p>
            </div>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-xs font-bold text-black transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ব্যাক</span>
        </button>
      </div>

      {/* Memory Banner */}
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-sm flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-[#0866FF] flex-shrink-0" />
        <p className="text-xs text-black">
          আমরা আশা করি অতীতের এই স্মৃতিময় দ্বীনি মুহূর্তগুলো আপনার মনে প্রশান্তি এনে দেবে।
        </p>
      </div>

      {/* Memory Posts */}
      <div className="space-y-4">
        {memoryPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-2xl border border-[#E4E6EB] p-4 space-y-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-sm text-black">{post.author.name}</p>
                <p className="text-[11px] text-[#65676B]">১ বছর আগে • {post.category}</p>
              </div>
            </div>

            <p className="text-sm text-black leading-relaxed">
              {post.contentBangla}
            </p>

            {post.arabicVerse && (
              <div className="bg-[#F0F2F5] p-3 rounded-xl border border-[#E4E6EB] text-center font-arabic text-emerald-700 text-sm">
                {post.arabicVerse}
              </div>
            )}

            <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between text-xs text-[#65676B]">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-500 fill-current" />
                <span>{post.reactions.total} রিঅ্যাকশন</span>
              </span>
              <button
                onClick={onBack}
                className="px-3 py-1 rounded-lg bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ব্যাক</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
