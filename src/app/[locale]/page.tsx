"use client";

import { VariantProvider } from "@/context/VariantContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatOverlay from "@/components/ChatOverlay";
import SiteSearch from "@/components/SiteSearch";
import Hero from "@/components/home/Hero";
import Intro, { TaglineRibbon } from "@/components/home/Intro";
import Process from "@/components/home/Process";
import Honors from "@/components/home/Honors";
import Life from "@/components/home/Life";
import Voices from "@/components/home/Voices";
import Commitments from "@/components/home/Commitments";
import { Button, Faq, Kicker, Reveal, Accented } from "@/components/site/ui";
import { useHref, useT } from "@/i18n/LocaleProvider";

export default function Home() {
  const t = useT();
  const w = t.home.whoWeAre;
  const href = useHref();
  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1} className="site-ui bg-page">
        <Hero />
        <TaglineRibbon />
        <Intro />
        <Process />
        <Honors />
        <Life />
        <Voices />
        <Commitments />

        {/* Questions, and where to go next */}
        <section aria-labelledby="faq-title" className="paper relative bg-page-alt py-20 md:py-28 lg:py-36">
          <div className="container-site grid lg:grid-cols-12 gap-12 lg:gap-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <Reveal><Kicker index="08">{w.kicker}</Kicker></Reveal>
                <Reveal delay={0.05}><h2 id="faq-title" className="font-display text-5xl md:text-6xl tracking-[-0.025em] leading-[1] text-ink mt-8"><Accented text={t.ui.faqTitle} /></h2></Reveal>
                <Reveal delay={0.1}><p className="text-copy leading-relaxed mt-6">{w.leadershipCaption}</p></Reveal>
              </div>
            </div>
            <Reveal delay={0.1} className="lg:col-span-8">
              <Faq items={w.faq} />
              <div className="flex flex-wrap gap-3 mt-10">
                <Button href={href("/products")} arrow data-analytics-click={w.exploreProducts}>{w.exploreProducts}</Button>
                <Button href={href("/research")} variant="outline" data-analytics-click={w.seeResearch}>{w.seeResearch}</Button>
                <Button href={href("/about")} variant="outline" data-analytics-click={w.meetLeadership}>{w.meetLeadership}</Button>
                <Button href={href("/contact?type=dossier")} variant="outline" data-analytics-click={w.requestDossier}>{w.requestDossier}</Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
      <ChatOverlay />
      <SiteSearch />
    </VariantProvider>
  );
}
