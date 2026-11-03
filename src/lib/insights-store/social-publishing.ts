import type { Source, Status } from "./types";

// Channels whose imports can be added to Insights automatically. YouTube brings in videos and podcasts.
export const SOCIAL_SOURCES = ["linkedin", "instagram", "youtube"] as const;
export type SocialSource = typeof SOCIAL_SOURCES[number];
export type SocialAutoPublish = Record<SocialSource, boolean>;
export const LEGACY_SOCIAL_AUTO_PUBLISH_SETTING = "auto_publish_social";
export const SOCIAL_AUTO_PUBLISH_SETTINGS: Record<SocialSource, string> = {
  linkedin: "auto_publish_linkedin",
  instagram: "auto_publish_instagram",
  youtube: "auto_publish_youtube",
};
/** The old combined preference only ever covered LinkedIn and Instagram, so YouTube starts off until chosen. */
export const inheritsLegacySetting = (source: SocialSource) => source !== "youtube";
export const isSocialSource = (source: unknown): source is SocialSource => (SOCIAL_SOURCES as readonly unknown[]).includes(source);

/** Automation only approves new, waiting social imports. Explicit moderation decisions take priority. */
export function importedStatus(source: Source, status: Status, autoPublishSocial: boolean): Status {
  return autoPublishSocial && isSocialSource(source) && status === "pending" ? "approved" : status;
}
