"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Images, Videos } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { AWARDS, Arrow, Counter, LIFE_VIDEOS, PARTNERS, Play, Reveal, RotatingImages, SERVE_CATEGORIES, SOCIAL_IMAGES, STATS, STEP_IMAGES, StoryPlayer, TESTIMONIALS,
  btnLight, btnPrimary, easeOut, useActions, useRotate } from "../homepage-five/kit";
import { LogoDisc, WhoButtons } from "./data";

const HERO_PHOTOS = [Images.heroes.awardsLandscape, Images.heroes.chicken, Images.heroes.dairy, Images.heroes.slide76, Images.heroes.slide87];
const kick = "text-sm font-semibold tracking-widest uppercase";
const title = "font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight";

/** F: Refined original. The staging homepage's sections, order and look, tidied: one type scale, one rhythm,
 *  cleaner cards and calmer motion. */
export default function Refined() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const a = useActions();
  const [slide, setSlide] = useRotate(home.taglines.length, 6000);
  const [photo] = useRotate(HERO_PHOTOS.length, 6000);
  const [award, setAward] = useRotate(AWARDS.length, 7000);
  const [quote, setQuote] = useState(0);
  const [social, setSocial] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [story, setStory] = useState(false);
  const [lifeRef, near] = useNearViewport<HTMLElement>();

  return <div className="bg-white text-brand-navy">
    {/* Hero, as on staging: the photographs, the rotating taglines, the two actions, the numbers */}
    <section className="relative min-h-svh flex flex-col justify-end overflow-hidden bg-brand-navy">
      {HERO_PHOTOS.map((src, i) => <div key={src} aria-hidden={i !== photo} className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${i === photo ? "opacity-100" : "opacity-0"}`}>
        <Image src={src} alt={i === 0 ? home.heroAlt : ""} fill priority={i === 0} sizes="100vw" className="object-cover object-[70%_40%] animate-ken-burns" />
      </div>)}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="relative max-w-[1200px] w-full mx-auto px-6 pt-36 pb-12">
        <h1 className="font-heading text-[2.4rem] sm:text-6xl lg:text-7xl font-bold leading-[1.08] text-white min-h-[3.3em] max-w-4xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={slide} className="block" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: easeOut }}>
              {home.taglines[slide][0]}<br /><span className="text-teal-400">{home.taglines[slide][1]}</span><br />{home.taglines[slide][2]}
            </motion.span>
          </AnimatePresence>
        </h1>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <a href={a.findProduct.href} className={btnPrimary}>{a.findProduct.label}<Arrow /></a>
          <a href={a.nutritionist.href} className={btnLight}>{a.nutritionist.label}</a>
          <button type="button" onClick={() => setStory(true)} className="inline-flex items-center gap-2 min-h-12 px-3 font-semibold text-white/90 hover:text-white cursor-pointer"><Play />{home.watchStory}</button>
        </div>
        <div className="flex gap-1 mt-6">
          {home.taglines.map((_, i) => <button key={i} type="button" onClick={() => setSlide(i)} aria-label={`${home.goToSlide} ${i + 1}`} aria-current={i === slide ? "true" : undefined} className="py-4 px-1 cursor-pointer">
            <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-teal-400" : "w-3 bg-white/40"}`} /></button>)}
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-white/20">
          {STATS.map((s, i) => <div key={i}><dd className="font-heading text-4xl md:text-5xl font-bold text-teal-400"><Counter value={s.value} suffix={s.suffix} /></dd><dt className="text-xs md:text-sm font-semibold uppercase tracking-wider text-white/80 mt-1">{home.stats[i]}</dt></div>)}
        </dl>
      </div>
    </section>

    {/* Who we are, as on staging: the facts beside the questions, the buttons, then What we serve */}
    <section aria-labelledby="re-who" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          <span className={`${kick} text-teal-aa`}>{w.kicker}</span>
          <h2 id="re-who" className={`${title} mt-2`}>{w.title}</h2>
          <p className="font-heading text-lg md:text-xl font-semibold italic text-brand-orange-aa mt-4">{w.tagline}</p>
        </div>
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 mt-12">
          <Reveal className="lg:col-span-7">
            <p className="text-lg md:text-xl leading-relaxed">{w.intro}</p>
            <dl className="mt-8 rounded-2xl border border-slate-200 overflow-hidden">
              {w.facts.map((f) => <div key={f.label} className="grid sm:grid-cols-[11rem_1fr] gap-x-6 gap-y-1 px-5 py-3.5 border-b border-slate-200 last:border-0 even:bg-slate-50/70">
                <dt className="text-sm font-semibold text-teal-aa">{f.label}</dt><dd className="text-slate-700 leading-relaxed">{f.value}</dd>
              </div>)}
            </dl>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5 space-y-4">
            {w.faq.map((item) => <div key={item.q} className="rounded-2xl bg-slate-50 p-6">
              <h3 className="font-heading text-lg md:text-xl font-bold">{item.q}</h3>
              <p className="text-slate-600 leading-relaxed mt-2">{item.a}</p>
            </div>)}
          </Reveal>
        </div>
        <p className="mt-12 text-slate-600 text-center max-w-3xl mx-auto">{w.leadershipCaption}</p>
        <WhoButtons className="justify-center mt-6" />

        <h3 className="font-heading text-2xl md:text-3xl font-bold text-center mt-20">{w.serveTitle}</h3>
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto mt-10">
          {w.cards.map((card, i) => <a key={card.title} href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className="group text-center">
            <div className="relative mx-auto w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden ring-8 ring-slate-100 group-hover:ring-teal-100 transition"><RotatingImages group={i} offset={i} sizes="256px" /></div>
            <h4 className="font-heading text-2xl font-bold mt-6 group-hover:text-brand-orange-aa transition-colors">{card.title}</h4>
            <p className="text-slate-600 leading-relaxed mt-2">{card.description}</p>
          </a>)}
        </div>
      </div>
    </section>

    {/* How we do it, on the lab photograph as on staging */}
    <section aria-labelledby="re-how" className="relative py-20 md:py-28 overflow-hidden">
      <Image src={Images.process.howWeDoBg} alt={home.howWeDo.bgAlt} fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-brand-navy/90" />
      <div className="relative max-w-[1200px] mx-auto px-6">
        <div className="text-center"><span className={`${kick} text-teal-aa-light`}>{home.howWeDo.kicker}</span><h2 id="re-how" className={`${title} text-white mt-2`}>{home.howWeDo.title}</h2></div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {home.howWeDo.steps.map((s, i) => <Reveal key={s.title} delay={i * 0.08}><li className="list-none rounded-2xl bg-white/10 backdrop-blur-sm overflow-hidden h-full">
            <div className="relative aspect-[4/3]"><Image src={STEP_IMAGES[i]} alt={s.alt} fill sizes="(min-width: 1024px) 280px, 50vw" className="object-cover" />
              <span className="absolute left-4 top-4 grid place-items-center w-10 h-10 rounded-full bg-brand-orange-aa text-white font-bold">{i + 1}</span></div>
            <div className="p-5"><h3 className="font-heading text-xl font-bold text-white">{s.title}</h3><p className="text-white/85 text-sm leading-relaxed mt-2">{s.description}</p></div>
          </li></Reveal>)}
        </ol>
      </div>
    </section>

    {/* Awards, as on staging: one plaque at a time, with the four as tabs */}
    <section aria-labelledby="re-awards" className="py-20 md:py-28">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="text-center"><span className={`${kick} text-teal-aa`}>{home.awards.kicker}</span><h2 id="re-awards" className={`${title} mt-2`}>{home.awards.title}</h2></div>
        <div className="mt-12 rounded-3xl border-2 border-brand-orange/70 p-6 md:p-10 min-h-[300px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div key={award} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.4, ease: easeOut }} className="grid sm:grid-cols-[16rem_1fr] gap-8 items-center w-full">
              <div className="relative aspect-[4/3] rounded-2xl bg-orange-50 p-4"><div className="relative w-full h-full rounded-xl bg-white"><Image src={AWARDS[award].logo} alt={AWARDS[award].organization} fill sizes="256px" className="object-contain p-4" /></div></div>
              <div><p className="text-sm font-semibold uppercase tracking-wider text-teal-aa">{AWARDS[award].organization} · {AWARDS[award].year}</p>
                <h3 className="font-heading text-2xl md:text-3xl font-bold mt-2">{home.awards.items[award].title}</h3>
                <p className="text-slate-700 text-lg leading-relaxed mt-3">{home.awards.items[award].description}</p></div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-6">
          {home.awards.items.map((item, i) => <button key={item.title} type="button" onClick={() => setAward(i)} aria-pressed={award === i}
            className={`rounded-xl px-3 py-3 text-sm font-semibold text-left cursor-pointer transition-colors ${award === i ? "bg-brand-navy text-white" : "bg-slate-100 hover:bg-slate-200"}`}>{item.title}</button>)}
        </div>
      </div>
    </section>

    {/* Life at ChemLife, on the team's videos */}
    <section ref={lifeRef} aria-labelledby="re-life" className="relative min-h-[560px] flex items-center overflow-hidden bg-brand-navy">
      <BackgroundVideo src={LIFE_VIDEOS[0].src} poster={LIFE_VIDEOS[0].poster} active={near} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-brand-navy/80" />
      <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 id="re-life" className={`${title} text-white`}>{home.life.title}</h2>
        <ul className="mt-10 grid sm:grid-cols-2 gap-4 text-left">{home.life.points.map((p) => <li key={p} className="flex gap-3 rounded-2xl bg-white/10 p-4 text-white"><span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-teal-400 shrink-0" />{p}</li>)}</ul>
        <a href={a.careers.href} className="inline-flex items-center gap-2 mt-10 min-h-12 px-7 rounded-full bg-white text-brand-orange-aa font-semibold hover:bg-orange-50">{a.careers.label}</a>
      </div>
    </section>

    {/* Partners */}
    <section aria-labelledby="re-partners" className="py-20 md:py-28">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="text-center"><span className={`${kick} text-teal-aa`}>{home.partners.kicker}</span><h2 id="re-partners" className={`${title} mt-2`}>{home.partners.title}</h2></div>
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-12">{PARTNERS.map((p) => <li key={p.src} className="relative aspect-[3/2] rounded-2xl border border-slate-200 hover:border-brand-orange/40 hover:shadow-md transition"><Image src={p.src} alt={`${p.name} ${home.partners.logo}`} fill sizes="220px" className="object-contain p-5" /></li>)}</ul>
      </div>
    </section>

    {/* Testimonials, on navy as on staging */}
    <section aria-labelledby="re-voices" className="bg-brand-navy py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center"><span className={`${kick} text-teal-aa-light`}>{home.testimonials.kicker}</span><h2 id="re-voices" className={`${title} text-white mt-2`}>{home.testimonials.title}</h2></div>
        <div className="grid lg:grid-cols-3 gap-10 mt-12 items-start">
          <div className="order-first grid grid-cols-3 lg:grid-cols-1 gap-3">
            {TESTIMONIALS.map((tm, i) => <button key={tm.name} type="button" onClick={() => setQuote(i)} aria-pressed={quote === i}
              className={`flex flex-col lg:flex-row items-center gap-3 rounded-2xl p-3 lg:p-4 text-left cursor-pointer transition-colors ${quote === i ? "bg-white text-brand-navy" : "bg-white/5 text-white hover:bg-white/10"}`}>
              <LogoDisc src={tm.logo} alt="" size={48} /><span className="text-sm font-semibold text-center lg:text-left">{tm.name}<span className={`hidden lg:block font-normal ${quote === i ? "text-slate-600" : "text-white/75"}`}>{tm.role}</span></span></button>)}
          </div>
          <AnimatePresence mode="wait">
            <motion.figure key={quote} className="lg:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}>
              <svg className="w-12 h-12 text-teal-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" /></svg>
              <blockquote className="text-xl md:text-2xl leading-relaxed text-white mt-6">&ldquo;{TESTIMONIALS[quote].quote}&rdquo;</blockquote>
              <figcaption className="mt-6 text-white"><strong>{TESTIMONIALS[quote].name}</strong><span className="text-white/80"> · {TESTIMONIALS[quote].role}, {TESTIMONIALS[quote].company}</span></figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>
    </section>

    {/* Social responsibility, as on staging: one story open, the other two to choose */}
    <section aria-labelledby="re-social" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl"><span className={`${kick} text-teal-aa`}>{home.social.kicker}</span><h2 id="re-social" className={`${title} mt-2`}>{home.social.journalTitle}</h2><p className="text-lg text-slate-600 mt-4">{home.social.introduction}</p></div>
        <div className="grid lg:grid-cols-12 gap-8 mt-10">
          <article className="lg:col-span-8 rounded-3xl overflow-hidden bg-slate-50">
            <div className="relative aspect-[16/9] bg-black">
              {social === 0 && playing
                ? <video src={Videos.social1} poster={SOCIAL_IMAGES[0]} controls autoPlay muted playsInline aria-label={home.social.imageAlts[0]} className="absolute inset-0 w-full h-full object-cover" />
                : <><Image key={social} src={SOCIAL_IMAGES[social]} alt={home.social.imageAlts[social]} fill sizes="(min-width: 1024px) 780px, 100vw" className="object-cover" />
                  {social === 0 && <button type="button" onClick={() => setPlaying(true)} className="absolute left-5 bottom-5 inline-flex items-center gap-2 min-h-11 px-5 rounded-full bg-white font-semibold cursor-pointer"><Play />{home.social.watchVideo}</button>}</>}
            </div>
            <div className="p-6 md:p-8"><p className="text-sm font-bold uppercase tracking-wider text-teal-aa">{home.social.categories[social]}</p><h3 className="font-heading text-2xl md:text-3xl font-bold mt-2">{home.social.featureTitles[social]}</h3>
              <p className="text-slate-700 text-lg mt-2">{home.social.items[social].desc}</p><p className="font-semibold text-brand-orange-aa mt-3">{home.social.proofs[social]}</p></div>
          </article>
          <ul aria-label={home.social.moreStories} className="lg:col-span-4 space-y-4">
            {home.social.items.map((item, i) => i !== social && <li key={item.title}>
              <button type="button" onClick={() => { setSocial(i); setPlaying(false); }} className="w-full text-left flex gap-4 rounded-2xl border border-slate-200 p-3 hover:border-brand-orange/40 transition cursor-pointer">
                <span className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0"><Image src={SOCIAL_IMAGES[i]} alt="" fill sizes="112px" className="object-cover" /></span>
                <span><span className="block text-xs font-bold uppercase tracking-wider text-teal-aa">{home.social.categories[i]}</span><span className="block font-heading font-bold mt-1">{item.title}</span><span className="block text-sm text-slate-600 mt-1">{item.desc}</span><span className="block text-sm font-semibold text-brand-orange-aa mt-1">{home.social.viewStory}</span></span>
              </button>
            </li>)}
          </ul>
        </div>
      </div>
    </section>
    <StoryPlayer open={story} onClose={() => setStory(false)} />
  </div>;
}
