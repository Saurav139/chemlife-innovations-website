import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, validSession } from "@/lib/admin-auth";
import { databaseProblem, storeConfigured } from "@/lib/insights-store/db";
import { listLeads } from "@/lib/leads-store";
import AdminLogin from "../insights/AdminLogin";
import LeadsDashboard from "./LeadsDashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leads | ChemLife Innovations",
  robots: { index: false, follow: false },
};

// Contact form messages and technical dossier downloads, for the team. Same password as the Insights inbox, and
// never open without it: unlike the inbox, demo mode doesn't apply, since these are visitors' personal details.
export default async function LeadsPage() {
  const missing = [
    !adminConfigured() && { name: "ADMIN_PASSWORD", what: "The password the team signs in with (the same as for the Insights inbox)." },
    !storeConfigured() && { name: "DATABASE_URL", what: "The MySQL database the messages are kept in (the same as for the Insights inbox)." },
  ].filter(Boolean) as { name: string; what: string }[];
  if (missing.length) {
    return (
      <Notice title="The leads dashboard isn't set up yet">
        <p>Add these to the site&apos;s environment variables (in hPanel), then redeploy:</p>
        <ul className="mt-4 space-y-3">
          {missing.map((m) => (
            <li key={m.name} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
              <code className="font-bold text-brand-navy">{m.name}</code>
              <p className="text-sm text-slate-600 mt-1">{m.what}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-slate-600">Until then, messages and dossier requests still reach the team by email.</p>
      </Notice>
    );
  }

  if (!validSession((await cookies()).get(ADMIN_COOKIE)?.value)) {
    return <AdminLogin title="Leads" blurb="Contact messages and technical dossier downloads." />;
  }

  try {
    return <LeadsDashboard initial={await listLeads()} />;
  } catch (error) {
    console.error("Leads dashboard: database error", error);
    const problem = databaseProblem(error);
    return (
      <Notice title="The dashboard can't reach its database">
        <p>{problem.hint}</p>
        {problem.detail && (
          <p className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 break-words">
            <span className="font-semibold text-brand-navy">The database said: </span>
            <code>{problem.detail}</code>
          </p>
        )}
        <p className="mt-4 text-sm text-slate-600">Messages and dossier requests still reach the team by email meanwhile.</p>
      </Notice>
    );
  }
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
