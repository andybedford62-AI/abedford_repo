"use client";

import { useState, useRef, useEffect } from "react";
import {
  Hash, Send, Smile, Paperclip, Plus, Users,
  Search, Pin, Settings, ChevronRight
} from "lucide-react";
import { cn, generateInitials, formatRelativeTime } from "@/lib/utils";

interface ChannelMessage {
  id: string;
  content: string;
  author: { name: string; image?: string };
  timestamp: Date;
  reactions?: { emoji: string; count: number }[];
}

const DEMO_CHANNELS = ["general", "engineering", "design", "random", "product"];

const DEMO_MESSAGES: Record<string, ChannelMessage[]> = {
  general: [
    { id: "1", content: "Hey team! Excited to kick off Q1 planning 🚀", author: { name: "Alice Johnson" }, timestamp: new Date(Date.now() - 3600000) },
    { id: "2", content: "Same here! I've prepared the project timeline. Will share it shortly.", author: { name: "Bob Smith" }, timestamp: new Date(Date.now() - 3000000) },
    { id: "3", content: "The new NexusAI features are live! Check out the AI assistant 🤖", author: { name: "Carol Davis" }, timestamp: new Date(Date.now() - 1800000), reactions: [{ emoji: "🎉", count: 4 }, { emoji: "👏", count: 3 }] },
    { id: "4", content: "Amazing work everyone. The Kanban board looks fantastic!", author: { name: "Alice Johnson" }, timestamp: new Date(Date.now() - 900000) },
    { id: "5", content: "Thanks! I'll push the final updates before EOD.", author: { name: "Bob Smith" }, timestamp: new Date(Date.now() - 300000) },
  ],
  engineering: [
    { id: "e1", content: "PR #142 is ready for review — `feat/kanban-dnd`", author: { name: "Carol Davis" }, timestamp: new Date(Date.now() - 7200000) },
    { id: "e2", content: "Approved ✅ Merging to main now", author: { name: "Bob Smith" }, timestamp: new Date(Date.now() - 3600000) },
    { id: "e3", content: "Build passed. Deploying to staging...", author: { name: "Alice Johnson" }, timestamp: new Date(Date.now() - 1200000) },
  ],
  design: [
    { id: "d1", content: "New design system components are in Figma. Link in pinned messages.", author: { name: "Carol Davis" }, timestamp: new Date(Date.now() - 14400000) },
    { id: "d2", content: "The dark mode palette looks 🔥", author: { name: "Alice Johnson" }, timestamp: new Date(Date.now() - 7200000) },
  ],
  random: [
    { id: "r1", content: "Anyone else watching the new F1 season? 🏎️", author: { name: "Bob Smith" }, timestamp: new Date(Date.now() - 86400000) },
    { id: "r2", content: "YES! What a race yesterday", author: { name: "Carol Davis" }, timestamp: new Date(Date.now() - 82800000) },
  ],
  product: [
    { id: "p1", content: "User feedback from beta: overwhelmingly positive! NPS score is 72 🎯", author: { name: "Alice Johnson" }, timestamp: new Date(Date.now() - 3600000) },
  ],
};

const ONLINE_USERS = [
  { name: "Alice Johnson", status: "online" },
  { name: "Bob Smith", status: "online" },
  { name: "Carol Davis", status: "away" },
  { name: "Dave Wilson", status: "offline" },
];

export default function ChatPage() {
  const [activeChannel, setActiveChannel] = useState("general");
  const [messagesByChannel, setMessagesByChannel] = useState(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [showMembers, setShowMembers] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChannel, messagesByChannel]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg: ChannelMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      author: { name: "You" },
      timestamp: new Date(),
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [activeChannel]: [...(prev[activeChannel] ?? []), newMsg],
    }));
    setInput("");
  };

  const messages = messagesByChannel[activeChannel] ?? [];

  return (
    <div className="flex h-full -m-6 overflow-hidden">
      {/* Channels sidebar */}
      <div className="w-56 bg-white dark:bg-[#0a0a1a] border-r border-gray-100 dark:border-gray-800 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              placeholder="Search channels..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          <div className="flex items-center justify-between px-2 py-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Channels</span>
            <button className="w-4 h-4 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {DEMO_CHANNELS.map((channel) => (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={cn(
                "flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-sm transition-all",
                channel === activeChannel
                  ? "bg-nexus-100 dark:bg-nexus-950/50 text-nexus-700 dark:text-nexus-300 font-semibold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <span className="text-gray-400 font-bold text-xs">#</span>
              <span className="flex-1 text-left truncate text-xs">{channel}</span>
              {channel === "general" && (
                <span className="w-1.5 h-1.5 rounded-full bg-nexus-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0d0d21]">
        {/* Channel header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="font-bold text-gray-900 dark:text-white">{activeChannel}</span>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span className="text-xs text-gray-400">{messages.length} messages</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400">
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                showMembers
                  ? "bg-nexus-100 dark:bg-nexus-950/50 text-nexus-600 dark:text-nexus-400"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
              )}
            >
              <Users className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Messages */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 scrollbar-thin">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-2xl bg-nexus-100 dark:bg-nexus-950/50 flex items-center justify-center mb-3">
                    <Hash className="w-6 h-6 text-nexus-500" />
                  </div>
                  <p className="font-bold text-gray-700 dark:text-gray-300">Start the conversation in #{activeChannel}</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to send a message!</p>
                </div>
              )}

              {messages.map((msg, i) => {
                const prevMsg = messages[i - 1];
                const sameAuthor = prevMsg?.author.name === msg.author.name &&
                  new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 300000;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-3 group hover:bg-gray-50 dark:hover:bg-gray-900/30 rounded-xl px-2 py-1 transition-colors",
                      !sameAuthor && "mt-4"
                    )}
                  >
                    {!sameAuthor ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nexus-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {generateInitials(msg.author.name)}
                      </div>
                    ) : (
                      <div className="w-8 flex-shrink-0" />
                    )}

                    <div className="flex-1 min-w-0">
                      {!sameAuthor && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{msg.author.name}</span>
                          <span className="text-[10px] text-gray-400">{formatRelativeTime(msg.timestamp)}</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex gap-1.5 mt-1.5">
                          {msg.reactions.map((r) => (
                            <button
                              key={r.emoji}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <span>{r.emoji}</span>
                              <span className="text-gray-600 dark:text-gray-400 font-medium">{r.count}</span>
                            </button>
                          ))}
                          <button className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 text-xs text-gray-400 hover:bg-gray-200 transition-colors">
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Hover actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 flex-shrink-0">
                      <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 text-xs">
                        <Smile className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 text-xs">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="flex-shrink-0 px-5 pb-5 pt-2">
              <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 focus-within:border-nexus-400 dark:focus-within:border-nexus-600 transition-colors">
                <button className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 pb-0.5">
                  <Paperclip className="w-4 h-4" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                  }}
                  placeholder={`Message #${activeChannel}`}
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none max-h-32 scrollbar-thin"
                />
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors pb-0.5">
                    <Smile className="w-4 h-4" />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="p-1.5 rounded-lg bg-nexus-500 text-white hover:bg-nexus-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Members panel */}
          {showMembers && (
            <div className="w-52 border-l border-gray-100 dark:border-gray-800 flex-shrink-0 overflow-y-auto scrollbar-thin p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-3">
                Members — {ONLINE_USERS.filter((u) => u.status === "online").length} online
              </p>
              {ONLINE_USERS.map((user) => (
                <div key={user.name} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <div className="relative flex-shrink-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-nexus-400 to-violet-500 flex items-center justify-center text-white text-[9px] font-bold">
                      {generateInitials(user.name)}
                    </div>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0d0d21]",
                      user.status === "online" ? "bg-green-500" :
                      user.status === "away" ? "bg-amber-500" : "bg-gray-400"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{user.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
