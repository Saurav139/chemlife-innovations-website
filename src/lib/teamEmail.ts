// Emails from the website's forms through Resend (resend.com): contact messages and technical dossier requests to the
// ChemLife team, and dossier codes to visitors. RESEND_API_KEY turns this on; the sender address must be on a domain
// verified in Resend (Resend refuses to send to anyone else's inbox from an unverified one).

import { CONTACT_EMAIL } from "@/lib/contact";

const FROM = process.env.CONTACT_FROM || "ChemLife Website <website@notify.chemlifeinnovations.com>";
const TO = process.env.CONTACT_TO || CONTACT_EMAIL;

/** Sends a plain-text email. False if Resend refused it or couldn't be reached. */
export async function sendEmail(email: { to: string; subject: string; text: string; replyTo: string }, logTag: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: email.to, reply_to: email.replyTo, subject: email.subject, text: email.text }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // Resend's reason (bad key, unverified domain, ...) goes to the server log; the visitor's details don't.
      console.error(`[${logTag}] Resend refused the email: ${res.status} ${(await res.text()).slice(0, 300)}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[${logTag}] Couldn't reach Resend: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

/** Sends a plain-text email to the team; replies go to `replyTo`. */
export function emailTeam(email: { subject: string; text: string; replyTo: string }, logTag: string): Promise<boolean> {
  return sendEmail({ ...email, to: TO }, logTag);
}

/** Sends a plain-text email to a visitor; replies reach the team. */
export function emailVisitor(email: { to: string; subject: string; text: string }, logTag: string): Promise<boolean> {
  return sendEmail({ ...email, replyTo: TO }, logTag);
}
