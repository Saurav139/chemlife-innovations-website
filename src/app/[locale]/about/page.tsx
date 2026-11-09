"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import ProofStrip from "@/components/ProofStrip";
import FinalCta from "@/components/FinalCta";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { REVEAL_VIEWPORT } from "@/lib/reveal";
import visionStyles from "./vision-mission.module.css";

const easeOut = [0.25, 0.1, 0, 1] as const;

// The four directors, in the order of about.leaders (their roles and bios are in the language file).
const LEADERS = [
  { name: "Radhakrishna PM", degree: "Ph.D, PG-Dip in Mgmt", image: Images.people.leaderRadhakrishna },
  { name: "Sharada KC", degree: "Ph.D", image: Images.people.leaderSharada },
  { name: "Sneha R", degree: "M.Com", image: Images.people.leaderSneehaCropped },
  { name: "Shankar CV", degree: "BE, MBA", image: Images.people.leaderShankar },
];

// The core values spell G.I.F.T.; each card shows its letter, in that order.
const VALUE_KEYS = [
  { letter: "G", key: "green" },
  { letter: "I", key: "innovation" },
  { letter: "F", key: "facts" },
  { letter: "T", key: "trust" },
] as const;

function Arrow({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

// The About page, in the order a buyer checks a supplier out: who we are in one paragraph, who already works with us,
// how we got here (the founders and the dated milestones), what we stand for, who runs the company, the values, and
// finally how to get in touch.
export default function AboutPage() {
  const messages = useT();
  const t = messages.about;
  const href = useHref();
  const leaders = LEADERS.map((leader, i) => ({ ...leader, ...t.leaders[i] }));

  return (
    <VariantProvider>
      <Header />

      <main id="main" tabIndex={-1} className="overflow-x-clip bg-brand-navy min-h-screen pt-18 md:pt-20 lg:pt-24">
        {/* A plain section, not a fade-in: it's the first screen, so it shows without waiting for the page's JavaScript. */}
        <section className="py-12 md:py-16 lg:py-24 text-white relative overflow-hidden flex items-center">
          <div className="absolute inset-0 z-0">
            <Image src={Images.heroes.about} alt={t.heroAlt} fill sizes="100vw" className="object-cover opacity-80" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/70 to-brand-navy/55" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="relative z-10 max-w-[900px] mx-auto text-center px-6">
            <h1 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6">
              <span className="text-teal-400">{t.titleLine1}</span>
              <br />
              <span className="text-white">{t.titleLine2}</span>
            </h1>
            <p className="text-white/85 text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto font-light">{t.lead}</p>
          </div>
        </section>

        {/* Who already works with us, and who has checked our work: the same strip as the Who We Are page. */}
        <ProofStrip />

        {/* Our Journey: the founders, two paragraphs, and the dated milestones. */}
        <SectionWrapper id="our-journey" className="scroll-mt-18 md:scroll-mt-20 lg:scroll-mt-24 py-14 md:py-20 lg:py-24 bg-white text-brand-navy">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid md:grid-cols-12 gap-8 md:gap-10 lg:gap-14 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: 0.6, ease: easeOut }}
                className="md:col-span-5 flex flex-col items-center w-full"
              >
                {/* The three founders, cut from the wider group photo (hence the fixed crop). */}
                <div className="aspect-[357/440] w-full max-w-[360px] md:max-w-[340px] border border-orange-100 rounded-2xl relative overflow-hidden shadow-sm">
                  <Image
                    src={Images.people.foundersNew}
                    alt={t.foundersAlt}
                    width={1600}
                    height={721}
                    sizes="1600px"
                    className="absolute max-w-none"
                    style={{ width: "448.1793%", height: "auto", left: "-148.4594%", top: "-50%" }}
                  />
                </div>
                <div className="mt-3 bg-teal-50 border border-teal-200 text-teal-aa text-xs md:text-sm font-bold uppercase tracking-wider px-5 py-1.5 rounded-full shadow-xs select-none">
                  {t.founders}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={REVEAL_VIEWPORT}
                transition={{ duration: 0.6, ease: easeOut }}
                className="md:col-span-7"
              >
                <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-brand-navy mb-5 font-bold leading-tight">{t.journeyTitle}</h2>
                <div className="space-y-4 text-brand-navy/85 text-base lg:text-lg leading-relaxed">
                  <p>{t.journeyText}</p>
                  <p>{t.journeyText2}</p>
                </div>
                <Link
                  href={href("/who-we-are")}
                  data-analytics-click="About: who we are"
                  className="group inline-flex items-center gap-2 min-h-11 mt-6 font-semibold text-teal-aa hover:text-brand-navy"
                >
                  {messages.home.whoWeAre.moreAboutUs}
                  <Arrow className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>

            {/* The milestones: a line down the left on phones, across the top from the large breakpoint. */}
            <h3 className="sr-only">{t.milestonesTitle}</h3>
            <ol
              aria-label={t.milestonesTitle}
              className="relative mt-14 md:mt-20 grid gap-8 lg:grid-cols-5 lg:gap-6 before:absolute before:bg-slate-200 before:left-[7px] before:top-2 before:bottom-2 before:w-px lg:before:left-0 lg:before:right-0 lg:before:top-[7px] lg:before:bottom-auto lg:before:h-px lg:before:w-auto"
            >
              {t.milestones.map((milestone, i) => {
                const last = i === t.milestones.length - 1;
                return (
                  <motion.li
                    key={milestone.year}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={REVEAL_VIEWPORT}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: easeOut }}
                    className="relative pl-8 lg:pl-0 lg:pt-8"
                  >
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-1 lg:top-0 w-4 h-4 rounded-full border-2 border-teal-aa ${last ? "bg-teal-aa" : "bg-white"}`}
                    />
                    <p className="font-heading text-2xl font-bold tabular-nums text-brand-navy">{milestone.year}</p>
                    <p className="mt-2 text-slate-700 leading-relaxed">{milestone.text}</p>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </SectionWrapper>

        {/* Our purpose brings the Vision and Mission together. */}
        <SectionWrapper id="vision-mission" className="scroll-mt-18 md:scroll-mt-20 lg:scroll-mt-24 py-12 md:py-16 lg:py-20 bg-slate-50 border-t border-brand-navy/10">
          <div className={`max-w-[1200px] mx-auto px-6 ${visionStyles.layout}`}>
            <h2 className={`${visionStyles.sectionHeading} font-heading text-3xl md:text-4xl lg:text-5xl text-brand-navy font-bold leading-tight`}>{t.purposeTitle}</h2>
            <figure className={visionStyles.photo}>
              <Image src={Images.research.researchImage} alt={t.visionPhotoAlt} fill sizes="(min-width: 900px) 420px, calc(100vw - 48px)" className={visionStyles.image} />
              <figcaption>
                <span>{t.visionPhotoLabel}</span>
                <strong>
                  {t.titleLine1}
                  <br />
                  {t.titleLine2}
                </strong>
              </figcaption>
            </figure>
            <div className={visionStyles.statements}>
              {[
                { title: t.visionKicker, text: t.visionText },
                { title: t.missionKicker, text: t.missionText },
              ].map((statement, i) => (
                <article key={statement.title}>
                  <div className={visionStyles.title}>
                    <span aria-hidden="true">0{i + 1}</span>
                    <h3>{statement.title}</h3>
                  </div>
                  <p>{statement.text}</p>
                </article>
              ))}
            </div>
          </div>
        </SectionWrapper>

        {/* Leadership: the four directors, with the experience they bring. */}
        <SectionWrapper id="leadership" className="scroll-mt-18 md:scroll-mt-20 lg:scroll-mt-24 py-14 md:py-20 lg:py-24 bg-gray-50 text-brand-navy border-t border-teal-100">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
              <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-2">{t.leadersKicker}</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-brand-navy font-bold leading-tight">{t.leadersTitle}</h2>
              <p className="mt-5 text-slate-700 text-base lg:text-lg leading-relaxed">{messages.home.whoWeAre.leadershipCaption}</p>
            </div>

            {/* One readable profile on very narrow phones, two from 360px, four on desktop. */}
            <ul className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {leaders.map((leader, i) => (
                <motion.li
                  key={leader.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={REVEAL_VIEWPORT}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm hover:border-brand-orange/50 hover:shadow-md transition-[border-color,box-shadow] duration-300 group"
                >
                  {/* The photos share one 4:5 head-and-shoulders frame, shown whole, so no head or chin is cut off. */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 m-2 sm:m-3 mb-0 sm:mb-0 rounded-xl border border-orange-100 group-hover:border-orange-200 transition-colors duration-300">
                    <Image src={leader.image} alt={leader.name} fill sizes="(max-width: 1023px) 50vw, 280px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col items-start text-left p-4 md:p-5">
                    <h3 className="font-heading text-lg md:text-xl font-bold text-brand-navy leading-tight">{leader.name}</h3>
                    <p className="text-teal-aa font-bold text-xs md:text-sm uppercase tracking-wider leading-relaxed mt-1.5">{leader.role}</p>
                    <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed mt-1 mb-3">{leader.degree}</p>
                    <p className="text-brand-navy/85 text-sm lg:text-base leading-relaxed border-t border-slate-200 pt-3 w-full">{leader.bio}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </SectionWrapper>

        {/* Core values: G.I.F.T., one card each, on the brand navy. */}
        <SectionWrapper id="core-values" className="scroll-mt-18 md:scroll-mt-20 lg:scroll-mt-24 py-14 md:py-20 lg:py-24 bg-brand-navy text-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
              <span className="text-teal-aa-light text-sm font-semibold tracking-widest uppercase block mb-2">{t.valuesKicker}</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight">{t.valuesTitle}</h2>
              <p className="mt-5 text-white/80 text-base lg:text-lg leading-relaxed">{t.valuesIntro}</p>
            </div>

            <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {VALUE_KEYS.map((value, i) => (
                <motion.li
                  key={value.key}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={REVEAL_VIEWPORT}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}
                  className="relative rounded-2xl border border-white/10 bg-white/5 p-6 md:p-7 hover:border-teal-aa-light/50 transition-colors duration-300"
                >
                  <span aria-hidden="true" className="block font-heading text-6xl md:text-7xl font-bold leading-none text-teal-aa-light/30">{value.letter}</span>
                  <h3 className="mt-5 font-heading text-xl font-bold text-white">{t.values[value.key].name}</h3>
                  <p className="mt-3 text-white/80 leading-relaxed">{t.values[value.key].text}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </SectionWrapper>

        <FinalCta />
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
