"use client";

import { useState } from "react";

interface Role {
  id: string;
  title: string;
  department: string;
}

/** The dashboard: one switch per internship. A change is saved, and shows on the Careers page, straight away. */
export default function CareersRoles({ roles, initialClosed, demo }: { roles: Role[]; initialClosed: string[]; demo: boolean }) {
  const [closed, setClosed] = useState(initialClosed);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  async function setOpen(role: Role, open: boolean) {
    setSaving(role.id);
    setError("");
    setSaved("");
    const res = await fetch("/api/admin/careers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: role.id, open }),
    }).catch(() => null);
    const body = res ? await res.json().catch(() => ({})) : {};
    setSaving(null);
    if (res?.status === 401) return window.location.reload();
    if (!res?.ok || !Array.isArray(body.closed)) {
      setError(body.error || "Couldn't reach the site. Check your connection and try again.");
      return;
    }
    setClosed(body.closed);
    setSaved(`${role.title} is now ${open ? "open" : "closed"}.`);
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    window.location.reload();
  }

  const openCount = roles.length - closed.length;
  const headerLink = "inline-flex items-center min-h-10 px-3 rounded-full text-sm font-semibold";
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/branding/logo-horizontal.png" alt="ChemLife Innovations" className="h-8 w-auto shrink-0" />
            <span className="hidden sm:block h-6 w-px bg-slate-200" aria-hidden="true" />
            <h1 className="font-heading text-lg font-bold truncate">Internship roles</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a href="/admin/insights" className={`${headerLink} text-slate-600 hover:bg-slate-100`}>Insights inbox</a>
            <a href="/careers" target="_blank" rel="noopener" className={`hidden sm:inline-flex ${headerLink} text-teal-aa hover:bg-teal-50`}>
              View the Careers page ↗
            </a>
            {!demo && (
              <button type="button" onClick={signOut} className={`${headerLink} text-slate-600 hover:bg-slate-100 cursor-pointer`}>
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-4 sm:px-6 py-8">
        <p className="text-slate-700">
          <strong>{openCount} of {roles.length}</strong> internships are open. A closed internship is taken off the Careers
          page and can&apos;t be applied for. Changes are saved straight away and show on the site within half a minute.
        </p>

        <ul className="mt-6 space-y-3">
          {roles.map((role) => {
            const open = !closed.includes(role.id);
            return (
              <li key={role.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{role.department}</p>
                  <h2 className="font-heading text-lg font-bold leading-snug mt-0.5">{role.title}</h2>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-sm font-bold ${open ? "text-teal-aa" : "text-slate-500"}`}>{open ? "Open" : "Closed"}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={open}
                    aria-label={`${role.title}: open for applications`}
                    disabled={saving !== null}
                    onClick={() => setOpen(role, !open)}
                    className={`relative h-8 w-14 rounded-full transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-aa focus-visible:ring-offset-2 ${open ? "bg-teal-aa" : "bg-slate-300"}`}
                  >
                    <span aria-hidden="true" className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${open ? "translate-x-6" : ""}`} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <p role="status" className="mt-4 min-h-6 text-sm font-semibold text-teal-aa">{saved}</p>
        {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}
      </main>
    </div>
  );
}
