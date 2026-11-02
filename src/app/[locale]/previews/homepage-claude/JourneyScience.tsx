"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { AWARDS, Arrow, Check, Counter, LIFE_VIDEOS, PARTNERS, Play, Reveal, RotatingImages, SERVE_CATEGORIES, SOCIAL_IMAGES, STATS, STEP_IMAGES, StoryPlayer, TESTIMONIALS,
  btnOutline, btnPrimary, easeOut, h2, kicker, useActions, useRotate } from "../homepage-five/kit";
import { LogoDisc, Questions, WhoButtons } from "./data";
import HeroScience from "./HeroScience";

/** Journey 4: Journey 2 with ChemLife's science moving behind the hero titles: chelated minerals,
 *  microencapsulation, ANBioT and mycotoxin binding. */
export default function JourneyScience() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const a = useActions();
  const reduce = useReducedMotion();
  const [story, setStory] = useState(false);
  const [slide, setSlide] = useRotate(home.taglines.length, 6000);
  const [quote, setQuote] = useState(0);
  const [lifeRef, near] = useNearViewport<HTMLDivElement>();

  // The hero's photographs open out as the page starts to scroll.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const spread = useTransform(heroProgress, [0, 1], reduce ? [0, 0] : [0, 60]);
  const spreadBack = useTransform(spread, (v) => -v);

  // The process: four screens of scroll, one step each.
  const stepsRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ["start start", "end end"] });
  const [step, setStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(3, Math.max(0, Math.floor(v * 4)))));
  const steps = home.howWeDo.steps;

  return <div className="bg-white text-brand-navy">
    {/* Hero: the line, then three photographs that part as the story begins */}
    <section ref={heroRef} className="relative pt-32 md:pt-40 pb-16 overflow-hidden">
      {/* ChemLife's science moves behind the titles and fades out before the photographs */}
      <HeroScience className="absolute inset-x-0 top-0 h-[44rem] md:h-[46rem]" />
      <div className="relative max-w-[1200px] mx-auto px-6 text-center">
        <Reveal><span className={`${kicker} text-teal-aa`}>Innovations in Bioactives</span></Reveal>
        {/* The live site's five hero lines, taking turns; the box keeps three lines' height so nothing below moves */}
        <h1 className="font-heading text-[2.4rem] sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight mt-5 max-w-4xl mx-auto min-h-[3.3em]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={slide} className="block" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.55, ease: easeOut }}>
              {home.taglines[slide][0]}<br /><span className="text-brand-orange-aa">{home.taglines[slide][1]}</span><br />{home.taglines[slide][2]}
            </motion.span>
          </AnimatePresence>
        </h1>
        <div className="flex justify-center gap-1 mt-2" role="group" aria-label="Hero lines">
          {home.taglines.map((_, i) => <button key={i} type="button" onClick={() => setSlide(i)} aria-label={`${home.goToSlide} ${i + 1}`} aria-current={i === slide ? "true" : undefined} className="py-4 px-1 cursor-pointer">
            <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-brand-orange" : "w-3 bg-slate-300"}`} /></button>)}
        </div>
        <Reveal delay={0.1}><p className="text-lg md:text-xl text-slate-600 leading-relaxed mt-6 max-w-2xl mx-auto">{t.meta.home.description}</p></Reveal>
        <Reveal delay={0.15} className="flex flex-wrap justify-center gap-3 mt-9">
          <a href={a.findProduct.href} className={btnPrimary}>{a.findProduct.label}<Arrow /></a>
          <a href={a.nutritionist.href} className={btnOutline}>{a.nutritionist.label}</a>
          <button type="button" onClick={() => setStory(true)} className="inline-flex items-center gap-2 min-h-12 px-4 font-semibold hover:text-brand-orange-aa cursor-pointer"><Play />{home.watchStory}</button>
        </Reveal>
      </div>
      <div className="relative max-w-[1320px] mx-auto px-4 mt-14 grid grid-cols-12 gap-4 items-end">
        <motion.div style={{ x: spreadBack }} className="col-span-3 relative aspect-[3/4] rounded-3xl overflow-hidden hidden md:block">
          <Image src={Images.heroes.chicken} alt="Poultry farming" fill sizes="25vw" className="object-cover" />
        </motion.div>
        <div className="col-span-12 md:col-span-6 relative aspect-[16/11] rounded-3xl overflow-hidden">
          <Image src={Images.heroes.awardsLandscape} alt={home.heroAlt} fill priority sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-[70%_40%]" />
        </div>
        <motion.div style={{ x: spread }} className="col-span-3 relative aspect-[3/4] rounded-3xl overflow-hidden hidden md:block">
          <Image src={Images.heroes.dairy} alt="Dairy farming" fill sizes="25vw" className="object-cover" />
        </motion.div>
      </div>
      <dl className="max-w-[1000px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 text-center">
        {STATS.map((s, i) => <div key={i}><dd className="font-heading text-4xl md:text-5xl font-bold"><Counter value={s.value} suffix={s.suffix} /></dd><dt className="text-sm font-semibold uppercase tracking-wider text-slate-aa mt-1">{home.stats[i]}</dt></div>)}
      </dl>
    </section>

    {/* Partner logos, scrolling sideways */}
    <section aria-labelledby="jb-partners" className="bg-slate-50 border-y border-slate-200 py-10 overflow-hidden">
      <h2 id="jb-partners" className="text-center text-sm font-semibold tracking-widest uppercase text-slate-aa">{home.partners.title}</h2>
      <div className="relative mt-8 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((copy) => <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center">
            {PARTNERS.map((p) => <li key={p.src} className="relative w-40 h-20 mx-6 shrink-0 rounded-2xl bg-white border border-slate-200 px-5">
              <span className="relative block w-full h-full"><Image src={p.src} alt={copy === 1 ? "" : `${p.name} ${home.partners.logo}`} fill sizes="160px" className="object-contain py-3" /></span>
            </li>)}
          </ul>)}
        </div>
      </div>
    </section>

    {/* Who we are, told in order: who, what, the facts, the questions */}
    <section aria-labelledby="jo-who" className="py-20 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <Reveal className="lg:col-span-6">
            <span className={`${kicker} text-teal-aa`}>{w.kicker}</span>
            <h2 id="jo-who" className={`${h2} mt-3`}>{w.title}</h2>
            <p className="text-lg text-slate-700 leading-relaxed mt-6">{w.intro}</p>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-6">
            <figure className="relative">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden"><Image src={Images.people.foundersNew} alt={t.about.foundersAlt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" /></div>
            </figure>
          </Reveal>
        </div>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-slate-200 rounded-3xl overflow-hidden mt-20 border border-slate-200">
          {w.facts.map((f, i) => <Reveal key={f.label} delay={(i % 5) * 0.05} className={`bg-white p-6 ${i === 9 ? "sm:col-span-2 lg:col-span-5" : ""}`}>
            <dt className="text-xs font-bold uppercase tracking-wider text-teal-aa">{f.label}</dt>
            <dd className="mt-2 leading-relaxed">{f.value}{i === 9 && <span className="block mt-2 text-slate-600">{w.leadershipCaption}</span>}</dd>
          </Reveal>)}
        </dl>
        <div className="grid lg:grid-cols-12 gap-10 mt-20">
          <div className="lg:col-span-4">
            <p className="font-heading text-2xl md:text-3xl font-bold text-brand-orange-aa">{w.tagline}</p>
            <WhoButtons className="mt-8" />
          </div>
          <Questions className="lg:col-span-8" />
        </div>
      </div>
    </section>

    {/* The process pins while its four steps pass */}
    <section ref={stepsRef} aria-labelledby="jo-how" className="relative bg-slate-50" style={{ height: reduce ? "auto" : "400vh" }}>
      <div className={`${reduce ? "" : "sticky top-0 h-svh"} flex items-center overflow-hidden`}>
        <div className="max-w-[1200px] w-full mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center py-20 lg:py-0">
          <div className="lg:col-span-5">
            <span className={`${kicker} text-teal-aa`}>{home.howWeDo.kicker}</span>
            <h2 id="jo-how" className={`${h2} mt-3`}>{home.howWeDo.title}</h2>
            <ol className="mt-10 space-y-2">
              {steps.map((s, i) => <li key={s.title} className={`flex gap-4 rounded-2xl p-4 transition-colors duration-500 ${i === step ? "bg-white shadow-lg shadow-brand-navy/5" : ""}`}>
                <span className={`grid place-items-center w-10 h-10 rounded-full font-bold shrink-0 transition-colors duration-500 ${i <= step ? "bg-brand-orange-aa text-white" : "bg-slate-200 text-slate-aa"}`}>{i + 1}</span>
                <div>
                  <h3 className="font-heading text-xl font-bold">{s.title}</h3>
                  <p className={`text-slate-600 leading-relaxed transition-all duration-500 ${i === step || reduce ? "mt-1 max-h-40 opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>{s.description}</p>
                </div>
              </li>)}
            </ol>
          </div>
          <div className="lg:col-span-7 relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-200">
            <AnimatePresence initial={false}>
              <motion.div key={step} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: easeOut }}>
                <Image src={STEP_IMAGES[step]} alt={steps[step].alt} fill sizes="(min-width: 1024px) 680px, 100vw" className="object-cover" />
              </motion.div>
            </AnimatePresence>
            <div className="absolute left-5 right-5 bottom-5 h-1.5 rounded-full bg-white/40 overflow-hidden"><motion.div className="h-full bg-brand-orange origin-left" style={{ scaleX: scrollYProgress }} /></div>
          </div>
        </div>
      </div>
    </section>

    {/* What we serve */}
    <section aria-labelledby="jo-serve" className="py-20 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 id="jo-serve" className={`${h2} text-center`}>{w.serveTitle}</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {w.cards.map((card, i) => <Reveal key={card.title} delay={i * 0.08}>
            <a href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className="group block">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden"><RotatingImages group={i} offset={i} sizes="(min-width: 768px) 380px, 100vw" className="group-hover:scale-105 transition-transform duration-700" /></div>
              <h3 className="font-heading text-2xl font-bold mt-5 group-hover:text-brand-orange-aa transition-colors">{card.title}</h3>
              <p className="text-slate-600 leading-relaxed mt-2">{card.description}</p>
            </a>
          </Reveal>)}
        </div>
      </div>
    </section>

    {/* Proof: awards, then partners in their words, then their logos */}
    <section aria-labelledby="jo-awards" className="bg-slate-50 py-20 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center"><span className={`${kicker} text-teal-aa`}>{home.awards.kicker}</span><h2 id="jo-awards" className={`${h2} mt-3`}>{home.awards.title}</h2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
          {home.awards.items.map((item, i) => <Reveal key={item.title} delay={i * 0.06} className="rounded-3xl bg-white p-6">
            <div className="relative h-16"><Image src={AWARDS[i].logo} alt={AWARDS[i].organization} fill sizes="200px" className="object-contain object-left" /></div>
            <p className="text-sm font-semibold text-teal-aa mt-5">{AWARDS[i].year}</p>
            <h3 className="font-heading text-lg font-bold mt-1">{item.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mt-2">{item.description}</p>
          </Reveal>)}
        </div>
        <div className="mt-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4"><span className={`${kicker} text-teal-aa`}>{home.testimonials.kicker}</span><h2 className="font-heading text-3xl font-bold mt-3">{home.testimonials.title}</h2>
            <div className="flex gap-3 mt-6">{TESTIMONIALS.map((tm, i) => <button key={tm.name} type="button" onClick={() => setQuote(i)} aria-pressed={quote === i} aria-label={tm.company} className={`rounded-full cursor-pointer transition ${quote === i ? "ring-4 ring-brand-orange" : "opacity-60 hover:opacity-100"}`}><LogoDisc src={tm.logo} alt="" /></button>)}</div>
          </div>
          <AnimatePresence mode="wait">
            <motion.figure key={quote} className="lg:col-span-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <blockquote className="text-xl md:text-2xl leading-relaxed">&ldquo;{TESTIMONIALS[quote].quote}&rdquo;</blockquote>
              <figcaption className="mt-5"><strong>{TESTIMONIALS[quote].name}</strong><span className="text-slate-600"> · {TESTIMONIALS[quote].role}, {TESTIMONIALS[quote].company}</span></figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>
    </section>

    {/* People: life at ChemLife beside the commitments */}
    <section aria-labelledby="jo-life" className="py-20 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10">
        <div ref={lifeRef} className="lg:col-span-5 relative rounded-[2rem] overflow-hidden min-h-[460px] bg-brand-navy">
          <BackgroundVideo src={LIFE_VIDEOS[0].src} poster={LIFE_VIDEOS[0].poster} active={near} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <h2 id="jo-life" className="font-heading text-3xl font-bold text-white">{home.life.title}</h2>
            <ul className="mt-4 space-y-1.5">{home.life.points.map((p) => <li key={p} className="flex gap-2"><Check className="w-5 h-5 text-teal-400 shrink-0" />{p}</li>)}</ul>
            <a href={a.careers.href} className="inline-flex items-center gap-2 mt-6 min-h-11 px-5 rounded-full bg-white text-brand-navy font-semibold">{a.careers.label}<Arrow /></a>
          </div>
        </div>
        <div className="lg:col-span-7">
          <span className={`${kicker} text-teal-aa`}>{home.social.kicker}</span>
          <h2 className={`${h2} mt-3`}>{home.social.title}</h2>
          <p className="text-slate-600 mt-3">{home.social.introduction}</p>
          <ul className="mt-8 space-y-5">
            {home.social.items.map((item, i) => <Reveal key={item.title} delay={i * 0.06}><li className="flex gap-5 items-center">
              <span className="relative w-28 h-28 sm:w-36 sm:h-28 rounded-2xl overflow-hidden shrink-0"><Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} fill sizes="144px" className="object-cover" /></span>
              <span><span className="block text-xs font-bold uppercase tracking-wider text-teal-aa">{home.social.categories[i]}</span><span className="block font-heading text-xl font-bold mt-1">{home.social.featureTitles[i]}</span><span className="block text-slate-600 text-sm mt-1">{item.desc} <strong className="text-brand-navy">{home.social.proofs[i]}</strong></span></span>
            </li></Reveal>)}
          </ul>
        </div>
      </div>
    </section>

    {/* Close */}
    <section className="pb-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="rounded-[2rem] bg-brand-navy text-white px-8 py-14 md:p-16 text-center">
          <h2 className={`${h2} text-white`}>{t.contact.titleStart} <span className="text-teal-400">{t.contact.titleAccent}</span> {t.contact.titleEnd}</h2>
          <p className="text-white/85 text-lg mt-4 max-w-2xl mx-auto">{t.contact.intro}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8"><a href={a.nutritionist.href} className={btnPrimary}>{a.nutritionist.label}<Arrow /></a></div>
        </div>
      </div>
    </section>
    <StoryPlayer open={story} onClose={() => setStory(false)} />
  </div>;
}
