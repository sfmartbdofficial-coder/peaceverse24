import React from 'react';
import { X, Video, MessageCircle, Instagram, Send, ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

export type AlsoAppType = 'edits' | 'threads' | 'instagram' | 'messenger' | 'whatsapp' | null;

interface FbAlsoFromPeaceModalProps {
  appType: AlsoAppType;
  onClose: () => void;
}

export const FbAlsoFromPeaceModal: React.FC<FbAlsoFromPeaceModalProps> = ({ appType, onClose }) => {
  if (!appType) return null;

  const appDetails: Record<
    string,
    { title: string; subtitle: string; icon: any; iconBg: string; desc: string; features: string[] }
  > = {
    edits: {
      title: 'Peace Edits (ভিডিও ও রিল এডিটর)',
      subtitle: 'ইসলামিক তিলাওয়াত ও হালাল রিল বানানোর স্টুডিও',
      icon: Video,
      iconBg: 'bg-gradient-to-tr from-pink-500 to-rose-500',
      desc: 'বাদ্যযন্ত্রহীন ইসলামিক নাশিদ, আরবি ক্যালিগ্রাফি সাবটাইটেল এবং ৪K এক্সপোর্ট সুবিধা সহ সম্পূর্ণ হালাল ভিডিও এডিটর।',
      features: ['অটো-আরবি সাবটাইটেল', '১০০% হালাল নাশিদ লাইব্রেরি', '৯:১৬ রিলস এক্সপোর্ট', 'নো-ওয়াটারমার্ক'],
    },
    threads: {
      title: 'Peace Threads (থ্রেডস)',
      subtitle: 'সংক্ষিপ্ত মতামত ও দ্বীনি উক্তি প্রকাশের প্ল্যাটফর্ম',
      icon: MessageCircle,
      iconBg: 'bg-neutral-900 border border-neutral-700',
      desc: 'সংক্ষিপ্ত হাদিস, দ্বীনি পরামর্শ এবং চিন্তা-ভাবনা ৫০০০ ক্যারেক্টারে দ্রুত প্রকাশ করুন।',
      features: ['ঝটপট টেক্সট থ্রেড', 'হাদিসের রেফারেন্স ট্যাগ', 'উম্মাহর সুস্থ আলোচনা', 'নো স্প্যাম পলিসি'],
    },
    instagram: {
      title: 'Peace Gram (পিস গ্রাম)',
      subtitle: 'ফটোগ্রাফি ও হালাল ভিজ্যুয়াল স্টোরিজ',
      icon: Instagram,
      iconBg: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
      desc: 'প্রকৃতির অপার সৌন্দর্য, ইসলামিক ক্যালিগ্রাফি এবং লাইফস্টাইল ছবি নিরাপদে শেয়ার করার প্ল্যাটফর্ম।',
      features: ['হালাল ভিজ্যুয়াল ফিল্টার', '২৪ ঘণ্টার স্টোরিজ', 'ফটো ক্যারোসেল', 'পর্দা ও মার্জিত নীতি'],
    },
    messenger: {
      title: 'Peace Messenger (মেসেঞ্জার)',
      subtitle: 'দ্রুত ও নিরবচ্ছিন্ন ব্যক্তিগত চ্যাট',
      icon: MessageCircle,
      iconBg: 'bg-gradient-to-tr from-[#1877F2] to-cyan-400',
      desc: 'বন্ধু এবং পরিবারের সাথে দ্রুত বার্তা, ভয়েস নোট এবং কুরআন তিলাওয়াত অডিও শেয়ার করুন।',
      features: ['লাইভ মেসেজিং', 'ভয়েস অডিও নোটস', 'ইসলামিক রিঅ্যাকশন', 'গ্রুপ চ্যাট'],
    },
    whatsapp: {
      title: 'Peace WhatsApp (পিস চ্যাট)',
      subtitle: 'এন্ড-টু-এন্ড এনক্রিপ্টেড প্রাইভেট মেসেজিং',
      icon: Send,
      iconBg: 'bg-emerald-600',
      desc: 'সম্পূর্ণ গোপনীয়তার সাথে পরিবারের সাথে সংযুক্ত থাকুন। আপনার কোনো মেসেজ অন্য কেউ পড়তে পারবে না।',
      features: ['এন্ড-টু-এন্ড এনক্রিপশন', 'এইচডি অডিও ও ভিডিও কল', 'ডকুমেন্ট ও ফাইল শেয়ার', 'স্ট্যাটাস আপডেট'],
    },
  };

  const current = appDetails[appType] || appDetails['edits'];
  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl ${current.iconBg} flex items-center justify-center text-white shadow`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">{current.title}</h2>
              <p className="text-[11px] text-[#b0b3b8]">{current.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <p className="text-xs text-[#b0b3b8] leading-relaxed">{current.desc}</p>

          <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1877F2]" />
              <span>মূল সুবিধাসমূহ</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {current.features.map((f, i) => (
                <div key={i} className="p-2 rounded-xl bg-[#242526] text-xs font-medium text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-[11px] text-blue-300">
            Peace World ইকোসিস্টেমের অধীনে সবগুলো অ্যাপ একই সিঙ্গেল আইডি (Sharif Hasan) দ্বারা সংযুক্ত।
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#393a3b] bg-[#18191a] flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow flex items-center justify-center gap-1.5"
          >
            <span>অ্যাপে প্রবেশ করুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
