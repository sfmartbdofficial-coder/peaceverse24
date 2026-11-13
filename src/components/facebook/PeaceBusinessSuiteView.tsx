import React, { useState } from 'react';
import {
  ArrowLeft,
  Briefcase,
  Flag,
  ShoppingBag,
  Inbox,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MessageCircle,
  Send,
  PhoneCall,
  MessageSquare,
  Users,
  Eye,
  Check,
} from 'lucide-react';
import { PageItem, UserProfile } from '../../types';
import { FbPagesView } from './FbPagesView';

type BusinessSuiteTab = 'pages' | 'orders' | 'inbox' | 'insights';
type InboxChannel = 'all' | 'page' | 'whatsapp' | 'comment';

interface BusinessOrder {
  id: string;
  orderNo: string;
  shopName: string;
  customerName: string;
  itemsSummary: string;
  amount: number;
  status: 'Pending Halal Check' | 'Halal Verified' | 'Delivered';
  timeAgo: string;
}

interface UnifiedInboxItem {
  id: string;
  channel: 'page' | 'whatsapp' | 'comment';
  senderName: string;
  pageName: string;
  preview: string;
  timeAgo: string;
  unread: boolean;
  replies: { id: string; text: string; time: string }[];
}

interface PeaceBusinessSuiteViewProps {
  onBack: () => void;
  userProfile: UserProfile;
  onSwitchToPage?: (page: PageItem) => void;
}

const INITIAL_ORDERS: BusinessOrder[] = [
  {
    id: 'ord-101',
    orderNo: 'Order #101',
    shopName: 'Peace Mart Global',
    customerName: 'তানভীর আহমেদ',
    itemsSummary: 'প্রিমিয়াম তুর্কি জায়নামাজ + উদ আতর (১২ মি.লি.)',
    amount: 1200,
    status: 'Pending Halal Check',
    timeAgo: '১০ মিনিট আগে',
  },
  {
    id: 'ord-102',
    orderNo: 'Order #102',
    shopName: 'Peace Mart Global',
    customerName: 'মাহমুদুল হাসান',
    itemsSummary: 'সুন্দরবনের খাঁটি মধু (১ কেজি)',
    amount: 950,
    status: 'Halal Verified',
    timeAgo: '১ ঘণ্টা আগে',
  },
  {
    id: 'ord-103',
    orderNo: 'Order #103',
    shopName: 'হালাল ফুড কিচেন',
    customerName: 'ফারিহা তাসনিম',
    itemsSummary: 'হালাল বিফ বিরিয়ানি ও বোরহানি কম্বো',
    amount: 780,
    status: 'Delivered',
    timeAgo: '৩ ঘণ্টা আগে',
  },
  {
    id: 'ord-104',
    orderNo: 'Order #104',
    shopName: 'নূর কুরআন একাডেমি',
    customerName: 'রাশেদুল ইসলাম',
    itemsSummary: 'তাজবীদসহ রঙিন কুরআন শরিফ (হার্ডকভার)',
    amount: 1450,
    status: 'Pending Halal Check',
    timeAgo: '৫ ঘণ্টা আগে',
  },
];

const INITIAL_INBOX: UnifiedInboxItem[] = [
  {
    id: 'inb-1',
    channel: 'page',
    senderName: 'সাঈদ আনোয়ার',
    pageName: 'Peace Mart Global • Page Message',
    preview: 'আসসালামু আলাইকুম ভাই, Order #101 এর জায়নামাজ কি আজ ডেলিভারি হবে?',
    timeAgo: '৫ মিনিট আগে',
    unread: true,
    replies: [],
  },
  {
    id: 'inb-2',
    channel: 'whatsapp',
    senderName: '+880 1711-234567',
    pageName: 'Peace Mart Global • WhatsApp Business',
    preview: 'সুগন্ধি আতরের হোলসেল প্রাইসটা একটু জানাবেন প্লিজ।',
    timeAgo: '২২ মিনিট আগে',
    unread: true,
    replies: [],
  },
  {
    id: 'inb-3',
    channel: 'comment',
    senderName: 'নাজমুল হুদা',
    pageName: "Sharif's Life Story • Post Comment",
    preview: 'মাশাআল্লাহ! আপনাদের হালাল পণ্যের কোয়ালিটি খুবই চমৎকার।',
    timeAgo: '১ ঘণ্টা আগে',
    unread: false,
    replies: [],
  },
  {
    id: 'inb-4',
    channel: 'whatsapp',
    senderName: '+880 1822-987654',
    pageName: 'নূর কুরআন একাডেমি • WhatsApp',
    preview: 'অনলাইন হিফজ ব্যাচের নতুন সিডিউল কবে শুরু হবে?',
    timeAgo: '২ ঘণ্টা আগে',
    unread: false,
    replies: [],
  },
];

const WEEKLY_VIEWS_DATA = [
  { day: 'শনি', views: 0 },
  { day: 'রবি', views: 0 },
  { day: 'সোম', views: 1 },
  { day: 'মঙ্গল', views: 0 },
  { day: 'বুধ', views: 0 },
  { day: 'বৃহঃ', views: 1 },
  { day: 'শুক্র', views: 0 },
];

const FOLLOWER_GROWTH_DATA = [
  { label: 'W1', count: 1420 },
  { label: 'W2', count: 1650 },
  { label: 'W3', count: 1890 },
  { label: 'W4', count: 2100 },
];

export const PeaceBusinessSuiteView: React.FC<PeaceBusinessSuiteViewProps> = ({
  onBack,
  userProfile,
  onSwitchToPage,
}) => {
  const [activeTab, setActiveTab] = useState<BusinessSuiteTab>('pages');
  const [orders, setOrders] = useState<BusinessOrder[]>(INITIAL_ORDERS);
  const [orderFilter, setOrderFilter] = useState<'all' | BusinessOrder['status']>('all');
  const [inboxItems, setInboxItems] = useState<UnifiedInboxItem[]>(INITIAL_INBOX);
  const [inboxChannel, setInboxChannel] = useState<InboxChannel>('all');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusNotice(msg);
    window.setTimeout(() => {
      setStatusNotice((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleUpdateOrderStatus = (orderId: string, nextStatus: BusinessOrder['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
    showToast(`অর্ডার স্ট্যাটাস আপডেট: ${nextStatus} ✓`);
  };

  const handleSendInboxReply = (itemId: string) => {
    const text = (replyTexts[itemId] || '').trim();
    if (!text) return;
    setInboxItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              unread: false,
              replies: [...it.replies, { id: `rep-${Date.now()}`, text, time: 'এইমাত্র' }],
            }
          : it
      )
    );
    setReplyTexts((prev) => ({ ...prev, [itemId]: '' }));
    showToast('উত্তর পাঠানো হয়েছে ✓');
  };

  const filteredOrders = orders.filter((o) => orderFilter === 'all' || o.status === orderFilter);
  const filteredInbox = inboxItems.filter((i) => inboxChannel === 'all' || i.channel === inboxChannel);

  return (
    <div className="min-h-screen bg-[#12141B] text-[#e4e6eb] pb-20">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-[#181B24]/95 backdrop-blur-md border-b border-white/10 px-3 sm:px-5">
        <div className="max-w-[740px] mx-auto py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="min-w-[44px] min-h-[44px] -ml-1.5 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Back to Peaceverse"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0866FF] to-sky-400 flex items-center justify-center text-white shadow shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-base sm:text-lg text-white truncate leading-tight">
                Peace Business Suite
              </h1>
              <p className="text-[11px] text-[#b0b3b8] truncate">
                পেজ, অর্ডার, ইনবক্স ও ইনসাইটস • {userProfile.name || 'Sharif Hasan'}
              </p>
            </div>
          </div>
        </div>

        {/* Top Stats Bar: Total Pages: 5, Total Orders: 12, 100% Halal Verified */}
        <div className="max-w-[740px] mx-auto pb-3 grid grid-cols-3 gap-2">
          <div className="bg-[#202430] border border-white/10 rounded-xl px-3 py-2">
            <p className="text-[10px] text-[#b0b3b8] font-semibold">Total Pages</p>
            <p className="text-sm sm:text-base font-extrabold text-white tabular-nums">5</p>
          </div>
          <div className="bg-[#202430] border border-white/10 rounded-xl px-3 py-2">
            <p className="text-[10px] text-[#b0b3b8] font-semibold">Total Orders</p>
            <p className="text-sm sm:text-base font-extrabold text-amber-400 tabular-nums">12</p>
          </div>
          <div className="bg-[#202430] border border-emerald-500/30 rounded-xl px-3 py-2 flex items-center justify-between gap-1.5">
            <div className="min-w-0">
              <p className="text-[10px] text-emerald-300 font-semibold truncate">Halal Status</p>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-400 truncate">
                100% Halal Verified
              </p>
            </div>
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 hidden sm:block" />
          </div>
        </div>

        {/* Top Dashboard Tabs: Pages, Orders, Inbox, Insights */}
        <nav className="max-w-[740px] mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5">
          {[
            { id: 'pages' as const, label: 'Pages (পেইজ)', icon: Flag },
            { id: 'orders' as const, label: 'Orders (১২)', icon: ShoppingBag },
            { id: 'inbox' as const, label: 'Inbox (ইনবক্স)', icon: Inbox },
            { id: 'insights' as const, label: 'Insights (ইনসাইটস)', icon: TrendingUp },
          ].map((tab) => {
            const IconComp = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-[#0866FF] text-white shadow'
                    : 'bg-[#202430] text-[#b0b3b8] hover:text-white border border-white/10'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Toast Notification */}
      {statusNotice && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-1.5">
          <Check className="w-4 h-4" />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Main Tab Body */}
      <div className="max-w-[740px] mx-auto p-3 sm:p-4">
        {/* TAB 1: PAGES (Keep exact SF MART BD list, views & filters from Image 2) */}
        {activeTab === 'pages' && (
          <FbPagesView
            embedded={true}
            onBack={onBack}
            userProfile={userProfile}
            onSwitchToPage={(page) => {
              if (onSwitchToPage) onSwitchToPage(page);
            }}
          />
        )}

        {/* TAB 2: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-base font-extrabold text-white">হালাল অর্ডার ব্যবস্থাপনা (Orders)</h2>
                <p className="text-xs text-[#b0b3b8]">মোট অর্ডার: ১২টি • রিয়েল-টাইম হালাল যাচাইকরণ</p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['all', 'Pending Halal Check', 'Halal Verified', 'Delivered'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      orderFilter === st
                        ? 'bg-[#0866FF] text-white'
                        : 'bg-[#202430] text-[#b0b3b8] hover:text-white border border-white/10'
                    }`}
                  >
                    {st === 'all' ? 'সবগুলো' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredOrders.map((order) => {
                const isPending = order.status === 'Pending Halal Check';
                const isVerified = order.status === 'Halal Verified';
                return (
                  <div
                    key={order.id}
                    className="bg-[#1B1E28] border border-white/10 rounded-2xl p-4 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-white">
                          {order.orderNo} {order.shopName} -{' '}
                          <span className="text-emerald-400 tabular-nums">৳{order.amount}</span>
                        </p>
                        <p className="text-xs text-[#b0b3b8] mt-0.5">
                          ক্রেতা: {order.customerName} · {order.timeAgo}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap flex items-center gap-1 shrink-0 ${
                          isPending
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : isVerified
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                        }`}
                      >
                        {isPending ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        <span>Status: {order.status}</span>
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 bg-[#141720] px-3 py-2 rounded-xl border border-white/5">
                      পণ্য: {order.itemsSummary}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-0.5">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order.id, 'Halal Verified')}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Halal Verify করুন</span>
                        </button>
                      )}
                      {order.status !== 'Delivered' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                          className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold cursor-pointer"
                        >
                          ডেলিভারি সম্পন্ন
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: UNIFIED INBOX (Page messages + WhatsApp + Comments) */}
        {activeTab === 'inbox' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-base font-extrabold text-white">Unified Inbox (একীভূত ইনবক্স)</h2>
                <p className="text-xs text-[#b0b3b8]">Page messages + WhatsApp + Comments এক জায়গায়</p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all' as const, label: 'সব মেসেজ' },
                  { id: 'page' as const, label: 'Page Messages' },
                  { id: 'whatsapp' as const, label: 'WhatsApp' },
                  { id: 'comment' as const, label: 'Comments' },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setInboxChannel(ch.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      inboxChannel === ch.id
                        ? 'bg-[#0866FF] text-white'
                        : 'bg-[#202430] text-[#b0b3b8] hover:text-white border border-white/10'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredInbox.map((item) => {
                const ChannelIcon =
                  item.channel === 'whatsapp'
                    ? PhoneCall
                    : item.channel === 'comment'
                    ? MessageSquare
                    : MessageCircle;
                const channelBadgeColor =
                  item.channel === 'whatsapp'
                    ? 'bg-[#25D366]/20 text-[#25D366]'
                    : item.channel === 'comment'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-[#0866FF]/20 text-[#60a5fa]';

                return (
                  <div
                    key={item.id}
                    className="bg-[#1B1E28] border border-white/10 rounded-2xl p-4 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${channelBadgeColor}`}
                        >
                          <ChannelIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white truncate">{item.senderName}</p>
                            {item.unread && (
                              <span className="text-[10px] font-bold text-[#00FF88]">নতুন</span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#b0b3b8] truncate">
                            {item.pageName} · {item.timeAgo}
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-200 leading-relaxed bg-[#141720] p-3 rounded-xl border border-white/5">
                      {item.preview}
                    </p>

                    {item.replies.length > 0 && (
                      <div className="space-y-1.5 pl-3 border-l-2 border-[#0866FF]/50">
                        {item.replies.map((rep) => (
                          <div key={rep.id} className="text-xs text-sky-200 bg-[#0866FF]/15 px-3 py-2 rounded-xl">
                            <span className="font-bold">আপনি: </span>
                            <span>{rep.text}</span>
                            <span className="text-[10px] text-sky-300/70 ml-2">({rep.time})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-0.5">
                      <input
                        type="text"
                        value={replyTexts[item.id] || ''}
                        onChange={(e) =>
                          setReplyTexts((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendInboxReply(item.id);
                          }
                        }}
                        placeholder="সরাসরি উত্তর লিখুন..."
                        className="flex-1 bg-[#141720] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#0866FF]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendInboxReply(item.id)}
                        className="min-h-[38px] px-3.5 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>পাঠান</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: INSIGHTS (2 new views this week graph + 2100 followers growth) */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: 2 new views this week */}
              <div className="bg-[#1B1E28] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#b0b3b8] font-medium">Peace Mart Global • সাপ্তাহিক ভিউ</p>
                    <h3 className="text-lg font-extrabold text-white mt-0.5 tabular-nums">
                      2 new views this week
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>

                {/* Simple Clean Bar Graph */}
                <div className="h-28 flex items-end justify-between gap-2 pt-2 px-1">
                  {WEEKLY_VIEWS_DATA.map((d) => {
                    const barHeight = d.views > 0 ? '78%' : '14%';
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <div className="w-full flex items-end justify-center h-20">
                          <div
                            className={`w-full max-w-[26px] rounded-t-lg transition-all ${
                              d.views > 0 ? 'bg-[#00FF88]' : 'bg-white/10'
                            }`}
                            style={{ height: barHeight }}
                            title={`${d.day}: ${d.views} view`}
                          />
                        </div>
                        <span className="text-[10px] text-[#b0b3b8]">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 2: 2100 followers growth */}
              <div className="bg-[#1B1E28] border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#b0b3b8] font-medium">Peace Mart Global • অডিয়েন্স গ্রোথ</p>
                    <h3 className="text-lg font-extrabold text-white mt-0.5 tabular-nums">
                      2100 followers growth
                    </h3>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#0866FF]/20 text-[#60a5fa] flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                {/* Growth Trend Area SVG */}
                <div className="pt-1">
                  <svg viewBox="0 0 260 88" className="w-full h-24 overflow-visible">
                    <defs>
                      <linearGradient id="followersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0866FF" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#0866FF" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 10 68 L 90 50 L 170 30 L 248 12 L 248 80 L 10 80 Z"
                      fill="url(#followersGrad)"
                    />
                    <path
                      d="M 10 68 L 90 50 L 170 30 L 248 12"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {FOLLOWER_GROWTH_DATA.map((pt, idx) => {
                      const cx = 10 + idx * 79;
                      const cy = [68, 50, 30, 12][idx];
                      return (
                        <g key={pt.label}>
                          <circle cx={cx} cy={cy} r="4" fill="#38bdf8" />
                          <text
                            x={cx}
                            y={86}
                            textAnchor="middle"
                            className="fill-[#b0b3b8] text-[9px]"
                          >
                            {pt.label} ({pt.count})
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Summary Highlight Card */}
            <div className="bg-[#1B1E28] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-white">Peace Mart Global • সেরা পারফর্মিং হালাল শপ</p>
                <p className="text-[11px] text-[#b0b3b8] mt-0.5">
                  ১.৮K লাইক · ২১০০ ফলোয়ার্স · ৪.৯ ★ রেটিং (১৪০+ রিভিউ)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="px-3.5 py-2 rounded-xl bg-[#0866FF] hover:bg-[#1877F2] text-white text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                অর্ডার দেখুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
