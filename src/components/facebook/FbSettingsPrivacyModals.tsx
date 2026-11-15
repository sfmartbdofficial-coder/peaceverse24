import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Clock,
  Smartphone,
  CreditCard,
  Link,
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
  Loader2,
  ShoppingBag,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { LegalTabType } from '../legal/LegalModal';
import { PeaceSettingsPrefs } from '../../utils/settingsStorage';
import { normalizePhoneNumber, getWhatsAppUrl } from '../../utils/contactLinks';
import { enableWebPushNotifications, triggerDevicePushTray } from '../../lib/fcm';
import { getActivePrayerPauseStatus } from '../../lib/globalPrayer';
import { FbPrivacyCenterView } from './FbPrivacyCenterView';
import {
  fetchUserLinkHistory,
  clearUserLinkHistory,
  fetchUserActivityLog,
  clearUserActivityLog,
  fetchUserOrders,
  fetchUserDeviceSessions,
  clearOtherUserDeviceSessions,
  fetchUserPublicPresenceStats,
  saveUserProfileToFirestore,
  logUserActivity,
  UserLinkHistoryItem,
  UserActivityLogItem,
  UserOrderRecord,
  UserDeviceSession,
} from '../../lib/firebase';

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
  onSavePrivacyDefault?: (privacy: 'public' | 'friends' | 'private') => void;
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
      checked ? activeColor : 'bg-[#CED0D4]'
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
  onSavePrivacyDefault,
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

  // Device Requests (real Firestore sessions only)
  const [devices, setDevices] = useState<UserDeviceSession[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [loggedOutAll, setLoggedOutAll] = useState(false);

  // Activity Log (real Firestore activity only)
  const [activityItems, setActivityItems] = useState<UserActivityLogItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Link History (real Firestore link visits only)
  const [links, setLinks] = useState<UserLinkHistoryItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  // Orders & Payments (real Firestore orders + user-saved numbers)
  const [orders, setOrders] = useState<UserOrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [bkashInput, setBkashInput] = useState(prefs.bkashNumber);
  const [nagadInput, setNagadInput] = useState(prefs.nagadNumber);
  const [paymentSavedMsg, setPaymentSavedMsg] = useState<string | null>(null);

  // Mobile Center real-time carrier/SIM check state
  const [mobileChecking, setMobileChecking] = useState(false);
  const [mobileStatus, setMobileStatus] = useState<{
    simDetected: boolean;
    operator: string | null;
    dataBalance: string | null;
    expiry: string | null;
    freeModeAvailable: boolean;
    message: string;
  } | null>(null);

  // Public Presence real stats
  const [presenceStats, setPresenceStats] = useState<{ followersCount: number; postsCount: number }>({
    followersCount: 0,
    postsCount: 0,
  });

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
  const [waPhoneInput, setWaPhoneInput] = useState(userProfile?.whatsapp || '');
  const [waOtpCode, setWaOtpCode] = useState('');
  const [waGeneratedOtp, setWaGeneratedOtp] = useState('482910');
  const [waError, setWaError] = useState<string | null>(null);

  const checkMobileCenterStatus = async () => {
    setMobileChecking(true);
    try {
      const uidParam = userProfile?.id ? `?uid=${encodeURIComponent(userProfile.id)}` : '';
      const res = await fetch(`/api/mobile-center/status${uidParam}`);
      if (res.ok) {
        const data = await res.json();
        setMobileStatus({
          simDetected: Boolean(data.simDetected),
          operator: data.operator || null,
          dataBalance: data.dataBalance || null,
          expiry: data.expiry || null,
          freeModeAvailable: Boolean(data.freeModeAvailable),
          message: data.message || 'সিম কার্ড পাওয়া যায়নি',
        });
      } else {
        setMobileStatus({
          simDetected: false,
          operator: null,
          dataBalance: null,
          expiry: null,
          freeModeAvailable: false,
          message: 'সিম কার্ড পাওয়া যায়নি',
        });
      }
    } catch {
      setMobileStatus({
        simDetected: false,
        operator: null,
        dataBalance: null,
        expiry: null,
        freeModeAvailable: false,
        message: 'সিম কার্ড পাওয়া যায়নি',
      });
    } finally {
      setMobileChecking(false);
    }
  };

  // Sync inputs & fetch real data whenever modal opens
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
      setBkashInput(prefs.bkashNumber || '');
      setNagadInput(prefs.nagadNumber || '');
      setShowPaymentForm(Boolean(prefs.bkashNumber || prefs.nagadNumber));
      setPaymentSavedMsg(null);
      setOrdersLoading(true);
      fetchUserOrders(userProfile?.id)
        .then((rows) => setOrders(rows))
        .finally(() => setOrdersLoading(false));
    }
    if (modalType === 'link_history') {
      setLinksLoading(true);
      fetchUserLinkHistory(userProfile?.id)
        .then((rows) => setLinks(rows))
        .finally(() => setLinksLoading(false));
    }
    if (modalType === 'activity_log' || modalType === 'ad_activity') {
      setActivityLoading(true);
      fetchUserActivityLog(userProfile?.id)
        .then((rows) => setActivityItems(rows))
        .finally(() => setActivityLoading(false));
    }
    if (modalType === 'device_requests') {
      setLoggedOutAll(false);
      setDevicesLoading(true);
      fetchUserDeviceSessions(userProfile?.id)
        .then((rows) => setDevices(rows))
        .finally(() => setDevicesLoading(false));
    }
    if (modalType === 'mobile_center') {
      checkMobileCenterStatus();
    }
    if (modalType === 'public_presence') {
      fetchUserPublicPresenceStats(userProfile?.id).then((stats) => setPresenceStats(stats));
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
  const [isProModeActive, setIsProModeActive] = useState(false);
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
    saveUserProfileToFirestore(updated);
    logUserActivity(userProfile.id, 'Profile', 'যোগাযোগের তথ্য আপডেট করেছেন');
    setContactSavedNotice(true);
    setTimeout(() => setContactSavedNotice(false), 3000);
  };

  if (!modalType) return null;

  if (modalType === 'privacy_center') {
    return (
      <FbPrivacyCenterView
        onClose={onClose}
        defaultAudience={defaultAudience}
        onChangeDefaultAudience={(aud) => {
          setDefaultAudience(aud);
          onSavePrivacyDefault?.(aud);
        }}
        isProfileLocked={isProfileLocked}
        onToggleProfileLock={handleToggleProfileLock}
        lockToast={lockToast}
        onOpenLegalTab={onOpenLegalTab}
      />
    );
  }

  if (modalType === 'time_management') {
    const status = getActivePrayerPauseStatus(prefs.prayerPauseMinutes);
    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
        <div className="bg-white border border-[#E4E6EB] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#050505]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#E4E6EB] bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#050505]">
                  Time Management (সময় ব্যবস্থাপনা)
                </h2>
                <p className="text-[11px] text-[#65676B]">দৈনিক ব্যবহার ও নামাজের রিমাইন্ডার</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-[#050505] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
            <div className="p-3.5 rounded-2xl bg-white border border-[#E4E6EB] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-[#65676B] uppercase">
                  গড় দৈনিক সময় (Daily Screen Time)
                </h4>
                <span className="text-xs font-black text-[#65676B]">০ মিনিট / দিন</span>
              </div>
              <div className="flex items-end justify-between h-16 pt-2 px-2 border-b border-[#E4E6EB]">
                {['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'].map((d) => (
                  <div key={d} className="flex flex-col items-center gap-1">
                    <div className="w-6 bg-[#E4E6EB] rounded-t-md h-1.5" />
                    <span className="text-[9px] text-[#65676B] font-medium">{d}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[#65676B] text-center">
                এখনো কোনো স্ক্রিন টাইম ডেটা রেকর্ড হয়নি
              </p>
            </div>

            {/* Salah Reminder Toggle */}
            <div className="p-3.5 rounded-2xl bg-white border border-emerald-500/40 flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-[#050505] flex items-center gap-1.5">
                  <span>🕌 Salah Reminder (নামাজের রিমাইন্ডার)</span>
                </h4>
                <p className="text-xs text-[#65676B]">
                  ৫ ওয়াক্ত নামাজের ১০ মিনিট আগে আযান ও নামাজের স্মরণ বার্তা পান
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.salahReminder}
                onClick={() => onUpdatePrefs({ salahReminder: !prefs.salahReminder })}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 cursor-pointer ${
                  prefs.salahReminder ? 'bg-emerald-600' : 'bg-[#CED0D4]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    prefs.salahReminder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Quiet Mode during Salah */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#E4E6EB] flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-[#050505]">
                  নামাজের ওয়াক্তে কুয়েট মোড (Quiet Mode)
                </h4>
                <p className="text-xs text-[#65676B]">
                  ৫ ওয়াক্ত নামাজের সময় নোটিফিকেশন স্বয়ংক্রিয়ভাবে নীরব থাকবে
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.quietModeSalah}
                onClick={() =>
                  onUpdatePrefs({
                    quietModeSalah: !prefs.quietModeSalah,
                    prayerTimePause: !prefs.quietModeSalah,
                  })
                }
                className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 cursor-pointer ${
                  prefs.quietModeSalah ? 'bg-[#0866FF]' : 'bg-[#CED0D4]'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    prefs.quietModeSalah ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Prayer Pause Status Row */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
              <span>
                {status.paused
                  ? `🕌 Active Salah Pause: ${status.prayerName} (until ${status.untilTime})`
                  : `📍 ${status.schedule.city}: Next ${status.schedule.nextPrayer.name} at ${status.schedule.nextPrayer.time}`}
              </span>
              <span className="font-bold text-emerald-700 shrink-0">
                {prefs.prayerTimePause || prefs.quietModeSalah ? 'Saved ON' : 'OFF'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-[#E4E6EB] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#050505]">Daily Time Reminder Limit</span>
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

          {/* Footer */}
          <div className="p-3 border-t border-[#E4E6EB] bg-white text-center">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shellCls = 'bg-white border-[#E4E6EB] text-black';
  const borderCls = 'border-[#E4E6EB]';
  const cardCls = 'bg-white border border-[#E4E6EB]';
  const textPrimary = 'text-black';
  const textSecondary = 'text-[#65676B]';
  const closeBtnCls =
    'p-1.5 rounded-full hover:bg-[#F0F2F5] text-[#65676B] hover:text-black transition-colors cursor-pointer';
  const inputDarkCls =
    'bg-white border border-[#CED0D4] text-black placeholder-[#65676B]';
  const inputCardCls =
    'bg-white border border-[#E4E6EB] text-black placeholder-[#65676B]';
  const secondaryBtnCls =
    'bg-[#E4E6EB] hover:bg-[#D8DADF] text-black';
  const footerCls = 'p-3 border-t border-[#E4E6EB] bg-white text-center';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className={`${shellCls} border rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl transition-colors duration-200`}>

        {/* ======================================================== */}
        {/* 1. ACCOUNT SETTINGS */}
        {/* ======================================================== */}
        {modalType === 'settings' && (
          <>
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#F0F2F5] text-black">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Settings (সেটিংস)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>অ্যাকাউন্ট ও ব্যক্তিগত তথ্যাদি</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className={`p-3.5 rounded-2xl ${cardCls} space-y-2`}>
                <h4 className={`font-bold text-sm ${textPrimary}`}>ব্যক্তিগত ও অ্যাকাউন্ট তথ্য</h4>
                <p className={`text-xs ${textSecondary}`}>নাম: <span className={`${textPrimary} font-semibold`}>{userProfile?.name || 'ব্যবহারকারী'}</span></p>
                <p className={`text-xs ${textSecondary}`}>ইমেইল: <span className={`${textPrimary} font-semibold`}>{userProfile?.email || 'যুক্ত করা হয়নি'}</span></p>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <p className={`text-xs ${textSecondary}`}>
                    WhatsApp:{' '}
                    {userProfile?.whatsapp ? (
                      <span className="text-emerald-600 font-bold">
                        যুক্ত করা হয়েছে ✓ ({userProfile.whatsapp})
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setWaPhoneInput(userProfile?.whatsapp || '');
                          setWaOtpCode('');
                          setWaError(null);
                          setWaStep('phone');
                          setShowWhatsappConnectModal(true);
                        }}
                        className="text-rose-600 hover:text-rose-500 font-bold underline decoration-dotted cursor-pointer transition-colors"
                      >
                        যুক্ত করা হয়নি
                      </button>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setWaPhoneInput(userProfile?.whatsapp || '');
                      setWaOtpCode('');
                      setWaError(null);
                      setWaStep('phone');
                      setShowWhatsappConnectModal(true);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                      userProfile?.whatsapp
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-[#0866FF] hover:bg-[#1877F2] text-white'
                    }`}
                  >
                    {userProfile?.whatsapp ? 'পরিবর্তন করুন' : 'যুক্ত করুন'}
                  </button>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>টু-ফ্যাক্টর অথেনটিকেশন (2FA)</h4>
                  <p className={`text-xs ${textSecondary}`}>অ্যাকাউন্টের অতিরিক্ত নিরাপত্তা সুরক্ষা</p>
                </div>
                <ToggleSwitch
                  checked={prefs.twoFactorEnabled}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ twoFactorEnabled: val })}
                />
              </div>

              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>নামাজের ওয়াক্ত রিমাইন্ডার (Salah Reminder)</h4>
                  <p className={`text-xs ${textSecondary}`}>প্রতি ওয়াক্তের আগে নামাজের স্মরণ বার্তা</p>
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
        {/* 4. DEVICE REQUESTS */}
        {/* ======================================================== */}
        {modalType === 'device_requests' && (
          <>
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Device Requests (ডিভাইস সেশন)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>আপনার অ্যাকাউন্টে লগইন থাকা ডিভাইসসমূহ</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {devicesLoading ? (
                <div className={`text-center py-10 space-y-2 ${textSecondary}`}>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0866FF]" />
                  <p className="text-xs">ডিভাইস সেশন চেক করা হচ্ছে...</p>
                </div>
              ) : devices.length > 0 ? (
                <>
                  {devices.map((d) => (
                    <div key={d.id} className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between`}>
                      <div>
                        <p className={`font-bold text-xs ${textPrimary} flex items-center gap-1.5`}>
                          <span>{d.device}</span>
                          {d.isCurrent && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded font-bold">
                              বর্তমান ডিভাইস
                            </span>
                          )}
                        </p>
                        <p className={`text-[11px] ${textSecondary}`}>{d.location} • {d.time}</p>
                      </div>
                    </div>
                  ))}

                  {devices.some((d) => !d.isCurrent) && (
                    <button
                      onClick={async () => {
                        await clearOtherUserDeviceSessions(userProfile?.id);
                        setDevices((prev) => prev.filter((d) => d.isCurrent));
                        setLoggedOutAll(true);
                      }}
                      className="w-full mt-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-colors cursor-pointer"
                    >
                      {loggedOutAll ? 'অন্যান্য সব ডিভাইস থেকে লগআউট সম্পন্ন ✓' : 'অন্যান্য সব ডিভাইস থেকে লগআউট করুন'}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-10 space-y-2.5">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-[#F0F2F5] text-[#65676B]">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <p className={`font-bold text-sm ${textPrimary}`}>কোনো ডিভাইস সেশন পাওয়া যায়নি</p>
                  <p className={`text-xs ${textSecondary}`}>নতুন ডিভাইস থেকে লগইন করলে এখানে সেশন দেখাবে</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 5. YOUR ACTIVITY LOG (Replaced Ad Activity) */}
        {/* ======================================================== */}
        {(modalType === 'activity_log' || modalType === 'ad_activity') && (
          <>
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Your Activity Log (অ্যাক্টিভিটি লগ)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>আপনার পোস্ট, রিঅ্যাকশন ও অ্যাক্টিভিটি হিস্ট্রি</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activityLoading ? (
                <div className={`text-center py-10 space-y-2 ${textSecondary}`}>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0866FF]" />
                  <p className="text-xs">অ্যাক্টিভিটি লোড হচ্ছে...</p>
                </div>
              ) : activityItems.length > 0 ? (
                <>
                  {activityItems.map((act) => (
                    <div key={act.id} className={`p-3 rounded-2xl ${cardCls} space-y-1`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-emerald-600">{act.category}</span>
                        <span className="text-[10px] text-[#8a8d91]">{act.time}</span>
                      </div>
                      <p className={`text-xs ${textPrimary} font-medium`}>{act.text}</p>
                    </div>
                  ))}
                  <button
                    onClick={async () => {
                      await clearUserActivityLog(userProfile?.id);
                      setActivityItems([]);
                    }}
                    className={`w-full py-2.5 rounded-xl ${secondaryBtnCls} hover:bg-rose-600 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>অ্যাক্টিভিটি লগ মুছে ফেলুন (Clear Activity)</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-10 space-y-2.5">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-[#F0F2F5] text-[#65676B]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <p className={`font-bold text-sm ${textPrimary}`}>কোনো অ্যাক্টিভিটি নেই (No activity yet)</p>
                  <p className={`text-xs ${textSecondary}`}>আপনি পোস্ট, রিয়্যাকশন করলে এখানে দেখাবে</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 6. ORDERS AND PAYMENTS (With bKash & Nagad) */}
        {/* ======================================================== */}
        {modalType === 'orders_payments' && (
          <>
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Orders & Payments (bKash / Nagad)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>মার্কেটপ্লেস অর্ডার ও মোবাইল ব্যাংকিং পেমেন্ট মেথড</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {ordersLoading ? (
                <div className={`p-5 rounded-2xl ${cardCls} text-center space-y-2`}>
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#0866FF]" />
                  <p className={`text-xs ${textSecondary}`}>অর্ডার তথ্য লোড হচ্ছে...</p>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-2.5">
                  {orders.map((ord) => (
                    <div key={ord.id} className={`p-3.5 rounded-2xl ${cardCls} space-y-1.5`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${textPrimary}`}>{ord.shopName || `অর্ডার #${ord.id.slice(-4)}`}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                          {ord.status}
                        </span>
                      </div>
                      <p className={`text-xs ${textSecondary}`}>{ord.itemsSummary}</p>
                      <p className="text-xs font-bold text-emerald-600">৳ {ord.amount} • {ord.paymentMethod}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-5 rounded-2xl ${cardCls} text-center space-y-2`}>
                  <div className="w-11 h-11 rounded-full mx-auto flex items-center justify-center bg-[#F0F2F5] text-[#65676B]">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <p className={`text-sm font-bold ${textPrimary}`}>কোনো অর্ডার নেই</p>
                  <p className={`text-xs ${textSecondary}`}>আপনি এখনো কোনো পণ্য অর্ডার করেননি।</p>
                </div>
              )}

              <div className={`p-3.5 rounded-2xl ${cardCls} space-y-3`}>
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`font-bold text-xs ${textSecondary} uppercase`}>পেমেন্ট মেথড (bKash & Nagad)</h4>
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#0866FF] hover:bg-[#1877F2] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add bKash/Nagad Number</span>
                  </button>
                </div>

                {(showPaymentForm || bkashInput || nagadInput) && (
                  <>
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="text-[11px] font-bold flex items-center justify-between mb-1 text-pink-600">
                          <span>bKash (বিকাশ) নম্বর</span>
                          {prefs.defaultPaymentMethod === 'bkash' && bkashInput.trim() && (
                            <span className="text-[10px] text-emerald-600">✓ ডিফল্ট</span>
                          )}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            value={bkashInput}
                            onChange={(e) => setBkashInput(e.target.value)}
                            placeholder="আপনার bKash নম্বর লিখুন"
                            className={`flex-1 ${inputDarkCls} rounded-lg px-3 py-2 text-xs outline-none focus:border-pink-500`}
                          />
                          <button
                            type="button"
                            onClick={() => onUpdatePrefs({ defaultPaymentMethod: 'bkash' })}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                              prefs.defaultPaymentMethod === 'bkash' ? 'bg-pink-600 text-white' : secondaryBtnCls
                            }`}
                          >
                            Default
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold flex items-center justify-between mb-1 text-orange-600">
                          <span>Nagad (নগদ) নম্বর</span>
                          {prefs.defaultPaymentMethod === 'nagad' && nagadInput.trim() && (
                            <span className="text-[10px] text-emerald-600">✓ ডিফল্ট</span>
                          )}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            value={nagadInput}
                            onChange={(e) => setNagadInput(e.target.value)}
                            placeholder="আপনার Nagad নম্বর লিখুন"
                            className={`flex-1 ${inputDarkCls} rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-500`}
                          />
                          <button
                            type="button"
                            onClick={() => onUpdatePrefs({ defaultPaymentMethod: 'nagad' })}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer ${
                              prefs.defaultPaymentMethod === 'nagad' ? 'bg-orange-600 text-white' : secondaryBtnCls
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
                  </>
                )}

                {paymentSavedMsg && (
                  <p className="text-xs font-semibold text-center text-emerald-600">{paymentSavedMsg}</p>
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Link className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Link History (লিংক হিস্ট্রি)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>আপনার ভিজিট করা সকল লিংকের তালিকা</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {linksLoading ? (
                <div className={`text-center py-10 space-y-2 ${textSecondary}`}>
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0866FF]" />
                  <p className="text-xs">লিংক হিস্ট্রি লোড হচ্ছে...</p>
                </div>
              ) : links.length > 0 ? (
                <>
                  {links.map((l) => (
                    <div key={l.id} className={`p-3 rounded-2xl ${cardCls} space-y-1`}>
                      <p className={`font-bold text-xs ${textPrimary}`}>{l.title}</p>
                      <p className="text-[11px] text-[#1877F2] truncate">{l.url}</p>
                      <p className="text-[10px] text-[#8a8d91]">{l.time}</p>
                    </div>
                  ))}
                  <button
                    onClick={async () => {
                      await clearUserLinkHistory(userProfile?.id);
                      setLinks([]);
                    }}
                    className={`w-full py-2.5 rounded-xl ${secondaryBtnCls} hover:bg-rose-600 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>সকল লিংক হিস্ট্রি মুছে ফেলুন (Clear History)</span>
                  </button>
                </>
              ) : (
                <div className="text-center py-10 space-y-2.5">
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-[#F0F2F5] text-[#65676B]">
                    <Link className="w-6 h-6" />
                  </div>
                  <p className={`font-bold text-sm ${textPrimary}`}>কোনো লিংক হিস্ট্রি নেই (No link history yet)</p>
                  <p className={`text-xs ${textSecondary}`}>আপনি যে লিংকে ভিজিট করবেন সেটা এখানে দেখাবে</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 9. APP ICON PICKER */}
        {/* ======================================================== */}
        {modalType === 'app_icon' && (
          <>
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>App Icon (অ্যাপ আইকন)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>আপনার পছন্দের হোম-স্ক্রিন আইকন বেছে নিন</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {[
                { id: 'classic', label: 'Classic Blue (ক্লাসিক সোশ্যাল)', bg: 'bg-[#1877F2]' },
                { id: 'emerald', label: 'Halal Emerald (ইসলামিক সবুজ)', bg: 'bg-emerald-600' },
                { id: 'gold', label: 'Kaaba Golden (স্বর্ণালি নূর)', bg: 'bg-amber-600' },
                { id: 'midnight', label: 'Deep Navy (প্রিমিয়াম ব্লু)', bg: 'bg-indigo-900' },
              ].map((icon) => (
                <div
                  key={icon.id}
                  onClick={() => onUpdatePrefs({ selectedAppIcon: icon.id as PeaceSettingsPrefs['selectedAppIcon'] })}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-colors ${
                    prefs.selectedAppIcon === icon.id
                      ? `bg-[#1877F2]/15 border-[#1877F2] ${textPrimary}`
                      : `${cardCls} ${textSecondary}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${icon.bg} flex items-center justify-center text-white font-black text-base shadow`}>
                      P
                    </div>
                    <div>
                      <p className={`font-bold text-xs ${textPrimary}`}>{icon.label}</p>
                      <p className="text-[10px] text-[#8a8d91]">Peaceverse24.com Icon</p>
                    </div>
                  </div>
                  {prefs.selectedAppIcon === icon.id && <Check className="w-4 h-4 text-emerald-600" />}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 10. MOBILE CENTER (REAL-TIME API CHECK) */}
        {/* ======================================================== */}
        {modalType === 'mobile_center' && (
          <>
            <div className={`flex items-center justify-between p-4 border-b ${borderCls} bg-gradient-to-r from-orange-50 to-white`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Mobile Center</h2>
                  <p className={`text-[11px] ${textSecondary}`}>রিয়েল-টাইম ইন্টারনেট ব্যালেন্স ও সিম স্ট্যাটাস</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mobileChecking ? (
                <div className={`p-6 rounded-2xl ${cardCls} text-center space-y-2.5`}>
                  <Loader2 className="w-7 h-7 animate-spin mx-auto text-orange-500" />
                  <p className={`text-sm font-bold ${textPrimary}`}>ডেটা চেক করা হচ্ছে...</p>
                  <p className={`text-xs ${textSecondary}`}>সিম অপারেটর ও ডেটা ব্যালেন্স যাচাই চলছে</p>
                </div>
              ) : mobileStatus?.simDetected ? (
                <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-orange-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${textSecondary}`}>সিম কার্ড স্ট্যাটাস</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
                      {mobileStatus.operator || 'Connected'}
                    </span>
                  </div>
                  <div className={`pt-2 border-t ${borderCls}`}>
                    <p className={`text-xs ${textSecondary}`}>অব্যবহৃত ডেটা ব্যালেন্স</p>
                    <p className={`text-xl font-black ${textPrimary}`}>
                      {mobileStatus.dataBalance || '0 MB'}{mobileStatus.expiry ? ` (${mobileStatus.expiry})` : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`p-6 rounded-2xl ${cardCls} text-center space-y-3`}>
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-[#F0F2F5] text-[#65676B]">
                    <Radio className="w-6 h-6" />
                  </div>
                  <p className={`text-sm font-bold ${textPrimary}`}>{mobileStatus?.message || 'সিম কার্ড পাওয়া যায়নি'}</p>
                  <p className={`text-xs ${textSecondary}`}>কোনো অপারেটর সিম বা ডেটা ব্যালেন্স শনাক্ত করা যায়নি।</p>
                  <button
                    type="button"
                    onClick={checkMobileCenterStatus}
                    className={`px-4 py-2 rounded-xl ${secondaryBtnCls} text-xs font-bold cursor-pointer`}
                  >
                    পুনরায় চেক করুন
                  </button>
                </div>
              )}

              <div className={`p-3.5 rounded-2xl ${cardCls} space-y-1 text-xs`}>
                <p className={`font-semibold ${textPrimary}`}>ফ্রি মোড (Free Mode)</p>
                <p className={textSecondary}>সিম অপারেটর অনুমোদিত হলে ব্যালেন্স ছাড়াই টেক্সট পোস্ট ও চ্যাট ব্যবহার করা যাবে।</p>
              </div>
            </div>
          </>
        )}

        {/* ======================================================== */}
        {/* 11. CELLULAR DATA USAGE */}
        {/* ======================================================== */}
        {modalType === 'cellular_data' && (
          <>
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Cellular Data Usage</h2>
                  <p className={`text-[11px] ${textSecondary}`}>ডেটা সেভার ও ভিডিও কোয়ালিটি সেটিংস</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <p className={`font-bold text-sm ${textPrimary}`}>ডেটা সেভার মোড (Data Saver)</p>
                  <p className={`text-xs ${textSecondary}`}>ভিডিও কোয়ালিটি কমিয়ে ৪০% পর্যন্ত ডেটা সাশ্রয় করে</p>
                </div>
                <ToggleSwitch
                  checked={prefs.dataSaver}
                  onChange={(val) => onUpdatePrefs({ dataSaver: val })}
                />
              </div>
              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <p className={`font-bold text-sm ${textPrimary}`}>অটোপ্লে ভিডিও (Wi-Fi Only)</p>
                  <p className={`text-xs ${textSecondary}`}>শুধুমাত্র Wi-Fi এ ভিডিও অটো-প্লে হবে</p>
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls} bg-gradient-to-r from-emerald-50 to-white`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Contact Info (যোগাযোগের তথ্য)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>WhatsApp, IMO, Viber, Email ও Website যুক্ত করুন</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveContactInfo} className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {/* WhatsApp */}
              <div className="space-y-1">
                <label className={`text-xs font-bold ${textPrimary} flex items-center justify-between`}>
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
                  placeholder="যেমন: +880 1XXX-XXXXXX"
                  className={`w-full ${inputCardCls} focus:border-[#25D366] rounded-xl px-3.5 py-2.5 text-xs outline-none`}
                />
              </div>

              {/* IMO */}
              <div className="space-y-1">
                <label className={`text-xs font-bold ${textPrimary} flex items-center gap-1.5`}>
                  <span className="w-5 h-5 rounded bg-[#0088CC]/20 text-[#38BDF8] flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  IMO Number
                </label>
                <input
                  type="tel"
                  value={contactImo}
                  onChange={(e) => setContactImo(e.target.value)}
                  placeholder="যেমন: +880 1XXX-XXXXXX"
                  className={`w-full ${inputCardCls} focus:border-[#38BDF8] rounded-xl px-3.5 py-2.5 text-xs outline-none`}
                />
              </div>

              {/* Viber */}
              <div className="space-y-1">
                <label className={`text-xs font-bold ${textPrimary} flex items-center gap-1.5`}>
                  <span className="w-5 h-5 rounded bg-[#7360F2]/20 text-[#A78BFA] flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  Viber Number
                </label>
                <input
                  type="tel"
                  value={contactViber}
                  onChange={(e) => setContactViber(e.target.value)}
                  placeholder="যেমন: +880 1XXX-XXXXXX"
                  className={`w-full ${inputCardCls} focus:border-[#A78BFA] rounded-xl px-3.5 py-2.5 text-xs outline-none`}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className={`text-xs font-bold ${textPrimary} flex items-center gap-1.5`}>
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
                  className={`w-full ${inputCardCls} focus:border-[#0866FF] rounded-xl px-3.5 py-2.5 text-xs outline-none`}
                />
              </div>

              {/* Website */}
              <div className="space-y-1">
                <label className={`text-xs font-bold ${textPrimary} flex items-center gap-1.5`}>
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
                  className={`w-full ${inputCardCls} focus:border-[#0866FF] rounded-xl px-3.5 py-2.5 text-xs outline-none`}
                />
              </div>

              {/* Messenger optional */}
              <div className="space-y-1">
                <label className={`text-xs font-bold ${textPrimary} flex items-center gap-1.5`}>
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
                  className={`w-full ${inputCardCls} focus:border-[#0084FF] rounded-xl px-3.5 py-2.5 text-xs outline-none`}
                />
              </div>

              {/* Privacy */}
              <div className={`p-3 rounded-2xl ${cardCls} space-y-2`}>
                <label className={`text-[11px] font-bold ${textSecondary} block`}>প্রাইভেসি (Who can see your contacts?)</label>
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
                            ? `bg-[#0866FF]/20 border-[#0866FF] ${textPrimary}`
                            : 'bg-white border-[#E4E6EB] text-[#65676B]'
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0084FF]/20 text-[#0866FF] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Peace Message Settings</h2>
                  <p className={`text-[11px] ${textSecondary}`}>মেসেজ প্রাইভেসি, রিকোয়েস্ট ও হালাল ফিল্টার</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              <div className={`p-3.5 rounded-2xl ${cardCls} space-y-2`}>
                <h4 className={`font-bold text-xs ${textSecondary} uppercase`}>কে আপনাকে মেসেজ পাঠাতে পারবে? (Who can message you)</h4>
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
                        ? `bg-[#0866FF]/20 border-[#0866FF] ${textPrimary}`
                        : 'bg-white border-[#E4E6EB] text-[#65676B]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {prefs.whoCanMessage === opt.id && <Check className="w-4 h-4 text-[#0866FF]" />}
                  </button>
                ))}
              </div>

              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>Message Requests (মেসেজ রিকোয়েস্ট)</h4>
                  <p className={`text-xs ${textSecondary}`}>অপরিচিতদের মেসেজ রিকোয়েস্ট ফোল্ডারে রাখুন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.messageRequestsEnabled}
                  onChange={(val) => onUpdatePrefs({ messageRequestsEnabled: val })}
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>Halal Message Filter</h4>
                  <p className={`text-xs ${textSecondary}`}>অশ্লীল শব্দ ও স্প্যাম লিংক স্বয়ংক্রিয়ভাবে ব্লক করুন</p>
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Peace Edits Settings</h2>
                  <p className={`text-[11px] ${textSecondary}`}>ভিডিও কোয়ালিটি, অটো হালাল চেক ও ওয়াটারমার্ক</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              <div className={`p-3.5 rounded-2xl ${cardCls} space-y-2`}>
                <h4 className={`font-bold text-xs ${textSecondary} uppercase`}>Default Video Export Quality</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['720p', '1080p', '4K'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => onUpdatePrefs({ editsDefaultQuality: q })}
                      className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                        prefs.editsDefaultQuality === q
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-[#E4E6EB] text-[#65676B]'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>Auto Halal Check</h4>
                  <p className={`text-xs ${textSecondary}`}>এক্সপোর্টের আগে হারাম মিউজিক অপসারণ ও নাশিদ ভেরিফাই করুন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.editsAutoHalalCheck}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ editsAutoHalalCheck: val })}
                />
              </div>

              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>No Watermark by Default</h4>
                  <p className={`text-xs ${textSecondary}`}>ওয়াটারমার্ক ছাড়াই হালাল ভিডিও ডাউনলোড</p>
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Business Suite Settings</h2>
                  <p className={`text-[11px] ${textSecondary}`}>শপ ভেরিফিকেশন ও অর্ডার নোটিফিকেশন</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>১০০% হালাল শপ ভেরিফিকেশন (Shop Verification)</h4>
                  <p className={`text-xs ${textSecondary}`}>Peace Mart Global ও আপনার পেজসমূহে Halal Certified Worldwide ব্যাজ দেখান</p>
                </div>
                <ToggleSwitch
                  checked={prefs.businessShopVerification}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ businessShopVerification: val })}
                />
              </div>

              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>অর্ডার নোটিফিকেশন (Order Notifications)</h4>
                  <p className={`text-xs ${textSecondary}`}>নতুন অর্ডার, বিকাশ/নগদ পেমেন্ট ও রিভিউয়ের তাৎক্ষণিক অ্যালার্ট</p>
                </div>
                <ToggleSwitch
                  checked={prefs.businessOrderNotifications}
                  onChange={(val) => onUpdatePrefs({ businessOrderNotifications: val })}
                />
              </div>

              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>WhatsApp অর্ডার সিঙ্ক</h4>
                  <p className={`text-xs ${textSecondary}`}>কাস্টমারের WhatsApp অর্ডার সরাসরি Business Inbox-এ যুক্ত করুন</p>
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls} bg-gradient-to-r from-blue-50 via-white to-emerald-50`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0866FF] text-white flex items-center justify-center shadow">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Notification Settings</h2>
                  <p className={`text-[11px] ${textSecondary}`}>ক্রিয়েটর ব্রডকাস্ট, পুশ ও সাউন্ড সেটিংস</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Web Push / Firebase FCM Activation */}
              <div className="p-4 rounded-2xl border border-emerald-500/30 space-y-2.5 bg-gradient-to-r from-emerald-50 to-[#F7F8FA]">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className={`font-bold text-sm ${textPrimary} flex items-center gap-1.5`}>
                      <Megaphone className="w-4 h-4 text-emerald-600" />
                      <span>Firebase Web Push (FCM)</span>
                    </h4>
                    <p className={`text-xs ${textSecondary}`}>
                      অ্যাপ বন্ধ থাকলেও ফোনে তাৎক্ষণিক পুশ নোটিফিকেশন পান
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      prefs.fcmPushSubscribed
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-800'
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
                          title: 'Peaceverse24.com Push সক্রিয় হয়েছে ✓',
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
                  <p className="text-[11px] font-semibold text-emerald-700">{pushStatusMsg}</p>
                )}
              </div>

              {/* User Receiver Preferences */}
              <div className="space-y-2.5">
                <p className={`text-[11px] font-bold uppercase tracking-wider ${textSecondary} px-1`}>
                  রিসিভার সেটিংস (To Receive Notifications)
                </p>

                <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                  <div>
                    <h4 className={`font-bold text-sm ${textPrimary}`}>Notify when my favorite Creator posts</h4>
                    <p className={`text-xs ${textSecondary}`}>ফলো করা ক্রিয়েটর নতুন পোস্ট বা ভিডিও দিলেই জানুন</p>
                  </div>
                  <ToggleSwitch
                    checked={prefs.notifyFavoriteCreator}
                    activeColor="bg-emerald-600"
                    onChange={(val) => onUpdatePrefs({ notifyFavoriteCreator: val })}
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-emerald-500/30 flex items-center justify-between gap-3">
                  <div>
                    <h4 className={`font-bold text-sm ${textPrimary}`}>প্রিয় দাদার নতুন পোস্টের নোটিফিকেশন পেতে চাই</h4>
                    <p className={`text-xs ${textSecondary}`}>প্রিয় দাদা (Admin / Creator) ভিডিও, ছবি বা পণ্য আপলোড করলে তাৎক্ষণিক অ্যালার্ট</p>
                  </div>
                  <ToggleSwitch
                    checked={prefs.notifyPriyoDada}
                    activeColor="bg-emerald-600"
                    onChange={(val) => onUpdatePrefs({ notifyPriyoDada: val })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className={`p-3 rounded-2xl ${cardCls} flex items-center justify-between gap-2`}>
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#0866FF]" />
                      <span className={`text-xs font-bold ${textPrimary}`}>Sound</span>
                    </div>
                    <ToggleSwitch
                      checked={prefs.notifSound}
                      onChange={(val) => onUpdatePrefs({ notifSound: val })}
                    />
                  </div>

                  <div className={`p-3 rounded-2xl ${cardCls} flex items-center justify-between gap-2`}>
                    <div className="flex items-center gap-2">
                      <Vibrate className="w-4 h-4 text-purple-600" />
                      <span className={`text-xs font-bold ${textPrimary}`}>Vibration</span>
                    </div>
                    <ToggleSwitch
                      checked={prefs.notifVibration}
                      onChange={(val) => onUpdatePrefs({ notifVibration: val })}
                    />
                  </div>
                </div>
              </div>

              {/* Creator Broadcast Preferences */}
              <div className={`space-y-2.5 pt-2 border-t ${borderCls}`}>
                <p className="text-[11px] font-bold uppercase tracking-wider px-1 text-amber-600">
                  Creator Settings (ক্রিয়েটর / পেজ ব্রডকাস্ট)
                </p>

                <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                  <div>
                    <h4 className={`font-bold text-sm ${textPrimary}`}>Notify all followers when I post</h4>
                    <p className={`text-xs ${textSecondary}`}>ভিডিও, ছবি, প্রোডাক্ট বা পোস্ট আপলোড করলে সব ফলোয়ারকে জানান (Default OFF)</p>
                  </div>
                  <ToggleSwitch
                    checked={prefs.creatorNotifyFollowersOnPost}
                    activeColor="bg-[#0866FF]"
                    onChange={(val) => onUpdatePrefs({ creatorNotifyFollowersOnPost: val })}
                  />
                </div>

                <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                  <div>
                    <h4 className={`font-bold text-sm ${textPrimary}`}>Send Push Notification to all users</h4>
                    <p className={`text-xs ${textSecondary}`}>সকল ব্যবহারকারীর ফোনে ও বেল আইকনে তাৎক্ষণিক ব্রডকাস্ট পাঠান</p>
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls} bg-gradient-to-r from-emerald-50 to-white`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Halal Content Filter</h2>
                  <p className={`text-[11px] ${textSecondary}`}>হারাম কনটেন্ট, মিউজিক ও অশ্লীলতা স্বয়ংক্রিয়ভাবে ব্লক করুন</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-emerald-500/40 flex items-center justify-between gap-3">
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>Halal Content Filter (হালাল ফিল্টার)</h4>
                  <p className={`text-xs ${textSecondary}`}>ফিড ও রিলসে হারাম এবং শরিয়াহ-বিরোধী কনটেন্ট ব্লক করে</p>
                </div>
                <ToggleSwitch
                  checked={prefs.halalContentFilter}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ halalContentFilter: val })}
                />
              </div>

              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>বাদ্যযন্ত্র ও হারাম মিউজিক ব্লক করুন</h4>
                  <p className={`text-xs ${textSecondary}`}>শুধুমাত্র ভোকাল নাশিদ ও কুরআন তিলাওয়াত প্রদর্শন করুন</p>
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-500/20 text-teal-600 flex items-center justify-center">
                  <BellOff className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Prayer Time Pause (নামাজের বিরতি)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>নামাজের সময় সকল নোটিফিকেশন স্বয়ংক্রিয়ভাবে বিরতিতে থাকবে</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>Auto Pause During Salah</h4>
                  <p className={`text-xs ${textSecondary}`}>ফজর, যোহর, আসর, মাগরিব ও এশার সময় অটো পজ চালু রাখুন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.prayerTimePause}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ prayerTimePause: val })}
                />
              </div>

              <div className={`p-3.5 rounded-2xl ${cardCls} space-y-2`}>
                <h4 className={`font-bold text-xs ${textSecondary} uppercase`}>বিরতির সময়কাল (Pause Duration)</h4>
                <div className="grid grid-cols-3 gap-2">
                  {([15, 20, 30] as const).map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => onUpdatePrefs({ prayerPauseMinutes: mins })}
                      className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                        prefs.prayerPauseMinutes === mins
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                          : 'bg-white border-[#E4E6EB] text-[#65676B]'
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
                  <div className="p-3 rounded-2xl border border-emerald-500/30 text-xs space-y-1 bg-emerald-50 text-emerald-900">
                    <p className="font-bold text-emerald-700">
                      {status.paused
                        ? `🕌 Notifications Paused Now for ${status.prayerName} until ${status.untilTime}`
                        : `📍 ${status.schedule.city}: Next Pause at ${status.schedule.nextPrayer.name} (${status.schedule.nextPrayer.time})`}
                    </p>
                    <p className={`text-[11px] ${textSecondary}`}>
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Family Safety (পারিবারিক নিরাপত্তা)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>১৮+ কনটেন্ট ব্লক এবং সেফ সার্চ চালু রাখুন</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#F7F8FA] border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>Block 18+ Content (১৮+ কনটেন্ট ব্লক)</h4>
                  <p className={`text-xs ${textSecondary}`}>প্রাপ্তবয়স্ক ও অশালীন সকল ছবি/ভিডিও সম্পূর্ণ ব্লক থাকবে</p>
                </div>
                <ToggleSwitch
                  checked={prefs.familyBlock18Plus}
                  activeColor="bg-emerald-600"
                  onChange={(val) => onUpdatePrefs({ familyBlock18Plus: val })}
                />
              </div>

              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>Safe Search (সেফ সার্চ)</h4>
                  <p className={`text-xs ${textSecondary}`}>সার্চ রেজাল্ট থেকে ক্ষতিকর ও বিভ্রান্তিকর লিংক বাদ দিন</p>
                </div>
                <ToggleSwitch
                  checked={prefs.familySafeSearch}
                  onChange={(val) => onUpdatePrefs({ familySafeSearch: val })}
                />
              </div>

              <div className={`p-3.5 rounded-2xl ${cardCls} flex items-center justify-between gap-3`}>
                <div>
                  <h4 className={`font-bold text-sm ${textPrimary}`}>Kids-Safe Reels Mode</h4>
                  <p className={`text-xs ${textSecondary}`}>শিশু ও পরিবারের সবার সাথে দেখার উপযোগী রিলস</p>
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Blocked Users & Keywords</h2>
                  <p className={`text-[11px] ${textSecondary}`}>ব্লক করা ইউজার ও অবাঞ্ছিত শব্দ পরিচালনা করুন</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Blocked Users */}
              <div className={`p-3.5 rounded-2xl ${cardCls} space-y-2.5`}>
                <h4 className={`font-bold text-xs ${textPrimary}`}>Blocked Users ({prefs.blockedUsers.length})</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBlockedUser}
                    onChange={(e) => setNewBlockedUser(e.target.value)}
                    placeholder="ইউজারনেম লিখুন..."
                    className={`flex-1 ${inputDarkCls} rounded-lg px-3 py-1.5 text-xs outline-none`}
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
                  {prefs.blockedUsers.length > 0 ? (
                    prefs.blockedUsers.map((u) => (
                      <span
                        key={u}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${inputDarkCls} text-xs`}
                      >
                        <span>{u}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdatePrefs({ blockedUsers: prefs.blockedUsers.filter((x) => x !== u) })
                          }
                          className="text-rose-500 hover:text-rose-400 cursor-pointer"
                          title="Unblock"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className={`text-xs ${textSecondary}`}>কোনো ব্লক করা ইউজার নেই</p>
                  )}
                </div>
              </div>

              {/* Blocked Keywords */}
              <div className={`p-3.5 rounded-2xl ${cardCls} space-y-2.5`}>
                <h4 className={`font-bold text-xs ${textPrimary}`}>Blocked Keywords ({prefs.blockedKeywords.length})</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBlockedKeyword}
                    onChange={(e) => setNewBlockedKeyword(e.target.value)}
                    placeholder="যেমন: casino, spam..."
                    className={`flex-1 ${inputDarkCls} rounded-lg px-3 py-1.5 text-xs outline-none`}
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
                  {prefs.blockedKeywords.length > 0 ? (
                    prefs.blockedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs bg-white border-[#E4E6EB] text-amber-700"
                      >
                        <span>#{kw}</span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdatePrefs({ blockedKeywords: prefs.blockedKeywords.filter((x) => x !== kw) })
                          }
                          className="text-rose-500 hover:text-rose-400 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className={`text-xs ${textSecondary}`}>কোনো ব্লক করা কীওয়ার্ড নেই</p>
                  )}
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0866FF]/20 text-[#0866FF] flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Help Center (সাহায্য কেন্দ্র)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>প্রোফাইল, পেজ ও হালাল নিরাপত্তা বিষয়ক প্রশ্নোত্তর</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
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
                <div key={idx} className={`p-3.5 rounded-2xl ${cardCls} space-y-1`}>
                  <p className={`font-bold text-xs ${textPrimary}`}>{faq.q}</p>
                  <p className={`text-xs ${textSecondary} leading-relaxed`}>{faq.a}</p>
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Report a Problem (সমস্যা জানান)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>বাগ, অনুপযুক্ত কনটেন্ট বা পেমেন্ট সংক্রান্ত রিপোর্ট করুন</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {reportSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className={`font-bold text-sm ${textPrimary}`}>রিপোর্ট সফলভাবে জমা হয়েছে!</h4>
                  <p className={`text-xs ${textSecondary}`}>আমাদের হালাল মডারেশন ও টেকনিক্যাল টিম দ্রুত ব্যবস্থা নেবে। জাযাকাল্লাহু খাইরান।</p>
                  <button
                    type="button"
                    onClick={() => {
                      setReportSubmitted(false);
                      setReportDescription('');
                    }}
                    className={`mt-2 px-4 py-1.5 rounded-lg ${secondaryBtnCls} text-xs font-bold cursor-pointer`}
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
                    <label className={`block text-xs font-bold ${textPrimary} mb-1`}>সমস্যার ধরন (Category)</label>
                    <select
                      value={reportCategory}
                      onChange={(e) => setReportCategory(e.target.value)}
                      className={`w-full ${inputCardCls} rounded-xl px-3 py-2 text-xs outline-none`}
                    >
                      <option value="Non-Halal Content">Non-Halal / Haram Content</option>
                      <option value="Technical Bug">App Bug / Crash</option>
                      <option value="Payment Issue">Orders / bKash / Nagad Issue</option>
                      <option value="Account Safety">Account / Privacy Issue</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold ${textPrimary} mb-1`}>বিস্তারিত বিবরণ (Description)</label>
                    <textarea
                      rows={4}
                      required
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="আপনার সমস্যার বিস্তারিত এখানে লিখুন..."
                      className={`w-full ${inputCardCls} rounded-xl p-3 text-xs outline-none resize-none`}
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
        {/* 22. ABOUT PEACEVERSE24.COM */}
        {/* ======================================================== */}
        {modalType === 'about_peace_world' && (
          <>
            <div className={`flex items-center justify-between p-4 border-b ${borderCls}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#0866FF] text-white flex items-center justify-center font-black">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>About Peaceverse24.com</h2>
                  <p className={`text-[11px] ${textSecondary}`}>সংস্করণ, শরিয়াহ নীতিমালা ও প্রাইভেসি পলিসি</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-[#E4E6EB] space-y-1.5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#0866FF] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md lowercase">
                  p
                </div>
                <h3 className={`font-bold text-sm ${textPrimary} pt-1`}>Peaceverse24.com</h3>
                <p className="text-xs font-semibold text-emerald-600">Peaceverse24.com — Halal Alternative • 100% Halal Social Platform</p>
                <p className={`text-[11px] ${textSecondary}`}>উম্মাহর জন্য নিরাপদ, বিজ্ঞাপন-শুদ্ধ ও কল্যাণকর সামাজিক যোগাযোগ মাধ্যম।</p>
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
                      className={`w-full p-3 rounded-xl ${cardCls} hover:bg-[#F0F2F5] text-left text-xs font-bold ${textPrimary} flex items-center justify-between cursor-pointer`}
                    >
                      <span>Terms of Service (ব্যবহারের শর্তাবলি)</span>
                      <ExternalLink className={`w-3.5 h-3.5 ${textSecondary}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLegalTab('privacy');
                      }}
                      className={`w-full p-3 rounded-xl ${cardCls} hover:bg-[#F0F2F5] text-left text-xs font-bold ${textPrimary} flex items-center justify-between cursor-pointer`}
                    >
                      <span>Privacy Policy (হালাল প্রাইভেসি পলিসি)</span>
                      <ExternalLink className={`w-3.5 h-3.5 ${textSecondary}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLegalTab('about');
                      }}
                      className={`w-full p-3 rounded-xl ${cardCls} hover:bg-[#F0F2F5] text-left text-xs font-bold ${textPrimary} flex items-center justify-between cursor-pointer`}
                    >
                      <span>About Peaceverse24.com — Halal Alternative</span>
                      <ExternalLink className={`w-3.5 h-3.5 ${textSecondary}`} />
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls} bg-gradient-to-r from-purple-50 to-white`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Public Presence (প্রফেশনাল মোড)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>ক্রিয়েটর টুলস, ফলোয়ার ও মনিটাইজেশন এনাবল করুন</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className={`p-4 rounded-2xl ${cardCls} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-bold text-sm ${textPrimary}`}>প্রফেশনাল মোড স্ট্যাটাস</h3>
                    <p className={`text-xs ${textSecondary}`}>আপনার প্রোফাইল এখন ক্রিয়েটর হিসেবে দৃশ্যমান</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    {isProModeActive ? 'চালু আছে' : 'বন্ধ'}
                  </span>
                </div>

                <div className={`grid grid-cols-3 gap-2 pt-2 border-t ${borderCls} text-center`}>
                  <div className="p-2 rounded-xl bg-white border border-[#E4E6EB]">
                    <p className={`text-base font-black ${textPrimary}`}>{presenceStats.followersCount}</p>
                    <p className={`text-[10px] ${textSecondary}`}>মোট ফলোয়ার</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E4E6EB]">
                    <p className="text-base font-black text-emerald-600">{presenceStats.postsCount}</p>
                    <p className={`text-[10px] ${textSecondary}`}>মোট পোস্ট</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-[#E4E6EB]">
                    <p className="text-base font-black text-amber-600">
                      {presenceStats.followersCount >= 5000 ? 'যোগ্য' : 'অপেক্ষমাণ'}
                    </p>
                    <p className={`text-[10px] ${textSecondary}`}>মনিটাইজেশন</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsProModeActive(!isProModeActive)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  isProModeActive
                    ? secondaryBtnCls
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
            <div className={`flex items-center justify-between p-4 border-b ${borderCls} bg-gradient-to-r from-blue-50 via-indigo-50 to-white`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`font-bold text-base ${textPrimary}`}>Peaceverse24.com Plus (প্লাস)</h2>
                  <p className={`text-[11px] ${textSecondary}`}>ব্লু ভেরিফাইড ব্যাজ ও এক্সক্লুসিভ ফিচার আনলক করুন</p>
                </div>
              </div>
              <button onClick={onClose} className={closeBtnCls}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className={`p-4 rounded-2xl ${cardCls} space-y-3`}>
                <h3 className={`font-bold text-sm ${textPrimary} flex items-center gap-1.5`}>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Peaceverse24.com প্লাস মেম্বারশিপের সুবিধাসমূহ:</span>
                </h3>
                <div className={`space-y-2 text-xs ${textSecondary}`}>
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

              <div className="p-4 rounded-2xl border border-[#1877F2]/40 flex items-center justify-between bg-gradient-to-r from-blue-50 to-[#F7F8FA]">
                <div>
                  <p className={`text-xs ${textSecondary}`}>মাসিক সাবস্ক্রিপশন</p>
                  <p className={`text-lg font-black ${textPrimary}`}>৪৯৯ ৳ / মাস</p>
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
        <div className={footerCls}>
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
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowWhatsappConnectModal(false)}
        >
          <div
            className="bg-white border border-[#E4E6EB] rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between border-b ${borderCls} pb-3`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${textPrimary}`}>Connect WhatsApp</h3>
                  <p className={`text-[11px] ${textSecondary}`}>হোয়াটসঅ্যাপ নম্বর ও OTP যাচাই করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsappConnectModal(false)}
                className={closeBtnCls}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {waError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {waError}
              </div>
            )}

            {waStep === 'phone' && (
              <div className="space-y-3">
                <div>
                  <label className={`block text-xs font-bold ${textPrimary} mb-1.5`}>
                    Enter WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={waPhoneInput}
                    onChange={(e) => {
                      setWaPhoneInput(e.target.value);
                      setWaError(null);
                    }}
                    placeholder="যেমন: +880 1XXX-XXXXXX"
                    className={`w-full rounded-xl ${inputCardCls} focus:border-[#25D366] px-3.5 py-2.5 text-sm outline-none`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const digits = waPhoneInput.replace(/\D/g, '');
                    if (digits.length < 8) {
                      setWaError('অনুগ্রহ করে একটি সঠিক হোয়াটসঅ্যাপ নম্বর দিন (যেমন: +8801XXXXXXXXX)');
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
                <div className="p-3 rounded-xl border border-emerald-500/30 text-xs space-y-1 bg-emerald-50 text-emerald-900">
                  <p className="font-semibold">
                    OTP পাঠানো হয়েছে: <span className={textPrimary}>{waPhoneInput}</span>
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    আপনার ৬-ডিজিটের OTP কোড: <span className={`font-mono font-black ${textPrimary}`}>{waGeneratedOtp}</span>
                  </p>
                </div>

                <div>
                  <label className={`block text-xs font-bold ${textPrimary} mb-1.5`}>
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
                    className={`w-full rounded-xl ${inputCardCls} focus:border-[#0866FF] px-3.5 py-2.5 text-center font-mono tracking-widest text-base outline-none`}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setWaStep('phone')}
                    className={`px-3.5 py-2.5 rounded-xl ${secondaryBtnCls} text-xs font-bold cursor-pointer`}
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
                        const updated = {
                          ...userProfile,
                          whatsapp: cleanPhone,
                        };
                        onUpdateProfile(updated);
                        saveUserProfileToFirestore(updated);
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
                  <p className="text-sm font-extrabold text-emerald-500">যুক্ত করা হয়েছে ✓</p>
                  <p className={`text-xs ${textSecondary}`}>{waPhoneInput} সফলভাবে আপনার অ্যাকাউন্টে সংযুক্ত হয়েছে।</p>
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
