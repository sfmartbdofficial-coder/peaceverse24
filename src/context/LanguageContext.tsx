import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  TranslationDictionary,
  detectUserCountryAndLanguage,
  COUNTRY_TO_LANGUAGE_MAP,
  LanguageInfo,
} from '../i18n/languages';

interface LanguageContextType {
  currentLang: SupportedLanguage;
  currentLangInfo: LanguageInfo;
  t: TranslationDictionary;
  setLanguage: (lang: SupportedLanguage) => void;
  detectedCountry: string;
  detectedFlag: string;
  showLanguageModal: boolean;
  setShowLanguageModal: (show: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => detectUserCountryAndLanguage(), []);
  const [currentLang, setCurrentLangState] = useState<SupportedLanguage>(initial.language);
  const [detectedCountry, setDetectedCountry] = useState<string>(initial.countryName);
  const [detectedFlag, setDetectedFlag] = useState<string>(initial.detectedFlag);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Asynchronous IP Geolocation fallback for exact global country & language detection
  useEffect(() => {
    const saved = localStorage.getItem('qalby_language_preference');
    if (saved) return; // Respect explicit manual preference

    let isMounted = true;
    const detectCountryFromIp = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        // Fast free IP geolocation API
        const response = await fetch('https://freeipapi.com/api/json', { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const countryCode = (data.countryCode || '').toUpperCase();
          const countryName = data.countryName || '';

          if (countryCode && isMounted) {
            const mapped = COUNTRY_TO_LANGUAGE_MAP[countryCode];
            if (mapped) {
              setCurrentLangState(mapped.lang);
              setDetectedCountry(mapped.countryName);
              setDetectedFlag(mapped.flag);
            } else if (countryName) {
              setDetectedCountry(countryName);
            }
          }
        }
      } catch {
        // Fallback already handled gracefully by browser locale & timezone
      }
    };

    detectCountryFromIp();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Update HTML dir and lang attribute for RTL support (Arabic, Urdu, Persian)
  useEffect(() => {
    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
    if (langInfo) {
      document.documentElement.dir = langInfo.dir;
      document.documentElement.lang = currentLang;
    }
  }, [currentLang]);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLangState(lang);
    try {
      localStorage.setItem('qalby_language_preference', lang);
    } catch {}
    setShowLanguageModal(false);
  };

  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) || SUPPORTED_LANGUAGES[0];
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.bn;

  // Filter languages for modal search
  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return SUPPORTED_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return SUPPORTED_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <LanguageContext.Provider
      value={{
        currentLang,
        currentLangInfo,
        t,
        setLanguage,
        detectedCountry,
        detectedFlag,
        showLanguageModal,
        setShowLanguageModal,
      }}
    >
      {children}


      {/* Language Switcher Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#242526] text-white rounded-2xl border border-[#393a3b] shadow-2xl w-full max-w-md overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#393a3b] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌐</span>
                <div>
                  <h3 className="font-bold text-base">{t.languageSelect}</h3>
                  <p className="text-[11px] text-[#b0b3b8]">
                    {detectedCountry ? `শনাক্তকৃত দেশ: ${detectedCountry}` : 'বিশ্বের সমস্ত দেশের স্বয়ংক্রিয় ভাষা'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="p-1 rounded-full text-[#b0b3b8] hover:text-white hover:bg-[#3a3b3c]"
              >
                ✕
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="দেশ বা ভাষা খুঁজুন (Search country or language)..."
                className="w-full bg-[#18191a] border border-[#393a3b] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#8a8d91] focus:outline-none focus:border-[#1877F2]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#b0b3b8] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            <p className="text-[11px] text-[#b0b3b8]">
              আপনার দেশ অনুযায়ী ভাষা স্বয়ংক্রিয়ভাবে সক্রিয় হবে। আপনি চাইলে যেকোনো দেশ বা ভাষার তালিকা থেকে নির্বাচন করতে পারেন:
            </p>

            <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full p-2.5 rounded-xl flex items-center justify-between border transition-all text-left ${
                    currentLang === lang.code
                      ? 'bg-[#1877F2]/20 border-[#1877F2] text-white font-bold'
                      : 'bg-[#18191a] border-[#393a3b] text-[#b0b3b8] hover:bg-[#3a3b3c] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl flex-shrink-0">{lang.flag}</span>
                    <div className="truncate">
                      <p className="text-sm font-semibold truncate flex items-center gap-2">
                        <span>{lang.nativeName}</span>
                        {currentLang === lang.code && (
                          <span className="text-[10px] bg-[#1877F2] text-white px-2 py-0.5 rounded-full font-bold">
                            সক্রিয়
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#8a8d91] truncate">{lang.country}</p>
                    </div>
                  </div>
                  {currentLang === lang.code && (
                    <span className="w-5 h-5 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs flex-shrink-0 ml-2">
                      ✓
                    </span>
                  )}
                </button>
              ))}

              {filteredLanguages.length === 0 && (
                <p className="text-center py-4 text-xs text-[#b0b3b8]">কোনো ভাষা বা দেশ পাওয়া যায়নি</p>
              )}
            </div>

            <div className="pt-2 border-t border-[#393a3b] flex items-center justify-between">
              <span className="text-[11px] text-[#8a8d91]">১৮+ প্রধান ভাষা ও বিশ্বব্যাপী ১৯৫+ দেশ সাপোর্ট</span>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="px-4 py-2 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-semibold text-white transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
