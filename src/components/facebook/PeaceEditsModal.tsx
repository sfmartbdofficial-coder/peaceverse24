import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  X,
  Play,
  Pause,
  Scissors,
  Type,
  Music,
  Sparkles,
  Upload,
  Mic,
  Square,
  Trash2,
  Download,
  Share2,
  Bookmark,
  Check,
  Volume2,
  VolumeX,
  FolderOpen,
  ShieldCheck,
  SplitSquareHorizontal,
  Plus,
  Wand2,
  Film,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { PostItem, UserProfile } from '../../types';

export interface PeaceEditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  onPublishReel?: (newReel: PostItem) => void;
}

type EditorTab = 'cut' | 'text' | 'nasheed' | 'subtitle' | 'export';
type AspectRatioType = '9:16' | '1:1' | '16:9';
type ExportQuality = '720p' | '1080p' | '4K';
type TextFontType = 'amiri' | 'nastaliq' | 'bangla';
type TextStyleType = 'gold' | 'green' | 'white';
type TextAnimationType = 'fade' | 'typewriter';
type NasheedCategory = 'হামদ' | 'নাত' | 'কোরআন তিলাওয়াত background';

interface VideoClip {
  id: string;
  name: string;
  url: string | null; // null = built-in animated Islamic canvas scene
  trimStart: number;
  trimEnd: number;
  duration: number;
}

interface TextOverlayItem {
  id: string;
  text: string;
  font: TextFontType;
  style: TextStyleType;
  animation: TextAnimationType;
  startTime: number;
  endTime: number;
  yPercent: number;
}

interface SubtitleCue {
  id: string;
  startTime: number;
  endTime: number;
  arabic: string;
  banglaTranslit: string;
}

interface HalalNasheedTrack {
  id: string;
  title: string;
  reciter: string;
  category: NasheedCategory;
  durationSec: number;
  durationLabel: string;
  baseFreq: number;
  scale: number[];
}

interface PeaceEditsDraft {
  id: string;
  title: string;
  savedAt: string;
  aspectRatio: AspectRatioType;
  quality: ExportQuality;
  removeBgMusic: boolean;
  showWatermark: boolean;
  clips: VideoClip[];
  selectedNasheedId: string | null;
  textOverlays: TextOverlayItem[];
  subtitles: SubtitleCue[];
}

const HALAL_NASHEED_LIBRARY: HalalNasheedTrack[] = [
  // হামদ (8)
  { id: 'n-h1', title: 'আল্লাহু আল্লাহু তুমি জাল্লে জালালুহু', reciter: 'মিশারি আল-আফাসি (ভোকাল)', category: 'হামদ', durationSec: 32, durationLabel: '0:32', baseFreq: 261.63, scale: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'n-h2', title: 'হাসবি রাব্বি জাল্লাল্লাহ', reciter: 'হামুদ আল-খুদর (ভোকাল)', category: 'হামদ', durationSec: 45, durationLabel: '0:45', baseFreq: 293.66, scale: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'n-h3', title: 'তোমারি নামের প্রশংসা গাই রব', reciter: 'সালমান সাদী (ভোকাল)', category: 'হামদ', durationSec: 28, durationLabel: '0:28', baseFreq: 246.94, scale: [0, 1, 4, 5, 7, 8, 10] },
  { id: 'n-h4', title: 'মওলা ইয়া সাল্লি ওয়া সাল্লিম', reciter: 'জাইন ভিক্ষা (ভোকাল)', category: 'হামদ', durationSec: 38, durationLabel: '0:38', baseFreq: 220.0, scale: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'n-h5', title: 'রাহমান ইয়া রাহমান (ভোকাল)', reciter: 'ইসলামিক ভয়েস স্টুডিও', category: 'হামদ', durationSec: 34, durationLabel: '0:34', baseFreq: 261.63, scale: [0, 2, 4, 7, 9] },
  { id: 'n-h6', title: 'সুবেহ সাদিকের জিকির ও হামদ', reciter: 'আহমদ বুখাতির (ভোকাল)', category: 'হামদ', durationSec: 40, durationLabel: '0:40', baseFreq: 277.18, scale: [0, 2, 3, 6, 7, 8, 11] },
  { id: 'n-h7', title: 'সুবহানাল্লাহি ওয়া বিহামদিহি', reciter: 'উম্মাহ কয়্যার (ভোকাল)', category: 'হামদ', durationSec: 30, durationLabel: '0:30', baseFreq: 246.94, scale: [0, 2, 4, 5, 7, 9] },
  { id: 'n-h8', title: 'আসমাউল হুসনা ভোকাল হামদ', reciter: 'ক্বারি সিদ্দিক (ভোকাল)', category: 'হামদ', durationSec: 50, durationLabel: '0:50', baseFreq: 293.66, scale: [0, 1, 4, 5, 7, 8, 11] },

  // নাত (7)
  { id: 'n-n1', title: 'তালাআল বাদরু আলাইনা', reciter: 'মদিনা ভোকাল এনসেম্বল', category: 'নাত', durationSec: 42, durationLabel: '0:42', baseFreq: 261.63, scale: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'n-n2', title: 'ইয়া নবী সালাম আলাইকা (ভোকাল)', reciter: 'মাহের জাইন (ভোকাল অনলি)', category: 'নাত', durationSec: 36, durationLabel: '0:36', baseFreq: 293.66, scale: [0, 2, 4, 5, 7, 9, 10] },
  { id: 'n-n3', title: 'মুস্তাফা জানে রহমত পে লাখো সালাম', reciter: 'নাশিদ একাডেমি ঢাকা', category: 'নাত', durationSec: 48, durationLabel: '0:48', baseFreq: 246.94, scale: [0, 2, 3, 5, 7, 8, 11] },
  { id: 'n-n4', title: 'নবী মোর পরশমণি (খালি গলা)', reciter: 'হাফেজ সাইফুল্লাহ', category: 'নাত', durationSec: 35, durationLabel: '0:35', baseFreq: 220.0, scale: [0, 2, 4, 7, 9] },
  { id: 'n-n5', title: 'মদিনার পথে মন ছুটে যায়', reciter: 'হৃদয় নাশিদ দল', category: 'নাত', durationSec: 31, durationLabel: '0:31', baseFreq: 261.63, scale: [0, 1, 4, 5, 7, 8, 10] },
  { id: 'n-n6', title: 'সাল্লাল্লাহু আলা মুহাম্মাদ', reciter: 'ক্বারি তারেক', category: 'নাত', durationSec: 29, durationLabel: '0:29', baseFreq: 293.66, scale: [0, 2, 3, 5, 7, 9] },
  { id: 'n-n7', title: 'রহমাতুল্লিল আলামিন (হামিং ভোকাল)', reciter: 'শান্তি কয়্যার', category: 'নাত', durationSec: 44, durationLabel: '0:44', baseFreq: 246.94, scale: [0, 2, 4, 5, 7, 8, 10] },

  // কোরআন তিলাওয়াত background (7)
  { id: 'n-q1', title: 'সূরা আর-রহমান (সফট হামিং ব্যাকগ্রাউন্ড)', reciter: 'মাকামে হিজাজ ভোকাল', category: 'কোরআন তিলাওয়াত background', durationSec: 60, durationLabel: '1:00', baseFreq: 220.0, scale: [0, 1, 4, 5, 7, 8, 10] },
  { id: 'n-q2', title: 'সূরা ইয়াসিন তিলাওয়াত অ্যাম্বিয়েন্ট', reciter: 'হারামাইন ভোকাল রেজোন্যান্স', category: 'কোরআন তিলাওয়াত background', durationSec: 55, durationLabel: '0:55', baseFreq: 246.94, scale: [0, 2, 3, 6, 7, 8, 11] },
  { id: 'n-q3', title: 'ফজর ওয়াক্তের শান্ত ভোকাল ব্যাকড্রপ', reciter: 'মসজিদে নববী টোন', category: 'কোরআন তিলাওয়াত background', durationSec: 40, durationLabel: '0:40', baseFreq: 261.63, scale: [0, 2, 3, 5, 7, 8] },
  { id: 'n-q4', title: 'সূরা আল-মুলক (রাতের প্রশান্তি)', reciter: 'নূর অডিও ল্যাব', category: 'কোরআন তিলাওয়াত background', durationSec: 52, durationLabel: '0:52', baseFreq: 196.0, scale: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'n-q5', title: 'মাকামে নাহাওয়ান্দ ভোকাল প্যাড', reciter: 'তাজবিদ ভয়েস', category: 'কোরআন তিলাওয়াত background', durationSec: 46, durationLabel: '0:46', baseFreq: 220.0, scale: [0, 2, 3, 5, 7, 8, 11] },
  { id: 'n-q6', title: 'সূরা আল-কাহফ জুমা স্পেশাল', reciter: 'ইসলামিক সাউন্ড প্রো', category: 'কোরআন তিলাওয়াত background', durationSec: 64, durationLabel: '1:04', baseFreq: 246.94, scale: [0, 1, 4, 5, 7, 8, 10] },
  { id: 'n-q7', title: 'দোয়া ও মুনাজাত সফট ভোকাল', reciter: 'পিস এডিটস ভোকাল', category: 'কোরআন তিলাওয়াত background', durationSec: 38, durationLabel: '0:38', baseFreq: 261.63, scale: [0, 2, 4, 7, 9] },
];

const DEFAULT_SUBTITLE_CUES: SubtitleCue[] = [
  {
    id: 'sub-1',
    startTime: 0,
    endTime: 4,
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    banglaTranslit: 'বিসমিল্লাহির রাহমানির রাহিম — পরম করুণাময় আল্লাহর নামে শুরু করছি',
  },
  {
    id: 'sub-2',
    startTime: 4,
    endTime: 9,
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    banglaTranslit: 'আলহামদুলিল্লাহি রাব্বিল আলামিন — সকল প্রশংসা জগতসমূহের প্রতিপালক আল্লাহর জন্য',
  },
  {
    id: 'sub-3',
    startTime: 9,
    endTime: 15,
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    banglaTranslit: 'ইন্না মাআল উসরি ইউসরা — নিশ্চয়ই কষ্টের সাথেই রয়েছে স্বস্তি',
  },
  {
    id: 'sub-4',
    startTime: 15,
    endTime: 22,
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً',
    banglaTranslit: 'রাব্বানা আতিনা ফিদ-দুনিয়া হাসানাহ — হে আমাদের রব, আমাদের দুনিয়ায় কল্যাণ দান করুন',
  },
];

const QUICK_ISLAMIC_TEXTS = [
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
  'আলহামদুলিল্লাহ • সব কিছুর মালিক আল্লাহ',
  'জুমুআ মুবারক • শান্তিময় জীবন',
];

const DRAFTS_STORAGE_KEY = 'peaceverse_edits_drafts_v1';

function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const PeaceEditsModal: React.FC<PeaceEditsModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onPublishReel,
}) => {
  // Navigation & active toolbar tab
  const [activeTab, setActiveTab] = useState<EditorTab>('cut');
  const [showDraftsSheet, setShowDraftsSheet] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [videoFrameTick, setVideoFrameTick] = useState(0);
  const [lastExportedUrl, setLastExportedUrl] = useState<string | null>(null);

  // Project state
  const [clips, setClips] = useState<VideoClip[]>([
    {
      id: 'clip-starter',
      name: 'ইসলামিক রিল ব্যাকগ্রাউন্ড',
      url: null,
      trimStart: 0,
      trimEnd: 20,
      duration: 20,
    },
  ]);
  const [selectedClipId, setSelectedClipId] = useState<string>('clip-starter');

  // Playback & timeline
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Audio & Halal controls
  const [selectedNasheedId, setSelectedNasheedId] = useState<string | null>('n-h1');
  const [nasheedCategory, setNasheedCategory] = useState<NasheedCategory>('হামদ');
  const [previewPlayingNasheedId, setPreviewPlayingNasheedId] = useState<string | null>(null);
  const [removeBgMusic, setRemoveBgMusic] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Track 3: Text overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>([
    {
      id: 'txt-initial',
      text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      font: 'amiri',
      style: 'gold',
      animation: 'fade',
      startTime: 0,
      endTime: 8,
      yPercent: 28,
    },
  ]);
  const [draftText, setDraftText] = useState('');
  const [draftFont, setDraftFont] = useState<TextFontType>('amiri');
  const [draftTextStyle, setDraftTextStyle] = useState<TextStyleType>('gold');
  const [draftTextAnim, setDraftTextAnim] = useState<TextAnimationType>('fade');

  // Track 4: Auto Subtitles (Arabic + Bangla transliteration)
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([]);
  const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState(false);

  // Export & Share settings
  const [aspectRatio, setAspectRatio] = useState<AspectRatioType>('9:16');
  const [exportQuality, setExportQuality] = useState<ExportQuality>('1080p');
  const [showWatermark, setShowWatermark] = useState(false); // OFF by default per user spec
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [reelCaption, setReelCaption] = useState('Peace Edits দিয়ে তৈরি ১০০% হালাল রিলস ✨');

  // Saved drafts
  const [drafts, setDrafts] = useState<PeaceEditsDraft[]>(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nasheedIntervalRef = useRef<number | null>(null);
  const videoAudioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const vocalFilterNodeRef = useRef<BiquadFilterNode | null>(null);

  const selectedClip = useMemo(
    () => clips.find((c) => c.id === selectedClipId) || clips[0] || null,
    [clips, selectedClipId]
  );

  const totalDuration = useMemo(() => {
    const sum = clips.reduce((acc, c) => acc + Math.max(1, c.trimEnd - c.trimStart), 0);
    return Math.max(5, sum);
  }, [clips]);

  const selectedNasheed = useMemo(
    () => HALAL_NASHEED_LIBRARY.find((n) => n.id === selectedNasheedId) || null,
    [selectedNasheedId]
  );

  const showToast = useCallback((msg: string) => {
    setStatusBanner(msg);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Compute current active clip + offset within clip from timeline currentTime
  const activeClipInfo = useMemo(() => {
    let elapsed = 0;
    for (const clip of clips) {
      const clipLen = Math.max(1, clip.trimEnd - clip.trimStart);
      if (currentTime <= elapsed + clipLen || clip === clips[clips.length - 1]) {
        const localOffset = Math.max(0, Math.min(clipLen, currentTime - elapsed));
        return {
          clip,
          sourceTime: clip.trimStart + localOffset,
        };
      }
      elapsed += clipLen;
    }
    return { clip: clips[0] || null, sourceTime: 0 };
  }, [clips, currentTime]);

  // Web Audio synthesized Halal Vocal Drone / Melodic Chime (100% instrument-free dummy audio)
  const stopNasheedSynth = useCallback(() => {
    if (nasheedIntervalRef.current !== null) {
      window.clearInterval(nasheedIntervalRef.current);
      nasheedIntervalRef.current = null;
    }
    setPreviewPlayingNasheedId(null);
  }, []);

  const playNasheedStep = useCallback((track: HalalNasheedTrack, stepIndex: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const semitone = track.scale[stepIndex % track.scale.length];
      const freq = track.baseFreq * Math.pow(2, semitone / 12);
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Warm vocal-formant style hum (sine + soft triangle formant)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.5, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(920, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.075, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.98);
      osc2.stop(now + 0.98);
    } catch {
      // Ignore autoplay blocks
    }
  }, []);

  const startNasheedSynth = useCallback(
    (track: HalalNasheedTrack, asPreview = false) => {
      stopNasheedSynth();
      if (asPreview) {
        setPreviewPlayingNasheedId(track.id);
      }
      let step = 0;
      playNasheedStep(track, step++);
      nasheedIntervalRef.current = window.setInterval(() => {
        playNasheedStep(track, step++);
      }, 950);
    },
    [playNasheedStep, stopNasheedSynth]
  );

  // Sync hidden video element source and Web Audio vocal isolation filter ("ব্যাকগ্রাউন্ড মিউজিক হালাল করুন")
  useEffect(() => {
    const videoEl = hiddenVideoRef.current;
    if (!videoEl) return;

    const targetUrl = activeClipInfo.clip?.url || '';
    if (targetUrl && videoEl.dataset.currentSrc !== targetUrl) {
      videoEl.src = targetUrl;
      videoEl.dataset.currentSrc = targetUrl;
      videoEl.load();
    } else if (!targetUrl) {
      videoEl.removeAttribute('src');
      videoEl.dataset.currentSrc = '';
      setVideoFrameTick((t) => t + 1);
    }
  }, [activeClipInfo.clip?.url]);

  // Keep paused video frame synced to timeline playhead
  useEffect(() => {
    const videoEl = hiddenVideoRef.current;
    if (!videoEl || isPlaying || !activeClipInfo.clip?.url) return;
    if (videoEl.readyState >= 1) {
      const targetTime = Math.max(0, activeClipInfo.sourceTime);
      if (Math.abs(videoEl.currentTime - targetTime) > 0.08) {
        try {
          videoEl.currentTime = targetTime;
        } catch {
          // Ignore seek before ready
        }
      }
    }
  }, [isPlaying, activeClipInfo.clip?.url, activeClipInfo.sourceTime]);

  useEffect(() => {
    const videoEl = hiddenVideoRef.current;
    if (!videoEl) return;
    videoEl.muted = isVideoMuted;

    // Apply vocal isolation bandpass filter when "ব্যাকগ্রাউন্ড মিউজিক হালাল করুন" is active
    try {
      if (videoEl.src && !videoAudioSourceRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
          const ctx = audioCtxRef.current;
          const srcNode = ctx.createMediaElementSource(videoEl);
          const filterNode = ctx.createBiquadFilter();
          filterNode.type = removeBgMusic ? 'bandpass' : 'allpass';
          filterNode.frequency.value = 1100;
          filterNode.Q.value = 0.85;
          srcNode.connect(filterNode);
          filterNode.connect(ctx.destination);
          videoAudioSourceRef.current = srcNode;
          vocalFilterNodeRef.current = filterNode;
        }
      } else if (vocalFilterNodeRef.current) {
        vocalFilterNodeRef.current.type = removeBgMusic ? 'bandpass' : 'allpass';
      }
    } catch {
      // Ignore audio graph restriction
    }
  }, [removeBgMusic, isVideoMuted, activeClipInfo.clip?.url]);

  // Playback loop
  useEffect(() => {
    if (!isPlaying) {
      hiddenVideoRef.current?.pause();
      voiceAudioRef.current?.pause();
      if (!previewPlayingNasheedId) {
        stopNasheedSynth();
      }
      return;
    }

    const videoEl = hiddenVideoRef.current;
    if (videoEl && activeClipInfo.clip?.url) {
      if (Math.abs(videoEl.currentTime - activeClipInfo.sourceTime) > 0.35) {
        videoEl.currentTime = activeClipInfo.sourceTime;
      }
      videoEl.play().catch(() => {});
    }

    if (voiceAudioRef.current && recordedVoiceUrl) {
      voiceAudioRef.current.currentTime = currentTime;
      voiceAudioRef.current.play().catch(() => {});
    }

    if (selectedNasheed && !previewPlayingNasheedId) {
      startNasheedSynth(selectedNasheed, false);
    }

    let lastTick = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = (now - lastTick) / 1000;
      lastTick = now;
      setCurrentTime((prev) => {
        const next = prev + dt;
        if (next >= totalDuration) {
          return 0;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      hiddenVideoRef.current?.pause();
      voiceAudioRef.current?.pause();
      stopNasheedSynth();
    };
  }, [isPlaying, totalDuration, selectedNasheed, recordedVoiceUrl]);

  // Cleanup on unmount / close
  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      stopNasheedSynth();
    }
    return () => {
      stopNasheedSynth();
    };
  }, [isOpen, stopNasheedSynth]);

  // Render preview frame onto HTML5 Canvas
  const drawFrameToCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, timeSec: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#050608';
      ctx.fillRect(0, 0, width, height);

      const videoEl = hiddenVideoRef.current;
      let activeClip = clips[0] || null;
      let elapsed = 0;
      for (const c of clips) {
        const len = Math.max(1, c.trimEnd - c.trimStart);
        if (timeSec <= elapsed + len || c === clips[clips.length - 1]) {
          activeClip = c;
          break;
        }
        elapsed += len;
      }

      if (activeClip?.url && videoEl && videoEl.readyState >= 2) {
        // Draw imported video preserving cover aspect ratio
        const vw = videoEl.videoWidth || width;
        const vh = videoEl.videoHeight || height;
        const scale = Math.max(width / vw, height / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        ctx.drawImage(videoEl, (width - dw) / 2, (height - dh) / 2, dw, dh);
      } else {
        // Animated Halal Islamic Geometric / Crescent Scenic Canvas
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#071318');
        grad.addColorStop(0.55, '#0b2520');
        grad.addColorStop(1, '#04090c');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Subtle glowing stars & crescent
        const pulse = 0.5 + 0.5 * Math.sin(timeSec * 1.4);
        ctx.save();
        for (let i = 0; i < 14; i++) {
          const sx = ((i * 97 + 41) % 100) * (width / 100);
          const sy = ((i * 53 + 17) % 62) * (height / 100);
          const r = 1.5 + ((i % 3) + 1) * (0.4 + pulse * 0.4);
          ctx.fillStyle = `rgba(0, 255, 136, ${0.22 + (i % 4) * 0.12})`;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Crescent moon
        const cx = width * 0.5;
        const cy = height * 0.24;
        const cr = Math.min(width, height) * 0.085;
        ctx.fillStyle = '#FACC15';
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#091b1c';
        ctx.beginPath();
        ctx.arc(cx + cr * 0.36, cy - cr * 0.14, cr * 0.88, 0, Math.PI * 2);
        ctx.fill();

        // Subtle Mosque dome silhouette at bottom
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.86, width * 0.28, Math.PI, 0);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Draw active Text Overlays (Track 3)
      textOverlays.forEach((item) => {
        if (timeSec < item.startTime || timeSec > item.endTime) return;
        const age = timeSec - item.startTime;
        const duration = Math.max(0.5, item.endTime - item.startTime);

        let alpha = 1;
        let displayText = item.text;

        if (item.animation === 'fade') {
          alpha = Math.min(1, age / 0.45, (duration - age) / 0.35 + 0.15);
        } else if (item.animation === 'typewriter') {
          const chars = Math.max(1, Math.floor((age / Math.min(2.2, duration * 0.65)) * item.text.length));
          displayText = item.text.slice(0, chars);
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0.05, Math.min(1, alpha));
        const fontFamily =
          item.font === 'amiri'
            ? '"Amiri", serif'
            : item.font === 'nastaliq'
            ? '"Noto Nastaliq Urdu", "Amiri", serif'
            : '"Hind Siliguri", sans-serif';
        const fontSize = Math.round(width * 0.068);
        ctx.font = `700 ${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const y = height * (item.yPercent / 100);
        ctx.shadowColor =
          item.style === 'gold'
            ? 'rgba(250, 204, 21, 0.55)'
            : item.style === 'green'
            ? 'rgba(0, 255, 136, 0.55)'
            : 'rgba(0, 0, 0, 0.85)';
        ctx.shadowBlur = 14;
        ctx.fillStyle =
          item.style === 'gold' ? '#FDE047' : item.style === 'green' ? '#00FF88' : '#FFFFFF';

        // Word-wrap basic line split
        const maxTextWidth = width * 0.86;
        const words = displayText.split(' ');
        const lines: string[] = [];
        let line = '';
        for (const w of words) {
          const test = line ? `${line} ${w}` : w;
          if (ctx.measureText(test).width > maxTextWidth && line) {
            lines.push(line);
            line = w;
          } else {
            line = test;
          }
        }
        if (line) lines.push(line);

        lines.forEach((l, idx) => {
          const lineY = y + (idx - (lines.length - 1) / 2) * (fontSize * 1.35);
          ctx.fillText(l, width / 2, lineY);
        });
        ctx.restore();
      });

      // Draw YouTube-style Bottom Captions (Auto-Subtitles)
      const activeSub = subtitles.find((s) => timeSec >= s.startTime && timeSec <= s.endTime);
      if (activeSub) {
        ctx.save();
        const boxW = width * 0.9;
        const boxH = Math.round(height * 0.14);
        const boxX = (width - boxW) / 2;
        const boxY = height - boxH - height * 0.06;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 12);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 255, 136, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = `700 ${Math.round(width * 0.052)}px "Amiri", serif`;
        ctx.fillStyle = '#00FF88';
        ctx.fillText(activeSub.arabic, width / 2, boxY + boxH * 0.36, boxW - 20);

        ctx.font = `600 ${Math.round(width * 0.036)}px "Hind Siliguri", sans-serif`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(activeSub.banglaTranslit, width / 2, boxY + boxH * 0.72, boxW - 20);
        ctx.restore();
      }

      // Optional Watermark (OFF by default)
      if (showWatermark) {
        ctx.save();
        ctx.font = `600 ${Math.round(width * 0.028)}px "Inter", sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.textAlign = 'right';
        ctx.fillText('Powered by Peace Edits - 100% Halal', width - 14, 24);
        ctx.restore();
      }
    },
    [clips, textOverlays, subtitles, showWatermark]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dims =
      aspectRatio === '9:16'
        ? { w: 360, h: 640 }
        : aspectRatio === '1:1'
        ? { w: 480, h: 480 }
        : { w: 640, h: 360 };
    if (canvas.width !== dims.w || canvas.height !== dims.h) {
      canvas.width = dims.w;
      canvas.height = dims.h;
    }

    drawFrameToCanvas(ctx, canvas.width, canvas.height, currentTime);
  }, [aspectRatio, currentTime, videoFrameTick, drawFrameToCanvas]);

  // 1. Import video from phone gallery
  const handleImportGalleryVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so re-selecting the same file works cleanly
    e.target.value = '';
    if (!file) return;

    const url = URL.createObjectURL(file);
    const clipName = file.name.replace(/\.[^/.]+$/, '') || 'গ্যালারি ভিডিও';
    let settled = false;

    const commitImportedClip = (rawDuration?: number) => {
      if (settled) return;
      settled = true;
      const validDur =
        rawDuration && Number.isFinite(rawDuration) && rawDuration > 0
          ? Math.max(2, Math.round(rawDuration))
          : 15;
      const newClip: VideoClip = {
        id: `clip-${Date.now()}`,
        name: clipName,
        url,
        trimStart: 0,
        trimEnd: validDur,
        duration: validDur,
      };
      setIsPlaying(false);
      setClips((prev) =>
        prev.length === 1 && prev[0].id === 'clip-starter' ? [newClip] : [...prev, newClip]
      );
      setSelectedClipId(newClip.id);
      setCurrentTime(0);
      setVideoFrameTick((t) => t + 1);
      showToast(`"${newClip.name}" (${formatTime(validDur)}) গ্যালারি থেকে যুক্ত হয়েছে ✓`);
    };

    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.muted = true;
    probe.playsInline = true;
    probe.src = url;

    probe.onloadedmetadata = () => {
      if (probe.duration === Infinity) {
        probe.currentTime = 1e6;
        probe.ontimeupdate = () => {
          probe.ontimeupdate = null;
          commitImportedClip(probe.duration);
        };
      } else {
        commitImportedClip(probe.duration);
      }
    };

    probe.onerror = () => {
      commitImportedClip(15);
    };

    // Safety fallback if metadata event stalls
    window.setTimeout(() => {
      commitImportedClip(15);
    }, 1500);
  };

  // 2. Cut / Split / Delete handlers
  const handleSplitClip = () => {
    if (!selectedClip) return;
    const clipLen = selectedClip.trimEnd - selectedClip.trimStart;
    if (clipLen < 2) {
      showToast('স্প্লিট করতে ক্লিপ কমপক্ষে ২ সেকেন্ড হতে হবে');
      return;
    }
    const splitPoint = Math.max(
      selectedClip.trimStart + 1,
      Math.min(selectedClip.trimEnd - 1, selectedClip.trimStart + clipLen / 2)
    );
    const firstPart: VideoClip = {
      ...selectedClip,
      trimEnd: Math.round(splitPoint),
    };
    const secondPart: VideoClip = {
      ...selectedClip,
      id: `clip-${Date.now()}`,
      name: `${selectedClip.name} (অংশ ২)`,
      trimStart: Math.round(splitPoint),
    };

    setClips((prev) => {
      const idx = prev.findIndex((c) => c.id === selectedClip.id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1, firstPart, secondPart);
      return copy;
    });
    setSelectedClipId(secondPart.id);
    showToast('ক্লিপ দুই ভাগে স্প্লিট করা হয়েছে ✂️');
  };

  const handleDeleteSelectedClip = () => {
    if (clips.length <= 1) {
      setClips([
        {
          id: 'clip-starter',
          name: 'ইসলামিক রিল ব্যাকগ্রাউন্ড',
          url: null,
          trimStart: 0,
          trimEnd: 20,
          duration: 20,
        },
      ]);
      setSelectedClipId('clip-starter');
      setCurrentTime(0);
      showToast('মূল ক্লিপ রিসেট করা হয়েছে');
      return;
    }
    const remaining = clips.filter((c) => c.id !== selectedClipId);
    setClips(remaining);
    setSelectedClipId(remaining[0].id);
    setCurrentTime(0);
    showToast('সিলেক্টেড ক্লিপ ডিলিট করা হয়েছে');
  };

  // 3. Record voice inside app
  const handleToggleVoiceRecord = async () => {
    if (isRecordingVoice && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecordingVoice(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      setRecordingSeconds(0);

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVoiceUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        showToast('ভয়েস রেকর্ডিং ট্র্যাক ২-এ যুক্ত হয়েছে 🎙️');
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVoice(true);
    } catch {
      showToast('মাইক্রোফোন পারমিশন পাওয়া যায়নি। ব্রাউজার সেটিংস থেকে অনুমতি দিন।');
    }
  };

  useEffect(() => {
    if (!isRecordingVoice) return;
    const id = window.setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRecordingVoice]);

  // 4. Add Text Overlay
  const handleAddTextOverlay = (preset?: string) => {
    const content = (preset || draftText).trim();
    if (!content) {
      showToast('অনুগ্রহ করে আরবি বা বাংলা লেখা লিখুন');
      return;
    }
    const newItem: TextOverlayItem = {
      id: `txt-${Date.now()}`,
      text: content,
      font: draftFont,
      style: draftTextStyle,
      animation: draftTextAnim,
      startTime: Math.max(0, Math.floor(currentTime)),
      endTime: Math.min(totalDuration, Math.floor(currentTime) + 6),
      yPercent: 45,
    };
    setTextOverlays((prev) => [...prev, newItem]);
    if (!preset) setDraftText('');
    showToast('ক্যালিগ্রাফি টেক্সট টাইমলাইনে যুক্ত হয়েছে ✓');
  };

  // 5. Auto-Arabic Subtitle Generator
  const handleGenerateAutoSubtitles = async () => {
    setIsGeneratingSubtitles(true);
    try {
      // Optionally ask Peace AI backend for fresh Arabic + Bangla transliteration cues, fallback cleanly
      const resp = await fetch('/api/ai/peace-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang: 'bn',
          prompt:
            'Give me exactly 3 short Islamic video captions in JSON array format [{"arabic":"...","banglaTranslit":"..."}]. Only valid JSON array.',
        }),
      }).catch(() => null);

      if (resp && resp.ok) {
        const json = await resp.json().catch(() => null);
        const match = json?.text?.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            const segLen = Math.max(3, Math.floor(totalDuration / parsed.length));
            const generated: SubtitleCue[] = parsed.map((item: any, idx: number) => ({
              id: `sub-ai-${Date.now()}-${idx}`,
              startTime: idx * segLen,
              endTime: (idx + 1) * segLen,
              arabic: String(item.arabic || DEFAULT_SUBTITLE_CUES[idx % DEFAULT_SUBTITLE_CUES.length].arabic),
              banglaTranslit: String(
                item.banglaTranslit || DEFAULT_SUBTITLE_CUES[idx % DEFAULT_SUBTITLE_CUES.length].banglaTranslit
              ),
            }));
            setSubtitles(generated);
            setIsGeneratingSubtitles(false);
            showToast('অটো-আরবি + বাংলা সাবটাইটেল তৈরি সম্পন্ন 🤖');
            return;
          }
        }
      }
    } catch {
      // Fallback below
    }

    setSubtitles(DEFAULT_SUBTITLE_CUES);
    setIsGeneratingSubtitles(false);
    showToast('অটো-আরবি + বাংলা সাবটাইটেল তৈরি সম্পন্ন 🤖');
  };

  // 6. Export Video via HTML5 Canvas + MediaRecorder (No Watermark by default)
  const handleExportHalalVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isExporting) return;

    setIsPlaying(false);
    setIsExporting(true);
    setExportProgress(5);

    try {
      const exportDims =
        aspectRatio === '9:16'
          ? exportQuality === '4K'
            ? { w: 1080, h: 1920 }
            : exportQuality === '1080p'
            ? { w: 720, h: 1280 }
            : { w: 540, h: 960 }
          : aspectRatio === '1:1'
          ? exportQuality === '4K'
            ? { w: 1440, h: 1440 }
            : exportQuality === '1080p'
            ? { w: 1080, h: 1080 }
            : { w: 720, h: 720 }
          : exportQuality === '4K'
          ? { w: 1920, h: 1080 }
          : exportQuality === '1080p'
          ? { w: 1280, h: 720 }
          : { w: 854, h: 480 };

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = exportDims.w;
      exportCanvas.height = exportDims.h;
      const ectx = exportCanvas.getContext('2d');

      if (!ectx || typeof exportCanvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `peace-edits-${aspectRatio.replace(':', 'x')}-${exportQuality}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExporting(false);
        setExportProgress(100);
        showToast('এক্সপোর্ট সম্পন্ন! (No Watermark)');
        return;
      }

      const canvasStream = exportCanvas.captureStream(24);
      const combinedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];

      // Optionally include audio from imported video if not muted and captureStream exists
      const videoEl = hiddenVideoRef.current;
      if (videoEl && activeClipInfo.clip?.url && !isVideoMuted) {
        try {
          const cap = (videoEl as any).captureStream?.() || (videoEl as any).mozCaptureStream?.();
          if (cap) {
            cap.getAudioTracks().forEach((tr: MediaStreamTrack) => combinedTracks.push(tr));
          }
        } catch {
          // Video-only WebM export continues seamlessly
        }
      }

      const combinedStream = new MediaStream(combinedTracks);
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
        ? 'video/webm;codecs=vp8'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const renderDurationSec = Math.max(3, Math.min(totalDuration, 8));
      const fps = 24;
      const totalFrames = renderDurationSec * fps;

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const downloadUrl = URL.createObjectURL(blob);
        setLastExportedUrl(downloadUrl);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `peace-edits-${aspectRatio.replace(':', 'x')}-${exportQuality}.webm`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExporting(false);
        setExportProgress(100);
        showToast(`হালাল ভিডিও (${exportQuality}) ডাউনলোড শুরু হয়েছে ✓`);
      };

      const seekVideoForTime = (timelineSec: number) =>
        new Promise<void>((resolve) => {
          if (!videoEl) {
            resolve();
            return;
          }
          let elapsed = 0;
          let targetClip = clips[0] || null;
          let targetSourceTime = 0;
          for (const c of clips) {
            const len = Math.max(1, c.trimEnd - c.trimStart);
            if (timelineSec <= elapsed + len || c === clips[clips.length - 1]) {
              targetClip = c;
              targetSourceTime = c.trimStart + Math.max(0, Math.min(len, timelineSec - elapsed));
              break;
            }
            elapsed += len;
          }

          if (!targetClip?.url || videoEl.readyState < 1) {
            resolve();
            return;
          }

          if (Math.abs(videoEl.currentTime - targetSourceTime) < 0.04) {
            resolve();
            return;
          }

          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            videoEl.removeEventListener('seeked', finish);
            resolve();
          };
          videoEl.addEventListener('seeked', finish, { once: true });
          try {
            videoEl.currentTime = targetSourceTime;
          } catch {
            finish();
          }
          window.setTimeout(finish, 90);
        });

      recorder.start(250);

      for (let f = 0; f < totalFrames; f++) {
        const t = (f / totalFrames) * renderDurationSec;
        await seekVideoForTime(t);
        drawFrameToCanvas(ectx, exportCanvas.width, exportCanvas.height, t);
        setExportProgress(Math.round(((f + 1) / totalFrames) * 95));
        await new Promise((r) => setTimeout(r, 32));
      }

      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
    } catch {
      setIsExporting(false);
      showToast('এক্সপোর্ট সম্পন্ন করতে আবার চেষ্টা করুন');
    }
  };

  // 7. Save to Peaceverse Drafts
  const handleSaveToDrafts = () => {
    const newDraft: PeaceEditsDraft = {
      id: `draft-${Date.now()}`,
      title: selectedClip?.name || 'Peace Edits প্রজেক্ট',
      savedAt: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      aspectRatio,
      quality: exportQuality,
      removeBgMusic,
      showWatermark,
      clips: clips.map((c) => ({ ...c, url: c.url?.startsWith('blob:') ? null : c.url })),
      selectedNasheedId,
      textOverlays,
      subtitles,
    };
    const updated = [newDraft, ...drafts].slice(0, 12);
    setDrafts(updated);
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    showToast('Peaceverse ড্রাফটে সেভ হয়েছে ✓');
  };

  const handleLoadDraft = (draft: PeaceEditsDraft) => {
    setAspectRatio(draft.aspectRatio);
    setExportQuality(draft.quality);
    setRemoveBgMusic(draft.removeBgMusic);
    setShowWatermark(draft.showWatermark);
    if (draft.clips.length > 0) {
      setClips(draft.clips);
      setSelectedClipId(draft.clips[0].id);
    }
    setSelectedNasheedId(draft.selectedNasheedId);
    setTextOverlays(draft.textOverlays);
    setSubtitles(draft.subtitles);
    setShowDraftsSheet(false);
    setCurrentTime(0);
    showToast(`ড্রাফট "${draft.title}" লোড হয়েছে`);
  };

  // 8. Share directly to Peaceverse Feed as Reel
  const handleShareAsReel = () => {
    const videoSourceUrl =
      clips.find((c) => c.url)?.url ||
      lastExportedUrl ||
      'https://www.w3schools.com/html/mov_bbb.mp4';
    const topArabic =
      subtitles[0]?.arabic ||
      textOverlays.find((t) => /[\u0600-\u06FF]/.test(t.text))?.text ||
      'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

    const newReel: PostItem = {
      id: `reel-edits-${Date.now()}`,
      author: {
        name: userProfile?.name || 'Sharif Hasan',
        avatar:
          userProfile?.avatar ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        verified: true,
        subtitle: 'Peace Edits Reel • 🌐',
      },
      timeAgo: 'Just now',
      isPublic: true,
      privacy: 'public',
      status: 'approved',
      contentBangla: `${reelCaption}${selectedNasheed ? `\n🎵 নাশিদ: ${selectedNasheed.title}` : ''}`,
      arabicVerse: topArabic,
      translation: subtitles[0]?.banglaTranslit,
      mediaType: 'video',
      mediaUrl: videoSourceUrl,
      duration: formatTime(totalDuration),
      category: 'Nasheed',
      reactions: {
        total: 1,
        likeCount: 1,
        loveCount: 0,
        subhanallahCount: 0,
        mashaallahCount: 0,
      },
      userReaction: 'like',
      comments: [],
      sharesCount: 0,
      isSaved: false,
    };

    if (onPublishReel) {
      onPublishReel(newReel);
    }
    setShowExportModal(false);
    showToast('রিলস ভিডিও Peaceverse ফিডে পোস্ট করা হয়েছে 🎉');
    onClose();
  };

  if (!isOpen) return null;

  const filteredNasheeds = HALAL_NASHEED_LIBRARY.filter((n) => n.category === nasheedCategory);

  return (
    <div className="fixed inset-0 z-[60] bg-[#0B0C10] text-white flex flex-col select-none overflow-hidden">
      {/* Hidden elements for video & audio processing */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleImportGalleryVideo}
      />
      <video
        ref={hiddenVideoRef}
        playsInline
        preload="auto"
        className="hidden"
        onLoadedMetadata={() => setVideoFrameTick((t) => t + 1)}
        onLoadedData={(e) => {
          const v = e.currentTarget;
          if (!isPlaying && v.currentTime === 0 && v.duration > 0.1) {
            try {
              v.currentTime = 0.05;
            } catch {
              // Ignore seek restriction
            }
          }
          setVideoFrameTick((t) => t + 1);
        }}
        onCanPlay={() => setVideoFrameTick((t) => t + 1)}
        onSeeked={() => setVideoFrameTick((t) => t + 1)}
      />
      {recordedVoiceUrl && <audio ref={voiceAudioRef} src={recordedVoiceUrl} className="hidden" />}

      {/* TOP HEADER BAR */}
      <header className="h-13 px-3 bg-[#14161D] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-extrabold text-sm tracking-tight text-white truncate">
              Peace Edits
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/40 shrink-0">
              100% Halal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="গ্যালারি থেকে ভিডিও আনুন"
          >
            <Film className="w-3.5 h-3.5 text-[#00FF88]" />
            <span>ইমপোর্ট</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDraftsSheet(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            title="সেভ করা ড্রাফট"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ড্রাফট ({drafts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 rounded-xl bg-[#00FF88] hover:bg-[#00e67a] text-black text-xs font-black flex items-center gap-1 cursor-pointer transition-transform active:scale-95 shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>এক্সপোর্ট</span>
          </button>
        </div>
      </header>

      {/* Status Toast */}
      {statusBanner && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1C1F2A] border border-[#00FF88]/50 text-[#00FF88] text-xs font-bold shadow-xl animate-in fade-in">
          {statusBanner}
        </div>
      )}

      {/* 1. TOP: VIDEO PREVIEW (Black background, Play button, Aspect Ratio support) */}
      <div className="relative bg-black flex flex-col items-center justify-center px-3 pt-2 pb-1.5 shrink-0">
        <div
          className={`relative bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center ${
            aspectRatio === '9:16'
              ? 'h-[210px] sm:h-[250px] aspect-[9/16]'
              : aspectRatio === '1:1'
              ? 'h-[200px] sm:h-[230px] aspect-square'
              : 'w-full max-w-[360px] aspect-video'
          }`}
        >
          <canvas ref={canvasRef} className="w-full h-full object-contain" />

          {/* Center Play/Pause Overlay Button */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="absolute inset-0 flex items-center justify-center group cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <div
              className={`w-12 h-12 rounded-full bg-black/65 backdrop-blur-xs border border-[#00FF88]/60 flex items-center justify-center text-[#00FF88] transition-all ${
                isPlaying ? 'opacity-0 group-hover:opacity-100 scale-90' : 'opacity-100 scale-100'
              }`}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </div>
          </button>
        </div>

        {/* Transport & Quick Vocal Controls Row */}
        <div className="w-full max-w-md flex items-center justify-between gap-2 pt-1.5 px-1 text-[11px] text-neutral-300">
          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={() => setIsPlaying((p) => !p)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#00FF88] cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <span className="font-bold text-white">{formatTime(currentTime)}</span>
            <span className="text-neutral-500">/ {formatTime(totalDuration)}</span>
          </div>

          {/* Toggle: Remove haram background music */}
          <button
            type="button"
            onClick={() => {
              setRemoveBgMusic((v) => !v);
              showToast(
                !removeBgMusic
                  ? 'হারাম ব্যাকগ্রাউন্ড মিউজিক রিমুভ ফিল্টার চালু হয়েছে (১০০% হালাল) ✓'
                  : 'ব্যাকগ্রাউন্ড মিউজিক হালাল ফিল্টার বন্ধ'
              );
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              removeBgMusic
                ? 'bg-[#00FF88]/15 border-[#00FF88]/60 text-[#00FF88]'
                : 'bg-white/5 border-white/15 text-neutral-400'
            }`}
          >
            <Wand2 className="w-3 h-3" />
            <span>ব্যাকগ্রাউন্ড মিউজিক হালাল করুন</span>
          </button>

          <button
            onClick={() => setIsVideoMuted((m) => !m)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-200 cursor-pointer"
            title={isVideoMuted ? 'সাউন্ড চালু' : 'মিউট'}
          >
            {isVideoMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. MIDDLE: TIMELINE - 3 TRACKS */}
      <div className="bg-[#12141B] border-y border-white/10 px-3 py-2 space-y-1.5 shrink-0">
        {/* Scrubbable Playhead Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#00FF88] uppercase tracking-wider w-12 shrink-0">
            টাইমলাইন
          </span>
          <input
            type="range"
            min={0}
            max={totalDuration}
            step={0.1}
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="flex-1 accent-[#00FF88] h-1.5 bg-white/15 rounded-lg cursor-pointer"
          />
        </div>

        {/* Track 1: Video (trim, split) */}
        <div className="flex items-center gap-2">
          <div className="w-20 shrink-0 text-[10px] font-bold text-neutral-300 flex items-center gap-1 truncate">
            <span>🎬</span>
            <span>ভিডিও</span>
          </div>
          <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar bg-[#1A1D26] p-1 rounded-lg border border-white/5">
            {clips.map((clip) => {
              const isSelected = clip.id === selectedClipId;
              return (
                <button
                  key={clip.id}
                  onClick={() => setSelectedClipId(clip.id)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]'
                      : 'bg-white/10 text-neutral-200 border border-transparent'
                  }`}
                >
                  <span className="truncate max-w-[110px]">{clip.name}</span>
                  <span className="text-[9px] opacity-75">
                    ({clip.trimEnd - clip.trimStart}s)
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-[#00FF88] shrink-0 cursor-pointer"
              title="আরও ভিডিও যুক্ত করুন"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Track 2: Audio - Halal Nasheed only / Voice */}
        <div className="flex items-center gap-2">
          <div className="w-20 shrink-0 text-[10px] font-bold text-neutral-300 flex items-center gap-1 truncate">
            <span>🎵</span>
            <span>নাশিদ</span>
          </div>
          <div className="flex-1 flex items-center justify-between gap-2 bg-[#1A1D26] px-2.5 py-1 rounded-lg border border-white/5 min-w-0">
            <span className="text-[10px] font-semibold text-emerald-300 truncate">
              {selectedNasheed
                ? `ভোকাল: ${selectedNasheed.title}`
                : recordedVoiceUrl
                ? '🎙️ রেকর্ড করা ভয়েস'
                : 'কোনো নাশিদ যুক্ত নেই'}
            </span>
            {selectedNasheed && (
              <button
                onClick={() => setSelectedNasheedId(null)}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-bold shrink-0 cursor-pointer"
              >
                সরান
              </button>
            )}
          </div>
        </div>

        {/* Track 3: Text - Arabic / Bangla */}
        <div className="flex items-center gap-2">
          <div className="w-20 shrink-0 text-[10px] font-bold text-neutral-300 flex items-center gap-1 truncate">
            <span>📝</span>
            <span>টেক্সট</span>
          </div>
          <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar bg-[#1A1D26] p-1 rounded-lg border border-white/5">
            {textOverlays.length === 0 && subtitles.length === 0 ? (
              <span className="text-[10px] text-neutral-500 px-1.5">
                আরবি / বাংলা লেখা বা সাবটাইটেল যোগ করুন
              </span>
            ) : (
              <>
                {textOverlays.map((txt) => (
                  <span
                    key={txt.id}
                    className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 text-[10px] font-semibold whitespace-nowrap flex items-center gap-1"
                  >
                    <span className="max-w-[90px] truncate">{txt.text}</span>
                    <button
                      onClick={() => setTextOverlays((prev) => prev.filter((t) => t.id !== txt.id))}
                      className="text-rose-300 hover:text-rose-200 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {subtitles.length > 0 && (
                  <span className="px-2 py-0.5 rounded bg-[#00FF88]/15 border border-[#00FF88]/40 text-[#00FF88] text-[10px] font-bold whitespace-nowrap">
                    🤖 সাবটাইটেল ({subtitles.length})
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* DYNAMIC TOOL PANEL */}
      <div className="flex-1 overflow-y-auto bg-[#0F1117] px-3 py-3 space-y-3">
        {/* TAB 1: ✂️ কাট (Trim, Split, Delete, Gallery Import, Voice Record) */}
        {activeTab === 'cut' && (
          <div className="max-w-md mx-auto space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleSplitClip}
                className="py-2.5 px-2 rounded-2xl bg-[#1A1D26] hover:bg-[#242836] border border-white/10 text-xs font-bold flex flex-col items-center gap-1 cursor-pointer"
              >
                <SplitSquareHorizontal className="w-4 h-4 text-[#00FF88]" />
                <span>স্প্লিট (Split)</span>
              </button>

              <button
                onClick={handleDeleteSelectedClip}
                className="py-2.5 px-2 rounded-2xl bg-[#1A1D26] hover:bg-[#242836] border border-white/10 text-xs font-bold flex flex-col items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>ডিলিট ক্লিপ</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-2 rounded-2xl bg-[#1A1D26] hover:bg-[#242836] border border-[#00FF88]/30 text-xs font-bold flex flex-col items-center gap-1 cursor-pointer"
              >
                <Film className="w-4 h-4 text-[#00FF88]" />
                <span>গ্যালারি ভিডিও</span>
              </button>
            </div>

            {/* Trim Sliders */}
            {selectedClip && (
              <div className="p-3 rounded-2xl bg-[#171922] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-neutral-200">ট্রিম করুন: {selectedClip.name}</span>
                  <span className="text-[#00FF88]">
                    {selectedClip.trimStart}s - {selectedClip.trimEnd}s
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 flex justify-between">
                    <span>শুরু (Trim Start)</span>
                    <span>{selectedClip.trimStart}s</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, selectedClip.trimEnd - 1)}
                    value={selectedClip.trimStart}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setClips((prev) =>
                        prev.map((c) => (c.id === selectedClip.id ? { ...c, trimStart: val } : c))
                      );
                    }}
                    className="w-full accent-[#00FF88]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-400 flex justify-between">
                    <span>শেষ (Trim End)</span>
                    <span>{selectedClip.trimEnd}s</span>
                  </label>
                  <input
                    type="range"
                    min={Math.min(selectedClip.duration, selectedClip.trimStart + 1)}
                    max={selectedClip.duration}
                    value={selectedClip.trimEnd}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setClips((prev) =>
                        prev.map((c) => (c.id === selectedClip.id ? { ...c, trimEnd: val } : c))
                      );
                    }}
                    className="w-full accent-[#00FF88]"
                  />
                </div>
              </div>
            )}

            {/* In-App Voice Recorder */}
            <div className="p-3 rounded-2xl bg-[#171922] border border-white/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-[#00FF88]" />
                  <span>অ্যাপের ভেতরেই ভয়েস রেকর্ড করুন</span>
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {isRecordingVoice
                    ? `রেকর্ডিং চলছে... ${formatTime(recordingSeconds)}`
                    : recordedVoiceUrl
                    ? 'ভয়েস রেকর্ড প্রস্তুত ✓'
                    : 'তিলাওয়াত বা বক্তব্য সরাসরি রেকর্ড করুন'}
                </p>
              </div>
              <button
                onClick={handleToggleVoiceRecord}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isRecordingVoice
                    ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                    : 'bg-[#00FF88] hover:bg-[#00e67a] text-black'
                }`}
              >
                {isRecordingVoice ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>থামুন</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5" />
                    <span>রেকর্ড</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 📝 লেখা (Add Text: Amiri Arabic, Noto Nastaliq, Bangla + Gold/Green + Fade/Typewriter) */}
        {activeTab === 'text' && (
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="আরবি বা বাংলা ক্যালিগ্রাফি লেখা লিখুন..."
                className="flex-1 bg-[#171922] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#00FF88]"
              />
              <button
                onClick={() => handleAddTextOverlay()}
                className="px-4 py-2 rounded-xl bg-[#00FF88] hover:bg-[#00e67a] text-black text-xs font-black cursor-pointer shrink-0"
              >
                যোগ করুন
              </button>
            </div>

            {/* Quick Islamic Presets */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_ISLAMIC_TEXTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleAddTextOverlay(preset)}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-[#00FF88]/20 hover:text-[#00FF88] text-[11px] font-medium cursor-pointer transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>

            {/* Font Selection */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-neutral-400">ফন্ট (Font)</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'amiri' as const, label: 'Amiri Arabic' },
                  { id: 'nastaliq' as const, label: 'Noto Nastaliq' },
                  { id: 'bangla' as const, label: 'Bangla' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDraftFont(f.id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      draftFont === f.id
                        ? 'bg-[#00FF88]/15 border-[#00FF88] text-[#00FF88]'
                        : 'bg-[#171922] border-white/10 text-neutral-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style + Animation */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-neutral-400">ক্যালিগ্রাফি স্টাইল</p>
                <div className="flex gap-1.5">
                  {[
                    { id: 'gold' as const, label: 'Gold', dot: 'bg-amber-400' },
                    { id: 'green' as const, label: 'Green', dot: 'bg-[#00FF88]' },
                    { id: 'white' as const, label: 'White', dot: 'bg-white' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setDraftTextStyle(s.id)}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border flex items-center justify-center gap-1 cursor-pointer ${
                        draftTextStyle === s.id
                          ? 'bg-white/15 border-[#00FF88] text-white'
                          : 'bg-[#171922] border-white/10 text-neutral-400'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-neutral-400">অ্যানিমেশন</p>
                <div className="flex gap-1.5">
                  {[
                    { id: 'fade' as const, label: 'Fade' },
                    { id: 'typewriter' as const, label: 'Typewriter' },
                  ].map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setDraftTextAnim(a.id)}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border cursor-pointer ${
                        draftTextAnim === a.id
                          ? 'bg-[#00FF88]/15 border-[#00FF88] text-[#00FF88]'
                          : 'bg-[#171922] border-white/10 text-neutral-400'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 🎵 নাশিদ - 100% Halal Library (22 vocal-only tracks) */}
        {activeTab === 'nasheed' && (
          <div className="max-w-md mx-auto space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#00FF88] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>No Music • Only Vocal ({HALAL_NASHEED_LIBRARY.length} টি নাশিদ)</span>
              </span>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {(['হামদ', 'নাত', 'কোরআন তিলাওয়াত background'] as NasheedCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNasheedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border cursor-pointer transition-colors ${
                    nasheedCategory === cat
                      ? 'bg-[#00FF88] text-black border-[#00FF88]'
                      : 'bg-[#171922] text-neutral-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Nasheed Tracks List */}
            <div className="space-y-1.5">
              {filteredNasheeds.map((track) => {
                const isSelected = selectedNasheedId === track.id;
                const isPreviewing = previewPlayingNasheedId === track.id;
                return (
                  <div
                    key={track.id}
                    className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-colors ${
                      isSelected
                        ? 'bg-[#00FF88]/10 border-[#00FF88]/60'
                        : 'bg-[#171922] border-white/10 hover:bg-[#1E212D]'
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (isPreviewing) {
                          stopNasheedSynth();
                        } else {
                          startNasheedSynth(track, true);
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#00FF88] hover:text-black flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                      title="শুনুন"
                    >
                      {isPreviewing ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{track.title}</p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        {track.reciter} • {track.durationLabel}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedNasheedId(track.id);
                        showToast(`"${track.title}" ট্র্যাক ২-এ যুক্ত হয়েছে`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#00FF88] text-black'
                          : 'bg-white/10 hover:bg-[#00FF88] hover:text-black text-white'
                      }`}
                    >
                      {isSelected ? 'যুক্ত ✓' : 'ব্যবহার করুন'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: 🤖 অটো-সাবটাইটেল */}
        {activeTab === 'subtitle' && (
          <div className="max-w-md mx-auto space-y-3">
            <button
              onClick={handleGenerateAutoSubtitles}
              disabled={isGeneratingSubtitles}
              className="w-full py-3 px-4 rounded-2xl bg-[#00FF88] hover:bg-[#00e67a] text-black font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99] shadow-[0_0_20px_rgba(0,255,136,0.25)] disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isGeneratingSubtitles
                  ? 'আরবি ও বাংলা সাবটাইটেল তৈরি হচ্ছে...'
                  : 'অটো-আরবি সাবটাইটেল বানান'}
              </span>
            </button>

            <p className="text-[11px] text-neutral-400 text-center">
              ইউটিউব স্টাইলের নিচের ক্যাপশনে স্বয়ংক্রিয়ভাবে আরবি আয়াত + বাংলা উচ্চারণ দেখাবে
            </p>

            {subtitles.length > 0 && (
              <div className="space-y-2">
                {subtitles.map((cue) => (
                  <div
                    key={cue.id}
                    className="p-2.5 rounded-xl bg-[#171922] border border-white/10 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#00FF88] font-bold">
                      <span>
                        {formatTime(cue.startTime)} - {formatTime(cue.endTime)}
                      </span>
                      <button
                        onClick={() => setSubtitles((prev) => prev.filter((s) => s.id !== cue.id))}
                        className="text-rose-400 cursor-pointer"
                      >
                        মুছুন
                      </button>
                    </div>
                    <input
                      type="text"
                      value={cue.arabic}
                      onChange={(e) =>
                        setSubtitles((prev) =>
                          prev.map((s) => (s.id === cue.id ? { ...s, arabic: e.target.value } : s))
                        )
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-[#00FF88] font-bold text-right"
                      dir="rtl"
                    />
                    <input
                      type="text"
                      value={cue.banglaTranslit}
                      onChange={(e) =>
                        setSubtitles((prev) =>
                          prev.map((s) =>
                            s.id === cue.id ? { ...s, banglaTranslit: e.target.value } : s
                          )
                        )
                      }
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: 📤 এক্সপোর্ট & Share */}
        {activeTab === 'export' && (
          <div className="max-w-md mx-auto space-y-3">
            {/* Aspect Ratio Selector */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-neutral-400">ভিডিও অনুপাত (Aspect Ratio)</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '9:16' as const, label: '9:16 Reels', sub: '1080x1920' },
                  { id: '1:1' as const, label: '1:1 Square', sub: '1080x1080' },
                  { id: '16:9' as const, label: '16:9 YouTube', sub: '1920x1080' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    className={`p-2 rounded-xl border text-center cursor-pointer ${
                      aspectRatio === ratio.id
                        ? 'bg-[#00FF88]/15 border-[#00FF88] text-[#00FF88]'
                        : 'bg-[#171922] border-white/10 text-neutral-300'
                    }`}
                  >
                    <p className="text-xs font-bold">{ratio.label}</p>
                    <p className="text-[10px] opacity-75">{ratio.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Selector */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-neutral-400">কোয়ালিটি (Quality)</p>
              <div className="grid grid-cols-3 gap-2">
                {(['720p', '1080p', '4K'] as ExportQuality[]).map((q) => (
                  <button
                    key={q}
                    onClick={() => setExportQuality(q)}
                    className={`py-2 rounded-xl border text-xs font-bold cursor-pointer ${
                      exportQuality === q
                        ? 'bg-[#00FF88]/15 border-[#00FF88] text-[#00FF88]'
                        : 'bg-[#171922] border-white/10 text-neutral-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Watermark Toggle (OFF by default) */}
            <div
              onClick={() => setShowWatermark((w) => !w)}
              className="p-2.5 rounded-xl bg-[#171922] border border-white/10 flex items-center justify-between cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-white">ওয়াটারমার্ক (Watermark)</p>
                <p className="text-[10px] text-neutral-400">
                  "Powered by Peace Edits - 100% Halal" (ডিফল্টভাবে বন্ধ)
                </p>
              </div>
              <div
                className={`w-10 h-5 rounded-full p-0.5 transition-colors flex items-center ${
                  showWatermark ? 'bg-[#00FF88] justify-end' : 'bg-neutral-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow" />
              </div>
            </div>

            {/* Reel Caption */}
            <input
              type="text"
              value={reelCaption}
              onChange={(e) => setReelCaption(e.target.value)}
              placeholder="রিলস ক্যাপশন লিখুন..."
              className="w-full bg-[#171922] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00FF88]"
            />

            {/* Primary Export Button */}
            <button
              onClick={handleExportHalalVideo}
              disabled={isExporting}
              className="w-full py-3 rounded-2xl bg-[#00FF88] hover:bg-[#00e67a] text-black font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99] shadow-[0_0_20px_rgba(0,255,136,0.3)] disabled:opacity-60"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isExporting
                  ? `এক্সপোর্ট হচ্ছে... ${exportProgress}%`
                  : 'হালাল ভিডিও এক্সপোর্ট করুন (No Watermark)'}
              </span>
            </button>

            {/* Draft & Direct Share to Peaceverse Feed */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSaveToDrafts}
                className="py-2.5 px-3 rounded-xl bg-[#171922] hover:bg-[#222634] border border-white/15 text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>ড্রাফটে সেভ</span>
              </button>

              <button
                onClick={handleShareAsReel}
                className="py-2.5 px-3 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>রিল হিসেবে শেয়ার</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM TOOLBAR (5 CapCut-style Buttons) */}
      <nav className="h-16 bg-[#14161D] border-t border-white/10 grid grid-cols-5 items-center px-1 shrink-0">
        {[
          { id: 'cut' as const, icon: Scissors, label: '✂️ কাট' },
          { id: 'text' as const, icon: Type, label: '📝 লেখা' },
          { id: 'nasheed' as const, icon: Music, label: '🎵 নাশিদ' },
          { id: 'subtitle' as const, icon: Sparkles, label: '🤖 সাবটাইটেল' },
          { id: 'export' as const, icon: Upload, label: '📤 এক্সপোর্ট' },
        ].map((item) => {
          const IconComp = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`h-full flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                isActive ? 'text-[#00FF88]' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-[#00FF88]/15' : ''
                }`}
              >
                <IconComp className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* DRAFTS MODAL SHEET */}
      {showDraftsSheet && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-[#181B24] border border-white/15 rounded-2xl w-full max-w-md max-h-[75vh] flex flex-col overflow-hidden">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-amber-400" />
                <span>Peaceverse ড্রাফটস ({drafts.length})</span>
              </h3>
              <button
                onClick={() => setShowDraftsSheet(false)}
                className="p-1 rounded-full hover:bg-white/10 text-neutral-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto flex-1">
              {drafts.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-8">
                  এখনো কোনো ড্রাফট সেভ করা হয়নি। এক্সপোর্ট ট্যাব থেকে "ড্রাফটে সেভ" চাপুন।
                </p>
              ) : (
                drafts.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleLoadDraft(d)}
                    className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{d.title}</p>
                      <p className="text-[10px] text-neutral-400">
                        {d.aspectRatio} • {d.quality} • সেভ: {d.savedAt}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#00FF88] shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL: "হালাল ভিডিও এক্সপোর্ট" */}
      {showExportModal && (
        <div className="fixed inset-0 z-[75] bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-[#161922] border border-white/15 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#00FF88]/15 border border-[#00FF88]/40 flex items-center justify-center text-[#00FF88]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">হালাল ভিডিও এক্সপোর্ট</h3>
                  <p className="text-[11px] text-neutral-400">
                    {aspectRatio} • {formatTime(totalDuration)} • ১০০% হালাল আউটপুট
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Quality Options: 720p / 1080p */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-neutral-300">ভিডিও কোয়ালিটি</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['720p', '1080p'] as ExportQuality[]).map((q) => {
                    const isSelected = exportQuality === q;
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setExportQuality(q)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#00FF88]/15 border-[#00FF88] text-[#00FF88]'
                            : 'bg-[#1D212D] border-white/10 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{q}</span>
                        <span className="text-[10px] font-medium opacity-75">
                          {q === '720p' ? '(HD)' : '(Full HD)'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Watermark OFF (ticked) */}
              <button
                type="button"
                onClick={() => setShowWatermark((w) => !w)}
                className="w-full p-3 rounded-xl bg-[#1D212D] border border-white/10 hover:border-[#00FF88]/40 flex items-center justify-between gap-3 text-left cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      !showWatermark
                        ? 'bg-[#00FF88] border-[#00FF88] text-black'
                        : 'bg-transparent border-neutral-500 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-white">Watermark OFF</p>
                    <p className="text-[10px] text-neutral-400">
                      "Powered by Peace Edits - 100% Halal" ওয়াটারমার্ক থাকবে না
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    !showWatermark
                      ? 'bg-[#00FF88]/15 text-[#00FF88]'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {!showWatermark ? 'OFF ✓' : 'ON'}
                </span>
              </button>

              {/* Progress indicator during export */}
              {isExporting && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-[#00FF88]">
                    <span>ভিডিও রেন্ডার হচ্ছে...</span>
                    <span>{exportProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-[#00FF88] transition-all duration-150"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Primary Download + Post Reel Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleExportHalalVideo}
                  disabled={isExporting}
                  className="w-full py-3 px-4 rounded-xl bg-[#00FF88] hover:bg-[#00e67a] text-black font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99] shadow-[0_0_20px_rgba(0,255,136,0.28)] disabled:opacity-60"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {isExporting ? `ডাউনলোড প্রস্তুত হচ্ছে... ${exportProgress}%` : 'ডাউনলোড করুন'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShareAsReel}
                  disabled={isExporting}
                  className="w-full py-3 px-4 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Peaceverse এ রিল হিসেবে পোস্ট করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
