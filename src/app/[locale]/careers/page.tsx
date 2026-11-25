import CareersView from "./CareersView";
import { careersState } from "@/lib/careers-store";

// Rendered for each visit, so what the dashboard (/admin/careers) opens, closes, adds or changes shows at once.
export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const { closed, custom, removed } = await careersState();
  return <CareersView closedRoles={closed} customRoles={custom} removedRoles={removed} />;
}
