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
  const [pokes, setPokes] = useState<PokeItem[]>([]);

  const [suggestedFriends, setSuggestedFriends] = useState<
    Array<{ id: string; name: string; avatar: string; relation: string; poked: boolean }>
  >([]);

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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-white border border-[#E4E6EB] rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-black">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E4E6EB] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow">
              <Hand className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-black">Pokes (পোক ফিচার)</h2>
              <p className="text-[11px] text-[#65676B]">বন্ধুদের পোক করুন ও পোক ব্যাক (Poke back) পাঠান</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-black transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {/* Active Pokes to Poke Back */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#65676B] uppercase tracking-wider">
                আপনাকে পোক করেছে ({pokes.filter((p) => !p.hasPokedBack).length})
              </h4>
              <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> লাইভ
              </span>
            </div>

            <div className="space-y-2.5">
              {pokes.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#E4E6EB] flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#E4E6EB] shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-black truncate">{item.name}</p>
                      <p className="text-[11px] text-[#65676B]">
                        {item.timeAgo} • মোট {item.pokesCount} বার পোক বিনিময়
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePokeBack(item.id, item.name)}
                    disabled={item.hasPokedBack}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                      item.hasPokedBack
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#0866FF] hover:bg-[#0055D4] text-white shadow active:scale-95'
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
            <h4 className="text-xs font-bold text-[#65676B] uppercase tracking-wider">
              কাউকে পোক করুন (Suggested Pokes)
            </h4>
            <div className="space-y-2.5">
              {suggestedFriends.map((sf) => (
                <div
                  key={sf.id}
                  className="p-3 rounded-xl bg-white border border-[#E4E6EB] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={sf.avatar}
                      alt={sf.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E4E6EB]"
                    />
                    <div>
                      <p className="font-bold text-xs text-black">{sf.name}</p>
                      <p className="text-[10px] text-[#65676B]">{sf.relation}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePokeSuggested(sf.id, sf.name)}
                    disabled={sf.poked}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      sf.poked
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black'
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
        <div className="p-3 border-t border-[#E4E6EB] bg-white text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black font-bold text-xs"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
