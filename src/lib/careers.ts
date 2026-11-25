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
  | "invalid" | "resume_type" | "resume_size" | "captcha" | "rate_limited" | "unavailable" | "send_failed";
