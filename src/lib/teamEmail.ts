// Emails from the website's forms (contact messages, technical dossier requests) to the ChemLife team, through
// Resend (resend.com). RESEND_API_KEY turns this on; the sender address must be on a domain verified in Resend.

import { CONTACT_EMAIL } from "@/lib/contact";

const FROM = process.env.CONTACT_FROM || "ChemLife Website <website@notify.chemlifeinnovations.com>";
const TO = process.env.CONTACT_TO || CONTACT_EMAIL;

/** Sends a plain-text email to the team; replies go to `replyTo`. False if Resend refused it or couldn't be reached. */
export async function emailTeam(email: { subject: string; text: string; replyTo: string }, logTag: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: TO, reply_to: email.replyTo, subject: email.subject, text: email.text }),
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
