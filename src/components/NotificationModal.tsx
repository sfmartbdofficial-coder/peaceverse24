import React from 'react';
import { X, Bell, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

interface NotificationModalProps {
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ onClose }) => {
  const prayerTimes = [
    { name: 'ফজর (Fajr)', time: '০৪:৫২ AM', current: false },
    { name: 'যোহর (Dhuhr)', time: '১১:৫৮ AM', current: false },
    { name: 'আসর (Asr)', time: '০৩:৪৮ PM', current: true },
    { name: 'মাগরিব (Maghrib)', time: '০৫:৩৫ PM', current: false },
    { name: 'ইশা (Isha)', time: '০৬:৪৯ PM', current: false },
  ];

  const reminders = [
    {
      title: 'Mishary Alafasy নতুন তিলাওয়াত আপলোড করেছেন',
      desc: 'সূরা আর-রহমান পূর্ণাঙ্গ তিলাওয়াত এখন Qalby প্ল্যাটফর্মে উপলভ্য।',
      time: '১৫ মিনিট আগে',
      channel: 'Mishary Rashid',
      unread: true,
    },
    {
      title: 'মক্কা লাইভ ২৪/৭ সরাসরি সম্প্রচার চালু আছে',
      desc: 'মসজিদুল হারাম কাবা শরীফের আসর নামাজ সরাসরি প্রত্যক্ষ করুন।',
      time: '১ ঘণ্টা আগে',
      channel: 'Haramain Live',
      unread: true,
    },
    {
      title: 'সকাল-সন্ধ্যার জিকির ও সাইয়েদুল ইস্তেগফার',
      desc: 'আসরের পর মাগরিবের পূর্ববর্তী মাসনূন জিকির আদায় করুন।',
      time: '২ ঘণ্টা আগে',
      channel: 'Qalby Daily',
      unread: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#181818] w-full max-w-md rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-[#121212]">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
            <Bell className="w-4 h-4" />
            <span>Qalby নোটিফিকেশন ও ওয়াক্ত</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar">
          {/* Prayer Times Card */}
          <div className="bg-neutral-900 p-3.5 rounded-xl border border-neutral-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300 mb-2.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>আজকের আনুমানিক নামাজের সময়সূচি</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {prayerTimes.map((p) => (
                <div
                  key={p.name}
                  className={`p-2 rounded-lg border text-xs ${
                    p.current
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-bold ring-1 ring-emerald-400'
                      : 'bg-black/40 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <p className="text-[10px] text-neutral-400 truncate">{p.name.split(' ')[0]}</p>
                  <p className="text-[11px] font-mono mt-0.5">{p.time.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Reminders List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-neutral-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>সাম্প্রতিক আপডেট</span>
              </h4>
              <span className="text-[10px] text-neutral-500">সব রিড মার্ক করুন</span>
            </div>

            {reminders.map((r, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  r.unread ? 'bg-neutral-900/90 border-emerald-500/30' : 'bg-neutral-900/40 border-neutral-800/80'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    r.unread ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-600'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-200">{r.title}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 font-bengali leading-relaxed">{r.desc}</p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-neutral-500">
                    <span>{r.channel}</span>
                    <span>{r.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
