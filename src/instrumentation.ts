// Runs once when a server process starts.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") return;
  const { startAutoSync } = await import("@/lib/insights-store/auto-sync");
  startAutoSync();
}
