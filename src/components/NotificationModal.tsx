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
      desc: 'সূরা আর-রহমান পূর্ণাঙ্গ তিলাওয়াত এখন Peaceverse24.com প্ল্যাটফর্মে উপলভ্য।',
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
      channel: 'Peaceverse24.com Daily',
      unread: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white text-black w-full max-w-md rounded-2xl border border-[#E4E6EB] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E4E6EB] bg-white">
          <div className="flex items-center gap-2 text-[#0866FF] font-bold text-sm sm:text-base">
            <Bell className="w-4 h-4" />
            <span>Peaceverse24.com নোটিফিকেশন ও ওয়াক্ত</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#65676B] hover:text-black hover:bg-[#F0F2F5] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar bg-white">
          {/* Prayer Times Card */}
          <div className="bg-white p-3.5 rounded-xl border border-[#E4E6EB]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-black mb-2.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>আজকের আনুমানিক নামাজের সময়সূচি</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {prayerTimes.map((p) => (
                <div
                  key={p.name}
                  className={`p-2 rounded-lg border text-xs ${
                    p.current
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : 'bg-[#F0F2F5] border-[#E4E6EB] text-black'
                  }`}
                >
                  <p className="text-[10px] text-[#65676B] truncate">{p.name.split(' ')[0]}</p>
                  <p className="text-[11px] font-mono mt-0.5">{p.time.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Reminders List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-black flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>সাম্প্রতিক আপডেট</span>
              </h4>
              <span className="text-[10px] text-[#65676B]">সব রিড মার্ক করুন</span>
            </div>

            {reminders.map((r, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  r.unread ? 'bg-[#E7F3FF]/50 border-[#0866FF]/20' : 'bg-white border-[#E4E6EB]'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    r.unread ? 'bg-[#0866FF]' : 'bg-[#CCD0D5]'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-black">{r.title}</span>
                  </div>
                  <p className="text-xs text-[#65676B] mt-1 font-bengali leading-relaxed">{r.desc}</p>
                  <div className="flex items-center justify-between mt-1 text-[10px] text-[#65676B]">
                    <span>{r.channel}</span>
                    <span>{r.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#166fe5] text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            বুঝেছি (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
