"use client";

import { useState } from "react";
import { APPLICATION_STATUSES, RETENTION_MONTHS, type Application, type ApplicationStatus } from "@/lib/careers";

// The dashboard's Applications tab: every application that has come in, newest first, with its résumé to download
// and a status the team moves along as they deal with it.

const STATUS_LABELS: Record<ApplicationStatus, string> = { new: "New", reviewing: "In review", shortlisted: "Shortlisted", rejected: "Rejected" };
const STATUS_COLOURS: Record<ApplicationStatus, string> = {
  new: "bg-orange-50 text-orange-800 border-orange-200",
  reviewing: "bg-sky-50 text-sky-800 border-sky-200",
  shortlisted: "bg-teal-50 text-teal-800 border-teal-200",
  rejected: "bg-slate-100 text-slate-600 border-slate-200",
};

// Indian time, whatever the reader's own computer is set to (and the same on the server, which draws the page first).
const received = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" });

const quiet = "inline-flex items-center min-h-10 px-3 rounded-full text-sm font-semibold";

interface Props {
  list: Application[];
  /** How many applications there are in all, which can be more than `list` holds. */
  total: number;
  /** True once the dashboard holds all it can, and new applications are being turned away. */
  full: boolean;
  onChange: (received: { applications: Application[]; total: number; full: boolean }) => void;
}

/** An address is only ever put in a link in a form that can't add recipients, a subject or anything else to it. */
const mailto = (email: string, subject?: string) =>
  `mailto:${encodeURIComponent(email).replace(/%40/g, "@")}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

export default function Applications({ list, total, full, onChange }: Props) {
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [role, setRole] = useState("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  /** Asks the site for a change (or just the latest list) and shows what it now holds. */
  async function send(method: "GET" | "PATCH" | "DELETE", body: object | undefined, done: string) {
    setBusy(true);
    setError("");
    setNote("");
    const res = await fetch("/api/admin/careers/applications", {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (res?.status === 401) return window.location.reload();
    if (!res?.ok || !Array.isArray(data.applications)) return setError(data.error || "Couldn't reach the site. Check your connection and try again.");
    onChange({ applications: data.applications, total: Number(data.total) || data.applications.length, full: data.full === true });
    setNote(done);
  }

  function remove(item: Application) {
    if (!window.confirm(`Delete ${item.name}'s application and résumé for good?`)) return;
    send("DELETE", { id: item.id }, `${item.name}'s application was deleted.`);
  }

  /** Deletes everything the search and filters currently show, e.g. a batch of junk found by searching for its address. */
  function removeShown() {
    const ids = shown.map((item) => item.id);
    if (!window.confirm(`Delete these ${ids.length} applications and their résumés for good? This can't be undone.`)) return;
    send("DELETE", { ids }, `${ids.length} applications were deleted.`);
  }

  // Roles by the title they had when applied for, so applications for a since-deleted internship can still be found.
  const roles = [...new Map(list.map((item) => [item.roleId, item.roleTitle])).entries()];
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (item: Application) => {
    const text = `${item.name} ${item.email} ${item.phone} ${item.roleTitle} ${item.message}`.toLowerCase();
    return words.every((word) => text.includes(word));
  };
  const inRole = list.filter((item) => (role === "all" || item.roleId === role) && matches(item));
  const shown = inRole.filter((item) => status === "all" || item.status === status);
  const filtered = words.length > 0 || role !== "all" || status !== "all";

  /** Saves the applications on show as a spreadsheet file (CSV), for sharing or keeping outside the dashboard. */
  function exportCsv() {
    // Quoted throughout; a leading = + - or @ is defused so a spreadsheet never runs an applicant's text as a formula.
    const cell = (value: string) => `"${(/^[=+\-@\t\r]/.test(value) ? `'${value}` : value).replace(/"/g, '""')}"`;
    const rows = [
      ["Received", "Name", "Email", "Phone", "Internship", "Department", "Status", "Message"],
      ...shown.map((item) => [received(item.receivedAt), item.name, item.email, item.phone, item.roleTitle, item.department, STATUS_LABELS[item.status], item.message]),
    ];
    const csv = "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `internship-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
  const chip = (active: boolean) =>
    `min-h-9 px-3.5 rounded-full border text-sm font-semibold cursor-pointer transition-colors ${active ? "bg-brand-navy border-brand-navy text-white" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          type="search"
          aria-label="Search applications"
          placeholder="Search by name, email, phone or message"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-10 grow basis-64 rounded-full border border-slate-200 bg-white px-4 text-sm focus:outline-none focus:border-teal-aa focus:ring-2 focus:ring-teal-aa/30"
        />
        {roles.length > 1 && (
          <select
            aria-label="Internship"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="min-h-10 max-w-[16rem] rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
          >
            <option value="all">All internships</option>
            {roles.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
          </select>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => setStatus("all")} aria-pressed={status === "all"} className={chip(status === "all")}>
          All ({inRole.length})
        </button>
        {APPLICATION_STATUSES.map((item) => (
          <button key={item} type="button" onClick={() => setStatus(item)} aria-pressed={status === item} className={chip(status === item)}>
            {STATUS_LABELS[item]} ({inRole.filter((a) => a.status === item).length})
          </button>
        ))}
        <span className="grow" />
        {/* Only once the list has been narrowed, so it can't be mistaken for a way to clear a single application. */}
        {filtered && shown.length > 1 && (
          <button type="button" disabled={busy} onClick={removeShown} className={`${quiet} text-red-700 hover:bg-red-50 cursor-pointer disabled:opacity-60`}>
            Delete these ({shown.length})
          </button>
        )}
        <button type="button" disabled={shown.length === 0} onClick={exportCsv} className={`${quiet} text-slate-600 hover:bg-slate-100 cursor-pointer disabled:opacity-50 disabled:cursor-default`}>
          Export CSV
        </button>
        <button type="button" disabled={busy} onClick={() => send("GET", undefined, "Up to date.")} className={`${quiet} text-teal-aa hover:bg-teal-50 cursor-pointer disabled:opacity-60`}>
          Refresh
        </button>
      </div>

      <p role="status" className="mt-3 min-h-5 text-sm font-semibold text-teal-aa">{note}</p>
      {full && (
        <p role="alert" className="mb-2 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
          <strong>The dashboard is full, and new applications are being turned away.</strong> Delete applications you no
          longer need (search or filter, then &quot;Delete these&quot;) to make room.
        </p>
      )}
      {total > list.length && (
        <p className="mb-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3">
          Showing the newest {list.length} of {total} applications. Delete ones you no longer need to see the older ones.
        </p>
      )}
      {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}

      {list.length > 0 && (
        <p className="mb-3 text-xs text-slate-500">
          Applications and their résumés are deleted automatically {RETENTION_MONTHS} months after they arrive; export any you need to
          keep. Résumés come from people outside the company: open Word files in Protected View, and don&apos;t enable editing or macros.
        </p>
      )}
      {shown.length === 0 ? (
        <div className="mt-2 rounded-2xl bg-white border border-slate-200 p-8 text-center text-slate-600">
          {list.length === 0
            ? `No applications yet. They appear here as soon as someone applies on the Careers page, and are deleted automatically after ${RETENTION_MONTHS} months.`
            : "No applications match these filters."}
        </div>
      ) : (
        <ul className="mt-2 space-y-3">
          {shown.map((item) => (
            <li key={item.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <h2 className="font-heading text-lg font-bold leading-snug break-words">{item.name}</h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    <span className="font-semibold text-brand-navy">{item.roleTitle}</span> · {item.department}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* The server and the browser can word a time slightly differently; the browser's stands. */}
                  <span suppressHydrationWarning className="text-xs text-slate-500">{received(item.receivedAt)}</span>
                  <select
                    aria-label={`Status of ${item.name}'s application`}
                    value={item.status}
                    aria-busy={busy}
                    onChange={(e) => send("PATCH", { id: item.id, status: e.target.value }, `${item.name}: ${STATUS_LABELS[e.target.value as ApplicationStatus]}.`)}
                    className={`min-h-9 rounded-full border px-3 text-sm font-bold cursor-pointer ${STATUS_COLOURS[item.status]}`}
                  >
                    {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>

              <p className="mt-3 text-sm text-slate-700 flex flex-wrap gap-x-5 gap-y-1">
                <a href={mailto(item.email)} className="font-semibold text-teal-aa underline underline-offset-2 break-all">{item.email}</a>
                {item.phone && <a href={`tel:${item.phone.replace(/[^\d+]/g, "")}`} className="font-semibold text-teal-aa underline underline-offset-2">{item.phone}</a>}
              </p>
              {item.message && <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap break-words rounded-xl bg-slate-50 border border-slate-100 p-3">{item.message}</p>}

              <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1 -ml-3">
                <a href={`/api/admin/careers/applications/${item.id}/resume`} aria-label={`Download ${item.name}'s résumé`} className={`${quiet} text-teal-aa hover:bg-teal-50`}>
                  ↓ Download résumé
                </a>
                <a href={mailto(item.email, `Your application: ${item.roleTitle}`)} aria-label={`Reply to ${item.name} by email`} className={`${quiet} text-slate-600 hover:bg-slate-100`}>
                  Reply by email
                </a>
                <button type="button" disabled={busy} onClick={() => remove(item)} aria-label={`Delete ${item.name}'s application`} className={`${quiet} text-red-700 hover:bg-red-50 cursor-pointer ml-auto`}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
