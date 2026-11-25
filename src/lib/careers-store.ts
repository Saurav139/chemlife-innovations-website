import { INTERNSHIP_ROLES } from "@/lib/catalog";
import { getSetting, setSetting, storeConfigured } from "@/lib/insights-store/db";

// Which internships are closed to applications, chosen in the dashboard at /admin/careers and kept in the site's
// database (the Insights inbox's settings table). Every internship is open until someone closes it, and also when
// there's no database or it can't be reached: the Careers page must never go blank over a database problem.

const SETTING = "careers_closed_roles";
/** How long the Careers page and /api/careers go on an earlier answer before asking the database again. */
const FRESH_MS = 30_000;

const g = globalThis as unknown as { careersClosed?: { ids: string[]; at: number } };

const known = (ids: unknown): string[] =>
  Array.isArray(ids) ? INTERNSHIP_ROLES.map((role) => role.id).filter((id) => ids.includes(id)) : [];

/** The closed internships' ids, straight from the database. Throws if it can't be reached. */
export async function readClosedRoles(): Promise<string[]> {
  const ids = known(JSON.parse((await getSetting(SETTING)) ?? "[]"));
  g.careersClosed = { ids, at: Date.now() };
  return ids;
}

/** The closed internships' ids for the public pages: a recent answer if there is one, and none on any problem. */
export async function closedRoleIds(): Promise<string[]> {
  if (!storeConfigured()) return [];
  if (g.careersClosed && Date.now() - g.careersClosed.at < FRESH_MS) return g.careersClosed.ids;
  try {
    return await readClosedRoles();
  } catch (error) {
    console.error("[careers] Couldn't read which internships are open:", error instanceof Error ? error.message : error);
    g.careersClosed = { ids: g.careersClosed?.ids ?? [], at: Date.now() };
    return g.careersClosed.ids;
  }
}

/** Opens or closes one internship. Returns the closed ids afterwards. */
export async function setRoleOpen(id: string, open: boolean): Promise<string[]> {
  const closed = (await readClosedRoles()).filter((item) => item !== id);
  const ids = known(open ? closed : [...closed, id]);
  await setSetting(SETTING, JSON.stringify(ids));
  g.careersClosed = { ids, at: Date.now() };
  return ids;
}
