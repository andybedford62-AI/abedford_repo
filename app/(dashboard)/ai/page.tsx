"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot, Send, Plus, Sparkles, Code, FileText, Lightbulb,
  MessageSquare, Loader2, ChevronRight, Trash2, History
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  _count: { messages: number };
}

const PROMPT_SUGGESTIONS = [
  { icon: Code, label: "Write code", prompt: "Write a TypeScript function that debounces async function calls with a configurable delay" },
  { icon: FileText, label: "Draft content", prompt: "Write a professional email to a client explaining a 2-week delay in project delivery" },
  { icon: Lightbulb, label: "Brainstorm", prompt: "Give me 10 creative ideas for improving team engagement in a remote-first company" },
  { icon: MessageSquare, label: "Summarize", prompt: "Help me write a concise project status update for stakeholders based on recent progress" },
];

function MarkdownContent({ content }: { content: string }) {
  // Basic markdown rendering - in production use react-markdown
  const html = content
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-xs font-mono my-3"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^#{3} (.+)$/gm, '<h3 class="text-base font-bold mt-4 mb-2">$1</h3>')
    .replace(/^#{2} (.+)$/gm, '<h2 class="text-lg font-bold mt-4 mb-2">$1</h2>')
    .replace(/^#{1} (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  return (
    <div
      className="text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/ai/chat");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || loading) return;

    setInput("");
    setLoading(true);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, conversationId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      const { text, conversationId: cId } = data;
      if (cId && !conversationId) setConversationId(cId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, content: text } : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: "Sorry, I encountered an error. Please try again." }
            : m
        )
      );
    } finally {
      setLoading(false);
      await loadConversations();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setShowHistory(false);
  };

  return (
    <div className="flex h-full gap-0 -m-6">
      {/* Conversation history sidebar */}
      <div className={cn(
        "w-64 bg-white dark:bg-[#0a0a1a] border-r border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-200",
        !showHistory && "hidden lg:flex"
      )}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={startNewConversation}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Recent</p>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                setConversationId(conv.id);
                setShowHistory(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-xs transition-all",
                conv.id === conversationId
                  ? "bg-nexus-100 dark:bg-nexus-950/50 text-nexus-700 dark:text-nexus-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div className="font-medium truncate">{conv.title || "New conversation"}</div>
              <div className="text-gray-400 text-[10px] mt-0.5">{conv._count.messages} messages</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a1a] flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center shadow-md shadow-nexus-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Claude AI Assistant
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-nexus-100 dark:bg-nexus-950/50 text-nexus-700 dark:text-nexus-300 uppercase tracking-wide">claude-sonnet-4-6</span>
            </h1>
            <p className="text-xs text-gray-400">Powered by Anthropic · Context-aware workspace AI</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
            >
              <History className="w-4 h-4" />
            </button>
            {messages.length > 0 && (
              <button
                onClick={startNewConversation}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                New chat
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center mb-6 shadow-xl shadow-nexus-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                How can I help you?
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-md leading-relaxed">
                I&apos;m your AI workspace assistant powered by Claude. Ask me anything — from writing code to planning projects to analyzing data.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {PROMPT_SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => sendMessage(prompt)}
                    className="group flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0d0d21] hover:border-nexus-300 dark:hover:border-nexus-700 hover:shadow-md transition-all text-left"
                  >
                    <Icon className="w-4 h-4 text-nexus-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-0.5">{label}</div>
                      <div className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">{prompt}</div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-nexus-400 flex-shrink-0 mt-0.5 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-nexus-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-5 py-4",
                      msg.role === "user"
                        ? "bg-gradient-to-br from-nexus-500 to-violet-600 text-white rounded-tr-sm"
                        : "bg-white dark:bg-[#0d0d21] border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm"
                    )}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : msg.content ? (
                      <MarkdownContent content={msg.content} />
                    ) : (
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-xs">Thinking...</span>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold text-gray-600 dark:text-gray-300">
                      U
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-6 pb-6 pt-3 bg-gradient-to-t from-gray-50 dark:from-[#060612] to-transparent">
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-white dark:bg-[#0d0d21] rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus-within:border-nexus-400 dark:focus-within:border-nexus-600 transition-colors shadow-lg">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Claude anything... (Shift+Enter for new line)"
                rows={1}
                className="w-full px-5 py-4 pr-14 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none resize-none max-h-40 scrollbar-thin"
                style={{ minHeight: "52px" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="absolute right-3 bottom-3 w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-nexus-500 to-violet-600 text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-nexus-500/25"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              Claude can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
