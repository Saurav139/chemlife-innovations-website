"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { AWARDS, Arrow, Check, Counter, FLAGSHIPS, LIFE_VIDEOS, PARTNERS, Play, SERVE_CATEGORIES, SERVE_IMAGES, SOCIAL_IMAGES, STATS, STEP_IMAGES, StoryPlayer, TESTIMONIALS,
  easeOut, kicker, useActions, useProducts, useRotate } from "./kit";

const tile = "rounded-3xl bg-white border border-slate-200/70 overflow-hidden";

/** C: Bento. A soft grey page where every part of the story is its own rounded tile. */
export default function Bento() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const a = useActions();
  const products = useProducts();
  const flagships = FLAGSHIPS.slice(0, 4).map((name) => products.find((p) => p.name === name)!);
  const [slide] = useRotate(home.taglines.length, 5000);
  const [shown] = useRotate(3, 4000);
  const [quote, setQuote] = useState(0);
  const [faq, setFaq] = useState(0);
  const [story, setStory] = useState(false);
  const [lifeRef, near] = useNearViewport<HTMLDivElement>();

  return <div className="bg-[#f2f4f8] text-brand-navy pt-24 md:pt-28 pb-16">
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 space-y-4">
      {/* Hero bento */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:auto-rows-[190px]">
        <div className={`${tile} col-span-2 lg:row-span-2 bg-brand-navy! border-0 p-8 md:p-10 flex flex-col justify-between text-white`}>
          <div>
            <span className={`${kicker} text-teal-aa-light`}>{t.meta.siteTitle}</span>
            <h1 className="font-heading text-4xl md:text-5xl font-bold leading-[1.08] text-white mt-4 min-h-[3.25em]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={slide} className="block" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45, ease: easeOut }}>
                  {home.taglines[slide][0]} <span className="text-teal-400">{home.taglines[slide][1]}</span> {home.taglines[slide][2]}
                </motion.span>
              </AnimatePresence>
            </h1>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <a href={a.findProduct.href} className="inline-flex items-center gap-2 min-h-12 px-6 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover font-semibold text-white">{a.findProduct.label}<Arrow /></a>
            <a href={a.nutritionist.href} className="inline-flex items-center min-h-12 px-6 rounded-full bg-white/10 hover:bg-white/20 font-semibold text-white">{a.nutritionist.label}</a>
          </div>
        </div>
        <div className={`${tile} col-span-2 lg:row-span-2 relative min-h-[300px]`}>
          <Image src={Images.heroes.awardsLandscape} alt={home.heroAlt} fill priority sizes="(min-width: 1024px) 600px, 100vw" className="object-cover object-[70%_40%]" />
          <button type="button" onClick={() => setStory(true)} className="absolute left-5 bottom-5 inline-flex items-center gap-3 rounded-full bg-white/95 pl-2 pr-5 py-2 font-semibold shadow-lg hover:bg-white cursor-pointer">
            <span className="grid place-items-center w-9 h-9 rounded-full bg-brand-orange-aa text-white"><Play /></span>{home.watchStory}
          </button>
        </div>
        {STATS.map((s, i) => <div key={i} className={`${tile} p-6 flex flex-col justify-between ${i === 1 ? "bg-orange-50!" : i === 2 ? "bg-teal-50!" : ""}`}>
          <span className="text-sm font-semibold uppercase tracking-wider text-slate-aa">{home.stats[i]}</span>
          <span className="font-heading text-5xl font-bold"><Counter value={s.value} suffix={s.suffix} /></span>
        </div>)}
      </div>

      {/* Who we are */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className={`${tile} lg:col-span-2 p-8 md:p-10`}>
          <span className={`${kicker} text-teal-aa`}>{w.kicker}</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3">{w.tagline}</h2>
          <p className="text-slate-600 text-lg leading-relaxed mt-4">{w.intro}</p>
        </div>
        <div className={`${tile} relative min-h-[260px]`}>
          <Image src={Images.people.foundersNew} alt={t.about.foundersAlt} fill sizes="(min-width: 1024px) 400px, 100vw" className="object-cover" />
          <a href={a.leadership.href} className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-white/95 px-5 py-3 font-semibold hover:bg-white">{a.leadership.label}<Arrow /></a>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[w.facts[0], w.facts[2], w.facts[5], w.facts[8]].map((f) => <div key={f.label} className={`${tile} p-6`}>
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-orange-50 text-brand-orange-aa"><Check /></span>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-aa mt-5">{f.label}</p>
          <p className="mt-1.5 leading-relaxed">{f.value}</p>
        </div>)}
      </div>

      {/* What we serve and flagship products */}
      <div className="grid lg:grid-cols-3 gap-4">
        {w.cards.map((card, i) => <a key={card.title} href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className={`${tile} group block`}>
          <div className="relative aspect-[16/11]">
            {SERVE_IMAGES[i].map((src, j) => <Image key={src} src={src} alt={card.alts[j]} fill sizes="(min-width: 1024px) 400px, 100vw" aria-hidden={j !== shown}
              className={`object-cover transition-opacity duration-1000 ${j === shown ? "opacity-100" : "opacity-0"}`} />)}
          </div>
          <div className="p-6 flex items-start justify-between gap-4">
            <div><h3 className="font-heading text-2xl font-bold">{card.title}</h3><p className="text-slate-600 mt-1.5 leading-relaxed">{card.description}</p></div>
            <span className="grid place-items-center w-10 h-10 rounded-full bg-slate-100 group-hover:bg-brand-orange-aa group-hover:text-white shrink-0 transition-colors"><Arrow /></span>
          </div>
        </a>)}
      </div>
      <div className={`${tile} p-6 md:p-8`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-heading text-3xl font-bold">{t.products.titleStart} <span className="text-brand-orange-aa">{t.products.titleAccent}</span></h2>
          <a href={a.findProduct.href} className="inline-flex items-center gap-2 font-semibold text-brand-orange-aa hover:underline">{t.products.allProducts}<Arrow /></a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {flagships.map((p) => <a key={p.id} href={p.href} className="group rounded-2xl bg-slate-50 hover:bg-orange-50 p-3 transition-colors">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden">{p.banner && <Image src={p.banner} alt="" fill sizes="280px" className="object-cover" />}</div>
            <p className="font-heading font-bold text-lg mt-3 px-1">{p.name}</p>
            <p className="text-sm text-slate-600 px-1 pb-1 line-clamp-2">{p.tagline}</p>
          </a>)}
        </div>
      </div>

      {/* How we do it */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {home.howWeDo.steps.map((step, i) => <div key={step.title} className={tile}>
          <div className="relative aspect-[16/10]"><Image src={STEP_IMAGES[i]} alt={step.alt} fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" /></div>
          <div className="p-6"><p className="text-sm font-bold text-brand-orange-aa">{home.howWeDo.kicker} · 0{i + 1}</p><h3 className="font-heading text-xl font-bold mt-1">{step.title}</h3><p className="text-sm text-slate-600 mt-2 leading-relaxed">{step.description}</p></div>
        </div>)}
      </div>

      {/* Proof: testimonial, awards, partners */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className={`${tile} lg:col-span-2 p-8 md:p-10 flex flex-col`}>
          <span className={`${kicker} text-teal-aa`}>{home.testimonials.title}</span>
          <AnimatePresence mode="wait">
            <motion.figure key={quote} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
              <blockquote className="text-xl md:text-2xl leading-relaxed mt-5">&ldquo;{TESTIMONIALS[quote].quote}&rdquo;</blockquote>
              <figcaption className="mt-5 text-slate-600"><strong className="text-brand-navy">{TESTIMONIALS[quote].name}</strong> · {TESTIMONIALS[quote].role}, {TESTIMONIALS[quote].company}</figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="flex gap-2 mt-6">
            {TESTIMONIALS.map((tm, i) => <button key={tm.name} type="button" onClick={() => setQuote(i)} aria-pressed={i === quote}
              className={`min-h-11 px-4 rounded-full text-sm font-semibold cursor-pointer ${i === quote ? "bg-brand-navy text-white" : "bg-slate-100 hover:bg-slate-200"}`}>{tm.company}</button>)}
          </div>
        </div>
        <div className={`${tile} p-8`}>
          <span className={`${kicker} text-teal-aa`}>{home.awards.title}</span>
          <ul className="grid grid-cols-2 gap-3 mt-5">
            {home.awards.items.map((item, i) => <li key={item.title} className="rounded-2xl bg-slate-50 p-3 text-center">
              <div className="relative h-14"><Image src={AWARDS[i].logo} alt={AWARDS[i].organization} fill sizes="140px" className="object-contain" /></div>
              <p className="text-xs font-semibold mt-2 leading-snug">{item.title}</p>
            </li>)}
          </ul>
        </div>
      </div>
      <div className={`${tile} p-6 md:p-8`}>
        <p className="font-heading text-xl font-bold">{home.partners.title}</p>
        <ul className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-3 mt-5">
          {PARTNERS.map((p) => <li key={p.src} className="relative aspect-[3/2] rounded-xl bg-slate-50"><Image src={p.src} alt={`${p.name} ${home.partners.logo}`} fill sizes="120px" className="object-contain p-3" /></li>)}
        </ul>
      </div>

      {/* Life, social and questions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div ref={lifeRef} className={`${tile} relative min-h-[420px] bg-brand-navy! border-0`}>
          <BackgroundVideo src={LIFE_VIDEOS[2].src} poster={LIFE_VIDEOS[2].poster} active={near} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7">
            <h2 className="font-heading text-2xl font-bold text-white">{home.life.title}</h2>
            <p className="text-white/90 mt-2 text-sm leading-relaxed">{home.life.points.join(" · ")}</p>
            <a href={a.careers.href} className="inline-flex items-center gap-2 mt-4 min-h-11 px-5 rounded-full bg-white text-brand-navy font-semibold">{a.careers.label}<Arrow /></a>
          </div>
        </div>
        <div className={`${tile} lg:col-span-2 p-8`}>
          <span className={`${kicker} text-teal-aa`}>{home.social.kicker}</span>
          <h2 className="font-heading text-3xl font-bold mt-3">{home.social.journalTitle}</h2>
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            {home.social.items.map((item, i) => <div key={item.title}>
              <div className="relative aspect-square rounded-2xl overflow-hidden"><Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} fill sizes="240px" className="object-cover" /></div>
              <p className="font-heading font-bold mt-3">{item.title}</p>
              <p className="text-sm text-slate-600 mt-1">{home.social.proofs[i]}</p>
            </div>)}
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <div className={`${tile} lg:col-span-2 p-8`}>
          <ul className="divide-y divide-slate-200">
            {w.faq.map((item, i) => <li key={item.q}>
              <button type="button" onClick={() => setFaq(i)} aria-expanded={faq === i} className="w-full flex items-center justify-between gap-4 py-4 text-left font-heading text-lg font-bold cursor-pointer">
                {item.q}<span aria-hidden="true" className={`text-2xl text-brand-orange-aa transition-transform ${faq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {faq === i && <p className="pb-5 text-slate-600 leading-relaxed">{item.a}</p>}
            </li>)}
          </ul>
        </div>
        <div className={`${tile} bg-brand-orange-aa! border-0 p-8 flex flex-col justify-between text-white`}>
          <h2 className="font-heading text-3xl font-bold text-white">{t.contact.titleStart} {t.contact.titleAccent} {t.contact.titleEnd}</h2>
          <div className="space-y-3 mt-8">
            <a href={a.nutritionist.href} className="flex items-center justify-between min-h-12 px-5 rounded-full bg-white text-brand-orange-aa font-semibold">{a.nutritionist.label}<Arrow /></a>
            <a href={a.dossier.href} className="flex items-center justify-between min-h-12 px-5 rounded-full border-2 border-white/70 font-semibold">{a.dossier.label}<Arrow /></a>
          </div>
        </div>
      </div>
    </div>
    <StoryPlayer open={story} onClose={() => setStory(false)} />
  </div>;
}
