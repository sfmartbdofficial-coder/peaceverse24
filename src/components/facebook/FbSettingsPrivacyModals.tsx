import React, { useState } from 'react';
import {
  X,
  Settings,
  Shield,
  Clock,
  Smartphone,
  Tag,
  CreditCard,
  Link,
  Moon,
  Sun,
  Globe,
  Sparkles,
  Check,
  Lock,
  Eye,
  Bell,
  Trash2,
  Sliders,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
} from 'lucide-react';

export type SettingsModalType =
  | 'settings'
  | 'privacy_center'
  | 'time_management'
  | 'device_requests'
  | 'ad_activity'
  | 'orders_payments'
  | 'link_history'
  | 'dark_mode'
  | 'app_icon'
  | 'public_presence'
  | 'peace_plus'
  | null;

interface FbSettingsPrivacyModalsProps {
  modalType: SettingsModalType;
  onClose: () => void;
  onSavePrivacyDefault?: (privacy: 'public' | 'friends' | 'private') => void;
  onToggleDarkMode?: (isDark: boolean) => void;
  onLanguageToggle?: () => void;
}

export const FbSettingsPrivacyModals: React.FC<FbSettingsPrivacyModalsProps> = ({
  modalType,
  onClose,
  onSavePrivacyDefault,
  onToggleDarkMode,
  onLanguageToggle,
}) => {
  // Privacy Center State
  const [defaultAudience, setDefaultAudience] = useState<'public' | 'friends' | 'private'>('public');
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const [friendRequestAudience, setFriendRequestAudience] = useState<'everyone' | 'friends_of_friends'>('everyone');

  // Time Management State
  const [dailyReminderMins, setDailyReminderMins] = useState(45);
  const [quietModeSalah, setQuietModeSalah] = useState(true);

  // Device Requests
  const [devices, setDevices] = useState([
    { id: 'dev-1', device: 'Xiaomi Redmi Note (com.facebook.katana)', location: 'Dhaka, Bangladesh', isCurrent: true, time: 'সক্রিয় এখন' },
    { id: 'dev-2', device: 'Chrome Browser (Windows 11)', location: 'Tangail, Bangladesh', isCurrent: false, time: '৩ ঘণ্টা আগে' },
  ]);
  const [loggedOutAll, setLoggedOutAll] = useState(false);

  // Link History
  const [links, setLinks] = useState([
    { id: 'l1', title: 'কুরআন তিলাওয়াত লাইভ আর্কাইভ', url: 'https://quran.peace-world.org', time: 'গতকাল' },
    { id: 'l2', title: 'সখীপুর মার্কেটপ্লেস অর্গানিক মধু পেজ', url: 'https://mart.peace-world.org/honey', time: '৩ দিন আগে' },
  ]);

  // Dark Mode State
  const [isDark, setIsDark] = useState(true);

  // App Icon State
  const [selectedIcon, setSelectedIcon] = useState('classic');

  // Professional Mode State
  const [isProModeActive, setIsProModeActive] = useState(true);

  // Peace Plus State
  const [isPlusSubscribed, setIsPlusSubscribed] = useState(false);

  if (!modalType) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        {/* ======================================================== */}
        {/* 1. SETTINGS */}
        {/* ======================================================== */}
        {modalType === 'settings' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center text-white">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Settings (সেটিংস)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">অ্যাকাউন্ট ও ব্যক্তিগত তথ্যাদি</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
                <h4 className="font-bold text-sm text-white">ব্যক্তিগত ও অ্যাকাউন্ট তথ্য</h4>
                <p className="text-xs text-[#b0b3b8]">নাম: Sharif Hasan</p>
                <p className="text-xs text-[#b0b3b8]">ইমেইল: masterlive251@gmail.com</p>
                <p className="text-xs text-[#b0b3b8]">মোবাইল: +880 17XX-XXXXXX (ভেরিফাইড)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
                <h4 className="font-bold text-sm text-white">পাসওয়ার্ড ও নিরাপত্তা</h4>
                <p className="text-xs text-[#b0b3b8]">টু-ফ্যাক্টর অথেনটিকেশন (2FA): <span className="text-emerald-400 font-bold">চালু আছে</span></p>
                <p className="text-xs text-[#b0b3b8]">সর্বশেষ পাসওয়ার্ড পরিবর্তন: ১ মাস আগে</p>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 2. PRIVACY CENTER */}
        {/* ======================================================== */}
        {modalType === 'privacy_center' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Privacy Center (প্রাইভেসি সেন্টার)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">কে আপনার পোস্ট এবং প্রোফাইল দেখতে পাবে তা নির্ধারণ করুন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Default Audience */}
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2.5">
                <h4 className="font-bold text-xs text-[#b0b3b8] uppercase tracking-wider">
                  ভবিষ্যতের পোস্ট কে দেখতে পাবে? (Default Audience)
                </h4>
                <div className="space-y-2">
                  {[
                    { id: 'public', label: 'পাবলিক (Public)', desc: 'Peace World-এর সবাই আপনার পোস্ট দেখতে পাবে' },
                    { id: 'friends', label: 'বন্ধুরা (Friends)', desc: 'শুধুমাত্র আপনার ফ্রেন্ডলিস্টের ব্যক্তিরা দেখতে পাবে' },
                    { id: 'private', label: 'শুধুমাত্র আমি (Only Me)', desc: 'আপনার পোস্ট গোপন থাকবে' },
                  ].map((aud) => (
                    <label
                      key={aud.id}
                      onClick={() => {
                        setDefaultAudience(aud.id as any);
                        onSavePrivacyDefault?.(aud.id as any);
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                        defaultAudience === aud.id
                          ? 'bg-[#1877F2]/15 border-[#1877F2] text-white'
                          : 'bg-[#242526] border-[#393a3b] text-[#b0b3b8]'
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs text-white">{aud.label}</p>
                        <p className="text-[10px] text-[#8a8d91]">{aud.desc}</p>
                      </div>
                      <input
                        type="radio"
                        checked={defaultAudience === aud.id}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#1877F2]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Profile Lock */}
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">প্রোফাইল লক (Profile Lock)</h4>
                  <p className="text-xs text-[#b0b3b8]">অপরিচিত কেউ আপনার পূর্ণ ছবি ও পোস্ট দেখতে পারবে না</p>
                </div>
                <button
                  onClick={() => setIsProfileLocked(!isProfileLocked)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    isProfileLocked ? 'bg-emerald-600 text-white' : 'bg-[#3a3b3c] text-[#b0b3b8]'
                  }`}
                >
                  {isProfileLocked ? 'লকড আছে' : 'আনলকড'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 3. TIME MANAGEMENT */}
        {/* ======================================================== */}
        {modalType === 'time_management' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Time Management (সময় ব্যবস্থাপনা)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">দৈনিক ব্যবহারের হিসাব ও নামাজের সময় নীরবতা</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Daily Stats Bar */}
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#b0b3b8] uppercase">গড় দৈনিক সময় (Daily Screen Time)</h4>
                  <span className="text-xs font-black text-emerald-400">২৮ মিনিট / দিন</span>
                </div>
                <div className="flex items-end justify-between h-20 pt-2 px-2 border-b border-[#393a3b]">
                  {['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'].map((d, i) => {
                    const heights = ['h-10', 'h-14', 'h-8', 'h-16', 'h-12', 'h-14', 'h-6'];
                    return (
                      <div key={d} className="flex flex-col items-center gap-1">
                        <div className={`w-6 bg-[#1877F2] rounded-t-md ${heights[i]}`} />
                        <span className="text-[9px] text-[#8a8d91]">{d}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quiet Mode during Salah */}
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">নামাজের ওয়াক্তে কুয়েট মোড (Quiet Mode)</h4>
                  <p className="text-xs text-[#b0b3b8]">৫ ওয়াক্ত নামাজের সময় নোটিফিকেশন স্বয়ংক্রিয়ভাবে নীরব থাকবে</p>
                </div>
                <button
                  onClick={() => setQuietModeSalah(!quietModeSalah)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    quietModeSalah ? 'bg-emerald-600 text-white' : 'bg-[#3a3b3c] text-[#b0b3b8]'
                  }`}
                >
                  {quietModeSalah ? 'সক্রিয়' : 'বন্ধ'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 4. DEVICE REQUESTS & SESSIONS */}
        {/* ======================================================== */}
        {modalType === 'device_requests' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Device Requests (ডিভাইস সেশন)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">আপনার অ্যাকাউন্টে লগইন থাকা ডিভাইসসমূহ</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {devices.map((d) => (
                <div key={d.id} className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs text-white flex items-center gap-1.5">
                      <span>{d.device}</span>
                      {d.isCurrent && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-bold">
                          বর্তমান ডিভাইস
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-[#b0b3b8]">{d.location} • {d.time}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => {
                  setDevices(devices.slice(0, 1));
                  setLoggedOutAll(true);
                }}
                className="w-full mt-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors"
              >
                {loggedOutAll ? 'অন্যান্য সব ডিভাইস থেকে লগআউট সম্পন্ন' : 'অন্যান্য সব ডিভাইস থেকে লগআউট করুন'}
              </button>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 5. YOUR AD ACTIVITY */}
        {/* ======================================================== */}
        {modalType === 'ad_activity' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Your Ad Activity (বিজ্ঞাপন অ্যাক্টিভিটি)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">আপনার দেখা হালাল স্পন্সর বিজ্ঞাপনসমূহ</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold">১০০% ভেরিফাইড হালাল স্পন্সর</span>
                <h4 className="font-bold text-xs text-white">সখীপুর খাঁটি সুন্দরবনের মধু ও পাহাড়ি সরিষার তেল</h4>
                <p className="text-[11px] text-[#b0b3b8]">স্পন্সর: SF MART BD • ৩ ঘণ্টা আগে দেখা হয়েছে</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-1">
                <span className="text-[10px] text-emerald-400 font-bold">ইসলামিক বই</span>
                <h4 className="font-bold text-xs text-white">সহীহ হাদিসের আলোকে জীবনের শ্রেষ্ঠ দোয়াসমূহ</h4>
                <p className="text-[11px] text-[#b0b3b8]">স্পন্সর: মাকতাবাতুল আশরাফ • গতকাল</p>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 6. ORDERS AND PAYMENTS */}
        {/* ======================================================== */}
        {modalType === 'orders_payments' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Orders & Payments (অর্ডার ও পেমেন্ট)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">মার্কেটপ্লেস অর্ডার ও পেমেন্ট হিস্ট্রি</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">অর্ডার #PW-9821</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                    ডেলিভারি সম্পন্ন
                  </span>
                </div>
                <p className="text-xs text-[#b0b3b8]">প্রাকৃতিক কাঠের তসবিহ ও জায়নামাজ সেট (১ পিস)</p>
                <p className="text-xs font-bold text-emerald-400">মোট মূল্য: ৮৫০ ৳ (ক্যাশ অন ডেলিভারি)</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
                <h4 className="font-bold text-xs text-[#b0b3b8] uppercase">সংযুক্ত পেমেন্ট মেথড</h4>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-pink-600 text-white text-xs font-bold">bKash (বিকাশ)</span>
                  <span className="px-3 py-1 rounded-xl bg-orange-600 text-white text-xs font-bold">Nagad (নগদ)</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 7. LINK HISTORY */}
        {/* ======================================================== */}
        {modalType === 'link_history' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Link History (লিংক হিস্ট্রি)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">আপনার ভিজিট করা সকল লিংকের তালিকা</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {links.length > 0 ? (
                <>
                  {links.map((l) => (
                    <div key={l.id} className="p-3 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-1">
                      <p className="font-bold text-xs text-white">{l.title}</p>
                      <p className="text-[11px] text-[#1877F2] truncate">{l.url}</p>
                      <p className="text-[10px] text-[#8a8d91]">{l.time}</p>
                    </div>
                  ))}
                  <button
                    onClick={() => setLinks([])}
                    className="w-full py-2.5 rounded-xl bg-[#3a3b3c] hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>সকল লিংক হিস্ট্রি মুছে ফেলুন (Clear History)</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-8 text-xs text-[#b0b3b8]">কোনো সংরক্ষিত লিংক নেই।</div>
              )}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 8. DARK MODE TOGGLE */}
        {/* ======================================================== */}
        {modalType === 'dark_mode' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Dark Mode (ডার্ক মোড)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">ডিসপ্লের থিম পরিবর্তন করুন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { id: 'dark', label: 'Dark mode (ডার্ক মোড)', desc: 'চোখের জন্য আরামদায়ক ও ব্যাটারি সাশ্রয়ী', isD: true },
                { id: 'light', label: 'Light mode (লাইট মোড)', desc: 'উজ্জ্বল ব্যাকগ্রাউন্ড', isD: false },
              ].map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => {
                    setIsDark(theme.isD);
                    onToggleDarkMode?.(theme.isD);
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                    isDark === theme.isD
                      ? 'bg-[#1877F2]/15 border-[#1877F2] text-white'
                      : 'bg-[#18191a] border-[#393a3b] text-[#b0b3b8]'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs text-white">{theme.label}</p>
                    <p className="text-[10px] text-[#8a8d91]">{theme.desc}</p>
                  </div>
                  <input type="radio" checked={isDark === theme.isD} onChange={() => {}} className="w-4 h-4 text-[#1877F2]" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 9. APP ICON PICKER */}
        {/* ======================================================== */}
        {modalType === 'app_icon' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">App Icon (অ্যাপ আইকন)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">আপনার পছন্দের হোম-স্ক্রিন আইকন বেছে নিন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { id: 'classic', label: 'Classic Blue (ক্লাসিক সোশ্যাল)', bg: 'bg-[#1877F2]' },
                { id: 'emerald', label: 'Halal Emerald (ইসলামিক সবুজ)', bg: 'bg-emerald-600' },
                { id: 'gold', label: 'Kaaba Golden (স্বর্ণালি নূর)', bg: 'bg-amber-600' },
                { id: 'midnight', label: 'Midnight Black (ডার্ক লাক্সারি)', bg: 'bg-neutral-900 border border-neutral-700' },
              ].map((icon) => (
                <div
                  key={icon.id}
                  onClick={() => setSelectedIcon(icon.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                    selectedIcon === icon.id
                      ? 'bg-[#1877F2]/15 border-[#1877F2] text-white'
                      : 'bg-[#18191a] border-[#393a3b] text-[#b0b3b8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${icon.bg} flex items-center justify-center text-white font-black text-sm shadow`}>
                      PW
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">{icon.label}</p>
                      <p className="text-[10px] text-[#8a8d91]">Peace World Icon</p>
                    </div>
                  </div>
                  {selectedIcon === icon.id && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 10. PUBLIC PRESENCE (Professional Mode) */}
        {/* ======================================================== */}
        {modalType === 'public_presence' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b] bg-gradient-to-r from-purple-900/30 to-[#242526]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Public Presence (প্রফেশনাল মোড)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">ক্রিয়েটর টুলস, ফলোয়ার ও মনিটাইজেশন এনাবল করুন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-4 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">প্রফেশনাল মোড স্ট্যাটাস</h3>
                    <p className="text-xs text-[#b0b3b8]">আপনার প্রোফাইল এখন ক্রিয়েটর হিসেবে দৃশ্যমান</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    {isProModeActive ? 'চালু আছে' : 'বন্ধ'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#393a3b] text-center">
                  <div className="p-2 rounded-xl bg-[#242526]">
                    <p className="text-base font-black text-white">12.4K</p>
                    <p className="text-[10px] text-[#b0b3b8]">মোট ফলোয়ার</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#242526]">
                    <p className="text-base font-black text-emerald-400">+85%</p>
                    <p className="text-[10px] text-[#b0b3b8]">রিচ বৃদ্ধি</p>
                  </div>
                  <div className="p-2 rounded-xl bg-[#242526]">
                    <p className="text-base font-black text-amber-400">যোগ্য</p>
                    <p className="text-[10px] text-[#b0b3b8]">মনিটাইজেশন</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsProModeActive(!isProModeActive)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors ${
                  isProModeActive
                    ? 'bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb]'
                    : 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow'
                }`}
              >
                {isProModeActive ? 'প্রফেশনাল মোড বন্ধ করুন' : 'প্রফেশনাল মোড চালু করুন'}
              </button>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 11. PEACE WORLD PLUS (Facebook Plus clone) */}
        {/* ======================================================== */}
        {modalType === 'peace_plus' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b] bg-gradient-to-r from-blue-700/40 via-indigo-700/30 to-[#242526]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Peace World Plus (পিস প্লাস)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">ব্লু ভেরিফাইড ব্যাজ ও এক্সক্লুসিভ ফিচার আনলক করুন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-4 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>পিস ওয়ার্ল্ড প্লাস মেম্বারশিপের সুবিধাসমূহ:</span>
                </h3>
                <div className="space-y-2 text-xs text-[#b0b3b8]">
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1877F2] shrink-0" />
                    <span>ব্লু টিক ভেরিফাইড ব্যাজ (Blue Verified Badge)</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1877F2] shrink-0" />
                    <span>৪৮ ঘণ্টার এক্সক্লুসিভ স্টোরিজ ও 1080p ফুল এইচডি রিলস</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#1877F2] shrink-0" />
                    <span>টাইমলাইনে ৩ গুণ বেশি রিচ ও অগ্রাধিকার কাস্টমার সাপোর্ট</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1877F2]/20 to-[#242526] border border-[#1877F2]/40 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#b0b3b8]">মাসিক সাবস্ক্রিপশন</p>
                  <p className="text-lg font-black text-white">৪৯৯ ৳ / মাস</p>
                </div>
                <button
                  onClick={() => setIsPlusSubscribed(!isPlusSubscribed)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isPlusSubscribed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow'
                  }`}
                >
                  {isPlusSubscribed ? 'সাবস্ক্রাইবড ✓' : 'এখনই সাবস্ক্রাইব করুন'}
                </button>
              </div>
            </div>
          </>
        )}

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
