import React, { useState } from 'react';
import { ChevronLeft, ChevronDown, Check, X } from 'lucide-react';

interface RecentBirthdayPerson {
  id: string;
  name: string;
  avatar: string;
  dateLabel: string;
}

interface UpcomingBirthdayPerson {
  id: string;
  name: string;
  avatar: string;
  dateLabel: string;
}

interface FbBirthdaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAvatar?: string;
  userName?: string;
  onOpenMessenger?: () => void;
  onOpenProfile?: () => void;
  onSendWish?: (userName: string, wishText: string) => void;
}

const MessengerGlyph: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78c.02.57.61.94 1.13.71l1.98-.87c.17-.08.36-.1.55-.06.91.25 1.88.39 2.88.39 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm5.89 7.45-2.94 4.66c-.47.74-1.47.92-2.17.39l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.19-.68-.64l2.94-4.66c.47-.74 1.47-.92 2.17-.39l2.34 1.75c.21.16.51.16.72 0l3.16-2.4c.42-.32.97.19.68.64z" />
  </svg>
);

const RECENT_BIRTHDAYS: RecentBirthdayPerson[] = [];

const UPCOMING_BIRTHDAYS: UpcomingBirthdayPerson[] = [];

const BIRTHDAY_CARD_PRESETS = [
  { id: 'c1', title: 'Happy Birthday!', bg: 'bg-[#E7F3FF] text-[#1877F2]' },
  { id: 'c2', title: 'Wishing you joy & health!', bg: 'bg-[#FEF3C7] text-[#B45309]' },
  { id: 'c3', title: 'Many happy returns of the day!', bg: 'bg-[#ECFDF5] text-[#047857]' },
];

export const FbBirthdaysModal: React.FC<FbBirthdaysModalProps> = ({
  isOpen,
  onClose,
  userAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
  userName = 'Profile',
  onOpenMessenger,
  onOpenProfile,
  onSendWish,
}) => {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [postedIds, setPostedIds] = useState<Record<string, string>>({});
  const [cardTarget, setCardTarget] = useState<RecentBirthdayPerson | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  const handleWritePost = (person: RecentBirthdayPerson) => {
    const text = (drafts[person.id] || '').trim() || `Happy Birthday, ${person.name}!`;
    setPostedIds((prev) => ({ ...prev, [person.id]: text }));
    setDrafts((prev) => ({ ...prev, [person.id]: '' }));
    onSendWish?.(person.name, text);
    showToast(`Posted on ${person.name}'s timeline`);
  };

  const handleMessageClick = (name: string) => {
    if (onOpenMessenger) {
      onClose();
      onOpenMessenger();
    } else {
      showToast(`Opening Messenger chat with ${name}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white text-[#050505] overflow-y-auto font-sans">
      <div className="max-w-[700px] mx-auto min-h-screen bg-white pb-12">
        {/* 1. HEADER: Left "<" back arrow | Center "Birthdays" bold black | Right profile pic with dropdown */}
        <header className="sticky top-0 z-20 bg-white h-[54px] px-3 flex items-center justify-between border-b border-[#E4E6EB]">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 -ml-1 rounded-full hover:bg-[#F0F2F5] active:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Back"
            title="Back"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.2]" />
          </button>

          <h1 className="text-[19px] font-bold text-[#050505] tracking-tight">Birthdays</h1>

          <button
            type="button"
            onClick={() => {
              if (onOpenProfile) {
                onClose();
                onOpenProfile();
              }
            }}
            className="relative w-9 h-9 rounded-full shrink-0 cursor-pointer"
            aria-label={userName}
            title={userName}
          >
            <img
              src={userAvatar}
              alt={userName}
              className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB]"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-[#E4E6EB] flex items-center justify-center text-[#050505]">
              <ChevronDown className="w-3 h-3 stroke-[2.8]" />
            </span>
          </button>
        </header>

        {/* 2. SECTION: Recent */}
        <section className="px-4 pt-4 pb-5 bg-white">
          <h2 className="text-[20px] font-bold text-[#050505] text-left mb-4">Recent</h2>

          <div className="space-y-5">
            {RECENT_BIRTHDAYS.map((person) => {
              const postedText = postedIds[person.id];
              return (
                <div key={person.id} className="space-y-3 bg-white">
                  {/* Row 1: 50px avatar | Bold Name + 14px gray date | Messenger button */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        className="w-[50px] h-[50px] rounded-full object-cover shrink-0 bg-[#E4E6EB]"
                      />
                      <div className="min-w-0">
                        <p className="text-[16px] font-bold text-[#050505] leading-snug truncate">
                          {person.name}
                        </p>
                        <p className="text-[14px] text-[#65676B] leading-snug mt-0.5">
                          {person.dateLabel}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleMessageClick(person.name)}
                      className="w-11 h-9 rounded-[8px] bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      aria-label={`Message ${person.name}`}
                      title={`Message ${person.name}`}
                    >
                      <MessengerGlyph className="w-[18px] h-[18px]" />
                    </button>
                  </div>

                  {postedText ? (
                    <div className="px-4 py-2.5 rounded-[12px] bg-[#F0F2F5] text-[#050505] text-[14px] flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#1877F2] shrink-0" />
                      <span className="truncate">Shared: &ldquo;{postedText}&rdquo;</span>
                    </div>
                  ) : (
                    <>
                      {/* Row 2: Input box rounded 24px full width */}
                      <input
                        type="text"
                        value={drafts[person.id] || ''}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [person.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleWritePost(person);
                          }
                        }}
                        placeholder="Write a birthday post..."
                        className="w-full bg-[#F0F2F5] rounded-[24px] px-4 py-2.5 text-[15px] text-[#050505] placeholder-[#65676B] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                      />

                      {/* Row 3: Write post (blue) & Create card (light gray) */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleWritePost(person)}
                          className="py-2.5 px-3 rounded-[8px] bg-[#1877F2] hover:bg-[#166FE5] text-white text-[15px] font-semibold text-center transition-colors cursor-pointer"
                        >
                          Write post
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardTarget(person)}
                          className="py-2.5 px-3 rounded-[8px] bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] text-[15px] font-semibold text-center transition-colors cursor-pointer"
                        >
                          Create card
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Light Gray Divider */}
        <div className="h-[1px] bg-[#E4E6EB] mx-4" />

        {/* 3. SECTION: Upcoming */}
        <section className="px-4 pt-4 pb-6 bg-white">
          <h2 className="text-[20px] font-bold text-[#050505] text-left mb-4">Upcoming</h2>

          <div className="space-y-4">
            {UPCOMING_BIRTHDAYS.map((person) => (
              <div
                key={person.id}
                className="flex items-center justify-between gap-3 bg-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={person.avatar}
                    alt={person.name}
                    className="w-[50px] h-[50px] rounded-full object-cover shrink-0 bg-[#E4E6EB] border border-[#E4E6EB]"
                  />
                  <div className="min-w-0">
                    <p className="text-[16px] font-bold text-[#050505] leading-snug truncate">
                      {person.name}
                    </p>
                    <p className="text-[14px] text-[#65676B] leading-snug mt-0.5">
                      {person.dateLabel}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleMessageClick(person.name)}
                  className="w-11 h-9 rounded-[8px] bg-[#E4E6EB] hover:bg-[#D8DADF] text-[#050505] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  aria-label={`Message ${person.name}`}
                  title={`Message ${person.name}`}
                >
                  <MessengerGlyph className="w-[18px] h-[18px]" />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Create Birthday Card White Bottom Sheet */}
      {cardTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center"
          onClick={() => setCardTarget(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-[20px] p-4 space-y-3 text-[#050505]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#050505]">
                Choose a card for {cardTarget.name}
              </h3>
              <button
                type="button"
                onClick={() => setCardTarget(null)}
                className="w-8 h-8 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[#050505] cursor-pointer"
                aria-label="Close card picker"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {BIRTHDAY_CARD_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setPostedIds((prev) => ({ ...prev, [cardTarget.id]: preset.title }));
                    onSendWish?.(cardTarget.name, preset.title);
                    showToast(`Card sent to ${cardTarget.name}`);
                    setCardTarget(null);
                  }}
                  className={`w-full py-3.5 px-4 rounded-[12px] font-bold text-[15px] text-center transition-opacity hover:opacity-90 cursor-pointer ${preset.bg}`}
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtle Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#050505] text-white px-4 py-2 rounded-full text-xs font-semibold">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
