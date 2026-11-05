import { claimTurn, getSetting, socialAutoPublishSettings, storeConfigured } from "./db";
import { syncInbox } from "./sync";

// Checking for new posts without anyone opening the inbox, while an "Automatically add … to Insights" box is ticked.
// The server checks every 10 minutes on its own, and a visit to the Insights page checks too if one is due (in case
// the host paused the server in between). With every box unticked, posts still wait for the inbox as before.

export const AUTO_SYNC_EVERY = 10 * 60 * 1000;
/** How often one server process looks in the database to see whether a check is due. */
const LOOK_EVERY = 60 * 1000;
const CLAIM = "auto_sync_claim";

const g = globalThis as unknown as { insightsAutoSyncLooked?: number; insightsAutoSyncTimer?: ReturnType<typeof setInterval> };

/** Checks the channels if a box is ticked and the last check is 10 minutes old. Never throws. */
export async function syncIfDue(now = Date.now()): Promise<boolean> {
  if (!storeConfigured()) return false;
  if (g.insightsAutoSyncLooked && now - g.insightsAutoSyncLooked < LOOK_EVERY) return false;
  g.insightsAutoSyncLooked = now;
  try {
    const enabled = await socialAutoPublishSettings();
    if (!Object.values(enabled).some(Boolean)) return false;
    const lastSync = JSON.parse((await getSetting("last_sync")) ?? "null") as { at: string } | null;
    const due = new Date(now - AUTO_SYNC_EVERY);
    if (lastSync && Date.parse(lastSync.at) > due.getTime()) return false;
    // Several server processes may find a check due at once: only one of them runs it.
    if (!(await claimTurn(CLAIM, due, new Date(now)))) return false;
    await syncInbox();
    return true;
  } catch (error) {
    console.warn("Insights: automatic check for new posts failed", error);
    return false;
  }
}

/** Started once per server process (src/instrumentation.ts). */
export function startAutoSync(): void {
  if (g.insightsAutoSyncTimer || !storeConfigured()) return;
  g.insightsAutoSyncTimer = setInterval(() => void syncIfDue(), LOOK_EVERY);
  // Don't keep the process alive just for this.
  g.insightsAutoSyncTimer.unref?.();
}
