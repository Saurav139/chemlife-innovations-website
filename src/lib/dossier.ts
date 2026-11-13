// The technical dossier request: the form behind "Request a technical dossier" and /api/dossier check the same rules.

/** The PDF the visitor downloads once their details have been sent. It lives in public/downloads/. */
export const DOSSIER_PDF = "/downloads/chemlife-technical-dossier.pdf";

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
