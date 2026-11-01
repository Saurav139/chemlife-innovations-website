"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { AWARDS, Arrow, Check, Counter, LIFE_VIDEOS, PARTNERS, Play, Reveal, RotatingImages, SERVE_CATEGORIES, SOCIAL_IMAGES, STATS, STEP_IMAGES, StoryPlayer, TESTIMONIALS,
  btnOutline, btnPrimary, h2, kicker, useActions } from "../homepage-five/kit";
import { LogoDisc, MILESTONES, Questions, WhoButtons } from "./data";

/** D: Milestones. ChemLife's dated history is the spine of the page; everything else hangs off it. */
export default function Milestones() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const a = useActions();
  const reduce = useReducedMotion();
  const [story, setStory] = useState(false);
  const [lifeRef, near] = useNearViewport<HTMLDivElement>();
  const lineRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: lineRef, offset: ["start 75%", "end 60%"] });

  return <div className="bg-white text-brand-navy">
    {/* Hero: the headline over a strip of the years */}
    <section className="relative pt-32 md:pt-40 pb-16 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <span className={`${kicker} text-teal-aa`}>{t.meta.siteTitle}</span>
          <h1 className="font-heading text-[2.6rem] sm:text-6xl font-bold leading-[1.05] tracking-tight mt-5">{home.taglines[2].join(" ")}</h1>
          <p className="text-lg text-slate-600 leading-relaxed mt-5 max-w-xl">{t.meta.home.description}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href={a.findProduct.href} className={btnPrimary}>{a.findProduct.label}<Arrow /></a>
            <a href={a.nutritionist.href} className={btnOutline}>{a.nutritionist.label}</a>
          </div>
          <button type="button" onClick={() => setStory(true)} className="inline-flex items-center gap-3 mt-6 font-semibold hover:text-brand-orange-aa cursor-pointer"><span className="grid place-items-center w-11 h-11 rounded-full border-2 border-brand-navy/20"><Play /></span>{home.watchStory}</button>
        </div>
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[5/4] rounded-[2rem] overflow-hidden"><Image src={Images.heroes.awardsLandscape} alt={home.heroAlt} fill priority sizes="(min-width: 1024px) 580px, 100vw" className="object-cover object-[70%_40%]" /></div>
          <div className="absolute -bottom-6 left-6 right-6 grid grid-cols-4 rounded-2xl bg-white shadow-xl border border-slate-100 divide-x divide-slate-100">
            {STATS.map((s, i) => <div key={i} className="px-3 py-4 text-center"><p className="font-heading text-2xl md:text-3xl font-bold"><Counter value={s.value} suffix={s.suffix} /></p><p className="text-[11px] md:text-xs font-semibold uppercase tracking-wide text-slate-aa">{home.stats[i]}</p></div>)}
          </div>
        </div>
      </div>
      {/* The years, as a ruler under the hero */}
      <ol aria-label="Milestones" className="max-w-[1200px] mx-auto px-6 mt-20 flex justify-between gap-2 overflow-x-auto">
        {MILESTONES.map((m) => <li key={m.year} className="shrink-0 text-center"><a href={`#ms-${m.year}`} className="block font-heading font-bold text-slate-aa hover:text-brand-orange-aa px-2 py-2">{m.year}</a></li>)}
      </ol>
    </section>

    {/* Who we are, with the facts as a sheet */}
    <section aria-labelledby="ms-who" className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <span className={`${kicker} text-teal-aa`}>{w.kicker}</span>
          <h2 id="ms-who" className="font-heading text-3xl md:text-4xl font-bold leading-tight mt-3">{w.title}</h2>
          <p className="font-heading text-xl font-semibold text-brand-orange-aa mt-4">{w.tagline}</p>
          <p className="text-slate-700 leading-relaxed mt-5">{w.intro}</p>
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mt-8"><Image src={Images.people.foundersNew} alt={t.about.foundersAlt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" /></div>
          <p className="text-slate-600 text-sm leading-relaxed mt-3">{w.leadershipCaption}</p>
        </div>
        <div className="lg:col-span-7">
          <dl className="rounded-[2rem] bg-white p-6 md:p-8 grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {w.facts.map((f, i) => <div key={f.label} className={i === 9 ? "sm:col-span-2" : ""}><dt className="flex items-center gap-2 text-sm font-bold text-teal-aa"><Check className="w-4 h-4 text-brand-orange-aa" />{f.label}</dt><dd className="mt-1 leading-relaxed">{f.value}</dd></div>)}
          </dl>
          <Questions className="mt-10" />
          <WhoButtons className="mt-8" />
        </div>
      </div>
    </section>

    {/* The timeline: each year with what happened, a line drawing down as you read */}
    <section aria-labelledby="ms-line" className="py-20 md:py-28">
      <div className="max-w-[1000px] mx-auto px-6">
        <h2 id="ms-line" className={`${h2} text-center`}>Since 2016</h2>
        <p className="text-center text-slate-600 mt-3 max-w-2xl mx-auto">Partners, awards and support, year by year.</p>
        <ol ref={lineRef} className="relative mt-14">
          <span aria-hidden="true" className="absolute left-[5.5rem] md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 md:-translate-x-1/2" />
          <motion.span aria-hidden="true" style={{ scaleY: reduce ? 1 : scrollYProgress }} className="absolute left-[5.5rem] md:left-1/2 top-0 bottom-0 w-0.5 bg-brand-orange origin-top md:-translate-x-1/2" />
          {MILESTONES.map((m, i) => {
            const award = AWARDS.findIndex((aw) => aw.year === m.year.replace("–", "-"));
            return <li key={m.year} id={`ms-${m.year}`} className="relative grid grid-cols-[5.5rem_1fr] md:grid-cols-2 gap-x-8 md:gap-x-16 pb-12 last:pb-0 scroll-mt-28">
              <span aria-hidden="true" className="absolute left-[5.5rem] md:left-1/2 top-2 w-4 h-4 -translate-x-1/2 rounded-full bg-white border-4 border-brand-orange" />
              <p className={`font-heading text-2xl md:text-4xl font-bold text-brand-orange-aa ${i % 2 ? "md:order-2 md:pl-0" : "md:text-right"} pr-6 md:pr-0`}>{m.year}</p>
              <Reveal className={i % 2 ? "md:order-1 md:text-right" : ""}>
                <div className={`flex items-center gap-3 ${i % 2 ? "md:justify-end" : ""}`}>
                  {award >= 0 && <span className="relative w-12 h-12 shrink-0"><Image src={AWARDS[award].logo} alt="" fill sizes="48px" className="object-contain" /></span>}
                  <h3 className="font-heading text-xl font-bold">{m.title}</h3>
                </div>
                <p className="text-slate-600 leading-relaxed mt-2">{m.text}</p>
                {award >= 0 && <p className="text-sm text-slate-aa mt-2">{home.awards.items[award].description}</p>}
              </Reveal>
            </li>;
          })}
        </ol>
      </div>
    </section>

    {/* What we serve */}
    <section aria-labelledby="ms-serve" className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 id="ms-serve" className={h2}>{w.serveTitle}</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {w.cards.map((card, i) => <a key={card.title} href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className="group rounded-[2rem] bg-white overflow-hidden">
            <div className="relative aspect-[16/11]"><RotatingImages group={i} offset={i} sizes="(min-width: 768px) 380px, 100vw" /></div>
            <div className="p-6"><h3 className="font-heading text-2xl font-bold group-hover:text-brand-orange-aa transition-colors">{card.title}</h3><p className="text-slate-600 mt-2 leading-relaxed">{card.description}</p></div>
          </a>)}
        </div>
      </div>
    </section>

    {/* How we do it, as a four-stage line */}
    <section aria-labelledby="ms-how" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <span className={`${kicker} text-teal-aa`}>{home.howWeDo.kicker}</span><h2 id="ms-how" className={`${h2} mt-3`}>{home.howWeDo.title}</h2>
        <ol className="grid md:grid-cols-4 gap-6 mt-12 relative">
          <span aria-hidden="true" className="hidden md:block absolute top-5 left-5 right-5 h-0.5 bg-slate-200" />
          {home.howWeDo.steps.map((s, i) => <li key={s.title} className="relative">
            <span className="relative z-10 grid place-items-center w-10 h-10 rounded-full bg-brand-navy text-white font-bold">{i + 1}</span>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mt-5"><Image src={STEP_IMAGES[i]} alt={s.alt} fill sizes="280px" className="object-cover" /></div>
            <h3 className="font-heading text-xl font-bold mt-4">{s.title}</h3><p className="text-slate-600 mt-2 leading-relaxed">{s.description}</p>
          </li>)}
        </ol>
      </div>
    </section>

    {/* Partners: their words and their logos */}
    <section aria-labelledby="ms-voices" className="bg-brand-navy text-white py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <span className={`${kicker} text-teal-aa-light`}>{home.testimonials.kicker}</span><h2 id="ms-voices" className={`${h2} text-white mt-3`}>{home.testimonials.title}</h2>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {TESTIMONIALS.map((tm) => <figure key={tm.name} className="rounded-[2rem] bg-white/10 p-7 flex flex-col">
            <blockquote className="leading-relaxed flex-1 text-white/90">&ldquo;{tm.quote}&rdquo;</blockquote>
            <figcaption className="flex items-center gap-3 mt-6"><LogoDisc src={tm.logo} alt={`${tm.company} logo`} size={48} /><span><strong className="block text-white">{tm.name}</strong><span className="text-sm text-white/80">{tm.role}, {tm.company}</span></span></figcaption>
          </figure>)}
        </div>
        <p className="font-heading text-xl font-bold text-white mt-16">{home.partners.title}</p>
        <ul className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-6">{PARTNERS.map((p) => <li key={p.src} className="relative aspect-[3/2] rounded-2xl bg-white"><Image src={p.src} alt={`${p.name} ${home.partners.logo}`} fill sizes="160px" className="object-contain p-3" /></li>)}</ul>
      </div>
    </section>

    {/* Life and commitments */}
    <section aria-labelledby="ms-life" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <h2 id="ms-life" className={h2}>{home.life.title}</h2>
          <ul className="mt-6 space-y-3">{home.life.points.map((p) => <li key={p} className="flex gap-3 text-lg"><Check className="w-6 h-6 text-teal-aa shrink-0" />{p}</li>)}</ul>
          <a href={a.careers.href} className={`${btnPrimary} mt-8`}>{a.careers.label}<Arrow /></a>
          <div ref={lifeRef} className="relative aspect-video rounded-[2rem] overflow-hidden mt-10 bg-brand-navy"><BackgroundVideo src={LIFE_VIDEOS[0].src} poster={LIFE_VIDEOS[0].poster} active={near} className="absolute inset-0 w-full h-full object-cover" /></div>
        </div>
        <div>
          <span className={`${kicker} text-teal-aa`}>{home.social.kicker}</span><h2 className="font-heading text-3xl font-bold mt-3">{home.social.journalTitle}</h2><p className="text-slate-600 mt-3">{home.social.introduction}</p>
          <ul className="mt-8 space-y-6">
            {home.social.items.map((item, i) => <li key={item.title} className="grid grid-cols-[8rem_1fr] gap-5 items-center">
              <span className="relative aspect-square rounded-2xl overflow-hidden"><Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} fill sizes="128px" className="object-cover" /></span>
              <span><span className="block font-heading text-lg font-bold">{home.social.featureTitles[i]}</span><span className="block text-slate-600 text-sm mt-1">{item.desc}</span><span className="block text-sm font-semibold text-teal-aa mt-1">{home.social.proofs[i]}</span></span>
            </li>)}
          </ul>
        </div>
      </div>
    </section>

    <section className="pb-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="rounded-[2rem] bg-slate-50 px-8 py-12 md:p-14 text-center">
          <p className="font-heading text-brand-orange-aa font-bold">Next</p>
          <h2 className={`${h2} mt-2`}>{t.contact.titleStart} {t.contact.titleAccent} {t.contact.titleEnd}</h2>
          <p className="text-slate-600 text-lg mt-4 max-w-2xl mx-auto">{t.contact.intro}</p>
          <a href={a.nutritionist.href} className={`${btnPrimary} mt-8`}>{a.nutritionist.label}<Arrow /></a>
        </div>
      </div>
    </section>
    <StoryPlayer open={story} onClose={() => setStory(false)} />
  </div>;
}
