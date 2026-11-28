import React, { useEffect, useMemo, useState } from 'react';
import {
  Radio,
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Gift,
  Swords,
  Send,
  ShieldCheck,
  Plus,
  LogOut,
  Flag,
  Sparkles,
  Clock,
  Crown,
} from 'lucide-react';
import {
  PeaceLiveRoom,
  PeaceLiveSeat,
  PeaceLiveChatMessage,
  UserProfile,
} from '../../types';
import { PeaceGift, calculateGiftSplit } from '../../data/peaceGifts';
import { SHOWCASE_LIVE_ROOMS } from '../../data/youtubeShowcase';
import {
  auth,
  subscribeToPeaceLiveRooms,
  createOrUpdatePeaceLiveRoom,
  updatePeaceLiveSeat,
  togglePeaceLivePkBattle,
  subscribeToPeaceLiveChat,
  sendPeaceLiveChatMessage,
  endPeaceLiveRoom,
} from '../../lib/firebase';
import { YtGiftModal } from './YtGiftModal';

interface YtPeaceLiveViewProps {
  userProfile: UserProfile;
  blockedCreatorIds: string[];
  onDeductCoinsAndAwardBeans: (
    coins: number,
    isHostRecipient: boolean
  ) => boolean | Promise<boolean>;
  onOpenWallet: () => void;
  onRequestNidVerification: () => void;
  onOpenReportBlockRoom: (room: PeaceLiveRoom) => void;
}

function buildDefaultSixSeats(
  hostId: string,
  hostName: string,
  hostAvatar: string
): PeaceLiveSeat[] {
  return [
    {
      seatIndex: 0,
      role: 'host',
      userId: hostId,
      userName: hostName,
      userAvatar: hostAvatar,
      micOn: true,
      camOn: true,
      beansEarned: 0,
    },
    ...[1, 2, 3, 4, 5].map((idx) => ({
      seatIndex: idx,
      role: 'guest' as const,
      micOn: false,
      camOn: false,
      beansEarned: 0,
    })),
  ];
}

function formatTimer(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem < 10 ? '0' : ''}${rem}`;
}

export const YtPeaceLiveView: React.FC<YtPeaceLiveViewProps> = ({
  userProfile,
  blockedCreatorIds,
  onDeductCoinsAndAwardBeans,
  onOpenWallet,
  onRequestNidVerification,
  onOpenReportBlockRoom,
}) => {
  const [liveRooms, setLiveRooms] = useState<PeaceLiveRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [showStartForm, setShowStartForm] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomCategory, setNewRoomCategory] = useState('Quran & Tafsir');
  const [chatMessages, setChatMessages] = useState<PeaceLiveChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftOverlay, setGiftOverlay] = useState<{
    emoji: string;
    name: string;
    sender: string;
    coins: number;
  } | null>(null);
  const [pkSecondsLeft, setPkSecondsLeft] = useState(0);
  const [zegoStatus, setZegoStatus] = useState<string>('');

  const blockedSet = useMemo(() => new Set(blockedCreatorIds), [blockedCreatorIds]);
  const isNidVerified = userProfile.nidVerification?.status === 'verified';

  // Real-time Firestore listener merged with showcase rooms
  useEffect(() => {
    const unsub = subscribeToPeaceLiveRooms((rooms) => {
      setLiveRooms(rooms);
    });
    return () => unsub();
  }, []);

  const allRooms = useMemo(() => {
    const map = new Map<string, PeaceLiveRoom>();
    SHOWCASE_LIVE_ROOMS.forEach((r) => map.set(r.id, r));
    liveRooms.forEach((r) => map.set(r.id, r));
    return Array.from(map.values()).filter(
      (r) => !blockedSet.has(r.hostId) && !blockedSet.has(r.hostName)
    );
  }, [liveRooms, blockedSet]);

  const activeRoom = useMemo(
    () => allRooms.find((r) => r.id === activeRoomId) || null,
    [allRooms, activeRoomId]
  );

  // Live chat listener for active room
  useEffect(() => {
    if (!activeRoom) {
      setChatMessages([]);
      return;
    }
    const isShowcase = SHOWCASE_LIVE_ROOMS.some((r) => r.id === activeRoom.id);
    if (isShowcase) {
      setChatMessages([
        {
          id: 'welcome-1',
          userId: 'system',
          userName: 'Peaceverse24 Live',
          text: 'Assalamu Alaikum! Welcome to this 6-seat Peace Live room.',
          createdAtMillis: Date.now() - 30000,
        },
      ]);
    }
    const unsub = subscribeToPeaceLiveChat(activeRoom.id, (msgs) => {
      if (msgs.length > 0) setChatMessages(msgs);
    });
    return () => unsub();
  }, [activeRoom?.id]);

  // 5-Minute (300s) PK Battle countdown ticker
  useEffect(() => {
    if (!activeRoom?.pkBattle?.active) {
      setPkSecondsLeft(0);
      return;
    }
    const tick = () => {
      const rem = Math.max(
        0,
        Math.ceil((activeRoom.pkBattle!.endsAtMillis - Date.now()) / 1000)
      );
      setPkSecondsLeft(rem);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [activeRoom?.pkBattle?.active, activeRoom?.pkBattle?.endsAtMillis]);

  const fetchZegoRoomToken = async (roomId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken().catch(() => '');
      if (!token) return;
      const resp = await fetch('/api/zego/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId }),
      });
      const data = await resp.json().catch(() => null);
      if (data?.configured) {
        setZegoStatus('ZegoCloud RTC Connected');
      } else {
        setZegoStatus('Peace Live Stage Ready');
      }
    } catch {
      setZegoStatus('Peace Live Stage Ready');
    }
  };

  const handleStartLiveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNidVerified) {
      onRequestNidVerification();
      return;
    }
    const currentUserId = userProfile.id || 'guest-user';
    const roomId = `live-${currentUserId}-${Date.now()}`;
    const room: PeaceLiveRoom = {
      id: roomId,
      title: newRoomTitle.trim() || `${userProfile.name}'s Peace Live`,
      category: newRoomCategory,
      hostId: currentUserId,
      hostName: userProfile.name,
      hostAvatar: userProfile.avatar,
      isLive: true,
      status: 'live',
      viewersCount: 1,
      totalBeans: 0,
      seats: buildDefaultSixSeats(currentUserId, userProfile.name, userProfile.avatar),
      createdAtMillis: Date.now(),
      startedAtMillis: Date.now(),
    };
    setLiveRooms((prev) => [room, ...prev]);
    setActiveRoomId(room.id);
    setShowStartForm(false);
    setNewRoomTitle('');
    await createOrUpdatePeaceLiveRoom(room);
    void fetchZegoRoomToken(room.id);
  };

  const handleJoinOrLeaveSeat = async (seatIndex: number) => {
    if (!activeRoom) return;
    if (seatIndex === 0) return; // Host seat

    const targetSeat = activeRoom.seats.find((s) => s.seatIndex === seatIndex);
    if (!targetSeat) return;

    const isMySeat = targetSeat.userId === userProfile.id;
    if (targetSeat.userId && !isMySeat) {
      // Host can remove guest; otherwise seat occupied
      if (activeRoom.hostId !== userProfile.id) return;
    }

    const updatedSeats = activeRoom.seats.map((s) => {
      if (s.seatIndex === seatIndex) {
        if (s.userId) {
          return { seatIndex: s.seatIndex, role: 'guest' as const, micOn: false, camOn: false, beansEarned: 0 };
        }
        return {
          ...s,
          userId: userProfile.id,
          userName: userProfile.name,
          userAvatar: userProfile.avatar,
          micOn: true,
          camOn: false,
        };
      }
      // Remove user from any other guest seat first
      if (s.userId === userProfile.id && s.role === 'guest') {
        return { seatIndex: s.seatIndex, role: 'guest' as const, micOn: false, camOn: false, beansEarned: 0 };
      }
      return s;
    });

    setLiveRooms((prev) =>
      prev.map((r) => (r.id === activeRoom.id ? { ...r, seats: updatedSeats } : r))
    );
    await updatePeaceLiveSeat(activeRoom.id, updatedSeats);
  };

  const handleToggleMic = async (seatIndex: number) => {
    if (!activeRoom) return;
    const seat = activeRoom.seats.find((s) => s.seatIndex === seatIndex);
    if (!seat || (seat.userId !== userProfile.id && activeRoom.hostId !== userProfile.id)) return;
    const updatedSeats = activeRoom.seats.map((s) =>
      s.seatIndex === seatIndex ? { ...s, micOn: !s.micOn } : s
    );
    setLiveRooms((prev) =>
      prev.map((r) => (r.id === activeRoom.id ? { ...r, seats: updatedSeats } : r))
    );
    await updatePeaceLiveSeat(activeRoom.id, updatedSeats);
  };

  const handleTogglePkBattle = async () => {
    if (!activeRoom) return;
    const isCurrentlyActive = Boolean(activeRoom.pkBattle?.active);
    const nextPk = isCurrentlyActive
      ? { ...activeRoom.pkBattle!, active: false }
      : {
          active: true,
          startedAtMillis: Date.now(),
          endsAtMillis: Date.now() + 5 * 60 * 1000, // 5 min PK Battle
          hostScore: 0,
          challengerScore: 0,
          challengerName:
            activeRoom.seats.find((s) => s.seatIndex > 0 && s.userName)?.userName ||
            'Guest Challenger',
        };
    setLiveRooms((prev) =>
      prev.map((r) => (r.id === activeRoom.id ? { ...r, pkBattle: nextPk } : r))
    );
    await togglePeaceLivePkBattle(activeRoom.id, nextPk);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom || !chatInput.trim()) return;
    const currentUserId = userProfile.id || 'guest-user';
    const msg: PeaceLiveChatMessage = {
      id: `local-${Date.now()}`,
      userId: currentUserId,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      text: chatInput.trim(),
      createdAtMillis: Date.now(),
    };
    setChatMessages((prev) => [...prev, msg]);
    setChatInput('');
    await sendPeaceLiveChatMessage(activeRoom.id, {
      userId: currentUserId,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      text: msg.text,
    });
  };

  const handleSendLiveGift = async (gift: PeaceGift, note?: string) => {
    if (!activeRoom) return false;
    const currentUserId = userProfile.id || 'guest-user';
    const isHost = activeRoom.hostId === currentUserId;
    const ok = await onDeductCoinsAndAwardBeans(gift.coins, isHost);
    if (!ok) return false;

    const { hostBeans } = calculateGiftSplit(gift.coins);
    setGiftOverlay({
      emoji: gift.icon,
      name: gift.name,
      sender: userProfile.name,
      coins: gift.coins,
    });
    setTimeout(() => setGiftOverlay(null), 2600);

    // Update PK score (Only gifts = score) & room totalBeans
    const updatedPk = activeRoom.pkBattle?.active
      ? {
          ...activeRoom.pkBattle,
          hostScore: activeRoom.pkBattle.hostScore + gift.coins,
        }
      : activeRoom.pkBattle;

    const updatedSeats = activeRoom.seats.map((s) =>
      s.seatIndex === 0 ? { ...s, beansEarned: (s.beansEarned || 0) + hostBeans } : s
    );

    setLiveRooms((prev) =>
      prev.map((r) =>
        r.id === activeRoom.id
          ? { ...r, totalBeans: (r.totalBeans || 0) + hostBeans, seats: updatedSeats, pkBattle: updatedPk }
          : r
      )
    );

    const chatGift: PeaceLiveChatMessage = {
      id: `gift-${Date.now()}`,
      userId: currentUserId,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      text: note ? `${gift.icon} Sent ${gift.name} — "${note}"` : `${gift.icon} Sent ${gift.name} (${gift.coins.toLocaleString()} Coins)`,
      isGift: true,
      giftName: gift.name,
      giftIcon: gift.icon,
      giftCoins: gift.coins,
      createdAtMillis: Date.now(),
    };
    setChatMessages((prev) => [...prev, chatGift]);

    await createOrUpdatePeaceLiveRoom({
      ...activeRoom,
      totalBeans: (activeRoom.totalBeans || 0) + hostBeans,
      seats: updatedSeats,
      pkBattle: updatedPk,
    });
    await sendPeaceLiveChatMessage(activeRoom.id, {
      userId: currentUserId,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      text: chatGift.text,
      isGift: true,
      giftName: gift.name,
      giftIcon: gift.icon,
      giftCoins: gift.coins,
    });
    return true;
  };

  // ==========================================
  // ACTIVE 6-SEAT LIVE ROOM VIEW (1 Big Host + 5 Small Guests)
  // ==========================================
  if (activeRoom) {
    const hostSeat = activeRoom.seats[0] || {
      seatIndex: 0,
      role: 'host',
      userId: activeRoom.hostId,
      userName: activeRoom.hostName,
      userAvatar: activeRoom.hostAvatar,
      micOn: true,
      camOn: true,
    };
    const guestSeats = activeRoom.seats.slice(1, 6);
    const pk = activeRoom.pkBattle;
    const pkTotal = pk ? Math.max(1, pk.hostScore + pk.challengerScore) : 1;
    const hostPct = pk ? Math.round((pk.hostScore / pkTotal) * 100) : 50;

    return (
      <div className="max-w-3xl mx-auto pb-24 px-3 pt-3 space-y-3">
        {/* Room Header */}
        <div className="bg-zinc-950 text-white rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={activeRoom.hostAvatar}
              alt={activeRoom.hostName}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#16A34A] shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-[#DC2626] text-[10px] font-extrabold uppercase">
                  LIVE
                </span>
                <h2 className="text-sm font-extrabold truncate">{activeRoom.title}</h2>
              </div>
              <p className="text-[11px] text-zinc-400 truncate">
                {activeRoom.hostName} · {activeRoom.viewersCount} watching · {activeRoom.totalBeans.toLocaleString()} Beans {zegoStatus ? `· ${zegoStatus}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenReportBlockRoom(activeRoom)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              aria-label="Report Live Room"
            >
              <Flag className="w-4 h-4 text-red-400" />
            </button>
            <button
              type="button"
              onClick={async () => {
                if (activeRoom.hostId === userProfile.id) {
                  await endPeaceLiveRoom(activeRoom.id);
                }
                setActiveRoomId(null);
              }}
              className="h-9 px-3 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{activeRoom.hostId === userProfile.id ? 'End' : 'Leave'}</span>
            </button>
          </div>
        </div>

        {/* 5-Minute Halal PK Battle Scoreboard (Only gifts = score, No gambling) */}
        {pk?.active && (
          <div className="bg-zinc-900 text-white rounded-2xl p-3 border border-amber-400/30 space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-emerald-400 truncate">
                {activeRoom.hostName}: {pk.hostScore.toLocaleString()} pts
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#DC2626] text-white inline-flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3" />
                <span>{formatTimer(pkSecondsLeft)}</span>
              </span>
              <span className="text-amber-300 truncate">
                {pk.challengerName}: {pk.challengerScore.toLocaleString()} pts
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-amber-500/30 overflow-hidden flex">
              <div
                className="h-full bg-[#16A34A] transition-all duration-500"
                style={{ width: `${hostPct}%` }}
              />
            </div>
            <p className="text-[10px] text-center text-zinc-400 font-semibold">
              5-Min Peace PK Battle · Only gifts = score · 100% Halal (No Gambling)
            </p>
          </div>
        )}

        {/* 6-SEAT STAGE: 1 BIG HOST + 5 SMALL GUESTS */}
        <div className="relative bg-gradient-to-b from-zinc-900 via-zinc-950 to-emerald-950 rounded-3xl p-4 text-white border border-zinc-800 space-y-3 overflow-hidden">
          {/* Animated Gift Overlay */}
          {giftOverlay && (
            <div className="absolute inset-x-4 top-4 z-30 bg-black/85 border border-emerald-400/40 rounded-2xl p-3 flex items-center justify-center gap-3 animate-bounce shadow-2xl">
              <span className="text-4xl">{giftOverlay.emoji}</span>
              <div>
                <p className="text-xs font-extrabold text-emerald-400">
                  {giftOverlay.sender} sent {giftOverlay.name}!
                </p>
                <p className="text-[11px] text-white/80">
                  +{giftOverlay.coins.toLocaleString()} Coins (60% Beans to Host)
                </p>
              </div>
            </div>
          )}

          {/* 1 BIG HOST SEAT */}
          <div className="rounded-2xl bg-white/5 border border-emerald-500/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={hostSeat.userAvatar || activeRoom.hostAvatar}
                  alt={hostSeat.userName || activeRoom.hostName}
                  className="w-20 h-20 rounded-full object-cover border-4 border-[#16A34A] shadow-lg"
                />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#16A34A] text-[10px] font-extrabold inline-flex items-center gap-1 whitespace-nowrap">
                  <Crown className="w-3 h-3" />
                  HOST
                </span>
              </div>
              <div>
                <p className="text-base font-extrabold">
                  {hostSeat.userName || activeRoom.hostName}
                </p>
                <p className="text-xs text-emerald-300 font-semibold">
                  Seat 1 (Big Host) · {(hostSeat.beansEarned || activeRoom.totalBeans).toLocaleString()} Beans
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleToggleMic(0)}
                    className={`h-8 px-3 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                      hostSeat.micOn ? 'bg-white/15 text-white' : 'bg-[#DC2626] text-white'
                    }`}
                  >
                    {hostSeat.micOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                    <span>{hostSeat.micOn ? 'Mic On' : 'Muted'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleTogglePkBattle}
                    className={`h-8 px-3 rounded-full text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                      pk?.active ? 'bg-amber-500 text-black' : 'bg-[#DC2626] text-white'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>{pk?.active ? 'End PK' : 'PK Battle 5m'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5 SMALL GUEST SEATS */}
          <div className="grid grid-cols-5 gap-2">
            {guestSeats.map((seat) => {
              const occupied = Boolean(seat.userId);
              const isMe = seat.userId === userProfile.id;
              return (
                <button
                  key={seat.seatIndex}
                  type="button"
                  onClick={() => handleJoinOrLeaveSeat(seat.seatIndex)}
                  className={`p-2 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 min-h-[96px] cursor-pointer transition-all ${
                    isMe
                      ? 'bg-emerald-500/20 border-emerald-400'
                      : occupied
                      ? 'bg-white/10 border-white/20'
                      : 'bg-white/5 border-dashed border-white/20 hover:border-emerald-400'
                  }`}
                >
                  {occupied ? (
                    <>
                      <img
                        src={seat.userAvatar}
                        alt={seat.userName}
                        className="w-10 h-10 rounded-full object-cover border border-white/30"
                      />
                      <span className="text-[10px] font-bold truncate w-full">
                        {seat.userName}
                      </span>
                      <span className="text-[9px] text-emerald-300 flex items-center gap-0.5">
                        {seat.micOn ? <Mic className="w-2.5 h-2.5" /> : <MicOff className="w-2.5 h-2.5" />}
                        <span>{isMe ? 'Tap leave' : `Seat ${seat.seatIndex + 1}`}</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/70">
                        <Plus className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-semibold text-white/70">
                        Seat {seat.seatIndex + 1}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Chat & Gift Bar */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="h-48 overflow-y-auto p-3.5 space-y-2 bg-zinc-50">
            {chatMessages.map((m) => (
              <div
                key={m.id}
                className={`text-xs px-3 py-1.5 rounded-xl max-w-[90%] ${
                  m.isGift
                    ? 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-200'
                    : 'bg-white text-zinc-900 border border-zinc-200'
                }`}
              >
                <span className="font-extrabold text-[#16A34A] mr-1.5">{m.userName}:</span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-2.5 border-t border-zinc-200 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Say Salam or join Live chat..."
              className="flex-1 h-10 px-3.5 rounded-full bg-zinc-100 text-xs text-zinc-950 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#16A34A]"
            />
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Send chat message"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowGiftModal(true)}
              className="h-10 px-4 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Gift className="w-4 h-4" />
              <span>Gift</span>
            </button>
          </form>
        </div>

        <YtGiftModal
          isOpen={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          recipientName={activeRoom.hostName}
          recipientAvatar={activeRoom.hostAvatar}
          contextLabel={`Peace Live · ${activeRoom.title}`}
          userCoins={userProfile.goldenCoins ?? 0}
          onSendGift={handleSendLiveGift}
          onOpenWallet={onOpenWallet}
        />
      </div>
    );
  }

  // ==========================================
  // LIVE ROOMS DIRECTORY VIEW
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto pb-24 px-3 sm:px-5 pt-4 space-y-5">
      {/* Banner Header */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-emerald-950 text-white rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-400">
            <Radio className="w-4 h-4" />
            <span>PEACE LIVE · 6 SEATS (LIKEE STYLE)</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Halal Live Rooms &amp; 5-Min PK Battles
          </h1>
          <p className="text-xs text-zinc-300">
            1 Big Host + 5 Small Guests · Gifts = Score Only (No Gambling) · Host gets 60% Beans
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isNidVerified) {
              onRequestNidVerification();
            } else {
              setShowStartForm((v) => !v);
            }
          }}
          className="h-11 px-5 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-extrabold inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg"
        >
          <Video className="w-4 h-4" />
          <span>{isNidVerified ? 'Start 6-Seat Live' : 'Verify 18+ NID to Go Live'}</span>
        </button>
      </div>

      {/* NID 18+ Status Bar */}
      {!isNidVerified && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
            <p className="text-xs font-bold text-emerald-950">
              NID Verification (18+) is required before hosting a Live room on Peaceverse24.
            </p>
          </div>
          <button
            type="button"
            onClick={onRequestNidVerification}
            className="px-3 py-1.5 rounded-full bg-[#16A34A] text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            Verify Now
          </button>
        </div>
      )}

      {/* Start Live Room Form */}
      {showStartForm && isNidVerified && (
        <form
          onSubmit={handleStartLiveRoom}
          className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-xs"
        >
          <h3 className="text-sm font-extrabold text-zinc-950">Launch 6-Seat Peace Live Room</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newRoomTitle}
              onChange={(e) => setNewRoomTitle(e.target.value)}
              placeholder="Live room title (e.g. Night Quran & Dua)"
              className="sm:col-span-2 h-10 px-3.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-[#16A34A]"
            />
            <select
              value={newRoomCategory}
              onChange={(e) => setNewRoomCategory(e.target.value)}
              className="h-10 px-3 rounded-xl border border-zinc-200 text-xs font-semibold bg-white"
            >
              <option value="Quran & Tafsir">Quran &amp; Tafsir</option>
              <option value="Nasheed & Talk">Nasheed &amp; Talk</option>
              <option value="Youth Guidance">Youth Guidance</option>
              <option value="Family & Kids">Family &amp; Kids</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowStartForm(false)}
              className="h-9 px-4 rounded-xl bg-zinc-100 text-xs font-bold text-zinc-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-5 rounded-xl bg-[#16A34A] text-white text-xs font-bold cursor-pointer"
            >
              Go Live Now
            </button>
          </div>
        </form>
      )}

      {/* Active Rooms Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {allRooms.map((room) => (
          <div
            key={room.id}
            onClick={() => {
              setActiveRoomId(room.id);
              void fetchZegoRoomToken(room.id);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveRoomId(room.id);
                void fetchZegoRoomToken(room.id);
              }
            }}
            className="bg-white border border-zinc-200 hover:border-[#16A34A] rounded-2xl overflow-hidden shadow-xs cursor-pointer group transition-all"
          >
            <div className="relative aspect-video bg-zinc-900 overflow-hidden">
              {room.coverImage ? (
                <img
                  src={room.coverImage}
                  alt={room.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-emerald-900 flex items-center justify-center">
                  <Radio className="w-10 h-10 text-emerald-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-[#DC2626] text-white text-[10px] font-extrabold">
                  LIVE · 6 SEATS
                </span>
                {room.pkBattle?.active && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-400 text-black text-[10px] font-extrabold">
                    PK BATTLE
                  </span>
                )}
              </div>

              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold inline-flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{room.viewersCount}</span>
              </span>

              <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={room.hostAvatar}
                    alt={room.hostName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#16A34A] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold truncate">{room.title}</p>
                    <p className="text-[11px] text-white/80 truncate">
                      {room.hostName} · {room.category}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#16A34A] text-[10px] font-extrabold shrink-0 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Join</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
