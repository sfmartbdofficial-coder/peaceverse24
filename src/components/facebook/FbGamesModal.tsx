import React, { useState, useEffect } from 'react';
import { X, Gamepad2, Trophy, Award, Timer, RotateCcw, Check, Sparkles, Brain, Flame } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface FbGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FbGamesModal: React.FC<FbGamesModalProps> = ({ isOpen, onClose }) => {
  const [selectedGame, setSelectedGame] = useState<'hub' | 'quiz' | 'words'>('hub');
  
  // Quiz Game State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [streak, setStreak] = useState(0);

  const quizQuestions: Question[] = [
    {
      question: 'পবিত্র কুরআনের কোন সূরাকে "কুরআনের হৃদয়" (Heart of Quran) বলা হয়?',
      options: ['সূরা আল-ফাতিহা', 'সূরা ইয়াসিন', 'সূরা আর-রহমান', 'সূরা আল-মুলক'],
      correct: 1,
      explanation: 'রাসূলুল্লাহ ﷺ ইরশাদ করেছেন: প্রতিটি বস্তুর একটি হৃদয় থাকে, আর কুরআনের হৃদয় হলো সূরা ইয়াসিন।',
    },
    {
      question: 'পবিত্র কুরআনে সর্বমোট কতটি সূরা রয়েছে?',
      options: ['১১৪ টি', '১১২ টি', '১২০ টি', '১০০ টি'],
      correct: 0,
      explanation: 'পবিত্র কুরআনে ১১৪ টি পূর্ণাঙ্গ সূরা রয়েছে।',
    },
    {
      question: 'ইসলামের প্রথম খলিফা কে ছিলেন?',
      options: ['হযরত উমর (রা.)', 'হযরত আবু বকর সিদ্দিক (রা.)', 'হযরত উসমান (রা.)', 'হযরত আলী (রা.)'],
      correct: 1,
      explanation: 'হযরত আবু বকর সিদ্দিক (রা.) ছিলেন ইসলামের প্রথম খলিফা।',
    },
    {
      question: 'ইসলামের পঞ্চস্তম্ভের দ্বিতীয় স্তম্ভ কোনটি?',
      options: ['ঈমান / কালেমা', 'সালাত (নামাজ)', 'যাকাত', 'সিয়াম (রোজা)'],
      correct: 1,
      explanation: 'কালেমার পর ঈমানের প্রধান স্তম্ভ হলো সালাত বা নামাজ কায়েম করা।',
    },
    {
      question: 'পবিত্র কুরআনের সবচেয়ে দীর্ঘতম সূরা কোনটি?',
      options: ['সূরা আলে ইমরান', 'সূরা আন-নিসা', 'সূরা আল-বাকারা', 'সূরা আল-মায়েদা'],
      correct: 2,
      explanation: 'সূরা আল-বাকারা হলো কুরআনের বৃহত্তম সূরা, যার মোট আয়াত ২৮৬টি।',
    },
  ];

  if (!isOpen) return null;

  const handleSelectAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === quizQuestions[currentQIndex].correct) {
      setScore((s) => s + 20);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < quizQuestions.length - 1) {
      setCurrentQIndex((c) => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished
      setIsAnswered(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setStreak(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in">
      <div className="bg-[#242526] border border-[#393a3b] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-[#e4e6eb]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#393a3b]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-white shadow">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Instant Games (হালাল গেমস)</h2>
              <p className="text-[11px] text-[#b0b3b8]">ইসলামিক কুইজ, ব্রেইন ট্রেইনার ও শিক্ষণীয় গেমস</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#3a3b3c] text-[#b0b3b8] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedGame === 'hub' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-blue-500/10 to-[#242526] border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-white">দৈনিক ইসলামিক কুইজ লীগ</h3>
                  </div>
                  <p className="text-xs text-[#b0b3b8]">১০০% ইসলামিক ও কোনো সময় অপচয় নয়</p>
                </div>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  স্কোর: {score} XP
                </span>
              </div>

              {/* Game cards */}
              <div className="grid grid-cols-1 gap-3">
                {/* 1. Islamic Quiz */}
                <div
                  onClick={() => setSelectedGame('quiz')}
                  className="p-4 rounded-2xl bg-[#18191a] border border-[#393a3b] hover:border-[#1877F2] transition-colors cursor-pointer group flex items-center gap-3.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">কুরআন ও হাদিস কুইজ চ্যালেঞ্জ</h4>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">
                        ৫ প্রশ্ন
                      </span>
                    </div>
                    <p className="text-xs text-[#b0b3b8]">আপনার দ্বীনি জ্ঞান পরীক্ষা করুন এবং XP অর্জন করুন</p>
                  </div>
                </div>

                {/* 2. Arabic Vocabulary match */}
                <div
                  onClick={() => setSelectedGame('quiz')}
                  className="p-4 rounded-2xl bg-[#18191a] border border-[#393a3b] hover:border-emerald-500 transition-colors cursor-pointer group flex items-center gap-3.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl shadow flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-white">আল্লাহর ৯৯ নাম ও অর্থ ম্যাচ</h4>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                        মেমোরি গেম
                      </span>
                    </div>
                    <p className="text-xs text-[#b0b3b8]">আসমাউল হুসনা মুখস্থ করার ইন্টারেক্টিভ খেলা</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedGame === 'quiz' && (
            <div className="space-y-4">
              {/* Quiz Header */}
              <div className="flex items-center justify-between bg-[#18191a] p-3 rounded-xl border border-[#393a3b]">
                <button
                  onClick={() => setSelectedGame('hub')}
                  className="text-xs text-[#b0b3b8] hover:text-white font-bold"
                >
                  ← গেম মেনু
                </button>
                <div className="flex items-center gap-2">
                  {streak > 1 && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                      <Flame className="w-3.5 h-3.5 fill-current" /> {streak} স্ট্রিক!
                    </span>
                  )}
                  <span className="text-xs font-bold text-emerald-400">স্কোর: {score} XP</span>
                </div>
              </div>

              {/* Progress */}
              <div className="w-full bg-[#393a3b] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#1877F2] h-full transition-all"
                  style={{ width: `${((currentQIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="space-y-3">
                <span className="text-xs text-[#b0b3b8] font-bold">
                  প্রশ্ন {currentQIndex + 1} / {quizQuestions.length}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {quizQuestions[currentQIndex].question}
                </h3>

                <div className="space-y-2 pt-2">
                  {quizQuestions[currentQIndex].options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === quizQuestions[currentQIndex].correct;
                    let btnStyle = 'bg-[#18191a] border-[#393a3b] text-[#e4e6eb] hover:bg-[#2e2f30]';

                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 line-through';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectAnswer(idx)}
                        disabled={isAnswered}
                        className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-200 animate-in fade-in space-y-1">
                    <p className="font-bold flex items-center gap-1 text-blue-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>বিশ্লেষণ:</span>
                    </p>
                    <p>{quizQuestions[currentQIndex].explanation}</p>
                  </div>
                )}
              </div>

              {isAnswered && (
                <div className="pt-2">
                  {currentQIndex < quizQuestions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs shadow"
                    >
                      পরবর্তী প্রশ্ন →
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-1">
                        <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
                        <h4 className="font-bold text-white text-sm">মাশাআল্লাহ! কুইজ সম্পন্ন</h4>
                        <p className="text-xs text-emerald-300">আপনি {score} / 100 XP অর্জন করেছেন!</p>
                      </div>
                      <button
                        onClick={handleRestartQuiz}
                        className="w-full py-2.5 rounded-xl bg-[#3a3b3c] hover:bg-[#4e4f50] text-white font-bold text-xs flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>আবার খেলুন</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

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
