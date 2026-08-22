"use client";

import { useState, useEffect, useRef, useMemo, Suspense, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  sendMessage,
  fetchFaqs,
  type Turn,
  type Source,
} from "@/utils/chatService";
import { VariantProvider } from "@/context/VariantContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isError?: boolean;
}

const BOT_META = {
  kukku: {
    name: "Dr. Kukku",
    image: Images.mascots.poultry,
    subtitle: "Poultry Nutrition Expert",
    specialty: "Broilers, Layers & Poultry Feed",
    accentBg: "bg-blue-500",
    accentBgLight: "bg-blue-50",
    accentBorder: "border-blue-200",
    accentText: "text-blue-600",
    userBubble: "bg-blue-500",
    inputFocus: "focus:border-blue-400",
    greeting:
      "Hello! I'm **Dr. Kukku**, your poultry nutrition expert at Chemlife Innovations.\n\nI can help with broiler & layer nutrition, mold control, gut health, mineral supplementation, and Chemlife's poultry product range.\n\nWhat can I help you with today? 🐔",
  },
  mikku: {
    name: "Dr. Mikku",
    image: Images.mascots.dairy,
    subtitle: "Dairy & Ruminant Expert",
    specialty: "Dairy Cattle, Buffalo & Rumen Health",
    accentBg: "bg-brand-orange",
    accentBgLight: "bg-orange-50",
    accentBorder: "border-orange-200",
    accentText: "text-brand-orange",
    userBubble: "bg-brand-orange",
    inputFocus: "focus:border-orange-400",
    greeting:
      "Hello! I'm **Dr. Mikku**, your dairy & ruminant nutrition expert at Chemlife Innovations.\n\nI can help with dairy cattle nutrition, rumen health, milk yield, reproductive performance, aflatoxin management, and Chemlife's ruminant product range.\n\nWhat can I help you with today? 🐄",
  },
} as const;

type BotKey = keyof typeof BOT_META;

// ── Inline markdown renderer ─────────────────────────────────────────────────

function parseInline(str: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|`[^`]+`|\[.*?\]\(.*?\))/g;
  const splitParts = str.split(tokenRegex);
  splitParts.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      parts.push(<strong key={i} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>);
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2 && !part.startsWith("**")) {
      parts.push(<em key={i} className="italic text-slate-600">{part.slice(1, -1)}</em>);
    } else if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      parts.push(<code key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-mono border border-slate-200">{part.slice(1, -1)}</code>);
    } else if (part.startsWith("[") && part.includes("](")) {
      const labelEnd = part.indexOf("](");
      const label = part.slice(1, labelEnd);
      const url = part.slice(labelEnd + 2, -1);
      const isExternal = url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:");
      parts.push(
        <a
          key={i}
          href={url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-brand-orange hover:text-orange-700 underline underline-offset-2 font-medium"
        >
          {label}
        </a>
      );
    } else {
      parts.push(part);
    }
  });
  return parts;
}

function parseMarkdownToJSX(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listType: "ul" | "ol" = "ul";
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (!inList) return;
    const Tag = listType;
    elements.push(
      <Tag key={key} className={`mb-3 space-y-1.5 ${listType === "ol" ? "list-decimal" : "list-disc"} pl-5`}>
        {listItems}
      </Tag>
    );
    inList = false;
    listItems = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      flushList(`ul-${index}`);
      elements.push(<h3 key={`h3-${index}`} className="text-[12px] font-bold text-slate-700 mt-3 mb-1.5 uppercase tracking-wider">{parseInline(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith("## ")) {
      flushList(`ul-${index}`);
      elements.push(<h2 key={`h2-${index}`} className="text-[14px] font-bold text-slate-800 mt-3 mb-2">{parseInline(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith("> ")) {
      flushList(`ul-${index}`);
      elements.push(<blockquote key={`bq-${index}`} className="border-l-2 border-slate-300 pl-3 my-2 text-[12px] text-slate-500 italic">{parseInline(trimmed.slice(2))}</blockquote>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("\u2022 ")) {
      if (!inList || listType !== "ul") { flushList(`ul-${index}`); inList = true; listType = "ul"; listItems = []; }
      listItems.push(<li key={`li-${index}`} className="text-[13px] text-slate-700 leading-relaxed">{parseInline(trimmed.slice(2))}</li>);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== "ol") { flushList(`ul-${index}`); inList = true; listType = "ol"; listItems = []; }
      const dotIndex = trimmed.indexOf(". ");
      listItems.push(<li key={`li-${index}`} className="text-[13px] text-slate-700 leading-relaxed">{parseInline(trimmed.slice(dotIndex + 2))}</li>);
    } else if (trimmed === "---" || trimmed === "***") {
      flushList(`ul-${index}`);
      elements.push(<hr key={`hr-${index}`} className="my-3 border-slate-200" />);
    } else if (trimmed.length === 0) {
      flushList(`ul-${index}`);
    } else {
      flushList(`ul-${index}`);
      elements.push(<p key={`p-${index}`} className="mb-2.5 text-[13px] leading-relaxed text-slate-700">{parseInline(line)}</p>);
    }
  });

  flushList("ul-end");
  return elements;
}

// ── Typing dots indicator ─────────────────────────────────────────────────────

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 px-1">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

// ── Bubble sub-components ─────────────────────────────────────────────────────

function UserBubble({ content, bubbleClass }: { content: string; bubbleClass: string }) {
  return (
    <div className="flex justify-end">
      <div className={`max-w-[78%] rounded-2xl rounded-tr-none px-4 py-2.5 text-white text-sm leading-relaxed font-medium shadow-xs ${bubbleClass}`}>
        {content}
      </div>
    </div>
  );
}

function BotBubble({
  image, name, content, sources, isError, accentBgLight, accentBorder,
}: {
  image: string; name: string; content: string; sources?: Source[];
  isError?: boolean; accentBgLight: string; accentBorder: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center bg-white shadow-xs">
        <img src={image} alt={name} className="w-full h-full object-contain" />
      </div>
      <div className="max-w-[85%] min-w-0">
        <div className={`rounded-2xl rounded-tl-none px-4 py-3 border shadow-xs ${
          isError ? "bg-red-50 border-red-200" : `${accentBgLight} ${accentBorder}`
        }`}>
          {isError ? (
            <p className="text-[13px] text-red-600 leading-relaxed">⚠️ {content}</p>
          ) : (
            <div className="space-y-0.5 leading-relaxed">{parseMarkdownToJSX(content)}</div>
          )}
        </div>
        {!isError && sources && sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sources.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 rounded-lg px-2.5 py-1 transition-all font-medium">
                <span className="opacity-60">📄</span> {s.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



function ChatLoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-[3px] border-brand-navy border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading specialist session…</p>
      </div>
    </div>
  );
}

function ChatSessionContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawBot = params.bot as string;
  const botKey: BotKey = rawBot === "mikku" ? "mikku" : "kukku";
  const meta = BOT_META[botKey];

  const initialQuery = searchParams.get("q") || "";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState<string[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [countdown, setCountdown] = useState(20);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const firedQueryRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([]);
    firedQueryRef.current = {};
  }, [botKey]);

  useEffect(() => {
    if (!initialQuery || firedQueryRef.current[botKey]) return;
    firedQueryRef.current[botKey] = true;
    setMessages([{ role: "user", content: initialQuery }]);
    fireMessage(initialQuery, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botKey, initialQuery]);

  useEffect(() => {
    let alive = true;
    const loadFaqs = async () => {
      try {
        setFaqsLoading(true);
        const questions = await fetchFaqs(botKey, 4);
        if (alive) setFaqs(questions);
      } catch { /* non-critical */ }
      finally { if (alive) setFaqsLoading(false); }
    };
    loadFaqs();
    setCountdown(20);
    const refreshInterval = setInterval(() => { loadFaqs(); setCountdown(20); }, 20_000);
    const countdownInterval = setInterval(() => setCountdown((p) => Math.max(0, p - 1)), 1_000);
    return () => { alive = false; clearInterval(refreshInterval); clearInterval(countdownInterval); };
  }, [botKey]);

  const greetingMessage = useMemo(() => meta.greeting, [meta]);

  const buildHistory = (msgs: Message[]): Turn[] =>
    msgs.slice(-20).map((m) => ({ role: m.role, content: m.content }));

  const fireMessage = useCallback(async (text: string, currentHistory: Turn[]) => {
    setLoading(true);
    try {
      const data = await sendMessage(text, botKey, currentHistory);
      if (data.redirect_to) {
        delete firedQueryRef.current[data.redirect_to];
        router.replace(`/chat/${data.redirect_to}?q=${encodeURIComponent(text)}`);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, sources: data.sources }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I couldn't reach my knowledge base right now. Please try again in a moment.",
        isError: true,
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botKey, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const userMsg: Message = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    await fireMessage(trimmed, buildHistory(updated.slice(0, -1)));
  };

  const handleSelectFaq = async (faqText: string) => {
    if (loading) return;
    const userMsg: Message = { role: "user", content: faqText };
    const updated = [...messages, userMsg];
    setMessages(updated);
    await fireMessage(faqText, buildHistory(updated.slice(0, -1)));
  };

  const otherBot = botKey === "kukku" ? "mikku" : "kukku";

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans text-brand-navy">
      <Header />

      <div className="flex-1 pt-24 pb-10 max-w-[1200px] w-full mx-auto px-4 flex flex-col lg:flex-row gap-5">

        {/* Chat panel */}
        <main
          className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden"
          style={{ height: "calc(100vh - 136px)", minHeight: "520px" }}
        >
          {/* Bot header */}
          <div className={`flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 ${meta.accentBgLight}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full border-2 border-white bg-white overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md">
                <img src={meta.image} alt={meta.name} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-slate-800 text-[15px]">{meta.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider hidden sm:block">Live</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate">{meta.specialty}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/chat" className="text-[11px] font-semibold text-slate-500 hover:text-brand-navy bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all whitespace-nowrap">
                ← Agents
              </Link>
              <Link href={`/chat/${otherBot}`} className={`text-[11px] font-semibold text-white px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${meta.accentBg} hover:opacity-90`}>
                Switch to {BOT_META[otherBot].name}
              </Link>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scroll-smooth">
            <BotBubble image={meta.image} name={meta.name} content={greetingMessage} accentBgLight={meta.accentBgLight} accentBorder={meta.accentBorder} />
            {messages.map((msg, i) =>
              msg.role === "user" ? (
                <UserBubble key={i} content={msg.content} bubbleClass={meta.userBubble} />
              ) : (
                <BotBubble key={i} image={meta.image} name={meta.name} content={msg.content} sources={msg.sources} isError={msg.isError} accentBgLight={meta.accentBgLight} accentBorder={meta.accentBorder} />
              )
            )}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center bg-white shadow-xs animate-pulse">
                  <img src={meta.image} alt={meta.name} className="w-full h-full object-contain" />
                </div>
                <div className={`rounded-2xl rounded-tl-none px-4 py-3 border ${meta.accentBorder} ${meta.accentBgLight}`}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div className="px-4 py-3.5 border-t border-slate-100 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${meta.name} a question…`}
                disabled={loading}
                autoComplete="off"
                className={`flex-1 text-sm px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white transition-all placeholder:text-slate-400 text-slate-800 outline-none disabled:opacity-60 ${meta.inputFocus}`}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white transition-all disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed ${meta.accentBg}`}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-60 flex flex-col gap-4 lg:self-start lg:sticky lg:top-28">

          {/* Suggested questions */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className={`px-4 py-3 border-b border-slate-100 ${meta.accentBgLight} flex items-center justify-between`}>
              <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Suggested</h3>
              <span className="text-[10px] text-slate-400 font-semibold tabular-nums" title="Auto-refreshes every 20 seconds">↻ {countdown}s</span>
            </div>
            <div className="p-3 space-y-2">
              {faqsLoading && faqs.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
                ))
              ) : faqs.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-5">No suggestions yet.</p>
              ) : (
                faqs.map((faq, i) => (
                  <button key={i} onClick={() => handleSelectFaq(faq)} disabled={loading}
                    className={`w-full text-left text-[12px] px-3 py-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition-all text-slate-700 leading-relaxed cursor-pointer disabled:cursor-not-allowed disabled:opacity-60`}>
                    {faq}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Switch bot card */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
            <p className="text-[11px] text-slate-400 font-medium mb-2.5">Wrong specialist?</p>
            <Link href={`/chat/${otherBot}`}
              className={`flex items-center gap-3 p-2.5 rounded-xl border ${meta.accentBorder} ${meta.accentBgLight} hover:opacity-80 transition-all`}>
              <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs flex-shrink-0">
                <img src={BOT_META[otherBot].image} alt={BOT_META[otherBot].name} className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-800">{BOT_META[otherBot].name}</p>
                <p className="text-[10px] text-slate-500 truncate">{BOT_META[otherBot].specialty}</p>
              </div>
              <span className={`ml-auto text-[11px] font-semibold flex-shrink-0 ${meta.accentText}`}>Switch</span>
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-[10px] text-slate-400 text-center px-2 leading-relaxed">
            AI responses are for general guidance only. For specific advice,{" "}
            <a href="mailto:chemlifeinnovations@gmail.com" className="underline hover:text-slate-600 transition-colors">contact the Chemlife team</a>.
          </p>
        </aside>
      </div>

    </div>
  );
}

export default function ChatSessionPage() {
  return (
    <VariantProvider>
      <Suspense fallback={<ChatLoadingState />}>
        <ChatSessionContent />
      </Suspense>
      <SiteSearch />
    </VariantProvider>
  );
}
