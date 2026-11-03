import React, { useState } from 'react';
import { X, Gift, Send, Heart, Calendar, Sparkles, Check } from 'lucide-react';

interface BirthdayUser {
  id: string;
  name: string;
  avatar: string;
  relation: string;
  age?: number;
  isToday: boolean;
  dateStr: string;
}

interface FbBirthdaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendWish?: (userName: string, wishText: string) => void;
}

export const FbBirthdaysModal: React.FC<FbBirthdaysModalProps> = ({
  isOpen,
  onClose,
  onSendWish,
}) => {
  const [sentWishes, setSentWishes] = useState<Record<string, boolean>>({});
  const [customWish, setCustomWish] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const birthdays: BirthdayUser[] = [
    {
      id: 'b1',
      name: 'হাসান মাহমুদ (Hasan Mahmud)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      relation: 'স্কুলের বন্ধু • ঢাকা',
      age: 26,
      isToday: true,
      dateStr: 'আজকের জন্মদিন',
    },
    {
      id: 'b2',
      name: 'তানভীর আহমেদ (Tanveer Ahmed)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      relation: 'সহকর্মী • সখীপুর',
      age: 29,
      isToday: true,
      dateStr: 'আজকের জন্মদিন',
    },
    {
      id: 'b3',
      name: 'মাওলানা কামরুল ইসলাম',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      relation: 'উস্তাদজী • ৫ জন কমন ফ্রেন্ড',
      isToday: false,
      dateStr: 'আগামীকাল, ৪ নভেম্বর',
    },
    {
      id: 'b4',
      name: 'সাদিয়া বিনতে রফিক',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      relation: 'আত্মীয় • চট্টগ্রাম',
      isToday: false,
      dateStr: 'বৃহস্পতিবার, ৬ নভেম্বর',
    },
  ];

  const defaultDua = "আল্লাহ তা'আলা আপনার হায়াতে, ঈমানে ও রিযিকে অফুরন্ত বরকত দান করুন। সর্বদা নেক পথে অবিচল রাখুন — শুভ জন্মদিন ভাই! 🤲✨";

  const handleSend = (user: BirthdayUser) => {
    const text = customWish[user.id] || defaultDua;
    setSentWishes((prev) => ({ ...prev, [user.id]: true }));
    if (onSendWish) {
      onSendWish(user.name, text);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Birthdays (জন্মদিন ও দোয়া)</h2>
              <p className="text-[11px] text-[#b0b3b8]">বন্ধুদের জন্মদিনে ইসলামিক মোবারকবাদ ও নেক দোয়া পাঠান</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Today's Birthdays Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/20 via-pink-500/10 to-[#242526] border border-rose-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">আজ ২ জনের জন্মদিন! 🎉</h3>
              <p className="text-xs text-[#b0b3b8]">তাদের টাইমলাইনে একটি দোয়াপূর্ণ শুভেচ্ছা পোস্ট করুন</p>
            </div>
          </div>

          {/* Today's List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#b0b3b8] uppercase tracking-wider">আজকের জন্মদিন (Today)</h4>
            {birthdays
              .filter((b) => b.isToday)
              .map((user) => {
                const isSent = sentWishes[user.id];
                return (
                  <div
                    key={user.id}
                    className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#393a3b]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-sm text-white truncate">{user.name}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            আজকের দিন
                          </span>
                        </div>
                        <p className="text-xs text-[#b0b3b8]">{user.relation}</p>
                      </div>
                    </div>

                    {/* Wish sender box */}
                    {isSent ? (
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>দোয়াপূর্ণ শুভেচ্ছা সফলভাবে তার টাইমলাইনে পাঠানো হয়েছে!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          defaultValue={defaultDua}
                          onChange={(e) =>
                            setCustomWish((prev) => ({ ...prev, [user.id]: e.target.value }))
                          }
                          className="w-full bg-[#242526] border border-[#393a3b] rounded-xl p-2.5 text-xs text-[#e4e6eb] focus:outline-none focus:border-[#1877F2] resize-none"
                        />
                        <button
                          onClick={() => handleSend(user)}
                          className="w-full py-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>শুভেচ্ছা ও দোয়া পাঠান</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Upcoming Birthdays */}
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-bold text-[#b0b3b8] uppercase tracking-wider">আসন্ন জন্মদিন (Upcoming)</h4>
            {birthdays
              .filter((b) => !b.isToday)
              .map((user) => (
                <div
                  key={user.id}
                  className="p-3 rounded-xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#393a3b]"
                    />
                    <div>
                      <h5 className="font-bold text-xs text-white">{user.name}</h5>
                      <p className="text-[11px] text-[#b0b3b8]">{user.dateStr}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#b0b3b8] bg-[#242526] px-2 py-1 rounded-lg border border-[#393a3b]">
                    আসছে
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#393a3b] bg-[#18191a] text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] font-bold text-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
