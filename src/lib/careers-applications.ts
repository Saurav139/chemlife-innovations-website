import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { APPLICATION_STATUSES, RETENTION_MONTHS, type Application, type ApplicationStatus } from "@/lib/careers";
import { database } from "@/lib/insights-store/db";

// Internship applications, kept in the site's database with their résumés and shown in the dashboard at
// /admin/careers. The table is created on first use.

// Named for this version of the table's set-up, so a running server sets the table up again after an update.
const g = globalThis as unknown as {
  careerApplicationsReady?: Promise<void>;
  careerApplicationsTidied?: number;
  careerApplicationsRoom?: { full: boolean; at: number };
};

/** The most the dashboard keeps: this many applications, or this much résumé data. Past either, new applications are
 *  turned away (the form offers the email address instead) until some are deleted, so that junk sent by a script
 *  can't fill the site's database, which the Insights page shares. */
export const STORAGE_LIMITS = { applications: 2000, bytes: 1024 * 1024 * 1024 } as const;

/** Whether the dashboard has reached STORAGE_LIMITS. Looked up at most once a minute; false if it can't be told. */
export async function storageFull(): Promise<boolean> {
  if (g.careerApplicationsRoom && Date.now() - g.careerApplicationsRoom.at < 60_000) return g.careerApplicationsRoom.full;
  try {
    const [[row]] = await (await db()).query<RowDataPacket[]>("SELECT COUNT(*) AS n, COALESCE(SUM(LENGTH(resume)), 0) AS bytes FROM career_applications");
    const full = Number(row.n) >= STORAGE_LIMITS.applications || Number(row.bytes) >= STORAGE_LIMITS.bytes;
    g.careerApplicationsRoom = { full, at: Date.now() };
    return full;
  } catch {
    return false;
  }
}

async function db() {
  const pool = await database();
  g.careerApplicationsReady ??= pool
    .query(`CREATE TABLE IF NOT EXISTS career_applications (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      role_id VARCHAR(80) NOT NULL,
      role_title VARCHAR(200) NOT NULL,
      department VARCHAR(200) NOT NULL,
      name VARCHAR(200) NOT NULL,
      email VARCHAR(300) NOT NULL,
      phone VARCHAR(80) NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      resume_name VARCHAR(300) NOT NULL,
      resume MEDIUMBLOB NOT NULL,
      status VARCHAR(16) NOT NULL DEFAULT 'new',
      received_at DATETIME NOT NULL,
      KEY by_time (received_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)
    .then(async () => {
      // Added after the first version: what makes an application the same one sent twice (see saveApplication).
      // MySQL has no ADD COLUMN IF NOT EXISTS, so look first.
      const [column] = await pool.query<RowDataPacket[]>(
        "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'career_applications' AND COLUMN_NAME = 'fingerprint'",
      );
      if (column.length === 0) await pool.query("ALTER TABLE career_applications ADD COLUMN fingerprint CHAR(64) NULL, ADD UNIQUE KEY one_per_form (fingerprint)");
    })
    .catch((error) => {
      g.careerApplicationsReady = undefined;
      throw error;
    });
  await g.careerApplicationsReady;
  return pool;
}

/**
 * Deletes applications (and their résumés) older than RETENTION_MONTHS. There's no timer on the server, so this runs
 * when the dashboard is opened and when an application arrives, at most once a day per server process.
 */
export async function deleteOldApplications(): Promise<void> {
  if (g.careerApplicationsTidied && Date.now() - g.careerApplicationsTidied < 24 * 3_600_000) return;
  g.careerApplicationsTidied = Date.now();
  try {
    const [result] = await (await db()).execute<ResultSetHeader>(
      "DELETE FROM career_applications WHERE received_at < DATE_SUB(?, INTERVAL ? MONTH)",
      [new Date(), RETENTION_MONTHS],
    );
    if (result.affectedRows > 0) console.info(`[careers] Deleted ${result.affectedRows} application(s) older than ${RETENTION_MONTHS} months.`);
  } catch (error) {
    // Try again next time rather than in a day.
    g.careerApplicationsTidied = undefined;
    console.error("[careers] Couldn't delete old applications:", error instanceof Error ? error.message : error);
  }
}

export interface NewApplication {
  roleId: string;
  roleTitle: string;
  department: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  resumeName: string;
  resume: Buffer;
  /** The same for every code sent for one filled-in form, so that form can only ever become one application. */
  fingerprint: string;
}

/** Keeps an application. Saving the same form again (a second code, a repeated or doubled request) changes nothing;
 *  false says it was already there. */
export async function saveApplication(a: NewApplication): Promise<boolean> {
  const [result] = await (await db()).execute<ResultSetHeader>(
    `INSERT IGNORE INTO career_applications (role_id, role_title, department, name, email, phone, message, resume_name, resume, status, received_at, fingerprint)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?)`,
    [a.roleId, a.roleTitle, a.department, a.name, a.email, a.phone, a.message, a.resumeName, a.resume, new Date(), a.fingerprint],
  );
  // Not waited for: the applicant's answer doesn't depend on it.
  void deleteOldApplications();
  return result.affectedRows > 0;
}

/** The most the dashboard lists at once; `total` tells it when there are more. */
export const LIST_LIMIT = 500;

/** The newest applications first, without their résumés; how many there are in all; and whether the dashboard is full. */
export async function listApplications(limit = LIST_LIMIT): Promise<{ applications: Application[]; total: number; full: boolean }> {
  await deleteOldApplications();
  const pool = await db();
  const [[count]] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM career_applications");
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, role_id, role_title, department, name, email, phone, message, resume_name, status, received_at
     FROM career_applications ORDER BY received_at DESC, id DESC LIMIT ?`,
    [limit],
  );
  const applications = rows.map((row) => ({
    id: row.id,
    roleId: row.role_id,
    roleTitle: row.role_title,
    department: row.department,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    resumeName: row.resume_name,
    status: (APPLICATION_STATUSES as readonly string[]).includes(row.status) ? (row.status as ApplicationStatus) : "new",
    receivedAt: new Date(row.received_at).toISOString(),
  }));
  // Asked afresh, so the dashboard's warning goes as soon as room has been made.
  g.careerApplicationsRoom = undefined;
  return { applications, total: Number(count.total), full: await storageFull() };
}

export async function readResume(id: number): Promise<{ name: string; data: Buffer } | null> {
  const [rows] = await (await db()).execute<RowDataPacket[]>("SELECT resume_name, resume FROM career_applications WHERE id = ?", [id]);
  return rows[0] ? { name: rows[0].resume_name, data: rows[0].resume as Buffer } : null;
}

/** False if there's no application with that id. */
export async function setApplicationStatus(id: number, status: ApplicationStatus): Promise<boolean> {
  const [result] = await (await db()).execute<ResultSetHeader>("UPDATE career_applications SET status = ? WHERE id = ?", [status, id]);
  return result.affectedRows > 0;
}

/** Removes applications and their résumés for good. False if none of them was there. */
export async function deleteApplications(ids: number[]): Promise<boolean> {
  if (ids.length === 0) return false;
  const [result] = await (await db()).query<ResultSetHeader>("DELETE FROM career_applications WHERE id IN (?)", [ids]);
  return result.affectedRows > 0;
}
