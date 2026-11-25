"use client";

import { useState } from "react";
import { ROLE_LIMITS, ROLE_PICTURES, linesOf, type CustomRole, type RoleContent, type RolePicture } from "@/lib/careers";
import { Images } from "@/lib/assets";

// The dashboard: every internship has a switch, Edit and Delete, and there's a form to add one. The three that come
// with the site are translated into every language until they're edited here; after that they show as written here.

interface State {
  closed: string[];
  /** Added internships, and rewritten built-in ones (under the built-in id). */
  custom: CustomRole[];
  /** Ids of deleted built-in internships. */
  removed: string[];
}
/** The form's boxes; the two lists are typed one entry per line. */
interface Draft {
  title: string;
  department: string;
  roleScope: string;
  qualifications: string;
  requirements: string;
  picture: RolePicture;
}

const PICTURES: Record<RolePicture, { file: string; label: string }> = {
  lab: { file: Images.careers.researchIntern, label: "Laboratory" },
  nutrition: { file: Images.careers.animalNutrition, label: "Feed and nutrition" },
  office: { file: Images.careers.hrMarketing, label: "Office" },
};
const EMPTY: Draft = { title: "", department: "", roleScope: "", qualifications: "", requirements: "", picture: "lab" };
const draftOf = (role: CustomRole): Draft => ({ ...role, qualifications: role.qualifications.join("\n"), requirements: role.requirements.join("\n") });

const label = "block text-sm font-semibold";
const box = "mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-base focus:outline-none focus:border-teal-aa focus:ring-2 focus:ring-teal-aa/30";
const hint = "text-xs text-slate-500 mt-1";
const quiet = "inline-flex items-center min-h-10 px-3 rounded-full text-sm font-semibold";

export default function CareersRoles({ builtIn, initial, demo }: { builtIn: CustomRole[]; initial: State; demo: boolean }) {
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  // The form: closed, adding ("new"), or changing the added internship with this id.
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [formError, setFormError] = useState("");

  /** Sends one change. True when it was saved; the dashboard then shows what the site now holds. */
  async function send(method: string, body: object, done: string, onError: (message: string) => void = setError): Promise<boolean> {
    setBusy(true);
    setError("");
    setFormError("");
    setSaved("");
    const res = await fetch("/api/admin/careers", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (res?.status === 401) {
      window.location.reload();
      return false;
    }
    if (!res?.ok || !Array.isArray(data.closed) || !Array.isArray(data.custom) || !Array.isArray(data.removed)) {
      onError(data.error || "Couldn't reach the site. Check your connection and try again.");
      return false;
    }
    setState({ closed: data.closed, custom: data.custom, removed: data.removed });
    setSaved(done);
    return true;
  }

  function openForm(role?: CustomRole) {
    setEditing(role ? role.id : "new");
    window.scrollTo({ top: 0 });
    setDraft(role ? draftOf(role) : EMPTY);
    setFormError("");
    setSaved("");
  }

  async function saveForm(event: React.FormEvent) {
    event.preventDefault();
    const content: RoleContent = { ...draft, qualifications: linesOf(draft.qualifications), requirements: linesOf(draft.requirements) };
    const tooMany = [content.qualifications, content.requirements].some((list) => list.length > ROLE_LIMITS.listEntries);
    const tooLong = [...content.qualifications, ...content.requirements].some((entry) => entry.length > ROLE_LIMITS.listEntry);
    if (tooMany) return setFormError(`Each list can have up to ${ROLE_LIMITS.listEntries} lines.`);
    if (tooLong) return setFormError(`Keep each line of the lists under ${ROLE_LIMITS.listEntry} characters.`);
    const ok = editing === "new"
      ? await send("POST", content, `${content.title.trim()} was added and is open.`, setFormError)
      : await send("PATCH", { id: editing, ...content }, `${content.title.trim()} was updated.`, setFormError);
    if (ok) setEditing(null);
  }

  async function remove(role: CustomRole) {
    if (!window.confirm(`Delete "${role.title}" for good? It will be taken off the Careers page. To hide it for now, close it instead.`)) return;
    if (await send("DELETE", { id: role.id }, `${role.title} was deleted.`) && editing === role.id) setEditing(null);
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    window.location.reload();
  }

  const set = (key: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));
  // Built-in internships first (as rewritten here, or as the site has them), then the added ones.
  const builtInIds = builtIn.map((role) => role.id);
  const roles = [
    ...builtIn.filter((role) => !state.removed.includes(role.id)).map((role) => {
      const rewritten = state.custom.find((item) => item.id === role.id);
      return { role: rewritten ?? role, translated: !rewritten };
    }),
    ...state.custom.filter((role) => !builtInIds.includes(role.id)).map((role) => ({ role, translated: false })),
  ];
  const openCount = roles.filter(({ role }) => !state.closed.includes(role.id)).length;
  const full = state.custom.filter((role) => !builtInIds.includes(role.id)).length >= ROLE_LIMITS.roles;
  const editingTranslated = roles.some(({ role, translated }) => role.id === editing && translated);

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
            <a href="/admin/insights" className={`${quiet} text-slate-600 hover:bg-slate-100`}>Insights inbox</a>
            <a href="/careers" target="_blank" rel="noopener" className={`hidden sm:inline-flex ${quiet} text-teal-aa hover:bg-teal-50`}>
              View the Careers page ↗
            </a>
            {!demo && (
              <button type="button" onClick={signOut} className={`${quiet} text-slate-600 hover:bg-slate-100 cursor-pointer`}>
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <p className="text-slate-700">
            <strong>{openCount} of {roles.length}</strong> internships are open. A closed internship is taken off the Careers
            page and can&apos;t be applied for. Changes are saved straight away and show on the site within half a minute.
          </p>
          {editing === null && (
            <button
              type="button"
              onClick={() => openForm()}
              disabled={full}
              title={full ? "The dashboard is full. Delete an internship you no longer need first." : undefined}
              className="shrink-0 min-h-11 px-5 rounded-full bg-teal-aa hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-bold cursor-pointer"
            >
              + Add an internship
            </button>
          )}
        </div>

        <p role="status" className="mt-4 min-h-6 text-sm font-semibold text-teal-aa">{saved}</p>
        {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}

        {editing !== null && (
          <form onSubmit={saveForm} className="mt-2 mb-6 rounded-2xl bg-white border-2 border-teal-aa shadow-sm p-5 sm:p-6 space-y-4">
            <h2 className="font-heading text-xl font-bold">{editing === "new" ? "Add an internship" : "Change this internship"}</h2>
            <p className="text-sm text-slate-600 -mt-2">
              Write it in English. It appears as written on every language version of the Careers page.
            </p>
            {editingTranslated && (
              <p className="rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3">
                This internship is currently translated into all seven languages. Once you save changes, the other
                languages show it in English, as written here.
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="role-title" className={label}>Title</label>
                <input id="role-title" required maxLength={ROLE_LIMITS.title} value={draft.title} onChange={set("title")} placeholder="e.g. Quality Control Intern" className={box} />
              </div>
              <div>
                <label htmlFor="role-department" className={label}>Department</label>
                <input id="role-department" required maxLength={ROLE_LIMITS.department} value={draft.department} onChange={set("department")} placeholder="e.g. Quality Assurance" className={box} />
              </div>
            </div>

            <div>
              <label htmlFor="role-scope" className={label}>Description</label>
              <textarea id="role-scope" required rows={4} maxLength={ROLE_LIMITS.roleScope} value={draft.roleScope} onChange={set("roleScope")} className={box} />
              <p className={hint}>What the intern will do, in a few sentences.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="role-qualifications" className={label}>Required qualifications</label>
                <textarea id="role-qualifications" rows={4} value={draft.qualifications} onChange={set("qualifications")} className={box} />
                <p className={hint}>One per line. Leave empty to leave this list out.</p>
              </div>
              <div>
                <label htmlFor="role-requirements" className={label}>Eligible fields &amp; backgrounds</label>
                <textarea id="role-requirements" rows={4} value={draft.requirements} onChange={set("requirements")} className={box} />
                <p className={hint}>One per line, e.g. a degree. Leave empty to leave this list out.</p>
              </div>
            </div>

            <fieldset>
              <legend className={label}>Picture</legend>
              <div className="mt-1.5 grid grid-cols-3 gap-3">
                {ROLE_PICTURES.map((picture) => (
                  <label key={picture} className={`block rounded-xl border-2 p-1.5 cursor-pointer ${draft.picture === picture ? "border-teal-aa bg-teal-50" : "border-slate-200 hover:border-slate-300"}`}>
                    <input type="radio" name="role-picture" value={picture} checked={draft.picture === picture} onChange={() => setDraft((prev) => ({ ...prev, picture }))} className="sr-only" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={PICTURES[picture].file} alt="" loading="lazy" className="h-20 w-full rounded-lg object-cover" />
                    <span className="block text-xs font-semibold text-center mt-1.5">{PICTURES[picture].label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {formError && <p role="alert" className="text-sm font-semibold text-red-600">{formError}</p>}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button type="submit" disabled={busy} className="min-h-11 px-6 rounded-full bg-teal-aa hover:bg-teal-700 disabled:opacity-60 text-white text-sm font-bold cursor-pointer">
                {busy ? "Saving…" : editing === "new" ? "Add to the Careers page" : "Save changes"}
              </button>
              <button type="button" onClick={() => setEditing(null)} disabled={busy} className={`${quiet} text-slate-600 hover:bg-slate-100 cursor-pointer`}>
                Cancel
              </button>
              {editing === "new" && <p className="text-xs text-slate-500">It goes on the Careers page, open for applications, as soon as you add it.</p>}
            </div>
          </form>
        )}

        <ul className="mt-2 space-y-3">
          {roles.map(({ role, translated }) => {
            const open = !state.closed.includes(role.id);
            return (
              <li key={role.id} className={`rounded-2xl bg-white border shadow-sm p-5 ${editing === role.id ? "border-teal-aa" : "border-slate-200"}`}>
                <div className="flex items-center justify-between gap-4">
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
                      disabled={busy}
                      onClick={() => send("PUT", { id: role.id, open: !open }, `${role.title} is now ${open ? "closed" : "open"}.`)}
                      className={`relative h-8 w-14 rounded-full transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-aa focus-visible:ring-offset-2 ${open ? "bg-teal-aa" : "bg-slate-300"}`}
                    >
                      <span aria-hidden="true" className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${open ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-1 -ml-3">
                  <button type="button" disabled={busy} onClick={() => openForm(role)} className={`${quiet} text-teal-aa hover:bg-teal-50 cursor-pointer`}>
                    Edit
                  </button>
                  <button type="button" disabled={busy} onClick={() => remove(role)} className={`${quiet} text-red-700 hover:bg-red-50 cursor-pointer`}>
                    Delete
                  </button>
                  <span className="ml-auto text-xs text-slate-500">{translated ? "In all seven languages" : "In English, as written here"}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
