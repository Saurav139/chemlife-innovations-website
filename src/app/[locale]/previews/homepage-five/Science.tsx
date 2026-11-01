"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Images } from "@/lib/assets";
import { RESEARCH_TOPICS, researchAnchor } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { AWARDS, Arrow, Counter, LIFE_VIDEOS, PARTNERS, Play, Reveal, RotatingImages, SERVE_CATEGORIES, SOCIAL_IMAGES, STATS, STEP_IMAGES, StoryPlayer, TESTIMONIALS,
  btnOutline, btnPrimary, easeOut, h2, kicker, useActions, useRotate, useWhoActions } from "./kit";

// The molecule network in the hero: atoms and the bonds between them, on a 600 × 520 grid.
const ATOMS = [[300, 90], [420, 160], [420, 300], [300, 370], [180, 300], [180, 160], [520, 90], [530, 380], [300, 480], [70, 380], [80, 90], [300, 230]];
const BONDS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 6], [2, 7], [3, 8], [4, 9], [5, 10], [0, 11], [2, 11], [4, 11]];

function Molecule() {
  const reduce = useReducedMotion();
  return <svg viewBox="0 0 600 520" className="w-full h-auto" aria-hidden="true">
    {BONDS.map(([a, b], i) => <motion.line key={i} x1={ATOMS[a][0]} y1={ATOMS[a][1]} x2={ATOMS[b][0]} y2={ATOMS[b][1]} stroke="#305280" strokeOpacity="0.35" strokeWidth="3"
      initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: easeOut }} />)}
    {ATOMS.map(([x, y], i) => <motion.circle key={i} cx={x} cy={y} r={i === 11 ? 26 : i > 5 ? 12 : 18}
      fill={i === 11 ? "#e8614a" : i > 5 ? "#14b8a6" : "#305280"} initial={{ scale: reduce ? 1 : 0 }} animate={{ scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: easeOut }} style={{ transformOrigin: `${x}px ${y}px` }} />)}
    {!reduce && <circle r="7" fill="#e8614a">
      <animateMotion dur="6s" repeatCount="indefinite" path="M300 90 L420 160 L420 300 L300 370 L180 300 L180 160 Z" />
    </circle>}
  </svg>;
}

/** E: Science. Leads with the technology: an animated molecule, the five research platforms and the path from lab to farm. */
export default function Science() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const r = t.research;
  const href = useHref();
  const a = useActions();
  const whoActions = useWhoActions();
  const [faq, setFaq] = useState(0);
  const [slide] = useRotate(home.taglines.length, 5000);
  const [story, setStory] = useState(false);
  const [topic, setTopic] = useState(0);
  const [quote, setQuote] = useState(0);
  const [lifeRef, near] = useNearViewport<HTMLDivElement>();
  const pipe = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: pipe, offset: ["start 80%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });
  const topics = RESEARCH_TOPICS.map((tp, i) => ({ ...tp, ...r.topics[i] }));
  const current = topics[topic];

  return <div className="bg-white text-brand-navy">
    {/* Hero: on a faint lab grid, the headline beside the molecule */}
    <section className="relative overflow-hidden pt-28 md:pt-36 pb-16 bg-[linear-gradient(to_right,rgb(48_82_128/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(48_82_128/0.06)_1px,transparent_1px)] bg-[size:48px_48px]">
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-teal-200/30 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-orange-200/30 blur-3xl" aria-hidden="true" />
      <div className="relative max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white border border-teal-200 px-4 py-1.5 text-sm font-semibold text-teal-aa">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />{w.facts[2].label}: {w.facts[2].value}
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] mt-6 min-h-[3.3em]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={slide} className="block" initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.5 }}>
                {home.taglines[slide][0]} <span className="bg-gradient-to-r from-brand-orange-aa to-teal-aa bg-clip-text text-transparent">{home.taglines[slide][1]}</span> {home.taglines[slide][2]}
              </motion.span>
            </AnimatePresence>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed mt-4 max-w-xl">{r.intro}</p>
          <div className="flex flex-wrap gap-3 mt-8">
            <a href={a.research.href} className={btnPrimary}>{a.research.label}<Arrow /></a>
            <a href={a.findProduct.href} className={btnOutline}>{a.findProduct.label}</a>
            <button type="button" onClick={() => setStory(true)} className="inline-flex items-center gap-2 min-h-12 px-3 font-semibold hover:text-brand-orange-aa cursor-pointer"><Play />{home.watchStory}</button>
          </div>
        </div>
        <div className="relative max-w-[520px] mx-auto w-full">
          <Molecule />
          <div className="mt-2 mx-auto w-fit rounded-2xl bg-white/90 backdrop-blur border border-slate-200 shadow-lg px-5 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-aa">{w.facts[4].label}</p>
            <p className="font-bold text-sm mt-0.5 max-w-sm">{w.facts[4].value}</p>
          </div>
        </div>
      </div>
      <dl className="relative max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 mt-14">
        {STATS.map((s, i) => <div key={i} className="rounded-2xl bg-white/80 backdrop-blur border border-slate-200 p-5">
          <dd className="font-heading text-4xl font-bold"><Counter value={s.value} suffix={s.suffix} /></dd>
          <dt className="text-sm font-semibold text-slate-aa mt-1">{home.stats[i]}</dt>
        </div>)}
      </dl>
    </section>

    {/* The five research platforms, picked from a list */}
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-3xl"><span className={`${kicker} text-teal-aa`}>{r.kicker}</span><h2 className={`${h2} mt-3`}>{r.titleStart} <span className="text-brand-orange-aa">{r.titleAccent}</span></h2></div>
        <div className="grid lg:grid-cols-12 gap-8 mt-12">
          <div role="tablist" aria-label={r.listHeading} className="lg:col-span-5 space-y-2">
            {topics.map((tp, i) => <button key={tp.id} type="button" role="tab" aria-selected={topic === i} onClick={() => setTopic(i)}
              className={`w-full text-left rounded-2xl border p-5 flex gap-4 cursor-pointer transition-colors ${topic === i ? "border-brand-orange bg-orange-50/60" : "border-slate-200 hover:border-slate-300"}`}>
              <span className={`grid place-items-center w-9 h-9 rounded-full text-sm font-bold shrink-0 ${topic === i ? "bg-brand-orange-aa text-white" : "bg-slate-100"}`}>{i + 1}</span>
              <span><span className="block font-heading font-bold leading-snug">{tp.title}</span><span className="block text-sm text-slate-600 mt-1">{tp.tagline}</span></span>
            </button>)}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={topic} role="tabpanel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35, ease: easeOut }}
              className="lg:col-span-7 rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden">
              <div className="relative aspect-[16/9] bg-white"><Image src={current.banner} alt={`${current.title} ${r.bannerAlt}`} fill sizes="(min-width: 1024px) 680px, 100vw" className="object-contain" /></div>
              <div className="p-7 grid sm:grid-cols-2 gap-6">
                <div><p className="text-xs font-bold uppercase tracking-wider text-brand-orange-aa">{r.challenge}</p><p className="text-slate-700 mt-2 leading-relaxed text-sm">{current.challenge}</p></div>
                <div><p className="text-xs font-bold uppercase tracking-wider text-teal-aa">{r.advantage}</p><p className="text-slate-700 mt-2 leading-relaxed text-sm">{current.advantage}</p></div>
              </div>
              <div className="px-7 pb-7"><a href={href(`/research#${researchAnchor(current.englishTitle)}`)} className="inline-flex items-center gap-2 font-semibold text-brand-orange-aa hover:underline">{r.readMore}<Arrow /></a></div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>

    {/* From lab to farm: a pipeline that fills as you scroll */}
    <section className="bg-brand-navy text-white py-20 md:py-28 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-14"><span className={`${kicker} text-teal-aa-light`}>{home.howWeDo.kicker}</span><h2 className={`${h2} text-white mt-3`}>{home.howWeDo.title}</h2></div>
        <ol ref={pipe} className="relative grid md:grid-cols-4 gap-10 md:gap-6">
          <span aria-hidden="true" className="hidden md:block absolute left-[12%] right-[12%] top-9 h-1 rounded-full bg-white/10" />
          <motion.span aria-hidden="true" style={{ scaleX: progress }} className="hidden md:block absolute left-[12%] right-[12%] top-9 h-1 rounded-full bg-gradient-to-r from-teal-400 to-brand-orange origin-left" />
          {home.howWeDo.steps.map((step, i) => <Reveal key={step.title} delay={i * 0.1} className="relative text-center">
            <span className="relative z-10 mx-auto grid place-items-center w-[4.5rem] h-[4.5rem] rounded-full bg-brand-navy border-4 border-teal-400 font-heading text-2xl font-bold">0{i + 1}</span>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mt-6"><Image src={STEP_IMAGES[i]} alt={step.alt} fill sizes="280px" className="object-cover" /></div>
            <h3 className="font-heading text-xl font-bold text-white mt-5">{step.title}</h3>
            <p className="text-white/80 text-sm leading-relaxed mt-2">{step.description}</p>
          </Reveal>)}
        </ol>
      </div>
    </section>

    {/* Who we are, set out like a lab report: summary, data sheet, the team, the questions */}
    <section aria-labelledby="sc-who" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <Reveal className="max-w-4xl">
          <span className={`${kicker} text-teal-aa`}>{w.kicker}</span>
          <h2 id="sc-who" className={`${h2} mt-3`}>{w.title}</h2>
          <p className="font-heading text-2xl md:text-3xl font-bold mt-4 bg-gradient-to-r from-brand-orange-aa to-teal-aa bg-clip-text text-transparent w-fit">{w.tagline}</p>
          <p className="text-lg text-slate-600 leading-relaxed mt-5">{w.intro}</p>
        </Reveal>

        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {w.facts.map((f, i) => <Reveal key={f.label} delay={(i % 3) * 0.05} className={`rounded-2xl border border-slate-200 bg-white p-5 border-l-4 ${i % 2 ? "border-l-teal-500" : "border-l-brand-orange"} ${i === 9 ? "sm:col-span-2 lg:col-span-3" : ""}`}>
            <dt className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-aa">{f.label}<span className="text-teal-aa">{String(i + 1).padStart(2, "0")}</span></dt>
            <dd className="font-semibold mt-2 leading-relaxed">{f.value}</dd>
          </Reveal>)}
        </dl>

        <div className="grid lg:grid-cols-12 gap-10 mt-16 items-start">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden"><Image src={Images.people.foundersNew} alt={t.about.foundersAlt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" /></div>
            <p className="text-slate-600 leading-relaxed mt-4">{w.leadershipCaption}</p>
            <ul className="grid grid-cols-4 gap-3 mt-6">
              {AWARDS.map((aw, i) => <li key={aw.logo} className="relative aspect-square rounded-2xl border border-slate-200 bg-white"><Image src={aw.logo} alt={home.awards.items[i].title} fill sizes="110px" className="object-contain p-2.5" /></li>)}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <ol className="space-y-3">
              {w.faq.map((item, i) => <li key={item.q} className={`rounded-2xl border transition-colors ${faq === i ? "border-teal-300 bg-teal-50/50" : "border-slate-200"}`}>
                <h3><button type="button" onClick={() => setFaq(faq === i ? -1 : i)} aria-expanded={faq === i} className="w-full flex items-center gap-4 p-5 text-left font-heading text-lg font-bold cursor-pointer">
                  <span aria-hidden="true" className={`grid place-items-center w-9 h-9 rounded-full text-sm shrink-0 ${faq === i ? "bg-teal-aa text-white" : "bg-slate-100"}`}>{i + 1}</span>
                  <span className="flex-1">{item.q}</span><span aria-hidden="true" className={`text-2xl text-teal-aa transition-transform ${faq === i ? "rotate-45" : ""}`}>+</span>
                </button></h3>
                {faq === i && <p className="px-5 pb-5 sm:pl-[4.25rem] text-slate-600 leading-relaxed">{item.a}</p>}
              </li>)}
            </ol>
            <div className="flex flex-wrap gap-3 mt-8">
              {whoActions.map((act, i) => <a key={act.href} href={act.href} data-analytics-click={act.label} className={i === 0 ? btnPrimary : btnOutline}>{act.label}{i === 0 && <Arrow />}</a>)}
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    {/* What we serve: three cards, each cycling its photos under a soft lab-glass tint */}
    <section aria-labelledby="sc-serve" className="pb-20 md:pb-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 id="sc-serve" className={`${h2} mb-10`}>{w.serveTitle}</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {w.cards.map((card, i) => <Reveal key={card.title} delay={i * 0.08}>
            <a href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className="group relative block aspect-[4/5] rounded-3xl overflow-hidden">
              <RotatingImages group={i} offset={i} sizes="(min-width: 768px) 380px, 100vw" className="group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 text-white">
                <p className="text-sm font-semibold text-teal-300">0{i + 1}</p>
                <h3 className="font-heading text-2xl font-bold text-white mt-1">{card.title}</h3>
                <p className="text-white/90 text-sm leading-relaxed mt-2">{card.description}</p>
              </div>
            </a>
          </Reveal>)}
        </div>
      </div>
    </section>

    {/* Partners and what they say */}
    <section className="bg-slate-50 py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10"><span className={`${kicker} text-teal-aa`}>{home.testimonials.kicker}</span><h2 className={`${h2} mt-3`}>{home.testimonials.title}</h2></div>
        <div className="max-w-3xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.figure key={quote} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <blockquote className="text-xl md:text-2xl leading-relaxed">&ldquo;{TESTIMONIALS[quote].quote}&rdquo;</blockquote>
              <figcaption className="mt-6"><strong>{TESTIMONIALS[quote].name}</strong><span className="text-slate-600"> · {TESTIMONIALS[quote].role}, {TESTIMONIALS[quote].company}</span></figcaption>
            </motion.figure>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((tm, i) => <button key={tm.name} type="button" onClick={() => setQuote(i)} aria-pressed={quote === i}
              className={`min-h-11 px-4 rounded-full text-sm font-semibold cursor-pointer ${quote === i ? "bg-brand-navy text-white" : "bg-white border border-slate-200"}`}>{tm.company}</button>)}
          </div>
        </div>
        <ul className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 mt-14">
          {PARTNERS.slice(0, 9).map((p) => <li key={p.src} className="relative aspect-[3/2] rounded-xl bg-white border border-slate-200"><Image src={p.src} alt={`${p.name} ${home.partners.logo}`} fill sizes="120px" className="object-contain p-3" /></li>)}
        </ul>
      </div>
    </section>

    {/* People and commitments */}
    <section className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-3 gap-6">
        <div ref={lifeRef} className="relative rounded-3xl overflow-hidden min-h-[380px] bg-brand-navy">
          <BackgroundVideo src={LIFE_VIDEOS[1].src} poster={LIFE_VIDEOS[1].poster} active={near} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6"><h2 className="font-heading text-2xl font-bold text-white">{home.life.title}</h2>
            <a href={a.careers.href} className="inline-flex items-center gap-2 mt-3 font-semibold text-white hover:underline">{a.careers.label}<Arrow /></a></div>
        </div>
        {home.social.items.slice(0, 2).map((item, i) => <article key={item.title} className="rounded-3xl border border-slate-200 overflow-hidden">
          <div className="relative aspect-[16/10]"><Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} fill sizes="400px" className="object-cover" /></div>
          <div className="p-6"><p className="text-xs font-bold uppercase tracking-wider text-teal-aa">{home.social.categories[i]}</p>
            <h3 className="font-heading text-xl font-bold mt-2">{home.social.featureTitles[i]}</h3><p className="text-slate-600 mt-2 text-sm">{item.desc}</p></div>
        </article>)}
      </div>
    </section>

    {/* Closing */}
    <section className="pb-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-brand-navy text-white p-10 md:p-14 text-center">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,#14b8a6,transparent_45%),radial-gradient(circle_at_80%_80%,#e8614a,transparent_45%)]" aria-hidden="true" />
          <div className="relative">
            <h2 className={`${h2} text-white`}>{r.ctaTitle}</h2>
            <p className="text-white/85 text-lg mt-4 max-w-2xl mx-auto">{r.ctaText}</p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <a href={href("/contact?type=research")} className={btnPrimary}>{r.ctaButton}<Arrow /></a>
              <a href={a.nutritionist.href} className="inline-flex items-center min-h-12 px-7 rounded-full border-2 border-white/60 font-semibold hover:bg-white hover:text-brand-navy">{a.nutritionist.label}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
    <StoryPlayer open={story} onClose={() => setStory(false)} />
  </div>;
}
