import { cookies, headers } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, demoMode, validSession } from "@/lib/admin-auth";
import { databaseProblem, listItems, storeConfigured } from "@/lib/insights-store/db";
import { inboxStatus, startInbox } from "@/lib/insights-store/sync";
import AdminLogin from "./AdminLogin";
import InsightsInbox from "./InsightsInbox";

export const dynamic = "force-dynamic";

export default async function InsightsInboxPage() {
  const demo = demoMode((await headers()).get("host") ?? "");
  const missing = [
    !adminConfigured() && !demo && { name: "ADMIN_PASSWORD", what: "The password the moderator signs in with." },
    !storeConfigured() && { name: "DATABASE_URL", what: "The MySQL database the inbox keeps its posts in, e.g. mysql://user:password@host:3306/database." },
  ].filter(Boolean) as { name: string; what: string }[];
  if (missing.length) return <SetupNeeded missing={missing} />;

  if (!demo && !validSession((await cookies()).get(ADMIN_COOKIE)?.value)) return <AdminLogin />;

  try {
    await startInbox();
    const [items, status] = await Promise.all([listItems(), inboxStatus()]);
    return <InsightsInbox initial={{ items, ...status }} demo={demo} />;
  } catch (error) {
    console.error("Insights inbox: database error", error);
    const problem = databaseProblem(error);
    return (
      <Notice title="The inbox can't reach its database">
        <p>{problem.hint}</p>
        {problem.detail && (
          <p className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 break-words">
            <span className="font-semibold text-brand-navy">The database said: </span>
            <code>{problem.detail}</code>
          </p>
        )}
        <p className="mt-4 text-sm text-slate-600">After changing DATABASE_URL in hPanel, redeploy the site, then reload this page.</p>
      </Notice>
    );
  }
}

function SetupNeeded({ missing }: { missing: { name: string; what: string }[] }) {
  return (
    <Notice title="The Insights inbox isn't set up yet">
      <p>Add these to the site&apos;s environment variables (in hPanel), then redeploy:</p>
      <ul className="mt-4 space-y-3">
        {missing.map((m) => (
          <li key={m.name} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <code className="font-bold text-brand-navy">{m.name}</code>
            <p className="text-sm text-slate-600 mt-1">{m.what}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-slate-600">Until then the Insights page keeps showing its built-in list.</p>
    </Notice>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
        <h1 className="font-heading text-2xl font-bold">{title}</h1>
        <div className="mt-3 text-slate-700 leading-relaxed">{children}</div>
      </div>
    </main>
  );
}
