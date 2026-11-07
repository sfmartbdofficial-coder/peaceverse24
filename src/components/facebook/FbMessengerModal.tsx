import React, { useState } from 'react';
import {
  X,
  Send,
  ArrowLeft,
  Search,
  Phone,
  Video,
  Smile,
  CheckCheck,
  MessageCircle,
  MoreVertical,
  Plus
} from 'lucide-react';
import { ChatFriend } from '../../types';

interface FbMessengerModalProps {
  chatFriends: ChatFriend[];
  activeFriend: ChatFriend | null;
  onSelectFriend: (friend: ChatFriend | null) => void;
  onClose: () => void;
  onSendMessage: (friendId: string, text: string) => void;
}

export const FbMessengerModal: React.FC<FbMessengerModalProps> = ({
  chatFriends,
  activeFriend,
  onSelectFriend,
  onClose,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const quickGreetings = [
    'আসসালামু আলাইকুম 🍃',
    'কেমন আছেন ভাই? ✨',
    'মাশাআল্লাহ ❤️',
    'জাযাকাল্লাহ খাইরান 🤲',
    'ধন্যবাদ ভাই 🙏',
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeFriend) return;
    onSendMessage(activeFriend.id, inputText.trim());
    setInputText('');
  };

  const filteredFriends = chatFriends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-md h-[88vh] sm:h-[620px] bg-white dark:bg-[#242526] rounded-t-[24px] sm:rounded-2xl border border-[#E4E6EB] dark:border-[#393a3b] shadow-2xl flex flex-col overflow-hidden font-sans text-[#050505] dark:text-white">
        
        {/* ======================================================== */}
        {/* VIEW 1: ACTIVE CONVERSATION SCREEN */}
        {/* ======================================================== */}
        {activeFriend ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-[#18191a] border-b border-[#E4E6EB] dark:border-[#393a3b] shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectFriend(null)}
                  className="p-1.5 -ml-1 rounded-full hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] text-[#050505] dark:text-white transition-colors cursor-pointer"
                  title="All chats"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="relative">
                  <img
                    src={activeFriend.avatar}
                    alt={activeFriend.name}
                    className="w-9 h-9 rounded-full object-cover border border-[#E4E6EB] dark:border-[#393a3b]"
                  />
                  {activeFriend.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#18191a] rounded-full" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-bold text-[#050505] dark:text-white leading-tight">
                    {activeFriend.name}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {activeFriend.online ? 'Active now' : activeFriend.lastSeen || 'Offline'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[#0866FF]">
                <button
                  onClick={() => alert(`Calling ${activeFriend.name}...`)}
                  className="p-2 rounded-full hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
                  title="Audio call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alert(`Starting video call with ${activeFriend.name}...`)}
                  className="p-2 rounded-full hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] transition-colors cursor-pointer"
                  title="Video call"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] text-[#65676B] dark:text-white transition-colors cursor-pointer ml-1"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-2.5 text-xs bg-[#F0F2F5]/50 dark:bg-[#18191a]">
              {activeFriend.messages.map((m) => {
                const isMe = m.sender === 'me';
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`px-3.5 py-2 rounded-2xl max-w-[80%] font-bengali text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-[#0866FF] text-white rounded-br-xs'
                          : 'bg-white dark:bg-[#3a3b3c] text-[#050505] dark:text-[#e4e6eb] rounded-bl-xs border border-[#E4E6EB] dark:border-transparent'
                      }`}
                    >
                      <p>{m.text}</p>
                    </div>
                    <span className="text-[10px] text-[#65676B] dark:text-[#b0b3b8] mt-0.5 px-1.5 flex items-center gap-1">
                      {m.time} {isMe && <CheckCheck className="w-3 h-3 text-[#0866FF]" />}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Greeting Pills */}
            <div className="px-3 py-1.5 bg-white dark:bg-[#242526] border-t border-[#E4E6EB] dark:border-[#393a3b] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {quickGreetings.map((q) => (
                <button
                  key={q}
                  onClick={() => onSendMessage(activeFriend.id, q)}
                  className="px-3 py-1 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] dark:bg-[#3a3b3c] dark:hover:bg-[#4e4f50] text-[#050505] dark:text-[#e4e6eb] text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-2.5 bg-white dark:bg-[#242526] border-t border-[#E4E6EB] dark:border-[#393a3b] flex items-center gap-2">
              <input
                type="text"
                placeholder="Aa"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-[#F0F2F5] dark:bg-[#3a3b3c] text-[#050505] dark:text-white rounded-full px-4 py-2 text-sm placeholder-[#65676B] dark:placeholder-[#b0b3b8] focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-full bg-[#0866FF] hover:bg-[#0055d4] disabled:opacity-30 text-white transition-all shadow-xs cursor-pointer"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          /* ======================================================== */
          /* VIEW 2: MESSENGER INBOX / CHATS LIST */
          /* ======================================================== */
          <>
            {/* Inbox Header */}
            <div className="p-3.5 border-b border-[#E4E6EB] dark:border-[#393a3b] space-y-3 bg-white dark:bg-[#242526]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#050505] dark:text-white tracking-tight flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-[#0866FF] fill-[#0866FF]" />
                  <span>Chats</span>
                </h2>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c] text-[#65676B] dark:text-[#b0b3b8] hover:text-[#050505] dark:hover:text-white transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-5 h-5 stroke-[2.2]" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Messenger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F0F2F5] dark:bg-[#3a3b3c] text-[#050505] dark:text-white text-xs sm:text-sm pl-9 pr-4 py-2 rounded-full placeholder-[#65676B] dark:placeholder-[#b0b3b8] focus:outline-none focus:ring-1 focus:ring-[#0866FF]"
                />
                <Search className="w-4 h-4 text-[#65676B] dark:text-[#b0b3b8] absolute left-3 top-2.5" />
              </div>

              {/* Active Now / Stories Row */}
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pt-1">
                {chatFriends.map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => onSelectFriend(friend)}
                    className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer group"
                  >
                    <div className="relative">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-[#242526] group-hover:opacity-90 transition-opacity"
                      />
                      {friend.online && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#242526] rounded-full" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#050505] dark:text-[#e4e6eb] truncate w-14 text-center font-medium">
                      {friend.name.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-[#E4E6EB]/60 dark:divide-[#393a3b]/60">
              {filteredFriends.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#65676B] dark:text-[#b0b3b8]">
                  কোনো মেসেজ খুঁজে পাওয়া যায়নি।
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const latestMsg = friend.messages[friend.messages.length - 1];
                  const hasUnread = (friend.unreadCount || 0) > 0;

                  return (
                    <div
                      key={friend.id}
                      onClick={() => onSelectFriend(friend)}
                      className={`p-3 sm:px-4 flex items-center justify-between hover:bg-[#F0F2F5] dark:hover:bg-[#3a3b3c]/60 transition-colors cursor-pointer ${
                        hasUnread ? 'bg-[#E7F3FF]/40 dark:bg-[#1877F2]/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative flex-shrink-0">
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-12 h-12 rounded-full object-cover border border-[#E4E6EB] dark:border-[#393a3b]"
                          />
                          {friend.online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#242526] rounded-full" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={`text-sm truncate leading-tight ${hasUnread ? 'font-bold text-[#050505] dark:text-white' : 'font-semibold text-[#050505] dark:text-white'}`}>
                            {friend.name}
                          </p>
                          <p className={`text-xs truncate mt-0.5 font-bengali ${hasUnread ? 'font-bold text-[#0866FF]' : 'text-[#65676B] dark:text-[#b0b3b8]'}`}>
                            {latestMsg ? latestMsg.text : 'No messages yet'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                        <span className="text-[10px] text-[#65676B] dark:text-[#b0b3b8]">
                          {latestMsg ? latestMsg.time : ''}
                        </span>
                        {hasUnread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0866FF]" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
