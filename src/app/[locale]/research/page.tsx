"use client";

import { useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import Icon, { type IconName } from "@/components/site/Icon";
import { Button, CtaBand, PageHero, twoTone } from "@/components/site/ui";
import { RESEARCH_TOPICS, researchAnchor } from "@/lib/catalog";
import { revealElement, useHashTarget } from "@/lib/deepLink";
import { useHref, useT } from "@/i18n/LocaleProvider";

const easeOut = [0.25, 0.1, 0, 1] as const;

// The selected platform's picture: the detail panel's width.
const BANNER_SIZES = "(min-width: 1240px) 760px, (min-width: 1024px) 60vw, 100vw";
const ICONS: IconName[] = ["leaf", "mineral", "capsule", "spark", "molecule"];

interface ResearchTopic {
  id: number;
  title: string;
  category: string;
  tagline: string;
  preview: string;
  challenge: string;
  advantage: string;
  recognition?: string;
  applications?: string;
  banner: string;
}

// The topics are listed in src/lib/catalog.ts; their titles and text are in the language file (research.topics),
// in the same order.

export default function ResearchPage() {
  const all = useT();
  const t = all.research;
  const href = useHref();
  const researchTopics = RESEARCH_TOPICS.map((topic, i) => ({ ...topic, ...t.topics[i] }));
  const [selectedId, setSelectedId] = useState<number>(researchTopics[0].id);

  // Opens at one platform from a link such as /research#research-accelerated-natural-biotransformation-anbiot (the
  // site search): selects it and scrolls to it.
  useHashTarget((target) => {
    const topic = researchTopics.find((item) => researchAnchor(item.englishTitle) === target);
    if (!topic) return;
    setSelectedId(topic.id);
    revealElement(target);
  });

  const index = Math.max(0, researchTopics.findIndex((topic) => topic.id === selectedId));
  const topic = researchTopics[index];
  const emailHref = `mailto:innovate@chemlifeinnovations.com?subject=${encodeURIComponent(`Collaboration Inquiry: ${topic.englishTitle}`)}&body=${encodeURIComponent(
    `Dear ChemLife Innovations R&D Team,\n\nI am interested in learning more about your research pipeline: "${topic.englishTitle}". Please share publication details, trial results, and potential partnership scopes.\n\nBest regards,\n[Your Name]\n[Your Institution/Company]`
  )}`;
  const blocks = [
    { label: t.overview, text: topic.preview, icon: "eye" as const },
    { label: t.challenge, text: topic.challenge, icon: "target" as const },
    { label: t.advantage, text: topic.advantage, icon: "spark" as const },
    ...(topic.applications ? [{ label: t.applications, text: topic.applications, icon: "layers" as const }] : []),
  ];

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="site-ui bg-page min-h-screen">
        <MotionConfig reducedMotion="user">
        <PageHero eyebrow={t.kicker} title={twoTone(t.titleStart, t.titleAccent)} lead={t.intro}
          actions={<Button href={href("/contact?type=research")} arrow>{t.ctaButton}</Button>} />

        {/* The five platforms: pick one on the left, read it on the right */}
        <section aria-labelledby="platforms-title" className="bg-page pb-20 md:pb-28">
          <div className="container-site">
            <h2 id="platforms-title" className="sr-only">{t.listHeading}</h2>
            <div className="grid lg:grid-cols-[22rem_1fr] gap-6 lg:gap-8 items-start">
              <ol role="tablist" aria-orientation="vertical" aria-label={t.listHeading} className="space-y-2 lg:sticky lg:top-32">
                {researchTopics.map((item, i) => {
                  const anchor = researchAnchor(item.englishTitle);
                  const active = item.id === selectedId;
                  return <li key={item.id} id={anchor} className="scroll-mt-32" data-analytics-item={item.englishTitle}>
                    <button type="button" role="tab" id={`${anchor}-tab`} aria-selected={active} aria-controls="platform-panel" onClick={() => setSelectedId(item.id)}
                      className={`w-full flex items-start gap-4 rounded-2xl border p-4 text-left transition-colors cursor-pointer ${active ? "border-flame/60 bg-card-hi" : "border-line bg-card/60 hover:border-flame/30"}`}>
                      <span className={`grid place-items-center w-11 h-11 rounded-xl shrink-0 transition-colors ${active ? "bg-brand-orange-aa text-white" : "bg-ink/5 text-mint"}`}><Icon name={ICONS[i]} className="w-5.5 h-5.5" /></span>
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-copy-dim">0{i + 1}</span>
                        <span className={`block font-heading font-bold leading-snug ${active ? "text-ink" : "text-ink/85"}`}>{item.title}</span>
                      </span>
                    </button>
                  </li>;
                })}
              </ol>

              <div id="platform-panel" role="tabpanel" aria-labelledby={`${researchAnchor(topic.englishTitle)}-tab`} className="min-w-0">
                <AnimatePresence mode="wait">
                  <motion.article key={topic.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: easeOut }}
                    className="rounded-3xl border border-line bg-card/70 overflow-hidden">
                    {/* The whole illustration shows (some have labels that cropping would cut), over a blurred copy of itself. */}
                    <div className="relative aspect-[16/8] overflow-hidden bg-card-hi">
                      <Image src={topic.banner} alt="" aria-hidden="true" fill sizes={BANNER_SIZES} className="object-cover scale-150 blur-2xl opacity-60" />
                      <Image src={topic.banner} alt={`${topic.title} ${t.bannerAlt}`} fill sizes={BANNER_SIZES} className="object-contain" />
                    </div>
                    <div className="p-6 md:p-10">
                      <h3 className="font-heading text-2xl md:text-4xl font-bold tracking-tight text-ink leading-tight">{topic.title}</h3>
                      <p className="font-heading text-lg md:text-xl text-flame mt-3">{topic.tagline}</p>
                      <dl className="grid md:grid-cols-2 gap-4 mt-8">
                        {blocks.map((block) => <div key={block.label} className="rounded-2xl border border-line bg-page-alt/60 p-5">
                          <dt className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-mint"><Icon name={block.icon} className="w-4 h-4" />{block.label}</dt>
                          <dd className="text-copy leading-relaxed mt-2">{block.text}</dd>
                        </div>)}
                      </dl>
                      {topic.recognition && <div className="flex items-start gap-4 rounded-2xl border border-flame/30 bg-flame/8 p-5 mt-4">
                        <Icon name="award" className="w-6 h-6 text-flame shrink-0" />
                        <div><p className="text-xs font-bold tracking-widest uppercase text-flame">{t.recognition}</p><p className="text-ink font-semibold mt-1 leading-snug">{topic.recognition}</p></div>
                      </div>}
                      <div className="flex flex-wrap gap-3 mt-8">
                        <Button href={emailHref} arrow>{t.enquire}</Button>
                        {index < researchTopics.length - 1 && <button type="button" onClick={() => setSelectedId(researchTopics[index + 1].id)}
                          className="inline-flex items-center gap-2 min-h-12 px-5 rounded-full border border-line text-ink/85 font-semibold hover:border-flame/50 cursor-pointer">
                          {researchTopics[index + 1].title.split(":")[0]}<Icon name="arrow" className="w-4 h-4" />
                        </button>}
                      </div>
                    </div>
                  </motion.article>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
        <CtaBand title={`*${t.ctaTitle}*`} lead={t.ctaText} primary={{ label: t.ctaButton, href: href("/contact?type=research") }} />
        </MotionConfig>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
