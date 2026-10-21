// Contact form rules, shared by the Contact page and /api/contact so both check the same things.

export const CONTACT_EMAIL = "innovate@chemlifeinnovations.com";
export const CONTACT_PHONE = "+91 95358 62570";

export const INQUIRY_TYPES = [
  "General Inquiry",
  "Talk to a Nutritionist",
  "Product Sales & Distribution",
  "Technical & R&D Partnership",
  "Advisory Services & Careers",
] as const;

/** Longest accepted value for each field, in characters. */
export const CONTACT_LIMITS = { name: 100, email: 200, phone: 40, subject: 200, message: 5000 } as const;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  subject: string;
  message: string;
}

/** Why /api/contact refused or couldn't send a message. */
export type ContactErrorCode = "invalid" | "rate_limited" | "unavailable" | "send_failed";
