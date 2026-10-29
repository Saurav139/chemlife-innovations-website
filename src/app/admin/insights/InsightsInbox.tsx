"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import InsightCardContent, { INSIGHT_CARD_CLASS } from "@/components/InsightCard";
import { Images } from "@/lib/assets";
import { insightCard } from "@/lib/insights-store/card";
import type { InboxItem, ItemChanges, Kind, Source, SourceItem, SourceState, Status, SyncResult } from "@/lib/insights-store/types";

// The Insights inbox: posts from ChemLife's channels wait under "Waiting" until the moderator adds them to the
// Insights page or hides them. The page updates as soon as a decision is made.

interface Data {
  autoPublishSocial: boolean;
  items: InboxItem[];
  lastSync: { at: string; results: SyncResult[] } | null;
  sources: Record<Source, SourceState>;
}

interface Preview {
  item: SourceItem & { publishedAt: string };
  existing: InboxItem | null;
  notes: string[];
}

const SOURCE_LABEL: Record<Source, string> = { youtube: "YouTube", wordpress: "WordPress", instagram: "Instagram", linkedin: "LinkedIn", link: "Web link" };
const CHANNELS: Source[] = ["youtube", "wordpress", "instagram", "linkedin"];
type Tab = Status | "featured";
/** `short` is the label on phones, where the four tabs share one row. */
const TABS: { id: Tab; label: string; short: string; empty: string }[] = [
  { id: "pending", label: "Waiting", short: "Waiting", empty: "Nothing is waiting. New posts appear here after each check." },
  { id: "approved", label: "On the page", short: "On page", empty: "Nothing is on the Insights page yet." },
  { id: "featured", label: "Featured", short: "Featured", empty: "" },
  { id: "hidden", label: "Hidden", short: "Hidden", empty: "Nothing is hidden." },
];
const STATUS_LABEL: Record<Status, string> = { pending: "Waiting", approved: "On the page", hidden: "Hidden" };
/** A search's matches in another tab: "3 on the page". */
const MATCHES_IN: Record<Status, string> = { pending: "waiting", approved: "on the page", hidden: "hidden" };
const KIND_ORDER: Kind[] = ["Blog", "Video", "Podcast"];
/** How a post leads its type on the Insights page: picked in the inbox, or the newest when nothing is picked. */
type FeaturedAs = "chosen" | "newest" | null;
type Slot = { item: InboxItem; chosen: boolean };

/** Sorts newest first, as the Insights page does (same day: the later-added first). */
function newer(a: InboxItem, b: InboxItem) {
  return Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || b.id - a.id;
}

function shorten(title: string) {
  return title.length > 50 ? `${title.slice(0, 48).trimEnd()}…` : title;
}
const AUTO_CHECK_AFTER = 10 * 60 * 1000;
/** Where this browser remembers the moderator's previous visit, for the New marks. */
const VISIT_KEY = "insights-inbox-last-visit";

const BTN = "inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-full text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default";
const BTN_PRIMARY = `${BTN} bg-teal-aa hover:bg-teal-700 text-white`;
const BTN_SECONDARY = `${BTN} border border-slate-300 bg-white hover:border-brand-navy text-brand-navy`;
const FIELD = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px] focus:outline-none focus:border-teal-aa focus:ring-2 focus:ring-teal-aa/25";
const CHECKBOX = "h-5 w-5 accent-teal-aa cursor-pointer";

/** Lower case without accents, so a search for "cafe" finds "café". */
const fold = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function picture(item: { image?: string; imageId?: number | null; imageUrl?: string; youtubeId?: string }) {
  if (item.image) return item.image;
  if (item.imageId) return `/api/insights/media/${item.imageId}.jpg`;
  if (item.imageUrl) return item.imageUrl;
  if (item.youtubeId) return `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
  return Images.gallery.rotate21;
}

/** The picture a post's card shows on the Insights page: its own, if it has one (videos show YouTube's instead). */
function cardPicture(item: { image?: string; imageId?: number | null; imageUrl?: string }) {
  if (item.image) return item.image;
  if (item.imageId) return `/api/insights/media/${item.imageId}.jpg`;
  return item.imageUrl ?? "";
}

// A small copy from the site's image optimizer, for pictures it may resize (see next.config.ts and
// isOptimizable in the Insights page); others as they are.
function thumbnail(src: string) {
  const resizable = src.startsWith("/") || src.startsWith("https://chemlifeinnovations.wordpress.com/wp-content/uploads/") || src.startsWith("https://img.youtube.com/vi/");
  return resizable ? `/_next/image?url=${encodeURIComponent(src)}&w=256&q=75` : src;
}

function day(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ago(iso: string) {
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (minutes < 60) return rtf.format(-minutes, "minute");
  if (minutes < 48 * 60) return rtf.format(-Math.round(minutes / 60), "hour");
  return rtf.format(-Math.round(minutes / 1440), "day");
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: init.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init.headers },
  }).catch(() => null);
  if (!res) throw new Error("Couldn't reach the site. Check your connection and try again.");
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.reload();
    throw new Error(body.error || "Please sign in again.");
  }
  if (!res.ok) throw Object.assign(new Error(body.error || "Something went wrong. Please try again."), { body });
  return body as T;
}

async function uploadPicture(file: File): Promise<number> {
  const form = new FormData();
  form.append("file", file);
  const { imageId } = await api<{ imageId: number }>("/api/admin/insights/image", { method: "POST", body: form });
  return imageId;
}

export default function InsightsInbox({ initial, demo = false }: { initial: Data; demo?: boolean }) {
  const [data, setData] = useState<Data>(initial);
  const [tab, setTab] = useState<Tab>("pending");
  const [source, setSource] = useState<Source | "all">("all");
  const [kind, setKind] = useState<Kind | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [checking, setChecking] = useState(false);
  const [savingAutomatic, setSavingAutomatic] = useState(false);
  const [toast, setToast] = useState<{ text: string; error?: boolean; undo?: () => void } | null>(null);
  const [editing, setEditing] = useState<InboxItem | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  /** The moderator's previous visit in this browser: posts imported since then are marked New. */
  const [lastVisit, setLastVisit] = useState<number | null>(null);
  const toastTimer = useRef<number>(0);

  // Each type's posts on the Insights page, newest first, as the page orders them (videos and podcasts need a
  // YouTube video to show). The page features the one chosen here, else the newest.
  const onPage = useMemo(() => {
    const lists = {} as Record<Kind, InboxItem[]>;
    for (const k of KIND_ORDER) {
      lists[k] = data.items
        .filter((item) => item.status === "approved" && item.kind === k && (k === "Blog" || item.youtubeId))
        .sort((a, b) => newer(a, b));
    }
    return lists;
  }, [data.items]);
  const featuredNow = useMemo(() => {
    const now = {} as Record<Kind, Slot | null>;
    for (const k of KIND_ORDER) {
      const chosen = onPage[k].find((item) => item.featured);
      now[k] = chosen ? { item: chosen, chosen: true } : onPage[k][0] ? { item: onPage[k][0], chosen: false } : null;
    }
    return now;
  }, [onPage]);
  const featuredAs = (item: InboxItem): FeaturedAs => {
    const slot = featuredNow[item.kind];
    return slot?.item.id === item.id ? (slot.chosen ? "chosen" : "newest") : null;
  };
  /** Whether adding this post to the page makes it featured: the first of its type, or newer than an automatic pick. */
  const becomesFeatured = (item: InboxItem): boolean => {
    if (item.status === "approved" || (item.kind !== "Blog" && !item.youtubeId)) return false;
    const slot = featuredNow[item.kind];
    return !slot || (!slot.chosen && newer(item, slot.item) < 0);
  };

  /** What a decision did, for the notification: including what's featured afterwards, when that changes. */
  function describe(item: InboxItem, changes: ItemChanges): string {
    const type = item.kind.toLowerCase();
    if (changes.status === "approved") return becomesFeatured(item) ? `Added to the Insights page as the featured ${type}.` : "Added to the Insights page.";
    if (changes.status === "hidden" && item.status === "approved") {
      if (!featuredAs(item)) return "Taken off the Insights page.";
      const rest = onPage[item.kind].filter((other) => other.id !== item.id);
      const next = rest.find((other) => other.featured) ?? rest[0];
      return next ? `Taken off the page. The featured ${type} is now “${shorten(next.title)}”.` : `Taken off the page. No ${type}s are left on it.`;
    }
    if (changes.status === "hidden") return "Hidden.";
    if (changes.status === "pending") return "Moved to Waiting.";
    if (changes.featured === true) {
      return featuredAs(item) === "newest" ? `Kept as the featured ${type}, even when newer ones arrive.` : `“${shorten(item.title)}” is now the featured ${type}.`;
    }
    if (changes.featured === false) {
      const newest = onPage[item.kind][0];
      return !newest || newest.id === item.id
        ? `Unpinned. It stays featured while it's the newest ${type}.`
        : `Unpinned. The newest ${type}, “${shorten(newest.title)}”, is featured again.`;
    }
    return "Saved.";
  }
  const act = (item: InboxItem, changes: ItemChanges) => change(item, changes, describe(item, changes));

  /** The same for a decision about several posts, all from one tab. */
  function describeMany(items: InboxItem[], status: Status): string {
    const posts = `${items.length} post${items.length === 1 ? "" : "s"}`;
    if (status === "approved") {
      const notes = KIND_ORDER.flatMap((k) => {
        const lead = items.filter((item) => item.kind === k && becomesFeatured(item)).sort(newer)[0];
        return lead ? [`“${shorten(lead.title)}” is now the featured ${k.toLowerCase()}.`] : [];
      });
      return [`Added ${posts} to the Insights page.`, ...notes].join(" ");
    }
    if (status === "hidden" && items[0].status === "approved") {
      const leaving = new Set(items.map((item) => item.id));
      const notes = KIND_ORDER.flatMap((k) => {
        const slot = featuredNow[k];
        if (!slot || !leaving.has(slot.item.id)) return [];
        const rest = onPage[k].filter((other) => !leaving.has(other.id));
        const next = rest.find((other) => other.featured) ?? rest[0];
        return [next ? `The featured ${k.toLowerCase()} is now “${shorten(next.title)}”.` : `No ${k.toLowerCase()}s are left on the page.`];
      });
      return [`Took ${posts} off the Insights page.`, ...notes].join(" ");
    }
    if (status === "hidden") return `Hid ${posts}.`;
    return `Moved ${posts} to Waiting.`;
  }

  // The search and the channel and type filters apply to every tab, and each tab's number counts what it would list.
  const words = fold(query).split(/\s+/).filter(Boolean);
  const filtering = words.length > 0 || source !== "all" || kind !== "all";
  const matches = (item: InboxItem) =>
    (source === "all" || item.source === source) &&
    (kind === "all" || item.kind === kind) &&
    words.every((word) => fold(`${item.title} ${item.summary} ${item.meta} ${SOURCE_LABEL[item.source]}`).includes(word));
  const counts: Record<Tab, number> = { pending: 0, approved: 0, hidden: 0, featured: KIND_ORDER.filter((k) => featuredNow[k]).length };
  for (const item of data.items) if (matches(item)) counts[item.status]++;
  const shown = tab === "featured" ? [] : data.items.filter((item) => item.status === tab && matches(item));
  const picked = shown.filter((item) => selected.has(item.id));
  const allPicked = shown.length > 0 && picked.length === shown.length;
  const isNew = (item: InboxItem) => lastVisit !== null && Date.parse(item.importedAt) > lastVisit;
  const newCount = shown.filter(isNew).length;
  const bulkActions: { label: string; status: Status; primary?: boolean }[] =
    tab === "pending" ? [{ label: "Add to page", status: "approved", primary: true }, { label: "Hide", status: "hidden" }]
    : tab === "approved" ? [{ label: "Take off page", status: "hidden" }]
    : tab === "hidden" ? [{ label: "Add to page", status: "approved", primary: true }, { label: "Move to Waiting", status: "pending" }]
    : [];

  function openTab(t: Tab) {
    setTab(t);
    setSelected(new Set());
  }

  function clearFilters() {
    setQuery("");
    setSource("all");
    setKind("all");
    setSelected(new Set());
  }

  function showWaiting(k: Kind) {
    openTab("pending");
    clearFilters();
    setKind(k);
  }

  function toggle(item: InboxItem) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(item.id)) next.delete(item.id);
      else next.add(item.id);
      return next;
    });
  }

  function say(text: string, options: { error?: boolean; undo?: () => void } = {}) {
    window.clearTimeout(toastTimer.current);
    setToast({ text, ...options });
    toastTimer.current = window.setTimeout(() => setToast(null), options.undo ? 8000 : 5000);
  }

  function replace(updated: InboxItem) {
    setData((d) => ({
      ...d,
      items: d.items.map((item) =>
        item.id === updated.id ? updated : updated.featured && item.kind === updated.kind ? { ...item, featured: false } : item
      ),
    }));
  }

  /** Saves a decision; true when it was saved. */
  async function change(item: InboxItem, changes: ItemChanges, done: string, undoable = true): Promise<boolean> {
    setBusy((b) => new Set(b).add(item.id));
    try {
      const { item: updated } = await api<{ item: InboxItem }>(`/api/admin/insights/${item.id}`, { method: "PATCH", body: JSON.stringify(changes) });
      replace(updated);
      const before: ItemChanges = { status: item.status, featured: item.featured };
      say(done, undoable ? { undo: () => void change(updated, before, "Undone.", false) } : {});
      return true;
    } catch (error) {
      say((error as Error).message, { error: true });
      return false;
    } finally {
      setBusy((b) => {
        const next = new Set(b);
        next.delete(item.id);
        return next;
      });
    }
  }

  /** Saves one decision for several posts at once; true when it was saved. */
  async function changeMany(items: InboxItem[], status: Status, done: string, undoable = true): Promise<boolean> {
    const ids = items.map((item) => item.id);
    setBusy((b) => new Set([...b, ...ids]));
    try {
      const { items: updated } = await api<{ items: InboxItem[] }>("/api/admin/insights", { method: "PATCH", body: JSON.stringify({ ids, status }) });
      const byId = new Map(updated.map((item) => [item.id, item]));
      setData((d) => ({ ...d, items: d.items.map((item) => byId.get(item.id) ?? item) }));
      setSelected(new Set());
      say(done, undoable ? { undo: () => void undoMany(items) } : {});
      return true;
    } catch (error) {
      say((error as Error).message, { error: true });
      return false;
    } finally {
      setBusy((b) => {
        const next = new Set(b);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    }
  }

  /** Puts posts back as they were before a bulk decision, including the one featured by choice. */
  async function undoMany(before: InboxItem[]) {
    const byStatus = new Map<Status, InboxItem[]>();
    for (const item of before) byStatus.set(item.status, [...(byStatus.get(item.status) ?? []), item]);
    for (const [status, items] of byStatus) if (!(await changeMany(items, status, "Undone.", false))) return;
    for (const item of before.filter((item) => item.featured)) await change(item, { featured: true }, "Undone.", false);
  }

  async function check(quiet = false) {
    setChecking(true);
    try {
      const fresh = await api<Data>("/api/admin/insights/sync", { method: "POST" });
      const before = new Set(data.items.map((item) => item.id));
      const added = fresh.items.filter((item) => !before.has(item.id) && item.status === "pending").length;
      const published = fresh.items.filter((item) => !before.has(item.id) && item.status === "approved").length;
      setData(fresh);
      const failed = fresh.lastSync?.results.filter((r) => r.error) ?? [];
      if (failed.length) say(`Couldn't check ${failed.map((r) => SOURCE_LABEL[r.source]).join(" and ")}. See the channel for details.`, { error: true });
      else if (!quiet || added || published) {
        const notes = [published ? `${published} new post${published === 1 ? " was" : "s were"} added to the Insights page.` : "", added ? `${added} new post${added === 1 ? " is" : "s are"} waiting.` : ""].filter(Boolean);
        say(notes.join(" ") || "No new posts.");
      }
    } catch (error) {
      say((error as Error).message, { error: true });
    } finally {
      setChecking(false);
    }
  }

  async function saveAutomatic(enabled: boolean) {
    setSavingAutomatic(true);
    try {
      const fresh = await api<Data & { approvedCount: number }>("/api/admin/insights/settings", {
        method: "PUT", body: JSON.stringify({ autoPublishSocial: enabled }),
      });
      setData(fresh);
      setSelected(new Set());
      say(enabled
        ? `Automatic adding is on.${fresh.approvedCount ? ` Added ${fresh.approvedCount} waiting post${fresh.approvedCount === 1 ? "" : "s"} to the Insights page.` : ""}`
        : "Automatic adding is off. Future social imports will wait for review.");
      if (enabled) await check(true);
    } catch (error) {
      say((error as Error).message, { error: true });
    } finally {
      setSavingAutomatic(false);
    }
  }

  // When the inbox opens: check for new posts, unless that was done in the last 10 minutes, and note the visit.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    if (!initial.lastSync || Date.now() - Date.parse(initial.lastSync.at) > AUTO_CHECK_AFTER) check(true);
    try {
      setLastVisit(Number(localStorage.getItem(VISIT_KEY)) || null);
      localStorage.setItem(VISIT_KEY, String(Date.now()));
    } catch {
      // Private browsing can refuse storage: nothing is marked New then.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    window.location.reload();
  }

  function show(item: InboxItem) {
    openTab(item.status);
    clearFilters();
    setHighlight(item.id);
    window.setTimeout(() => document.getElementById(`post-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    window.setTimeout(() => setHighlight(null), 2500);
  }

  const searchText = query.trim();
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/branding/logo-horizontal.png" alt="ChemLife Innovations" className="h-8 w-auto shrink-0" />
            <span className="hidden sm:block h-6 w-px bg-slate-200" aria-hidden="true" />
            <h1 className="font-heading text-lg font-bold truncate">Insights inbox</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a href="/insights" target="_blank" rel="noopener" className="hidden sm:inline-flex items-center min-h-10 px-3 rounded-full text-sm font-semibold text-teal-aa hover:bg-teal-50">
              View the Insights page ↗
            </a>
            {!demo && (
              <button type="button" onClick={signOut} className="min-h-10 px-3 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>
      {demo && (
        <p className="bg-amber-50 border-b border-amber-200 text-amber-900 text-sm text-center px-4 py-2">
          <strong>Demo:</strong> no sign-in on this staging site, so anyone who can open it can use the inbox. The live site always asks for a password.
        </p>
      )}

      {/* Room at the bottom for the bar of selected posts, so it never covers the last one */}
      <main className={`max-w-[1100px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6 ${picked.length ? "pb-40 sm:pb-28" : "pb-6 sm:pb-8"}`}>
        <Channels data={data} checking={checking || savingAutomatic} onCheck={() => check()} />
        <section aria-label="Automatic social posts" className="rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-4 sm:px-6" aria-busy={savingAutomatic}>
          <label className="flex min-h-11 items-start gap-3 cursor-pointer py-1">
            <input type="checkbox" checked={data.autoPublishSocial} disabled={savingAutomatic || checking}
              onChange={(event) => void saveAutomatic(event.target.checked)}
              aria-describedby="automatic-social-help" className={`${CHECKBOX} mt-0.5 shrink-0 disabled:opacity-50 disabled:cursor-wait`} />
            <span className="text-sm sm:text-base font-semibold">Automatically add LinkedIn and Instagram posts to Insights</span>
          </label>
          <p id="automatic-social-help" className="mt-1 ml-8 text-sm text-slate-600 leading-relaxed">
            Adds all waiting LinkedIn and Instagram posts and publishes future imports from connected channels without review. Hidden posts stay hidden. Turning this off keeps posts already on the page.
          </p>
          {savingAutomatic && <p role="status" className="mt-2 ml-8 text-sm font-semibold text-teal-aa">Saving preference…</p>}
        </section>
        <AddPost
          onAdded={(item) => {
            setData((d) => ({ ...d, items: [item, ...d.items].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)) }));
            show(item);
            say(item.status === "approved" ? "Added to the Insights page." : "Added to Waiting.");
          }}
          onShow={show}
          onError={(text) => say(text, { error: true })}
        />

        <section aria-label="Posts" className="rounded-2xl bg-white border border-slate-200 shadow-sm">
          {/* The tabs stay at the top of the screen while the list scrolls. On phones the four share one row. */}
          <div className="sticky top-0 z-20 rounded-t-2xl border-b border-slate-200 bg-white px-1 sm:px-6 sm:pt-4">
            <div role="tablist" aria-label="Posts by decision" className="grid grid-cols-4 sm:flex sm:gap-1 -mb-px">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.id}
                  onClick={() => openTab(t.id)}
                  className={`min-h-15 sm:min-h-11 px-1 sm:px-4 border-b-2 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 text-[13px] sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    tab === t.id ? "border-teal-aa text-teal-aa" : "border-transparent text-slate-500 hover:text-brand-navy"
                  }`}
                >
                  <span>
                    {t.id === "featured" && <span aria-hidden="true" className="hidden sm:inline mr-1 text-amber-500">★</span>}
                    <span className="sm:hidden">{t.short}</span>
                    <span className="hidden sm:inline">{t.label}</span>
                  </span>
                  <span className={`sm:ml-2 inline-flex min-w-6 justify-center rounded-full px-1.5 py-0.5 text-xs ${t.id === "pending" && counts.pending ? "bg-brand-orange-aa text-white" : "bg-slate-100 text-slate-600"}`}>
                    {counts[t.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {tab !== "featured" && (
            <div className="flex flex-col sm:flex-row gap-2 px-4 sm:px-6 pt-4">
              <div className="relative flex-1">
                <label htmlFor="post-search" className="sr-only">Search all posts</label>
                <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                </svg>
                <input
                  id="post-search"
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelected(new Set());
                  }}
                  placeholder="Search all posts"
                  className="w-full min-h-10 rounded-full border border-slate-300 bg-white pl-10 pr-4 text-[15px] sm:text-sm focus:outline-none focus:border-teal-aa focus:ring-2 focus:ring-teal-aa/25"
                />
              </div>
              <div className="flex gap-2">
                <select
                  aria-label="Channel"
                  value={source}
                  onChange={(e) => {
                    setSource(e.target.value as Source | "all");
                    setSelected(new Set());
                  }}
                  className="flex-1 sm:flex-none min-h-10 rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-brand-navy cursor-pointer"
                >
                  <option value="all">All channels</option>
                  {(Object.keys(SOURCE_LABEL) as Source[]).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
                </select>
                <select
                  aria-label="Type"
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value as Kind | "all");
                    setSelected(new Set());
                  }}
                  className="flex-1 sm:flex-none min-h-10 rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-brand-navy cursor-pointer"
                >
                  <option value="all">All types</option>
                  {KIND_ORDER.map((k) => <option key={k} value={k}>{k}s</option>)}
                </select>
              </div>
            </div>
          )}

          <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)!.label}>
            {tab === "featured" ? (
              <FeaturedNow
                featuredNow={featuredNow}
                onPage={onPage}
                busy={busy}
                onFeature={(item) => act(item, { featured: true })}
                onUseNewest={(item) => act(item, { featured: false })}
                onEdit={setEditing}
                onShowWaiting={showWaiting}
              />
            ) : (
              <>
                {tab === "approved" && shown.length > 0 && (
                  <p className="px-4 sm:px-6 pt-4 text-sm text-slate-600">
                    <span className="text-amber-500" aria-hidden="true">★</span> marks the post featured at the top of the page for its type: the one you chose with{" "}
                    <strong className="text-brand-navy">Feature</strong>, or else the newest. See all three under <strong className="text-brand-navy">Featured</strong>.
                  </p>
                )}
                {shown.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 sm:px-6 pt-3">
                    <label className="inline-flex items-center gap-3 min-h-10 text-sm font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allPicked}
                        ref={(box) => {
                          if (box) box.indeterminate = picked.length > 0 && !allPicked;
                        }}
                        onChange={() => setSelected(allPicked ? new Set() : new Set(shown.map((item) => item.id)))}
                        className={CHECKBOX}
                      />
                      {allPicked ? "Clear selection" : `Select all ${shown.length}`}
                    </label>
                    {newCount > 0 && (
                      <p className="text-sm text-slate-600">
                        <span className="rounded-full bg-teal-aa px-2 py-0.5 text-xs font-bold text-white">New</span> {newCount} since your last visit
                      </p>
                    )}
                  </div>
                )}
                {shown.length === 0 ? (
                  <div className="px-6 py-14 text-center text-slate-500">
                    <p>
                      {!filtering
                        ? TABS.find((t) => t.id === tab)!.empty
                        : searchText ? `Nothing here matches “${searchText}”.` : "Nothing here matches the channel and type chosen."}
                    </p>
                    {filtering && (
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {(["pending", "approved", "hidden"] as Status[])
                          .filter((s) => s !== tab && counts[s] > 0)
                          .map((s) => (
                            <button key={s} type="button" onClick={() => openTab(s)} className={BTN_SECONDARY}>
                              {counts[s]} {MATCHES_IN[s]}
                            </button>
                          ))}
                        <button type="button" onClick={clearFilters} className={`${BTN} text-slate-600 hover:bg-slate-100`}>Show everything</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <ul className="mt-2 divide-y divide-slate-100 border-t border-slate-100">
                    {shown.map((item) => (
                      <Post
                        key={item.id}
                        item={item}
                        featuredAs={featuredAs(item)}
                        wouldFeature={becomesFeatured(item)}
                        busy={busy.has(item.id)}
                        highlight={highlight === item.id}
                        selected={selected.has(item.id)}
                        isNew={isNew(item)}
                        onSelect={() => toggle(item)}
                        onChange={(changes) => act(item, changes)}
                        onEdit={() => setEditing(item)}
                      />
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      {editing && (
        <EditPost
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            replace(updated);
            setEditing(null);
            say(updated.status === "approved" ? "Saved. The Insights page shows the change." : "Saved.");
          }}
        />
      )}

      {/* Decisions for the selected posts, in a bar at the bottom of the screen */}
      {picked.length > 0 && (
        <div role="region" aria-label="Selected posts" className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 z-30 grid grid-cols-[1fr_auto] items-center gap-2 sm:flex rounded-2xl bg-brand-navy px-4 py-3 text-white shadow-xl">
          <p className="text-sm font-bold sm:mr-1">{picked.length} selected</p>
          <button type="button" onClick={() => setSelected(new Set())} className={`${BTN} sm:order-last text-white/80 hover:bg-white/10 hover:text-white`}>
            Clear
          </button>
          <div className="col-span-2 grid grid-flow-col auto-cols-fr gap-2 sm:flex">
            {bulkActions.map((action) => (
              <button
                key={action.label}
                type="button"
                disabled={picked.some((item) => busy.has(item.id))}
                onClick={() => changeMany(picked, action.status, describeMany(picked, action.status))}
                className={action.primary ? `${BTN} bg-teal-aa-light text-brand-navy hover:bg-white` : `${BTN} border border-white/40 text-white hover:bg-white/10`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div aria-live="polite" className={`fixed inset-x-4 sm:inset-x-auto sm:right-6 z-50 flex justify-center pointer-events-none ${picked.length ? "bottom-36 sm:bottom-24" : "bottom-4 sm:bottom-6"}`}>
        {toast && (
          <div className={`pointer-events-auto flex items-center gap-4 max-w-md rounded-xl px-4 py-3 shadow-lg text-sm font-semibold leading-snug ${toast.error ? "bg-red-700 text-white" : "bg-brand-navy text-white"}`}>
            <span>{toast.text}</span>
            {toast.undo && (
              <button type="button" onClick={() => { const undo = toast.undo!; setToast(null); undo(); }} className="underline underline-offset-2 text-teal-aa-light cursor-pointer">
                Undo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Channels({ data, checking, onCheck }: { data: Data; checking: boolean; onCheck: () => void }) {
  const dot: Record<SourceState["state"], string> = { connected: "bg-emerald-500", manual: "bg-slate-400", "not-set-up": "bg-amber-400", error: "bg-red-500" };
  const label: Record<SourceState["state"], string> = { connected: "Connected", manual: "Paste links", "not-set-up": "Not set up", error: "Problem" };
  const problem = CHANNELS.some((s) => data.sources[s].state === "error");
  return (
    <section aria-labelledby="channels-title" className="rounded-2xl bg-white border border-slate-200 shadow-sm px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="channels-title" className="font-heading text-lg font-bold">Channels</h2>
          <p className="text-sm text-slate-600">
            {checking ? "Checking for new posts…" : data.lastSync ? `Last checked ${ago(data.lastSync.at)}.` : "Not checked yet."}
          </p>
        </div>
        <button type="button" onClick={onCheck} disabled={checking} className={`${BTN_SECONDARY} shrink-0`}>
          <svg className={`w-4 h-4 ${checking ? "animate-spin motion-reduce:animate-none" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M5.6 15a7 7 0 0 0 12.3 2.3M18.4 9A7 7 0 0 0 6.1 6.7" />
          </svg>
          {checking ? "Checking…" : (
            <>
              <span className="sm:hidden">Check now</span>
              <span className="hidden sm:inline">Check for new posts</span>
            </>
          )}
        </button>
      </div>
      {/* Each channel's state in one line; what to do about it underneath, opened by itself when something's wrong. */}
      <details open={problem || undefined} className="group mt-2">
        <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer rounded-lg py-1">
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
            {CHANNELS.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${dot[data.sources[s].state]}`} aria-hidden="true" />
                <span className="font-semibold">{SOURCE_LABEL[s]}</span>
                <span className={data.sources[s].state === "error" ? "text-red-700" : "text-slate-500"}>{label[data.sources[s].state]}</span>
              </span>
            ))}
            <span className="inline-flex items-center gap-1 font-semibold text-teal-aa">
              Details
              <svg className="w-3.5 h-3.5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </span>
        </summary>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((s) => {
            const state = data.sources[s];
            return (
              <li key={s} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span className="font-bold text-sm">{SOURCE_LABEL[s]}</span>
                {state.detail && <p className={`text-xs mt-1 leading-snug ${state.state === "error" ? "text-red-700" : "text-slate-600"}`}>{state.detail}</p>}
              </li>
            );
          })}
        </ul>
      </details>
    </section>
  );
}

function FeaturedNow({ featuredNow, onPage, busy, onFeature, onUseNewest, onEdit, onShowWaiting }: {
  featuredNow: Record<Kind, Slot | null>;
  onPage: Record<Kind, InboxItem[]>;
  busy: Set<number>;
  onFeature: (item: InboxItem) => Promise<boolean>;
  onUseNewest: (item: InboxItem) => void;
  onEdit: (item: InboxItem) => void;
  onShowWaiting: (kind: Kind) => void;
}) {
  const [picking, setPicking] = useState<Kind | null>(null);
  return (
    <div className="p-4 sm:p-6">
      <p className="text-sm text-slate-600 mb-4">
        These lead the Insights page, one for each type. Without a choice, the newest is featured.{" "}
        <a href="/insights" target="_blank" rel="noopener" className="font-semibold text-teal-aa hover:underline whitespace-nowrap">View the page ↗</a>
      </p>
      <ul className="grid gap-4 md:grid-cols-3">
        {KIND_ORDER.map((k) => {
          const slot = featuredNow[k];
          const type = k.toLowerCase();
          return (
            <li key={k} className={`rounded-2xl border p-4 flex flex-col transition-colors ${picking === k ? "border-teal-aa bg-teal-50/60" : "border-slate-200 bg-slate-50"}`}>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Featured {type}</p>
              {slot ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnail(picture(slot.item))} alt="" className="mt-3 w-full aspect-[16/10] rounded-xl object-cover bg-slate-200" />
                  <p className="mt-3 text-xs font-semibold text-slate-500">{SOURCE_LABEL[slot.item.source]} · {day(slot.item.publishedAt)}</p>
                  <h3 className="font-bold leading-snug mt-1">{slot.item.title}</h3>
                  <p className={`mt-2 inline-flex self-start items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${slot.chosen ? "bg-amber-100 text-amber-900" : "bg-white border border-slate-200 text-slate-600"}`}>
                    {slot.chosen ? "★ Chosen by you" : "Newest, chosen automatically"}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {slot.chosen ? "Stays featured until you change it." : `Changes by itself when a newer ${type} goes on the page.`}
                  </p>
                  <div className="mt-auto pt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      aria-expanded={picking === k}
                      aria-controls="featured-picker"
                      disabled={onPage[k].length < 2}
                      title={onPage[k].length < 2 ? `It's the only ${type} on the page.` : undefined}
                      onClick={() => setPicking(picking === k ? null : k)}
                      className={BTN_SECONDARY}
                    >
                      Change
                    </button>
                    <button type="button" onClick={() => onEdit(slot.item)} className={`${BTN} text-slate-600 hover:bg-slate-100`}>Edit</button>
                    {slot.chosen && (
                      <button type="button" disabled={busy.has(slot.item.id)} onClick={() => onUseNewest(slot.item)} className={`${BTN} text-slate-600 hover:bg-slate-100`}>
                        Use the newest
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm text-slate-500">No {type}s are on the page yet, so the page leaves this out.</p>
                  <div className="mt-auto pt-4">
                    <button type="button" onClick={() => onShowWaiting(k)} className={BTN_SECONDARY}>See waiting {type}s</button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {picking && featuredNow[picking] && (
        <FeaturedPicker
          key={picking}
          kind={picking}
          current={featuredNow[picking]!.item}
          options={onPage[picking]}
          busy={busy}
          onPick={async (item) => {
            if (await onFeature(item)) setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  );
}

/** Choosing a type's featured post from the ones on the page, newest first, with a search. */
function FeaturedPicker({ kind, current, options, busy, onPick, onClose }: {
  kind: Kind;
  current: InboxItem;
  options: InboxItem[];
  busy: Set<number>;
  onPick: (item: InboxItem) => Promise<void>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const type = kind.toLowerCase();
  useEffect(() => {
    panel.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    panel.current?.querySelector("input")?.focus({ preventScroll: true });
  }, []);
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = options.filter((item) => words.every((w) => `${item.title} ${item.summary}`.toLowerCase().includes(w)));
  return (
    <div
      ref={panel}
      id="featured-picker"
      role="region"
      aria-label={`Choose the featured ${type}`}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="mt-4 rounded-2xl border border-teal-aa bg-white shadow-sm scroll-mb-24"
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <h3 className="font-heading font-bold">Choose the featured {type}</h3>
        <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className="px-4 pt-2">
        <label className="sr-only" htmlFor="featured-search">Search the {type}s on the page</label>
        <input
          id="featured-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${options.length} ${type}s on the page`}
          className="w-full min-h-11 rounded-full border border-slate-300 px-4 text-[15px] focus:outline-none focus:border-teal-aa focus:ring-2 focus:ring-teal-aa/25"
        />
        <p className="text-xs text-slate-500 mt-2">Only posts on the page can be featured. To feature one that&apos;s waiting, add it to the page first.</p>
      </div>
      {matches.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">No {type}s on the page match “{query}”.</p>
      ) : (
        <ul className="mt-2 max-h-[26rem] overflow-y-auto divide-y divide-slate-100 border-t border-slate-100">
          {matches.map((item) => {
            const isCurrent = item.id === current.id;
            return (
              <li key={item.id} className={`flex items-center gap-3 px-4 py-3 ${isCurrent ? "bg-amber-50/70" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnail(picture(item))} alt="" loading="lazy" className="hidden sm:block w-20 h-12 rounded-lg object-cover bg-slate-100 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm leading-snug line-clamp-3 sm:line-clamp-2">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{SOURCE_LABEL[item.source]} · {day(item.publishedAt)}</p>
                </div>
                {isCurrent ? (
                  <span className="shrink-0 rounded-full bg-amber-100 text-amber-900 px-3 py-1.5 text-xs font-bold">★ Featured now</span>
                ) : (
                  <button type="button" disabled={busy.has(item.id)} onClick={() => onPick(item)} className={`${BTN_SECONDARY} shrink-0`}>
                    Feature this
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Post({ item, featuredAs, wouldFeature, busy, highlight, selected, isNew, onSelect, onChange, onEdit }: {
  item: InboxItem;
  featuredAs: FeaturedAs;
  /** Not on the page, and would become the featured post of its type if added. */
  wouldFeature: boolean;
  busy: boolean;
  highlight: boolean;
  selected: boolean;
  /** Arrived since the moderator's previous visit. */
  isNew: boolean;
  onSelect: () => void;
  onChange: (changes: ItemChanges) => void;
  onEdit: () => void;
}) {
  return (
    <li id={`post-${item.id}`} className={`px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:gap-4 transition-colors duration-700 ${highlight ? "bg-teal-50" : selected ? "bg-teal-50/60" : ""}`}>
      <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
        <label className="shrink-0 self-start -m-2 p-2 cursor-pointer">
          <span className="sr-only">Select “{item.title}”</span>
          <input type="checkbox" checked={selected} onChange={onSelect} className={CHECKBOX} />
        </label>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbnail(picture(item))} alt="" loading="lazy" className="w-16 h-11 sm:w-32 sm:h-20 rounded-lg object-cover bg-slate-100 shrink-0" />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500">
            {isNew && <span className="rounded-full bg-teal-aa text-white px-2 py-0.5">New</span>}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">{SOURCE_LABEL[item.source]}</span>
            <span>{item.kind}</span>
            <span aria-hidden="true">·</span>
            <span>{day(item.publishedAt)}</span>
            {featuredAs === "chosen" && <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5">★ Featured</span>}
            {featuredAs === "newest" && (
              <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5" title="Featured because it's the newest. Choose a post with Feature to change it.">
                ★ Featured · newest
              </span>
            )}
            {wouldFeature && (
              <span className="rounded-full border border-dashed border-amber-300 text-amber-800 px-2 py-0.5" title={`Newer than the featured ${item.kind.toLowerCase()}, which was chosen automatically, so adding this one makes it the featured ${item.kind.toLowerCase()}.`}>
                ★ Becomes featured if added
              </span>
            )}
          </p>
          <h3 className="font-bold text-[15px] sm:text-base leading-snug mt-1">{item.title}</h3>
          {/* One line of summary on phones keeps the rows short */}
          {item.summary && <p className="text-sm text-slate-600 mt-1 line-clamp-1 sm:line-clamp-2">{item.summary}</p>}
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-sm font-semibold text-teal-aa hover:underline">
              Open the original ↗
            </a>
          )}
        </div>
      </div>
      {/* Phones: the buttons line up with the picture, past the checkbox */}
      <div className="flex flex-wrap sm:flex-col sm:items-stretch gap-2 pl-8 sm:pl-0 sm:w-44 shrink-0">
        {item.status === "pending" && (
          <>
            <button type="button" disabled={busy} onClick={() => onChange({ status: "approved" })} className={BTN_PRIMARY}>Add to page</button>
            <button type="button" disabled={busy} onClick={() => onChange({ status: "hidden" })} className={BTN_SECONDARY}>Hide</button>
          </>
        )}
        {item.status === "approved" && (
          <>
            <button
              type="button"
              disabled={busy}
              aria-pressed={item.featured}
              title={featuredAs === "newest" ? "Featured now as the newest. This keeps it featured when newer posts arrive." : undefined}
              onClick={() => onChange({ featured: !item.featured })}
              className={item.featured ? `${BTN} bg-amber-100 text-amber-900 hover:bg-amber-200` : BTN_SECONDARY}
            >
              {item.featured ? "★ Featured" : featuredAs === "newest" ? "☆ Keep featured" : "☆ Feature"}
            </button>
            <button type="button" disabled={busy} onClick={onEdit} className={BTN_SECONDARY}>Edit</button>
            <button type="button" disabled={busy} onClick={() => onChange({ status: "hidden" })} className={BTN_SECONDARY}>Take off page</button>
          </>
        )}
        {item.status === "hidden" && (
          <>
            <button type="button" disabled={busy} onClick={() => onChange({ status: "approved" })} className={BTN_PRIMARY}>Add to page</button>
            <button type="button" disabled={busy} onClick={() => onChange({ status: "pending" })} className={BTN_SECONDARY}>Move to Waiting</button>
          </>
        )}
        {item.status !== "approved" && (
          <button type="button" disabled={busy} onClick={onEdit} className={`${BTN} text-slate-600 hover:bg-slate-100`}>Edit</button>
        )}
      </div>
    </li>
  );
}

/** Fields shared by "Add a post" and "Edit". */
interface Draft {
  title: string;
  summary: string;
  content: string;
  kind: Kind;
  meta: string;
  date: string;
  imageId: number | null;
  /** The picture the post's card shows, or "" for none. */
  image: string;
}

/** What the card preview needs besides the draft: where the post links to, and its YouTube video. */
interface CardBase {
  url?: string;
  youtubeId?: string;
}

const noop = () => {};

function DraftFields({ draft, set, base, idPrefix }: { draft: Draft; set: (d: Partial<Draft>) => void; base: CardBase; idPrefix: string }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const card = insightCard({
    kind: draft.kind,
    title: draft.title,
    summary: draft.summary,
    meta: draft.meta,
    publishedAt: draft.date ? `${draft.date}T12:00:00Z` : new Date().toISOString(),
    url: base.url ?? "",
    image: draft.image,
    youtubeId: base.youtubeId ?? "",
    content: draft.content,
    featured: false,
  });
  return (
    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_22rem] md:items-start">
      <div className="grid gap-3 min-w-0">
        <label className="block text-sm font-semibold">
          Title
          <input required value={draft.title} onChange={(e) => set({ title: e.target.value })} maxLength={300} className={FIELD} />
        </label>
        <label className="block text-sm font-semibold">
          Summary <span className="font-normal text-slate-500">(shown in search results)</span>
          <textarea value={draft.summary} onChange={(e) => set({ summary: e.target.value })} rows={3} maxLength={2000} className={FIELD} />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm font-semibold">
            Type
            <select value={draft.kind} onChange={(e) => set({ kind: e.target.value as Kind })} className={`${FIELD} bg-white`}>
              <option value="Blog">Blog / post</option>
              {base.youtubeId && <option value="Video">Video</option>}
              {base.youtubeId && <option value="Podcast">Podcast</option>}
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Date
            <input type="date" value={draft.date} onChange={(e) => set({ date: e.target.value })} className={FIELD} />
          </label>
          <label className="block text-sm font-semibold">
            Card label
            <input value={draft.meta} onChange={(e) => set({ meta: e.target.value })} maxLength={60} placeholder="5 min read" className={FIELD} />
          </label>
        </div>
        <details className="rounded-xl border border-slate-200 px-3 py-2">
          <summary className="text-sm font-semibold cursor-pointer">Full text for the reader</summary>
          <textarea value={draft.content} onChange={(e) => set({ content: e.target.value })} rows={8} className={FIELD} aria-label="Full text for the reader" />
        </details>
      </div>

      {/* The card as the Insights page will show it, changing as the fields do. Look only: its links don't work here. */}
      <div className="min-w-0 md:sticky md:top-20">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">On the Insights page</p>
        <div inert className={INSIGHT_CARD_CLASS}>
          <InsightCardContent item={card} onRead={noop} onPlay={noop} />
        </div>
        {draft.kind === "Blog" ? (
          <>
            <input
              ref={file}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              id={`${idPrefix}-picture`}
              onChange={async (e) => {
                const chosen = e.target.files?.[0];
                e.target.value = "";
                if (!chosen) return;
                setUploading(true);
                setUploadError("");
                try {
                  const imageId = await uploadPicture(chosen);
                  set({ imageId, image: `/api/insights/media/${imageId}.jpg` });
                } catch (error) {
                  setUploadError((error as Error).message);
                } finally {
                  setUploading(false);
                }
              }}
            />
            <button type="button" onClick={() => file.current?.click()} disabled={uploading} className={`${BTN_SECONDARY} w-full mt-3`}>
              {uploading ? "Uploading…" : draft.image ? "Replace picture" : "Add a picture"}
            </button>
            {uploadError && <p role="alert" className="text-xs text-red-600 mt-1">{uploadError}</p>}
          </>
        ) : (
          <p className="text-xs text-slate-500 mt-2">Videos and podcasts show YouTube&apos;s own thumbnail.</p>
        )}
      </div>
    </div>
  );
}

function AddPost({ onAdded, onShow, onError }: { onAdded: (item: InboxItem) => void; onShow: (item: InboxItem) => void; onError: (text: string) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  async function load(link: string) {
    setLoading(true);
    setError("");
    setPreview(null);
    setDraft(null);
    try {
      const p = await api<Preview>("/api/admin/insights/preview", { method: "POST", body: JSON.stringify({ url: link }) });
      setPreview(p);
      if (!p.existing) {
        setDraft({
          title: p.item.title,
          summary: p.item.summary,
          content: p.item.content ?? "",
          kind: p.item.kind,
          meta: p.item.meta,
          date: p.item.publishedAt.slice(0, 10),
          imageId: p.item.imageId ?? null,
          image: cardPicture(p.item),
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function add(status: "approved" | "pending") {
    if (!preview || !draft) return;
    if (!draft.title.trim()) return onError("Give the post a title first.");
    setSaving(true);
    try {
      const { item } = await api<{ item: InboxItem }>("/api/admin/insights", {
        method: "POST",
        body: JSON.stringify({
          ...preview.item,
          title: draft.title,
          summary: draft.summary,
          content: draft.content,
          kind: draft.kind,
          meta: draft.meta,
          publishedAt: draft.date ? new Date(`${draft.date}T12:00:00Z`).toISOString() : preview.item.publishedAt,
          imageId: draft.imageId,
          status,
        }),
      });
      onAdded(item);
      setUrl("");
      setPreview(null);
      setDraft(null);
    } catch (e) {
      const existing = (e as { body?: { item?: InboxItem } }).body?.item;
      if (existing) onShow(existing);
      onError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="add-title" className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6">
      <h2 id="add-title" className="font-heading text-lg font-bold">Add a post</h2>
      <p className="text-sm text-slate-600">Paste a link to a LinkedIn, Instagram, YouTube or blog post to see it as a card. You can change everything before adding it.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void load(url);
        }}
        className="mt-3 flex flex-col sm:flex-row gap-2"
      >
        <label htmlFor="post-link" className="sr-only">Post link</label>
        <input
          id="post-link"
          type="url"
          required
          inputMode="url"
          placeholder="https://www.linkedin.com/posts/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onPaste={(e) => {
            // A pasted link opens its preview straight away; a typed one waits for the button.
            const pasted = e.clipboardData.getData("text").trim();
            if (loading || !/^https?:\/\/\S+$/i.test(pasted)) return;
            e.preventDefault();
            setUrl(pasted);
            void load(pasted);
          }}
          className="flex-1 min-h-11 rounded-full border border-slate-300 px-4 text-[15px] focus:outline-none focus:border-teal-aa focus:ring-2 focus:ring-teal-aa/25"
        />
        <button type="submit" disabled={loading} className={BTN_PRIMARY}>{loading ? "Reading the post…" : "Get preview"}</button>
      </form>
      {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}

      {preview?.existing && (
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm">
            <strong>Already in the inbox</strong>, under{" "}
            {STATUS_LABEL[preview.existing.status]}: {preview.existing.title}
          </p>
          <button type="button" onClick={() => onShow(preview.existing!)} className={BTN_SECONDARY}>Show it</button>
        </div>
      )}

      {preview && draft && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">From {SOURCE_LABEL[preview.item.source]}</p>
          {preview.notes.length > 0 && (
            <ul className="mb-4 space-y-1">
              {preview.notes.map((note) => <li key={note} className="text-sm rounded-lg bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2">{note}</li>)}
            </ul>
          )}
          <DraftFields draft={draft} set={(d) => setDraft({ ...draft, ...d })} base={{ url: preview.item.url, youtubeId: preview.item.youtubeId }} idPrefix="add" />
          <div className="mt-4 flex flex-wrap gap-2 justify-end">
            <button type="button" onClick={() => { setPreview(null); setDraft(null); }} className={`${BTN} text-slate-600 hover:bg-slate-100`}>Cancel</button>
            <button type="button" disabled={saving} onClick={() => add("pending")} className={BTN_SECONDARY}>Add to Waiting</button>
            <button type="button" disabled={saving} onClick={() => add("approved")} className={BTN_PRIMARY}>Add to the page</button>
          </div>
        </div>
      )}
    </section>
  );
}

function EditPost({ item, onClose, onSaved }: { item: InboxItem; onClose: () => void; onSaved: (item: InboxItem) => void }) {
  const [draft, setDraft] = useState<Draft>({
    title: item.title,
    summary: item.summary,
    content: item.content,
    kind: item.kind,
    meta: item.meta,
    date: item.publishedAt.slice(0, 10),
    imageId: item.imageId,
    image: cardPicture(item),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  // Focus the first field once, close on Escape, and keep the page behind from scrolling.
  useEffect(() => {
    dialog.current?.querySelector<HTMLInputElement>("input:not([type=file])")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { item: updated } = await api<{ item: InboxItem }>(`/api/admin/insights/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: draft.title,
          summary: draft.summary,
          content: draft.content,
          kind: draft.kind,
          meta: draft.meta,
          ...(draft.imageId !== item.imageId ? { imageId: draft.imageId } : {}),
          ...(draft.date && draft.date !== item.publishedAt.slice(0, 10) ? { publishedAt: `${draft.date}T12:00:00Z` } : {}),
        }),
      });
      onSaved(updated);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 bg-brand-navy/60 flex items-end sm:items-center justify-center p-0 sm:p-6" onClick={onClose}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-xl"
      >
        <form onSubmit={save}>
          <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
            <h2 id="edit-title" className="font-heading text-lg font-bold">Edit post</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <div className="px-5 sm:px-6 py-5">
            <DraftFields draft={draft} set={(d) => setDraft((x) => ({ ...x, ...d }))} base={{ url: item.url, youtubeId: item.youtubeId }} idPrefix="edit" />
            <p className="text-xs text-slate-500 mt-3">Changes here only affect the Insights page, not the original post.</p>
            {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 px-5 sm:px-6 py-4 border-t border-slate-200 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className={`${BTN} text-slate-600 hover:bg-slate-100`}>Cancel</button>
            <button type="submit" disabled={saving} className={BTN_PRIMARY}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
