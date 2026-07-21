"use client";

import { useState, useEffect, useRef, useMemo, Suspense } from "react";
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

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  redirectTo?: string;
}

const BOT_META = {
  kukku: {
    name: "Dr. Kukku",
    image: "/images/poultry-mascot.png",
    subtitle: "Poultry Nutrition Expert",
    accent: "#3b82f6", // Blue
    border: "border-blue-100",
    bgLight: "bg-blue-50/50",
    textAccent: "text-blue-600",
    userBubble: "bg-blue-500",
    greeting: "Hello! I'm Dr. Kukku, your poultry nutrition expert at Chemlife Innovations. How can I help you today?",
  },
  mikku: {
    name: "Dr. Mikku",
    image: "/images/dairy-mascot.png",
    subtitle: "Dairy Nutrition Expert",
    accent: "#e65c38", // Brand Orange
    border: "border-orange-100",
    bgLight: "bg-orange-50/50",
    textAccent: "text-brand-orange",
    userBubble: "bg-brand-orange",
    greeting: "Hello! I'm Dr. Mikku, your dairy & ruminant nutrition expert at Chemlife Innovations. How can I help you today?",
  },
} as const;

type BotKey = keyof typeof BOT_META;

// Helper to safely parse basic markdown to JSX nodes
function parseMarkdownToJSX(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const parseInline = (str: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\))/g;
    const splitParts = str.split(tokenRegex);

    splitParts.forEach((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        parts.push(
          <strong key={index} className="font-semibold text-slate-800">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith("*") && part.endsWith("*")) {
        parts.push(<em key={index} className="italic">{part.slice(1, -1)}</em>);
      } else if (part.startsWith("[") && part.includes("](")) {
        const labelEnd = part.indexOf("](");
        const label = part.slice(1, labelEnd);
        const url = part.slice(labelEnd + 2, -1);
        parts.push(
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-orange hover:underline font-medium break-all"
          >
            {label}
          </a>
        );
      } else {
        parts.push(part);
      }
    });

    return parts;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(
        <li key={`li-${index}`} className="list-disc ml-5 mb-1.5 text-[13px] text-slate-700">
          {parseInline(trimmed.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      const dotIndex = trimmed.indexOf(".");
      listItems.push(
        <li key={`li-${index}`} className="list-decimal ml-5 mb-1.5 text-[13px] text-slate-700">
          {parseInline(trimmed.slice(dotIndex + 1).trim())}
        </li>
      );
    } else {
      if (inList) {
        elements.push(
          <ul key={`ul-${index}`} className="mb-3 space-y-1">
            {listItems}
          </ul>
        );
        inList = false;
        listItems = [];
      }
      if (trimmed.length > 0) {
        elements.push(
          <p key={`p-${index}`} className="mb-3 text-[13px] leading-relaxed text-slate-700">
            {parseInline(line)}
          </p>
        );
      }
    }
  });

  if (inList) {
    elements.push(
      <ul key="ul-end" className="mb-3 space-y-1">
        {listItems}
      </ul>
    );
  }

  return elements;
}

function ChatLoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-brand-navy border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-brand-navy">Loading Specialist Session...</p>
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
  const firedQueryRef = useRef<Record<string, boolean>>({});

  // Auto-scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Reset messages when botKey changes
  useEffect(() => {
    setMessages([]);
  }, [botKey]);

  // Handle initial query from search URL
  useEffect(() => {
    if (!initialQuery) return;
    if (firedQueryRef.current[botKey]) return;
    firedQueryRef.current[botKey] = true;

    // Trigger initial message fetch
    fireMessage(initialQuery, []);
  }, [botKey, initialQuery]);

  // Dynamic FAQs Refresh Loop
  useEffect(() => {
    const loadFaqs = async () => {
      try {
        setFaqsLoading(true);
        const questions = await fetchFaqs(botKey, 3);
        setFaqs(questions);
      } catch (err) {
        console.error("Error fetching FAQs:", err);
      } finally {
        setFaqsLoading(false);
      }
    };

    loadFaqs();
    setCountdown(20);

    const refreshInterval = setInterval(() => {
      loadFaqs();
      setCountdown(20);
    }, 20000);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [botKey]);

  const greetingMessage = useMemo(() => {
    return meta.greeting;
  }, [meta]);

  const fireMessage = async (text: string, currentHistory: Turn[]) => {
    setLoading(true);
    try {
      const data = await sendMessage(text, botKey, currentHistory);

      // Handle RAG cross-bot redirect signals
      if (data.redirect_to) {
        delete firedQueryRef.current[data.redirect_to];
        router.replace(
          `/chat/${data.redirect_to}?q=${encodeURIComponent(text)}`
        );
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          sources: data.sources,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I could not process your request. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");

    // Formulate turn history for LLM context
    const history: Turn[] = updated.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const fullHistory: Turn[] = initialQuery
      ? [{ role: "user", content: initialQuery }, ...history]
      : history;

    await fireMessage(trimmed, fullHistory);
  };

  const handleSelectFaq = async (faqText: string) => {
    if (loading) return;

    const userMsg: Message = { role: "user", content: faqText };
    const updated = [...messages, userMsg];
    setMessages(updated);

    const history: Turn[] = updated.slice(0, -1).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const fullHistory: Turn[] = initialQuery
      ? [{ role: "user", content: initialQuery }, ...history]
      : history;

    await fireMessage(faqText, fullHistory);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-brand-navy">
      {/* Global Site Navigation Header */}
      <Header />

      {/* Main Workspace Layout centered, with top padding for sticky header */}
      <div className="pt-32 pb-16 flex-1 max-w-[1200px] w-full mx-auto px-4 flex flex-col lg:flex-row gap-6">
        
        {/* Chat Pane */}
        <main className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[640px]">
          
          {/* Active Bot Header with LARGER Avatar Image */}
          <div className={`p-4 border-b border-slate-100 ${meta.bgLight} flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-white bg-white overflow-hidden p-1 shadow-md flex-shrink-0 flex items-center justify-center">
                <img
                  src={meta.image}
                  alt={meta.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-slate-800 text-[18px] tracking-wide">
                    {meta.name}
                  </h2>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Online</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-none font-medium">{meta.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Back to Hub Button */}
              <Link
                href="/chat"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-brand-orange bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer hover:shadow-sm"
              >
                ← Back to Agents
              </Link>
              
              {/* Quick Switch Button */}
              <Link
                href={`/chat/${botKey === "kukku" ? "mikku" : "kukku"}`}
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-brand-orange bg-white px-3.5 py-2 rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer hover:shadow-sm"
              >
                Switch to {botKey === "kukku" ? "Dr. Mikku" : "Dr. Kukku"}
              </Link>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            
            {/* Render Greeting Message with LARGER Avatar */}
            <div className="flex items-start gap-4.5">
              <div className="w-11 h-11 rounded-full border border-slate-200 overflow-hidden bg-white p-1 flex-shrink-0 flex items-center justify-center shadow-xs">
                <img src={meta.image} alt={meta.name} className="w-full h-full object-contain" />
              </div>
              <div className="max-w-[75%] rounded-2xl px-4.5 py-3 bg-slate-50 border border-slate-100 shadow-2xs">
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {greetingMessage}
                </p>
              </div>
            </div>

            {/* Render Search Query initial bubble if present */}
            {initialQuery && (
              <div className="flex justify-end">
                <div className={`max-w-[75%] rounded-2xl px-4.5 py-3 text-white shadow-xs font-medium ${meta.userBubble}`}>
                  <p className="text-sm leading-relaxed">{initialQuery}</p>
                </div>
              </div>
            )}

            {/* Render conversation messages */}
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              return (
                <div key={index} className={`flex ${isUser ? "justify-end" : "items-start gap-4.5"}`}>
                  {!isUser && (
                    <div className="w-11 h-11 rounded-full border border-slate-200 overflow-hidden bg-white p-1 flex-shrink-0 flex items-center justify-center shadow-xs">
                      <img src={meta.image} alt={meta.name} className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-4.5 py-3 shadow-2xs ${
                      isUser ? `text-white font-medium ${meta.userBubble}` : "bg-slate-50 border border-slate-100"
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="space-y-1">
                        {parseMarkdownToJSX(msg.content)}
                      </div>
                    )}

                    {/* Render Sources */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200/50">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider">
                          Sources & References
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((s, sIdx) => (
                            <a
                              key={sIdx}
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-all cursor-pointer font-medium"
                            >
                              📄 {s.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Render Loading Typing State with LARGER Avatar */}
            {loading && (
              <div className="flex items-start gap-4.5">
                <div className="w-11 h-11 rounded-full border border-slate-200 overflow-hidden bg-white p-1 flex-shrink-0 flex items-center justify-center shadow-xs animate-pulse">
                  <img src={meta.image} alt={meta.name} className="w-full h-full object-contain" />
                </div>
                <div className="max-w-[75%] rounded-2xl px-4 py-3.5 bg-slate-50 border border-slate-100 shadow-2xs flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Form Input Area */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${meta.name} a follow-up question...`}
                disabled={loading}
                className="flex-1 text-sm px-4 py-3.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-brand-navy text-slate-800 bg-slate-50 focus:bg-white transition-all disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-colors cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 ${meta.userBubble}`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "↑"
                )}
              </button>
            </form>
          </div>
        </main>

        {/* FAQs Sidebar Panel */}
        <aside className="w-full lg:w-72 bg-white border border-slate-100 rounded-2xl shadow-xs p-5 self-start">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-heading font-bold text-slate-800 text-sm tracking-wide">Suggested Questions</h3>
            <span
              className="text-[10px] text-slate-400 font-semibold cursor-default flex items-center gap-1"
              title="Refreshes automatically"
            >
              ↻ {countdown}s
            </span>
          </div>

          {faqsLoading && faqs.length === 0 ? (
            <div className="space-y-2 py-4">
              <div className="h-8 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
              <div className="h-8 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
              <div className="h-8 bg-slate-50 border border-slate-100 rounded-lg animate-pulse" />
            </div>
          ) : faqs.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-6">No suggestions available.</p>
          ) : (
            <ul className="space-y-3">
              {faqs.map((faq, fIdx) => (
                <li key={fIdx}>
                  <button
                    onClick={() => handleSelectFaq(faq)}
                    disabled={loading}
                    className={`w-full text-left text-xs p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all font-semibold text-slate-700 leading-relaxed cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-transparent ${meta.textAccent}`}
                  >
                    {faq}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

      </div>

      {/* Global Footer */}
      <Footer />
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
