"use client";

import { useMemo, useState } from "react";
import { INQUIRY_TYPES } from "@/lib/contact";
import { DOSSIER_INTERESTS } from "@/lib/dossier";
import {
  NO_FILTERS, NOTE_LIMIT, contactCsv, dossierCsv, filterLeads, leadType, localTime,
  type ContactLead, type DossierLead, type Lead, type LeadFilters, type LeadKind,
} from "@/lib/leads";

// The leads dashboard: every contact form message and technical dossier download, newest first. The team ticks
// what they've dealt with, keeps a note, replies by email, exports a list as CSV, and deletes spam or tests.

interface Data {
  contact: ContactLead[];
  dossier: DossierLead[];
}

const TABS: { id: LeadKind; label: string; typeLabel: string; types: readonly string[]; empty: string }[] = [
  { id: "contact", label: "Contact messages", typeLabel: "Inquiry type", types: INQUIRY_TYPES, empty: "No contact messages yet." },
  { id: "dossier", label: "Dossier downloads", typeLabel: "Interested in", types: DOSSIER_INTERESTS, empty: "No one has downloaded the dossier yet." },
];

const BTN = "inline-flex items-center justify-center gap-1.5 min-h-10 px-4 rounded-full text-sm font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-default";
const BTN_PRIMARY = `${BTN} bg-teal-aa hover:bg-teal-700 text-white`;
const BTN_SECONDARY = `${BTN} border border-slate-300 bg-white hover:border-brand-navy text-brand-navy`;
const BTN_QUIET = "inline-flex items-center min-h-9 px-3 rounded-full text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50";
const FIELD = "mt-1 w-full min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-[15px] focus:outline-none focus:border-teal-aa focus:ring-2 focus:ring-teal-aa/25";
const LABEL = "block text-xs font-semibold uppercase tracking-wide text-slate-500";

const DAY = 24 * 3600 * 1000;

const count = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ago(iso: string) {
  const minutes = Math.round((Date.now() - Date.parse(iso)) / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (minutes < 60) return rtf.format(-minutes, "minute");
  if (minutes < 48 * 60) return rtf.format(-Math.round(minutes / 60), "hour");
  return rtf.format(-Math.round(minutes / 1440), "day");
}

async function api<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json" } }).catch(() => null);
  if (!res) throw new Error("Couldn't reach the site. Check your connection and try again.");
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.reload();
    throw new Error(body.error || "Please sign in again.");
  }
  if (!res.ok) throw new Error(body.error || "Something went wrong. Please try again.");
  return body as T;
}

function download(csv: string, filename: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function LeadsDashboard({ initial }: { initial: Data }) {
  const [data, setData] = useState<Data>(initial);
  const [tab, setTab] = useState<LeadKind>("contact");
  const [filters, setFilters] = useState<LeadFilters>(NO_FILTERS);
  const [error, setError] = useState("");

  const current = TABS.find((t) => t.id === tab)!;
  const all: Lead[] = data[tab];
  const shown = useMemo(() => filterLeads(all, filters), [all, filters]);
  const filtered = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS);

  const stats = useMemo(() => {
    const now = Date.now();
    const since = (leads: Lead[], days: number) => leads.filter((l) => now - Date.parse(l.createdAt) < days * DAY).length;
    const open = (leads: Lead[]) => leads.filter((l) => !l.handledAt).length;
    return {
      contact: { total: data.contact.length, open: open(data.contact) },
      dossier: { total: data.dossier.length, open: open(data.dossier) },
      week: { contact: since(data.contact, 7), dossier: since(data.dossier, 7) },
      month: { contact: since(data.contact, 30), dossier: since(data.dossier, 30) },
    };
  }, [data]);

  function set<K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function switchTab(id: LeadKind) {
    setTab(id);
    // The two lists have different types; the other filters carry over.
    setFilters((f) => ({ ...f, type: "" }));
  }

  function replace(kind: LeadKind, lead: Lead) {
    setData((d) => ({ ...d, [kind]: (d[kind] as Lead[]).map((l) => (l.id === lead.id ? lead : l)) }));
  }

  async function change(kind: LeadKind, lead: Lead, changes: { handled?: boolean; note?: string }): Promise<boolean> {
    setError("");
    try {
      const { lead: changed } = await api<{ lead: Lead }>(`/api/admin/leads/${kind}/${lead.id}`, { method: "PATCH", body: JSON.stringify(changes) });
      replace(kind, changed);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    }
  }

  async function remove(kind: LeadKind, lead: Lead) {
    const what = kind === "contact" ? "message" : "dossier download";
    if (!window.confirm(`Delete the ${what} from ${lead.name} (${lead.email})? This can't be undone.`)) return;
    setError("");
    try {
      await api(`/api/admin/leads/${kind}/${lead.id}`, { method: "DELETE" });
      setData((d) => ({ ...d, [kind]: (d[kind] as Lead[]).filter((l) => l.id !== lead.id) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function exportCsv() {
    const today = localTime(new Date().toISOString()).slice(0, 10);
    if (tab === "contact") download(contactCsv(shown as ContactLead[]), `chemlife-contact-messages-${today}.csv`);
    else download(dossierCsv(shown as DossierLead[]), `chemlife-dossier-downloads-${today}.csv`);
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    window.location.reload();
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/branding/logo-horizontal.png" alt="ChemLife Innovations" className="h-8 w-auto shrink-0" />
            <span className="hidden sm:block h-6 w-px bg-slate-200" aria-hidden="true" />
            <h1 className="font-heading text-lg font-bold truncate">Leads</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a href="/admin/insights" className="inline-flex items-center min-h-10 px-3 rounded-full text-sm font-semibold text-teal-aa hover:bg-teal-50">
              <span className="sm:hidden">Inbox</span>
              <span className="hidden sm:inline">Insights inbox</span>
            </a>
            <button type="button" onClick={signOut} className="min-h-10 px-3 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <section aria-label="Counts" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="Contact messages" value={stats.contact.total} sub={`${stats.contact.open} new`} />
          <Stat label="Dossier downloads" value={stats.dossier.total} sub={`${stats.dossier.open} new`} />
          <Stat label="Last 7 days" value={stats.week.contact + stats.week.dossier} sub={`${count(stats.week.contact, "message")} · ${count(stats.week.dossier, "download")}`} />
          <Stat label="Last 30 days" value={stats.month.contact + stats.month.dossier} sub={`${count(stats.month.contact, "message")} · ${count(stats.month.dossier, "download")}`} />
        </section>

        <div role="tablist" aria-label="Lists" className="mt-8 flex gap-1 border-b border-slate-200">
          {TABS.map((t) => {
            const open = stats[t.id].open;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => switchTab(t.id)}
                className={`-mb-px min-h-11 px-3 sm:px-4 border-b-2 text-sm sm:text-[15px] font-bold cursor-pointer transition-colors ${
                  tab === t.id ? "border-teal-aa text-brand-navy" : "border-transparent text-slate-500 hover:text-brand-navy"
                }`}
              >
                {t.label} <span className="font-semibold text-slate-500">({stats[t.id].total})</span>
                {open > 0 && <span className="ml-1.5 rounded-full bg-brand-orange-aa px-2 py-0.5 text-xs text-white">{open} new</span>}
              </button>
            );
          })}
        </div>

        <section aria-label="Filters" className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr_0.9fr]">
          <label className="block col-span-2 lg:col-span-1">
            <span className={LABEL}>Search</span>
            <input
              type="search"
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              placeholder={tab === "contact" ? "Name, email, subject, message…" : "Name, email, company, country…"}
              className={FIELD}
            />
          </label>
          <label className="block">
            <span className={LABEL}>From</span>
            <input type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => set("from", e.target.value)} className={FIELD} />
          </label>
          <label className="block">
            <span className={LABEL}>To</span>
            <input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => set("to", e.target.value)} className={FIELD} />
          </label>
          <label className="block">
            <span className={LABEL}>{current.typeLabel}</span>
            <select value={filters.type} onChange={(e) => set("type", e.target.value)} className={FIELD}>
              <option value="">All</option>
              {current.types.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={LABEL}>Status</span>
            <select value={filters.status} onChange={(e) => set("status", e.target.value as LeadFilters["status"])} className={FIELD}>
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="handled">Handled</option>
            </select>
          </label>
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600" aria-live="polite">
            {filtered ? `${shown.length} of ${all.length} shown` : `${all.length} in all`}
            {filtered && (
              <button type="button" onClick={() => setFilters(NO_FILTERS)} className="ml-2 font-semibold text-teal-aa hover:underline cursor-pointer">
                Clear filters
              </button>
            )}
          </p>
          <button type="button" onClick={exportCsv} disabled={!shown.length} className={BTN_SECONDARY}>
            Export CSV{filtered ? ` (${shown.length})` : ""}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <ul className="mt-4 space-y-3">
          {shown.map((lead) => (
            <LeadCard
              key={`${tab}-${lead.id}`}
              kind={tab}
              lead={lead}
              onChange={(changes) => change(tab, lead, changes)}
              onDelete={() => remove(tab, lead)}
            />
          ))}
        </ul>
        {!shown.length && (
          <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
            {all.length ? "Nothing matches these filters." : current.empty}
          </p>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-600">{label}</p>
      <p className="mt-1 font-heading text-3xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

function LeadCard({ kind, lead, onChange, onDelete }: {
  kind: LeadKind;
  lead: Lead;
  onChange: (changes: { handled?: boolean; note?: string }) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(lead.note);
  const [expanded, setExpanded] = useState(false);
  const contact = "inquiryType" in lead ? lead : null;
  const dossier = "company" in lead ? lead : null;
  const type = leadType(lead);
  const replySubject = contact ? `Re: ${contact.subject}` : "Your ChemLife technical dossier";
  const longMessage = Boolean(contact && (contact.message.length > 400 || contact.message.split("\n").length > 5));

  async function run(changes: { handled?: boolean; note?: string }) {
    setBusy(true);
    const ok = await onChange(changes);
    setBusy(false);
    return ok;
  }

  return (
    <li className={`rounded-2xl border bg-white p-4 sm:p-5 ${lead.handledAt ? "border-slate-200" : "border-teal-aa/40 shadow-sm"}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-heading text-lg font-bold">{lead.name}</span>
            {!lead.handledAt && <span className="rounded-full bg-brand-orange-aa px-2 py-0.5 text-xs font-bold text-white">New</span>}
            {type && <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-aa">{type}</span>}
          </p>
          {dossier && (
            <p className="mt-0.5 text-[15px] text-slate-700">
              {[dossier.role, dossier.company, dossier.country].filter(Boolean).join(" · ")}
            </p>
          )}
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <a href={`mailto:${lead.email}`} className="font-semibold text-teal-aa hover:underline break-all">{lead.email}</a>
            {dossier && <span className="text-slate-500">email confirmed with the code</span>}
            {contact?.phone && <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-teal-aa hover:underline">{contact.phone}</a>}
          </p>
        </div>
        <p className="text-sm text-slate-500 text-right">
          <time dateTime={lead.createdAt}>{when(lead.createdAt)}</time>
          <br />
          {ago(lead.createdAt)}
          {dossier?.locale && dossier.locale !== "en" && <> · site in {dossier.locale.toUpperCase()}</>}
        </p>
      </div>

      {contact && (
        <div className="mt-3">
          <p className="font-bold">{contact.subject}</p>
          <p className={`mt-1 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-slate-700 ${longMessage && !expanded ? "line-clamp-5" : ""}`}>
            {contact.message}
          </p>
          {longMessage && (
            <button type="button" onClick={() => setExpanded(!expanded)} className="mt-1 text-sm font-semibold text-teal-aa hover:underline cursor-pointer">
              {expanded ? "Show less" : "Show the whole message"}
            </button>
          )}
        </div>
      )}

      {editing ? (
        <div className="mt-3">
          <label className={LABEL} htmlFor={`note-${kind}-${lead.id}`}>Note for the team</label>
          <textarea
            id={`note-${kind}-${lead.id}`}
            value={note}
            maxLength={NOTE_LIMIT}
            rows={3}
            autoFocus
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Called on 12 Nov, sending samples."
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-[15px] focus:outline-none focus:border-teal-aa focus:ring-2 focus:ring-teal-aa/25"
          />
          <div className="mt-2 flex gap-2">
            <button type="button" disabled={busy} className={BTN_PRIMARY} onClick={async () => { if (await run({ note })) setEditing(false); }}>
              {busy ? "Saving…" : "Save note"}
            </button>
            <button type="button" disabled={busy} className={BTN_SECONDARY} onClick={() => { setNote(lead.note); setEditing(false); }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        lead.note && (
          <p className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-950 whitespace-pre-wrap break-words">
            <span className="font-bold">Note: </span>
            {lead.note}
          </p>
        )
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-slate-100 pt-3">
        <label className="mr-2 inline-flex min-h-9 items-center gap-2 text-sm font-semibold cursor-pointer">
          <input
            type="checkbox"
            className="h-5 w-5 accent-teal-aa cursor-pointer"
            checked={Boolean(lead.handledAt)}
            disabled={busy}
            onChange={(e) => run({ handled: e.target.checked })}
          />
          Handled
          {lead.handledAt && <span className="font-normal text-slate-500">on {new Date(lead.handledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>}
        </label>
        <a href={`mailto:${lead.email}?subject=${encodeURIComponent(replySubject)}`} className={`${BTN_QUIET} text-teal-aa hover:bg-teal-50`}>
          Reply by email
        </a>
        {!editing && (
          <button type="button" onClick={() => { setNote(lead.note); setEditing(true); }} className={`${BTN_QUIET} text-teal-aa hover:bg-teal-50`}>
            {lead.note ? "Edit note" : "Add note"}
          </button>
        )}
        <button type="button" onClick={onDelete} className={`${BTN_QUIET} ml-auto text-red-700 hover:bg-red-50`}>
          Delete
        </button>
      </div>
    </li>
  );
}
