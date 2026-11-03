import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Share2,
  PlusSquare,
  CheckCircle2,
  Monitor,
  Sparkles,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ onClose }) => {
  const { canPromptDirectly, isInstalled, isIOS, isAndroid, promptInstall } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'android';
  });
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleDirectInstall = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#242526] text-white rounded-2xl border border-[#393a3b] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative p-5 pb-4 bg-gradient-to-br from-[#1877F2]/25 via-[#242526] to-[#242526] border-b border-[#393a3b]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-[#3a3b3c] hover:bg-[#4e4f50] text-[#e4e6eb] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1877F2] to-[#0e4fbc] p-0.5 shadow-lg flex-shrink-0">
              <img
                src="/assets/aistudio/IMG-20261019-WA2392_c6c5253a.jpg"
                alt="Qalby"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-white leading-tight">Qalby (কলবী) অ্যাপ</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PWA App
                </span>
              </div>
              <p className="text-xs text-[#b0b3b8] mt-0.5">
                ১০০% ফ্রি ও সরাসরি ওয়েবসাইট থেকে ইন্সটল করুন
              </p>
            </div>
          </div>

          {/* Benefits pills */}
          <div className="flex items-center gap-2 mt-3 text-[11px] text-[#e4e6eb]">
            <span className="flex items-center gap-1 bg-[#3a3b3c]/60 px-2.5 py-1 rounded-full border border-[#393a3b]">
              <Sparkles className="w-3 h-3 text-amber-400" />
              কোনো স্টোর ছাড়াই সরাসরি সেভ
            </span>
            <span className="flex items-center gap-1 bg-[#3a3b3c]/60 px-2.5 py-1 rounded-full border border-[#393a3b]">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              দ্রুত ও হালকা (Lightweight)
            </span>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-[#393a3b] bg-[#18191a]">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'android'
                ? 'border-[#1877F2] text-[#1877F2] bg-[#242526]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>অ্যান্ড্রয়েড (Android)</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'ios'
                ? 'border-[#1877F2] text-[#1877F2] bg-[#242526]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>আইফোন (iOS Safari)</span>
          </button>
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'pc'
                ? 'border-[#1877F2] text-[#1877F2] bg-[#242526]'
                : 'border-transparent text-[#b0b3b8] hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>কম্পিউটার (PC/Mac)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {installSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">মাশাআল্লাহ! সফলভাবে ইন্সটল হয়েছে!</h3>
              <p className="text-xs text-[#b0b3b8]">
                এখন আপনার ফোনের হোম স্ক্রিন থেকে যেকোনো সময় সরাসরি Qalby অ্যাপ ওপেন করতে পারবেন।
              </p>
            </div>
          ) : isInstalled ? (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center space-y-1.5">
              <CheckCircle2 className="w-8 h-8 text-blue-400 mx-auto" />
              <p className="text-sm font-bold text-white">অ্যাপটি আপনার ডিভাইসে ইতিমধ্যে ইন্সটল করা আছে!</p>
              <p className="text-xs text-[#b0b3b8]">আপনি সরাসরি অ্যাপ্লিকেশন মোডে এটি ব্যবহার করছেন।</p>
            </div>
          ) : (
            <>
              {/* Direct Prompt button if supported */}
              {canPromptDirectly && activeTab === 'android' && (
                <div className="space-y-3">
                  <button
                    onClick={handleDirectInstall}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] active:scale-[0.99] text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-5 h-5 stroke-[2.5]" />
                    <span>১ ক্লিকে এখনই ইন্সটল করুন</span>
                  </button>
                  <div className="flex items-center gap-2 justify-center text-[11px] text-[#b0b3b8]">
                    <span>বা নিচের সহজ ধাপগুলো অনুসরণ করুন:</span>
                  </div>
                </div>
              )}

              {/* Tab 1: Android steps */}
              {activeTab === 'android' && (
                <div className="space-y-3">
                  <div className="bg-[#18191a] p-3.5 rounded-xl border border-[#393a3b] space-y-3 text-xs leading-relaxed">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ১
                      </div>
                      <div>
                        <p className="font-semibold text-white">ব্রাউজারের ৩ ডট মেনু চাপুন</p>
                        <p className="text-[#b0b3b8] text-[11px] mt-0.5">
                          আপনার Chrome ব্রাউজারের উপরে ডান কোণে থাকা <strong>(⋮) ৩টি ডট</strong> আইকনে চাপ দিন।
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ২
                      </div>
                      <div>
                        <p className="font-semibold text-white">‘Install app’ বা ‘হোম স্ক্রিনে যোগ করুন’ সিলেক্ট করুন</p>
                        <p className="text-[#b0b3b8] text-[11px] mt-0.5">
                          মেনু লিস্ট থেকে <strong>&quot;Install app&quot;</strong> অথবা <strong>&quot;Add to Home screen&quot;</strong> অপশনে ট্যাপ করুন।
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ৩
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-400">‘ইন্সটল (Install)’ কনফার্ম করুন</p>
                        <p className="text-[#b0b3b8] text-[11px] mt-0.5">
                          পপআপে <strong>Install</strong> চাপলেই আপনার ফোনের অ্যাপ গ্যালারিতে কলবী অ্যাপ যোগ হয়ে যাবে।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: iOS Safari steps */}
              {activeTab === 'ios' && (
                <div className="space-y-3">
                  <div className="bg-[#18191a] p-3.5 rounded-xl border border-[#393a3b] space-y-3 text-xs leading-relaxed">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ১
                      </div>
                      <div>
                        <p className="font-semibold text-white">সাফারি ব্রাউজারের শেয়ার বাটন চাপুন</p>
                        <p className="text-[#b0b3b8] text-[11px] mt-0.5">
                          সাফারির নিচের টুলবারে থাকা <strong>Share (শেয়ার) 📤</strong> আইকনে চাপ দিন।
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ২
                      </div>
                      <div>
                        <p className="font-semibold text-white">‘Add to Home Screen’ এ ট্যাপ করুন</p>
                        <p className="text-[#b0b3b8] text-[11px] mt-0.5">
                          মেনুটি একটু নিচে স্ক্রোল করে <strong>&quot;Add to Home Screen&quot; (➕)</strong> অপশন সিলেক্ট করুন।
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ৩
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-400">উপরে ‘Add’ চাপুন</p>
                        <p className="text-[#b0b3b8] text-[11px] mt-0.5">
                          উপরের ডান কোণে থাকা <strong>Add</strong> বাটনে ক্লিক করলেই আপনার আইফোনে কলবী অ্যাপ ইন্সটল হয়ে যাবে!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: PC / Desktop steps */}
              {activeTab === 'pc' && (
                <div className="space-y-3">
                  <div className="bg-[#18191a] p-3.5 rounded-xl border border-[#393a3b] space-y-3 text-xs leading-relaxed">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#1877F2] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ১
                      </div>
                      <div>
                        <p className="font-semibold text-white">অ্যাড্রেস বার আইকন চাপুন</p>
                        <p className="text-[#b0b3b8] text-[11px] mt-0.5">
                          আপনার Chrome/Edge ব্রাউজারের ইউআরএল বারের ডান কোণে থাকা <strong>ইন্সটল আইকন (⊕ বা 💻)</strong> চাপুন।
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ২
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-400">‘Install’ এ ক্লিক করুন</p>
                        <p className="text-[#b0b3b8] text-[11px] mt-0.5">
                          আপনার কম্পিউটার বা ল্যাপটপের ডেস্কটপে সরাসরি উইন্ডো অ্যাপ হিসেবে শর্টকাট তৈরি হবে।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Guarantee Footer */}
          <div className="pt-2 border-t border-[#393a3b] flex items-center justify-between text-[11px] text-[#b0b3b8]">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ১০০% নিরাপদ ও মেমোরি সাশ্রয়ী
            </span>
            <button
              onClick={onClose}
              className="text-[#1877F2] hover:underline font-semibold"
            >
              বন্ধ করুন (Close)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
