import type { Source, Status } from "./types";

export const SOCIAL_SOURCES = ["linkedin", "instagram"] as const;
export type SocialSource = typeof SOCIAL_SOURCES[number];
export type SocialAutoPublish = Record<SocialSource, boolean>;
export const LEGACY_SOCIAL_AUTO_PUBLISH_SETTING = "auto_publish_social";
export const SOCIAL_AUTO_PUBLISH_SETTINGS: Record<SocialSource, string> = {
  linkedin: "auto_publish_linkedin",
  instagram: "auto_publish_instagram",
};
export const isSocialSource = (source: unknown): source is SocialSource => source === "linkedin" || source === "instagram";

/** Automation only approves new, waiting social imports. Explicit moderation decisions take priority. */
export function importedStatus(source: Source, status: Status, autoPublishSocial: boolean): Status {
  return autoPublishSocial && isSocialSource(source) && status === "pending" ? "approved" : status;
}
