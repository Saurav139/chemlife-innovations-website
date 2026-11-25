import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { APPLICATION_STATUSES, type Application, type ApplicationStatus } from "@/lib/careers";
import { databasePool } from "@/lib/insights-store/db";

// Internship applications, kept in the site's database with their résumés and shown in the dashboard at
// /admin/careers. The table is created on first use.

const g = globalThis as unknown as { careerApplicationsTable?: Promise<void> };

async function db() {
  const pool = await databasePool();
  g.careerApplicationsTable ??= pool
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
    .then(() => undefined)
    .catch((error) => {
      g.careerApplicationsTable = undefined;
      throw error;
    });
  await g.careerApplicationsTable;
  return pool;
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
}

export async function saveApplication(a: NewApplication): Promise<number> {
  const [result] = await (await db()).execute<ResultSetHeader>(
    `INSERT INTO career_applications (role_id, role_title, department, name, email, phone, message, resume_name, resume, status, received_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
    [a.roleId, a.roleTitle, a.department, a.name, a.email, a.phone, a.message, a.resumeName, a.resume, new Date()],
  );
  return result.insertId;
}

/** The newest applications first, without their résumés. */
export async function listApplications(limit = 500): Promise<Application[]> {
  const [rows] = await (await db()).query<RowDataPacket[]>(
    `SELECT id, role_id, role_title, department, name, email, phone, message, resume_name, status, received_at
     FROM career_applications ORDER BY received_at DESC, id DESC LIMIT ?`,
    [limit],
  );
  return rows.map((row) => ({
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

/** Removes an application and its résumé for good. False if there's no application with that id. */
export async function deleteApplication(id: number): Promise<boolean> {
  const [result] = await (await db()).execute<ResultSetHeader>("DELETE FROM career_applications WHERE id = ?", [id]);
  return result.affectedRows > 0;
}
