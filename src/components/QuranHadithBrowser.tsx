import React, { useState } from 'react';
import { BookOpen, Copy, Check, Play, Search, Heart, Sparkles } from 'lucide-react';

interface SurahItem {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  nameBangla: string;
  versesCount: number;
  revelationType: string;
  keyAyah: string;
  keyTranslation: string;
}

const SURAHS: SurahItem[] = [
  {
    number: 1,
    nameArabic: 'الفَاتِحَة',
    nameEnglish: 'Al-Fatihah',
    nameBangla: 'আল-ফাতিহা',
    versesCount: 7,
    revelationType: 'মাক্কী',
    keyAyah: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    keyTranslation: 'শুরু করছি আল্লাহর নামে যিনি পরম করুণাময়, অতি দয়ালু। সমস্ত প্রশংসা আল্লাহর যিনি বিশ্বজগতের পালনকর্তা।',
  },
  {
    number: 36,
    nameArabic: 'يس',
    nameEnglish: 'Yaseen',
    nameBangla: 'ইয়াসীন',
    versesCount: 83,
    revelationType: 'মাক্কী',
    keyAyah: 'يس ۝ وَالْقُرْآنِ الْحَكِيمِ ۝ إِنَّكَ لَمِنَ الْمُرْسَلِينَ',
    keyTranslation: 'ইয়াসীন। প্রজ্ঞাময় কুরআনের শপথ, নিশ্চয়ই আপনি রাসুলদের একজন।',
  },
  {
    number: 55,
    nameArabic: 'الرَّحْمَٰن',
    nameEnglish: 'Ar-Rahman',
    nameBangla: 'আর-রহমান',
    versesCount: 78,
    revelationType: 'মাদানী',
    keyAyah: 'الرَّحْمَٰنُ ۝ عَلَّمَ الْقُرْآنَ ۝ خَلَقَ الْإِنسَانَ ۝ عَلَّمَهُ الْبَيَانَ',
    keyTranslation: 'পরম দয়াময় আল্লাহ। তিনি কুরআন শিক্ষা দিয়েছেন। তিনি মানবজাতি সৃষ্টি করেছেন এবং তাকে ভাষা শিখিয়েছেন।',
  },
  {
    number: 67,
    nameArabic: 'المُلْك',
    nameEnglish: 'Al-Mulk',
    nameBangla: 'আল-মুলক',
    versesCount: 30,
    revelationType: 'মাক্কী',
    keyAyah: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    keyTranslation: 'বরকতময় তিনি, যাঁর হাতে সমস্ত রাজত্ব এবং তিনি সর্ববিষয়ে সর্বশক্তিমান।',
  },
  {
    number: 112,
    nameArabic: 'الإِخْلَاص',
    nameEnglish: 'Al-Ikhlas',
    nameBangla: 'আল-ইখলাস',
    versesCount: 4,
    revelationType: 'মাক্কী',
    keyAyah: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ',
    keyTranslation: 'বলুন: তিনিই আল্লাহ, একক। আল্লাহ অমুখাপেক্ষী। তিনি কাউকে জন্ম দেননি এবং তাঁকেও কেউ জন্ম দেয়নি।',
  },
];

const HADITHS = [
  {
    id: 'h-1',
    book: 'সহীহ বুখারী',
    hadithNo: '১',
    narrator: 'উমর ইবনুল খাত্তাব (রাঃ)',
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    bangla: 'কাজের শুভাশুভ পরিণতি নিয়তের উপর নির্ভরশীল এবং প্রত্যেক মানুষ তাই পায় যা সে নিয়ত করে।',
  },
  {
    id: 'h-2',
    book: 'সহীহ মুসলিম',
    hadithNo: '২২৩',
    narrator: 'আবু মালিক আল-আশ’আরী (রাঃ)',
    arabic: 'الطَّهُورُ شَطْرُ الإِيمَانِ وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ',
    bangla: 'পবিত্রতা ঈমানের অর্ধেক এবং "আলহামদুলিল্লাহ" মিজান বা নেকির পাল্লাকে পরিপূর্ণ করে দেয়।',
  },
  {
    id: 'h-3',
    book: 'জামে আত-তিরমিজী',
    hadithNo: '২৫১৬',
    narrator: 'ইবনে আব্বাস (রাঃ)',
    arabic: 'احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ',
    bangla: 'আল্লাহর বিধানসমূহকে হিফাজত কর, তিনি তোমাকে হিফাজত করবেন। আল্লাহকে স্মরণ রেখো, তাঁকে তোমার সম্মুখে পাবে।',
  },
];

export const QuranHadithBrowser: React.FC = () => {
  const [section, setSection] = useState<'quran' | 'hadith'>('quran');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSurahs = SURAHS.filter(
    (s) =>
      s.nameEnglish.toLowerCase().includes(search.toLowerCase()) ||
      s.nameBangla.includes(search) ||
      s.nameArabic.includes(search)
  );

  const filteredHadiths = HADITHS.filter(
    (h) =>
      h.book.includes(search) ||
      h.bangla.includes(search) ||
      h.narrator.includes(search)
  );

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 pb-24">
      {/* Tab Switcher */}
      <div className="flex bg-neutral-900 p-1 rounded-xl border border-neutral-800 mb-4 max-w-sm mx-auto">
        <button
          onClick={() => setSection('quran')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            section === 'quran'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          পবিত্র কুরআন (Surahs)
        </button>
        <button
          onClick={() => setSection('hadith')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
            section === 'hadith'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          সহীহ হাদিস (Hadith)
        </button>
      </div>

      {/* Mini Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder={section === 'quran' ? 'সূরা অনুসন্ধান করুন...' : 'হাদিস অনুসন্ধান করুন...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#181818] border border-neutral-800 rounded-xl px-9 py-2.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
        />
        <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
      </div>

      {/* Quran List */}
      {section === 'quran' && (
        <div className="space-y-3">
          {filteredSurahs.map((surah) => (
            <div
              key={surah.number}
              className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-emerald-500/40 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {surah.number}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-100">
                      {surah.nameBangla} ({surah.nameEnglish})
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      {surah.revelationType} • {surah.versesCount} আয়াত
                    </p>
                  </div>
                </div>
                <span className="text-xl font-arabic text-emerald-300 font-bold">
                  {surah.nameArabic}
                </span>
              </div>

              {/* Sample Ayat snippet */}
              <div className="bg-black/40 p-3 rounded-lg border border-neutral-800">
                <p className="text-base sm:text-lg font-arabic text-right text-emerald-100 leading-loose">
                  {surah.keyAyah}
                </p>
                <p className="text-xs text-neutral-300 mt-2 font-bengali">
                  {surah.keyTranslation}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() =>
                    handleCopy(`q-${surah.number}`, `${surah.keyAyah}\n\n${surah.keyTranslation} — সূরা ${surah.nameBangla}`)
                  }
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  {copiedId === `q-${surah.number}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>আয়াত কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hadith List */}
      {section === 'hadith' && (
        <div className="space-y-3">
          {filteredHadiths.map((h) => (
            <div
              key={h.id}
              className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 hover:border-emerald-500/40 transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-xs font-semibold text-emerald-400">
                  {h.book} • হাদিস নং {h.hadithNo}
                </span>
                <span className="text-[11px] text-neutral-400">বর্ণনাকারী: {h.narrator}</span>
              </div>

              <p className="text-base sm:text-lg font-arabic text-right text-emerald-100 leading-loose">
                {h.arabic}
              </p>

              <p className="text-xs sm:text-sm text-neutral-300 font-bengali">
                {h.bangla}
              </p>

              <div className="flex justify-end">
                <button
                  onClick={() => handleCopy(h.id, `${h.arabic}\n\n${h.bangla} — ${h.book}, হাদিস ${h.hadithNo}`)}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-neutral-800 text-neutral-300 hover:text-white"
                >
                  {copiedId === h.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>হাদিস কপি</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
