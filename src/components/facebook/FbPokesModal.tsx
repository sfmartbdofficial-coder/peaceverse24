import React, { useState } from 'react';
import { X, Hand, RefreshCw, Check, Sparkles, UserCheck, Flame } from 'lucide-react';

interface PokeItem {
  id: string;
  name: string;
  avatar: string;
  timeAgo: string;
  pokesCount: number;
  hasPokedBack?: boolean;
}

interface FbPokesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPokeTriggered?: (userName: string) => void;
}

export const FbPokesModal: React.FC<FbPokesModalProps> = ({
  isOpen,
  onClose,
  onPokeTriggered,
}) => {
  const [pokes, setPokes] = useState<PokeItem[]>([
    {
      id: 'p-1',
      name: 'সোহাগ রানা (Sohag Rana)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      timeAgo: '২ ঘণ্টা আগে',
      pokesCount: 7,
      hasPokedBack: false,
    },
    {
      id: 'p-2',
      name: 'মাহমুদুল হাসান',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      timeAgo: 'গতকাল',
      pokesCount: 3,
      hasPokedBack: false,
    },
    {
      id: 'p-3',
      name: 'আরিফ বিল্লাহ',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      timeAgo: '৩ দিন আগে',
      pokesCount: 12,
      hasPokedBack: true,
    },
  ]);

  const [suggestedFriends, setSuggestedFriends] = useState([
    {
      id: 'sf-1',
      name: 'আশরাফুল ইসলাম',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
      relation: '১০ জন মিউচুয়াল ফ্রেন্ড',
      poked: false,
    },
    {
      id: 'sf-2',
      name: 'ফারহান সাদিক',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
      relation: 'সখীপুর, টাঙ্গাইল',
      poked: false,
    },
  ]);

  if (!isOpen) return null;

  const handlePokeBack = (id: string, name: string) => {
    setPokes((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, hasPokedBack: true, pokesCount: p.pokesCount + 1 } : p
      )
    );
    if (onPokeTriggered) onPokeTriggered(name);
  };

  const handlePokeSuggested = (id: string, name: string) => {
    setSuggestedFriends((prev) =>
      prev.map((sf) => (sf.id === id ? { ...sf, poked: true } : sf))
    );
    if (onPokeTriggered) onPokeTriggered(name);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Pokes (পোক ফিচার)</h2>
              <p className="text-[11px] text-[#b0b3b8]">বন্ধুদের পোক করুন ও পোক ব্যাক (Poke back) পাঠান</p>
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
          {/* Active Pokes to Poke Back */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#b0b3b8] uppercase tracking-wider">
                আপনাকে পোক করেছে ({pokes.filter((p) => !p.hasPokedBack).length})
              </h4>
              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> লাইভ
              </span>
            </div>

            <div className="space-y-2.5">
              {pokes.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#393a3b] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-[#b0b3b8]">
                        {item.timeAgo} • মোট {item.pokesCount} বার পোক বিনিময়
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePokeBack(item.id, item.name)}
                    disabled={item.hasPokedBack}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      item.hasPokedBack
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow active:scale-95'
                    }`}
                  >
                    {item.hasPokedBack ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>পোকড</span>
                      </>
                    ) : (
                      <>
                        <Hand className="w-3.5 h-3.5" />
                        <span>Poke back</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Pokes */}
          <div className="space-y-2.5 pt-2">
            <h4 className="text-xs font-bold text-[#b0b3b8] uppercase tracking-wider">
              কাউকে পোক করুন (Suggested Pokes)
            </h4>
            <div className="space-y-2.5">
              {suggestedFriends.map((sf) => (
                <div
                  key={sf.id}
                  className="p-3 rounded-xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={sf.avatar}
                      alt={sf.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#393a3b]"
                    />
                    <div>
                      <p className="font-bold text-xs text-white">{sf.name}</p>
                      <p className="text-[10px] text-[#b0b3b8]">{sf.relation}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePokeSuggested(sf.id, sf.name)}
                    disabled={sf.poked}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      sf.poked
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb]'
                    }`}
                  >
                    {sf.poked ? 'পোক সম্পন্ন' : 'Poke'}
                  </button>
                </div>
              ))}
            </div>
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
