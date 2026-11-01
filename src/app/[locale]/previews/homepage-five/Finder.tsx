"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { Images } from "@/lib/assets";
import { AWARDS, Arrow, Check, Counter, LIFE_VIDEOS, PARTNERS, Reveal, RotatingImages, SERVE_CATEGORIES, SOCIAL_IMAGES, STATS, STEP_IMAGES, TESTIMONIALS,
  btnOutline, btnPrimary, easeOut, h2, kicker, useActions, useProducts, useWhoActions } from "./kit";

/** D: Product finder. The homepage starts by helping a visitor reach the right product for their animals. */
export default function Finder() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const a = useActions();
  const products = useProducts();
  const [species, setSpecies] = useState(0);
  const [query, setQuery] = useState("");
  const [lifeRef, near] = useNearViewport<HTMLDivElement>();
  const shelf = products.filter((p) => p.category === SERVE_CATEGORIES[species]);
  const whoActions = useWhoActions();

  return <div className="bg-white text-brand-navy">
    {/* Hero: pick your animals, see the products for them */}
    <section className="bg-gradient-to-b from-orange-50/70 to-white pt-28 md:pt-36 pb-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <span className={`${kicker} text-teal-700`}>{t.meta.siteTitle}</span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] mt-4">{home.findProduct}</h1>
          <p className="text-lg text-slate-600 mt-4">{t.products.intro}</p>
          <form action={href("/products")} className="mt-8 flex items-center rounded-full bg-white border-2 border-slate-200 focus-within:border-brand-orange shadow-lg shadow-brand-navy/5 p-1.5 max-w-xl mx-auto">
            <svg className="w-5 h-5 ml-4 text-slate-aa shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input name="q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.products.search} aria-label={t.products.search}
              className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-base focus:outline-none" />
            <button type="submit" className="min-h-11 px-6 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold cursor-pointer">{t.nav.products}</button>
          </form>
        </div>

        <h2 className="text-center font-heading text-2xl md:text-3xl font-bold mt-14">{w.serveTitle}</h2>
        <div role="tablist" aria-label={w.serveTitle} className="grid grid-cols-3 gap-3 max-w-3xl mx-auto mt-6">
          {w.cards.map((card, i) => <button key={card.title} type="button" role="tab" aria-selected={species === i} onClick={() => setSpecies(i)}
            className={`group relative rounded-2xl overflow-hidden aspect-[4/3] sm:aspect-[16/10] text-left cursor-pointer ring-offset-2 transition-all ${species === i ? "ring-4 ring-brand-orange" : "opacity-80 hover:opacity-100"}`}>
            <span aria-hidden="true"><RotatingImages group={i} offset={i} sizes="(min-width: 640px) 260px, 33vw" /></span>
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <span className="absolute left-3 bottom-2.5 sm:left-4 sm:bottom-3 font-heading font-bold text-white text-sm sm:text-xl">{card.title}</span>
          </button>)}
        </div>

        <div role="tabpanel" className="mt-10">
          <p className="text-center text-slate-600 max-w-2xl mx-auto">{w.cards[species].description}</p>
          <AnimatePresence mode="wait">
            <motion.ul key={species} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: easeOut }}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 mt-8 -mx-6 px-6 [scrollbar-width:thin]">
              {shelf.map((p) => <li key={p.id} className="snap-start shrink-0 w-[260px]">
                <a href={p.href} className="group block h-full rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-xl hover:border-brand-orange/40 transition-all">
                  <div className="relative aspect-[4/3] bg-slate-100">{p.banner && <Image src={p.banner} alt="" fill sizes="260px" className="object-cover" />}
                    <span className="absolute left-3 top-3 block w-11 h-11 rounded-full bg-white overflow-hidden shadow"><Image src={p.icon} alt="" fill sizes="44px" className="object-contain p-1" /></span></div>
                  <div className="p-4">
                    <p className="font-heading font-bold text-lg group-hover:text-brand-orange-aa transition-colors">{p.name}</p>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{p.tagline}</p>
                    <span className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-brand-orange-aa">{t.products.viewProduct}<Arrow /></span>
                  </div>
                </a>
              </li>)}
            </motion.ul>
          </AnimatePresence>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <a href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[species])}`)} className={btnOutline}>{t.products.allProducts} · {w.cards[species].title}</a>
            <a href={a.nutritionist.href} className={btnPrimary}>{a.nutritionist.label}<Arrow /></a>
          </div>
        </div>
      </div>
    </section>

    {/* Numbers and partners */}
    <section className="border-y border-slate-100 py-12">
      <div className="max-w-[1200px] mx-auto px-6">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s, i) => <div key={i}><dd className="font-heading text-4xl md:text-5xl font-bold text-brand-orange-aa"><Counter value={s.value} suffix={s.suffix} /></dd><dt className="text-sm font-semibold uppercase tracking-wider text-slate-aa mt-1">{home.stats[i]}</dt></div>)}
        </dl>
        <ul className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6 mt-12">
          {PARTNERS.slice(0, 8).map((p) => <li key={p.src} className="relative w-24 h-10"><Image src={p.src} alt={`${p.name} ${home.partners.logo}`} fill sizes="96px" className="object-contain" /></li>)}
        </ul>
      </div>
    </section>

    {/* Who we are: the profile beside a fact sheet, then the questions and the four buttons */}
    <section aria-labelledby="fi-who" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <span className={`${kicker} text-teal-aa`}>{w.kicker}</span>
              <h2 id="fi-who" className="font-heading text-3xl md:text-4xl font-bold leading-tight mt-3">{w.title}</h2>
              <p className="font-heading text-xl font-semibold text-brand-orange-aa mt-4">{w.tagline}</p>
              <p className="text-lg text-slate-600 leading-relaxed mt-5">{w.intro}</p>
              <div className="flex items-center gap-4 mt-7 rounded-2xl bg-slate-50 p-4">
                <span className="relative w-24 h-20 rounded-xl overflow-hidden shrink-0"><Image src={Images.people.foundersNew} alt={t.about.foundersAlt} fill sizes="96px" className="object-cover" /></span>
                <p className="text-sm text-slate-700 leading-relaxed">{w.leadershipCaption}</p>
              </div>
              <div className="flex flex-wrap gap-3 mt-7">
                {whoActions.map((act, i) => <a key={act.href} href={act.href} data-analytics-click={act.label} className={i === 0 ? btnPrimary : btnOutline}>{act.label}{i === 0 && <Arrow />}</a>)}
              </div>
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-7">
          <Reveal>
            <dl className="rounded-3xl border border-slate-200 overflow-hidden">
              {w.facts.map((f, i) => <div key={f.label} className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[2.5rem_11rem_1fr] gap-x-4 gap-y-1 px-5 py-4 border-b border-slate-100 last:border-0 odd:bg-white even:bg-slate-50">
                <span aria-hidden="true" className="grid place-items-center w-8 h-8 rounded-lg bg-brand-navy text-white text-sm font-bold row-span-2 sm:row-span-1">{i + 1}</span>
                <dt className="font-semibold text-brand-navy">{f.label}</dt>
                <dd className="text-slate-600 leading-relaxed col-start-2 sm:col-start-3">{f.value}</dd>
              </div>)}
            </dl>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            {w.faq.map((item, i) => <Reveal key={item.q} delay={(i % 2) * 0.06} className="rounded-2xl border border-slate-200 p-6">
              <h3 className="font-heading text-lg font-bold">{item.q}</h3>
              <p className="text-slate-600 text-[15px] leading-relaxed mt-2">{item.a}</p>
            </Reveal>)}
          </div>
        </div>
      </div>
    </section>

    {/* How it reaches the farm */}
    <section className="bg-brand-navy text-white py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <div><span className={`${kicker} text-teal-aa-light`}>{home.howWeDo.kicker}</span><h2 className={`${h2} text-white mt-3`}>{home.howWeDo.title}</h2></div>
          <a href={a.research.href} className="inline-flex items-center gap-2 min-h-12 px-6 rounded-full border-2 border-white/50 font-semibold hover:bg-white hover:text-brand-navy">{a.research.label}<Arrow /></a>
        </div>
        <ol className="grid md:grid-cols-4 gap-px bg-white/15 rounded-3xl overflow-hidden">
          {home.howWeDo.steps.map((step, i) => <li key={step.title} className="bg-brand-navy p-6">
            <div className="relative aspect-video rounded-xl overflow-hidden"><Image src={STEP_IMAGES[i]} alt={step.alt} fill sizes="280px" className="object-cover" /></div>
            <p className="text-teal-aa-light font-bold mt-5">0{i + 1}</p>
            <h3 className="font-heading text-xl font-bold text-white mt-1">{step.title}</h3>
            <p className="text-white/80 text-sm leading-relaxed mt-2">{step.description}</p>
          </li>)}
        </ol>
      </div>
    </section>

    {/* What partners say, and the recognition */}
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12"><span className={`${kicker} text-teal-aa`}>{home.testimonials.kicker}</span><h2 className={`${h2} mt-3`}>{home.testimonials.title}</h2></div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((tm) => <figure key={tm.name} className="rounded-3xl border border-slate-200 p-7 flex flex-col">
            <span className="relative block w-14 h-14 rounded-full border border-slate-200 overflow-hidden"><Image src={tm.logo} alt={`${tm.company} logo`} fill sizes="56px" className="object-contain p-1.5" /></span>
            <blockquote className="mt-5 leading-relaxed text-slate-700 flex-1">&ldquo;{tm.quote}&rdquo;</blockquote>
            <figcaption className="mt-6 pt-5 border-t border-slate-100"><strong className="block">{tm.name}</strong><span className="text-sm text-slate-600">{tm.role}, {tm.company}</span></figcaption>
          </figure>)}
        </div>
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {home.awards.items.map((item, i) => <li key={item.title} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
            <span className="relative w-14 h-14 rounded-xl bg-white shrink-0"><Image src={AWARDS[i].logo} alt={AWARDS[i].organization} fill sizes="56px" className="object-contain p-1.5" /></span>
            <span className="text-sm font-semibold leading-snug">{item.title}<span className="block text-xs font-normal text-slate-aa">{AWARDS[i].year}</span></span>
          </li>)}
        </ul>
      </div>
    </section>

    {/* Life and commitments */}
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10 items-center">
        <div ref={lifeRef} className="lg:col-span-5 relative aspect-[4/5] rounded-3xl overflow-hidden bg-brand-navy">
          <BackgroundVideo src={LIFE_VIDEOS[0].src} poster={LIFE_VIDEOS[0].poster} active={near} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="lg:col-span-7">
          <h2 className={h2}>{home.life.title}</h2>
          <ul className="grid sm:grid-cols-2 gap-3 mt-6">{home.life.points.map((p) => <li key={p} className="flex gap-3 rounded-xl bg-white p-4"><Check className="w-5 h-5 text-teal-aa shrink-0" />{p}</li>)}</ul>
          <a href={a.careers.href} className={`${btnPrimary} mt-6`}>{a.careers.label}<Arrow /></a>
          <h3 className="font-heading text-2xl font-bold mt-14">{home.social.journalTitle}</h3>
          <ul className="grid sm:grid-cols-3 gap-4 mt-5">
            {home.social.items.map((item, i) => <li key={item.title}>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden"><Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} fill sizes="220px" className="object-cover" /></div>
              <p className="font-semibold mt-3">{item.title}</p><p className="text-sm text-slate-600">{item.desc}</p>
            </li>)}
          </ul>
        </div>
      </div>
    </section>

    {/* The next step */}
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="rounded-3xl bg-brand-navy text-white p-10 md:p-14 text-center flex flex-col items-center">
          <h2 className={`${h2} text-white`}>{a.nutritionist.label}</h2>
          <p className="text-white/85 text-lg mt-4 max-w-2xl">{t.contact.intro}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <a href={a.nutritionist.href} className={btnPrimary}>{t.contact.formTitle}<Arrow /></a>
            <a href={a.dossier.href} className="inline-flex items-center min-h-12 px-7 rounded-full border-2 border-white/60 font-semibold hover:bg-white hover:text-brand-navy">{a.dossier.label}</a>
          </div>
        </div>
      </div>
    </section>
  </div>;
}
