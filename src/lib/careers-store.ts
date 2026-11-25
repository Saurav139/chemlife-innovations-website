import { randomBytes } from "node:crypto";
import type { RowDataPacket } from "mysql2/promise";
import { INTERNSHIP_ROLES, slugify } from "@/lib/catalog";
import { ROLE_LIMITS, ROLES_MAX_BYTES, parseRoleContent, type CustomRole, type RoleContent } from "@/lib/careers";
import { database, getSetting, storeConfigured } from "@/lib/insights-store/db";

// What the dashboard at /admin/careers controls, kept in the site's database (one row of the Insights inbox's settings
// table). Every internship can be opened, closed, rewritten and deleted there, and new ones added. The three in
// src/lib/catalog.ts come with the site, translated into every language; one that's rewritten in the dashboard shows
// as written there instead, and one that's deleted is left out. With no database, or one that can't be reached, the
// Careers page shows the built-in internships, all open: it must never go blank over a database problem.

const SETTING = "careers_state";
// Before November 2026 the three parts were kept in a row each; read once, until the first change saves the one row.
const LEGACY = { closed: "careers_closed_roles", custom: "careers_custom_roles", removed: "careers_removed_roles" };
/** How long the Careers page and /api/careers go on an earlier answer before asking the database again. */
const FRESH_MS = 30_000;

export interface CareersState {
  /** Ids of the internships closed to applications. */
  closed: string[];
  /** Content written in the dashboard: the internships added there (ids start "custom-"), in the order they were
   *  added, and rewritten built-in ones (under the built-in id). */
  custom: CustomRole[];
  /** Ids of the built-in internships deleted in the dashboard. */
  removed: string[];
}

/** Why a change couldn't be made: no internship with that id, or no room left for it. */
export type ChangeRefused = "missing" | "full";

const BUILT_IN = INTERNSHIP_ROLES.map((role) => role.id);
const EMPTY: CareersState = { closed: [], custom: [], removed: [] };

const g = globalThis as unknown as { careersState?: CareersState & { at: number } };

function json(text: string | null | undefined): unknown {
  try {
    return JSON.parse(text || "null");
  } catch {
    return null;
  }
}

/** A stored value as a state the site can trust: unknown ids, broken entries and anything unexpected are dropped. */
function tidy(value: unknown): CareersState {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const removed = Array.isArray(v.removed) ? BUILT_IN.filter((id) => (v.removed as unknown[]).includes(id)) : [];
  const custom = (Array.isArray(v.custom) ? v.custom : []).flatMap((item) => {
    const content = parseRoleContent(item);
    const id = (item as { id?: unknown } | null)?.id;
    const idOk = typeof id === "string" && (/^custom-[a-z0-9-]+$/.test(id) || BUILT_IN.includes(id)) && !removed.includes(id);
    return content && idOk ? [{ id, ...content }] : [];
  });
  const ids = [...BUILT_IN.filter((id) => !removed.includes(id)), ...custom.map((role) => role.id)];
  return { closed: Array.isArray(v.closed) ? ids.filter((id) => (v.closed as unknown[]).includes(id)) : [], custom, removed };
}

const remember = (state: CareersState): CareersState => {
  g.careersState = { ...state, at: Date.now() };
  return state;
};

async function legacyState(): Promise<CareersState> {
  const [closed, custom, removed] = await Promise.all([getSetting(LEGACY.closed), getSetting(LEGACY.custom), getSetting(LEGACY.removed)]);
  return tidy({ closed: json(closed), custom: json(custom), removed: json(removed) });
}

/** Straight from the database. Throws if it can't be reached. */
export async function readCareers(): Promise<CareersState> {
  const saved = await getSetting(SETTING);
  return remember(saved === null ? await legacyState() : tidy(json(saved)));
}

/** For the public pages: a recent answer if there is one, the last known one on a problem, and the built-in internships untouched before the first. */
export async function careersState(): Promise<CareersState> {
  if (!storeConfigured()) return EMPTY;
  if (g.careersState && Date.now() - g.careersState.at < FRESH_MS) return g.careersState;
  try {
    return await readCareers();
  } catch (error) {
    console.error("[careers] Couldn't read the internships:", error instanceof Error ? error.message : error);
    return remember(g.careersState ? { closed: g.careersState.closed, custom: g.careersState.custom, removed: g.careersState.removed } : EMPTY);
  }
}

/** Every internship's id, with its name and department in English for the dashboard's list of applications. */
export function roleNames(state: CareersState): { id: string; title: string; department: string }[] {
  const written = (id: string) => state.custom.find((role) => role.id === id);
  return [
    ...INTERNSHIP_ROLES.filter((role) => !state.removed.includes(role.id)).map((role) => ({
      id: role.id,
      title: written(role.id)?.title ?? role.englishTitle,
      department: written(role.id)?.department ?? role.englishDepartment,
    })),
    ...state.custom.filter((role) => !BUILT_IN.includes(role.id)).map((role) => ({ id: role.id, title: role.title, department: role.department })),
  ];
}

const exists = (state: CareersState, id: string) => roleNames(state).some((role) => role.id === id);

/**
 * Makes one change to what the dashboard holds. The row is locked while it's read, changed and written, so two people
 * saving at once (or two server processes) can't overwrite each other, and a change is saved whole or not at all.
 */
async function change(make: (state: CareersState) => CareersState | ChangeRefused): Promise<CareersState | ChangeRefused> {
  const conn = await (await database()).getConnection();
  try {
    await conn.beginTransaction();
    // The row has to exist to be locked. A brand-new one starts from the three old rows, if there are any.
    const [first] = await conn.execute<RowDataPacket[]>("SELECT 1 FROM insight_settings WHERE name = ?", [SETTING]);
    if (first.length === 0) {
      await conn.execute("INSERT IGNORE INTO insight_settings (name, value) VALUES (?, ?)", [SETTING, JSON.stringify(await legacyState())]);
    }
    const [rows] = await conn.execute<RowDataPacket[]>("SELECT value FROM insight_settings WHERE name = ? FOR UPDATE", [SETTING]);
    const made = make(tidy(json(rows[0]?.value)));
    if (typeof made === "string") {
      await conn.rollback();
      return made;
    }
    const next = tidy(made);
    const value = JSON.stringify(next);
    if (Buffer.byteLength(value) > ROLES_MAX_BYTES) {
      await conn.rollback();
      return "full";
    }
    await conn.execute("UPDATE insight_settings SET value = ? WHERE name = ?", [value, SETTING]);
    await conn.commit();
    return remember(next);
  } catch (error) {
    await conn.rollback().catch(() => undefined);
    throw error;
  } finally {
    conn.release();
  }
}

/** Opens or closes one internship. */
export function setRoleOpen(id: string, open: boolean) {
  return change((state) => {
    if (!exists(state, id)) return "missing";
    const closed = state.closed.filter((item) => item !== id);
    return { ...state, closed: open ? closed : [...closed, id] };
  });
}

/** Adds an internship, open from the start. */
export function addRole(content: RoleContent) {
  return change((state) => {
    if (state.custom.filter((role) => !BUILT_IN.includes(role.id)).length >= ROLE_LIMITS.roles) return "full";
    // The id is also the internship's link (/careers/apply/…), so it reads like the title and never changes afterwards.
    const id = `custom-${slugify(content.title).slice(0, 40) || "role"}-${randomBytes(2).toString("hex")}`;
    return { ...state, custom: [...state.custom, { id, ...content }] };
  });
}

/** Rewrites an internship. A built-in one shows as written here from then on, in every language. */
export function updateRole(id: string, content: RoleContent) {
  return change((state) => {
    if (!exists(state, id)) return "missing";
    const custom = state.custom.some((role) => role.id === id)
      ? state.custom.map((role) => (role.id === id ? { id, ...content } : role))
      : [...state.custom, { id, ...content }];
    return { ...state, custom };
  });
}

/** Removes an internship for good. */
export function deleteRole(id: string) {
  return change((state) => {
    if (!exists(state, id)) return "missing";
    return {
      closed: state.closed.filter((item) => item !== id),
      custom: state.custom.filter((role) => role.id !== id),
      removed: BUILT_IN.includes(id) ? [...state.removed, id] : state.removed,
    };
  });
}
