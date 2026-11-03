import React from 'react';
import { X, ShieldCheck, CheckCircle2, Heart, Lock, VolumeX, Sparkles, BookOpen } from 'lucide-react';

interface HalalGuaranteeModalProps {
  onClose: () => void;
}

export const HalalGuaranteeModal: React.FC<HalalGuaranteeModalProps> = ({ onClose }) => {
  const pillars = [
    {
      icon: <VolumeX className="w-5 h-5 text-emerald-400" />,
      title: 'বাদ্যযন্ত্রমুক্ত বিশুদ্ধ অডিও (No Haram Music)',
      desc: 'হারাম বাদ্যযন্ত্রমুক্ত কেবল বিশুদ্ধ মানবকণ্ঠের তিলাওয়াত, আযান ও ইসলামিক নাশিদ সম্প্রচারিত হয়।',
    },
    {
      icon: <Lock className="w-5 h-5 text-emerald-400" />,
      title: 'অশ্লীল বিজ্ঞাপন ও অ্যালগরিদম মুক্ত',
      desc: 'সাধারণ ভিডিও প্ল্যাটফর্মের মতো ক্ষতিকর ও অনাকাঙ্ক্ষিত কোনো বিজ্ঞাপন এখানে দেখানো হয় না। পরিবার ও শিশুদের জন্য ১০০% নিরাপদ।',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      title: 'কুরআন ও সহীহ সুন্নাহ ভিত্তিক তথ্য',
      desc: 'প্রতিটি আয়াত ও হাদিসের বিশুদ্ধ তথ্যসূত্র (রেফারেন্স) উল্লেখ থাকে, যাতে কোনো জাল বা অপ্রামাণ্য তথ্য না ছড়ায়।',
    },
    {
      icon: <Heart className="w-5 h-5 text-emerald-400" />,
      title: 'অন্তরের শান্তি ও আখিরাতের প্রস্তুতি (Qalby)',
      desc: 'কলবী (قلبي - আমার অন্তর)-র মূল লক্ষ্য হলো অনর্থক সময়ের অপচয় রোধ করে আত্মাকে আল্লাহর স্মরণে প্রশান্ত রাখা।',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#181818] w-full max-w-lg rounded-2xl border border-emerald-500/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-gradient-to-r from-emerald-950/80 to-[#121212] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Qalby ১০০% হালাল নীতি</span>
                <span className="text-xs font-arabic text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  حلال
                </span>
              </h2>
              <p className="text-xs text-neutral-300">
                ইউটিউবের বিকল্প একটি পূর্ণাঙ্গ ও নিরাপদ ইসলামিক প্ল্যাটফর্ম
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
          <div className="p-3.5 rounded-xl bg-black/40 border border-neutral-800 text-xs sm:text-sm text-neutral-200 leading-relaxed font-bengali">
            &quot;হে মানুষ! তোমরা জমিনের হালাল ও পবিত্র বস্তু আহার কর এবং শয়তানের পদাঙ্ক অনুসরণ করো না।&quot; — সূরা আল-বাক্বারাহ [২:১৬৮]
          </div>

          <div className="space-y-3">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex-shrink-0 mt-0.5">
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-neutral-100">{p.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1 font-bengali leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-950/50"
          >
            আলহামদুলিল্লাহ, বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
