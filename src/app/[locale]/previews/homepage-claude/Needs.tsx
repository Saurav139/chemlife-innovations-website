"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { AWARDS, Arrow, Check, Counter, LIFE_VIDEOS, PARTNERS, Reveal, RotatingImages, SERVE_CATEGORIES, SOCIAL_IMAGES, STATS, STEP_IMAGES, TESTIMONIALS,
  btnPrimary, easeOut, h2, kicker, useActions, useProducts, useRotate } from "../homepage-five/kit";
import { LogoDisc, NEEDS, Questions, WhoButtons } from "./data";

// A small drawn mark for each need, in the brand's line style.
const NEED_ICONS: Record<string, string> = {
  hygiene: "M12 3 4.5 6v5.5c0 4.7 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.8 7.5-9.5V6L12 3Zm-3.5 9 2.5 2.5 4.5-5",
  gut: "M8.5 15.5 15.5 8.5M6.3 17.7a4.5 4.5 0 0 1 0-6.4l5-5a4.5 4.5 0 0 1 6.4 6.4l-5 5a4.5 4.5 0 0 1-6.4 0Z",
  minerals: "m12 3 7 4v10l-7 4-7-4V7l7-4Zm0 0v18M5 7l14 10M19 7 5 17",
  rumen: "M6 7 3.5 5.5M18 7l2.5-1.5M7 6.5h10c.6 0 1 .4 1 1V14a6 6 0 0 1-12 0V7.5c0-.6.4-1 1-1ZM9.5 16.5h5M10 11h.01M14 11h.01",
};

/** B: Needs. The homepage is arranged around what the animals need, and every product sits under one need. */
export default function Needs() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const a = useActions();
  const products = useProducts();
  const [need, setNeed] = useState(0);
  const [slide] = useRotate(home.taglines.length, 5000);
  const [lifeRef, near] = useNearViewport<HTMLDivElement>();
  const current = NEEDS[need];
  const shelf = current.products.map((name) => products.find((p) => p.name === name)!).filter(Boolean);

  return <div className="bg-white text-brand-navy">
    {/* Hero: the question every visitor brings, answered by four needs */}
    <section className="bg-gradient-to-b from-teal-50/60 to-white pt-32 md:pt-40 pb-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <span className={`${kicker} text-teal-aa`}>{t.meta.siteTitle}</span>
            <h1 className="font-heading text-[2.6rem] sm:text-6xl font-bold leading-[1.05] tracking-tight mt-5">What do your animals need?</h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed mt-5 max-w-xl">{t.meta.home.description}</p>
          </div>
          <div className="lg:col-span-5 lg:text-right">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={slide} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }} className="font-heading text-xl md:text-2xl font-bold">
                {home.taglines[slide][0]} <span className="text-teal-aa">{home.taglines[slide][1]}</span> {home.taglines[slide][2]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div role="tablist" aria-label="Needs" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-12">
          {NEEDS.map((n, i) => <button key={n.id} type="button" role="tab" aria-selected={need === i} aria-controls="needs-panel" onClick={() => setNeed(i)}
            className={`text-left rounded-3xl p-5 md:p-6 border-2 transition-all cursor-pointer ${need === i ? "bg-brand-navy border-brand-navy text-white shadow-xl shadow-brand-navy/20" : "bg-white border-slate-200 hover:border-brand-navy/40"}`}>
            <svg viewBox="0 0 24 24" className={`w-8 h-8 ${need === i ? "text-teal-400" : "text-brand-orange-aa"}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={NEED_ICONS[n.id]} /></svg>
            <span className="block font-heading text-lg md:text-xl font-bold mt-4">{n.title}</span>
            <span className={`block text-sm mt-1 ${need === i ? "text-white/80" : "text-slate-aa"}`}>{n.products.length} products</span>
          </button>)}
        </div>

        <div id="needs-panel" role="tabpanel" className="mt-6 rounded-[2rem] bg-slate-50 p-6 md:p-8">
          <p className="text-lg text-slate-700">{current.text}</p>
          <AnimatePresence mode="wait">
            <motion.ul key={need} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: easeOut }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {shelf.map((p) => <li key={p.id}><a href={p.href} className="group flex h-full flex-col rounded-2xl bg-white overflow-hidden border border-slate-200 hover:border-brand-orange/40 hover:shadow-lg transition-all">
                <div className="relative aspect-[16/10] bg-slate-100">{p.banner && <Image src={p.banner} alt="" fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />}</div>
                <div className="p-4 flex flex-col flex-1"><span className="text-xs font-bold uppercase tracking-wider text-teal-aa">{p.categoryName}</span><span className="font-heading text-lg font-bold mt-1 group-hover:text-brand-orange-aa transition-colors">{p.name}</span><span className="text-sm text-slate-600 mt-1">{p.tagline}</span></div>
              </a></li>)}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>

    {/* Who we serve: the three groups, side by side */}
    <section aria-labelledby="ne-serve" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-4"><h2 id="ne-serve" className={h2}>{w.serveTitle}</h2><a href={a.findProduct.href} className="inline-flex items-center gap-2 font-semibold text-brand-orange-aa hover:underline">{t.products.allProducts}<Arrow /></a></div>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {w.cards.map((card, i) => <a key={card.title} href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className="group relative block aspect-[4/5] md:aspect-[3/4] rounded-[2rem] overflow-hidden">
            <RotatingImages group={i} offset={i} sizes="(min-width: 768px) 380px, 100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white"><h3 className="font-heading text-2xl font-bold text-white">{card.title}</h3><p className="text-white/90 mt-2 text-sm leading-relaxed">{card.description}</p></div>
          </a>)}
        </div>
      </div>
    </section>

    {/* Who we are: the profile as a fact sheet with the numbers on top */}
    <section aria-labelledby="ne-who" className="bg-brand-navy text-white py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <span className={`${kicker} text-teal-aa-light`}>{w.kicker}</span>
            <h2 id="ne-who" className="font-heading text-3xl md:text-4xl font-bold leading-tight text-white mt-3">{w.title}</h2>
            <p className="font-heading text-xl font-semibold text-orange-200 mt-4">{w.tagline}</p>
            <p className="text-white/85 leading-relaxed mt-6">{w.intro}</p>
            <div className="flex items-center gap-4 mt-8">
              <span className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0"><Image src={Images.people.founders} alt="Three of ChemLife's directors" fill sizes="96px" className="object-cover" /></span>
              <p className="text-white/85 text-sm leading-relaxed">{w.leadershipCaption}</p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STATS.map((s, i) => <div key={i} className="rounded-2xl bg-white/10 p-4"><dd className="font-heading text-3xl font-bold"><Counter value={s.value} suffix={s.suffix} /></dd><dt className="text-xs font-semibold uppercase tracking-wider text-white/80 mt-1">{home.stats[i]}</dt></div>)}
            </dl>
            <dl className="mt-8 grid sm:grid-cols-2 gap-x-8">
              {w.facts.map((f) => <div key={f.label} className="flex gap-3 py-3.5 border-b border-white/15">
                <Check className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div><dt className="text-sm font-bold text-teal-aa-light">{f.label}</dt><dd className="text-white/90 leading-relaxed mt-0.5">{f.value}</dd></div>
              </div>)}
            </dl>
          </div>
        </div>
        <div className="grid lg:grid-cols-12 gap-10 mt-16">
          <div className="lg:col-span-4"><WhoButtons dark /></div>
          <Questions tone="dark" className="lg:col-span-8" />
        </div>
      </div>
    </section>

    {/* How it reaches the farm: four steps in a row */}
    <section aria-labelledby="ne-how" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <span className={`${kicker} text-teal-aa`}>{home.howWeDo.kicker}</span>
        <h2 id="ne-how" className={`${h2} mt-3`}>{home.howWeDo.title}</h2>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {home.howWeDo.steps.map((s, i) => <Reveal key={s.title} delay={i * 0.08}><li className="list-none">
            <div className="relative aspect-square rounded-[2rem] overflow-hidden"><Image src={STEP_IMAGES[i]} alt={s.alt} fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover" />
              <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold">Step {i + 1}</span></div>
            <h3 className="font-heading text-xl font-bold mt-5">{s.title}</h3>
            <p className="text-slate-600 leading-relaxed mt-2">{s.description}</p>
          </li></Reveal>)}
        </ol>
      </div>
    </section>

    {/* Proof */}
    <section aria-labelledby="ne-proof" className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 id="ne-proof" className={`${h2} text-center`}>{home.testimonials.title}</h2>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {TESTIMONIALS.map((tm) => <figure key={tm.name} className="rounded-[2rem] bg-white p-7 flex flex-col">
            <LogoDisc src={tm.logo} alt={`${tm.company} logo`} />
            <blockquote className="mt-5 leading-relaxed flex-1">&ldquo;{tm.quote}&rdquo;</blockquote>
            <figcaption className="mt-6"><strong>{tm.name}</strong><span className="block text-sm text-slate-600">{tm.role}, {tm.company}</span></figcaption>
          </figure>)}
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mt-20">{home.awards.title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
          {home.awards.items.map((item, i) => <div key={item.title} className="rounded-[2rem] bg-white p-6 flex gap-4">
            <span className="relative w-16 h-16 shrink-0"><Image src={AWARDS[i].logo} alt={AWARDS[i].organization} fill sizes="64px" className="object-contain" /></span>
            <div><h3 className="font-heading font-bold leading-snug">{item.title}</h3><p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.description}</p></div>
          </div>)}
        </div>
        <p className="text-center font-heading text-xl font-bold mt-20">{home.partners.title}</p>
        <ul className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-8">{PARTNERS.map((p) => <li key={p.src} className="relative aspect-[3/2] rounded-2xl bg-white"><Image src={p.src} alt={`${p.name} ${home.partners.logo}`} fill sizes="160px" className="object-contain p-4" /></li>)}</ul>
      </div>
    </section>

    {/* Life and commitments */}
    <section aria-labelledby="ne-life" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-3 gap-5">
        <div ref={lifeRef} className="relative rounded-[2rem] overflow-hidden min-h-[420px] bg-brand-navy lg:row-span-2">
          <BackgroundVideo src={LIFE_VIDEOS[1].src} poster={LIFE_VIDEOS[1].poster} active={near} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-white"><h2 id="ne-life" className="font-heading text-2xl font-bold text-white">{home.life.title}</h2>
            <ul className="mt-3 space-y-1 text-white/90 text-sm">{home.life.points.map((p) => <li key={p}>{p}</li>)}</ul>
            <a href={a.careers.href} className="inline-flex items-center gap-2 mt-4 min-h-11 px-5 rounded-full bg-white text-brand-navy font-semibold">{a.careers.label}<Arrow /></a></div>
        </div>
        <div className="lg:col-span-2"><span className={`${kicker} text-teal-aa`}>{home.social.kicker}</span><h2 className="font-heading text-3xl font-bold mt-3">{home.social.journalTitle}</h2><p className="text-slate-600 mt-3">{home.social.introduction}</p></div>
        <div className="lg:col-span-2 grid sm:grid-cols-3 gap-5">
          {home.social.items.map((item, i) => <article key={item.title}>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden"><Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} fill sizes="260px" className="object-cover" /></div>
            <h3 className="font-heading font-bold mt-3">{home.social.featureTitles[i]}</h3><p className="text-sm text-slate-600 mt-1">{item.desc}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section className="pb-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="rounded-[2rem] bg-teal-50 px-8 py-12 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div><h2 className="font-heading text-3xl font-bold">Not sure which need fits?</h2><p className="text-slate-700 mt-2 max-w-xl">{t.contact.intro}</p></div>
          <a href={a.nutritionist.href} className={`${btnPrimary} shrink-0`}>{a.nutritionist.label}<Arrow /></a>
        </div>
      </div>
    </section>
  </div>;
}
