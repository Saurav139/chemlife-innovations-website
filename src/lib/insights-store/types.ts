// The Insights inbox: posts from ChemLife's channels wait here until the moderator decides whether they show on the
// Insights page. See src/lib/insights-store/README.md.

export type Kind = "Blog" | "Podcast" | "Video";
export type Source = "youtube" | "wordpress" | "instagram" | "linkedin" | "link";
/** pending: waiting for a decision. approved: on the Insights page. hidden: kept out of it. */
export type Status = "pending" | "approved" | "hidden";

export const SOURCES: Source[] = ["youtube", "wordpress", "instagram", "linkedin", "link"];
export const KINDS: Kind[] = ["Blog", "Video", "Podcast"];
/** The featured written post is always a WordPress article; LinkedIn and Instagram posts stay in the grid. */
export const canBeFeatured = (item: { kind: Kind; source: Source }) => item.kind !== "Blog" || item.source === "wordpress";
export const STATUSES: Status[] = ["pending", "approved", "hidden"];

/** A post as a source gives it, before it's in the inbox. */
export interface SourceItem {
  source: Source;
  /** Unique within its source: a YouTube video id, an Instagram media id, a LinkedIn activity number, a URL. */
  externalId: string;
  kind: Kind;
  title: string;
  summary: string;
  content?: string;
  url?: string;
  /** Shown as is. Instagram and LinkedIn picture addresses expire, so their pictures are copied in instead. */
  imageUrl?: string;
  /** A picture copied into the database (insight_images). */
  imageId?: number;
  /** Copy the picture at imageUrl into the database when the post is added. */
  copyImage?: boolean;
  youtubeId?: string;
  /** A LinkedIn video post's player (LinkedIn's embed address). */
  videoUrl?: string;
  meta: string;
  publishedAt: Date;
  /** False for a post the importer read from its source: its text is the source's own. Left out when that isn't
   *  known (a pasted link, whose text the moderator may have changed before adding it). */
  contentEdited?: boolean;
}

/** A post in the inbox. */
export interface InboxItem {
  id: number;
  source: Source;
  externalId: string;
  kind: Kind;
  status: Status;
  featured: boolean;
  title: string;
  summary: string;
  content: string;
  /** Whether the moderator rewrote the text in the inbox; null when that isn't known yet (the next check works it
   *  out). A blog post that wasn't rewritten keeps up with WordPress. */
  contentEdited: boolean | null;
  url: string;
  /** The picture to show: a copied picture's address on this site, or the source's own address. */
  image: string;
  imageId: number | null;
  youtubeId: string;
  videoUrl: string;
  meta: string;
  publishedAt: string;
  importedAt: string;
  decidedAt: string | null;
}

/** What the moderator can change about a post. */
export interface ItemChanges {
  status?: Status;
  featured?: boolean;
  kind?: Kind;
  title?: string;
  summary?: string;
  content?: string;
  /** Set with `content` by the edit endpoint, never by the dashboard itself. */
  contentEdited?: boolean;
  meta?: string;
  imageId?: number | null;
  videoUrl?: string | null;
  publishedAt?: Date;
}

export type SourceState =
  | { state: "connected"; detail?: string }
  | { state: "not-set-up"; detail: string }
  | { state: "manual"; detail: string }
  | { state: "error"; detail: string };

export interface SyncResult {
  source: Source;
  added: number;
  /** Added straight onto the page, by the initial import or the saved social-post preference. */
  approved: boolean;
  error?: string;
  skipped?: string;
}
