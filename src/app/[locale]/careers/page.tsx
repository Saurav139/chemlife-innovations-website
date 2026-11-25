import CareersView from "./CareersView";
import { closedRoleIds } from "@/lib/careers-store";

// Rendered for each visit, so opening or closing an internship in the dashboard (/admin/careers) shows at once.
export const dynamic = "force-dynamic";

export default async function CareersPage() {
  return <CareersView closedRoles={await closedRoleIds()} />;
}
