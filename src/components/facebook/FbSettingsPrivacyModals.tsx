import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Clock,
  Smartphone,
  CreditCard,
  Link,
  Moon,
  Globe,
  Sparkles,
  Check,
  Lock,
  Trash2,
  TrendingUp,
  Award,
  Radio,
  MessageCircle,
  Phone,
  Mail,
  Send,
  ShieldCheck,
  ShieldAlert,
  BellOff,
  Video,
  Briefcase,
  HelpCircle,
  AlertTriangle,
  Info,
  LogOut,
  Users,
  Activity,
  Plus,
  Ban,
  CheckCircle2,
  ExternalLink,
  Bell,
  Megaphone,
  Volume2,
  Vibrate,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { LegalTabType } from '../legal/LegalModal';
import { PeaceSettingsPrefs } from '../../utils/settingsStorage';
import { normalizePhoneNumber, getWhatsAppUrl } from '../../utils/contactLinks';
import { enableWebPushNotifications, triggerDevicePushTray } from '../../lib/fcm';
import { getActivePrayerPauseStatus } from '../../lib/globalPrayer';

export type SettingsModalType =
  | 'settings'
  | 'privacy_center'
  | 'time_management'
  | 'device_requests'
  | 'activity_log'
  | 'ad_activity'
  | 'mobile_center'
  | 'orders_payments'
  | 'link_history'
  | 'dark_mode'
  | 'app_icon'
  | 'cellular_data'
  | 'contact_info'
  | 'notification_settings'
  | 'peace_message_settings'
  | 'peace_edits_settings'
  | 'business_suite_settings'
  | 'halal_content_filter'
  | 'prayer_time_pause'
  | 'family_safety'
  | 'blocked_users_keywords'
  | 'help_center'
  | 'report_problem'
  | 'about_peace_world'
  | 'public_presence'
  | 'peace_plus'
  | null;

interface FbSettingsPrivacyModalsProps {
  modalType: SettingsModalType;
  onClose: () => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (updated: UserProfile) => void;
  prefs: PeaceSettingsPrefs;
  onUpdatePrefs: (patch: Partial<PeaceSettingsPrefs>) => void;
  isDarkMode?: boolean;
  onSavePrivacyDefault?: (privacy: 'public' | 'friends' | 'private') => void;
  onToggleDarkMode?: (isDark: boolean) => void;
  onOpenLegalTab?: (tab: LegalTabType) => void;
  onLogout?: () => void;
}

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  activeColor?: string;
}> = ({ checked, onChange, activeColor = 'bg-[#0866FF]' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 cursor-pointer ${
      checked ? activeColor : 'bg-[#3a3b3c]'
    }`}
  >
    <span
      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const FbSettingsPrivacyModals: React.FC<FbSettingsPrivacyModalsProps> = ({
  modalType,
  onClose,
  userProfile,
  onUpdateProfile,
  prefs,
  onUpdatePrefs,
  isDarkMode = false,
  onSavePrivacyDefault,
  onToggleDarkMode,
  onOpenLegalTab,
  onLogout,
}) => {
  // Privacy Center State
  const [defaultAudience, setDefaultAudience] = useState<'public' | 'friends' | 'private'>('public');
  const [isProfileLocked, setIsProfileLocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('peaceverse_profile_locked') === 'true';
    } catch {
      return false;
    }
  });
  const [lockToast, setLockToast] = useState<string | null>(null);

  // Device Requests
  const [devices, setDevices] = useState([
    { id: 'dev-1', device: 'Android Mobile App (Peaceverse)', location: 'Dhaka, Bangladesh', isCurrent: true, time: 'সক্রিয় এখন' },
    { id: 'dev-2', device: 'Chrome Browser (Desktop)', location: 'Dhaka, Bangladesh', isCurrent: false, time: '৩ ঘণ্টা আগে' },
  ]);
  const [loggedOutAll, setLoggedOutAll] = useState(false);

  // Activity Log
  const [activityItems, setActivityItems] = useState([
    { id: 'act-1', category: 'Reaction', text: 'আপনি "আলহামদুলিল্লাহ আলা কুল্লি হাল" পোস্টে SubhanAllah রিঅ্যাকশন দিয়েছেন', time: '৩০ মিনিট আগে' },
    { id: 'act-2', category: 'Halal Ad', text: 'Peace Mart Global - খাঁটি সুন্দরবনের মধু ও জায়নামাজ অফার দেখেছেন', time: '৩ ঘণ্টা আগে' },
    { id: 'act-3', category: 'Search', text: 'সার্চ করেছেন: "সকাল-সন্ধ্যার মাসনুন দোয়া"', time: 'গতকাল' },
    { id: 'act-4', category: 'Comment', text: 'শায়খ আহমাদুল্লাহ-এর লেকচারে মন্তব্য করেছেন: "জাযাকাল্লাহু খাইরান"', time: '২ দিন আগে' },
  ]);

  // Link History
  const [links, setLinks] = useState([
    { id: 'l1', title: 'কুরআন তিলাওয়াত লাইভ আর্কাইভ', url: 'https://quran.peace-world.org', time: 'গতকাল' },
    { id: 'l2', title: 'Peace Mart Global - হালাল প্রোডাক্ট শপ', url: 'https://sfmartbd.com', time: '৩ দিন আগে' },
  ]);

  // Orders & Payments edit state
  const [bkashInput, setBkashInput] = useState(prefs.bkashNumber);
  const [nagadInput, setNagadInput] = useState(prefs.nagadNumber);
  const [paymentSavedMsg, setPaymentSavedMsg] = useState<string | null>(null);

  // Contact Info editor state
  const [contactWhatsapp, setContactWhatsapp] = useState(userProfile?.whatsapp || '');
  const [contactImo, setContactImo] = useState(userProfile?.imo || '');
  const [contactViber, setContactViber] = useState(userProfile?.viber || '');
  const [contactEmail, setContactEmail] = useState(userProfile?.email || '');
  const [contactWebsite, setContactWebsite] = useState(userProfile?.website || '');
  const [contactMessenger, setContactMessenger] = useState(userProfile?.messengerLink || '');
  const [contactPrivacy, setContactPrivacy] = useState<'public' | 'friends' | 'private'>(
    userProfile?.contactPrivacy || 'public'
  );
  const [contactSavedNotice, setContactSavedNotice] = useState(false);

  // Notification Push activation status
  const [pushStatusMsg, setPushStatusMsg] = useState<string | null>(null);
  const [enablingPush, setEnablingPush] = useState(false);

  // WhatsApp Connect & OTP Verification Modal State
  const [showWhatsappConnectModal, setShowWhatsappConnectModal] = useState(false);
  const [waStep, setWaStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [waPhoneInput, setWaPhoneInput] = useState(userProfile?.whatsapp || '+880');
  const [waOtpCode, setWaOtpCode] = useState('');
  const [waGeneratedOtp, setWaGeneratedOtp] = useState('482910');
  const [waError, setWaError] = useState<string | null>(null);

  // Sync contact inputs whenever modal opens or userProfile updates
  useEffect(() => {
    if (modalType === 'contact_info' && userProfile) {
      setContactWhatsapp(userProfile.whatsapp || '');
      setContactImo(userProfile.imo || '');
      setContactViber(userProfile.viber || '');
      setContactEmail(userProfile.email || '');
      setContactWebsite(userProfile.website || '');
      setContactMessenger(userProfile.messengerLink || '');
      setContactPrivacy(userProfile.contactPrivacy || 'public');
      setContactSavedNotice(false);
    }
    if (modalType === 'orders_payments') {
      setBkashInput(prefs.bkashNumber);
      setNagadInput(prefs.nagadNumber);
      setPaymentSavedMsg(null);
    }
  }, [modalType, userProfile, prefs.bkashNumber, prefs.nagadNumber]);

  // Blocked Users & Keywords inputs
  const [newBlockedUser, setNewBlockedUser] = useState('');
  const [newBlockedKeyword, setNewBlockedKeyword] = useState('');

  // Report a Problem state
  const [reportCategory, setReportCategory] = useState('Non-Halal Content');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  // Professional Mode & Peace Plus State
  const [isProModeActive, setIsProModeActive] = useState(true);
  const [isPlusSubscribed, setIsPlusSubscribed] = useState(false);

  const handleToggleProfileLock = () => {
    const nextState = !isProfileLocked;
    setIsProfileLocked(nextState);
    try {
      localStorage.setItem('peaceverse_profile_locked', String(nextState));
      window.dispatchEvent(new Event('peaceverse_profile_lock_changed'));
    } catch {}
    setLockToast(
      nextState
        ? '🔒 আপনার প্রোফাইল সফলভাবে লক করা হয়েছে!'
        : '🔓 আপনার প্রোফাইল আনলক করা হয়েছে।'
    );
    setTimeout(() => setLockToast(null), 3000);
  };

  const handleSaveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !onUpdateProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      whatsapp: contactWhatsapp.trim(),
      imo: contactImo.trim(),
      viber: contactViber.trim(),
      email: contactEmail.trim() || userProfile.email,
      website: contactWebsite.trim(),
      messengerLink: contactMessenger.trim(),
      contactPrivacy,
    };
    onUpdateProfile(updated);
    setContactSavedNotice(true);
    setTimeout(() => setContactSavedNotice(false), 3000);
  };

  if (!modalType) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">

        {/* ======================================================== */}
        {/* 1. ACCOUNT SETTINGS */}
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
                <h4 className="font-bold text-sm text-white">ব্যক্তিগত ও অ্যাকাউন্ট তথ্য</h4>
                <p className="text-xs text-[#b0b3b8]">নাম: <span className="text-white font-semibold">{userProfile?.name || 'Sharif Hasan'}</span></p>
                <p className="text-xs text-[#b0b3b8]">ইমেইল: <span className="text-white font-semibold">{userProfile?.email || 'masterlive251@gmail.com'}</span></p>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <p className="text-xs text-[#b0b3b8]">
                    WhatsApp:{' '}
                    {userProfile?.whatsapp ? (
                      <span className="text-emerald-400 font-bold">
                        যুক্ত করা হয়েছে ✓ ({userProfile.whatsapp})
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setWaPhoneInput(userProfile?.whatsapp || '+880');
                          setWaOtpCode('');
                          setWaError(null);
                          setWaStep('phone');
                          setShowWhatsappConnectModal(true);
                        }}
                        className="text-rose-400 hover:text-rose-300 font-bold underline decoration-dotted cursor-pointer transition-colors"
                      >
                        যুক্ত করা হয়নি
                      </button>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setWaPhoneInput(userProfile?.whatsapp || '+880');
                      setWaOtpCode('');
                      setWaError(null);
                      setWaStep('phone');
                      setShowWhatsappConnectModal(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                      userProfile?.whatsapp
                        ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30'
                        : 'bg-[#0866FF] hover:bg-[#1877F2] text-white'
                    }`}
                  >
                    {userProfile?.whatsapp ? 'পরিবর্তন করুন' : 'যুক্ত করুন'}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">টু-ফ্যাক্টর অথেনটিকেশন (2FA)</h4>
                  <p className="text-xs text-[#b0b3b8]">অ্যাকাউন্টের অতিরিক্ত নিরাপত্তা সুরক্ষা</p>
                </div>
                <ToggleSwitch
                  checked={prefs.twoFactorEnabled}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ twoFactorEnabled: val })}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">নামাজের ওয়াক্ত রিমাইন্ডার (Salah Reminder)</h4>
                  <p className="text-xs text-[#b0b3b8]">প্রতি ওয়াক্তের আগে নামাজের স্মরণ বার্তা</p>
                </div>
                <ToggleSwitch
                  checked={prefs.salahReminder}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ salahReminder: val })}
                />
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
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2.5">
                <h4 className="font-bold text-xs text-[#b0b3b8] uppercase tracking-wider">
                  ভবিষ্যতের পোস্ট কে দেখতে পাবে? (Default Audience)
                </h4>
                <div className="space-y-2">
                  {[
                    { id: 'public', label: 'পাবলিক (Public)', desc: 'Peaceverse-এর সবাই আপনার পোস্ট দেখতে পাবে' },
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

              <div
                onClick={handleToggleProfileLock}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-xs select-none ${
                  isProfileLocked
                    ? 'bg-[#1877F2]/10 border-[#1877F2] hover:bg-[#1877F2]/15'
                    : 'bg-[#18191a] border-[#393a3b] hover:bg-[#242526]'
                }`}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isProfileLocked ? 'bg-[#1877F2] text-white' : 'bg-[#3a3b3c] text-[#b0b3b8]'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">প্রোফাইল লক (Profile Lock)</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isProfileLocked
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-[#3a3b3c] text-[#8a8d91]'
                        }`}
                      >
                        {isProfileLocked ? 'লকড আছে' : 'আনলকড'}
                      </span>
                    </div>
                    <p className="text-xs text-[#b0b3b8] mt-0.5">
                      অপরিচিত কেউ আপনার পূর্ণ ছবি ও পোস্ট দেখতে পারবে না
                    </p>
                  </div>
                </div>
                <ToggleSwitch checked={isProfileLocked} onChange={handleToggleProfileLock} />
              </div>

              {lockToast && (
                <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{lockToast}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 3. TIME MANAGEMENT (With Salah Reminder Toggle) */}
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
                  <p className="text-[11px] text-[#b0b3b8]">দৈনিক ব্যবহার ও নামাজের রিমাইন্ডার</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
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

              {/* Salah Reminder Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>🕌 Salah Reminder (নামাজের রিমাইন্ডার)</span>
                  </h4>
                  <p className="text-xs text-[#b0b3b8]">৫ ওয়াক্ত নামাজের ১০ মিনিট আগে আযান ও নামাজের স্মরণ বার্তা পান</p>
                </div>
                <ToggleSwitch
                  checked={prefs.salahReminder}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ salahReminder: val })}
                />
              </div>

              {/* Quiet Mode during Salah */}
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">নামাজের ওয়াক্তে কুয়েট মোড (Quiet Mode)</h4>
                  <p className="text-xs text-[#b0b3b8]">৫ ওয়াক্ত নামাজের সময় নোটিফিকেশন স্বয়ংক্রিয়ভাবে নীরব থাকবে</p>
                </div>
                <ToggleSwitch
                  checked={prefs.quietModeSalah}
                  activeColor="bg-[#0866FF]"
                  onChange={(val) => onUpdatePrefs({ quietModeSalah: val, prayerTimePause: val })}
                />
              </div>

              {(() => {
                const status = getActivePrayerPauseStatus(prefs.prayerPauseMinutes);
                return (
                  <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-center justify-between gap-2">
                    <span>
                      {status.paused
                        ? `🕌 Active Salah Pause: ${status.prayerName} (until ${status.untilTime})`
                        : `📍 ${status.schedule.city}: Next ${status.schedule.nextPrayer.name} at ${status.schedule.nextPrayer.time}`}
                    </span>
                    <span className="font-bold text-emerald-400 shrink-0">
                      {prefs.prayerTimePause || prefs.quietModeSalah ? 'Saved ON' : 'OFF'}
                    </span>
                  </div>
                );
              })()}

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Daily Time Reminder Limit</span>
                  <span className="font-bold text-[#1877F2]">{prefs.dailyReminderMins} মিনিট</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={120}
                  step={15}
                  value={prefs.dailyReminderMins}
                  onChange={(e) => onUpdatePrefs({ dailyReminderMins: Number(e.target.value) })}
                  className="w-full accent-[#1877F2]"
                />
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 4. DEVICE REQUESTS */}
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
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
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
                className="w-full mt-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
              >
                {loggedOutAll ? 'অন্যান্য সব ডিভাইস থেকে লগআউট সম্পন্ন ✓' : 'অন্যান্য সব ডিভাইস থেকে লগআউট করুন'}
              </button>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 5. YOUR ACTIVITY LOG (Replaced Ad Activity) */}
        {/* ======================================================== */}
        {(modalType === 'activity_log' || modalType === 'ad_activity') && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Your Activity Log (অ্যাক্টিভিটি লগ)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">আপনার পোস্ট, রিঅ্যাকশন, সার্চ ও হালাল স্পন্সর হিস্ট্রি</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activityItems.length > 0 ? (
                <>
                  {activityItems.map((act) => (
                    <div key={act.id} className="p-3 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase">{act.category}</span>
                        <span className="text-[10px] text-[#8a8d91]">{act.time}</span>
                      </div>
                      <p className="text-xs text-white font-medium">{act.text}</p>
                    </div>
                  ))}
                  <button
                    onClick={() => setActivityItems([])}
                    className="w-full py-2.5 rounded-xl bg-[#3a3b3c] hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>অ্যাক্টিভিটি লগ মুছে ফেলুন (Clear Activity)</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-8 text-xs text-[#b0b3b8]">আপনার অ্যাক্টিভিটি লগ পরিষ্কার আছে।</div>
              )}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 6. ORDERS AND PAYMENTS (With bKash & Nagad) */}
        {/* ======================================================== */}
        {modalType === 'orders_payments' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Orders & Payments (bKash / Nagad)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">মার্কেটপ্লেস অর্ডার ও মোবাইল ব্যাংকিং পেমেন্ট মেথড</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">অর্ডার #101 • Peace Mart Global</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                    Pending Halal Check
                  </span>
                </div>
                <p className="text-xs text-[#b0b3b8]">প্রিমিয়াম জায়নামাজ ও খাঁটি সুন্দরবনের মধু</p>
                <p className="text-xs font-bold text-emerald-400">৳ 1,200 • {prefs.defaultPaymentMethod === 'bkash' ? 'bKash' : prefs.defaultPaymentMethod === 'nagad' ? 'Nagad' : 'Cash on Delivery'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-3">
                <h4 className="font-bold text-xs text-[#b0b3b8] uppercase">সংযুক্ত পেমেন্ট মেথড (bKash & Nagad)</h4>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-pink-400 flex items-center justify-between mb-1">
                      <span>bKash (বিকাশ) নম্বর</span>
                      {prefs.defaultPaymentMethod === 'bkash' && <span className="text-[10px] text-emerald-400">✓ ডিফল্ট</span>}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={bkashInput}
                        onChange={(e) => setBkashInput(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="flex-1 bg-[#242526] border border-[#393a3b] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500"
                      />
                      <button
                        type="button"
                        onClick={() => onUpdatePrefs({ defaultPaymentMethod: 'bkash' })}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                          prefs.defaultPaymentMethod === 'bkash' ? 'bg-pink-600 text-white' : 'bg-[#3a3b3c] text-[#b0b3b8]'
                        }`}
                      >
                        Default
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-orange-400 flex items-center justify-between mb-1">
                      <span>Nagad (নগদ) নম্বর</span>
                      {prefs.defaultPaymentMethod === 'nagad' && <span className="text-[10px] text-emerald-400">✓ ডিফল্ট</span>}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={nagadInput}
                        onChange={(e) => setNagadInput(e.target.value)}
                        placeholder="018XXXXXXXX"
                        className="flex-1 bg-[#242526] border border-[#393a3b] rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => onUpdatePrefs({ defaultPaymentMethod: 'nagad' })}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                          prefs.defaultPaymentMethod === 'nagad' ? 'bg-orange-600 text-white' : 'bg-[#3a3b3c] text-[#b0b3b8]'
                        }`}
                      >
                        Default
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onUpdatePrefs({ bkashNumber: bkashInput.trim(), nagadNumber: nagadInput.trim() });
                    setPaymentSavedMsg('bKash ও Nagad পেমেন্ট তথ্য সংরক্ষিত হয়েছে ✓');
                    setTimeout(() => setPaymentSavedMsg(null), 3000);
                  }}
                  className="w-full py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs cursor-pointer"
                >
                  পেমেন্ট তথ্য সংরক্ষণ করুন
                </button>

                {paymentSavedMsg && (
                  <p className="text-xs text-emerald-400 font-semibold text-center">{paymentSavedMsg}</p>
                )}
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
                    className="w-full py-2.5 rounded-xl bg-[#3a3b3c] hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
        {/* 8. DARK MODE */}
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
                  onClick={() => onToggleDarkMode?.(theme.isD)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                    isDarkMode === theme.isD
                      ? 'bg-[#1877F2]/15 border-[#1877F2] text-white'
                      : 'bg-[#18191a] border-[#393a3b] text-[#b0b3b8]'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs text-white">{theme.label}</p>
                    <p className="text-[10px] text-[#8a8d91]">{theme.desc}</p>
                  </div>
                  <input type="radio" checked={isDarkMode === theme.isD} onChange={() => {}} className="w-4 h-4 text-[#1877F2]" />
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
                  onClick={() => onUpdatePrefs({ selectedAppIcon: icon.id as PeaceSettingsPrefs['selectedAppIcon'] })}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                    prefs.selectedAppIcon === icon.id
                      ? 'bg-[#1877F2]/15 border-[#1877F2] text-white'
                      : 'bg-[#18191a] border-[#393a3b] text-[#b0b3b8]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${icon.bg} flex items-center justify-center text-white font-black text-base shadow`}>
                      P
                    </div>
                    <div>
                      <p className="font-bold text-xs text-white">{icon.label}</p>
                      <p className="text-[10px] text-[#8a8d91]">Peaceverse Icon</p>
                    </div>
                  </div>
                  {prefs.selectedAppIcon === icon.id && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 10. MOBILE CENTER · BANGLALINK */}
        {/* ======================================================== */}
        {modalType === 'mobile_center' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b] bg-gradient-to-r from-orange-600/30 to-[#242526]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Mobile Center · banglalink</h2>
                  <p className="text-[11px] text-[#b0b3b8]">ফ্রি ইন্টারনেট ব্যালেন্স ও অফার ম্যানেজমেন্ট</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="p-4 rounded-2xl bg-[#18191a] border border-orange-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#b0b3b8]">সিম কার্ড স্ট্যাটাস</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold">Banglalink 4G</span>
                </div>
                <div className="pt-2 border-t border-[#393a3b]">
                  <p className="text-xs text-[#b0b3b8]">অব্যবহৃত ডেটা প্যাক</p>
                  <p className="text-xl font-black text-white">১.৫ জিবি (মেয়াদ ৭ দিন)</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#18191a] border border-[#393a3b] space-y-1 text-xs text-[#e4e6eb]">
                <p className="font-semibold text-white">ফ্রি মোড (Free Mode)</p>
                <p className="text-neutral-400">ব্যালেন্স ছাড়াই টেক্সট পোস্ট এবং মেসেঞ্জারে টেক্সট চ্যাট করুন।</p>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 11. CELLULAR DATA USAGE */}
        {/* ======================================================== */}
        {modalType === 'cellular_data' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Cellular Data Usage</h2>
                  <p className="text-[11px] text-[#b0b3b8]">ডেটা সেভার ও ভিডিও কোয়ালিটি সেটিংস</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3.5 rounded-xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-sm text-white">ডেটা সেভার মোড (Data Saver)</p>
                  <p className="text-xs text-[#b0b3b8]">ভিডিও কোয়ালিটি কমিয়ে ৪০% পর্যন্ত ডেটা সাশ্রয় করে</p>
                </div>
                <ToggleSwitch
                  checked={prefs.dataSaver}
                  onChange={(val) => onUpdatePrefs({ dataSaver: val })}
                />
              </div>
              <div className="p-3.5 rounded-xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-sm text-white">অটোপ্লে ভিডিও (Wi-Fi Only)</p>
                  <p className="text-xs text-[#b0b3b8]">শুধুমাত্র Wi-Fi এ ভিডিও অটো-প্লে হবে</p>
                </div>
                <ToggleSwitch
                  checked={prefs.autoplayWifiOnly}
                  onChange={(val) => onUpdatePrefs({ autoplayWifiOnly: val })}
                />
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 12. CONTACT INFO (WhatsApp, IMO, Viber, Email, Website) */}
        {/* ======================================================== */}
        {modalType === 'contact_info' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b] bg-gradient-to-r from-emerald-900/30 to-[#242526]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Contact Info (যোগাযোগের তথ্য)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">WhatsApp, IMO, Viber, Email ও Website যুক্ত করুন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveContactInfo} className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#e4e6eb] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </span>
                    WhatsApp Number
                  </span>
                  {contactWhatsapp.trim() && (
                    <a
                      href={getWhatsAppUrl(contactWhatsapp) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#25D366] hover:underline flex items-center gap-1"
                    >
                      <span>wa.me/{normalizePhoneNumber(contactWhatsapp)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </label>
                <input
                  type="tel"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  placeholder="+880 1712-345678"
                  className="w-full bg-[#18191a] border border-[#393a3b] focus:border-[#25D366] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* IMO */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#e4e6eb] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-[#0088CC]/20 text-[#38BDF8] flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  IMO Number
                </label>
                <input
                  type="tel"
                  value={contactImo}
                  onChange={(e) => setContactImo(e.target.value)}
                  placeholder="+880 1712-345678"
                  className="w-full bg-[#18191a] border border-[#393a3b] focus:border-[#38BDF8] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Viber */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#e4e6eb] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-[#7360F2]/20 text-[#A78BFA] flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  Viber Number
                </label>
                <input
                  type="tel"
                  value={contactViber}
                  onChange={(e) => setContactViber(e.target.value)}
                  placeholder="+880 1712-345678"
                  className="w-full bg-[#18191a] border border-[#393a3b] focus:border-[#A78BFA] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#e4e6eb] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full bg-[#18191a] border border-[#393a3b] focus:border-[#0866FF] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Website */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#e4e6eb] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Globe className="w-3.5 h-3.5" />
                  </span>
                  Website
                </label>
                <input
                  type="text"
                  value={contactWebsite}
                  onChange={(e) => setContactWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-[#18191a] border border-[#393a3b] focus:border-[#0866FF] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Messenger optional */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#e4e6eb] flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-[#0084FF]/20 text-[#60A5FA] flex items-center justify-center">
                    <Send className="w-3.5 h-3.5" />
                  </span>
                  Messenger Link (optional)
                </label>
                <input
                  type="text"
                  value={contactMessenger}
                  onChange={(e) => setContactMessenger(e.target.value)}
                  placeholder="facebook.com/username"
                  className="w-full bg-[#18191a] border border-[#393a3b] focus:border-[#0084FF] rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Privacy */}
              <div className="p-3 rounded-xl bg-[#18191a] border border-[#393a3b] space-y-2">
                <label className="text-[11px] font-bold text-[#b0b3b8] block">প্রাইভেসি (Who can see your contacts?)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'public', label: 'Public', icon: Globe },
                    { id: 'friends', label: 'Friends only', icon: Users },
                    { id: 'private', label: 'Only me', icon: Lock },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setContactPrivacy(opt.id as 'public' | 'friends' | 'private')}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer ${
                          contactPrivacy === opt.id
                            ? 'bg-[#0866FF]/20 border-[#0866FF] text-white'
                            : 'bg-[#242526] border-[#393a3b] text-[#b0b3b8]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {contactSavedNotice && (
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>যোগাযোগের তথ্য প্রোফাইলে সংরক্ষিত হয়েছে!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Save Contact Info (সংরক্ষণ করুন)
              </button>
            </form>
          </>
        )}

        {/* ======================================================== */}
        {/* 13. PEACE MESSAGE SETTINGS */}
        {/* ======================================================== */}
        {modalType === 'peace_message_settings' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0084FF]/20 text-[#60A5FA] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Peace Message Settings</h2>
                  <p className="text-[11px] text-[#b0b3b8]">মেসেজ প্রাইভেসি, রিকোয়েস্ট ও হালাল ফিল্টার</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
                <h4 className="font-bold text-xs text-[#b0b3b8] uppercase">কে আপনাকে মেসেজ পাঠাতে পারবে? (Who can message you)</h4>
                {[
                  { id: 'everyone', label: 'Everyone (সবাই)' },
                  { id: 'friends_of_friends', label: 'Friends of Friends (বন্ধুর বন্ধুরা)' },
                  { id: 'friends_only', label: 'Friends Only (শুধু বন্ধুরা)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdatePrefs({ whoCanMessage: opt.id as PeaceSettingsPrefs['whoCanMessage'] })}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold flex items-center justify-between cursor-pointer ${
                      prefs.whoCanMessage === opt.id
                        ? 'bg-[#0866FF]/20 border-[#0866FF] text-white'
                        : 'bg-[#242526] border-[#393a3b] text-[#b0b3b8]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {prefs.whoCanMessage === opt.id && <Check className="w-4 h-4 text-[#0866FF]" />}
                  </button>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Message Requests (মেসেজ রিকোয়েস্ট)</h4>
                  <p className="text-xs text-[#b0b3b8]">অপরিচিতদের মেসেজ রিকোয়েস্ট ফোল্ডারে রাখুন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.messageRequestsEnabled}
                  onChange={(val) => onUpdatePrefs({ messageRequestsEnabled: val })}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Halal Message Filter</h4>
                  <p className="text-xs text-[#b0b3b8]">অশ্লীল শব্দ ও স্প্যাম লিংক স্বয়ংক্রিয়ভাবে ব্লক করুন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.halalMessageFilter}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ halalMessageFilter: val })}
                />
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 14. PEACE EDITS SETTINGS */}
        {/* ======================================================== */}
        {modalType === 'peace_edits_settings' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-[#00FF88] flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Peace Edits Settings</h2>
                  <p className="text-[11px] text-[#b0b3b8]">ভিডিও কোয়ালিটি, অটো হালাল চেক ও ওয়াটারমার্ক</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
                <h4 className="font-bold text-xs text-[#b0b3b8] uppercase">Default Video Export Quality</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['720p', '1080p', '4K'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => onUpdatePrefs({ editsDefaultQuality: q })}
                      className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                        prefs.editsDefaultQuality === q
                          ? 'bg-[#00FF88]/20 border-[#00FF88] text-[#00FF88]'
                          : 'bg-[#242526] border-[#393a3b] text-[#b0b3b8]'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Auto Halal Check</h4>
                  <p className="text-xs text-[#b0b3b8]">এক্সপোর্টের আগে হারাম মিউজিক অপসারণ ও নাশিদ ভেরিফাই করুন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.editsAutoHalalCheck}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ editsAutoHalalCheck: val })}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">No Watermark by Default</h4>
                  <p className="text-xs text-[#b0b3b8]">ওয়াটারমার্ক ছাড়াই হালাল ভিডিও ডাউনলোড</p>
                </div>
                <ToggleSwitch
                  checked={prefs.editsWatermarkOff}
                  onChange={(val) => onUpdatePrefs({ editsWatermarkOff: val })}
                />
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 15. BUSINESS SUITE SETTINGS */}
        {/* ======================================================== */}
        {modalType === 'business_suite_settings' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Business Suite Settings</h2>
                  <p className="text-[11px] text-[#b0b3b8]">শপ ভেরিফিকেশন ও অর্ডার নোটিফিকেশন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">১০০% হালাল শপ ভেরিফিকেশন (Shop Verification)</h4>
                  <p className="text-xs text-[#b0b3b8]">Peace Mart Global ও আপনার পেজসমূহে Halal Certified Worldwide ব্যাজ দেখান</p>
                </div>
                <ToggleSwitch
                  checked={prefs.businessShopVerification}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ businessShopVerification: val })}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">অর্ডার নোটিফিকেশন (Order Notifications)</h4>
                  <p className="text-xs text-[#b0b3b8]">নতুন অর্ডার, বিকাশ/নগদ পেমেন্ট ও রিভিউয়ের তাৎক্ষণিক অ্যালার্ট</p>
                </div>
                <ToggleSwitch
                  checked={prefs.businessOrderNotifications}
                  onChange={(val) => onUpdatePrefs({ businessOrderNotifications: val })}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">WhatsApp অর্ডার সিঙ্ক</h4>
                  <p className="text-xs text-[#b0b3b8]">কাস্টমারের WhatsApp অর্ডার সরাসরি Business Inbox-এ যুক্ত করুন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.businessWhatsappOrderSync}
                  activeColor="bg-[#25D366]"
                  onChange={(val) => onUpdatePrefs({ businessWhatsappOrderSync: val })}
                />
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 15B. NOTIFICATION SETTINGS (CREATOR + USER PUSH SETTINGS) */}
        {/* ======================================================== */}
        {modalType === 'notification_settings' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b] bg-gradient-to-r from-[#0866FF]/20 via-[#242526] to-emerald-900/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0866FF] text-white flex items-center justify-center shadow">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Notification Settings</h2>
                  <p className="text-[11px] text-[#b0b3b8]">ক্রিয়েটর ব্রডকাস্ট, পুশ ও সাউন্ড সেটিংস</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Web Push / Firebase FCM Activation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-[#18191a] border border-emerald-500/30 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4 text-emerald-400" />
                      <span>Firebase Web Push (FCM)</span>
                    </h4>
                    <p className="text-xs text-[#b0b3b8]">
                      অ্যাপ বন্ধ থাকলেও ফোনে তাৎক্ষণিক পুশ নোটিফিকেশন পান
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      prefs.fcmPushSubscribed
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {prefs.fcmPushSubscribed ? 'সক্রিয় ✓' : 'অপেক্ষমাণ'}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={enablingPush}
                    onClick={async () => {
                      setEnablingPush(true);
                      const res = await enableWebPushNotifications(userProfile?.id || userProfile?.name);
                      setEnablingPush(false);
                      if (res.granted) {
                        onUpdatePrefs({ fcmPushSubscribed: true });
                        setPushStatusMsg('✅ Firebase FCM পুশ নোটিফিকেশন সফলভাবে চালু হয়েছে!');
                        await triggerDevicePushTray({
                          title: 'Peaceverse24 Push সক্রিয় হয়েছে ✓',
                          body: 'প্রিয় দাদা ও আপনার প্রিয় ক্রিয়েটরদের নতুন আপডেট সাথে সাথে পাবেন।',
                          sound: prefs.notifSound,
                          vibrate: prefs.notifVibration,
                        });
                      } else {
                        setPushStatusMsg('⚠️ ব্রাউজার থেকে নোটিফিকেশন অনুমতি দিন (Permission denied)।');
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer disabled:opacity-60"
                  >
                    {enablingPush ? 'চালু হচ্ছে...' : prefs.fcmPushSubscribed ? '🔄 পুশ টেস্ট করুন' : '🔔 Push Notification চালু করুন'}
                  </button>
                </div>
                {pushStatusMsg && (
                  <p className="text-[11px] font-semibold text-emerald-300">{pushStatusMsg}</p>
                )}
              </div>

              {/* User Receiver Preferences */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#b0b3b8] px-1">
                  রিসিভার সেটিংস (To Receive Notifications)
                </p>

                <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white">Notify when my favorite Creator posts</h4>
                    <p className="text-xs text-[#b0b3b8]">ফলো করা ক্রিয়েটর নতুন পোস্ট বা ভিডিও দিলেই জানুন</p>
                  </div>
                  <ToggleSwitch
                    checked={prefs.notifyFavoriteCreator}
                    activeColor="bg-emerald-600"
                    onChange={(val) => onUpdatePrefs({ notifyFavoriteCreator: val })}
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#18191a] border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white">প্রিয় দাদার নতুন পোস্টের নোটিফিকেশন পেতে চাই</h4>
                    <p className="text-xs text-[#b0b3b8]">প্রিয় দাদা (Admin / Creator) ভিডিও, ছবি বা পণ্য আপলোড করলে তাৎক্ষণিক অ্যালার্ট</p>
                  </div>
                  <ToggleSwitch
                    checked={prefs.notifyPriyoDada}
                    activeColor="bg-emerald-600"
                    onChange={(val) => onUpdatePrefs({ notifyPriyoDada: val })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#0866FF]" />
                      <span className="text-xs font-bold text-white">Sound</span>
                    </div>
                    <ToggleSwitch
                      checked={prefs.notifSound}
                      onChange={(val) => onUpdatePrefs({ notifSound: val })}
                    />
                  </div>

                  <div className="p-3 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Vibrate className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Vibration</span>
                    </div>
                    <ToggleSwitch
                      checked={prefs.notifVibration}
                      onChange={(val) => onUpdatePrefs({ notifVibration: val })}
                    />
                  </div>
                </div>
              </div>

              {/* Creator Broadcast Preferences */}
              <div className="space-y-2.5 pt-2 border-t border-[#393a3b]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 px-1">
                  Creator Settings (ক্রিয়েটর / পেজ ব্রডকাস্ট)
                </p>

                <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white">Notify all followers when I post</h4>
                    <p className="text-xs text-[#b0b3b8]">ভিডিও, ছবি, প্রোডাক্ট বা পোস্ট আপলোড করলে সব ফলোয়ারকে জানান (Default ON)</p>
                  </div>
                  <ToggleSwitch
                    checked={prefs.creatorNotifyFollowersOnPost}
                    activeColor="bg-[#0866FF]"
                    onChange={(val) => onUpdatePrefs({ creatorNotifyFollowersOnPost: val })}
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white">Send Push Notification to all users</h4>
                    <p className="text-xs text-[#b0b3b8]">সকল ব্যবহারকারীর ফোনে ও বেল আইকনে তাৎক্ষণিক ব্রডকাস্ট পাঠান</p>
                  </div>
                  <ToggleSwitch
                    checked={prefs.creatorSendPushToAllUsers}
                    activeColor="bg-emerald-600"
                    onChange={(val) => onUpdatePrefs({ creatorSendPushToAllUsers: val })}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 16. HALAL CONTENT FILTER */}
        {/* ======================================================== */}
        {modalType === 'halal_content_filter' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b] bg-gradient-to-r from-emerald-900/30 to-[#242526]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Halal Content Filter</h2>
                  <p className="text-[11px] text-[#b0b3b8]">হারাম কনটেন্ট, মিউজিক ও অশ্লীলতা স্বয়ংক্রিয়ভাবে ব্লক করুন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-emerald-500/40 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Halal Content Filter (হালাল ফিল্টার)</h4>
                  <p className="text-xs text-[#b0b3b8]">ফিড ও রিলসে হারাম এবং শরিয়াহ-বিরোধী কনটেন্ট ব্লক করে</p>
                </div>
                <ToggleSwitch
                  checked={prefs.halalContentFilter}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ halalContentFilter: val })}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">বাদ্যযন্ত্র ও হারাম মিউজিক ব্লক করুন</h4>
                  <p className="text-xs text-[#b0b3b8]">শুধুমাত্র ভোকাল নাশিদ ও কুরআন তিলাওয়াত প্রদর্শন করুন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.blockHaramMusic}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ blockHaramMusic: val })}
                />
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 17. PRAYER TIME PAUSE */}
        {/* ======================================================== */}
        {modalType === 'prayer_time_pause' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <BellOff className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Prayer Time Pause (নামাজের বিরতি)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">নামাজের সময় সকল নোটিফিকেশন স্বয়ংক্রিয়ভাবে বিরতিতে থাকবে</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Auto Pause During Salah</h4>
                  <p className="text-xs text-[#b0b3b8]">ফজর, যোহর, আসর, মাগরিব ও এশার সময় অটো পজ চালু রাখুন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.prayerTimePause}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ prayerTimePause: val })}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2">
                <h4 className="font-bold text-xs text-[#b0b3b8] uppercase">বিরতির সময়কাল (Pause Duration)</h4>
                <div className="grid grid-cols-3 gap-2">
                  {([15, 20, 30] as const).map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => onUpdatePrefs({ prayerPauseMinutes: mins })}
                      className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                        prefs.prayerPauseMinutes === mins
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-[#242526] border-[#393a3b] text-[#b0b3b8]'
                      }`}
                    >
                      {mins} মিনিট
                    </button>
                  ))}
                </div>
              </div>

              {(() => {
                const status = getActivePrayerPauseStatus(prefs.prayerPauseMinutes);
                return (
                  <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                    <p className="font-bold text-emerald-300">
                      {status.paused
                        ? `🕌 Notifications Paused Now for ${status.prayerName} until ${status.untilTime}`
                        : `📍 ${status.schedule.city}: Next Pause at ${status.schedule.nextPrayer.name} (${status.schedule.nextPrayer.time})`}
                    </p>
                    <p className="text-[11px] text-[#b0b3b8]">
                      Fajr {status.schedule.times.Fajr} · Dhuhr {status.schedule.times.Dhuhr} · Asr {status.schedule.times.Asr} · Maghrib {status.schedule.times.Maghrib} · Isha {status.schedule.times.Isha}
                    </p>
                  </div>
                );
              })()}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 18. FAMILY SAFETY */}
        {/* ======================================================== */}
        {modalType === 'family_safety' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Family Safety (পারিবারিক নিরাপত্তা)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">১৮+ কনটেন্ট ব্লক এবং সেফ সার্চ চালু রাখুন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Block 18+ Content (১৮+ কনটেন্ট ব্লক)</h4>
                  <p className="text-xs text-[#b0b3b8]">প্রাপ্তবয়স্ক ও অশালীন সকল ছবি/ভিডিও সম্পূর্ণ ব্লক থাকবে</p>
                </div>
                <ToggleSwitch
                  checked={prefs.familyBlock18Plus}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ familyBlock18Plus: val })}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Safe Search (সেফ সার্চ)</h4>
                  <p className="text-xs text-[#b0b3b8]">সার্চ রেজাল্ট থেকে ক্ষতিকর ও বিভ্রান্তিকর লিংক বাদ দিন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.familySafeSearch}
                  onChange={(val) => onUpdatePrefs({ familySafeSearch: val })}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm text-white">Kids-Safe Reels Mode</h4>
                  <p className="text-xs text-[#b0b3b8]">শিশু ও পরিবারের সবার সাথে দেখার উপযোগী রিলস</p>
                </div>
                <ToggleSwitch
                  checked={prefs.kidsSafeReels}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ kidsSafeReels: val })}
                />
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 19. BLOCKED USERS & KEYWORDS */}
        {/* ======================================================== */}
        {modalType === 'blocked_users_keywords' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Blocked Users & Keywords</h2>
                  <p className="text-[11px] text-[#b0b3b8]">ব্লক করা ইউজার ও অবাঞ্ছিত শব্দ পরিচালনা করুন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Blocked Users */}
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2.5">
                <h4 className="font-bold text-xs text-white">Blocked Users ({prefs.blockedUsers.length})</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBlockedUser}
                    onChange={(e) => setNewBlockedUser(e.target.value)}
                    placeholder="ইউজারনেম লিখুন..."
                    className="flex-1 bg-[#242526] border border-[#393a3b] rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newBlockedUser.trim();
                      if (!val) return;
                      if (!prefs.blockedUsers.includes(val)) {
                        onUpdatePrefs({ blockedUsers: [...prefs.blockedUsers, val] });
                      }
                      setNewBlockedUser('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Block
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prefs.blockedUsers.map((u) => (
                    <span
                      key={u}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#242526] border border-[#393a3b] text-xs text-white"
                    >
                      <span>{u}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdatePrefs({ blockedUsers: prefs.blockedUsers.filter((x) => x !== u) })
                        }
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Unblock"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Blocked Keywords */}
              <div className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-2.5">
                <h4 className="font-bold text-xs text-white">Blocked Keywords ({prefs.blockedKeywords.length})</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBlockedKeyword}
                    onChange={(e) => setNewBlockedKeyword(e.target.value)}
                    placeholder="যেমন: casino, spam..."
                    className="flex-1 bg-[#242526] border border-[#393a3b] rounded-lg px-3 py-1.5 text-xs text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newBlockedKeyword.trim();
                      if (!val) return;
                      if (!prefs.blockedKeywords.includes(val)) {
                        onUpdatePrefs({ blockedKeywords: [...prefs.blockedKeywords, val] });
                      }
                      setNewBlockedKeyword('');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0866FF] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {prefs.blockedKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#242526] border border-[#393a3b] text-xs text-amber-300"
                    >
                      <span>#{kw}</span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdatePrefs({ blockedKeywords: prefs.blockedKeywords.filter((x) => x !== kw) })
                        }
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 20. HELP CENTER */}
        {/* ======================================================== */}
        {modalType === 'help_center' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0866FF]/20 text-[#0866FF] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Help Center (সাহায্য কেন্দ্র)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">প্রোফাইল, পেজ ও হালাল নিরাপত্তা বিষয়ক প্রশ্নোত্তর</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                {
                  q: 'কীভাবে WhatsApp, IMO এবং Viber নম্বর যুক্ত করবেন?',
                  a: 'Settings & Privacy > Contact Info-তে গিয়ে আপনার নম্বর দিয়ে Save করুন। প্রোফাইলে ভিজিটররা সরাসরি চ্যাট বাটন দেখতে পাবে।',
                },
                {
                  q: 'Peaceverse-এর Halal Content Filter কীভাবে কাজ করে?',
                  a: 'এটি ফিড, রিলস ও কমেন্ট থেকে স্বয়ংক্রিয়ভাবে হারাম মিউজিক, ১৮+ কনটেন্ট এবং স্প্যাম ব্লক করে।',
                },
                {
                  q: 'গোল্ডেন কয়েন কীভাবে bKash বা Nagad-এ ক্যাশ আউট করবেন?',
                  a: 'মেনু থেকে গোল্ডেন ওয়ালেট অথবা Orders & Payments-এ আপনার bKash/Nagad নম্বর যুক্ত করে উত্তোলনের আবেদন করুন।',
                },
              ].map((faq, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-[#18191a] border border-[#393a3b] space-y-1">
                  <p className="font-bold text-xs text-white">{faq.q}</p>
                  <p className="text-xs text-[#b0b3b8] leading-relaxed">{faq.a}</p>
                </div>
              ))}

              {onOpenLegalTab && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLegalTab('guidelines');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0866FF] text-white font-bold text-xs cursor-pointer"
                >
                  সম্পূর্ণ কমিউনিটি গাইডলাইন পড়ুন
                </button>
              )}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 21. REPORT A PROBLEM */}
        {/* ======================================================== */}
        {modalType === 'report_problem' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Report a Problem (সমস্যা জানান)</h2>
                  <p className="text-[11px] text-[#b0b3b8]">বাগ, অনুপযুক্ত কনটেন্ট বা পেমেন্ট সংক্রান্ত রিপোর্ট করুন</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {reportSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="font-bold text-sm text-white">রিপোর্ট সফলভাবে জমা হয়েছে!</h4>
                  <p className="text-xs text-[#b0b3b8]">আমাদের হালাল মডারেশন ও টেকনিক্যাল টিম দ্রুত ব্যবস্থা নেবে। জাযাকাল্লাহু খাইরান।</p>
                  <button
                    type="button"
                    onClick={() => {
                      setReportSubmitted(false);
                      setReportDescription('');
                    }}
                    className="mt-2 px-4 py-1.5 rounded-lg bg-[#3a3b3c] text-white text-xs font-bold cursor-pointer"
                  >
                    আরেকটি রিপোর্ট করুন
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!reportDescription.trim()) return;
                    setReportSubmitted(true);
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-bold text-white mb-1">সমস্যার ধরন (Category)</label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="Non-Halal Content">Non-Halal / Haram Content</option>
                      <option value="Technical Bug">App Bug / Crash</option>
                      <option value="Payment Issue">Orders / bKash / Nagad Issue</option>
                      <option value="Account Safety">Account / Privacy Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white mb-1">বিস্তারিত বিবরণ (Description)</label>
                    <textarea
                      rows={4}
                      required
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="আপনার সমস্যার বিস্তারিত এখানে লিখুন..."
                      className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl p-3 text-xs text-white outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs cursor-pointer"
                  >
                    রিপোর্ট পাঠান (Submit Report)
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 22. ABOUT PEACE WORLD */}
        {/* ======================================================== */}
        {modalType === 'about_peace_world' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0866FF] text-white flex items-center justify-center font-black">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">About Peace World</h2>
                  <p className="text-[11px] text-[#b0b3b8]">সংস্করণ, শরিয়াহ নীতিমালা ও প্রাইভেসি পলিসি</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-4 rounded-2xl bg-[#18191a] border border-emerald-500/30 space-y-1.5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#0866FF] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md lowercase">
                  p
                </div>
                <h3 className="font-bold text-sm text-white pt-1">Peace World / Peaceverse24</h3>
                <p className="text-xs text-emerald-400 font-semibold">v1.0 Global Launch • 100% Halal Social Platform</p>
                <p className="text-[11px] text-[#b0b3b8]">উম্মাহর জন্য নিরাপদ, বিজ্ঞাপন-শুদ্ধ ও কল্যাণকর সামাজিক যোগাযোগ মাধ্যম।</p>
              </div>

              <div className="space-y-2">
                {onOpenLegalTab && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLegalTab('terms');
                      }}
                      className="w-full p-3 rounded-xl bg-[#18191a] hover:bg-[#2f3031] border border-[#393a3b] text-left text-xs font-bold text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>Terms of Service (ব্যবহারের শর্তাবলি)</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#b0b3b8]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLegalTab('privacy');
                      }}
                      className="w-full p-3 rounded-xl bg-[#18191a] hover:bg-[#2f3031] border border-[#393a3b] text-left text-xs font-bold text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>Privacy Policy (হালাল প্রাইভেসি পলিসি)</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#b0b3b8]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLegalTab('about');
                      }}
                      className="w-full p-3 rounded-xl bg-[#18191a] hover:bg-[#2f3031] border border-[#393a3b] text-left text-xs font-bold text-white flex items-center justify-between cursor-pointer"
                    >
                      <span>About Peace World & Halal Charter</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#b0b3b8]" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 23. PUBLIC PRESENCE */}
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
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
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
        {/* 24. PEACEVERSE PLUS */}
        {/* ======================================================== */}
        {modalType === 'peace_plus' && (
          <>
            <div className="flex items-center justify-between p-4 border-b border-[#393a3b] bg-gradient-to-r from-blue-700/40 via-indigo-700/30 to-[#242526]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Peaceverse Plus (পিসভার্স প্লাস)</h2>
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
                  <span>পিসভার্স প্লাস মেম্বারশিপের সুবিধাসমূহ:</span>
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
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1877F2]/20 to-[#242526] border border-[#1877F2]/40 flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#b0b3b8]">মাসিক সাবস্ক্রিপশন</p>
                  <p className="text-lg font-black text-white">৪৯৯ ৳ / মাস</p>
                </div>
                <button
                  onClick={() => setIsPlusSubscribed(!isPlusSubscribed)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>

      {/* WhatsApp Connect & Verify OTP Nested Modal */}
      {showWhatsappConnectModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowWhatsappConnectModal(false)}
        >
          <div
            className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#393a3b] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Connect WhatsApp</h3>
                  <p className="text-[11px] text-[#b0b3b8]">হোয়াটসঅ্যাপ নম্বর ও OTP যাচাই করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsappConnectModal(false)}
                className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {waError && (
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                {waError}
              </div>
            )}

            {waStep === 'phone' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Enter WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={waPhoneInput}
                    onChange={(e) => {
                      setWaPhoneInput(e.target.value);
                      setWaError(null);
                    }}
                    placeholder="+880 17XXXXXXXX"
                    className="w-full rounded-xl bg-[#18191a] border border-[#393a3b] focus:border-[#25D366] px-3.5 py-2.5 text-sm text-white placeholder-[#8a8d91] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const digits = waPhoneInput.replace(/\D/g, '');
                    if (digits.length < 8) {
                      setWaError('অনুগ্রহ করে একটি সঠিক হোয়াটসঅ্যাপ নম্বর দিন (যেমন: +88017XXXXXXXX)');
                      return;
                    }
                    const code = String(Math.floor(100000 + Math.random() * 900000));
                    setWaGeneratedOtp(code);
                    setWaOtpCode('');
                    setWaError(null);
                    setWaStep('otp');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs shadow transition-colors cursor-pointer"
                >
                  Verify OTP
                </button>
              </div>
            )}

            {waStep === 'otp' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                  <p className="font-semibold">
                    OTP পাঠানো হয়েছে: <span className="text-white">{waPhoneInput}</span>
                  </p>
                  <p className="text-[11px] text-emerald-300">
                    আপনার ৬-ডিজিটের OTP কোড: <span className="font-mono font-black text-white">{waGeneratedOtp}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white mb-1.5">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={waOtpCode}
                    onChange={(e) => {
                      setWaOtpCode(e.target.value.replace(/\D/g, ''));
                      setWaError(null);
                    }}
                    placeholder="6-digit OTP"
                    className="w-full rounded-xl bg-[#18191a] border border-[#393a3b] focus:border-[#0866FF] px-3.5 py-2.5 text-center font-mono tracking-widest text-base text-white placeholder-[#8a8d91] outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWaStep('phone')}
                    className="px-3.5 py-2.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-white text-xs font-bold cursor-pointer"
                  >
                    নম্বর বদলান
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (waOtpCode.trim() !== waGeneratedOtp) {
                        setWaError(`সঠিক OTP কোড লিখুন (${waGeneratedOtp})`);
                        return;
                      }
                      const cleanPhone = waPhoneInput.trim();
                      if (userProfile && onUpdateProfile) {
                        onUpdateProfile({
                          ...userProfile,
                          whatsapp: cleanPhone,
                        });
                      }
                      setWaError(null);
                      setWaStep('verified');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs shadow transition-colors cursor-pointer"
                  >
                    Verify OTP
                  </button>
                </div>
              </div>
            )}

            {waStep === 'verified' && (
              <div className="py-3 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-emerald-400">যুক্ত করা হয়েছে ✓</p>
                  <p className="text-xs text-[#b0b3b8]">{waPhoneInput} সফলভাবে আপনার অ্যাকাউন্টে সংযুক্ত হয়েছে।</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWhatsappConnectModal(false)}
                  className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs cursor-pointer"
                >
                  সম্পন্ন (Done)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
