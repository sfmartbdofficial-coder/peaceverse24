import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Lock,
  BookOpen,
  Mail,
  Trash2,
  Globe,
  CheckCircle,
  ExternalLink,
  Printer,
  Copy,
  Info,
  AlertTriangle,
  Award,
  Send,
  Building,
  Heart
} from 'lucide-react';

export type LegalTabType = 'about' | 'privacy' | 'terms' | 'guidelines' | 'delete-account' | 'contact';

interface LegalModalProps {
  initialTab?: LegalTabType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  initialTab = 'about',
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
  const [copiedToast, setCopiedToast] = useState(false);

  // Account deletion form state
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteReason, setDeleteReason] = useState('ব্যক্তিগত বিরতি নিচ্ছি');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletionSuccess, setDeletionSuccess] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#${activeTab}`;
    navigator.clipboard.writeText(url);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleDeleteAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteConfirm) return;
    setDeletionSuccess(true);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMsg.trim()) return;
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white w-full max-w-4xl h-[92vh] rounded-3xl border border-[#E4E6EB] shadow-2xl flex flex-col overflow-hidden text-black">
        
        {/* Top Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-[#E4E6EB] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0866FF] to-emerald-500 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-black text-black">Peaceverse24.com</h2>
                <span className="text-[10px] font-bold bg-[#E7F3FF] text-[#0866FF] px-2 py-0.5 rounded-full border border-[#0866FF]/20">
                  Google Play & International Certified
                </span>
              </div>
              <p className="text-[11px] text-[#65676B]">আইনি নীতি, প্রাতিষ্ঠানিক তথ্য ও আন্তর্জাতিক নীতিমালা</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#F0F2F5] p-1 rounded-xl border border-[#E4E6EB]">
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'bn' ? 'bg-[#0866FF] text-white shadow-sm' : 'text-[#65676B] hover:text-black'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  language === 'en' ? 'bg-[#0866FF] text-white shadow-sm' : 'text-[#65676B] hover:text-black'
                }`}
              >
                English
              </button>
            </div>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black transition-colors cursor-pointer"
              title="এই পলিসির লিংক কপি করুন"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black transition-colors cursor-pointer"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-white border-b border-[#E4E6EB] overflow-x-auto no-scrollbar">
          {[
            { id: 'about', labelBn: 'আমাদের সম্পর্কে', labelEn: 'About Us', icon: Info },
            { id: 'privacy', labelBn: 'গোপনীয়তা নীতি (Play Store)', labelEn: 'Privacy Policy', icon: Lock },
            { id: 'terms', labelBn: 'ব্যবহারের শর্তাবলী', labelEn: 'Terms of Service', icon: FileText },
            { id: 'guidelines', labelBn: 'কমিউনিটি ও হালাল গাইডলাইন', labelEn: 'Community Guidelines', icon: BookOpen },
            { id: 'delete-account', labelBn: 'অ্যাকাউন্ট ডিলিট রিকোয়েস্ট', labelEn: 'Delete Account', icon: Trash2 },
            { id: 'contact', labelBn: 'যোগাযোগ ও সাপোর্ট', labelEn: 'Contact Us', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  window.location.hash = tab.id;
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0866FF] text-white shadow-sm'
                    : 'bg-[#F0F2F5] text-black hover:bg-[#E4E6EB] border border-[#E4E6EB]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 leading-relaxed text-xs sm:text-sm bg-white">
          
          {/* ========================================================= */}
          {/* 1. ABOUT US (আমাদের সম্পর্কে) */}
          {/* ========================================================= */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {language === 'bn' ? (
                <>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5">
                    <Award className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-black text-base">১০০% হালাল সোশ্যাল নেটওয়ার্ক ও প্ল্যাটফর্ম</h3>
                      <p className="text-xs text-[#65676B]">
                        উম্মাহর জন্য বাদ্যযন্ত্র, অশ্লীলতা ও অনৈতিকতামুক্ত নিরাপদ আন্তর্জাতিক ইসলামিক মিডিয়া।
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-black">১. আমাদের রূপকল্প ও মিশন (Vision & Mission)</h3>
                    <p className="text-[#65676B]">
                      Peaceverse24.com হলো একটি আন্তর্জাতিক ইসলামিক সোশ্যাল নেটওয়ার্ক এবং কনটেন্ট ডিস্ট্রিবিউশন প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো মুসলিম উম্মাহ এবং নৈতিক মূল্যবোধসম্পন্ন মানুষদের জন্য এমন একটি স্বয়ংসম্পূর্ণ সোশ্যাল অভিজ্ঞতা তৈরি করা যা সম্পূর্ণ শরীয়াহসম্মত, শালীন এবং আত্মিক প্রশান্তিদায়ক। আধুনিক সকল সুযোগ-সুবিধা বজায় রেখে অশ্লীল বিজ্ঞাপন, বাদ্যযন্ত্র এবং অশালীন কনটেন্ট থেকে সম্পূর্ণ মুক্ত থাকা আমাদের অঙ্গীকার।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 bg-white rounded-xl border border-[#E4E6EB] space-y-1">
                      <h4 className="font-bold text-emerald-700">✅ ১০০% হালাল ফিল্টার</h4>
                      <p className="text-xs text-[#65676B]">কৃত্রিম বুদ্ধিমত্তা ও স্কলার তদারকির মাধ্যমে অশ্লীলতামুক্ত ফিড।</p>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-[#E4E6EB] space-y-1">
                      <h4 className="font-bold text-[#0866FF]">🌍 গ্লোবাল রিচ</h4>
                      <p className="text-xs text-[#65676B]">বাংলাদেশ, মধ্যপ্রাচ্য, ইউরোপ ও আমেরিকাসহ ১৯০+ দেশের জন্য উন্মুক্ত।</p>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-[#E4E6EB] space-y-1">
                      <h4 className="font-bold text-amber-700">💰 হালাল মনিটাইজেশন</h4>
                      <p className="text-xs text-[#65676B]">ইসলামিক ক্রিয়েটরদের জন্য ন্যায্য ৫৫% বিজ্ঞাপন রাজস্ব বণ্টন ও ক্যাশআউট।</p>
                    </div>
                    <div className="p-3.5 bg-white rounded-xl border border-[#E4E6EB] space-y-1">
                      <h4 className="font-bold text-purple-700">📱 গুগল প্লে স্টোর ও পিডব্লিউএ</h4>
                      <p className="text-xs text-[#65676B]">অ্যাপ ও ওয়েবসাইট হিসেবে নিরবচ্ছিন্ন আন্তর্জাতিক সেবা।</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="text-base font-bold text-black">২. টেকনিক্যাল স্পেসিফিকেশন ও রিলিজ</h3>
                    <div className="bg-[#F0F2F5] p-4 rounded-xl border border-[#E4E6EB] space-y-1 text-xs font-mono text-black">
                      <p><span className="text-[#65676B]">App Name:</span> Peaceverse24.com — Peaceful Global Social Network</p>
                      <p><span className="text-[#65676B]">Version:</span> v1.0 Global Launch (Global Play Store Release)</p>
                      <p><span className="text-[#65676B]">Target Platform:</span> Web, Android (PWA / TWA), iOS</p>
                      <p><span className="text-[#65676B]">Engine:</span> React 19, TypeScript, Tailwind CSS, Express</p>
                      <p><span className="text-[#65676B]">Security:</span> 256-Bit SSL Encryption, Google Cloud Run Infrastructure</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5">
                    <Award className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="font-bold text-black text-base">100% Halal Global Islamic Social Platform</h3>
                      <p className="text-xs text-[#65676B]">
                        Safe, ethical, and shariah-compliant social media free from musical instruments and vulgarity.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-black">1. Vision & Mission</h3>
                    <p className="text-[#65676B]">
                      Peaceverse24.com is a global social media and content ecosystem built for the Muslim Ummah and values-driven individuals worldwide. We deliver the complete interactive fidelity of modern social platforms—stories, reels, posts, pages, groups, and commerce—while remaining steadfastly committed to authentic Islamic principles, peaceful community discourse, and halal creator monetization.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <h3 className="text-base font-bold text-black">2. Technical & Release Information</h3>
                    <div className="bg-[#F0F2F5] p-4 rounded-xl border border-[#E4E6EB] space-y-1 text-xs font-mono text-black">
                      <p><span className="text-[#65676B]">Application Name:</span> Peaceverse24.com</p>
                      <p><span className="text-[#65676B]">Version:</span> v1.0 Global Launch (International Production Release)</p>
                      <p><span className="text-[#65676B]">Architectural Stack:</span> React 19, TypeScript, Tailwind CSS, Express</p>
                      <p><span className="text-[#65676B]">Hosting & Security:</span> Enterprise Google Cloud Run, SSL/TLS Encryption</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. PRIVACY POLICY (গোপনীয়তা নীতি - Google Play & GDPR) */}
          {/* ========================================================= */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="p-3.5 rounded-xl bg-[#E7F3FF] border border-[#0866FF]/20 text-xs text-[#0866FF] flex items-center gap-2 font-medium">
                <ShieldCheck className="w-5 h-5 text-[#0866FF] shrink-0" />
                <span>
                  {language === 'bn'
                    ? 'এই প্রাইভেসি পলিসিটি Google Play Console Developer Policy, GDPR এবং আন্তর্জাতিক তথ্য সুরক্ষা আইন অনুযায়ী প্রণীত।'
                    : 'This Privacy Policy strictly complies with Google Play Developer Policies, GDPR, and international privacy standards.'}
                </span>
              </div>

              {language === 'bn' ? (
                <div className="space-y-4 text-black">
                  <div>
                    <h3 className="font-bold text-base text-black">1. Information We Collect (আমরা কোন তথ্য সংগ্রহ করি)</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      ব্যবহারকারী যখন আমাদের প্ল্যাটফর্মে অ্যাকাউন্ট খোলেন বা ব্যবহার করেন, আমরা শুধুমাত্র প্রয়োজনীয় তথ্য সংগ্রহ করি:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-[#65676B] space-y-1 mt-1.5">
                      <li><strong className="text-black">প্রোফাইল তথ্য:</strong> নাম, ইমেইল ঠিকানা, প্রোফাইল ও কভার ছবি এবং বায়ো।</li>
                      <li><strong className="text-black">ইউজার কনটেন্ট:</strong> আপনার প্রকাশিত পোস্ট, কুরআন আয়াত কার্ড, আপলোডকৃত ফটো এবং কমেন্টসমূহ।</li>
                      <li><strong className="text-black">ডিভাইস তথ্য:</strong> অ্যাপের পারফরম্যান্স ও ক্র্যাশ রিপোর্ট বিশ্লেষণের জন্য ডিভাইসের মডেল ও অপারেটিং সিস্টেম ভার্সন।</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">2. How We Use (তথ্যের ব্যবহার)</h3>
                    <ul className="list-disc pl-5 text-xs text-[#65676B] space-y-1 mt-1.5">
                      <li>আপনার টাইমলাইনে হালাল ও প্রাসঙ্গিক কনটেন্ট প্রদর্শন করা।</li>
                      <li>ক্রিয়েটরদের মনিটাইজেশন আর্নিং ও ক্যাশআউট সুষ্ঠুভাবে হিসাব ও প্রদান করা।</li>
                      <li>অনাকাঙ্ক্ষিত বা অশালীন কনটেন্ট প্রতিরোধ করে অ্যাপের পরিবেশ সুরক্ষিত রাখা।</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">3. Advertising (বিজ্ঞাপন ও ট্র্যাকিং)</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      আমরা কোনো অনৈতিক বিজ্ঞাপন বা ব্যবহারকারীর সংবেদনশীল দ্বীনি তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না। শুধুমাত্র ভেরিফাইড হালাল স্পন্সর এবং Google AdMob-এর নীতিমালার অধীনে প্রাসঙ্গিক হালাল প্রচার প্রদর্শিত হয়।
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">4. Permissions (মিডিয়া ও ডিভাইস অনুমতি)</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      আপনি যখন নিজস্ব ডিভাইস থেকে ছবি বা ভিডিও আপলোড করতে চান, শুধুমাত্র তখনই আপনার অনুমতিক্রমে ডিভাইস গ্যালারি বা ক্যামেরার অ্যাক্সেস ব্যবহৃত হয়। আমরা ব্যাকগ্রাউন্ডে কোনো ব্যক্তিগত ফাইল স্ক্যান করি না।
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">5. Data Security (তথ্য নিরাপত্তা)</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      ব্যবহারকারীর সকল তথ্য আধুনিক TLS/SSL এনক্রিপশনের মাধ্যমে নিরাপদভাবে আদান-প্রদান ও সংরক্ষণ করা হয়।
                    </p>
                  </div>

                  <div id="privacy-data-deletion">
                    <h3 className="font-bold text-base text-black">6. Data Retention &amp; Deletion (ডাটা সংরক্ষণ ও ডিলিট)</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      গুগল প্লে স্টোরের বাধ্যতামূলক নীতি অনুযায়ী যেকোনো ব্যবহারকারী যেকোনো সময় নিজের অ্যাকাউন্ট ও সমস্ত তথ্য সম্পূর্ণ মুছে ফেলতে পারেন। অ্যাকাউন্ট ডিলিট করার নিয়ম:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-[#65676B] space-y-1 mt-1.5">
                      <li>অ্যাপের <strong className="text-black">Settings → Account Deletion</strong> অপশন থেকে সরাসরি অ্যাকাউন্ট ডিলিট করুন।</li>
                      <li>
                        অথবা উপরের{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('delete-account')}
                          className="text-[#0866FF] font-bold hover:underline cursor-pointer"
                        >
                          Account Deletion ফর্ম ট্যাবে
                        </button>{' '}
                        ক্লিক করে অনলাইনে ডিলিট রিকোয়েস্ট পাঠান।
                      </li>
                      <li>
                        অথবা আপনার নিবন্ধিত ইমেইল থেকে{' '}
                        <a href="mailto:support@peaceverse24.com" className="text-[#0866FF] font-bold hover:underline">
                          support@peaceverse24.com
                        </a>{' '}
                        ঠিকানায় &quot;Data Deletion Request&quot; লিখে ইমেইল করুন — ৭২ ঘণ্টার মধ্যে সমস্ত ডাটা স্থায়ীভাবে মুছে ফেলা হবে।
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">7. User Rights (ব্যবহারকারীর অধিকার)</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      GDPR ও আন্তর্জাতিক নীতিমালা অনুযায়ী ব্যবহারকারীর যেকোনো সময় নিজস্ব ব্যক্তিগত তথ্য দেখা, সংশোধন করা, এক্সপোর্ট করা বা স্থায়ীভাবে মুছে ফেলার সম্পূর্ণ অধিকার রয়েছে।
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">8. Children&apos;s Privacy (Under 13) (শিশুদের সুরক্ষা)</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      Peaceverse24.com একটি পারিবারিক ও শিশু-বান্ধব প্ল্যাটফর্ম। আমরা জেনে-বুঝে ১৩ বছরের কম বয়সী শিশুদের ব্যক্তিগত তথ্য সংগ্রহ করি না।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-xs space-y-1">
                    <p className="font-bold text-black">Contact Us &amp; Data Deletion Support:</p>
                    <p className="text-[#65676B]">
                      Email:{' '}
                      <a href="mailto:support@peaceverse24.com" className="text-[#0866FF] font-semibold hover:underline">
                        support@peaceverse24.com
                      </a>{' '}
                      •{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('delete-account')}
                        className="text-rose-600 font-semibold hover:underline cursor-pointer"
                      >
                        অ্যাকাউন্ট ডিলিট ফর্ম খুলুন →
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-black">
                  <div>
                    <h3 className="font-bold text-base text-black">1. Information We Collect</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      We collect only the minimal necessary data to deliver a secure social experience:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-[#65676B] space-y-1 mt-1.5">
                      <li><strong className="text-black">Account Information:</strong> Name, email address, profile avatar, and bio details.</li>
                      <li><strong className="text-black">User Content:</strong> Posts, text, comments, and media explicitly uploaded by you.</li>
                      <li><strong className="text-black">Device Information:</strong> Device model and operating system version for app performance and crash diagnostics.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">2. How We Use</h3>
                    <ul className="list-disc pl-5 text-xs text-[#65676B] space-y-1 mt-1.5">
                      <li>Display wholesome, family-friendly, and relevant content on your feed.</li>
                      <li>Accurately calculate and process creator monetization earnings and payouts.</li>
                      <li>Maintain a safe community environment by preventing spam or harmful content.</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">3. Advertising</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      We never sell sensitive user data to third parties. Only verified ethical sponsors and compliant Google AdMob promotions are displayed.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">4. Permissions</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      Device gallery or camera access is requested solely when you choose to attach photos or videos to your posts or stories. No background scanning is ever performed.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">5. Data Security</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      All data is encrypted in transit using industry-standard TLS/SSL security protocols.
                    </p>
                  </div>

                  <div id="privacy-data-deletion">
                    <h3 className="font-bold text-base text-black">6. Data Retention &amp; Deletion</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      In compliance with Google Play Store policies, users can permanently delete their account and personal records at any time:
                    </p>
                    <ul className="list-disc pl-5 text-xs text-[#65676B] space-y-1 mt-1.5">
                      <li>Delete directly inside the app via <strong className="text-black">Settings → Account Deletion</strong>.</li>
                      <li>
                        Submit a request online via our{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('delete-account')}
                          className="text-[#0866FF] font-bold hover:underline cursor-pointer"
                        >
                          Account Deletion Request Form
                        </button>
                        .
                      </li>
                      <li>
                        Or email{' '}
                        <a href="mailto:support@peaceverse24.com" className="text-[#0866FF] font-bold hover:underline">
                          support@peaceverse24.com
                        </a>{' '}
                        from your registered email with subject &quot;Data Deletion Request&quot; (processed within 72 hours).
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">7. User Rights</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      Under GDPR and international privacy standards, users have the complete right to access, export, rectify, or permanently delete their personal data at any time.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-black">8. Children&apos;s Privacy (Under 13)</h3>
                    <p className="text-xs text-[#65676B] mt-1">
                      Peaceverse24.com is a family-friendly platform. We do not knowingly collect personal information from children under the age of 13.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#F0F2F5] border border-[#E4E6EB] text-xs space-y-1">
                    <p className="font-bold text-black">Contact Us &amp; Data Deletion Support:</p>
                    <p className="text-[#65676B]">
                      Email:{' '}
                      <a href="mailto:support@peaceverse24.com" className="text-[#0866FF] font-semibold hover:underline">
                        support@peaceverse24.com
                      </a>{' '}
                      •{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('delete-account')}
                        className="text-rose-600 font-semibold hover:underline cursor-pointer"
                      >
                        Open Data Deletion Form →
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. TERMS OF SERVICE (ব্যবহারের শর্তাবলী) */}
          {/* ========================================================= */}
          {activeTab === 'terms' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              <h3 className="font-bold text-base text-black">
                {language === 'bn' ? 'ব্যবহারের শর্তাবলী (Terms of Service)' : 'Terms of Service'}
              </h3>

              <div className="space-y-3 text-xs text-[#65676B]">
                <p>
                  {language === 'bn'
                    ? '১. সম্মতি: Peaceverse24.com প্ল্যাটফর্ম ব্যবহার করার মাধ্যমে আপনি আমাদের শর্তাবলী ও ইসলামিক আখলাক নীতি মেনে চলতে সম্মত হচ্ছেন।'
                    : '1. Acceptance: By accessing Peaceverse24.com, you agree to adhere to our ethical standards and respectful discourse.'}
                </p>
                <p>
                  {language === 'bn'
                    ? '২. নিষিদ্ধ কার্যকলাপ: বাদ্যযন্ত্রযুক্ত গান, পর্নোগ্রাফি, নগ্নতা, সাম্প্রদায়িক উসকানি, অপবাদ (অপপ্রচার) এবং জাল হাদিস প্রচার সম্পূর্ণ নিষিদ্ধ।'
                    : '2. Prohibited Content: Music with instruments, pornography, nudity, hate speech, false narrations, and fraud are strictly banned.'}
                </p>
                <p>
                  {language === 'bn'
                    ? '৩. অ্যাকাউন্টের দায়িত্ব: আপনার অ্যাকাউন্টের মাধ্যমে প্রকাশিত সমস্ত বক্তব্য ও পোস্টের জন্য আপনি স্বয়ং দায়ী থাকবেন।'
                    : '3. Responsibility: You retain responsibility for the content and media published under your profile.'}
                </p>
                <p>
                  {language === 'bn'
                    ? '৪. মনিটাইজেশন চুক্তি: মনিটাইজড ক্রিয়েটররা অর্জিত বিজ্ঞাপন আয়ের ৫৫% প্রাপ্য হবেন এবং প্ল্যাটফর্মের হালাল স্কোর বজায় রাখতে বাধ্য থাকবেন।'
                    : '4. Monetization Agreement: Approved creators receive 55% of verifiable ad revenue according to platform guidelines.'}
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. COMMUNITY GUIDELINES (কমিউনিটি ও হালাল গাইডলাইন) */}
          {/* ========================================================= */}
          {activeTab === 'guidelines' && (
            <div className="space-y-4 max-w-3xl mx-auto">
              <h3 className="font-bold text-base text-black">
                {language === 'bn' ? 'কমিউনিটি নির্দেশিকা ও হালাল কোড' : 'Community Standards & Halal Code'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                  <h4 className="font-bold text-emerald-700">✅ যা প্রশংসনীয় ও উৎসাহিত</h4>
                  <ul className="text-xs text-[#65676B] space-y-1 list-disc pl-4">
                    <li>কুরআনুল কারীমের সহিহ তিলাওয়াত ও তাফসির</li>
                    <li>সহিহ হাদিসের শিক্ষণীয় উপদেশ ও নসিহত</li>
                    <li>উম্মাহর সামাজিক উন্নয়ন ও চ্যারিটি কার্যক্রম</li>
                    <li>হালাল ব্যবসা ও সততাভিত্তিক কেনাকাটা</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5">
                  <h4 className="font-bold text-rose-700">❌ যা সম্পূর্ণ নিষিদ্ধ (Zero Tolerance)</h4>
                  <ul className="text-xs text-[#65676B] space-y-1 list-disc pl-4">
                    <li>বাদ্যযন্ত্র, মিউজিক ও অশালীন ভিডিও</li>
                    <li>ব্যক্তিগত চরিত্রহনন ও গীবত</li>
                    <li>কোনো প্রকার বিভ্রান্তিকর তথ্য বা জাল হাদিস</li>
                    <li>সুদ, জুয়া বা প্রতারণামূলক কার্যকলাপ</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. ACCOUNT DELETION (গুগল প্লে স্টোর বাধ্যবাধকতা) */}
          {/* ========================================================= */}
          {activeTab === 'delete-account' && (
            <div className="space-y-5 max-w-xl mx-auto">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span>অ্যাকাউন্ট ও সম্পূর্ণ তথ্য মুছে ফেলার সুবিধা</span>
                </div>
                <p className="text-xs text-[#65676B]">
                  গুগল প্লে স্টোর পলিসি অনুযায়ী, আপনি চাইলে যেকোনো সময় আপনার অ্যাকাউন্ট, পোস্ট, মন্তব্য এবং প্রোফাইলের সমস্ত ডাটা চিরতরে মুছে ফেলতে পারেন।
                </p>
              </div>

              {deletionSuccess ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-in fade-in">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-black">অ্যাকাউন্ট ডিলিট রিকোয়েস্ট সফল হয়েছে</h4>
                  <p className="text-xs text-[#65676B]">
                    আপনার সমস্ত পোস্ট, প্রোফাইল ফটো ও তথ্য স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলা হচ্ছে। সাথে থাকার জন্য শুকরিয়া।
                  </p>
                </div>
              ) : (
                <form onSubmit={handleDeleteAccountSubmit} className="space-y-3.5 bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB]">
                  <div>
                    <label className="block text-xs font-bold text-black mb-1">আপনার নিবন্ধিত ইমেইল বা ইউজারনেম:</label>
                    <input
                      type="text"
                      required
                      placeholder="user@example.com"
                      value={deleteEmail}
                      onChange={(e) => setDeleteEmail(e.target.value)}
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-xs text-black focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">অ্যাকাউন্ট মুছে ফেলার কারণ:</label>
                    <select
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3 py-2 text-xs text-black focus:outline-none"
                    >
                      <option value="ব্যক্তিগত বিরতি নিচ্ছি">ব্যক্তিগত বিরতি নিচ্ছি</option>
                      <option value="অন্য অ্যাকাউন্ট ব্যবহার করছি">অন্য অ্যাকাউন্ট ব্যবহার করছি</option>
                      <option value="প্রাইভেসি কারণে">প্রাইভেসি কারণে</option>
                      <option value="অন্যান্য">অন্যান্য</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="confirm-del"
                      checked={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-0"
                    />
                    <label htmlFor="confirm-del" className="text-xs text-[#65676B]">
                      আমি নিশ্চিত যে আমার অ্যাকাউন্টের সমস্ত পোস্ট ও ডাটা স্থায়ীভাবে মুছে ফেলা হবে।
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={!deleteConfirm || !deleteEmail.trim()}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>অ্যাকাউন্ট চিরতরে মুছে ফেলুন (Permanently Delete)</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. CONTACT & SUPPORT (যোগাযোগ ও সহায়তা) */}
          {/* ========================================================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-white border border-[#E4E6EB] space-y-1">
                  <h4 className="font-bold text-black flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#0866FF]" />
                    <span>অফিসিয়াল সাপোর্ট ইমেইল</span>
                  </h4>
                  <p className="text-emerald-700 font-mono">support@peaceverse24.com</p>
                  <p className="text-[10px] text-[#65676B]">২৪ ঘণ্টার মধ্যে রিপ্লাই দেওয়া হয়</p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E4E6EB] space-y-1">
                  <h4 className="font-bold text-black flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>প্রাইভেসি অফিসার ও অভিযোগ</span>
                  </h4>
                  <p className="text-[#0866FF] font-mono">privacy@peaceverse24.com</p>
                  <p className="text-[10px] text-[#65676B]">GDPR ও Play Store কমপ্লায়েন্স সেল</p>
                </div>
              </div>

              {contactSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1 animate-in fade-in">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm text-black">আপনার বার্তা গৃহীত হয়েছে!</p>
                  <p className="text-xs text-[#65676B]">আমাদের সাপোর্ট টিম দ্রুত যোগাযোগ করবে।</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E6EB]">
                  <h3 className="font-bold text-sm text-black">সরাসরি বার্তা পাঠান (Send Feedback)</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="আপনার নাম"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-xs text-black focus:outline-none focus:border-[#0866FF]"
                    />
                    <input
                      type="email"
                      required
                      placeholder="আপনার ইমেইল"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl px-3.5 py-2 text-xs text-black focus:outline-none focus:border-[#0866FF]"
                    />
                  </div>

                  <textarea
                    rows={3}
                    required
                    placeholder="আপনার মতামত, অভিযোগ বা পরামর্শ লিখুন..."
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full bg-[#F0F2F5] border border-[#E4E6EB] rounded-xl p-3 text-xs text-black focus:outline-none focus:border-[#0866FF] resize-none"
                  />

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#0866FF] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>মেসেজ পাঠান</span>
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-[#E4E6EB] bg-white flex items-center justify-between text-xs text-[#65676B]">
          <p>© 2026 Peaceverse24.com — World&apos;s Most Peaceful Social Network. All rights reserved.</p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#F0F2F5] hover:bg-[#E4E6EB] font-bold text-black transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>

      {copiedToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#0866FF] text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          <span>পলিসি লিংক কপি করা হয়েছে!</span>
        </div>
      )}
    </div>
  );
};
