import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import type { Insights } from "@/lib/insights";
import { insightCard } from "./card";
import { importedStatus, isSocialSource, LEGACY_SOCIAL_AUTO_PUBLISH_SETTING, SOCIAL_AUTO_PUBLISH_SETTINGS, type SocialAutoPublish, type SocialSource } from "./social-publishing";
import type { InboxItem, ItemChanges, Kind, Source, SourceItem, Status } from "./types";

// The inbox's MySQL tables. DATABASE_URL points at the database, e.g. mysql://user:password@host:3306/name (a
// password with special characters must be URL-encoded). The tables are created on first use.

const g = globalThis as unknown as { insightsPool?: Pool; insightsTables?: Promise<void> };

export function storeConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Why the database couldn't be used, in plain words, with the database's own error for reference. For the signed-in
 *  moderator only: it can name the database user and this server's address, never the password. */
export function databaseProblem(error: unknown): { hint: string; detail: string } {
  const e = (error ?? {}) as { code?: string; message?: string };
  const code = e.code ?? "";
  const detail = [code, e.message].filter(Boolean).join(": ").slice(0, 300);
  const hints: Record<string, string> = {
    ENOTFOUND: "The host name in DATABASE_URL couldn't be found. Copy the host exactly as hPanel shows it under Databases → MySQL Databases.",
    EAI_AGAIN: "The host name in DATABASE_URL couldn't be looked up. Copy the host exactly as hPanel shows it under Databases → MySQL Databases.",
    ECONNREFUSED: "Nothing answered at that host and port. Check the host, and that the port is 3306. If the host is localhost, try the host name hPanel shows instead.",
    ETIMEDOUT: "The database didn't answer in time. Allow this site to connect in hPanel → Databases → Remote MySQL, or check the host.",
    ECONNRESET: "The database closed the connection. Allow this site to connect in hPanel → Databases → Remote MySQL, or check the host.",
    ER_ACCESS_DENIED_ERROR: "The database refused the user name or password. Check both. Symbols in the password (@ # / ? % : and spaces) must be URL-encoded in DATABASE_URL, e.g. @ as %40.",
    ER_BAD_DB_ERROR: "There's no database with that name. On Hostinger the name starts with your account number, e.g. u123456789_insights.",
    ER_DBACCESS_DENIED_ERROR: "There's no database with that name, or that user isn't allowed to use it. On Hostinger both names start with your account number, e.g. u123456789_insights, and the user must belong to the database.",
    ER_TABLEACCESS_DENIED_ERROR: "That user can't create or change tables in this database. Give it all privileges on the database in hPanel.",
    ER_HOST_NOT_PRIVILEGED: "The database doesn't accept connections from this server. Add this server in hPanel → Databases → Remote MySQL.",
    ER_HOST_IS_BLOCKED: "The database has blocked this server after failed connections. Flush hosts in hPanel, or contact Hostinger.",
  };
  if (hints[code]) return { hint: hints[code], detail };
  if (error instanceof URIError || /invalid url|uri malformed/i.test(e.message ?? "")) {
    return { hint: "DATABASE_URL isn't a valid address. It should look like mysql://user:password@host:3306/database, with symbols in the password URL-encoded.", detail: "" };
  }
  return { hint: "The database couldn't be used. The details below say why.", detail };
}

async function pool(): Promise<Pool> {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL isn't set");
  g.insightsPool ??= mysql.createPool({ uri, connectionLimit: 4, connectTimeout: 5000, charset: "utf8mb4", timezone: "Z" });
  g.insightsTables ??= createTables(g.insightsPool).catch((error) => {
    g.insightsTables = undefined;
    throw error;
  });
  await g.insightsTables;
  return g.insightsPool;
}

async function createTables(db: Pool) {
  await db.query(`CREATE TABLE IF NOT EXISTS insight_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(16) NOT NULL,
    external_id VARCHAR(191) NOT NULL,
    kind VARCHAR(10) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'pending',
    featured TINYINT(1) NOT NULL DEFAULT 0,
    title VARCHAR(300) NOT NULL,
    summary TEXT NOT NULL,
    content MEDIUMTEXT NULL,
    url VARCHAR(1000) NULL,
    image_url VARCHAR(1000) NULL,
    image_id INT UNSIGNED NULL,
    youtube_id VARCHAR(32) NULL,
    meta VARCHAR(60) NOT NULL DEFAULT '',
    published_at DATETIME NOT NULL,
    imported_at DATETIME NOT NULL,
    decided_at DATETIME NULL,
    UNIQUE KEY source_post (source, external_id),
    KEY by_status (status, published_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await db.query(`CREATE TABLE IF NOT EXISTS insight_images (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    mime VARCHAR(40) NOT NULL,
    data MEDIUMBLOB NOT NULL,
    created_at DATETIME NOT NULL
  ) ENGINE=InnoDB`);
  await db.query(`CREATE TABLE IF NOT EXISTS insight_settings (
    name VARCHAR(64) PRIMARY KEY,
    value TEXT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

// ---------- Pictures ----------

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
export const IMAGE_TYPES = Object.keys(EXTENSIONS);

/** A copied picture's address. It ends in a file extension so the staging password check lets the image optimizer
 *  through (see src/proxy.ts), and never changes, so it can be cached for good. */
export function imagePath(id: number, mime: string): string {
  return `/api/insights/media/${id}.${EXTENSIONS[mime] ?? "jpg"}`;
}

export async function saveImage(mime: string, data: Buffer): Promise<number> {
  const db = await pool();
  const [result] = await db.execute<ResultSetHeader>("INSERT INTO insight_images (mime, data, created_at) VALUES (?, ?, ?)", [mime, data, new Date()]);
  return result.insertId;
}

export async function readImage(id: number): Promise<{ mime: string; data: Buffer } | null> {
  const db = await pool();
  const [rows] = await db.execute<RowDataPacket[]>("SELECT mime, data FROM insight_images WHERE id = ?", [id]);
  return rows[0] ? { mime: rows[0].mime, data: rows[0].data } : null;
}

/** Pictures copied for a preview that was never added, a day on. */
export async function removeUnusedImages(): Promise<void> {
  const db = await pool();
  await db.execute(
    `DELETE im FROM insight_images im LEFT JOIN insight_items i ON i.image_id = im.id
     WHERE i.id IS NULL AND im.created_at < ?`,
    [new Date(Date.now() - 24 * 3600 * 1000)]
  );
}

// ---------- Settings ----------

export async function getSetting(name: string): Promise<string | null> {
  const db = await pool();
  const [rows] = await db.execute<RowDataPacket[]>("SELECT value FROM insight_settings WHERE name = ?", [name]);
  return rows[0]?.value ?? null;
}

export async function setSetting(name: string, value: string): Promise<void> {
  const db = await pool();
  await db.execute("INSERT INTO insight_settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)", [name, value]);
}

export async function socialAutoPublishEnabled(source: SocialSource): Promise<boolean> {
  // Keep the old combined preference until this channel gets its own explicit choice.
  const saved = await getSetting(SOCIAL_AUTO_PUBLISH_SETTINGS[source]);
  return (saved ?? await getSetting(LEGACY_SOCIAL_AUTO_PUBLISH_SETTING)) === "true";
}

export async function socialAutoPublishSettings(): Promise<SocialAutoPublish> {
  const [linkedin, instagram] = await Promise.all([socialAutoPublishEnabled("linkedin"), socialAutoPublishEnabled("instagram")]);
  return { linkedin, instagram };
}

/** Saves one channel's preference and approves its waiting posts atomically. Hidden posts are untouched. */
export async function setSocialAutoPublish(source: SocialSource, enabled: boolean): Promise<number> {
  const conn = await (await pool()).getConnection();
  try {
    await conn.beginTransaction();
    // The same setting row is locked by automated imports, so an in-flight import cannot miss this decision.
    await conn.execute(
      "INSERT INTO insight_settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)",
      [SOCIAL_AUTO_PUBLISH_SETTINGS[source], String(enabled)]
    );
    let approved = 0;
    if (enabled) {
      const [result] = await conn.execute<ResultSetHeader>(
        "UPDATE insight_items SET status = 'approved', decided_at = ? WHERE status = 'pending' AND source = ?",
        [new Date(), source]
      );
      approved = result.affectedRows;
    }
    await conn.commit();
    return approved;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

// ---------- Posts ----------

const ITEM_COLUMNS = `i.id, i.source, i.external_id, i.kind, i.status, i.featured, i.title, i.summary, i.content, i.url,
  i.image_url, i.image_id, i.youtube_id, i.meta, i.published_at, i.imported_at, i.decided_at, im.mime AS image_mime`;
const FROM_ITEMS = "FROM insight_items i LEFT JOIN insight_images im ON im.id = i.image_id";

function toItem(row: RowDataPacket): InboxItem {
  return {
    id: row.id,
    source: row.source as Source,
    externalId: row.external_id,
    kind: row.kind as Kind,
    status: row.status as Status,
    featured: Boolean(row.featured),
    title: row.title,
    summary: row.summary,
    content: row.content ?? "",
    url: row.url ?? "",
    image: row.image_id && row.image_mime ? imagePath(row.image_id, row.image_mime) : (row.image_url ?? ""),
    imageId: row.image_id ?? null,
    youtubeId: row.youtube_id ?? "",
    meta: row.meta,
    publishedAt: new Date(row.published_at).toISOString(),
    importedAt: new Date(row.imported_at).toISOString(),
    decidedAt: row.decided_at ? new Date(row.decided_at).toISOString() : null,
  };
}

/** Which of these posts from one source are already in the inbox. */
export async function knownIds(source: Source, externalIds: string[]): Promise<Set<string>> {
  if (externalIds.length === 0) return new Set();
  const db = await pool();
  const [rows] = await db.query<RowDataPacket[]>("SELECT external_id FROM insight_items WHERE source = ? AND external_id IN (?)", [source, externalIds]);
  return new Set(rows.map((row) => row.external_id as string));
}

/** Includes hidden posts, so changing import methods never brings a reviewed post back. */
export async function knownUrls(source: Source): Promise<string[]> {
  const db = await pool();
  const [rows] = await db.query<RowDataPacket[]>("SELECT url FROM insight_items WHERE source = ? AND url IS NOT NULL", [source]);
  return rows.map((row) => row.url as string);
}

/** Adds the posts that aren't in the inbox yet, with this status. Returns how many were added. */
export async function addItems(items: SourceItem[], status: Status): Promise<number> {
  if (items.length === 0) return 0;
  const db = await pool();
  return insertItems(db, items, status);
}

/** Automated social imports share a lock with preference changes, across servers as well as requests. */
export async function addImportedItems(source: Source, items: SourceItem[], status: Status): Promise<{ added: number; approved: boolean }> {
  if (!isSocialSource(source) || items.length === 0) return { added: await addItems(items, status), approved: status === "approved" };
  const conn = await (await pool()).getConnection();
  try {
    await conn.beginTransaction();
    const setting = SOCIAL_AUTO_PUBLISH_SETTINGS[source];
    const [legacy] = await conn.execute<RowDataPacket[]>("SELECT value FROM insight_settings WHERE name = ?", [LEGACY_SOCIAL_AUTO_PUBLISH_SETTING]);
    await conn.execute("INSERT INTO insight_settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)", [setting, legacy[0]?.value === "true" ? "true" : "false"]);
    const [rows] = await conn.execute<RowDataPacket[]>("SELECT value FROM insight_settings WHERE name = ? FOR UPDATE", [setting]);
    const decision = importedStatus(source, status, rows[0]?.value === "true");
    const added = await insertItems(conn, items, decision);
    await conn.commit();
    return { added, approved: decision === "approved" };
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function insertItems(db: Pool | PoolConnection, items: SourceItem[], status: Status): Promise<number> {
  const now = new Date();
  let added = 0;
  for (const item of items) {
    const [result] = await db.execute<ResultSetHeader>(
      `INSERT IGNORE INTO insight_items (source, external_id, kind, status, title, summary, content, url, image_url, image_id,
        youtube_id, meta, published_at, imported_at, decided_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.source, item.externalId.slice(0, 191), item.kind, status, item.title.slice(0, 300), item.summary, item.content ?? null,
        item.url?.slice(0, 1000) ?? null, item.imageId ? null : (item.imageUrl?.slice(0, 1000) ?? null), item.imageId ?? null,
        item.youtubeId ?? null, item.meta.slice(0, 60), item.publishedAt, now, status === "pending" ? null : now,
      ]
    );
    added += result.affectedRows;
  }
  return added;
}

export async function findItem(source: Source, externalId: string): Promise<InboxItem | null> {
  const db = await pool();
  const [rows] = await db.execute<RowDataPacket[]>(`SELECT ${ITEM_COLUMNS} ${FROM_ITEMS} WHERE i.source = ? AND i.external_id = ?`, [source, externalId]);
  return rows[0] ? toItem(rows[0]) : null;
}

export async function getItem(id: number): Promise<InboxItem | null> {
  const db = await pool();
  const [rows] = await db.execute<RowDataPacket[]>(`SELECT ${ITEM_COLUMNS} ${FROM_ITEMS} WHERE i.id = ?`, [id]);
  return rows[0] ? toItem(rows[0]) : null;
}

/** Every post in the inbox, newest first. */
export async function listItems(): Promise<InboxItem[]> {
  const db = await pool();
  const [rows] = await db.query<RowDataPacket[]>(`SELECT ${ITEM_COLUMNS} ${FROM_ITEMS} ORDER BY i.published_at DESC, i.id DESC`);
  return rows.map(toItem);
}

/** These posts, newest first. */
export async function getItems(ids: number[]): Promise<InboxItem[]> {
  if (ids.length === 0) return [];
  const db = await pool();
  const [rows] = await db.query<RowDataPacket[]>(`SELECT ${ITEM_COLUMNS} ${FROM_ITEMS} WHERE i.id IN (?) ORDER BY i.published_at DESC, i.id DESC`, [ids]);
  return rows.map(toItem);
}

/** Moves several posts at once, as the inbox's bulk actions do. Posts that leave the page stop being featured. */
export async function changeStatuses(ids: number[], status: Status): Promise<InboxItem[]> {
  if (ids.length === 0) return [];
  const db = await pool();
  await db.query(
    `UPDATE insight_items SET status = ?, decided_at = ?, featured = IF(? = 'approved', featured, 0)
     WHERE id IN (?) AND status <> ?`,
    [status, status === "pending" ? null : new Date(), status, ids, status]
  );
  return getItems(ids);
}

/** Applies the moderator's changes. Featuring a post un-features the other post of its kind; a post that leaves
 *  the page stops being featured. */
export async function changeItem(id: number, changes: ItemChanges): Promise<InboxItem | null> {
  const db = await pool();
  const conn: PoolConnection = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute<RowDataPacket[]>("SELECT kind, status FROM insight_items WHERE id = ? FOR UPDATE", [id]);
    if (!rows[0]) {
      await conn.rollback();
      return null;
    }
    const kind = (changes.kind ?? rows[0].kind) as Kind;
    const status = (changes.status ?? rows[0].status) as Status;
    const sets: string[] = [];
    const values: (string | number | Date | null)[] = [];
    const set = (column: string, value: string | number | Date | null) => {
      sets.push(`${column} = ?`);
      values.push(value);
    };
    if (changes.kind) set("kind", changes.kind);
    if (changes.title !== undefined) set("title", changes.title.slice(0, 300));
    if (changes.summary !== undefined) set("summary", changes.summary);
    if (changes.content !== undefined) set("content", changes.content);
    if (changes.meta !== undefined) set("meta", changes.meta.slice(0, 60));
    if (changes.imageId !== undefined) set("image_id", changes.imageId);
    if (changes.publishedAt) set("published_at", changes.publishedAt);
    if (changes.status && changes.status !== rows[0].status) {
      set("status", changes.status);
      set("decided_at", changes.status === "pending" ? null : new Date());
    }
    if (status !== "approved" || changes.featured === false) set("featured", 0);
    else if (changes.featured) {
      await conn.execute("UPDATE insight_items SET featured = 0 WHERE kind = ? AND id <> ?", [kind, id]);
      set("featured", 1);
    }
    if (sets.length) await conn.execute(`UPDATE insight_items SET ${sets.join(", ")} WHERE id = ?`, [...values, id]);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
  return getItem(id);
}

/** The approved posts, for the Insights page. Null until the inbox has been started (see sync.ts), so the page keeps
 *  its built-in list until then. */
export async function approvedInsights(): Promise<Insights | null> {
  if (!(await getSetting("started"))) return null;
  const db = await pool();
  const [rows] = await db.query<RowDataPacket[]>(`SELECT ${ITEM_COLUMNS} ${FROM_ITEMS} WHERE i.status = 'approved' ORDER BY i.published_at DESC, i.id DESC`);
  const items = rows.map(toItem);
  return {
    blogs: items.filter((item) => item.kind === "Blog").map(insightCard),
    podcasts: items.filter((item) => item.kind === "Podcast" && item.youtubeId).map(insightCard),
    videos: items.filter((item) => item.kind === "Video" && item.youtubeId).map(insightCard),
  };
}
