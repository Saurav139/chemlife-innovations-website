"use client";

import { VariantProvider } from "@/context/VariantContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatOverlay from "@/components/ChatOverlay";
import SiteSearch from "@/components/SiteSearch";
import HomeHero from "@/components/home/HomeHero";
import Proof from "@/components/home/Proof";
import FeatureSplit from "@/components/home/FeatureSplit";
import Hub from "@/components/home/Hub";
import Solutions from "@/components/home/Solutions";
import { Process, Resources } from "@/components/home/Process";
import { Button, CtaBand, Faq, Reveal, Section, SectionTitle } from "@/components/site/ui";
import { useHref, useT } from "@/i18n/LocaleProvider";

export default function Home() {
  const t = useT();
  const href = useHref();
  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1} className="site-ui bg-page">
        <HomeHero />
        <Proof />
        <FeatureSplit />
        <Hub />
        <Solutions />
        <Process />
        <Resources />
        <Section tone="raised" labelledBy="faq-title">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
            <Reveal>
              <SectionTitle id="faq-title" title={t.site.faq.title} lead={t.site.faq.lead} align="left" className="mb-8!" />
              <Button href={href("/about")} variant="outline" arrow>{t.home.whoWeAre.meetLeadership}</Button>
            </Reveal>
            <Reveal delay={0.1}><Faq items={t.home.whoWeAre.faq} /></Reveal>
          </div>
        </Section>
        <CtaBand title={t.site.cta.title} lead={t.site.cta.lead}
          primary={{ label: t.home.talkToNutritionist, href: href("/contact?type=nutritionist") }}
          secondary={{ label: t.home.whoWeAre.requestDossier, href: href("/contact?type=dossier") }} />
      </main>
      <Footer />
      <ChatOverlay />
      <SiteSearch />
    </VariantProvider>
  );
}
