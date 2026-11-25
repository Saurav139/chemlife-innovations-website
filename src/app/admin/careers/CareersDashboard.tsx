"use client";

import { useState } from "react";
import type { Application, CustomRole } from "@/lib/careers";
import Applications from "./Applications";
import CareersRoles from "./CareersRoles";

// The careers dashboard: the applications that have come in, and the internships on the Careers page.

interface Props {
  builtIn: CustomRole[];
  roles: { closed: string[]; custom: CustomRole[]; removed: string[] };
  applications: Application[];
  demo: boolean;
}

const quiet = "inline-flex items-center min-h-10 px-3 rounded-full text-sm font-semibold";

export default function CareersDashboard({ builtIn, roles, applications, demo }: Props) {
  const [tab, setTab] = useState<"applications" | "roles">("applications");
  // Kept here so the tab's count stays right as applications are read, moved on or deleted.
  const [list, setList] = useState(applications);
  const newCount = list.filter((item) => item.status === "new").length;

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => null);
    window.location.reload();
  }

  const tabs = [
    { id: "applications" as const, label: "Applications", count: newCount },
    { id: "roles" as const, label: "Roles", count: 0 },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/branding/logo-horizontal.png" alt="ChemLife Innovations" className="h-8 w-auto shrink-0" />
            <span className="hidden sm:block h-6 w-px bg-slate-200" aria-hidden="true" />
            <h1 className="font-heading text-lg font-bold truncate">Careers dashboard</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <a href="/admin/insights" className={`${quiet} text-slate-600 hover:bg-slate-100`}>Insights inbox</a>
            <a href="/careers" target="_blank" rel="noopener" className={`hidden sm:inline-flex ${quiet} text-teal-aa hover:bg-teal-50`}>
              View the Careers page ↗
            </a>
            {!demo && (
              <button type="button" onClick={signOut} className={`${quiet} text-slate-600 hover:bg-slate-100 cursor-pointer`}>
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[860px] mx-auto px-4 sm:px-6 py-6">
        <div role="tablist" aria-label="Careers dashboard" className="inline-flex rounded-full bg-white border border-slate-200 p-1 mb-6">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`min-h-10 px-5 rounded-full text-sm font-bold cursor-pointer transition-colors ${tab === item.id ? "bg-brand-navy text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {item.label}
              {item.count > 0 && (
                <span className={`ml-2 inline-block min-w-5 rounded-full px-1.5 text-xs leading-5 ${tab === item.id ? "bg-white text-brand-navy" : "bg-brand-orange-aa text-white"}`}>
                  {item.count}<span className="sr-only"> new</span>
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Both stay on the page, so a half-written internship survives a look at the applications. */}
        <div role="tabpanel" id="panel-applications" aria-labelledby="tab-applications" hidden={tab !== "applications"}>
          <Applications list={list} onChange={setList} />
        </div>
        <div role="tabpanel" id="panel-roles" aria-labelledby="tab-roles" hidden={tab !== "roles"}>
          <CareersRoles builtIn={builtIn} initial={roles} />
        </div>
      </main>
    </div>
  );
}
