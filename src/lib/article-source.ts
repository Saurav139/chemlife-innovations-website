import { sanitizeArticleHtml, type ArticleHtml } from "@/lib/article-html";
import { articleSlug } from "@/lib/articles";
import { FALLBACK_INSIGHTS, type InsightItem } from "@/lib/insights";
import { WORDPRESS_SITE } from "@/lib/insights-store/sources";
import { htmlToText, isUnedited } from "@/lib/insights-store/text";

// Server only. An article's page shows the article as it stands on WordPress, formatting included (sub-headings,
// bold text, tables, pictures), so a change made there reaches the page. The Insights inbox keeps plain text only, so
// the formatted version is read from WordPress, at most every 10 minutes for each article. The page falls back to
// the saved plain text when WordPress can't be reached.

const API = `https://public-api.wordpress.com/wp/v2/sites/${WORDPRESS_SITE}/posts`;
const KEEP_FOR = 10 * 60 * 1000;
const WAIT_FOR = 5000;

// Kept in this server process (the article page is rendered for each visit, where fetch() isn't cached).
const kept = new Map<string, { at: number; html: string | null }>();

/** WordPress's HTML for the article with this slug; null if there's no such article or WordPress didn't answer. */
async function wordpressHtml(slug: string): Promise<string | null> {
  const saved = kept.get(slug);
  if (saved && Date.now() - saved.at < KEEP_FOR) return saved.html;
  try {
    const res = await fetch(`${API}?slug=${encodeURIComponent(slug)}&_fields=content`, { cache: "no-store", signal: AbortSignal.timeout(WAIT_FOR) });
    if (!res.ok) throw new Error(`WordPress answered ${res.status}`);
    const [post] = (await res.json()) as { content?: { rendered?: string } }[];
    const html = post?.content?.rendered ?? null;
    kept.set(slug, { at: Date.now(), html });
    return html;
  } catch (error) {
    console.warn(`Article ${slug}: showing the saved text, WordPress couldn't be read`, error);
    // The last copy, if there is one, is better than none. Ask again in a minute rather than on every visit.
    kept.set(slug, { at: Date.now() - KEEP_FOR + 60_000, html: saved?.html ?? null });
    return saved?.html ?? null;
  }
}

/** The article as WordPress has it now, or null to show its saved text: when WordPress can't be read, or when the
 *  text was rewritten in the Insights inbox (the page then shows what the moderator wrote). */
export async function formattedArticle(article: InsightItem): Promise<ArticleHtml | null> {
  const slug = articleSlug(article.linkUrl);
  const source = slug ? await wordpressHtml(slug) : null;
  if (!slug || !source) return null;
  const builtIn = FALLBACK_INSIGHTS.blogs.find((item) => articleSlug(item.linkUrl) === slug)?.content;
  // Where the inbox hasn't recorded whether the text was rewritten, it was if it's neither WordPress's text nor the
  // built-in list's summary.
  const rewritten = article.contentEdited ?? !isUnedited(article.content, htmlToText(source), builtIn);
  if (rewritten && article.content?.trim()) return null;
  // An article that opens with its own picture keeps it as the page's picture; otherwise the card's picture is shown
  // above the text, and left out of the text if it's there too.
  const opening = sanitizeArticleHtml(source);
  const formatted = opening.startsWithImage ? opening : sanitizeArticleHtml(source, article.imageUrl);
  return formatted.html ? formatted : null;
}
