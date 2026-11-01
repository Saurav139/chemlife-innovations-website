"use client";

import { useState } from "react";
import Image from "next/image";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { AWARDS, Arrow, Counter, LIFE_VIDEOS, PARTNERS, Play, Reveal, RotatingImages, SERVE_CATEGORIES, SOCIAL_IMAGES, STATS, STEP_IMAGES, StoryPlayer, TESTIMONIALS,
  btnPrimary, h2, kicker, useActions } from "../homepage-five/kit";
import { LogoDisc, Questions, WhoButtons } from "./data";

/** E: Nature & science. Two halves that meet: the farm and plant wisdom on one side, the lab and ANBioT on the other. */
export default function Duality() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const a = useActions();
  const [story, setStory] = useState(false);
  const [side, setSide] = useState<"nature" | "science">("nature");
  const [lifeRef, near] = useNearViewport<HTMLDivElement>();
  const [nature, , science] = [home.taglines[1], null, home.taglines[2]];

  return <div className="bg-white text-brand-navy">
    {/* Hero: two halves, nature and science, with the name of what joins them across the middle */}
    <section className="pt-[4.5rem] md:pt-20 lg:pt-24">
      <div className="grid md:grid-cols-2 min-h-[78svh]">
        <div className="relative min-h-[42svh] md:min-h-0">
          <Image src={Images.heroes.slide76} alt="A cow and her calf in a pasture" fill priority sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-950/10 to-transparent" />
          <p className="absolute left-6 md:left-10 bottom-8 md:bottom-32 max-w-sm font-heading text-2xl md:text-3xl font-bold text-white">{nature[0]}<br /><span className="text-teal-300">{nature[1]}</span> {nature[2]}</p>
        </div>
        <div className="relative min-h-[42svh] md:min-h-0">
          <Image src={Images.process.researchImage} alt="The ChemLife research laboratory" fill priority sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13233a]/85 via-[#13233a]/15 to-transparent" />
          <p className="absolute left-6 md:left-10 bottom-8 md:bottom-32 max-w-sm font-heading text-2xl md:text-3xl font-bold text-white">{science[0]}<br /><span className="text-orange-200">{science[1]}</span> {science[2]}</p>
        </div>
      </div>
      <div className="max-w-[1000px] mx-auto px-6 mt-6 md:-mt-24 relative">
        <div className="rounded-[2rem] bg-white shadow-2xl shadow-brand-navy/15 p-8 md:p-12 text-center">
          <span className={`${kicker} text-teal-aa`}>{t.meta.siteTitle}</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mt-4">{w.tagline}</h1>
          <p className="text-lg text-slate-600 leading-relaxed mt-5 max-w-2xl mx-auto">{t.meta.home.description}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <a href={a.findProduct.href} className={btnPrimary}>{a.findProduct.label}<Arrow /></a>
            <a href={a.nutritionist.href} className="inline-flex items-center min-h-12 px-7 rounded-full border-2 border-brand-navy/20 hover:border-brand-navy font-semibold">{a.nutritionist.label}</a>
            <button type="button" onClick={() => setStory(true)} className="inline-flex items-center gap-2 min-h-12 px-4 font-semibold hover:text-brand-orange-aa cursor-pointer"><Play />{home.watchStory}</button>
          </div>
        </div>
      </div>
      <dl className="max-w-[1000px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 text-center">
        {STATS.map((s, i) => <div key={i}><dd className={`font-heading text-4xl md:text-5xl font-bold ${i % 2 ? "text-teal-aa" : "text-brand-orange-aa"}`}><Counter value={s.value} suffix={s.suffix} /></dd><dt className="text-sm font-semibold uppercase tracking-wider text-slate-aa mt-1">{home.stats[i]}</dt></div>)}
      </dl>
    </section>

    {/* Who we are: a switch between the two sides of the company, over the full profile */}
    <section aria-labelledby="du-who" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <span className={`${kicker} text-teal-aa`}>{w.kicker}</span>
          <h2 id="du-who" className="font-heading text-3xl md:text-5xl font-bold leading-tight mt-3">{w.title}</h2>
          <p className="text-lg text-slate-700 leading-relaxed mt-6">{w.intro}</p>
        </div>
        <div role="tablist" aria-label="Two sides of ChemLife" className="mx-auto mt-12 w-fit rounded-full bg-slate-100 p-1.5 flex">
          {(["nature", "science"] as const).map((s) => <button key={s} type="button" role="tab" aria-selected={side === s} onClick={() => setSide(s)}
            className={`min-h-11 px-6 rounded-full font-semibold cursor-pointer transition-colors ${side === s ? (s === "nature" ? "bg-emerald-800 text-white" : "bg-brand-navy text-white") : "text-brand-navy hover:bg-white"}`}>{s === "nature" ? "Nature" : "Science"}</button>)}
        </div>
        <div role="tabpanel" className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden">
            <Image key={side} src={side === "nature" ? Images.gallery.rotate21 : Images.process.developmentImage} alt={side === "nature" ? w.cards[1].alts[0] : home.howWeDo.steps[1].alt} fill sizes="(min-width: 1024px) 580px, 100vw" className="object-cover" />
          </div>
          <dl className={`rounded-[2rem] p-6 md:p-8 grid gap-4 content-start ${side === "nature" ? "bg-emerald-50" : "bg-slate-50"}`}>
            {(side === "nature" ? [0, 1, 8, 7, 9] : [2, 3, 4, 5, 6]).map((i) => <div key={w.facts[i].label}><dt className="text-sm font-bold text-teal-aa">{w.facts[i].label}</dt><dd className="mt-0.5 leading-relaxed">{w.facts[i].value}</dd></div>)}
          </dl>
        </div>
        <div className="grid lg:grid-cols-12 gap-10 mt-16 items-start">
          <div className="lg:col-span-5">
            <div className="relative aspect-[16/10] rounded-[2rem] overflow-hidden"><Image src={Images.people.foundersNew} alt={t.about.foundersAlt} fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" /></div>
            <p className="text-slate-700 leading-relaxed mt-4">{w.leadershipCaption}</p>
            <WhoButtons className="mt-6" />
          </div>
          <Questions className="lg:col-span-7" />
        </div>
      </div>
    </section>

    {/* What we serve: the farm side, in full colour */}
    <section aria-labelledby="du-serve" className="bg-emerald-950 text-white py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 id="du-serve" className={`${h2} text-white`}>{w.serveTitle}</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {w.cards.map((card, i) => <a key={card.title} href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className="group block">
            <div className="relative aspect-square rounded-full overflow-hidden ring-4 ring-white/10 group-hover:ring-teal-300/60 transition"><RotatingImages group={i} offset={i} sizes="(min-width: 768px) 360px, 100vw" /></div>
            <h3 className="font-heading text-2xl font-bold text-white mt-6 text-center">{card.title}</h3>
            <p className="text-white/85 mt-2 leading-relaxed text-center">{card.description}</p>
          </a>)}
        </div>
      </div>
    </section>

    {/* How we do it: the science side, step by step */}
    <section aria-labelledby="du-how" className="bg-brand-navy text-white py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <span className={`${kicker} text-teal-aa-light`}>{home.howWeDo.kicker}</span><h2 id="du-how" className={`${h2} text-white mt-3`}>{home.howWeDo.title}</h2>
        <ol className="grid md:grid-cols-2 gap-6 mt-10">
          {home.howWeDo.steps.map((s, i) => <Reveal key={s.title} delay={(i % 2) * 0.08}><li className="list-none grid grid-cols-[8rem_1fr] sm:grid-cols-[11rem_1fr] gap-5 rounded-[2rem] bg-white/5 p-4 items-center">
            <span className="relative aspect-square rounded-2xl overflow-hidden"><Image src={STEP_IMAGES[i]} alt={s.alt} fill sizes="176px" className="object-cover" /></span>
            <span><span className="text-orange-200 font-bold">{i + 1}</span><span className="block font-heading text-xl font-bold mt-1">{s.title}</span><span className="block text-white/85 text-sm leading-relaxed mt-2">{s.description}</span></span>
          </li></Reveal>)}
        </ol>
      </div>
    </section>

    {/* Proof, where the two meet */}
    <section aria-labelledby="du-proof" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 id="du-proof" className={`${h2} text-center`}>{home.awards.title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {home.awards.items.map((item, i) => <div key={item.title} className="rounded-[2rem] border border-slate-200 p-6 text-center">
            <div className="relative h-16"><Image src={AWARDS[i].logo} alt={AWARDS[i].organization} fill sizes="200px" className="object-contain" /></div>
            <h3 className="font-heading font-bold text-lg mt-4">{item.title}</h3><p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
          </div>)}
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mt-20">{home.testimonials.title}</h2>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {TESTIMONIALS.map((tm, i) => <figure key={tm.name} className={`rounded-[2rem] p-7 flex flex-col ${i === 1 ? "bg-emerald-50" : "bg-slate-50"}`}>
            <blockquote className="leading-relaxed flex-1">&ldquo;{tm.quote}&rdquo;</blockquote>
            <figcaption className="flex items-center gap-3 mt-6"><LogoDisc src={tm.logo} alt={`${tm.company} logo`} size={48} /><span><strong className="block">{tm.name}</strong><span className="text-sm text-slate-600">{tm.role}, {tm.company}</span></span></figcaption>
          </figure>)}
        </div>
        <p className="text-center font-heading text-xl font-bold mt-16">{home.partners.title}</p>
        <ul className="flex flex-wrap justify-center gap-x-10 gap-y-6 mt-8">{PARTNERS.map((p) => <li key={p.src} className="relative w-28 h-12"><Image src={p.src} alt={`${p.name} ${home.partners.logo}`} fill sizes="112px" className="object-contain" /></li>)}</ul>
      </div>
    </section>

    {/* People: two halves again */}
    <section aria-labelledby="du-life" className="grid md:grid-cols-2">
      <div ref={lifeRef} className="relative min-h-[520px] bg-brand-navy">
        <BackgroundVideo src={LIFE_VIDEOS[2].src} poster={LIFE_VIDEOS[2].poster} active={near} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 text-white"><h2 id="du-life" className="font-heading text-3xl font-bold text-white">{home.life.title}</h2>
          <ul className="mt-4 space-y-1.5 text-white/90">{home.life.points.map((p) => <li key={p}>{p}</li>)}</ul>
          <a href={a.careers.href} className="inline-flex items-center gap-2 mt-6 min-h-11 px-5 rounded-full bg-white text-brand-navy font-semibold">{a.careers.label}<Arrow /></a></div>
      </div>
      <div className="bg-emerald-50 p-8 md:p-12">
        <span className={`${kicker} text-teal-aa`}>{home.social.kicker}</span><h2 className="font-heading text-3xl font-bold mt-3">{home.social.journalTitle}</h2><p className="text-slate-700 mt-3">{home.social.introduction}</p>
        <ul className="mt-8 space-y-5">{home.social.items.map((item, i) => <li key={item.title} className="flex gap-4 items-center">
          <span className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0"><Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} fill sizes="96px" className="object-cover" /></span>
          <span><span className="block font-heading font-bold">{home.social.featureTitles[i]}</span><span className="block text-sm text-slate-700 mt-1">{item.desc}</span><span className="block text-sm font-semibold text-emerald-800 mt-1">{home.social.proofs[i]}</span></span>
        </li>)}</ul>
      </div>
    </section>

    <section className="py-20">
      <div className="max-w-[1000px] mx-auto px-6 text-center">
        <h2 className={h2}>{t.contact.titleStart} <span className="text-brand-orange-aa">{t.contact.titleAccent}</span> {t.contact.titleEnd}</h2>
        <p className="text-slate-600 text-lg mt-4 max-w-2xl mx-auto">{t.contact.intro}</p>
        <a href={a.nutritionist.href} className={`${btnPrimary} mt-8`}>{a.nutritionist.label}<Arrow /></a>
      </div>
    </section>
    <StoryPlayer open={story} onClose={() => setStory(false)} />
  </div>;
}
