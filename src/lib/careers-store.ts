import { randomBytes } from "node:crypto";
import { INTERNSHIP_ROLES, slugify } from "@/lib/catalog";
import { ROLE_LIMITS, parseRoleContent, type CustomRole, type RoleContent } from "@/lib/careers";
import { getSetting, setSetting, storeConfigured } from "@/lib/insights-store/db";

// What the dashboard at /admin/careers controls, kept in the site's database (the Insights inbox's settings table):
// which internships are closed to applications, and the internships added there (the three in src/lib/catalog.ts
// come with the site). Every internship is open until someone closes it. With no database, or one that can't be
// reached, the Careers page shows the built-in internships, all open: it must never go blank over a database problem.

const CLOSED = "careers_closed_roles";
const CUSTOM = "careers_custom_roles";
/** How long the Careers page and /api/careers go on an earlier answer before asking the database again. */
const FRESH_MS = 30_000;

export interface CareersState {
  /** Ids of the internships closed to applications. */
  closed: string[];
  /** The internships added in the dashboard, in the order they were added. */
  custom: CustomRole[];
}

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
    return content && typeof item.id === "string" && /^custom-[a-z0-9-]+$/.test(item.id) ? [{ id: item.id as string, ...content }] : [];
  });
}

const remember = (state: CareersState): CareersState => {
  g.careersState = { ...state, at: Date.now() };
  return state;
};

/** Straight from the database. Throws if it can't be reached. */
export async function readCareers(): Promise<CareersState> {
  const [closedText, customText] = await Promise.all([getSetting(CLOSED), getSetting(CUSTOM)]);
  const custom = customFrom(json(customText));
  const ids = [...INTERNSHIP_ROLES.map((role) => role.id), ...custom.map((role) => role.id)];
  const saved = json(closedText);
  return remember({ closed: Array.isArray(saved) ? ids.filter((id) => saved.includes(id)) : [], custom });
}

/** For the public pages: a recent answer if there is one, the last known one on a problem, and nothing closed or added before the first. */
export async function careersState(): Promise<CareersState> {
  if (!storeConfigured()) return { closed: [], custom: [] };
  if (g.careersState && Date.now() - g.careersState.at < FRESH_MS) return g.careersState;
  try {
    return await readCareers();
  } catch (error) {
    console.error("[careers] Couldn't read the internships:", error instanceof Error ? error.message : error);
    return remember({ closed: g.careersState?.closed ?? [], custom: g.careersState?.custom ?? [] });
  }
}

/** Every internship's id, with its name and department in English for the application email. */
export function roleNames(state: CareersState): { id: string; title: string; department: string }[] {
  return [
    ...INTERNSHIP_ROLES.map((role) => ({ id: role.id, title: role.englishTitle, department: role.englishDepartment })),
    ...state.custom.map((role) => ({ id: role.id, title: role.title, department: role.department })),
  ];
}

async function save(state: CareersState): Promise<CareersState> {
  await Promise.all([setSetting(CLOSED, JSON.stringify(state.closed)), setSetting(CUSTOM, JSON.stringify(state.custom))]);
  return remember(state);
}

/** Opens or closes one internship. Null if there's no internship with that id. */
export async function setRoleOpen(id: string, open: boolean): Promise<CareersState | null> {
  const state = await readCareers();
  if (!roleNames(state).some((role) => role.id === id)) return null;
  const closed = state.closed.filter((item) => item !== id);
  return save({ ...state, closed: open ? closed : [...closed, id] });
}

/** Adds an internship, open from the start. Null once the dashboard holds as many as it allows. */
export async function addRole(content: RoleContent): Promise<CareersState | null> {
  const state = await readCareers();
  if (state.custom.length >= ROLE_LIMITS.roles) return null;
  // The id is also the internship's link (/careers#role-…), so it reads like the title and never changes afterwards.
  const id = `custom-${slugify(content.title).slice(0, 40) || "role"}-${randomBytes(2).toString("hex")}`;
  return save({ ...state, custom: [...state.custom, { id, ...content }] });
}

/** Changes an added internship's content. Null if it isn't one of the added ones. */
export async function updateRole(id: string, content: RoleContent): Promise<CareersState | null> {
  const state = await readCareers();
  if (!state.custom.some((role) => role.id === id)) return null;
  return save({ ...state, custom: state.custom.map((role) => (role.id === id ? { id, ...content } : role)) });
}

/** Removes an added internship for good. Null if it isn't one of the added ones. */
export async function deleteRole(id: string): Promise<CareersState | null> {
  const state = await readCareers();
  if (!state.custom.some((role) => role.id === id)) return null;
  return save({ closed: state.closed.filter((item) => item !== id), custom: state.custom.filter((role) => role.id !== id) });
}
