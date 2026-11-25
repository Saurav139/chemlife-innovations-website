// Internship application rules, shared by the Careers page and /api/careers so both check the same things.

/** Largest résumé accepted, in bytes (5 MB). The page's texts say "5 MB" too. */
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;
export const RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;
/** For the file picker's `accept`. */
export const RESUME_ACCEPT = [
  ...RESUME_EXTENSIONS,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");

/** Longest accepted value for each field, in characters. */
export const APPLICATION_LIMITS = { name: 100, email: 200, phone: 40, message: 3000 } as const;

export const hasResumeExtension = (filename: string) =>
  RESUME_EXTENSIONS.some((extension) => filename.toLowerCase().endsWith(extension));

/** Why /api/careers refused or couldn't send an application. */
export type ApplicationErrorCode =
  | "invalid" | "closed" | "resume_type" | "resume_size" | "captcha" | "rate_limited" | "unavailable" | "send_failed";

// ---------- Internships added in the dashboard (/admin/careers) ----------

/** The pictures a dashboard-made internship can use: the three that come with the site. */
export const ROLE_PICTURES = ["lab", "nutrition", "office"] as const;
export type RolePicture = (typeof ROLE_PICTURES)[number];

/** Longest text, most list entries and most internships the dashboard accepts. */
export const ROLE_LIMITS = { title: 100, department: 100, roleScope: 1500, listEntries: 10, listEntry: 200, roles: 20 } as const;

/** What the dashboard's form collects for an internship. Written once, in English, and shown as written in every language. */
export interface RoleContent {
  title: string;
  department: string;
  roleScope: string;
  qualifications: string[];
  requirements: string[];
  picture: RolePicture;
}

export interface CustomRole extends RoleContent {
  id: string;
}

/** A text box with one entry per line, as a list. */
export const linesOf = (text: string) => text.split("\n").map((line) => line.replace(/\s+/g, " ").trim()).filter(Boolean);

/** An internship's content, cleaned up, or null if something is missing or too long. */
export function parseRoleContent(body: unknown): RoleContent | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const text = (key: string) => (typeof b[key] === "string" ? (b[key] as string).replace(/[ \t]+/g, " ").trim() : "");
  const list = (key: string) => (Array.isArray(b[key]) ? linesOf((b[key] as unknown[]).filter((v) => typeof v === "string").join("\n")) : null);
  const role = {
    title: text("title").replace(/\s+/g, " "),
    department: text("department").replace(/\s+/g, " "),
    roleScope: text("roleScope"),
    qualifications: list("qualifications"),
    requirements: list("requirements"),
    picture: b.picture as RolePicture,
  };
  const listOk = (items: string[] | null): items is string[] =>
    items !== null && items.length <= ROLE_LIMITS.listEntries && items.every((item) => item.length <= ROLE_LIMITS.listEntry);
  const valid =
    role.title && role.department && role.roleScope &&
    role.title.length <= ROLE_LIMITS.title && role.department.length <= ROLE_LIMITS.department && role.roleScope.length <= ROLE_LIMITS.roleScope &&
    listOk(role.qualifications) && listOk(role.requirements) && ROLE_PICTURES.includes(role.picture);
  return valid ? (role as RoleContent) : null;
}
