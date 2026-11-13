import type { ContactMessage } from "@/lib/contact";
import type { DossierRequest } from "@/lib/dossier";

// The leads dashboard (/admin/leads): contact form messages and technical dossier downloads, as saved by
// src/lib/leads-store.ts. Shared by the dashboard and its API routes; nothing here touches the database.

export type LeadKind = "contact" | "dossier";
export const LEAD_KINDS: readonly LeadKind[] = ["contact", "dossier"];

interface LeadState {
  id: number;
  /** When the form was sent, ISO. */
  createdAt: string;
  /** When someone ticked "Handled", ISO, or null while it's new. */
  handledAt: string | null;
  /** A private note for the team. */
  note: string;
}

export type ContactLead = ContactMessage & LeadState;
/** `email` is the address the visitor confirmed with the emailed code. `locale` is the site language they used. */
export type DossierLead = DossierRequest & LeadState & { locale: string };
export type Lead = ContactLead | DossierLead;

export const NOTE_LIMIT = 2000;

/** What the dashboard's "Handled" tick and note box send: { handled?, note? }. A string says what's wrong. */
export function parseLeadChanges(body: Record<string, unknown>): { handled?: boolean; note?: string } | string {
  const changes: { handled?: boolean; note?: string } = {};
  if ("handled" in body) {
    if (typeof body.handled !== "boolean") return "“handled” must be true or false.";
    changes.handled = body.handled;
  }
  if ("note" in body) {
    if (typeof body.note !== "string") return "The note must be text.";
    changes.note = body.note.trim();
    if (changes.note.length > NOTE_LIMIT) return `Keep the note under ${NOTE_LIMIT} characters.`;
  }
  if (!Object.keys(changes).length) return "Nothing to change.";
  return changes;
}

// ---------- Filters ----------

export interface LeadFilters {
  /** Words to look for in any field. */
  search: string;
  /** Local dates, YYYY-MM-DD, or "". Both days are included. */
  from: string;
  to: string;
  /** Inquiry type (contact) or interest (dossier), or "" for all. */
  type: string;
  status: "all" | "new" | "handled";
}

export const NO_FILTERS: LeadFilters = { search: "", from: "", to: "", type: "", status: "all" };

/** Lower case without accents, so a search for "cafe" finds "café". */
const fold = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function leadType(lead: Lead): string {
  return "inquiryType" in lead ? lead.inquiryType : lead.interest;
}

function searchable(lead: Lead): string {
  const fields = "inquiryType" in lead
    ? [lead.name, lead.email, lead.phone, lead.inquiryType, lead.subject, lead.message, lead.note]
    : [lead.name, lead.email, lead.company, lead.role, lead.country, lead.interest, lead.note];
  return fold(fields.join("\n"));
}

/** Start of a local day, as a time, or null for "". */
function dayStart(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function filterLeads<T extends Lead>(leads: T[], filters: LeadFilters): T[] {
  const words = fold(filters.search).split(/\s+/).filter(Boolean);
  const from = dayStart(filters.from);
  const toStart = dayStart(filters.to);
  const to = toStart === null ? null : toStart + 24 * 3600 * 1000;
  return leads.filter((lead) => {
    const time = Date.parse(lead.createdAt);
    if (from !== null && time < from) return false;
    if (to !== null && time >= to) return false;
    if (filters.type && leadType(lead) !== filters.type) return false;
    if (filters.status === "new" && lead.handledAt) return false;
    if (filters.status === "handled" && !lead.handledAt) return false;
    if (words.length) {
      const text = searchable(lead);
      if (!words.every((word) => text.includes(word))) return false;
    }
    return true;
  });
}

// ---------- CSV ----------

/** "2026-11-14 09:05" in the viewer's time zone. */
export function localTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const two = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`;
}

/** One CSV cell. Text a spreadsheet would run as a formula (=, +, -, @ first) gets a leading apostrophe. */
function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(rows: string[][]): string {
  // The byte-order mark makes Excel read the file as UTF-8, so names in any script come through.
  return "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
}

const status = (lead: Lead) => (lead.handledAt ? "Handled" : "New");

export function contactCsv(leads: ContactLead[]): string {
  return toCsv([
    ["Received", "Name", "Email", "Phone", "Inquiry type", "Subject", "Message", "Status", "Handled on", "Note"],
    ...leads.map((l) => [localTime(l.createdAt), l.name, l.email, l.phone, l.inquiryType, l.subject, l.message, status(l), localTime(l.handledAt), l.note]),
  ]);
}

export function dossierCsv(leads: DossierLead[]): string {
  return toCsv([
    ["Downloaded", "Name", "Email (confirmed)", "Company", "Role", "Country", "Interested in", "Language", "Status", "Handled on", "Note"],
    ...leads.map((l) => [localTime(l.createdAt), l.name, l.email, l.company, l.role, l.country, l.interest, l.locale, status(l), localTime(l.handledAt), l.note]),
  ]);
}
