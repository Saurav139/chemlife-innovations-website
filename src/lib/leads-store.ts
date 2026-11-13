import type { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { ContactMessage } from "@/lib/contact";
import type { DossierRequest } from "@/lib/dossier";
import { database, storeConfigured } from "@/lib/insights-store/db";
import type { ContactLead, DossierLead, LeadKind } from "@/lib/leads";

// Contact form messages and technical dossier downloads, kept for the leads dashboard (/admin/leads) in the same
// MySQL database as the Insights inbox (DATABASE_URL). The tables are created on first use.
// The emails to the team don't depend on this: the forms save after answering the visitor, and a missing or
// unreachable database is only logged.

const g = globalThis as unknown as { leadsTables?: Promise<void> };

async function db(): Promise<Pool> {
  const pool = await database();
  g.leadsTables ??= createTables(pool).catch((error) => {
    g.leadsTables = undefined;
    throw error;
  });
  await g.leadsTables;
  return pool;
}

async function createTables(pool: Pool) {
  await pool.query(`CREATE TABLE IF NOT EXISTS contact_messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(40) NOT NULL DEFAULT '',
    inquiry_type VARCHAR(60) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    handled_at DATETIME NULL,
    note VARCHAR(2000) NOT NULL DEFAULT '',
    KEY by_time (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await pool.query(`CREATE TABLE IF NOT EXISTS dossier_downloads (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(200) NOT NULL,
    company VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT '',
    country VARCHAR(80) NOT NULL,
    interest VARCHAR(60) NOT NULL DEFAULT '',
    locale VARCHAR(10) NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL,
    handled_at DATETIME NULL,
    note VARCHAR(2000) NOT NULL DEFAULT '',
    KEY by_time (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

const TABLE: Record<LeadKind, string> = { contact: "contact_messages", dossier: "dossier_downloads" };
/** The dashboard shows at most this many of each, newest first. */
const LIST_LIMIT = 5000;

/** Runs a save for a form, logging instead of failing: the visitor has already been answered. */
async function quietly(what: string, save: (pool: Pool) => Promise<unknown>) {
  if (!storeConfigured()) return;
  try {
    await save(await db());
  } catch (error) {
    const e = error as { code?: string; message?: string };
    console.error(`[leads] Couldn't save the ${what}: ${[e.code, e.message].filter(Boolean).join(": ")}`);
  }
}

export function saveContactMessage(m: ContactMessage, at = new Date()): Promise<void> {
  return quietly("contact message", (pool) =>
    pool.execute(
      "INSERT INTO contact_messages (name, email, phone, inquiry_type, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [m.name, m.email, m.phone, m.inquiryType, m.subject, m.message, at],
    ),
  );
}

export function saveDossierDownload(d: DossierRequest, locale: string, at = new Date()): Promise<void> {
  return quietly("dossier download", (pool) =>
    pool.execute(
      "INSERT INTO dossier_downloads (name, email, company, role, country, interest, locale, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [d.name, d.email, d.company, d.role, d.country, d.interest, locale.slice(0, 10), at],
    ),
  );
}

const iso = (value: Date | null) => (value ? new Date(value).toISOString() : null);

function contactLead(r: RowDataPacket): ContactLead {
  return {
    id: r.id, name: r.name, email: r.email, phone: r.phone, inquiryType: r.inquiry_type, subject: r.subject, message: r.message,
    createdAt: iso(r.created_at)!, handledAt: iso(r.handled_at), note: r.note,
  };
}

function dossierLead(r: RowDataPacket): DossierLead {
  return {
    id: r.id, name: r.name, email: r.email, company: r.company, role: r.role, country: r.country, interest: r.interest, locale: r.locale,
    createdAt: iso(r.created_at)!, handledAt: iso(r.handled_at), note: r.note,
  };
}

const toLead = (kind: LeadKind, row: RowDataPacket) => (kind === "contact" ? contactLead(row) : dossierLead(row));

/** Both lists, newest first. Throws when the database can't be used. */
export async function listLeads(): Promise<{ contact: ContactLead[]; dossier: DossierLead[] }> {
  const pool = await db();
  const [[contact], [dossier]] = await Promise.all([
    pool.query<RowDataPacket[]>(`SELECT * FROM contact_messages ORDER BY created_at DESC, id DESC LIMIT ${LIST_LIMIT}`),
    pool.query<RowDataPacket[]>(`SELECT * FROM dossier_downloads ORDER BY created_at DESC, id DESC LIMIT ${LIST_LIMIT}`),
  ]);
  return { contact: contact.map(contactLead), dossier: dossier.map(dossierLead) };
}

/** Ticks or unticks "Handled" and/or changes the note. The lead as it is now, or null if there's no such lead. */
export async function changeLead(kind: LeadKind, id: number, changes: { handled?: boolean; note?: string }): Promise<ContactLead | DossierLead | null> {
  const pool = await db();
  const table = TABLE[kind];
  if (changes.handled !== undefined) {
    // Ticking an already handled lead keeps the day it was first handled.
    await pool.execute(
      changes.handled ? `UPDATE ${table} SET handled_at = COALESCE(handled_at, ?) WHERE id = ?` : `UPDATE ${table} SET handled_at = NULL WHERE id = ?`,
      changes.handled ? [new Date(), id] : [id],
    );
  }
  if (changes.note !== undefined) await pool.execute(`UPDATE ${table} SET note = ? WHERE id = ?`, [changes.note, id]);
  const [rows] = await pool.execute<RowDataPacket[]>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  return rows[0] ? toLead(kind, rows[0]) : null;
}

/** Deletes a lead for good. False if there was no such lead. */
export async function deleteLead(kind: LeadKind, id: number): Promise<boolean> {
  const pool = await db();
  const [result] = await pool.execute<ResultSetHeader>(`DELETE FROM ${TABLE[kind]} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}
