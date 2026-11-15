import React, { useState, useRef } from 'react';
import {
  X,
  Search,
  Menu,
  MessageCircle,
  Lock,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Globe,
  Users,
  Check,
  Sparkles,
  BookOpen,
  UserCheck,
  Glasses,
} from 'lucide-react';
import { LegalTabType } from '../legal/LegalModal';
import privacySettingsHeroImg from '../../assets/images/privacy_settings_hero_1794670506366.jpg';
import privacyGenAiImg from '../../assets/images/privacy_genai_topic_1794670507092.jpg';

interface FbPrivacyCenterViewProps {
  onClose: () => void;
  defaultAudience: 'public' | 'friends' | 'private';
  onChangeDefaultAudience: (aud: 'public' | 'friends' | 'private') => void;
  isProfileLocked: boolean;
  onToggleProfileLock: () => void;
  lockToast: string | null;
  onOpenLegalTab?: (tab: LegalTabType) => void;
  onOpenPeaceverse24Settings?: () => void;
  onOpenPeaceChatSettings?: () => void;
}

const MessengerGlyph: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.19 5.44 3.14 7.17.16.14.26.35.27.57l.05 1.78c.02.57.61.94 1.13.71l1.98-.87c.17-.08.36-.1.55-.06.91.25 1.88.39 2.88.39 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm5.89 7.45-2.94 4.66c-.47.74-1.47.92-2.17.39l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.19-.68-.64l2.94-4.66c.47-.74 1.47-.92 2.17-.39l2.34 1.75c.21.16.51.16.72 0l3.16-2.4c.42-.32.97.19.68.64z" />
  </svg>
);

export const FbPrivacyCenterView: React.FC<FbPrivacyCenterViewProps> = ({
  onClose,
  defaultAudience,
  onChangeDefaultAudience,
  isProfileLocked,
  onToggleProfileLock,
  lockToast,
  onOpenLegalTab,
  onOpenPeaceverse24Settings,
  onOpenPeaceChatSettings,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [infoSheet, setInfoSheet] = useState<{ title: string; body: string } | null>(null);
  const [showQuickNav, setShowQuickNav] = useState(false);

  const settingsSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToSettings = () => {
    settingsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const productCards = [
    {
      id: 'private-messaging',
      title: 'Private messaging',
      desc: 'Our messaging offers end-to-end encryption so your conversations stay safe.',
      icon: 'chat-lock' as const,
    },
    {
      id: 'safe-posting',
      title: 'Safe Posting',
      desc: 'You control who can see your posts and profile.',
      icon: 'shield' as const,
    },
    {
      id: 'location-control',
      title: 'Location control',
      desc: 'Choose when to share your location.',
      icon: 'location' as const,
    },
  ];

  const topicCards = [
    {
      id: 'genai',
      category: 'Generative AI',
      title: 'Generative AI at Peaceverse24',
      summary:
        'Learn how Peaceverse24 protects your personal information when you use AI features and tools across our community.',
      image: privacyGenAiImg,
      isYellowImg: true,
    },
    {
      id: 'safety',
      category: 'Safety & Integrity',
      title: 'Managing halal safety at Peaceverse24',
      summary:
        'Discover how community standards, content moderation, and privacy controls work together to keep your feed respectful.',
      bgClass: 'bg-gradient-to-br from-[#CCFBF1] to-[#E0F2FE]',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
    },
    {
      id: 'account-security',
      category: 'Account Controls',
      title: 'Securing your Peaceverse24 account',
      summary:
        'Use profile lock, audience controls, and login alerts to protect your account across every device.',
      bgClass: 'bg-gradient-to-br from-[#EDE9FE] to-[#DBEAFE]',
      icon: UserCheck,
      iconColor: 'text-[#1877F2]',
    },
  ];

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTopics = normalizedQuery
    ? topicCards.filter(
        (t) =>
          t.title.toLowerCase().includes(normalizedQuery) ||
          t.category.toLowerCase().includes(normalizedQuery) ||
          t.summary.toLowerCase().includes(normalizedQuery)
      )
    : topicCards;

  return (
    <div className="fixed inset-0 z-50 bg-white text-[#050505] overflow-y-auto font-sans">
      <div className="max-w-[680px] mx-auto min-h-screen bg-white pb-16">
        {/* STICKY TOP BAR */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#E4E6EB]/70">
          <div className="h-[56px] px-4 flex items-center justify-between">
            {/* Left: X close button */}
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Privacy Center"
              title="Close"
            >
              <X className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Center: Peaceverse24 Logo (NOT Meta) */}
            <div className="flex items-center gap-1.5 select-none">
              <span className="w-7 h-7 rounded-full bg-[#0866FF] text-white flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span className="text-[18px] font-bold text-[#050505] tracking-tight">
                Peaceverse24
              </span>
            </div>

            {/* Right: Search + Menu icons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSearch((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Search Privacy Center"
                title="Search"
              >
                <Search className="w-[19px] h-[19px] stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={() => setShowQuickNav((prev) => !prev)}
                className="w-10 h-10 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Privacy Center menu"
                title="Menu"
              >
                <Menu className="w-[19px] h-[19px] stroke-[2.2]" />
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#65676B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Privacy Center topics..."
                  className="w-full bg-[#F0F2F5] rounded-full pl-9 pr-9 py-2 text-[14px] text-[#050505] placeholder-[#65676B] focus:outline-none focus:ring-1 focus:ring-[#1877F2]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#65676B] hover:text-[#050505] cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {showQuickNav && (
            <div className="px-4 pb-3 pt-1 border-t border-[#E4E6EB] bg-white space-y-1">
              <button
                type="button"
                onClick={() => {
                  setShowQuickNav(false);
                  scrollToSettings();
                }}
                className="w-full px-3 py-2 rounded-lg hover:bg-[#F0F2F5] text-left text-[14px] font-semibold text-[#050505] cursor-pointer"
              >
                Audience &amp; Profile Lock Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickNav(false);
                  setShowAllTopics(true);
                }}
                className="w-full px-3 py-2 rounded-lg hover:bg-[#F0F2F5] text-left text-[14px] font-semibold text-[#050505] cursor-pointer"
              >
                Privacy Topics
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowQuickNav(false);
                  if (onOpenLegalTab) {
                    onClose();
                    onOpenLegalTab('privacy');
                  }
                }}
                className="w-full px-3 py-2 rounded-lg hover:bg-[#F0F2F5] text-left text-[14px] font-semibold text-[#050505] cursor-pointer"
              >
                Peaceverse24 Privacy Policy
              </button>
            </div>
          )}
        </header>

        {/* HERO TITLE & SUBTITLE */}
        <section className="px-5 pt-6 pb-6 text-center bg-white">
          <h1 className="text-[28px] font-bold text-[#050505] tracking-tight leading-tight">
            Privacy Center
          </h1>
          <p className="mt-2.5 text-[15px] text-[#65676B] leading-relaxed max-w-[380px] mx-auto">
            Make the privacy choices that are right for you. Learn how to manage and control your privacy on Peaceverse24.
          </p>
        </section>

        {/* SECTION 1: "We build privacy into our products" */}
        <section className="pt-2 pb-6 bg-white">
          <h2 className="px-4 text-[19px] font-bold text-[#050505] mb-3">
            We build privacy into our products
          </h2>

          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
            {productCards.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => setInfoSheet({ title: card.title, body: card.desc })}
                className="text-left min-w-[260px] max-w-[270px] shrink-0 rounded-[16px] border border-[#E4E6EB] bg-white hover:bg-[#F7F8FA] p-5 space-y-3 transition-colors cursor-pointer"
              >
                {card.icon === 'chat-lock' && (
                  <div className="relative w-11 h-11 rounded-full bg-[#E7F3FF] text-[#1877F2] flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 fill-[#1877F2]/15" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#1877F2] border-2 border-white text-white flex items-center justify-center">
                      <Lock className="w-2.5 h-2.5 stroke-[2.8]" />
                    </span>
                  </div>
                )}
                {card.icon === 'shield' && (
                  <div className="w-11 h-11 rounded-full bg-[#ECFDF5] text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                )}
                {card.icon === 'location' && (
                  <div className="w-11 h-11 rounded-full bg-[#EEF2FF] text-[#0866FF] flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                )}

                <div>
                  <h3 className="text-[17px] font-bold text-[#050505] leading-snug">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 text-[14px] text-[#65676B] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 2: "Settings to help control your privacy" */}
        <section className="px-4 pt-2 pb-6 bg-white space-y-3">
          <div>
            <h2 className="text-[19px] font-bold text-[#050505] leading-snug">
              Settings to help control your privacy
            </h2>
            <p className="mt-1 text-[14px] text-[#65676B] leading-relaxed">
              We build easy-to-use settings you can use to make the privacy choices that are right for you.
            </p>
          </div>

          <div className="rounded-[16px] overflow-hidden border border-[#E4E6EB] bg-[#F0F2F5]">
            <img
              src={privacySettingsHeroImg}
              alt="Settings to help control your privacy"
              referrerPolicy="no-referrer"
              className="w-full h-48 sm:h-56 object-cover block"
            />
          </div>

          <button
            type="button"
            onClick={scrollToSettings}
            className="w-full py-3 rounded-full bg-[#0866FF] hover:bg-[#1877F2] active:scale-[0.99] text-white text-[15px] font-semibold transition-all cursor-pointer"
          >
            Review settings
          </button>
        </section>

        {/* SECTION 3: Existing Default Audience & Profile Lock Redesigned in White */}
        <section
          ref={settingsSectionRef}
          className="px-4 pt-2 pb-6 bg-white space-y-4 scroll-mt-16"
        >
          <div className="p-4 rounded-[16px] border border-[#E4E6EB] bg-white space-y-3">
            <h3 className="text-[14px] font-bold text-[#050505] tracking-wide uppercase">
              Who can see your future posts? (DEFAULT AUDIENCE)
            </h3>

            <div className="space-y-2.5">
              {[
                {
                  id: 'public' as const,
                  label: 'Public',
                  sub: 'পাবলিক — Everyone on Peaceverse24 can see your future posts',
                  icon: Globe,
                },
                {
                  id: 'friends' as const,
                  label: 'Friends',
                  sub: 'বন্ধুরা — Only your friends on Peaceverse24 can see your future posts',
                  icon: Users,
                },
                {
                  id: 'private' as const,
                  label: 'Only Me',
                  sub: 'শুধুমাত্র আমি — Keep your posts private to yourself',
                  icon: Lock,
                },
              ].map((aud) => {
                const Icon = aud.icon;
                const selected = defaultAudience === aud.id;
                return (
                  <label
                    key={aud.id}
                    onClick={() => onChangeDefaultAudience(aud.id)}
                    className={`p-3.5 rounded-[12px] border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      selected
                        ? 'bg-[#E7F3FF] border-[#1877F2] text-[#050505]'
                        : 'bg-white border-[#E4E6EB] hover:bg-[#F7F8FA] text-[#050505]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          selected ? 'bg-[#1877F2] text-white' : 'bg-[#F0F2F5] text-[#050505]'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[15px] text-[#050505]">{aud.label}</p>
                        <p className="text-[12px] text-[#65676B] leading-snug">{aud.sub}</p>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="peacecol-default-audience"
                      checked={selected}
                      onChange={() => onChangeDefaultAudience(aud.id)}
                      className="w-4 h-4 accent-[#1877F2] shrink-0 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Profile Lock Toggle Card */}
          <div
            onClick={onToggleProfileLock}
            role="button"
            tabIndex={0}
            className={`p-4 rounded-[16px] border transition-colors cursor-pointer flex items-center justify-between gap-3 select-none ${
              isProfileLocked
                ? 'bg-[#E7F3FF] border-[#1877F2]'
                : 'bg-white border-[#E4E6EB] hover:bg-[#F7F8FA]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isProfileLocked ? 'bg-[#1877F2] text-white' : 'bg-[#F0F2F5] text-[#050505]'
                }`}
              >
                <Lock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-[15px] text-[#050505]">
                    Profile Lock (প্রোফাইল লক)
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      isProfileLocked
                        ? 'bg-[#1877F2] text-white'
                        : 'bg-[#F0F2F5] text-[#65676B]'
                    }`}
                  >
                    {isProfileLocked ? 'Locked' : 'Unlocked'}
                  </span>
                </div>
                <p className="text-[13px] text-[#65676B] mt-0.5">
                  Only friends can see the photos and posts on your profile.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={isProfileLocked}
              onClick={(e) => {
                e.stopPropagation();
                onToggleProfileLock();
              }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 flex items-center shrink-0 cursor-pointer ${
                isProfileLocked ? 'bg-[#1877F2]' : 'bg-[#CED0D4]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                  isProfileLocked ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {lockToast && (
            <div className="p-3 rounded-[12px] bg-[#E7F3FF] border border-[#1877F2]/30 text-[#050505] text-[13px] font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-[#1877F2] shrink-0" />
              <span>{lockToast}</span>
            </div>
          )}
        </section>

        {/* SECTION 4: "Privacy topics" */}
        <section className="pt-2 pb-6 bg-white space-y-3">
          <div className="px-4">
            <h2 className="text-[19px] font-bold text-[#050505]">Privacy topics</h2>
            <p className="mt-1 text-[14px] text-[#65676B] leading-relaxed">
              Get answers to your privacy questions and manage your privacy in a way that&apos;s right for you.
            </p>
          </div>

          <div
            className={
              showAllTopics
                ? 'px-4 grid grid-cols-1 sm:grid-cols-2 gap-3'
                : 'flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1'
            }
          >
            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => setInfoSheet({ title: topic.title, body: topic.summary })}
                  className={`text-left rounded-[16px] border border-[#E4E6EB] bg-white hover:bg-[#F7F8FA] overflow-hidden transition-colors cursor-pointer ${
                    showAllTopics ? 'w-full' : 'min-w-[270px] max-w-[285px] shrink-0'
                  }`}
                >
                  {topic.image ? (
                    <div className="h-36 w-full bg-[#FEF08A]">
                      <img
                        src={topic.image}
                        alt={topic.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover block"
                      />
                    </div>
                  ) : (
                    <div
                      className={`h-36 w-full flex items-center justify-center ${topic.bgClass}`}
                    >
                      {Icon && <Icon className={`w-12 h-12 ${topic.iconColor}`} />}
                    </div>
                  )}

                  <div className="p-4 space-y-1">
                    <p className="text-[13px] font-medium text-[#65676B]">{topic.category}</p>
                    <h3 className="text-[16px] font-bold text-[#050505] leading-snug">
                      {topic.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-4 pt-1">
            <button
              type="button"
              onClick={() => setShowAllTopics((prev) => !prev)}
              className="w-full py-2.5 px-4 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-[#050505] text-[15px] font-semibold text-center transition-colors cursor-pointer"
            >
              {showAllTopics ? 'Show fewer topics' : 'View all topics'}
            </button>
          </div>
        </section>

        {/* SECTION 5: "Learn about Peaceverse24's commitment to privacy" */}
        <section className="px-4 pt-2 pb-6 bg-white space-y-3">
          <div>
            <h2 className="text-[19px] font-bold text-[#050505] leading-snug">
              Learn about Peaceverse24&apos;s commitment to privacy
            </h2>
            <p className="mt-1 text-[14px] text-[#65676B] leading-relaxed">
              Find more resources you can use to learn about how Peaceverse24 builds privacy into its products.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setInfoSheet({
                title: 'More privacy resources',
                body: 'Peaceverse24 follows a transparent privacy framework built around user consent, halal community safety, and minimal data retention. You can adjust audience and security preferences at any time.',
              })
            }
            className="w-full px-4 py-3.5 rounded-[14px] border border-[#E4E6EB] bg-white hover:bg-[#F7F8FA] flex items-center justify-between gap-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Glasses className="w-5 h-5 text-[#050505] shrink-0" />
              <span className="text-[15px] font-semibold text-[#050505] truncate">
                More privacy resources
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-[#65676B] shrink-0" />
          </button>
        </section>

        {/* SECTION 6: "Learn more in the Privacy Policy" */}
        <section className="px-4 pt-2 pb-6 bg-white space-y-3">
          <h2 className="text-[19px] font-bold text-[#050505]">
            Learn more in the Privacy Policy
          </h2>

          <button
            type="button"
            onClick={() => {
              if (onOpenLegalTab) {
                onClose();
                onOpenLegalTab('privacy');
              } else {
                setInfoSheet({
                  title: 'Peaceverse24 Privacy Policy',
                  body: 'Our Privacy Policy explains what information we collect, how it is used to keep Peaceverse24 safe and personalized, and the controls you have to view, export, or delete your data.',
                });
              }
            }}
            className="w-full p-4 rounded-[14px] border border-[#E4E6EB] bg-white hover:bg-[#F7F8FA] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-[12px] bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-[16px] font-semibold text-[#050505] leading-snug">
                  What is the Privacy Policy and what does it cover?
                </p>
                <p className="text-[13px] text-[#65676B] mt-0.5">Privacy Policy</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#65676B] shrink-0" />
          </button>
        </section>

        {/* SECTION 7: "Looking for more privacy settings?" */}
        <section className="px-4 pt-2 pb-8 bg-white space-y-3">
          <div>
            <h2 className="text-[19px] font-bold text-[#050505]">
              Looking for more privacy settings?
            </h2>
            <p className="mt-1 text-[14px] text-[#65676B] leading-relaxed">
              Quickly access your settings across Peaceverse24 and PeaceChat
            </p>
          </div>

          <div className="rounded-[14px] border border-[#E4E6EB] bg-white divide-y divide-[#E4E6EB] overflow-hidden">
            <button
              type="button"
              onClick={() => {
                if (onOpenPeaceverse24Settings) {
                  onOpenPeaceverse24Settings();
                } else {
                  scrollToSettings();
                }
              }}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors cursor-pointer"
            >
              <span className="text-[16px] font-medium text-[#050505]">Peaceverse24</span>
              <div className="flex items-center gap-2.5 text-[#65676B]">
                <span className="w-6 h-6 rounded-full bg-[#65676B] text-white text-[13px] font-extrabold flex items-center justify-center">
                  p
                </span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenPeaceChatSettings) {
                  onOpenPeaceChatSettings();
                } else {
                  setInfoSheet({
                    title: 'PeaceChat Privacy Settings',
                    body: 'Control encrypted chats, read receipts, active status, and message delivery requests in PeaceChat.',
                  });
                }
              }}
              className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#F7F8FA] transition-colors cursor-pointer"
            >
              <span className="text-[16px] font-medium text-[#050505]">PeaceChat</span>
              <div className="flex items-center gap-2.5 text-[#65676B]">
                <MessengerGlyph className="w-6 h-6 text-[#65676B]" />
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* Clean White Detail Drawer for Cards & Topics */}
      {infoSheet && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-end justify-center"
          onClick={() => setInfoSheet(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-[24px] p-5 space-y-3 text-[#050505] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1877F2]" />
                <h3 className="text-[17px] font-bold text-[#050505]">{infoSheet.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInfoSheet(null)}
                className="w-8 h-8 rounded-full bg-[#F0F2F5] flex items-center justify-center text-[#050505] cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[14px] text-[#65676B] leading-relaxed">{infoSheet.body}</p>
            <button
              type="button"
              onClick={() => setInfoSheet(null)}
              className="w-full py-2.5 rounded-full bg-[#0866FF] text-white text-[14px] font-semibold cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
