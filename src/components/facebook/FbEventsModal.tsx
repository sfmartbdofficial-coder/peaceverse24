import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Plus, Check, Share2, Sparkles } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  dateStr: string;
  timeStr: string;
  location: string;
  banner: string;
  host: string;
  goingCount: number;
  interestedCount: number;
  category: string;
  userRsvp?: 'going' | 'interested' | null;
}

interface FbEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FbEventsModal: React.FC<FbEventsModalProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: 'ev-1',
      title: 'সখীপুর কেন্দ্রীয় জামে মসজিদে আন্তর্জাতিক কিরাত ও তিলাওয়াত সম্মেলন ২০২৬',
      dateStr: 'শুক্রবার, ৭ নভেম্বর ২০২৬',
      timeStr: 'বাদ মাগরিব - রাত ১০:৩০',
      location: 'সখীপুর কেন্দ্রীয় জামে মসজিদ, টাঙ্গাইল',
      banner: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      host: 'কুরআন রিসার্চ ফাউন্ডেশন',
      goingCount: 420,
      interestedCount: 890,
      category: 'Islamic Gathering',
      userRsvp: 'going',
    },
    {
      id: 'ev-2',
      title: 'দরিদ্র ও এতিম শিশুদের মাঝে শীতবস্ত্র ও খাদ্য সামগ্রী বিতরণ কর্মসূচি',
      dateStr: 'রবিবার, ৯ নভেম্বর ২০২৬',
      timeStr: 'সকাল ৯:০০ - দুপুর ২:০০',
      location: 'বায়তুল মোকাররম দক্ষিণ গেট, ঢাকা',
      banner: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80',
      host: 'Peace World চ্যারিটি ফান্ড',
      goingCount: 154,
      interestedCount: 310,
      category: 'Charity Drive',
      userRsvp: null,
    },
    {
      id: 'ev-3',
      title: 'অনলাইন আন্তর্জাতিক ইসলামিক ওয়েবিনার: তথ্যপ্রযুক্তিতে হালাল ক্যারিয়ার ও ফ্রিল্যান্সিং',
      dateStr: 'বুধবার, ১২ নভেম্বর ২০২৬',
      timeStr: 'রাত ৮:৩০ - রাত ১০:০০',
      location: 'Peace World Live Stream',
      banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
      host: 'Islamic IT Network',
      goingCount: 890,
      interestedCount: 2450,
      category: 'Tech & Career',
      userRsvp: 'interested',
    },
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'going' | 'create'>('all');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggleRsvp = (id: string, type: 'going' | 'interested') => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const current = e.userRsvp;
        if (current === type) {
          return {
            ...e,
            userRsvp: null,
            goingCount: type === 'going' ? e.goingCount - 1 : e.goingCount,
            interestedCount: type === 'interested' ? e.interestedCount - 1 : e.interestedCount,
          };
        }
        return {
          ...e,
          userRsvp: type,
          goingCount: type === 'going' ? e.goingCount + 1 : current === 'going' ? e.goingCount - 1 : e.goingCount,
          interestedCount:
            type === 'interested' ? e.interestedCount + 1 : current === 'interested' ? e.interestedCount - 1 : e.interestedCount,
        };
      })
    );
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const created: EventItem = {
      id: `ev-${Date.now()}`,
      title: newEventTitle,
      dateStr: newEventDate || 'আসন্ন শুক্রবার',
      timeStr: 'সন্ধ্যা ৭:০০',
      location: newEventLocation || 'সখীপুর, টাঙ্গাইল',
      banner: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=600&q=80',
      host: 'Sharif Hasan',
      goingCount: 1,
      interestedCount: 3,
      category: 'Community',
      userRsvp: 'going',
    };

    setEvents([created, ...events]);
    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setActiveTab('all');
      setNewEventTitle('');
      setNewEventDate('');
      setNewEventLocation('');
    }, 1000);
  };

  const filtered =
    activeTab === 'going'
      ? events.filter((e) => e.userRsvp === 'going' || e.userRsvp === 'interested')
      : events;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white shadow">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Events (ইভেন্টস)</h2>
              <p className="text-[11px] text-[#b0b3b8]">ইসলামিক মাহফিল, সম্মেলন ও সামাজিক সেবামূলক ইভেন্ট</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#393a3b] bg-[#18191a]">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            সব ইভেন্ট
          </button>
          <button
            onClick={() => setActiveTab('going')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors ${
              activeTab === 'going'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            আমার অংশগ্রহণ ({events.filter((e) => e.userRsvp).length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 text-xs font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'create'
                ? 'border-[#1877F2] text-[#1877F2]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন ইভেন্ট</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-[#b0b3b8] block mb-1">ইভেন্টের নাম (Title) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সখীপুর হাফেজিয়া মাদ্রাসায় আন্তর্জাতিক কেরাত মাহফিল"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-[#b0b3b8] block mb-1">তারিখ (Date)</label>
                  <input
                    type="text"
                    placeholder="শুক্রবার, ২০ নভেম্বর"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#b0b3b8] block mb-1">স্থান (Location)</label>
                  <input
                    type="text"
                    placeholder="সখীপুর, টাঙ্গাইল"
                    value={newEventLocation}
                    onChange={(e) => setNewEventLocation(e.target.value)}
                    className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#1877F2]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createSuccess}
                className="w-full py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all"
              >
                {createSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>ইভেন্ট তৈরি সম্পন্ন!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>ইভেন্ট প্রকাশ করুন</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#18191a] border border-[#393a3b] overflow-hidden shadow-sm space-y-3"
                >
                  <div className="relative h-36 w-full">
                    <img src={item.banner} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                      {item.category}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <h3 className="font-bold text-sm text-white leading-snug">{item.title}</h3>
                    
                    <div className="flex flex-col gap-1 text-xs text-[#b0b3b8]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#1877F2] shrink-0" />
                        <span>{item.dateStr} • {item.timeStr}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{item.goingCount} জন উপস্থিত থাকবেন • {item.interestedCount} জন আগ্রহী</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#393a3b]">
                      <button
                        onClick={() => handleToggleRsvp(item.id, 'going')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          item.userRsvp === 'going'
                            ? 'bg-[#1877F2] text-white shadow'
                            : 'bg-[#242526] hover:bg-[#3a3b3c] text-[#e4e6eb] border border-[#393a3b]'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>উপস্থিত থাকব (Going)</span>
                      </button>
                      <button
                        onClick={() => handleToggleRsvp(item.id, 'interested')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          item.userRsvp === 'interested'
                            ? 'bg-amber-600 text-white shadow'
                            : 'bg-[#242526] hover:bg-[#3a3b3c] text-[#e4e6eb] border border-[#393a3b]'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>আগ্রহী (Interested)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
