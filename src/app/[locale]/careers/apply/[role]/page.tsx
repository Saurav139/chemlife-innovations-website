import { notFound } from "next/navigation";
import ApplyView from "./ApplyView";
import { careersState, roleNames } from "@/lib/careers-store";

// An internship's application form, e.g. /careers/apply/research-intern, reached from "Apply for this Internship"
// on the Careers page. Rendered for each visit, like the Careers page, so an internship closed in the dashboard
// stops taking applications at once.
export const dynamic = "force-dynamic";

export default async function ApplyPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const state = await careersState();
  if (!roleNames(state).some((item) => item.id === role)) notFound();
  return <ApplyView roleId={role} closedRoles={state.closed} customRoles={state.custom} removedRoles={state.removed} />;
}
