// Topic tags for the Insights page. A post gets its tags from its own words: each topic lists the keywords that
// stand for it, taken from the keyword clusters in the SEO / AEO / GEO keyword strategy (November 2026). To add a
// topic or teach one a new keyword, edit the list below; every post is tagged afresh when the page is shown.
//
// Topic names stay inside that document's safe-claims list: they name subjects ("Poultry Nutrition"), never claims
// ("gut health", "antibiotic-free", "FCR improvement").
//
// No imports here, so the tests can load this file on its own.

export interface InsightTopic {
  /** In the page's address: /insights?topic=<slug>. */
  slug: string;
  name: string;
  /** Lower-case words and phrases. Each matches from the start of a word, with any ending ("mycotoxin" also finds
   *  "mycotoxins", "acidif" finds "acidifier"), except words of four letters or fewer, which match whole ("ph", "fcr",
   *  "egg" or "eggs"). "mould" also finds "mold", and a phrase also finds its hashtag ("feed hygiene", #FeedHygiene). */
  keywords: string[];
}

export const INSIGHT_TOPICS: InsightTopic[] = [
  {
    slug: "feed-hygiene",
    name: "Feed Hygiene",
    keywords: ["feed hygiene", "clean feed", "feed safety", "storage hygiene", "feed storage", "grain storage", "hygiene practice", "feed quality", "feed contamination", "contaminated feed", "moisture", "water activity"],
  },
  {
    slug: "mould-control",
    name: "Mould Control",
    keywords: ["mould", "maxdmold", "syndmold"],
  },
  {
    slug: "mycotoxins",
    name: "Mycotoxins",
    keywords: ["mycotoxin", "toxin binder", "aflatoxin", "fumonisin", "ochratoxin", "zearalenone", "feedgenie", "ddgs-dtox"],
  },
  {
    slug: "milk-safety",
    name: "Aflatoxin M1 & Milk Safety",
    keywords: ["aflatoxin m1", "afm1", "aflamlock", "milk safety", "milk quality", "safe milk", "pure milk", "aflatoxin in milk", "carryover into milk"],
  },
  {
    slug: "dairy-nutrition",
    name: "Dairy Nutrition",
    keywords: ["dairy", "cattle", "cow", "rumen", "ruminant", "bypass", "choline", "methionine", "calving", "milk yield", "methiowiz", "choliwiz", "rumiwiz", "mbiowiz"],
  },
  {
    slug: "poultry-nutrition",
    name: "Poultry Nutrition",
    keywords: ["poultry", "broiler", "layer farm", "layer hen", "laying hen", "eggshell", "egg", "chicken", "flock", "grogenie", "gutprogenie", "livprogenie", "egggenie"],
  },
  {
    slug: "trace-minerals",
    name: "Trace Minerals",
    keywords: ["trace mineral", "chelated", "chelation", "bio-trace", "minbiozen", "bioavailab", "copper", "zinc", "manganese", "selenium"],
  },
  {
    slug: "water-quality",
    name: "Water Quality & Acidifiers",
    keywords: ["water quality", "drinking water", "water ph", "ph", "acidif", "acid", "sdic", "chlorine", "waterborne", "water line"],
  },
  {
    slug: "feed-efficiency",
    name: "Feed Cost & Efficiency",
    keywords: ["feed cost", "feed efficiency", "fcr", "feed conversion", "soybean", "profit", "economics", "close the gap", "cost of"],
  },
  {
    slug: "technology",
    name: "Technology & R&D",
    keywords: ["anbiot", "microencapsul", "green chelation", "green synthesis", "biotransform", "bio-transform", "ayurved", "phytogenic", "phytochemical", "bioactive", "nature-identical", "patent"],
  },
  {
    slug: "export-markets",
    name: "Export Markets",
    keywords: ["export", "nigeria", "ghana", "kenya", "indonesia", "west africa", "philippines", "colombia", "bangladesh", "fami-qs", "importer"],
  },
  {
    slug: "company-news",
    name: "Company News",
    keywords: ["technology development board", "tdb", "c-camp", "k-sap", "milestone", "partnership", "award", "proof in every kilo", "the clean feed advantage", "trade show", "exhibition", "conference", "farmers' meet", "anniversary", "10 years", "ten years", "leadership development", "diwali", "dussehra", "vijayadashami", "kannad", "karnataka rajyotsava"],
  },
];

/** A post never carries more tags than this: the ones its words point to most. */
export const MAX_TOPICS = 3;

// A topic is given when its keywords weigh this much: one mention in the title or the summary (what the card shows),
// or three in the text. A passing mention deep in a long article isn't enough.
const TITLE_WEIGHT = 3;
const SUMMARY_WEIGHT = 3;
const TEXT_WEIGHT = 1;
const ENOUGH = 3;
// However often a long article repeats a word, it counts this many times.
const MOST_PER_KEYWORD = 3;

const escaped = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function keywordPattern(keyword: string): RegExp {
  const words = escaped(keyword).replace(/mould/g, "mou?ld").replace(/ /g, "[\\s-]*");
  return new RegExp(`(?<![a-z0-9])${words}${keyword.length <= 4 ? "s?(?![a-z0-9])" : ""}`, "g");
}

const PATTERNS = INSIGHT_TOPICS.map((topic) => topic.keywords.map(keywordPattern));

const readable = (text: string | undefined) => (text ?? "").toLowerCase().replace(/[\u2018\u2019]/g, "'");
const count = (text: string, pattern: RegExp) => Math.min(text.match(pattern)?.length ?? 0, MOST_PER_KEYWORD);

/** The slugs of a post's topics, strongest first, at most MAX_TOPICS. */
export function topicsFor(item: { title: string; description?: string; content?: string }): string[] {
  const title = readable(item.title);
  const summary = readable(item.description);
  const text = readable(item.content);
  return INSIGHT_TOPICS.map((topic, i) => {
    let score = 0;
    for (const pattern of PATTERNS[i]) {
      score += count(title, pattern) * TITLE_WEIGHT + count(summary, pattern) * SUMMARY_WEIGHT + count(text, pattern) * TEXT_WEIGHT;
    }
    return { slug: topic.slug, score, order: i };
  })
    .filter((topic) => topic.score >= ENOUGH)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, MAX_TOPICS)
    .map((topic) => topic.slug);
}

export const topicBySlug = (slug: string): InsightTopic | undefined => INSIGHT_TOPICS.find((topic) => topic.slug === slug);

/** The name shown for a topic's slug (the slug itself if the topic is no longer in the list). */
export const topicName = (slug: string): string => topicBySlug(slug)?.name ?? slug;
