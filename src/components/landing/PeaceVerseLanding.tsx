import React, { useState } from 'react';
import {
  Globe,
  Download,
  Users,
  Shield,
  Award,
  Sparkles,
  ArrowRight,
  Info,
  Heart,
  QrCode,
  Smartphone,
  ExternalLink,
  BookOpen,
  Compass,
  CheckCircle2,
  X,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { PeaceDoveEmblem } from './PeaceDoveEmblem';
import { GeometricBackground } from './GeometricBackground';

interface PeaceVerseLandingProps {
  onNavigateTo: (path: string) => void;
  onOpenDownloadModal?: () => void;
  onOpenLegalTab?: (tab: string) => void;
}

export const PeaceVerseLanding: React.FC<PeaceVerseLandingProps> = ({
  onNavigateTo,
  onOpenDownloadModal,
  onOpenLegalTab,
}) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState<{
    isOpen: boolean;
    featureTitle?: string;
  }>({ isOpen: false });

  const handleFeatureCardClick = (title: string) => {
    setShowSignUpPrompt({ isOpen: true, featureTitle: title });
    setTimeout(() => {
      onNavigateTo('/signup');
    }, 1500);
  };

  const handleDownloadClick = () => {
    if (onOpenDownloadModal) {
      onOpenDownloadModal();
    } else {
      setShowQrModal(true);
    }
  };

  return (
    <GeometricBackground>
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#030712]/80 border-b border-blue-500/20 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Top Left: Logo PeaceVerse */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            {/* Geometric star emblem mark */}
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(56,189,248,0.45)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#060b18] rounded-[10px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
                </svg>
              </div>
            </div>

            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors">
              PeaceVerse
            </span>
          </button>

          {/* Top Right: Login button, Sign Up blue button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onNavigateTo('/login')}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white rounded-full hover:bg-slate-800/60 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
              <span>Login</span>
            </button>

            <button
              onClick={() => onNavigateTo('/signup')}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-full shadow-[0_0_18px_rgba(37,99,235,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 pb-12 sm:pb-20 px-4 sm:px-6 flex flex-col items-center text-center max-w-4xl mx-auto">
        
        {/* Circular bird logo with Islamic geometric pattern */}
        <div className="mb-4 sm:mb-6 animate-in zoom-in-95 duration-700">
          <PeaceDoveEmblem size={175} />
        </div>

        {/* Brand name under emblem */}
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)] mb-3">
          peaceverse
        </h2>

        {/* Global Community Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/70 border border-sky-400/35 text-sky-300 text-xs font-semibold backdrop-blur-md mb-2 shadow-[0_0_15px_rgba(56,189,248,0.15)]">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Positive Global Community</span>
        </div>

        {/* Sub-tagline */}
        <p className="text-xs sm:text-sm text-sky-200/80 font-medium mb-4">
          Feel Peace With Global Community
        </p>

        {/* Main Tagline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight sm:leading-snug tracking-tight max-w-2xl mb-8">
          Building a peaceful community for everyone worldwide.
        </h1>

        {/* CTA Buttons: Get Started & Download App */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-10">
          <button
            onClick={() => onNavigateTo('/signup')}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(37,99,235,0.6)] active:scale-95 transition-all cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            onClick={handleDownloadClick}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white font-bold text-sm sm:text-base border border-blue-500/40 flex items-center justify-center gap-2 backdrop-blur-md active:scale-95 transition-all cursor-pointer shadow-[0_0_20px_rgba(56,189,248,0.12)]"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Download App</span>
          </button>
        </div>

        {/* 10K+ active members pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/60 text-slate-300 text-xs font-semibold backdrop-blur-md shadow-sm">
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>10K+ active members</span>
        </div>
      </section>

      {/* 3. ABOUT PEACEVERSE SECTION */}
      <section className="py-10 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-950/60 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-3">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>About PeaceVerse</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-extrabold text-white max-w-xl leading-snug mb-3">
            Building a peaceful community for everyone worldwide
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            PeaceVerse24 is a global platform connecting people to share knowledge, support each other, and grow together. We provide a safe, respectful space to learn, discuss and grow as a positive global community.
          </p>
        </div>

        {/* 3 Stats Highlights: 100+ Countries, 24/7 Support, 100% Safe & Secure */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 my-8">
          
          {/* Card 1: 100+ Countries */}
          <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-900/60 border border-blue-500/25 backdrop-blur-md hover:border-sky-400/50 transition-all shadow-[0_0_20px_rgba(37,99,235,0.12)]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(56,189,248,0.5)]">
              <Heart className="w-6 h-6 fill-white text-white" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              100+
            </span>
            <span className="text-xs text-slate-300 font-medium mt-1">
              Countries Reached
            </span>
          </div>

          {/* Card 2: 24/7 Support */}
          <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-900/60 border border-blue-500/25 backdrop-blur-md hover:border-sky-400/50 transition-all shadow-[0_0_20px_rgba(37,99,235,0.12)]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(56,189,248,0.5)]">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              24/7
            </span>
            <span className="text-xs text-slate-300 font-medium mt-1">
              Community Support
            </span>
          </div>

          {/* Card 3: 100% Safe & Secure */}
          <div className="flex flex-col items-center text-center p-5 rounded-2xl bg-slate-900/60 border border-blue-500/25 backdrop-blur-md hover:border-sky-400/50 transition-all shadow-[0_0_20px_rgba(37,99,235,0.12)]">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white mb-3 shadow-[0_0_20px_rgba(56,189,248,0.5)]">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              100%
            </span>
            <span className="text-xs text-slate-300 font-medium mt-1">
              Safe & Secure
            </span>
          </div>
        </div>
      </section>

      {/* 4. KEY PLATFORM FEATURES (from Screenshot 2) */}
      <section className="py-6 px-4 sm:px-6 max-w-4xl mx-auto space-y-3.5">
        
        {/* Feature 1: Communities */}
        <button
          type="button"
          onClick={() => handleFeatureCardClick('Communities')}
          className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-blue-500/25 backdrop-blur-md hover:border-sky-400/60 hover:bg-slate-800/80 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all cursor-pointer group text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-110 group-hover:bg-blue-600/50 transition-all">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                Communities
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Join community circles, share knowledge, and grow together in harmony.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all shrink-0" />
        </button>

        {/* Feature 2: Rich Helpful Content */}
        <button
          type="button"
          onClick={() => handleFeatureCardClick('Rich Helpful Content')}
          className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-blue-500/25 backdrop-blur-md hover:border-sky-400/60 hover:bg-slate-800/80 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all cursor-pointer group text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-110 group-hover:bg-blue-600/50 transition-all">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                Rich Helpful Content
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Articles, reminders, videos & inspiring lifestyle content curated for you.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all shrink-0" />
        </button>

        {/* Feature 3: Discover */}
        <button
          type="button"
          onClick={() => handleFeatureCardClick('Discover')}
          className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-blue-500/25 backdrop-blur-md hover:border-sky-400/60 hover:bg-slate-800/80 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)] transition-all cursor-pointer group text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-110 group-hover:bg-blue-600/50 transition-all">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                Discover
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Explore events, creators, courses and connect with the global community.
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all shrink-0" />
        </button>
      </section>

      {/* 5. DOWNLOAD THE PEACEVERSE APP SECTION */}
      <section className="py-10 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900/90 via-blue-950/40 to-slate-900/90 border border-sky-400/40 backdrop-blur-xl shadow-[0_0_35px_rgba(56,189,248,0.2)] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
          
          {/* Neon inner glow effect */}
          <div className="pointer-events-none absolute -top-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 w-60 h-60 bg-sky-400/20 rounded-full blur-3xl" />

          {/* Left Text & Store Buttons */}
          <div className="flex-1 space-y-4 text-center md:text-left z-10">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Download the PeaceVerse App
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              Stay connected on the go. Get reminders, join communities, and access helpful content anywhere.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              {/* Apple App Store */}
              <button
                onClick={handleDownloadClick}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/80 hover:bg-black text-white border border-slate-700/80 hover:border-sky-400/60 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.07 1.71-.93 2.73 1.01.08 2.03-.49 2.65-1.23z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">Download on the</span>
                  <span className="block text-xs font-bold text-white">App Store</span>
                </div>
              </button>

              {/* Google Play Store */}
              <button
                onClick={handleDownloadClick}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/80 hover:bg-black text-white border border-slate-700/80 hover:border-sky-400/60 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M3.61 2.17L13.88 12.44 3.61 22.71c-.36-.37-.61-.92-.61-1.58V3.75c0-.66.25-1.21.61-1.58z" />
                  <path fill="#EA4335" d="M17.15 9.17L13.88 12.44 3.61 2.17c.4-.24.9-.33 1.44-.02l12.1 7.02z" />
                  <path fill="#FBBC05" d="M17.15 15.71l-12.1 7.02c-.54.31-1.04.22-1.44-.02L13.88 12.44l3.27 3.27z" />
                  <path fill="#34A853" d="M21.2 12.44c.48.33.8.84.8 1.44 0 .6-.32 1.11-.8 1.44l-4.05 2.39-3.27-3.27 3.27-3.27 4.05 2.39z" />
                </svg>
                <div className="text-left leading-tight">
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400">GET IT ON</span>
                  <span className="block text-xs font-bold text-white">Google Play</span>
                </div>
              </button>
            </div>
          </div>

          {/* Right QR Code Box matching screenshot */}
          <div className="shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#060d24]/90 border border-sky-400/40 shadow-[0_0_20px_rgba(56,189,248,0.3)] z-10">
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-xl p-2 flex items-center justify-center shadow-inner">
              {/* Detailed SVG QR Code */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                {/* QR corner 1 */}
                <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="3" />
                <rect x="13" y="13" width="12" height="12" fill="currentColor" rx="1.5" />
                {/* QR corner 2 */}
                <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="3" />
                <rect x="75" y="13" width="12" height="12" fill="currentColor" rx="1.5" />
                {/* QR corner 3 */}
                <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="3" />
                <rect x="13" y="75" width="12" height="12" fill="currentColor" rx="1.5" />
                {/* QR Pattern dots */}
                <rect x="38" y="10" width="6" height="6" fill="currentColor" />
                <rect x="48" y="10" width="6" height="6" fill="currentColor" />
                <rect x="40" y="24" width="8" height="6" fill="currentColor" />
                <rect x="54" y="24" width="6" height="6" fill="currentColor" />
                <rect x="10" y="42" width="6" height="6" fill="currentColor" />
                <rect x="22" y="42" width="6" height="6" fill="currentColor" />
                <rect x="36" y="38" width="28" height="28" fill="#1877F2" rx="4" />
                {/* Center dove icon */}
                <circle cx="50" cy="52" r="8" fill="white" />
                <polygon points="50,47 54,54 46,54" fill="#1877F2" />
                <rect x="70" y="44" width="8" height="6" fill="currentColor" />
                <rect x="84" y="44" width="6" height="6" fill="currentColor" />
                <rect x="42" y="72" width="6" height="6" fill="currentColor" />
                <rect x="54" y="72" width="8" height="6" fill="currentColor" />
                <rect x="42" y="84" width="12" height="6" fill="currentColor" />
                <rect x="72" y="72" width="6" height="6" fill="currentColor" />
                <rect x="84" y="80" width="6" height="8" fill="currentColor" />
              </svg>
            </div>
            <span className="text-[11px] font-bold text-sky-300 mt-2">
              Scan to Download
            </span>
          </div>
        </div>
      </section>

      {/* 6. JOIN PEACEVERSE TODAY SECTION */}
      <section className="py-8 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-blue-900/40 via-blue-950/60 to-slate-900/90 border border-blue-500/35 backdrop-blur-xl shadow-[0_0_30px_rgba(37,99,235,0.25)] flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/60 border border-sky-400/30 text-sky-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Join PeaceVerse today</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white">
            Join PeaceVerse today
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md">
            Start your journey with the global community. Free to join, always positive and supportive.
          </p>

          <button
            onClick={() => onNavigateTo('/signup')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(37,99,235,0.6)] active:scale-95 transition-all cursor-pointer mt-2"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Trusted Worldwide Badge */}
        <div className="flex justify-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 border border-blue-500/20 text-slate-400 text-xs font-medium">
            <Shield className="w-3.5 h-3.5 text-sky-400" />
            <span>Trusted by a global community worldwide</span>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="w-full border-t border-slate-800/80 bg-[#020510] pt-12 pb-8 px-4 sm:px-8 mt-12">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Footer Logo & Tagline */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center p-1 text-white shadow-sm">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                PeaceVerse
              </span>
            </div>
            <p className="text-xs text-sky-300/80 font-medium">
              Feel Peace With Global Community
            </p>
          </div>

          {/* Links Grid matching screenshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 text-xs">
            {/* Company */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Company</span>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button
                    onClick={() => setActiveInfoModal('about')}
                    className="hover:text-sky-300 transition-colors text-left"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveInfoModal('careers')}
                    className="hover:text-sky-300 transition-colors text-left"
                  >
                    Careers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveInfoModal('contact')}
                    className="hover:text-sky-300 transition-colors text-left"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-2.5">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Legal</span>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button
                    onClick={() => onOpenLegalTab ? onOpenLegalTab('privacy') : setActiveInfoModal('privacy')}
                    className="hover:text-sky-300 transition-colors text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenLegalTab ? onOpenLegalTab('guidelines') : setActiveInfoModal('guidelines')}
                    className="hover:text-sky-300 transition-colors text-left"
                  >
                    Community Guidelines
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-2.5 col-span-2 sm:col-span-1">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Support</span>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button
                    onClick={() => setActiveInfoModal('help')}
                    className="hover:text-sky-300 transition-colors text-left"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveInfoModal('faq')}
                    className="hover:text-sky-300 transition-colors text-left"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigateTo('/signup')}
                    className="hover:text-sky-300 transition-colors text-left"
                  >
                    Community
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright line */}
          <div className="pt-6 border-t border-slate-900 text-center space-y-1.5 text-[11px] text-slate-500">
            <p>© 2024 PeaceVerse24. All rights reserved.</p>
            <p>
              Made for a positive community worldwide •{' '}
              <button
                onClick={() => onOpenLegalTab ? onOpenLegalTab('privacy') : setActiveInfoModal('privacy')}
                className="hover:underline"
              >
                Privacy
              </button>{' '}
              •{' '}
              <button
                onClick={() => onOpenLegalTab ? onOpenLegalTab('terms') : setActiveInfoModal('terms')}
                className="hover:underline"
              >
                Terms
              </button>{' '}
              •{' '}
              <button
                onClick={() => setActiveInfoModal('help')}
                className="hover:underline"
              >
                Help Center
              </button>
            </p>
          </div>

        </div>
      </footer>

      {/* QR Code / App Download Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-sky-400/30 flex items-center justify-center text-sky-400 mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">Download PeaceVerse App</h3>
            <p className="text-xs text-slate-300">
              Install PeaceVerse directly on your Android, iPhone or desktop as a Progressive Web App (PWA).
            </p>
            <div className="p-3 bg-white rounded-2xl inline-block mx-auto shadow-md">
              <QrCode className="w-32 h-32 text-slate-900" />
            </div>
            <button
              onClick={() => {
                setShowQrModal(false);
                if (onOpenDownloadModal) onOpenDownloadModal();
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Open Installation Guide
            </button>
          </div>
        </div>
      )}

      {/* Info Dialog Modal */}
      {activeInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-left">
            <button
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-white capitalize">
              {activeInfoModal === 'about' && 'About PeaceVerse'}
              {activeInfoModal === 'careers' && 'Careers at PeaceVerse'}
              {activeInfoModal === 'contact' && 'Contact Support'}
              {activeInfoModal === 'privacy' && 'Privacy Policy'}
              {activeInfoModal === 'guidelines' && 'Community Guidelines'}
              {activeInfoModal === 'help' && 'Help Center'}
              {activeInfoModal === 'faq' && 'Frequently Asked Questions'}
              {activeInfoModal === 'terms' && 'Terms of Service'}
            </h3>

            <div className="text-xs text-slate-300 leading-relaxed space-y-2 max-h-72 overflow-y-auto pr-1">
              {activeInfoModal === 'about' && (
                <p>
                  PeaceVerse is dedicated to providing a safe, positive, and helpful online environment for people around the world. We believe social media should elevate, inspire, and connect communities peacefully without harassment, toxicity, or harmful content.
                </p>
              )}
              {activeInfoModal === 'careers' && (
                <p>
                  We are always looking for passionate engineers, designers, and community guardians who want to make the internet a friendlier place. Reach out to careers@peaceverse24.com with your portfolio.
                </p>
              )}
              {activeInfoModal === 'contact' && (
                <p>
                  Have questions or need assistance? Our 24/7 community support team is available at support@peaceverse24.com or via the Help Center.
                </p>
              )}
              {(activeInfoModal === 'privacy' || activeInfoModal === 'terms') && (
                <p>
                  PeaceVerse respects user privacy and secures data with modern encryption. Your personal information is protected, never sold to third parties, and account deletion can be requested anytime from Settings.
                </p>
              )}
              {activeInfoModal === 'guidelines' && (
                <p>
                  Our community guidelines promote respect, authenticity, and peace. Harassment, hate speech, explicit content, spam, and abusive interactions are strictly prohibited.
                </p>
              )}
              {(activeInfoModal === 'help' || activeInfoModal === 'faq') && (
                <p>
                  Quick answers: You can create an account using your email or Google account. PeaceVerse is 100% free to join. You can install our app directly onto your phone screen by selecting 'Add to Home Screen'.
                </p>
              )}
            </div>

            <button
              onClick={() => setActiveInfoModal(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Floating Toast Notification for Sign Up Prompt */}
      {showSignUpPrompt.isOpen && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in slide-in-from-top duration-300">
          <div className="bg-slate-900/95 border border-sky-400/60 rounded-2xl p-4 shadow-[0_0_35px_rgba(56,189,248,0.45)] backdrop-blur-xl flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0 shadow-sm animate-pulse">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-xs sm:text-sm font-black text-white">
                  Please Sign Up to join our communities
                </h4>
                <p className="text-[11px] text-sky-300 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                  <span>Taking you to /signup...</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTo('/signup')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shrink-0 shadow-sm transition-all cursor-pointer flex items-center gap-1"
            >
              <span>Join</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Dialog for Sign Up Prompt */}
      {showSignUpPrompt.isOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900/95 border border-sky-400/50 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-[0_0_50px_rgba(56,189,248,0.35)] relative animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-sky-400/40 flex items-center justify-center text-sky-400 mx-auto shadow-[0_0_20px_rgba(56,189,248,0.35)]">
              <Users className="w-7 h-7" />
            </div>
            
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 bg-blue-950/70 border border-sky-400/30 px-3 py-0.5 rounded-full">
                {showSignUpPrompt.featureTitle || 'Communities'}
              </span>
              <h3 className="text-lg font-black text-white pt-1">
                Please Sign Up to join our communities
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unlock {showSignUpPrompt.featureTitle || 'communities'}, meet inspiring creators, and engage with our positive global network.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-sky-300 py-1">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Redirecting to /signup...</span>
            </div>

            <button
              onClick={() => onNavigateTo('/signup')}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Go to Sign Up Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

    </GeometricBackground>
  );
};
