// The Insights inbox: posts from ChemLife's channels wait here until the moderator decides whether they show on the
// Insights page. See src/lib/insights-store/README.md.

export type Kind = "Blog" | "Podcast" | "Video";
export type Source = "youtube" | "wordpress" | "instagram" | "linkedin" | "link";
/** pending: waiting for a decision. approved: on the Insights page. hidden: kept out of it. */
export type Status = "pending" | "approved" | "hidden";

export const SOURCES: Source[] = ["youtube", "wordpress", "instagram", "linkedin", "link"];
export const KINDS: Kind[] = ["Blog", "Video", "Podcast"];
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
  meta: string;
  publishedAt: Date;
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
  url: string;
  /** The picture to show: a copied picture's address on this site, or the source's own address. */
  image: string;
  imageId: number | null;
  youtubeId: string;
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
  meta?: string;
  imageId?: number | null;
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
