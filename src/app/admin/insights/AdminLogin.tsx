"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      window.location.reload();
      return;
    }
    const body = res ? await res.json().catch(() => ({})) : {};
    setError(body.error || "Couldn't reach the site. Check your connection and try again.");
    setBusy(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={signIn} className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/branding/logo-horizontal.png" alt="ChemLife Innovations" className="h-10 w-auto" />
        <h1 className="font-heading text-2xl font-bold mt-6">Insights inbox</h1>
        <p className="text-slate-600 text-sm mt-1">Choose what appears on the Insights page.</p>
        <label htmlFor="password" className="block text-sm font-semibold mt-6">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "password-error" : undefined}
          className="mt-1.5 w-full min-h-12 rounded-xl border border-slate-300 px-4 text-base focus:outline-none focus:border-teal-aa focus:ring-2 focus:ring-teal-aa/30"
        />
        {error && <p id="password-error" role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full min-h-12 rounded-full bg-teal-aa hover:bg-teal-700 disabled:opacity-60 text-white font-bold transition-colors cursor-pointer"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
