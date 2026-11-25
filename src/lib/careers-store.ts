import { randomBytes } from "node:crypto";
import { INTERNSHIP_ROLES, slugify } from "@/lib/catalog";
import { ROLE_LIMITS, parseRoleContent, type CustomRole, type RoleContent } from "@/lib/careers";
import { getSetting, setSetting, storeConfigured } from "@/lib/insights-store/db";

// What the dashboard at /admin/careers controls, kept in the site's database (the Insights inbox's settings table).
// Every internship can be opened, closed, rewritten and deleted there, and new ones added. The three in
// src/lib/catalog.ts come with the site, translated into every language; one that's rewritten in the dashboard shows
// as written there instead, and one that's deleted is left out. With no database, or one that can't be reached, the
// Careers page shows the built-in internships, all open: it must never go blank over a database problem.

const CLOSED = "careers_closed_roles";
const CUSTOM = "careers_custom_roles";
const REMOVED = "careers_removed_roles";
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

const BUILT_IN = INTERNSHIP_ROLES.map((role) => role.id);
const EMPTY: CareersState = { closed: [], custom: [], removed: [] };

const g = globalThis as unknown as { careersState?: CareersState & { at: number } };

function json(text: string | null): unknown {
  try {
    return JSON.parse(text ?? "[]");
  } catch {
    return [];
  }
}

function customFrom(value: unknown): CustomRole[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const content = parseRoleContent(item);
    const idOk = typeof item?.id === "string" && (/^custom-[a-z0-9-]+$/.test(item.id) || BUILT_IN.includes(item.id));
    return content && idOk ? [{ id: item.id as string, ...content }] : [];
  });
}

const remember = (state: CareersState): CareersState => {
  g.careersState = { ...state, at: Date.now() };
  return state;
};

/** Straight from the database. Throws if it can't be reached. */
export async function readCareers(): Promise<CareersState> {
  const [closedText, customText, removedText] = await Promise.all([getSetting(CLOSED), getSetting(CUSTOM), getSetting(REMOVED)]);
  const savedRemoved = json(removedText);
  const removed = Array.isArray(savedRemoved) ? BUILT_IN.filter((id) => savedRemoved.includes(id)) : [];
  const custom = customFrom(json(customText)).filter((role) => !removed.includes(role.id));
  const ids = [...BUILT_IN.filter((id) => !removed.includes(id)), ...custom.map((role) => role.id)];
  const savedClosed = json(closedText);
  return remember({ closed: Array.isArray(savedClosed) ? ids.filter((id) => savedClosed.includes(id)) : [], custom, removed });
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

/** Every internship's id, with its name and department in English for the application email. */
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

async function save(state: CareersState): Promise<CareersState> {
  await Promise.all([
    setSetting(CLOSED, JSON.stringify(state.closed)),
    setSetting(CUSTOM, JSON.stringify(state.custom)),
    setSetting(REMOVED, JSON.stringify(state.removed)),
  ]);
  return remember(state);
}

const exists = (state: CareersState, id: string) => roleNames(state).some((role) => role.id === id);

/** Opens or closes one internship. Null if there's no internship with that id. */
export async function setRoleOpen(id: string, open: boolean): Promise<CareersState | null> {
  const state = await readCareers();
  if (!exists(state, id)) return null;
  const closed = state.closed.filter((item) => item !== id);
  return save({ ...state, closed: open ? closed : [...closed, id] });
}

/** Adds an internship, open from the start. Null once the dashboard holds as many added ones as it allows. */
export async function addRole(content: RoleContent): Promise<CareersState | null> {
  const state = await readCareers();
  if (state.custom.filter((role) => !BUILT_IN.includes(role.id)).length >= ROLE_LIMITS.roles) return null;
  // The id is also the internship's link (/careers#role-…), so it reads like the title and never changes afterwards.
  const id = `custom-${slugify(content.title).slice(0, 40) || "role"}-${randomBytes(2).toString("hex")}`;
  return save({ ...state, custom: [...state.custom, { id, ...content }] });
}

/** Rewrites an internship. A built-in one shows as written here from then on, in every language. Null if there's no
 *  internship with that id. */
export async function updateRole(id: string, content: RoleContent): Promise<CareersState | null> {
  const state = await readCareers();
  if (!exists(state, id)) return null;
  const custom = state.custom.some((role) => role.id === id)
    ? state.custom.map((role) => (role.id === id ? { id, ...content } : role))
    : [...state.custom, { id, ...content }];
  return save({ ...state, custom });
}

/** Removes an internship for good. Null if there's no internship with that id. */
export async function deleteRole(id: string): Promise<CareersState | null> {
  const state = await readCareers();
  if (!exists(state, id)) return null;
  return save({
    closed: state.closed.filter((item) => item !== id),
    custom: state.custom.filter((role) => role.id !== id),
    removed: BUILT_IN.includes(id) ? [...state.removed, id] : state.removed,
  });
}
