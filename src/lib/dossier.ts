import type { ContactErrorCode } from "@/lib/contact";

// The technical dossier request: the form behind "Request a technical dossier" and /api/dossier check the same rules.
// Steps: details (and the CAPTCHA) → a 4-digit code emailed to the visitor → the code unlocks the PDF (see dossierCode.ts).

/** The PDF, relative to the project folder. It is not in public/: only /api/dossier/download hands it out, to visitors
 * who entered the code emailed to them. */
export const DOSSIER_PDF_FILE = "src/assets/dossier/chemlife-technical-dossier.pdf";

/** The answers to "What are you interested in?", in order. Their labels are in the language files (dossier.interests). */
export const DOSSIER_INTERESTS = [
  "Feed hygiene",
  "Bio-trace minerals",
  "Rumen-bypass and targeted delivery",
  "Distribution partnership",
  "Research collaboration",
  "Other",
] as const;

/** Longest accepted value for each field, in characters. */
export const DOSSIER_LIMITS = { name: 100, email: 200, company: 150, role: 100, country: 80 } as const;

export interface DossierRequest {
  name: string;
  email: string;
  company: string;
  /** Optional. */
  role: string;
  country: string;
  /** Optional: one of DOSSIER_INTERESTS, or "" when not chosen. */
  interest: string;
}

/** Why /api/dossier refused a step: the contact form's reasons, plus a wrong, expired or used-up code. */
export type DossierErrorCode = ContactErrorCode | "code_wrong" | "code_expired" | "code_attempts";
