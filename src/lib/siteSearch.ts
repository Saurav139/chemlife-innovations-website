import { PRODUCTS, RESEARCH_TOPICS, insightAnchor, productPath, researchAnchor } from "@/lib/catalog";
import type { Messages } from "@/i18n/messages";
import type { InsightItem, Insights } from "@/lib/insights";

// The site search: what it looks through (buildSearchIndex) and how it matches and ranks (searchSite).
// It forgives the things visitors actually type: a product name with spaces ("max d mold"), a spelling slip
// ("aflalock"), British or American spelling, plurals, everyday words for a product ("toxin binder") and whole
// questions ("how to apply"). SiteSearch.tsx shows the results; tests/site-search.test.cjs holds it to account.

export type SearchCategory = "Page" | "Product" | "Research" | "Article" | "Video" | "Podcast";

/** One thing the search can find. */
export interface SearchEntry {
  title: string;
  category: SearchCategory;
  /** The line shown under the title. */
  description: string;
  /** Where the result goes: a page, or one item on it (/research#research-…). */
  link: string;
  /** Other names and phrases people search by, never shown ("toxin binder", "phone number"). */
  aliases?: string[];
  /** The rest of the item's text. A match here ranks lower, and shows the sentence it was found in. */
  body?: string;
  /** When it was published (Insights), so newer posts come first among equals. */
  date?: number;
}

export interface SearchResult extends SearchEntry {
  /** The line to show: the description, or the part of the body the search matched. */
  snippet: string;
}

export interface SearchOutcome {
  results: SearchResult[];
  /** True when nothing has every word typed, and these are the closest matches instead. */
  partial: boolean;
  /** For highlight(): the words that count as a match. */
  terms: SearchTerm[];
}

export interface SearchTerm {
  term: string;
  /** A spelling correction: only the whole word matches. */
  exact: boolean;
}

// ───────────────────────────── Words ─────────────────────────────

// Letters, digits and combining marks (the vowel signs of Indian scripts) make up a word.
const NOT_WORD = new RegExp("[^\\p{L}\\p{N}\\p{M}]+", "u");
const WORD = new RegExp("[\\p{L}\\p{N}\\p{M}'’]+", "gu");

/** Lower case, without accents or apostrophes: "Isn’t" and "isn't" both become "isnt". */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC")
    .replace(/['’‘`´]/g, "");
}

// British spellings are read as American, so either finds both.
const SPELLINGS: [RegExp, string][] = [
  [/mould/g, "mold"],
  [/sulph/g, "sulf"],
  [/isation/g, "ization"],
  [/^(optim|stabil|util|organ|standard|commercial|neutral|maxim|minim)is(e|ed|es|ing)$/, "$1iz$2"],
  [/fibre/g, "fiber"],
  [/colour/g, "color"],
  [/flavour/g, "flavor"],
  [/programme/g, "program"],
  [/catalogue/g, "catalog"],
  [/^enquir/, "inquir"],
];

const NUMBER_WORDS: Record<string, string> = { one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10" };

/** The form a word is compared in: one spelling, singular. "Moulds" and "mold" are the same word. */
function canon(word: string): string {
  let w = NUMBER_WORDS[word] ?? word;
  for (const [from, to] of SPELLINGS) w = w.replace(from, to);
  if (w.length <= 3 || /\d/.test(w)) return w;
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (/(ss|us|is)$/.test(w)) return w;
  if (/(ch|sh|x|z|ss)es$/.test(w)) return w.slice(0, -2);
  if (w.endsWith("s")) return w.slice(0, -1);
  return w;
}

function wordsOf(text: string): string[] {
  return normalize(text).split(NOT_WORD).filter(Boolean).map(canon);
}

// Words that carry no meaning in a question ("how do I apply" is a search for "apply"). They only count when the
// search is nothing else ("who we are").
const STOP_WORDS = new Set(
  "a an and any are as at be become by can do does find for from get have how i in is it its many me much my need of on or our that the their there this to us want was we what when where which who why with you your".split(" "),
);

// Everyday words for the words the site uses. Checked in their compared form (singular).
const SYNONYMS: Record<string, string[]> = {
  chicken: ["poultry"],
  broiler: ["poultry"],
  hen: ["poultry", "layer"],
  bird: ["poultry"],
  cow: ["dairy", "cattle"],
  cattle: ["dairy"],
  buffalo: ["dairy", "cattle"],
  calf: ["dairy", "cattle"],
  pig: ["swine"],
  piglet: ["swine"],
  hog: ["swine"],
  fungus: ["mold", "fungal"],
  fungi: ["mold", "fungal"],
  fungal: ["mold"],
  antifungal: ["mold"],
  binder: ["bind", "adsorption"],
  soya: ["soybean"],
  article: ["blog"],
  doctor: ["dr"],
};

// ───────────────────────────── Matching one word ─────────────────────────────

function sharedStart(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/**
 * How well a typed word matches a word of the text, from 0 (not at all) to 1 (the same word):
 * the start of a word ("methio" in "methiowiz"), another form of it ("chelated" and "chelation"), or its ending
 * ("toxin" in "mycotoxin", "genie" in "grogenie"). In a title, anywhere inside counts ("bio" in "mbiowiz").
 * `mode`: "exact" for a spelling correction, "start" for words typed apart and joined ("max d mold").
 * `startFactor` is below 1 for a word that is complete as typed, a word the site uses on its own: then it doesn't
 * match longer words that start with it ("intern" is not "international") or other forms of it ("interact"),
 * except in a title, where it ranks lower ("product" before "production").
 */
function wordMatch(term: string, token: string, inTitle: boolean, mode: "any" | "start" | "exact", minStart: number, startFactor = 1): number {
  if (term === token) return 1;
  if (mode === "exact" || term.length < minStart || /^\d+$/.test(term)) return 0;
  const whole = startFactor < 1 && !inTitle;
  if (token.startsWith(term)) return whole ? 0 : (0.6 + 0.35 * (term.length / token.length)) * startFactor;
  if (mode === "start") return 0;
  const shared = sharedStart(term, token);
  if (!whole && shared >= 5 && shared / Math.max(term.length, token.length) >= 0.6) return 0.5;
  if (term.length >= 4 && token.endsWith(term)) return 0.45;
  if (inTitle && term.length >= 3 && token.includes(term)) return 0.45;
  return 0;
}

/** How many single-letter slips apart two words are (a swap of neighbours counts as one), up to `max`. */
function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let twoBack: number[] = [];
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) value = Math.min(value, twoBack[j - 2] + 1);
      current.push(value);
      best = Math.min(best, value);
    }
    if (best > max) return max + 1;
    twoBack = previous;
    previous = current;
  }
  return previous[b.length];
}

// ───────────────────────────── The index ─────────────────────────────

interface Field {
  weight: number;
  tokens: string[];
  /** Neighbouring words joined, so "ddgsdtox" finds "DDGS-Dtox" and "feedbites" finds "Feed Bites". */
  joined: string[];
  inTitle: boolean;
}

interface Prepared {
  entry: SearchEntry;
  order: number;
  fields: Field[];
  /** The title with no spaces ("maxdmoldspray"), to recognise a name however it's typed. */
  compactTitle: string;
  titlePhrase: string;
  aliasPhrases: Set<string>;
  descriptionPhrase: string;
  bodyPhrase: string;
}

export interface SearchIndex {
  items: Prepared[];
  /** Every word on the site, to correct spelling against. */
  vocabulary: string[];
  words: Set<string>;
}

// How much a match counts by where it is. A long title shares its weight between more words.
const TITLE = 10;
const ALIAS = 9;
const DESCRIPTION = 4;
const BODY = 2;
const TAG = 3;

// What a result is called, so "poultry podcast" or "dairy products" narrows to that kind.
const TAGS: Record<SearchCategory, string> = {
  Page: "page",
  Product: "product",
  Research: "research technology",
  Article: "article blog post",
  Video: "video",
  Podcast: "podcast",
};

// Among equally good matches, a product or a page is more likely what the visitor wants than a post mentioning it.
const PRIOR: Record<SearchCategory, number> = { Product: 1.3, Page: 1.2, Research: 1.1, Article: 1, Video: 1, Podcast: 1 };
// Unless they ask a question ("what is FCR"): then something that explains comes before something to buy.
const QUESTION = new Set(["what", "why", "how"]);
const QUESTION_PRIOR: Record<SearchCategory, number> = { Product: 1, Page: 1.2, Research: 1.1, Article: 1.15, Video: 1.15, Podcast: 1.15 };

// A product or research topic is described by its body; a page or a post only mentions things in it.
const OWN_TEXT = new Set<SearchCategory>(["Product", "Research"]);

const unique = (tokens: string[]) => [...new Set(tokens)];
// Joined as written, before plurals are trimmed: "Feed" + "Bites" is "feedbites".
const joins = (text: string) => {
  const raw = normalize(text).split(NOT_WORD).filter(Boolean);
  return raw.slice(1).map((word, i) => canon(raw[i] + word));
};
const phrase = (tokens: string[]) => ` ${tokens.join(" ")} `;

function prepareIndex(entries: SearchEntry[]): SearchIndex {
  const items = entries.map((entry, order): Prepared => {
    const title = wordsOf(entry.title);
    const aliases = (entry.aliases ?? []).map(wordsOf).filter((words) => words.length > 0);
    const titleWeight = TITLE * (1 - Math.min(0.3, 0.03 * Math.max(0, title.length - 2)));
    return {
      entry,
      order,
      fields: [
        { weight: titleWeight, tokens: unique(title), joined: unique(joins(entry.title)), inTitle: true },
        { weight: ALIAS, tokens: unique(aliases.flat()), joined: unique((entry.aliases ?? []).flatMap(joins)), inTitle: false },
        { weight: DESCRIPTION, tokens: unique(wordsOf(entry.description)), joined: [], inTitle: false },
        { weight: OWN_TEXT.has(entry.category) ? DESCRIPTION : BODY, tokens: unique(wordsOf(entry.body ?? "")), joined: [], inTitle: false },
        { weight: TAG, tokens: wordsOf(TAGS[entry.category]), joined: [], inTitle: false },
      ],
      compactTitle: title.join(""),
      titlePhrase: phrase(title),
      aliasPhrases: new Set(aliases.map((words) => words.join(" "))),
      descriptionPhrase: phrase(wordsOf(entry.description)),
      bodyPhrase: phrase(wordsOf(entry.body ?? "")),
    };
  });
  const words = new Set(items.flatMap((item) => item.fields.flatMap((field) => field.tokens)));
  const vocabulary = [...new Set([...words, ...items.flatMap((item) => item.fields.flatMap((field) => field.joined))])].filter((word) => word.length >= 3);
  return { items, vocabulary, words };
}

// ───────────────────────────── Searching ─────────────────────────────

interface Alternative {
  term: string;
  factor: number;
  mode: "any" | "start" | "exact";
  startFactor?: number;
}

/** How well an item matches one typed word (or one of its stand-ins): its best place, plus a little for the others. */
function termScore(item: Prepared, alternatives: Alternative[], minStart: number): number {
  let top = 0;
  for (const { term, factor, mode, startFactor } of alternatives) {
    let best = 0;
    let sum = 0;
    for (const field of item.fields) {
      let match = 0;
      for (const token of field.tokens) {
        const m = wordMatch(term, token, field.inTitle, mode, minStart, startFactor);
        if (m > match) match = m;
        if (match === 1) break;
      }
      // Words written apart on the site and typed as one: only the whole word, or its start.
      if (match < 0.9) for (const token of field.joined) match = Math.max(match, 0.9 * wordMatch(term, token, false, mode === "exact" ? "exact" : "start", minStart));
      const score = match * field.weight;
      sum += score;
      if (score > best) best = score;
    }
    top = Math.max(top, factor * (best + 0.25 * (sum - best)));
  }
  return top;
}

/** Words on the site within a slip or two of a word that matched nothing: "aflalock" → "aflamlock". */
function corrections(term: string, vocabulary: string[]): Alternative[] {
  const max = term.length >= 8 ? 2 : 1;
  const found: Alternative[] = [];
  for (const word of vocabulary) {
    if (term.length <= 5 && word[0] !== term[0]) continue;
    let distance = editDistance(term, word, max);
    let factor = distance === 1 ? 0.6 : 0.42;
    // Still typing: compare with the start of longer words ("maxmol" → "maxdmol[d]").
    if (distance > max && term.length >= 5 && word.length > term.length + 1) {
      distance = Math.min(editDistance(term, word.slice(0, term.length), 1), editDistance(term, word.slice(0, term.length + 1), 1));
      factor = 0.4;
      if (distance > 1) continue;
    }
    if (distance <= max) found.push({ term: word, factor, mode: "exact" });
  }
  return found;
}

const MAX_WORDS = 8;
const MAX_RESULTS = 20;

export function searchSite(index: SearchIndex, query: string): SearchOutcome {
  const typed = wordsOf(query).slice(0, MAX_WORDS);
  if (typed.length === 0) return { results: [], partial: false, terms: [] };
  // Small words ("how do I apply") needn't be found, unless the search is nothing else ("who we are").
  const meaningful = typed.filter((word) => !STOP_WORDS.has(word));
  const words = meaningful.length > 0 ? meaningful : typed;
  const needed = typed.map((word) => meaningful.length === 0 || !STOP_WORDS.has(word));
  // A single letter on its own lists what starts with it; among other words it must be a word itself ("R&D").
  const minStart = words.length === 1 ? 1 : 2;

  // Every run of up to three neighbouring words is also tried as one word: "max d mold" → "maxdmold".
  const scores = new Map<string, Float32Array>();
  const terms: SearchTerm[] = [];
  const scoreOf = (from: number, to: number): Float32Array => {
    const key = `${from}-${to}`;
    const cached = scores.get(key);
    if (cached) return cached;
    const term = canon(typed.slice(from, to).join(""));
    const single = to - from === 1;
    const alternatives: Alternative[] = [{ term, factor: 1, mode: single ? "any" : "start", startFactor: index.words.has(term) ? 0.6 : 1 }];
    if (single) for (const synonym of SYNONYMS[term] ?? []) alternatives.push({ term: synonym, factor: 0.75, mode: "any" });
    let result = Float32Array.from(index.items, (item) => termScore(item, alternatives, minStart));
    if (single && term.length >= 4 && !/\d/.test(term) && result.every((score) => score === 0)) {
      const fixes = corrections(term, index.vocabulary);
      if (fixes.length > 0) {
        result = Float32Array.from(index.items, (item) => termScore(item, fixes, minStart));
        alternatives.push(...fixes);
      }
    }
    if (single || result.some((score) => score > 0)) for (const a of alternatives) terms.push({ term: a.term, exact: a.mode === "exact" });
    scores.set(key, result);
    return result;
  };

  const prior = meaningful.length > 0 && typed.some((word) => QUESTION.has(word)) ? QUESTION_PRIOR : PRIOR;

  // The search as a whole, with and without its small words.
  const whole = words.length === typed.length ? [typed] : [typed, words];

  const ranked = index.items
    .map((item, at) => {
      // The best way to read the words (apart or joined): most words matched first, then the highest score.
      const best: { matched: number; score: number }[] = [{ matched: 0, score: 0 }];
      for (let to = 1; to <= typed.length; to++) {
        let pick = { matched: -1, score: 0 };
        for (let from = Math.max(0, to - 3); from < to; from++) {
          const size = to - from;
          const single = size === 1;
          // A small word on its own adds nothing; joined to its neighbour it can ("an biot" → "anbiot").
          const score = single && !needed[from] ? 0 : scoreOf(from, to)[at];
          if (score === 0 && !single) continue;
          const found = score > 0 ? needed.slice(from, to).filter(Boolean).length : 0;
          const candidate = { matched: best[from].matched + found, score: best[from].score + score * size };
          if (candidate.matched > pick.matched || (candidate.matched === pick.matched && candidate.score > pick.score)) pick = candidate;
        }
        best.push(pick);
      }
      const { matched } = best[typed.length];
      let { score } = best[typed.length];
      if (matched === 0) return null;

      // The whole search, in one place, says more than its words scattered about.
      let bonus = 0;
      for (const form of whole) {
        const compact = form.join("");
        const several = form.length > 1;
        let extra = 0;
        // A title that starts with it counts for more the more of the title it is ("maxdmold" before "maxdmold plus").
        if (item.compactTitle === compact) extra += 12;
        else if (item.compactTitle.startsWith(compact)) extra += 3 + 5 * (compact.length / item.compactTitle.length);
        else if (several && item.titlePhrase.includes(phrase(form))) extra += 3 * form.length;
        if (item.aliasPhrases.has(form.join(" "))) extra += 8;
        if (several && item.descriptionPhrase.includes(phrase(form))) extra += 2 * form.length;
        else if (several && item.bodyPhrase.includes(phrase(form))) extra += form.length;
        bonus = Math.max(bonus, extra);
      }
      score += bonus;

      return { item, matched, score: score * prior[item.entry.category] };
    })
    .filter((result): result is { item: Prepared; matched: number; score: number } => result !== null);

  // Everything typed must be found. If nothing has it all, the closest results (at least half the words) are shown.
  let hits = ranked.filter((result) => result.matched === words.length);
  const partial = hits.length === 0;
  if (partial) {
    const most = Math.max(0, ...ranked.map((result) => result.matched));
    hits = most * 2 >= words.length ? ranked.filter((result) => result.matched === most) : [];
  }

  hits.sort((a, b) => b.score - a.score || (b.item.entry.date ?? 0) - (a.item.entry.date ?? 0) || a.item.order - b.item.order);
  // A passing mention is dropped when there are far better matches.
  const floor = (hits[0]?.score ?? 0) * 0.25;
  const results = hits
    .filter((result) => result.score >= floor)
    .slice(0, MAX_RESULTS)
    .map(({ item }) => ({ ...item.entry, snippet: snippetFor(item.entry, terms) }));

  return { results, partial, terms };
}

// ───────────────────────────── Showing a match ─────────────────────────────

function isHit(word: string, terms: SearchTerm[]): boolean {
  const token = canon(normalize(word));
  return terms.some(({ term, exact }) => wordMatch(term, token, true, exact ? "exact" : "any", 2) > 0);
}

/** Splits text into pieces, marking the words the search matched, to show them in bold. */
export function highlight(text: string, terms: SearchTerm[]): { text: string; hit: boolean }[] {
  const parts: { text: string; hit: boolean }[] = [];
  let at = 0;
  for (const match of text.matchAll(WORD)) {
    if (!isHit(match[0], terms)) continue;
    if (match.index > at) parts.push({ text: text.slice(at, match.index), hit: false });
    parts.push({ text: match[0], hit: true });
    at = match.index + match[0].length;
  }
  if (at < text.length) parts.push({ text: text.slice(at), hit: false });
  return parts;
}

const SNIPPET_LENGTH = 150;

/** The description, unless the match is only in the body: then the part of the body around it. */
function snippetFor(entry: SearchEntry, terms: SearchTerm[]): string {
  if (!entry.body) return entry.description;
  const found = (text: string) => [...text.matchAll(WORD)].find((match) => isHit(match[0], terms));
  if (found(entry.title) || found(entry.description) || entry.aliases?.some(found)) return entry.description;
  const body = entry.body.replace(/\s+/g, " ").trim();
  const match = found(body);
  if (!match) return entry.description;
  // Start at the sentence the word is in, or a few words before it in a long sentence.
  const after = (mark: string) => {
    const at = body.lastIndexOf(mark, match.index);
    return at < 0 ? 0 : at + mark.length;
  };
  let start = Math.max(after(". "), after("? "), after("! "));
  if (match.index - start > 60) start = body.indexOf(" ", match.index - 60) + 1;
  let end = Math.min(body.length, start + SNIPPET_LENGTH);
  if (end < body.length) end = body.lastIndexOf(" ", end);
  return `${start > 0 ? "…" : ""}${body.slice(start, end)}${end < body.length ? "…" : ""}`;
}

// ───────────────────────────── What the site holds ─────────────────────────────

interface PageEntry {
  title: string;
  link: string;
  description: string;
  aliases: string;
  /** The page's own name in the visitor's language, where the site has one. */
  label?: (m: Messages) => string;
  /** Its description in the visitor's language, where the site has one. */
  summary?: (m: Messages) => string;
  /** The page's text, searched after its title and aliases. */
  body?: (m: Messages) => unknown;
}

// The site's pages, and the parts of them people look for by name. Aliases are separated by commas.
// About Us, Careers, Privacy Policy and Terms of Use are found by their name only: nothing on them is searched (no
// text, sections or roles).
const PAGES: PageEntry[] = [
  {
    title: "Home",
    link: "/",
    description: "Nature-driven functional feed additives and our process, from research to delivery.",
    aliases: "homepage, main page, overview, chemlife, our process, how we do it, partners, testimonials, social responsibility, csr",
    label: (m) => m.nav.home,
    summary: (m) => m.meta.home.description,
    body: (m) => [m.home.howWeDo, m.home.life, m.home.social],
  },
  {
    title: "About Us",
    link: "/about",
    description: "Our mission, core values and leadership team.",
    aliases: "about, about chemlife, about the company, company",
    label: (m) => m.nav.about,
  },
  {
    title: "Who We Are",
    link: "/who-we-are",
    description: "ChemLife at a glance: what we make, technologies, certification, partners and leadership.",
    aliases: "company profile, at a glance, facts, certification, certifications, certified, fami-qs, quality, partners, manufacturing, plant",
    label: (m) => m.home.whoWeAre.homeTitle,
    summary: (m) => m.meta.whoWeAre.description,
    body: (m) => [m.home.whoWeAre.intro, m.home.whoWeAre.facts],
  },
  {
    title: "Leadership",
    link: "/who-we-are#leadership",
    description: "ChemLife's board of directors, on the Who We Are page.",
    aliases: "leadership team, leaders, directors, board of directors, board, management, founders, chairman, managing director, md, ceo, team",
    // The page's heading for it is the label of its last fact, which names the directors.
    label: (m) => m.home.whoWeAre.facts[m.home.whoWeAre.facts.length - 1].label,
    body: (m) => [m.home.whoWeAre.facts[m.home.whoWeAre.facts.length - 1], m.home.whoWeAre.leadershipCaption],
  },
  {
    title: "Questions & Answers",
    link: "/who-we-are#questions",
    description: "Common questions about ChemLife, on the Who We Are page.",
    aliases: "faq, faqs, questions, frequently asked questions, help, answers",
    label: (m) => m.home.whoWeAre.faqTitle,
    body: (m) => m.home.whoWeAre.faq,
  },
  {
    title: "Awards & Recognition",
    link: "/#awards",
    description: "Awards and support ChemLife has received, on the home page.",
    aliases: "awards, award, honors, honours, recognition, achievements, accolades, grants",
    label: (m) => m.home.awards.title,
    body: (m) => m.home.awards.items,
  },
  {
    title: "Products & Solutions",
    link: "/products",
    description: "All our feed additives for poultry, swine, dairy and cattle.",
    aliases: "products, all products, product list, product range, solutions, feed additives, additives, catalogue, portfolio, range, poultry, swine, dairy, cattle, ruminants, mono-gastric",
    label: (m) => m.nav.products,
    summary: (m) => m.meta.products.description,
    body: (m) => m.products.intro,
  },
  {
    title: "Research & Development",
    link: "/research",
    description: "Our research pipeline, including ANBioT bio-transformation.",
    aliases: "research, r&d, r and d, technology, technologies, science, innovation, pipeline, dossier, lab, laboratory, collaboration",
    label: (m) => m.nav.research,
    summary: (m) => m.meta.research.description,
    body: (m) => [m.research.intro, m.research.ctaText],
  },
  {
    title: "Insights",
    link: "/insights",
    description: "Articles, videos and podcasts on feed hygiene, gut health and chelation.",
    aliases: "blog, blogs, articles, posts, podcasts, videos, news, updates, media, learning, knowledge, linkedin, instagram, youtube",
    label: (m) => m.nav.insights,
  },
  {
    title: "Careers",
    link: "/careers",
    description: "Internships at ChemLife and how to apply.",
    aliases: "career, jobs, job openings, openings, vacancy, vacancies, hiring, recruitment, employment, work with us, join us, apply, how to apply, application, resume, cv, internship, internships, intern",
    label: (m) => m.nav.careers,
  },
  {
    title: "Contact Us",
    link: "/contact",
    description: "Send us a message, or find our office and plant.",
    aliases:
      "contact, get in touch, reach us, message, email, mail, phone, phone number, call, telephone, mobile, whatsapp, address, location, located, map, directions, office, plant, factory, enquiry, quote, quotation, price, pricing, buy, purchase, order, sample, dealer, distributor, distribution, dealership, sales, talk to a nutritionist, nutritionist, support",
    label: (m) => m.nav.contact,
    summary: (m) => m.meta.contact.description,
    body: (m) => [m.contact.intro, m.contact.plantText],
  },
  {
    title: "AI Experts",
    link: "/chat",
    description: "Ask Dr. Kukku (poultry) or Dr. Mikku (dairy), our AI nutrition assistants.",
    aliases: "ai, chat, chatbot, bot, assistant, ask, ask an expert, expert, kukku, mikku, dr kukku, dr mikku, ask a question",
  },
  {
    title: "Privacy Policy",
    link: "/privacy",
    description: "How ChemLife collects, uses and protects your information.",
    aliases: "privacy, privacy policy",
  },
  {
    title: "Terms of Use",
    link: "/terms",
    description: "The terms for using this website.",
    aliases: "terms, terms of use, terms and conditions",
  },
];

// The animals each product group is for, in the words people search by.
const SPECIES: Record<string, string> = {
  "Mono-gastric": "monogastric, poultry, chicken, broiler, swine, pig",
  Ruminants: "ruminant, dairy, cattle, cow, buffalo, goat, sheep",
};

// What each product is, in the words a farmer or nutritionist would type. Keep to what the product page says.
const PRODUCT_TERMS: Record<string, string> = {
  MaxDmold: "mold inhibitor, antifungal, fungus, fungi, feed preservative",
  "MaxDmold Spray": "liquid mold inhibitor, mold inhibitor, antifungal, fungus, fungi, silo, grain storage",
  SynDmold: "mold inhibitor, antifungal, fungus, fungi",
  "MaxDmold Plus": "mold inhibitor, antifungal, fungus, fungi, antibacterial",
  MethioWiz: "bypass methionine, protected methionine",
  "MBioWiz Plus": "yeast, enzymes, rumen fermentation",
  "MBioWiz TS": "thermostable, heat stable, pelleted feed, rumen fermentation",
  CholiWiz: "bypass choline, protected choline, liver, transition cow",
  RumiWiz: "rumen buffer, buffer, acidosis",
  MinBioZen: "chelated minerals, chelated trace minerals, organic minerals, bio-trace minerals",
  "GroGenie (12% & 60%)": "gut health, halquinol, non-antibiotic",
  LivproGenie: "liver support, liver tonic, liver health",
  EggGenie: "egg, eggshell, layer, laying hens, egg production",
  GutproGenie: "gut health, gut flora",
  AflaMlock: "toxin binder, mycotoxin binder, aflatoxin binder",
  "FeedGenie Forte": "toxin binder, mycotoxin binder, aflatoxin binder",
  "DDGS-Dtox": "toxin binder, aflatoxin binder, detox, distillers grains",
  "FeedGenie Prime": "toxin binder, mycotoxin binder, multi-mycotoxin",
};

const list = (aliases: string) => aliases.split(",").map((alias) => alias.trim()).filter(Boolean);

/** Every piece of text in a value, however it's nested: a string, a list, or an object of them. */
function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).map((text) => (/[.!?…]$/.test(text) ? text : `${text}.`)).join(" ");
  if (value && typeof value === "object") return textOf(Object.values(value));
  return "";
}

export interface IndexSources {
  /** The page's language. */
  messages: Messages;
  /** English, on a page in another language, so English words still find things. Leave out on English pages. */
  english?: Messages;
  /** Turns an English path into the page's language (/products → /kn/products). */
  href: (path: string) => string;
  /** The Insights posts, once they've loaded. */
  insights?: Insights | null;
  /** Where an Insights post opens. By default, its card on the Insights page. */
  insightHref?: (item: InsightItem) => string;
}

export function buildSearchIndex({ messages: t, english, href, insights, insightHref }: IndexSources): SearchIndex {
  const en = english && english !== t ? english : null;
  // In another language, the English text is searched too (after the page's own).
  const both = (pick: (m: Messages) => unknown) => textOf(en ? [pick(t), pick(en)] : pick(t));

  const pages = PAGES.map((page): SearchEntry => {
    // In another language, the page's own name and description; the English ones still find it.
    const body = page.body ? both(page.body) : "";
    return {
      title: en && page.label ? page.label(t) : page.title,
      category: "Page",
      description: en && page.summary ? page.summary(t) : page.description,
      link: href(page.link),
      aliases: [...list(page.aliases), page.title],
      body: en ? `${body} ${page.description}` : body,
    };
  });

  const products = PRODUCTS.map((product, i): SearchEntry => {
    const text = t.products.items[i];
    return {
      title: product.name,
      category: "Product",
      description: text.tagline ?? text.about,
      link: href(productPath(product.name)),
      aliases: [product.category, ...list(SPECIES[product.category] ?? ""), ...list(PRODUCT_TERMS[product.name] ?? "")],
      body: both((m) => [m.products.items[i].about, m.products.items[i].features, m.products.items[i].tagline]),
    };
  });

  const research = RESEARCH_TOPICS.map((topic, i): SearchEntry => {
    const text = t.research.topics[i];
    return {
      title: text.title,
      category: "Research",
      description: text.tagline,
      link: href(`/research#${researchAnchor(topic.englishTitle)}`),
      aliases: [topic.englishTitle],
      body: both((m) => {
        const { title: _title, ...rest } = m.research.topics[i];
        return rest;
      }),
    };
  });

  const media = (insights ? [...insights.blogs, ...insights.videos, ...insights.podcasts] : []).map(
    (item): SearchEntry => ({
      title: item.title,
      category: item.type === "Blog" ? "Article" : item.type,
      description: item.description,
      link: insightHref?.(item) ?? `/insights#${insightAnchor(item.title)}`,
      body: item.content,
      date: Date.parse(item.date) || 0,
    }),
  );

  // One result per address. The same post on LinkedIn and Instagram goes to one place, even when the titles differ
  // by an emoji. The results list tells its rows apart by their address: two alike, and a row can stay on screen
  // after the search has changed.
  const seen = new Set<string>();
  const entries = [...products, ...research, ...pages, ...media].filter((entry) => !seen.has(entry.link) && seen.add(entry.link));
  return prepareIndex(entries);
}
