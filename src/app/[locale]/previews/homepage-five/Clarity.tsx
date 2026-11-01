"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { AWARDS, Arrow, Check, Counter, FLAGSHIPS, LIFE_VIDEOS, PARTNERS, Play, Reveal, SERVE_CATEGORIES, SERVE_IMAGES, SOCIAL_IMAGES, STATS, STEP_IMAGES, StoryPlayer, TESTIMONIALS,
  btnOutline, btnPrimary, easeOut, h2, kicker, useActions, useProducts, useRotate } from "./kit";

/** A: Clarity. White and navy, one message per section, cards in a calm grid. */
export default function Clarity() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const a = useActions();
  const products = useProducts();
  const flagships = FLAGSHIPS.map((name) => products.find((p) => p.name === name)!);
  const [slide, setSlide] = useRotate(home.taglines.length, 5000);
  const [story, setStory] = useState(false);
  const [quote, setQuote] = useState(0);
  const [lifeRef, near] = useNearViewport<HTMLDivElement>();

  return <div className="bg-white text-brand-navy">
    {/* Hero: the message on the left, the award photo with proof chips on the right */}
    <section className="pt-28 md:pt-36 pb-16 md:pb-20">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6">
          <span className={`${kicker} text-teal-aa`}>{t.meta.siteTitle}</span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] mt-4 min-h-[3.3em]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={slide} className="block" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.45, ease: easeOut }}>
                {home.taglines[slide][0]} <span className="text-brand-orange-aa">{home.taglines[slide][1]}</span> {home.taglines[slide][2]}
              </motion.span>
            </AnimatePresence>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mt-4 max-w-xl">{t.footer.bio}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href={a.findProduct.href} className={btnPrimary}>{a.findProduct.label}<Arrow /></a>
            <a href={a.nutritionist.href} className={btnOutline}>{a.nutritionist.label}</a>
          </div>
          <div className="flex items-center gap-5 mt-8">
            <button type="button" onClick={() => setStory(true)} className="inline-flex items-center gap-3 font-semibold hover:text-brand-orange-aa cursor-pointer">
              <span className="grid place-items-center w-11 h-11 rounded-full bg-brand-navy text-white"><Play /></span>{home.watchStory}
            </button>
            <span className="flex gap-1.5" role="group">
              {home.taglines.map((_, i) => <button key={i} type="button" onClick={() => setSlide(i)} aria-label={`${home.goToSlide} ${i + 1}`} aria-current={i === slide ? "true" : undefined}
                className="py-4 cursor-pointer"><span className={`block h-1.5 rounded-full transition-all ${i === slide ? "w-6 bg-brand-orange" : "w-1.5 bg-slate-300"}`} /></button>)}
            </span>
          </div>
        </div>
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl shadow-brand-navy/15">
            <Image src={Images.heroes.awardsLandscape} alt={home.heroAlt} fill priority sizes="(min-width: 1024px) 600px, 100vw" className="object-cover object-[70%_40%]" />
          </div>
          <div className="absolute -left-4 sm:-left-8 bottom-8 rounded-2xl bg-white shadow-xl border border-slate-100 px-5 py-4">
            <p className="font-heading text-3xl font-bold text-brand-orange-aa"><Counter value={30} suffix="+" /></p>
            <p className="text-sm text-slate-600">{home.stats[0]}</p>
          </div>
          <div className="absolute -right-3 sm:-right-6 top-8 rounded-2xl bg-white shadow-xl border border-slate-100 px-5 py-4 flex items-center gap-3">
            <span className="grid place-items-center w-10 h-10 rounded-full bg-teal-50 text-teal-aa"><Check /></span>
            <span><span className="block text-xs font-semibold uppercase tracking-wider text-slate-aa">{w.facts[5].label}</span><span className="block font-bold">FAMI-QS</span></span>
          </div>
        </div>
      </div>
    </section>

    {/* Partner logos, scrolling */}
    <section aria-label={home.partners.title} className="border-y border-slate-100 bg-slate-50/60 py-8 overflow-hidden">
      <p className="text-center text-sm font-semibold text-slate-aa mb-6">{home.partners.kicker}</p>
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex items-center gap-14 pr-14">
          {PARTNERS.map((p) => <li key={p.src} className="relative w-32 h-12 shrink-0"><Image src={p.src} alt={`${p.name} ${home.partners.logo}`} fill sizes="128px" className="object-contain" /></li>)}
        </ul>)}
      </div>
    </section>

    {/* Who we are, with the numbers */}
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-12">
        <Reveal className="lg:col-span-5">
          <span className={`${kicker} text-teal-aa`}>{w.kicker}</span>
          <h2 className={`${h2} mt-3`}>{w.tagline}</h2>
          <p className="text-slate-600 text-lg leading-relaxed mt-5">{w.intro}</p>
          <a href={a.leadership.href} className="inline-flex items-center gap-2 font-semibold text-brand-orange-aa mt-6 hover:underline">{a.leadership.label}<Arrow /></a>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-7">
          <dl className="grid grid-cols-2 gap-4">
            {STATS.map((s, i) => <div key={i} className="rounded-2xl bg-slate-50 border border-slate-100 p-6">
              <dd className="font-heading text-4xl md:text-5xl font-bold text-brand-navy"><Counter value={s.value} suffix={s.suffix} /></dd>
              <dt className="text-sm font-semibold uppercase tracking-wider text-slate-aa mt-2">{home.stats[i]}</dt>
            </div>)}
          </dl>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mt-8">
            {[w.facts[0], w.facts[2], w.facts[4], w.facts[7]].map((f) => <li key={f.label} className="flex gap-3">
              <span className="mt-1 grid place-items-center w-6 h-6 rounded-full bg-orange-50 text-brand-orange-aa shrink-0"><Check className="w-3.5 h-3.5" /></span>
              <span><strong className="block text-sm">{f.label}</strong><span className="text-sm text-slate-600">{f.value}</span></span>
            </li>)}
          </ul>
        </Reveal>
      </div>
    </section>

    {/* What we serve */}
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className={`${kicker} text-teal-aa`}>{t.nav.products}</span>
          <h2 className={`${h2} mt-3`}>{w.serveTitle}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {w.cards.map((card, i) => <Reveal key={card.title} delay={i * 0.08}>
            <a href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className="group block h-full rounded-3xl bg-white border border-slate-200 overflow-hidden hover:shadow-xl hover:border-brand-orange/30 transition-all">
              <div className="relative aspect-[16/10] overflow-hidden"><Image src={SERVE_IMAGES[i][0]} alt={card.alts[0]} fill sizes="(min-width: 768px) 380px, 100vw" className="object-cover group-hover:scale-105 transition-transform duration-500" /></div>
              <div className="p-6">
                <h3 className="font-heading text-2xl font-bold">{card.title}</h3>
                <p className="text-slate-600 mt-2 leading-relaxed">{card.description}</p>
                <span className="inline-flex items-center gap-2 mt-5 font-semibold text-brand-orange-aa">{t.products.allProducts}<Arrow /></span>
              </div>
            </a>
          </Reveal>)}
        </div>
      </div>
    </section>

    {/* Flagship products */}
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div><span className={`${kicker} text-teal-aa`}>{t.products.kicker}</span><h2 className={`${h2} mt-3`}>{t.products.titleStart} <span className="text-brand-orange-aa">{t.products.titleAccent}</span></h2></div>
          <a href={a.findProduct.href} className={btnOutline}>{t.products.allProducts}</a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {flagships.map((p) => <a key={p.id} href={p.href} className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 hover:border-brand-orange/40 hover:shadow-lg transition-all">
            <span className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">{p.banner && <Image src={p.banner} alt="" fill sizes="80px" className="object-cover" />}</span>
            <span className="min-w-0">
              <span className="block text-xs font-bold uppercase tracking-wider text-teal-aa">{p.categoryName}</span>
              <span className="block font-heading text-lg font-bold group-hover:text-brand-orange-aa transition-colors">{p.name}</span>
              <span className="block text-sm text-slate-600 line-clamp-1">{p.tagline}</span>
            </span>
          </a>)}
        </div>
      </div>
    </section>

    {/* How we do it */}
    <section className="bg-brand-navy text-white py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12"><span className={`${kicker} text-teal-aa-light`}>{home.howWeDo.kicker}</span><h2 className={`${h2} text-white mt-3`}>{home.howWeDo.title}</h2></div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {home.howWeDo.steps.map((step, i) => <Reveal key={step.title} delay={i * 0.08}>
            <li className="list-none">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden"><Image src={STEP_IMAGES[i]} alt={step.alt} fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover" />
                <span className="absolute top-3 left-3 grid place-items-center w-9 h-9 rounded-full bg-brand-orange-aa font-bold">{i + 1}</span></div>
              <h3 className="font-heading text-xl font-bold text-white mt-5">{step.title}</h3>
              <p className="text-white/80 mt-2 leading-relaxed">{step.description}</p>
            </li>
          </Reveal>)}
        </ol>
      </div>
    </section>

    {/* Proof: awards and testimonials */}
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12"><span className={`${kicker} text-teal-aa`}>{home.awards.kicker}</span><h2 className={`${h2} mt-3`}>{home.awards.title}</h2></div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {home.awards.items.map((item, i) => <div key={item.title} className="rounded-2xl border border-slate-200 p-6 text-center">
            <div className="relative h-20"><Image src={AWARDS[i].logo} alt={AWARDS[i].organization} fill sizes="200px" className="object-contain" /></div>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-aa mt-5">{AWARDS[i].year}</p>
            <h3 className="font-heading font-bold text-lg mt-1">{item.title}</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
          </div>)}
        </div>

        <div className="mt-20 rounded-3xl bg-slate-50 border border-slate-100 p-8 md:p-12 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4">
            <span className={`${kicker} text-teal-aa`}>{home.testimonials.kicker}</span>
            <h2 className="font-heading text-3xl font-bold mt-3">{home.testimonials.title}</h2>
            <div className="flex gap-3 mt-6">
              {TESTIMONIALS.map((tm, i) => <button key={tm.name} type="button" onClick={() => setQuote(i)} aria-pressed={quote === i} aria-label={tm.company}
                className={`relative w-14 h-14 rounded-full bg-white overflow-hidden border-2 cursor-pointer ${quote === i ? "border-brand-orange" : "border-slate-200"}`}><Image src={tm.logo} alt="" fill sizes="56px" className="object-contain p-1.5" /></button>)}
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.figure key={quote} className="lg:col-span-8" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35 }}>
              <blockquote className="text-xl md:text-2xl leading-relaxed">&ldquo;{TESTIMONIALS[quote].quote}&rdquo;</blockquote>
              <figcaption className="mt-6"><strong>{TESTIMONIALS[quote].name}</strong><span className="text-slate-600"> · {TESTIMONIALS[quote].role}, {TESTIMONIALS[quote].company}</span></figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>
    </section>

    {/* Life at ChemLife and social responsibility */}
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-10">
        <div ref={lifeRef} className="relative rounded-3xl overflow-hidden min-h-[420px] bg-brand-navy">
          <BackgroundVideo src={LIFE_VIDEOS[0].src} poster={LIFE_VIDEOS[0].poster} active={near} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8">
            <h2 className="font-heading text-3xl font-bold text-white">{home.life.title}</h2>
            <ul className="mt-4 space-y-1.5">{home.life.points.map((p) => <li key={p} className="flex gap-2 text-white/90"><Check className="w-5 h-5 text-teal-400 shrink-0" />{p}</li>)}</ul>
            <a href={a.careers.href} className="inline-flex items-center gap-2 mt-6 min-h-12 px-6 rounded-full bg-white text-brand-navy font-semibold hover:bg-orange-50">{a.careers.label}<Arrow /></a>
          </div>
        </div>
        <div>
          <span className={`${kicker} text-teal-aa`}>{home.social.kicker}</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-3">{home.social.journalTitle}</h2>
          <p className="text-slate-600 mt-3 leading-relaxed">{home.social.introduction}</p>
          <ul className="mt-8 space-y-4">
            {home.social.items.map((item, i) => <li key={item.title} className="flex gap-4 rounded-2xl bg-white border border-slate-200 p-4">
              <span className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0"><Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} fill sizes="96px" className="object-cover" /></span>
              <span><span className="block text-xs font-bold uppercase tracking-wider text-teal-aa">{home.social.categories[i]}</span>
                <span className="block font-heading font-bold text-lg">{home.social.featureTitles[i]}</span>
                <span className="block text-sm text-slate-600 mt-1">{item.desc}</span></span>
            </li>)}
          </ul>
        </div>
      </div>
    </section>

    {/* Closing call to action */}
    <section className="py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="rounded-3xl bg-brand-orange-aa text-white p-10 md:p-14 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div><h2 className="font-heading text-3xl md:text-4xl font-bold text-white">{t.contact.titleStart} {t.contact.titleAccent} {t.contact.titleEnd}</h2>
            <p className="text-white mt-3 max-w-xl">{w.leadershipCaption}</p></div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <a href={a.nutritionist.href} className="inline-flex items-center gap-2 min-h-12 px-7 rounded-full bg-white text-brand-orange-aa font-semibold hover:bg-orange-50">{a.nutritionist.label}<Arrow /></a>
            <a href={a.dossier.href} className="inline-flex items-center min-h-12 px-7 rounded-full border-2 border-white/70 text-white font-semibold hover:bg-white/10">{a.dossier.label}</a>
          </div>
        </div>
      </div>
    </section>
    <StoryPlayer open={story} onClose={() => setStory(false)} />
  </div>;
}
