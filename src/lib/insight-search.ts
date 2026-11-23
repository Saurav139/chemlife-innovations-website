// The Insights page's search box: which posts a search finds, and in what order.
//
// A search is split into words. A post is found when every word is somewhere in it: its title, its topic and type
// labels, its summary or its text. So word order doesn't matter ("feed cost poultry"), small words of a question are
// ignored ("what is feed hygiene"), British and American spellings find each other (mould / mold, sulphate / sulfate),
// a plural finds the singular, and a word with one slip in it (a wrong, missing, extra or swapped letter) still finds
// the word that was meant. Posts whose title has the words come first.
//
// No imports here, so the tests can load this file on its own.

export interface Searchable {
  title: string;
  description?: string;
  content?: string;
  /** Other words the post should be found by: its topics' names and its type ("Video", "LinkedIn"). */
  labels?: string[];
}

// How much a word counts by where it's found.
const IN_TITLE = 5;
const IN_LABELS = 3;
const IN_SUMMARY = 2;
const IN_TEXT = 1;
/** Added when the title has the whole search as typed. */
const WHOLE_IN_TITLE = 4;

// Left out of a search when it has other words: "what is feed hygiene" searches for "feed hygiene".
const SMALL_WORDS = new Set(["a", "an", "and", "are", "can", "do", "does", "for", "how", "in", "is", "of", "on", "or", "the", "to", "what", "when", "which", "why", "with"]);

// One spelling for words written two ways.
const SPELLINGS: [RegExp, string][] = [
  [/mould/g, "mold"],
  [/sulph/g, "sulf"],
  [/fibre/g, "fiber"],
  [/colour/g, "color"],
  [/isation/g, "ization"],
];

/** Lower-case, without accents or punctuation, in one spelling. */
export function searchText(text: string | undefined): string {
  let plain = (text ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  for (const [from, to] of SPELLINGS) plain = plain.replace(from, to);
  return plain;
}

/** The words a search looks for: without the small words (unless that's all there is), plurals as singulars. */
export function searchWords(query: string): string[] {
  const all = searchText(query).split(" ").filter(Boolean);
  const kept = all.filter((word) => !SMALL_WORDS.has(word));
  const words = (kept.length > 0 ? kept : all).map((word) => (word.length >= 4 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word));
  return [...new Set(words)];
}

/** Whether two words are the same but for one slip: a wrong, missing, extra or swapped letter. */
function oneSlipApart(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }
  const restA = a.slice(start, endA);
  const restB = b.slice(start, endB);
  if (restA.length <= 1 && restB.length <= 1) return true;
  return restA.length === 2 && restB.length === 2 && restA[0] === restB[1] && restA[1] === restB[0];
}

/** A word of five letters or more also finds a word that starts one slip away from it ("hygeine" finds "hygiene"). */
function nearlyIn(word: string, text: string): boolean {
  if (word.length < 5) return false;
  return text.split(" ").some((other) => other.length >= 4 && (oneSlipApart(word, other) || oneSlipApart(word, other.slice(0, word.length))));
}

/** How well a post answers a search: 0 when it doesn't (a word of the search is nowhere in it), higher for a better
 *  answer. An empty search finds every post equally (1). */
export function searchScore(post: Searchable, query: string): number {
  const words = searchWords(query);
  if (words.length === 0) return 1;
  const title = searchText(post.title);
  const labels = searchText((post.labels ?? []).join(" "));
  const summary = searchText(post.description);
  const text = searchText(post.content);
  let score = 0;
  for (const word of words) {
    const found = title.includes(word) ? IN_TITLE
      : labels.includes(word) ? IN_LABELS
      : summary.includes(word) ? IN_SUMMARY
      : text.includes(word) ? IN_TEXT
      // A slip is looked for only where the word is nowhere as typed, and counts a little less.
      : nearlyIn(word, title) ? IN_TITLE - 1
      : nearlyIn(word, labels) ? IN_LABELS - 1
      : nearlyIn(word, summary) ? IN_SUMMARY - 1
      : 0;
    if (found === 0) return 0;
    score += found;
  }
  const typed = searchText(query);
  return score + (words.length > 1 && title.includes(typed) ? WHOLE_IN_TITLE : 0);
}
