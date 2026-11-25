import CareersView from "./CareersView";
import { INTERNSHIP_ROLES } from "@/lib/catalog";
import { careersState } from "@/lib/careers-store";

// Rendered for each visit, so what the dashboard (/admin/careers) opens, closes, adds or changes shows at once.
export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const { closed, custom, removed } = await careersState();
  // Only what's open goes to the browser: a closed internship's text, and the id made from its title, aren't in the
  // page at all. (The page still needs to know which of the site's own three are closed.)
  const builtIn = INTERNSHIP_ROLES.map((role) => role.id);
  return (
    <CareersView
      closedRoles={closed.filter((id) => builtIn.includes(id))}
      customRoles={custom.filter((role) => !closed.includes(role.id))}
      removedRoles={removed}
    />
  );
}
