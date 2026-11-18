import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";
import { VariantProvider } from "@/context/VariantContext";
import { articlePath } from "@/lib/articles";
import { getInsights, type InsightItem } from "@/lib/insights";
import { TOPIC_PAGES } from "@/lib/insight-topic-pages";
import { INSIGHT_TOPICS, topicBySlug, topicPath } from "@/lib/insight-topics";
import { SITE_URL, pageMetadata } from "@/lib/seo";
import { jsonLd } from "@/lib/structuredData";
import TopicPosts from "./TopicPosts";

type Params = Promise<{ locale: string; slug: string }>;

// A topic's own page, e.g. /insights/topic/mycotoxins: what the topic is, every post tagged with it, and the questions
// people ask about it. Search engines can list it, which a filtered view of the Insights page (?topic=…) can't be.
// The posts come from the Insights inbox, so like the Insights page this is rendered for each visit. English only,
// through the Insights layout.
export const dynamic = "force-dynamic";

const newestFirst = (a: InsightItem, b: InsightItem) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0);

/** The topic, its posts (one per title: a post on both LinkedIn and Instagram is listed once) and the other topics
 *  that have posts; null when there's no such topic or nothing is tagged with it. The page and its metadata look this
 *  up once per visit. */
const findTopic = cache(async (slug: string) => {
  const topic = topicBySlug(slug);
  const copy = TOPIC_PAGES[slug];
  if (!topic || !copy) return null;
  const { blogs, podcasts, videos } = await getInsights();
  const all = [...videos, ...podcasts, ...blogs].filter((item, index, self) => self.findIndex((other) => other.title === item.title) === index);
  const items = all.filter((item) => item.topics?.includes(slug)).sort(newestFirst);
  if (items.length === 0) return null;
  const others = INSIGHT_TOPICS.filter((other) => other.slug !== slug && TOPIC_PAGES[other.slug] && all.some((item) => item.topics?.includes(other.slug)));
  return { topic, copy, items, others };
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = await findTopic((await params).slug);
  if (!found) return {};
  return pageMetadata({ title: `${found.topic.name}: Articles, Videos & Posts`, description: found.copy.description, path: topicPath(found.topic.slug) });
}

export default async function TopicPage({ params }: { params: Params }) {
  const found = await findTopic((await params).slug);
  if (!found) notFound();
  const { topic, copy, items, others } = found;
  const path = topicPath(topic.slug);
  const questions = copy.questions ?? [];

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.name,
    description: copy.description,
    url: `${SITE_URL}${path}`,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    // The articles that have their own page on this site.
    hasPart: items.flatMap((item) => {
      const page = articlePath(item);
      return page ? [{ "@type": "BlogPosting", headline: item.title, url: `${SITE_URL}${page}` }] : [];
    }),
  };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "Home", item: SITE_URL },
      { name: "Insights", item: `${SITE_URL}/insights` },
      { name: topic.name, item: `${SITE_URL}${path}` },
    ].map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })),
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  };

  return (
    <VariantProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(collection)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(crumbs)} />
      {questions.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faq)} />}
      <Header />

      <main id="main" tabIndex={-1} className="bg-white min-h-screen text-brand-navy">
        <section className="pt-40 md:pt-44 pb-10 md:pb-14 bg-brand-navy text-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <nav aria-label="Breadcrumb" className="mb-5 text-sm">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-white/70">
                <li><Link href="/" className="text-teal-aa-light font-semibold hover:text-white transition-colors">Home</Link></li>
                <li aria-hidden="true">›</li>
                <li><Link href="/insights" className="text-teal-aa-light font-semibold hover:text-white transition-colors">Insights</Link></li>
              </ol>
            </nav>
            <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block mb-3">Topic</span>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">{topic.name}</h1>
            <p className="mt-4 max-w-3xl text-white/85 text-base md:text-lg leading-relaxed">{copy.intro}</p>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xs font-bold text-gray-aa uppercase tracking-wider whitespace-nowrap">
                {items.length} {items.length === 1 ? "insight" : "insights"} on {topic.name}
              </h2>
              <div className="w-full h-[1px] bg-gray-150" />
            </div>
            <TopicPosts items={items} topic={topic.slug} />
          </div>
        </section>

        {questions.length > 0 && (
          <section className="bg-gray-55 border-y border-gray-200 py-12 md:py-16">
            <div className="max-w-3xl mx-auto px-6">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mb-6 md:mb-8">Common questions</h2>
              <div className="space-y-5">
                {questions.map(({ question, answer, source }) => (
                  <div key={question} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-7">
                    <h3 className="font-heading text-lg md:text-xl font-bold text-brand-navy">{question}</h3>
                    <p className="mt-3 text-slate-700 text-base leading-relaxed">{answer}</p>
                    {source && <p className="mt-3 text-xs text-gray-aa">Source: {source}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-12 md:py-16">
          <div className="max-w-[1200px] mx-auto px-6">
            {others.length > 0 && (
              <nav aria-label="Other topics">
                <div className="flex items-end justify-between gap-4 mb-5">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy">Other topics</h2>
                  <Link href="/insights" className="text-sm font-bold text-teal-aa hover:text-teal-700 whitespace-nowrap">
                    All insights →
                  </Link>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {others.map((other) => (
                    <li key={other.slug}>
                      <Link
                        href={topicPath(other.slug)}
                        className="tap-target inline-flex items-center px-3.5 py-1.5 rounded-full border border-gray-200 bg-gray-55 text-sm font-semibold text-slate-700 hover:border-teal-aa hover:text-teal-aa transition-colors"
                      >
                        {other.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            <div className="mt-10 rounded-2xl bg-gray-55 border border-gray-200 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
              <p className="font-heading text-lg font-bold text-brand-navy">Questions about feed hygiene or our products?</p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center min-h-11 whitespace-nowrap px-6 py-2.5 rounded-full bg-teal-aa hover:bg-teal-700 text-white font-bold text-sm transition-colors"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
