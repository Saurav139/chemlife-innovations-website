"use client";

import { useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Icon from "@/components/site/Icon";
import { Button, PageHero, Reveal, easeOut } from "@/components/site/ui";
import { RESEARCH_TOPICS, researchAnchor } from "@/lib/catalog";
import { revealElement, useHashTarget } from "@/lib/deepLink";
import { useHref, useT } from "@/i18n/LocaleProvider";

// The topics are listed in src/lib/catalog.ts; their titles and text are in the language file (research.topics),
// in the same order.
export default function ResearchPage() {
  const t = useT().research;
  const href = useHref();
  const researchTopics = RESEARCH_TOPICS.map((topic, i) => ({ ...topic, ...t.topics[i] }));
  const [expandedId, setExpandedId] = useState<number | null>(researchTopics[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  // Opens at one topic from a link such as /research#research-accelerated-natural-biotransformation-anbiot (the site
  // search): clears the search box, expands the topic and scrolls to it.
  useHashTarget((target) => {
    const topic = researchTopics.find((item) => researchAnchor(item.englishTitle) === target);
    if (!topic) return;
    setSearchQuery("");
    setExpandedId(topic.id);
    revealElement(target);
  });

  const query = searchQuery.toLowerCase();
  const filteredTopics = researchTopics.filter((topic) =>
    topic.title.toLowerCase().includes(query) || topic.preview.toLowerCase().includes(query) || topic.tagline.toLowerCase().includes(query));

  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1} className="site-ui bg-page min-h-screen">
        <MotionConfig reducedMotion="user">
          <PageHero trail={t.kicker} title={`${t.titleStart} *${t.titleAccent}*`} lead={t.intro} />

          <section className="paper relative bg-page pb-20 md:pb-28">
            <div className="container-site">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-ink">
                <h2 className="label-mono text-copy-dim">{t.listHeading} <span className="text-flame">({String(filteredTopics.length).padStart(2, "0")})</span></h2>
                <label role="search" className="flex items-center rounded-full border border-line bg-card focus-within:border-ink transition-colors w-full md:max-w-sm">
                  <Icon name="search" className="w-[18px] h-[18px] ml-4 text-copy-dim shrink-0" />
                  <input type="search" enterKeyHint="search" aria-label={t.search} placeholder={t.search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 px-3 py-2.5 text-base md:text-[15px] text-ink placeholder:text-copy-dim focus:outline-none [&::-webkit-search-cancel-button]:appearance-none" />
                  {searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label={t.clearSearch} className="grid place-items-center w-10 h-10 mr-0.5 text-copy-dim hover:text-ink cursor-pointer"><Icon name="close" className="w-4 h-4" /></button>}
                </label>
              </div>
              <p className="sr-only" role="status">
                {searchQuery ? t.resultsCount.replace("{count}", String(filteredTopics.length)).replace("{total}", String(researchTopics.length)) : ""}
              </p>

              {/* The topics, one per row; one opens at a time to its full dossier */}
              <ol>
                {filteredTopics.map((topic) => {
                  const isExpanded = expandedId === topic.id;
                  const anchor = researchAnchor(topic.englishTitle);
                  const emailHref = `mailto:innovate@chemlifeinnovations.com?subject=${encodeURIComponent(`Collaboration Inquiry: ${topic.englishTitle}`)}&body=${encodeURIComponent(
                    `Dear ChemLife Innovations R&D Team,\n\nI am interested in learning more about your research pipeline: "${topic.englishTitle}". Please share publication details, trial results, and potential partnership scopes.\n\nBest regards,\n[Your Name]\n[Your Institution/Company]`
                  )}`;
                  const sections = [
                    { label: t.overview, text: topic.preview },
                    { label: t.challenge, text: topic.challenge },
                    { label: t.advantage, text: topic.advantage },
                    ...(topic.applications ? [{ label: t.applications, text: topic.applications }] : []),
                  ];
                  return (
                    <motion.li key={topic.id} id={anchor} data-analytics-item={topic.englishTitle} layout="position" transition={{ duration: 0.4, ease: easeOut }}
                      className="scroll-mt-28 border-b border-line rounded-sm">
                      <h3>
                        <button type="button" onClick={() => setExpandedId(isExpanded ? null : topic.id)} aria-expanded={isExpanded} aria-controls={`${anchor}-details`}
                          data-analytics-click={isExpanded ? "Show Less" : "Explore Dossier"}
                          className="group w-full grid grid-cols-[auto_1fr_auto] md:grid-cols-[5rem_1fr_9rem_auto] items-center gap-4 md:gap-8 py-7 md:py-9 text-left cursor-pointer">
                          <span className="label-mono text-flame self-start pt-2">{String(topic.id).padStart(2, "0")}</span>
                          <span className="min-w-0">
                            <span className={`block font-display text-2xl md:text-[2.1rem] leading-[1.15] tracking-[-0.01em] transition-colors ${isExpanded ? "text-flame" : "text-ink group-hover:text-flame"}`}>{topic.title}</span>
                            <span className="block text-copy mt-2 italic">{topic.tagline}</span>
                          </span>
                          <span className="hidden md:block relative aspect-[4/3] rounded-xl overflow-hidden bg-card-hi">
                            <Image src={topic.banner} alt="" fill sizes="144px" className="object-cover" />
                          </span>
                          <span aria-hidden="true" className={`grid place-items-center w-12 h-12 rounded-full border transition-all duration-300 ${isExpanded ? "bg-ink text-page border-ink rotate-45" : "border-line text-ink group-hover:border-ink"}`}>
                            <Icon name="plus" className="w-5 h-5" />
                          </span>
                          <span className="sr-only">{isExpanded ? t.showLess : t.readMore}</span>
                        </button>
                      </h3>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div id={`${anchor}-details`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.5, ease: easeOut }} className="overflow-hidden">
                            <div className="grid lg:grid-cols-12 gap-10 pb-12 md:pl-[7rem]">
                              <div className="lg:col-span-5">
                                {/* The whole illustration shows (some have labels that cropping would cut), over a blurred copy of itself. */}
                                <div className="relative aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-card-hi">
                                  <Image src={topic.banner} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover scale-150 blur-2xl opacity-70" />
                                  <Image src={topic.banner} alt={`${topic.title} ${t.bannerAlt}`} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-contain" />
                                </div>
                                {topic.recognition && (
                                  <div className="mt-6 rounded-2xl border border-mint/40 p-5">
                                    <h4 className="label-mono text-mint flex items-center gap-2"><Icon name="award" className="w-4 h-4" />{t.recognition}</h4>
                                    <p className="text-ink font-semibold leading-relaxed mt-2">{topic.recognition}</p>
                                  </div>
                                )}
                              </div>
                              <div className="lg:col-span-7">
                                <dl className="grid sm:grid-cols-2 gap-x-8">
                                  {sections.map((section) => (
                                    <div key={section.label} className="border-t border-line py-5">
                                      <dt className="label-mono text-flame">{section.label}</dt>
                                      <dd className="text-copy leading-relaxed mt-2.5">{section.text}</dd>
                                    </div>
                                  ))}
                                </dl>
                                <Button href={emailHref} variant="ink" arrow className="mt-6">{t.enquire}</Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  );
                })}
              </ol>

              {filteredTopics.length === 0 && (
                <div className="text-center py-20 mt-10 rounded-[2rem] border border-dashed border-line">
                  <p className="font-display text-2xl text-ink">{t.noResults}</p>
                  <button type="button" onClick={() => setSearchQuery("")}
                    className="mt-6 inline-flex items-center min-h-11 px-6 rounded-full border border-ink/30 hover:bg-ink hover:text-page text-ink text-sm font-semibold transition-colors cursor-pointer">{t.clearSearch}</button>
                </div>
              )}

              {/* A next step after the topics */}
              <Reveal className="theme-dark paper relative mt-20 rounded-[2rem] md:rounded-[3rem] bg-page p-8 md:p-14 overflow-hidden">
                <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -right-16 -top-16 w-80 h-80 text-flame/25">
                  {[30, 55, 80].map((r) => <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="0.8" />)}
                  <circle cx="100" cy="20" r="4" fill="currentColor" />
                </svg>
                <div className="relative grid lg:grid-cols-12 gap-8 items-end">
                  <div className="lg:col-span-8">
                    <h2 className="font-display text-4xl md:text-6xl text-ink tracking-[-0.02em] leading-[1.02]">{t.ctaTitle}</h2>
                    <p className="text-copy text-lg mt-5 max-w-2xl leading-relaxed">{t.ctaText}</p>
                  </div>
                  <div className="lg:col-span-4 lg:text-right">
                    <Button href={href("/contact?type=research")} arrow>{t.ctaButton}</Button>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        </MotionConfig>
      </main>
      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
