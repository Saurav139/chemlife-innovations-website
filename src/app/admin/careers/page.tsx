import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, demoMode, validSession } from "@/lib/admin-auth";
import { INTERNSHIP_ROLES } from "@/lib/catalog";
import { ROLE_PICTURES } from "@/lib/careers";
import { readCareers } from "@/lib/careers-store";
import { getMessages } from "@/i18n/messages";
import { databaseProblem, storeConfigured } from "@/lib/insights-store/db";
import AdminLogin from "../insights/AdminLogin";
import CareersRoles from "./CareersRoles";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Internship roles | ChemLife Innovations" };

// The dashboard for opening, closing, adding and changing internships. Same sign-in and database as the Insights inbox.
export default async function CareersDashboardPage() {
  const demo = demoMode((await headers()).get("host") ?? "");
  const missing = [
    !adminConfigured() && !demo && "ADMIN_PASSWORD (the password to sign in with)",
    !storeConfigured() && "DATABASE_URL (the MySQL database that remembers which internships are open)",
  ].filter(Boolean) as string[];
  if (missing.length) {
    return (
      <Notice title="The roles dashboard isn't set up yet">
        <p>Add these to the site&apos;s environment variables (in hPanel), then redeploy:</p>
        <ul className="mt-3 list-disc pl-5 space-y-1">{missing.map((m) => <li key={m}>{m}</li>)}</ul>
        <p className="mt-4 text-sm text-slate-600">Until then every internship stays open on the Careers page.</p>
      </Notice>
    );
  }

  if (!demo && !validSession((await cookies()).get(ADMIN_COOKIE)?.value)) {
    return <AdminLogin title="Internship roles" blurb="Open, close and add internships on the Careers page." />;
  }

  try {
    const state = await readCareers();
    // The built-in internships as the site has them, in English: what the dashboard shows, and starts from when one is edited.
    const english = (await getMessages("en")).careers.roles;
    const builtIn = INTERNSHIP_ROLES.map((role, i) => ({
      id: role.id,
      title: role.englishTitle,
      department: role.englishDepartment,
      roleScope: english[i].roleScope,
      qualifications: english[i].qualifications,
      requirements: english[i].requirements,
      picture: ROLE_PICTURES[i] ?? ROLE_PICTURES[0],
    }));
    return <CareersRoles builtIn={builtIn} initial={state} demo={demo} />;
  } catch (error) {
    console.error("Roles dashboard: database error", error);
    const problem = databaseProblem(error);
    return (
      <Notice title="The dashboard can't reach its database">
        <p>{problem.hint}</p>
        {problem.detail && <p className="mt-3 text-sm text-slate-600 break-words"><code>{problem.detail}</code></p>}
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
