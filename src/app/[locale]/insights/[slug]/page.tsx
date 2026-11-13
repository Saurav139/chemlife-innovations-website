import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";
import { VariantProvider } from "@/context/VariantContext";
import { formattedArticle } from "@/lib/article-source";
import { articleBlocks, articlePath, isOptimizableImage, isoDate } from "@/lib/articles";
import { getArticle, type InsightItem } from "@/lib/insights";
import { SITE_NAME, SITE_URL, pageMetadata } from "@/lib/seo";
import { jsonLd } from "@/lib/structuredData";
import ArticleShare from "./ArticleShare";
import styles from "./article.module.css";

type Params = Promise<{ locale: string; slug: string }>;

// A blog article's own page, e.g. /insights/feed-hygiene-101. The articles come from WordPress through the Insights
// inbox, so like the Insights page this is rendered for each visit: a post approved or hidden there shows at once.
// English only, through the Insights layout.
export const dynamic = "force-dynamic";

const IMAGE_SIZES = "(min-width: 816px) 768px, calc(100vw - 48px)";
const CARD_IMAGE_SIZES = "(min-width: 1024px) 352px, (min-width: 640px) 45vw, calc(100vw - 48px)";
const MORE_ARTICLES = 3;

// The page and its metadata look the article up once per visit.
const findArticle = cache(getArticle);

const absolute = (src: string) => (src.startsWith("/") ? `${SITE_URL}${src}` : src);
const newestFirst = (a: InsightItem, b: InsightItem) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = await findArticle((await params).slug);
  if (!found) return {};
  const { article } = found;
  const description = article.description.length > 160 ? `${article.description.slice(0, 157).trimEnd()}…` : article.description;
  const meta = pageMetadata({ title: article.title, description, path: articlePath(article)! });
  const images = article.imageUrl ? [{ url: absolute(article.imageUrl), alt: article.title }] : undefined;
  const published = isoDate(article.date);
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: "article", ...(published && { publishedTime: published }), ...(images && { images }) },
    twitter: { ...meta.twitter, ...(images && { images }) },
  };
}

export default async function ArticlePage({ params }: { params: Params }) {
  const found = await findArticle((await params).slug);
  if (!found) notFound();
  const { article } = found;
  const path = articlePath(article)!;
  const published = isoDate(article.date);
  // The article as WordPress formats it; without it (WordPress unreachable, or text rewritten in the inbox), the saved text.
  const formatted = await formattedArticle(article);

  // The articles either side of this one by date, then others to read (those two last, as they're already offered).
  const all = [article, ...found.others].sort(newestFirst);
  const at = all.indexOf(article);
  const newer = all[at - 1];
  const older = all[at + 1];
  const others = [...all.filter((item) => item !== article && item !== newer && item !== older), ...[newer, older].filter(Boolean)].slice(0, MORE_ARTICLES);

  const posting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    ...(article.imageUrl && { image: absolute(article.imageUrl) }),
    ...(published && { datePublished: published }),
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}${path}`,
    inLanguage: "en",
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Home", item: SITE_URL },
      { name: "Insights", item: `${SITE_URL}/insights` },
      { name: article.title, item: `${SITE_URL}${path}` },
    ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
  };

  return (
    <VariantProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(posting)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(crumbs)} />
      <Header />

      <main id="main" tabIndex={-1} className="bg-white min-h-screen text-brand-navy">
        <section className="pt-40 md:pt-44 pb-10 md:pb-14 bg-brand-navy text-white">
          <div className="max-w-3xl mx-auto px-6">
            <nav aria-label="Breadcrumb" className="mb-5 text-sm">
              <Link href="/insights" className="text-teal-aa-light font-semibold hover:text-white transition-colors">
                ← All insights
              </Link>
            </nav>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">{article.title}</h1>
            <p className="mt-4 text-white/75 text-sm md:text-base">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 mr-2 align-middle">Blog</span>
              {published ? <time dateTime={published}>{article.date}</time> : article.date}
              {article.meta && <> • {article.meta}</>}
            </p>
          </div>
        </section>

        <article className="max-w-3xl mx-auto px-6 py-10 md:py-14">
          {article.imageUrl && !formatted?.startsWithImage && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-gray-200 mb-10">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                priority
                sizes={IMAGE_SIZES}
                className="object-cover"
                unoptimized={!isOptimizableImage(article.imageUrl)}
              />
            </div>
          )}

          {formatted ? (
          <div className={`text-slate-700 text-base md:text-lg leading-relaxed ${styles.body}`} dangerouslySetInnerHTML={{ __html: formatted.html }} />
          ) : (
          <div className="text-slate-700 text-base md:text-lg leading-relaxed space-y-5 [overflow-wrap:anywhere]">
            {articleBlocks(article.content ?? article.description).map((block, i) =>
              block.kind === "heading" ? (
                <h2 key={i} className="font-heading text-xl md:text-2xl font-bold text-brand-navy pt-4">{block.text}</h2>
              ) : block.kind === "list" ? (
                <ul key={i} className="list-disc pl-6 space-y-2">
                  {block.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              ) : (
                <p key={i}>{block.text}</p>
              ),
            )}
          </div>
          )}

          <div className="mt-10 pt-6 border-t border-gray-200">
            <ArticleShare title={article.title} url={`${SITE_URL}${path}`} />
          </div>

          {(newer || older) && (
            <nav aria-label="More from the blog" className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ item: older, label: "← Older article", side: "" }, { item: newer, label: "Newer article →", side: "sm:col-start-2 sm:text-right" }].map(({ item, label, side }) => item && (
                <Link
                  key={label}
                  href={articlePath(item)!}
                  className={`group rounded-2xl border border-gray-200 p-5 hover:border-teal-500/40 hover:shadow-sm transition-[box-shadow,border-color] ${side}`}
                >
                  <span className="block text-xs font-bold uppercase tracking-wider text-teal-aa mb-1.5">{label}</span>
                  <span className="block font-heading font-bold text-brand-navy group-hover:text-teal-aa transition-colors line-clamp-2">{item.title}</span>
                </Link>
              ))}
            </nav>
          )}

          <div className="mt-8 rounded-2xl bg-gray-55 border border-gray-200 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
            <p className="font-heading text-lg font-bold text-brand-navy">Questions about feed hygiene or our products?</p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center min-h-11 whitespace-nowrap px-6 py-2.5 rounded-full bg-teal-aa hover:bg-teal-700 text-white font-bold text-sm transition-colors"
            >
              Talk to our team
            </Link>
          </div>
        </article>

        {others.length > 0 && (
          <section className="bg-gray-55 border-t border-gray-200 py-12 md:py-16">
            <div className="max-w-[1200px] mx-auto px-6">
              <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy">More articles</h2>
                <Link href="/insights" className="text-sm font-bold text-teal-aa hover:text-teal-700 whitespace-nowrap">
                  All insights →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {others.map((item) => (
                  <Link
                    key={item.title}
                    href={articlePath(item)!}
                    className="group bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-teal-500/20 transition-[box-shadow,border-color] duration-300"
                  >
                    {item.imageUrl && (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-100 border border-gray-200">
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes={CARD_IMAGE_SIZES}
                          className="object-cover group-hover:scale-103 transition-transform duration-500"
                          unoptimized={!isOptimizableImage(item.imageUrl)}
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-aa font-medium mb-2">{item.date} • {item.meta}</p>
                    <h3 className="font-heading text-lg font-bold text-brand-navy group-hover:text-teal-aa transition-colors line-clamp-3">
                      {item.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
