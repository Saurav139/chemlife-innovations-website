import type { Source, Status } from "./types";

export const SOCIAL_AUTO_PUBLISH_SETTING = "auto_publish_social";
export const isSocialSource = (source: Source) => source === "linkedin" || source === "instagram";

/** Automation only approves new, waiting social imports. Explicit moderation decisions take priority. */
export function importedStatus(source: Source, status: Status, autoPublishSocial: boolean): Status {
  return autoPublishSocial && isSocialSource(source) && status === "pending" ? "approved" : status;
}
