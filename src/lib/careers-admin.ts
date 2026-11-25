import { ADMIN_COOKIE, sameOrigin, validSession } from "@/lib/admin-auth";

// Who may use the careers dashboard's API. The same sign-in as the Insights inbox, with one difference: the inbox's
// demo mode (INSIGHTS_DEMO, which opens it without a password on the staging site) never applies here. The inbox
// holds public posts; this holds applicants' names, contact details and résumés.

/** Null when the caller is signed in, otherwise the response to send. Changes must also come from this site's own pages. */
export function requireCareersAdmin(request: Request): Response | null {
  if (request.method !== "GET" && !sameOrigin(request)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const cookies = request.headers.get("cookie") ?? "";
  const session = cookies.split(/;\s*/).find((part) => part.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
  if (!validSession(session)) return Response.json({ error: "Please sign in again." }, { status: 401 });
  return null;
}
