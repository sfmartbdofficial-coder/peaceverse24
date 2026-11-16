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
    <div id="installModal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white text-black rounded-2xl border border-[#E4E6EB] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="relative p-5 pb-4 bg-white border-b border-[#E4E6EB]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] text-black transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#0a0a0f] p-0.5 shadow-sm flex-shrink-0 border border-[#0a8a4b]/30">
              <img
                src="/icon-192.png"
                alt="Peaceverse24"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-lg font-bold text-black leading-tight">Peaceverse24.com অ্যাপ</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  PWA App
                </span>
              </div>
              <p className="text-xs text-[#65676B] mt-0.5">
                ১০০% ফ্রি ও সরাসরি ওয়েবসাইট থেকে ইন্সটল করুন
              </p>
            </div>
          </div>

          {/* Benefits pills */}
          <div className="flex items-center gap-2 mt-3 text-[11px] text-black flex-wrap">
            <span className="flex items-center gap-1 bg-[#F0F2F5] px-2.5 py-1 rounded-full border border-[#E4E6EB]">
              <Sparkles className="w-3 h-3 text-amber-500" />
              কোনো স্টোর ছাড়াই সরাসরি সেভ
            </span>
            <span className="flex items-center gap-1 bg-[#F0F2F5] px-2.5 py-1 rounded-full border border-[#E4E6EB]">
              <ShieldCheck className="w-3 h-3 text-[#0866FF]" />
              দ্রুত ও হালকা (Lightweight)
            </span>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-[#E4E6EB] bg-white">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'android'
                ? 'border-[#0866FF] text-[#0866FF] bg-white'
                : 'border-transparent text-[#65676B] hover:text-black'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>অ্যান্ড্রয়েড (Android)</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ios'
                ? 'border-[#0866FF] text-[#0866FF] bg-white'
                : 'border-transparent text-[#65676B] hover:text-black'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>আইফোন (iOS Safari)</span>
          </button>
          <button
            onClick={() => setActiveTab('pc')}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pc'
                ? 'border-[#0866FF] text-[#0866FF] bg-white'
                : 'border-transparent text-[#65676B] hover:text-black'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>কম্পিউটার (PC/Mac)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 bg-white">
          
          {installSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-black">মাশাআল্লাহ! সফলভাবে ইন্সটল হয়েছে!</h3>
              <p className="text-xs text-[#65676B]">
                এখন আপনার ফোনের হোম স্ক্রিন থেকে যেকোনো সময় সরাসরি Peaceverse24.com অ্যাপ ওপেন করতে পারবেন।
              </p>
            </div>
          ) : isInstalled ? (
            <div className="p-4 rounded-xl bg-[#E7F3FF] border border-[#0866FF]/20 text-center space-y-1.5">
              <CheckCircle2 className="w-8 h-8 text-[#0866FF] mx-auto" />
              <p className="text-sm font-bold text-black">অ্যাপটি আপনার ডিভাইসে ইতিমধ্যে ইন্সটল করা আছে!</p>
              <p className="text-xs text-[#65676B]">আপনি সরাসরি অ্যাপ্লিকেশন মোডে এটি ব্যবহার করছেন।</p>
            </div>
          ) : (
            <>
              {/* Direct Prompt button if supported */}
              {canPromptDirectly && activeTab === 'android' && (
                <div className="space-y-3">
                  <button
                    onClick={handleDirectInstall}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#0866FF] hover:bg-[#166fe5] active:scale-[0.99] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-5 h-5 stroke-[2.5]" />
                    <span>১ ক্লিকে এখনই ইন্সটল করুন</span>
                  </button>
                  <div className="flex items-center gap-2 justify-center text-[11px] text-[#65676B]">
                    <span>বা নিচের সহজ ধাপগুলো অনুসরণ করুন:</span>
                  </div>
                </div>
              )}

              {/* Tab 1: Android steps */}
              {activeTab === 'android' && (
                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-xl border border-[#E4E6EB] space-y-3 text-xs leading-relaxed">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ১
                      </div>
                      <div>
                        <p className="font-semibold text-black">ব্রাউজারের ৩ ডট মেনু চাপুন</p>
                        <p className="text-[#65676B] text-[11px] mt-0.5">
                          আপনার Chrome ব্রাউজারের উপরে ডান কোণে থাকা <strong>(⋮) ৩টি ডট</strong> আইকনে চাপ দিন।
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ২
                      </div>
                      <div>
                        <p className="font-semibold text-black">‘Install app’ বা ‘হোম স্ক্রিনে যোগ করুন’ সিলেক্ট করুন</p>
                        <p className="text-[#65676B] text-[11px] mt-0.5">
                          মেনু লিস্ট থেকে <strong>&quot;Install app&quot;</strong> অথবা <strong>&quot;Add to Home screen&quot;</strong> অপশনে ট্যাপ করুন।
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ৩
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-700">‘ইন্সটল (Install)’ কনফার্ম করুন</p>
                        <p className="text-[#65676B] text-[11px] mt-0.5">
                          পপআপে <strong>Install</strong> চাপলেই আপনার ফোনের অ্যাপ গ্যালারিতে Peaceverse24.com অ্যাপ যোগ হয়ে যাবে।
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: iOS Safari steps */}
              {activeTab === 'ios' && (
                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-xl border border-[#E4E6EB] space-y-3 text-xs leading-relaxed">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ১
                      </div>
                      <div>
                        <p className="font-semibold text-black">সাফারি ব্রাউজারের শেয়ার বাটন চাপুন</p>
                        <p className="text-[#65676B] text-[11px] mt-0.5">
                          সাফারির নিচের টুলবারে থাকা <strong>Share (শেয়ার) 📤</strong> আইকনে চাপ দিন।
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ২
                      </div>
                      <div>
                        <p className="font-semibold text-black">‘Add to Home Screen’ এ ট্যাপ করুন</p>
                        <p className="text-[#65676B] text-[11px] mt-0.5">
                          মেনুটি একটু নিচে স্ক্রোল করে <strong>&quot;Add to Home Screen&quot; (➕)</strong> অপশন সিলেক্ট করুন।
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ৩
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-700">উপরে ‘Add’ চাপুন</p>
                        <p className="text-[#65676B] text-[11px] mt-0.5">
                          উপরের ডান কোণে থাকা <strong>Add</strong> বাটনে ক্লিক করলেই আপনার আইফোনে Peaceverse24.com অ্যাপ ইন্সটল হয়ে যাবে!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: PC / Desktop steps */}
              {activeTab === 'pc' && (
                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-xl border border-[#E4E6EB] space-y-3 text-xs leading-relaxed">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#0866FF] text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ১
                      </div>
                      <div>
                        <p className="font-semibold text-black">অ্যাড্রেস বার আইকন চাপুন</p>
                        <p className="text-[#65676B] text-[11px] mt-0.5">
                          আপনার Chrome/Edge ব্রাউজারের ইউআরএল বারের ডান কোণে থাকা <strong>ইন্সটল আইকন (⊕ বা 💻)</strong> চাপুন।
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                        ২
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-700">‘Install’ এ ক্লিক করুন</p>
                        <p className="text-[#65676B] text-[11px] mt-0.5">
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
          <div className="pt-2 border-t border-[#E4E6EB] flex items-center justify-between text-[11px] text-[#65676B]">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ১০০% নিরাপদ ও মেমোরি সাশ্রয়ী
            </span>
            <button
              onClick={onClose}
              className="text-[#0866FF] hover:underline font-semibold cursor-pointer"
            >
              বন্ধ করুন (Close)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
