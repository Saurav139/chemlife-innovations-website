"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Images } from "@/lib/assets";
import type { InboxItem, ItemChanges, Kind, Source, SourceItem, SourceState, Status, SyncResult } from "@/lib/insights-store/types";

// The Insights inbox: posts from ChemLife's channels wait under "Waiting" until the moderator adds them to the
// Insights page or hides them. The page updates as soon as a decision is made.

interface Data {
  items: InboxItem[];
  lastSync: { at: string; results: SyncResult[] } | null;
  sources: Record<Source, SourceState>;
}

interface Preview {
  item: SourceItem & { publishedAt: string };
  existing: InboxItem | null;
  notes: string[];
}

const SOURCE_LABEL: Record<Source, string> = { youtube: "YouTube", wordpress: "Blog", instagram: "Instagram", linkedin: "LinkedIn", link: "Web link" };
const CHANNELS: Source[] = ["youtube", "wordpress", "instagram", "linkedin"];
type Tab = Status | "featured";
const TABS: { id: Tab; label: string; empty: string }[] = [
  { id: "pending", label: "Waiting", empty: "Nothing is waiting. New posts appear here after each check." },
  { id: "approved", label: "On the page", empty: "Nothing is on the Insights page yet." },
  { id: "featured", label: "Featured", empty: "" },
  { id: "hidden", label: "Hidden", empty: "Nothing is hidden." },
];
const STATUS_LABEL: Record<Status, string> = { pending: "Waiting", approved: "On the page", hidden: "Hidden" };
const KIND_ORDER: Kind[] = ["Blog", "Video", "Podcast"];
/** How a post leads its type on the Insights page: picked in the inbox, or the newest when nothing is picked. */
type FeaturedAs = "chosen" | "newest" | null;
const AUTO_CHECK_AFTER = 10 * 60 * 1000;

const BTN = "inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-full text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default";
const BTN_PRIMARY = `${BTN} bg-teal-aa hover:bg-teal-700 text-white`;
const BTN_SECONDARY = `${BTN} border border-slate-300 bg-white hover:border-brand-navy text-brand-navy`;
const FIELD = "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px] focus:outline-none focus:border-teal-aa focus:ring-2 focus:ring-teal-aa/25";

function picture(item: { image?: string; imageId?: number | null; imageUrl?: string; youtubeId?: string }) {
  if (item.image) return item.image;
  if (item.imageId) return `/api/insights/media/${item.imageId}.jpg`;
  if (item.imageUrl) return item.imageUrl;
  if (item.youtubeId) return `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
  return Images.gallery.rotate21;
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
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [checking, setChecking] = useState(false);
  const [toast, setToast] = useState<{ text: string; error?: boolean; undo?: () => void } | null>(null);
  const [editing, setEditing] = useState<InboxItem | null>(null);
  const [highlight, setHighlight] = useState<number | null>(null);
  const toastTimer = useRef<number>(0);

  // The post leading each type on the Insights page, worked out as the page does: the one chosen here, else the
  // newest (videos and podcasts need a YouTube video to show).
  const featuredNow = useMemo(() => {
    const now = {} as Record<Kind, { item: InboxItem; chosen: boolean } | null>;
    for (const k of KIND_ORDER) {
      const onPage = data.items
        .filter((item) => item.status === "approved" && item.kind === k && (k === "Blog" || item.youtubeId))
        .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || b.id - a.id);
      const chosen = onPage.find((item) => item.featured);
      now[k] = chosen ? { item: chosen, chosen: true } : onPage[0] ? { item: onPage[0], chosen: false } : null;
    }
    return now;
  }, [data.items]);
  const featuredAs = (item: InboxItem): FeaturedAs => {
    const slot = featuredNow[item.kind];
    return slot?.item.id === item.id ? (slot.chosen ? "chosen" : "newest") : null;
  };

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { pending: 0, approved: 0, hidden: 0, featured: 0 };
    data.items.forEach((item) => c[item.status]++);
    c.featured = KIND_ORDER.filter((k) => featuredNow[k]).length;
    return c;
  }, [data.items, featuredNow]);
  const shown = data.items.filter(
    (item) => item.status === tab && (source === "all" || item.source === source) && (kind === "all" || item.kind === kind)
  );

  function chooseAnother(k: Kind) {
    setTab("approved");
    setSource("all");
    setKind(k);
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

  async function change(item: InboxItem, changes: ItemChanges, done: string, undoable = true) {
    setBusy((b) => new Set(b).add(item.id));
    try {
      const { item: updated } = await api<{ item: InboxItem }>(`/api/admin/insights/${item.id}`, { method: "PATCH", body: JSON.stringify(changes) });
      replace(updated);
      const before: ItemChanges = { status: item.status, featured: item.featured };
      say(done, undoable ? { undo: () => change(updated, before, "Undone.", false) } : {});
    } catch (error) {
      say((error as Error).message, { error: true });
    } finally {
      setBusy((b) => {
        const next = new Set(b);
        next.delete(item.id);
        return next;
      });
    }
  }

  async function check(quiet = false) {
    setChecking(true);
    try {
      const fresh = await api<Data>("/api/admin/insights/sync", { method: "POST" });
      const before = new Set(data.items.map((item) => item.id));
      const added = fresh.items.filter((item) => !before.has(item.id) && item.status === "pending").length;
      setData(fresh);
      const failed = fresh.lastSync?.results.filter((r) => r.error) ?? [];
      if (failed.length) say(`Couldn't check ${failed.map((r) => SOURCE_LABEL[r.source]).join(" and ")}. See the channel for details.`, { error: true });
      else if (!quiet || added) say(added ? `${added} new post${added === 1 ? " is" : "s are"} waiting.` : "No new posts.");
    } catch (error) {
      say((error as Error).message, { error: true });
    } finally {
      setChecking(false);
    }
  }

  // Check for new posts when the inbox opens, unless that was done in the last 10 minutes.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    if (!initial.lastSync || Date.now() - Date.parse(initial.lastSync.at) > AUTO_CHECK_AFTER) check(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    window.location.reload();
  }

  function show(item: InboxItem) {
    setTab(item.status);
    setSource("all");
    setKind("all");
    setHighlight(item.id);
    window.setTimeout(() => document.getElementById(`post-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
    window.setTimeout(() => setHighlight(null), 2500);
  }

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

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <Channels data={data} checking={checking} onCheck={() => check()} />
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 pt-4 border-b border-slate-200">
            <div role="tablist" aria-label="Posts by decision" className="flex gap-1 -mb-px overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  type="button"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={`min-h-11 px-3 sm:px-4 border-b-2 text-sm font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    tab === t.id ? "border-teal-aa text-teal-aa" : "border-transparent text-slate-500 hover:text-brand-navy"
                  }`}
                >
                  {t.id === "featured" && <span aria-hidden="true" className="mr-1 text-amber-500">★</span>}
                  {t.label}
                  <span className={`ml-2 inline-flex min-w-6 justify-center rounded-full px-1.5 py-0.5 text-xs ${t.id === "pending" && counts.pending ? "bg-brand-orange-aa text-white" : "bg-slate-100 text-slate-600"}`}>
                    {counts[t.id]}
                  </span>
                </button>
              ))}
            </div>
            {tab !== "featured" && (
              <div className="flex items-center gap-2 pb-3 sm:pb-0 text-sm text-slate-600">
                <span className="sr-only sm:not-sr-only">Show</span>
                <select aria-label="Channel" value={source} onChange={(e) => setSource(e.target.value as Source | "all")} className="min-h-10 rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-brand-navy cursor-pointer">
                  <option value="all">All channels</option>
                  {(Object.keys(SOURCE_LABEL) as Source[]).map((s) => <option key={s} value={s}>{SOURCE_LABEL[s]}</option>)}
                </select>
                <select aria-label="Type" value={kind} onChange={(e) => setKind(e.target.value as Kind | "all")} className="min-h-10 rounded-full border border-slate-300 bg-white px-3 text-sm font-semibold text-brand-navy cursor-pointer">
                  <option value="all">All types</option>
                  {KIND_ORDER.map((k) => <option key={k} value={k}>{k}s</option>)}
                </select>
              </div>
            )}
          </div>

          <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)!.label}>
            {tab === "featured" ? (
              <FeaturedNow
                featuredNow={featuredNow}
                busy={busy}
                onChooseAnother={chooseAnother}
                onUseNewest={(item) => change(item, { featured: false }, `The newest ${item.kind.toLowerCase()} is featured again.`)}
              />
            ) : (
              <>
                {tab === "approved" && shown.length > 0 && (
                  <p className="px-4 sm:px-6 pt-4 text-sm text-slate-600">
                    <span className="text-amber-500" aria-hidden="true">★</span> marks the post featured at the top of the page for its type: the one you chose with{" "}
                    <strong className="text-brand-navy">Feature</strong>, or else the newest. See all three under <strong className="text-brand-navy">Featured</strong>.
                  </p>
                )}
                {shown.length === 0 ? (
                  <p className="px-6 py-14 text-center text-slate-500">
                    {source === "all" && kind === "all" ? TABS.find((t) => t.id === tab)!.empty : "Nothing here matches the channel and type chosen."}
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {shown.map((item) => (
                      <Post
                        key={item.id}
                        item={item}
                        featuredAs={featuredAs(item)}
                        busy={busy.has(item.id)}
                        highlight={highlight === item.id}
                        onChange={(changes, done) => change(item, changes, done)}
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

      <div aria-live="polite" className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-50 flex justify-center pointer-events-none">
        {toast && (
          <div className={`pointer-events-auto flex items-center gap-4 rounded-xl px-4 py-3 shadow-lg text-sm font-semibold ${toast.error ? "bg-red-700 text-white" : "bg-brand-navy text-white"}`}>
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
  return (
    <section aria-labelledby="channels-title" className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="channels-title" className="font-heading text-lg font-bold">Channels</h2>
          <p className="text-sm text-slate-600">
            {checking ? "Checking for new posts…" : data.lastSync ? `Last checked ${ago(data.lastSync.at)}.` : "Not checked yet."}
          </p>
        </div>
        <button type="button" onClick={onCheck} disabled={checking} className={BTN_SECONDARY}>
          <svg className={`w-4 h-4 ${checking ? "animate-spin motion-reduce:animate-none" : ""}`} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M5.6 15a7 7 0 0 0 12.3 2.3M18.4 9A7 7 0 0 0 6.1 6.7" />
          </svg>
          {checking ? "Checking…" : "Check for new posts"}
        </button>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {CHANNELS.map((s) => {
          const state = data.sources[s];
          return (
            <li key={s} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm">{SOURCE_LABEL[s]}</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className={`w-2 h-2 rounded-full ${dot[state.state]}`} aria-hidden="true" />
                  {label[state.state]}
                </span>
              </div>
              {state.detail && <p className={`text-xs mt-1 leading-snug ${state.state === "error" ? "text-red-700" : "text-slate-600"}`}>{state.detail}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FeaturedNow({ featuredNow, busy, onChooseAnother, onUseNewest }: {
  featuredNow: Record<Kind, { item: InboxItem; chosen: boolean } | null>;
  busy: Set<number>;
  onChooseAnother: (kind: Kind) => void;
  onUseNewest: (item: InboxItem) => void;
}) {
  return (
    <div className="p-4 sm:p-6">
      <p className="text-sm text-slate-600 mb-4">These lead the Insights page, one for each type. Choose any post that&apos;s on the page instead; without a choice, the newest is featured.</p>
      <ul className="grid gap-4 md:grid-cols-3">
        {KIND_ORDER.map((k) => {
          const slot = featuredNow[k];
          return (
            <li key={k} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Featured {k.toLowerCase()}</p>
              {slot ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbnail(picture(slot.item))} alt="" className="mt-3 w-full aspect-[16/10] rounded-xl object-cover bg-slate-200" />
                  <p className="mt-3 text-xs font-semibold text-slate-500">{SOURCE_LABEL[slot.item.source]} · {day(slot.item.publishedAt)}</p>
                  <h3 className="font-bold leading-snug mt-1">{slot.item.title}</h3>
                  <p className={`mt-2 inline-flex self-start items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${slot.chosen ? "bg-amber-100 text-amber-900" : "bg-white border border-slate-200 text-slate-600"}`}>
                    {slot.chosen ? "★ Chosen by you" : "Newest on the page, chosen automatically"}
                  </p>
                  <div className="mt-auto pt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => onChooseAnother(k)} className={BTN_SECONDARY}>Choose another</button>
                    {slot.chosen && (
                      <button type="button" disabled={busy.has(slot.item.id)} onClick={() => onUseNewest(slot.item)} className={`${BTN} text-slate-600 hover:bg-slate-100`}>
                        Use the newest
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No {k.toLowerCase()}s are on the page, so this section is left out.</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Post({ item, featuredAs, busy, highlight, onChange, onEdit }: {
  item: InboxItem;
  featuredAs: FeaturedAs;
  busy: boolean;
  highlight: boolean;
  onChange: (changes: ItemChanges, done: string) => void;
  onEdit: () => void;
}) {
  return (
    <li id={`post-${item.id}`} className={`px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-4 transition-colors duration-700 ${highlight ? "bg-teal-50" : ""}`}>
      <div className="flex gap-4 min-w-0 flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbnail(picture(item))} alt="" loading="lazy" className="w-24 h-16 sm:w-32 sm:h-20 rounded-lg object-cover bg-slate-100 shrink-0" />
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-slate-500">
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
          </p>
          <h3 className="font-bold text-[15px] sm:text-base leading-snug mt-1">{item.title}</h3>
          {item.summary && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{item.summary}</p>}
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-sm font-semibold text-teal-aa hover:underline">
              Open the original ↗
            </a>
          )}
        </div>
      </div>
      <div className="flex flex-wrap sm:flex-col sm:items-stretch gap-2 sm:w-44 shrink-0">
        {item.status === "pending" && (
          <>
            <button type="button" disabled={busy} onClick={() => onChange({ status: "approved" }, "Added to the Insights page.")} className={BTN_PRIMARY}>Add to page</button>
            <button type="button" disabled={busy} onClick={() => onChange({ status: "hidden" }, "Hidden.")} className={BTN_SECONDARY}>Hide</button>
          </>
        )}
        {item.status === "approved" && (
          <>
            <button
              type="button"
              disabled={busy}
              aria-pressed={item.featured}
              title={featuredAs === "newest" ? "Featured now as the newest. This keeps it featured when newer posts arrive." : undefined}
              onClick={() =>
                onChange(
                  { featured: !item.featured },
                  item.featured ? "No longer featured. The newest is featured instead." : `Featured at the top of the ${item.kind.toLowerCase()}s.`
                )
              }
              className={item.featured ? `${BTN} bg-amber-100 text-amber-900 hover:bg-amber-200` : BTN_SECONDARY}
            >
              {item.featured ? "★ Featured" : featuredAs === "newest" ? "☆ Keep featured" : "☆ Feature"}
            </button>
            <button type="button" disabled={busy} onClick={onEdit} className={BTN_SECONDARY}>Edit</button>
            <button type="button" disabled={busy} onClick={() => onChange({ status: "hidden" }, "Taken off the Insights page.")} className={BTN_SECONDARY}>Take off page</button>
          </>
        )}
        {item.status === "hidden" && (
          <>
            <button type="button" disabled={busy} onClick={() => onChange({ status: "approved" }, "Added to the Insights page.")} className={BTN_PRIMARY}>Add to page</button>
            <button type="button" disabled={busy} onClick={() => onChange({ status: "pending" }, "Moved to Waiting.")} className={BTN_SECONDARY}>Move to Waiting</button>
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
  image: string;
}

function DraftFields({ draft, set, canBeVideo, idPrefix }: { draft: Draft; set: (d: Partial<Draft>) => void; canBeVideo: boolean; idPrefix: string }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={draft.image} alt="" className="w-full aspect-[16/10] rounded-xl object-cover bg-slate-100 border border-slate-200" />
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
        <button type="button" onClick={() => file.current?.click()} disabled={uploading} className={`${BTN_SECONDARY} w-full mt-2`}>
          {uploading ? "Uploading…" : "Replace picture"}
        </button>
        {uploadError && <p role="alert" className="text-xs text-red-600 mt-1">{uploadError}</p>}
      </div>
      <div className="grid gap-3 min-w-0">
        <label className="block text-sm font-semibold">
          Title
          <input required value={draft.title} onChange={(e) => set({ title: e.target.value })} maxLength={300} className={FIELD} />
        </label>
        <label className="block text-sm font-semibold">
          Summary <span className="font-normal text-slate-500">(shown on the card)</span>
          <textarea value={draft.summary} onChange={(e) => set({ summary: e.target.value })} rows={3} maxLength={2000} className={FIELD} />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block text-sm font-semibold">
            Type
            <select value={draft.kind} onChange={(e) => set({ kind: e.target.value as Kind })} className={`${FIELD} bg-white`}>
              <option value="Blog">Blog / post</option>
              {canBeVideo && <option value="Video">Video</option>}
              {canBeVideo && <option value="Podcast">Podcast</option>}
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

  async function load(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPreview(null);
    setDraft(null);
    try {
      const p = await api<Preview>("/api/admin/insights/preview", { method: "POST", body: JSON.stringify({ url }) });
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
          image: picture(p.item),
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
      <p className="text-sm text-slate-600">Paste a link to a LinkedIn, Instagram, YouTube or blog post. You can check and change everything before adding it.</p>
      <form onSubmit={load} className="mt-3 flex flex-col sm:flex-row gap-2">
        <label htmlFor="post-link" className="sr-only">Post link</label>
        <input
          id="post-link"
          type="url"
          required
          inputMode="url"
          placeholder="https://www.linkedin.com/posts/…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
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
          <DraftFields draft={draft} set={(d) => setDraft({ ...draft, ...d })} canBeVideo={Boolean(preview.item.youtubeId)} idPrefix="add" />
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
    image: picture(item),
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
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white shadow-xl"
      >
        <form onSubmit={save}>
          <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
            <h2 id="edit-title" className="font-heading text-lg font-bold">Edit post</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <div className="px-5 sm:px-6 py-5">
            <DraftFields draft={draft} set={(d) => setDraft((x) => ({ ...x, ...d }))} canBeVideo={Boolean(item.youtubeId)} idPrefix="edit" />
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
