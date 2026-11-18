// The Insights page's filters, and how they're written in the page's address, so a filtered view can be linked to
// and shared: /insights?topic=mycotoxins,feed-hygiene&type=blogs&sort=oldest&q=copper
//
// No imports here, so the tests can load this file on its own.

/** The kinds of post, in the order the filter lists them. `tag` is the label on a card (insightTag). */
export const CONTENT_TYPES = [
  { slug: "blogs", name: "Blogs", tag: "Blog" },
  { slug: "articles", name: "Articles", tag: "Article" },
  { slug: "linkedin", name: "LinkedIn", tag: "LinkedIn" },
  { slug: "instagram", name: "Instagram", tag: "Instagram" },
  { slug: "podcasts", name: "Podcasts", tag: "Podcast" },
  { slug: "videos", name: "Videos", tag: "Video" },
] as const;

export type InsightSort = "newest" | "oldest";

export interface InsightFilters {
  /** What the visitor typed in the search box. */
  query: string;
  /** Content type slugs; a post of any of them is shown. None chosen shows every type. */
  types: string[];
  /** Topic slugs (src/lib/insight-topics.ts); a post with any of them is shown. None chosen shows every topic. */
  topics: string[];
  sort: InsightSort;
}

export const NO_FILTERS: InsightFilters = { query: "", types: [], topics: [], sort: "newest" };

/** Whether anything narrows the list (the order alone doesn't). */
export const isFiltered = (filters: InsightFilters) => filters.query.trim() !== "" || filters.types.length > 0 || filters.topics.length > 0;

type Params = Record<string, string | string[] | undefined>;

const slugs = (value: string | string[] | undefined): string[] => [
  ...new Set(
    [value ?? []]
      .flat()
      .flatMap((part) => part.split(","))
      .map((slug) => slug.trim().toLowerCase())
      .filter((slug) => /^[a-z0-9-]+$/.test(slug)),
  ),
];

/** The filters an address asks for. Content types it doesn't know are dropped; `knownTopics` does the same for topics. */
export function parseFilters(params: Params, knownTopics?: readonly string[]): InsightFilters {
  const query = [params.q ?? ""].flat()[0].slice(0, 100);
  return {
    query,
    types: slugs(params.type).filter((slug) => CONTENT_TYPES.some((type) => type.slug === slug)),
    topics: slugs(params.topic).filter((slug) => !knownTopics || knownTopics.includes(slug)),
    sort: [params.sort ?? ""].flat()[0] === "oldest" ? "oldest" : "newest",
  };
}

/** The address's query for these filters, "?…", or "" when nothing is chosen. */
export function filtersQuery(filters: InsightFilters): string {
  const parts = [
    filters.topics.length ? `topic=${filters.topics.join(",")}` : "",
    filters.types.length ? `type=${filters.types.join(",")}` : "",
    filters.sort === "oldest" ? "sort=oldest" : "",
    filters.query.trim() ? `q=${encodeURIComponent(filters.query.trim())}` : "",
  ].filter(Boolean);
  return parts.length ? `?${parts.join("&")}` : "";
}

/** The list with the value added if it's missing, removed if it's there. */
export const toggled = (list: string[], value: string) => (list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value]);
