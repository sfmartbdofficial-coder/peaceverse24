import React from 'react';
import { X, ShieldCheck, CheckCircle2, Heart, Lock, VolumeX, Sparkles, BookOpen } from 'lucide-react';

interface HalalGuaranteeModalProps {
  onClose: () => void;
}

export const HalalGuaranteeModal: React.FC<HalalGuaranteeModalProps> = ({ onClose }) => {
  const pillars = [
    {
      icon: <VolumeX className="w-5 h-5 text-emerald-600" />,
      title: 'বাদ্যযন্ত্রমুক্ত বিশুদ্ধ অডিও (No Haram Music)',
      desc: 'হারাম বাদ্যযন্ত্রমুক্ত কেবল বিশুদ্ধ মানবকণ্ঠের তিলাওয়াত, আযান ও ইসলামিক নাশিদ সম্প্রচারিত হয়।',
    },
    {
      icon: <Lock className="w-5 h-5 text-emerald-600" />,
      title: 'অশ্লীল বিজ্ঞাপন ও অ্যালগরিদম মুক্ত',
      desc: 'সাধারণ ভিডিও প্ল্যাটফর্মের মতো ক্ষতিকর ও অনাকাঙ্ক্ষিত কোনো বিজ্ঞাপন এখানে দেখানো হয় না। পরিবার ও শিশুদের জন্য ১০০% নিরাপদ।',
    },
    {
      icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
      title: 'কুরআন ও সহীহ সুন্নাহ ভিত্তিক তথ্য',
      desc: 'প্রতিটি আয়াত ও হাদিসের বিশুদ্ধ তথ্যসূত্র (রেফারেন্স) উল্লেখ থাকে, যাতে কোনো জাল বা অপ্রামাণ্য তথ্য না ছড়ায়।',
    },
    {
      icon: <Heart className="w-5 h-5 text-emerald-600" />,
      title: 'অন্তরের শান্তি ও আখিরাতের প্রস্তুতি (Peaceverse24.com)',
      desc: 'Peaceverse24.com-এর মূল লক্ষ্য হলো অনর্থক সময়ের অপচয় রোধ করে আত্মাকে আল্লাহর স্মরণে প্রশান্ত রাখা।',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white text-black w-full max-w-lg rounded-2xl border border-[#E4E6EB] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-[#E4E6EB] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-black flex items-center gap-2">
                <span>Peaceverse24.com ১০০% হালাল নীতি</span>
                <span className="text-xs font-arabic text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  حلال
                </span>
              </h2>
              <p className="text-xs text-[#65676B]">
                একটি পূর্ণাঙ্গ ও নিরাপদ ইসলামিক প্ল্যাটফর্ম
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#65676B] hover:text-black hover:bg-[#F0F2F5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar bg-white">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-black leading-relaxed font-bengali">
            &quot;হে মানুষ! তোমরা জমিনের হালাল ও পবিত্র বস্তু আহার কর এবং শয়তানের পদাঙ্ক অনুসরণ করো না।&quot; — সূরা আল-বাক্বারাহ [২:১৬৮]
          </div>

          <div className="space-y-3">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white border border-[#E4E6EB] flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex-shrink-0 mt-0.5">
                  {p.icon}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-black">{p.title}</h3>
                  <p className="text-xs text-[#65676B] mt-1 font-bengali leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#0866FF] hover:bg-[#166fe5] text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
          >
            আলহামদুলিল্লাহ, বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
