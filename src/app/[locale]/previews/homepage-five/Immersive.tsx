"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { AWARDS, Arrow, Counter, LIFE_VIDEOS, PARTNERS, Play, Reveal, SERVE_CATEGORIES, SERVE_IMAGES, SOCIAL_IMAGES, STATS, STEP_IMAGES, StoryPlayer, TESTIMONIALS,
  btnLight, btnPrimary, easeOut, h2, kicker, useActions, useRotate } from "./kit";

const HERO_PHOTOS = [Images.heroes.awardsLandscape, Images.heroes.chicken, Images.heroes.dairy, Images.heroes.slide76];

/** B: Immersive. Full-width photographs carry each section; text sits on them in large, simple type. */
export default function Immersive() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const a = useActions();
  const [slide] = useRotate(home.taglines.length, 6000);
  const [photo] = useRotate(HERO_PHOTOS.length, 6000);
  const [story, setStory] = useState(false);
  const [open, setOpen] = useState(0);
  const [quote, setQuote] = useRotate(TESTIMONIALS.length, 8000);
  const [lifeRef, near] = useNearViewport<HTMLElement>();

  return <div className="bg-white text-brand-navy">
    {/* Hero: full screen photos, headline at the bottom left, the numbers in a glass strip */}
    <section className="relative min-h-svh flex flex-col justify-end overflow-hidden bg-brand-navy">
      {HERO_PHOTOS.map((src, i) => <div key={src} aria-hidden={i !== photo} className={`absolute inset-0 transition-opacity duration-1000 ${i === photo ? "opacity-100" : "opacity-0"}`}>
        <Image src={src} alt={i === 0 ? home.heroAlt : ""} fill priority={i === 0} sizes="100vw" className="object-cover animate-ken-burns" />
      </div>)}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
      <div className="relative max-w-[1200px] w-full mx-auto px-6 pt-36 pb-10">
        <span className={`${kicker} text-teal-aa-light`}>{t.meta.siteTitle}</span>
        <h1 className="font-heading text-[2.6rem] sm:text-6xl lg:text-7xl font-bold leading-[1.05] text-white mt-4 max-w-4xl min-h-[3.15em]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={slide} className="block" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: easeOut }}>
              {home.taglines[slide][0]}<br /><span className="text-teal-400">{home.taglines[slide][1]}</span><br />{home.taglines[slide][2]}
            </motion.span>
          </AnimatePresence>
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-8">
          <a href={a.findProduct.href} className={btnPrimary}>{a.findProduct.label}<Arrow /></a>
          <a href={a.nutritionist.href} className={btnLight}>{a.nutritionist.label}</a>
          <button type="button" onClick={() => setStory(true)} className="inline-flex items-center gap-3 min-h-12 px-3 text-white font-semibold cursor-pointer hover:text-teal-300">
            <span className="grid place-items-center w-11 h-11 rounded-full border-2 border-white/70"><Play /></span>{home.watchStory}
          </button>
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 mt-12 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md divide-x divide-white/15">
          {STATS.map((s, i) => <div key={i} className={`p-5 md:p-6 ${i > 1 ? "border-t md:border-t-0 border-white/15" : ""}`}>
            <dd className="font-heading text-3xl md:text-4xl font-bold text-white"><Counter value={s.value} suffix={s.suffix} /></dd>
            <dt className="text-xs md:text-sm font-semibold uppercase tracking-wider text-white/80 mt-1">{home.stats[i]}</dt>
          </div>)}
        </dl>
      </div>
    </section>

    {/* Who we are: big statement, photo beside */}
    <section className="py-20 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal><span className={`${kicker} text-teal-aa`}>{w.kicker}</span>
          <p className="font-heading text-3xl md:text-5xl font-bold leading-tight mt-5 max-w-5xl">{w.tagline} <span className="text-slate-aa">{w.title}</span></p></Reveal>
        <div className="grid lg:grid-cols-2 gap-12 mt-14 items-center">
          <Reveal><div className="relative aspect-[4/3] rounded-3xl overflow-hidden"><Image src={Images.people.foundersNew} alt={t.about.foundersAlt} fill sizes="(min-width: 1024px) 580px, 100vw" className="object-cover" /></div></Reveal>
          <Reveal delay={0.1}>
            <p className="text-lg text-slate-600 leading-relaxed">{w.intro}</p>
            <p className="text-slate-600 leading-relaxed mt-4">{w.leadershipCaption}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href={a.leadership.href} className="inline-flex items-center gap-2 font-semibold text-brand-orange-aa hover:underline">{a.leadership.label}<Arrow /></a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    {/* What we serve: three photo panels; the open one widens */}
    <section aria-labelledby="imm-serve" className="pb-20 md:pb-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 id="imm-serve" className={`${h2} mb-10`}>{w.serveTitle}</h2>
        <div className="flex flex-col md:flex-row gap-4 md:h-[520px]">
          {w.cards.map((card, i) => {
            const active = open === i;
            return <div key={card.title} onMouseEnter={() => setOpen(i)}
              className={`relative overflow-hidden rounded-3xl min-h-[340px] md:min-h-0 transition-[flex] duration-700 ease-out ${active ? "md:flex-[2.2]" : "md:flex-1"}`}>
              <Image src={SERVE_IMAGES[i][0]} alt={card.alts[0]} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <button type="button" onClick={() => setOpen(i)} aria-expanded={active} className="absolute inset-0 text-left p-7 flex flex-col justify-end cursor-pointer">
                <span className="text-sm font-semibold text-teal-300">0{i + 1}</span>
                <span className="font-heading text-3xl font-bold text-white mt-1">{card.title}</span>
                <span className={`text-white/90 leading-relaxed mt-3 max-w-md transition-opacity duration-500 ${active ? "opacity-100" : "md:opacity-0"}`}>{card.description}</span>
              </button>
              <a href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className={`absolute right-6 top-6 grid place-items-center w-12 h-12 rounded-full bg-white text-brand-navy hover:bg-brand-orange-aa hover:text-white transition-all ${active ? "opacity-100" : "md:opacity-0"}`} aria-label={`${t.products.allProducts}: ${card.title}`}><Arrow className="w-5 h-5" /></a>
            </div>;
          })}
        </div>
      </div>
    </section>

    {/* How we do it: each step a photo row, alternating sides */}
    <section className="bg-slate-50 py-20 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14"><span className={`${kicker} text-teal-aa`}>{home.howWeDo.kicker}</span><h2 className={`${h2} mt-3`}>{home.howWeDo.title}</h2></div>
        <div className="space-y-12 md:space-y-20">
          {home.howWeDo.steps.map((step, i) => <Reveal key={step.title} className={`grid md:grid-cols-2 gap-8 md:gap-16 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden"><Image src={STEP_IMAGES[i]} alt={step.alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" /></div>
            <div>
              <span className="font-heading text-7xl font-bold text-brand-orange/25">0{i + 1}</span>
              <h3 className="font-heading text-3xl font-bold -mt-4">{step.title}</h3>
              <p className="text-lg text-slate-600 leading-relaxed mt-4">{step.description}</p>
            </div>
          </Reveal>)}
        </div>
      </div>
    </section>

    {/* A testimonial over the dairy photo */}
    <section className="relative py-24 md:py-36 overflow-hidden">
      <Image src={Images.heroes.dairy} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-brand-navy/85" />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <span className={`${kicker} text-teal-aa-light`}>{home.testimonials.kicker}</span>
        <AnimatePresence mode="wait">
          <motion.figure key={quote} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <blockquote className="font-heading text-2xl md:text-3xl font-medium leading-snug text-white mt-6">&ldquo;{TESTIMONIALS[quote].quote}&rdquo;</blockquote>
            <figcaption className="mt-8 text-white"><strong>{TESTIMONIALS[quote].name}</strong><span className="text-white/80"> · {TESTIMONIALS[quote].role}, {TESTIMONIALS[quote].company}</span></figcaption>
          </motion.figure>
        </AnimatePresence>
        <div className="flex justify-center gap-3 mt-8">
          {TESTIMONIALS.map((tm, i) => <button key={tm.name} type="button" onClick={() => setQuote(i)} aria-label={tm.company} aria-pressed={i === quote}
            className={`relative w-14 h-14 rounded-full bg-white overflow-hidden cursor-pointer transition-all ${i === quote ? "ring-4 ring-brand-orange" : "opacity-70"}`}><Image src={tm.logo} alt="" fill sizes="56px" className="object-contain p-1.5" /></button>)}
        </div>
      </div>
    </section>

    {/* Awards and partners on white */}
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4"><span className={`${kicker} text-teal-aa`}>{home.awards.kicker}</span><h2 className={`${h2} mt-3`}>{home.awards.title}</h2></div>
          <ul className="lg:col-span-8 grid sm:grid-cols-2 gap-x-10 gap-y-8">
            {home.awards.items.map((item, i) => <li key={item.title} className="flex gap-5">
              <span className="relative w-20 h-20 rounded-2xl border border-slate-200 bg-white shrink-0"><Image src={AWARDS[i].logo} alt={AWARDS[i].organization} fill sizes="80px" className="object-contain p-2" /></span>
              <span><span className="block font-heading font-bold text-lg">{item.title}</span><span className="block text-sm text-slate-600 mt-1 leading-relaxed">{item.description}</span></span>
            </li>)}
          </ul>
        </div>
        <div className="mt-20 pt-12 border-t border-slate-200">
          <p className="text-center font-heading text-2xl font-bold">{home.partners.title}</p>
          <ul className="flex flex-wrap justify-center gap-x-12 gap-y-8 mt-10">
            {PARTNERS.map((p) => <li key={p.src} className="relative w-28 h-12 grayscale hover:grayscale-0 opacity-75 hover:opacity-100 transition"><Image src={p.src} alt={`${p.name} ${home.partners.logo}`} fill sizes="112px" className="object-contain" /></li>)}
          </ul>
        </div>
      </div>
    </section>

    {/* Life at ChemLife: the video fills the band */}
    <section ref={lifeRef} className="relative min-h-[560px] flex items-center overflow-hidden bg-brand-navy">
      <BackgroundVideo src={LIFE_VIDEOS[1].src} poster={LIFE_VIDEOS[1].poster} active={near} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="relative max-w-[1200px] w-full mx-auto px-6 py-20">
        <h2 className={`${h2} text-white max-w-lg`}>{home.life.title}</h2>
        <ul className="mt-6 space-y-3 max-w-lg">{home.life.points.map((p) => <li key={p} className="text-lg text-white/90 border-l-2 border-teal-400 pl-4">{p}</li>)}</ul>
        <a href={a.careers.href} className={`${btnPrimary} mt-8`}>{a.careers.label}<Arrow /></a>
      </div>
    </section>

    {/* Social responsibility: three photo cards */}
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mb-12"><span className={`${kicker} text-teal-aa`}>{home.social.kicker}</span><h2 className={`${h2} mt-3`}>{home.social.journalTitle}</h2><p className="text-lg text-slate-600 mt-4">{home.social.introduction}</p></div>
        <div className="grid md:grid-cols-3 gap-6">
          {home.social.items.map((item, i) => <article key={item.title} className="relative rounded-3xl overflow-hidden aspect-[3/4]">
            <Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} fill sizes="(min-width: 768px) 380px, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300">{home.social.categories[i]}</p>
              <h3 className="font-heading text-2xl font-bold text-white mt-2">{home.social.featureTitles[i]}</h3>
              <p className="text-white/90 mt-2 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </article>)}
        </div>
      </div>
    </section>

    {/* Closing */}
    <section className="relative py-24 overflow-hidden">
      <Image src={Images.heroes.chicken} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-brand-navy/85" />
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className={`${h2} text-white`}>{t.contact.titleStart} <span className="text-teal-400">{t.contact.titleAccent}</span> {t.contact.titleEnd}</h2>
        <p className="text-white/90 text-lg mt-4">{t.contact.intro}</p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <a href={a.nutritionist.href} className={btnPrimary}>{a.nutritionist.label}<Arrow /></a>
          <a href={a.dossier.href} className={btnLight}>{a.dossier.label}</a>
        </div>
      </div>
    </section>
    <StoryPlayer open={story} onClose={() => setStory(false)} />
  </div>;
}
