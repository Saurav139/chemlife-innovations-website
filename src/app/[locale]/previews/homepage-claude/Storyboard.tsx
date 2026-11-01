"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, VideoPosters } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import BackgroundVideo, { useNearViewport } from "@/components/BackgroundVideo";
import { AWARDS, Arrow, Counter, LIFE_VIDEOS, PARTNERS, Play, Reveal, RotatingImages, SERVE_CATEGORIES, SOCIAL_IMAGES, STATS, STEP_IMAGES, StoryPlayer, TESTIMONIALS,
  btnPrimary, h2, kicker, useActions } from "../homepage-five/kit";
import { LogoDisc, Questions, WhoButtons } from "./data";

const tag = "inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-navy";

/** C: Storyboard. A front page of stories: one lead, the rest as cards of different sizes, Who We Are as the lead article. */
export default function Storyboard() {
  const t = useT();
  const home = t.home;
  const w = home.whoWeAre;
  const href = useHref();
  const a = useActions();
  const [story, setStory] = useState(false);
  const [lifeRef, near] = useNearViewport<HTMLDivElement>();

  return <div className="bg-[#f6f7f9] text-brand-navy">
    {/* Front page: the lead story with three smaller ones beside it */}
    <section className="pt-28 md:pt-36 pb-12">
      <div className="max-w-[1240px] mx-auto px-5">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <h1 className="font-heading text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl">{w.tagline}</h1>
          <p className="text-slate-600 max-w-sm">{t.meta.home.description}</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          <button type="button" onClick={() => setStory(true)} className="group relative lg:col-span-2 lg:row-span-3 min-h-[420px] rounded-[2rem] overflow-hidden text-left cursor-pointer">
            <Image src={Images.heroes.awardsLandscape} alt={home.heroAlt} fill priority sizes="(min-width: 1024px) 800px, 100vw" className="object-cover object-[70%_40%] group-hover:scale-[1.03] transition-transform duration-700" />
            <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className="absolute left-6 right-6 bottom-6 md:left-8 md:bottom-8 text-white">
              <span className={tag}>{t.nav.about}</span>
              <span className="block font-heading text-3xl md:text-4xl font-bold mt-3">{home.taglines[0].join(" ")}</span>
              <span className="inline-flex items-center gap-3 mt-4 font-semibold"><span className="grid place-items-center w-11 h-11 rounded-full bg-brand-orange-aa"><Play /></span>{home.watchStory}</span>
            </span>
          </button>
          {[1, 2, 3].map((n, i) => <a key={n} href={[href("/research"), href("/products?q=Ruminants"), href("/research")][i]} className="group flex gap-4 rounded-[1.5rem] bg-white p-3 hover:shadow-lg transition-shadow">
            <span className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0"><Image src={[Images.research.anbiot, Images.heroes.slide76, Images.research.greenTechnology][i]} alt="" fill sizes="112px" className="object-cover group-hover:scale-105 transition-transform duration-500" /></span>
            <span className="self-center"><span className="text-xs font-bold uppercase tracking-wider text-teal-aa">{[t.nav.research, t.nav.products, t.nav.research][i]}</span>
              <span className="block font-heading text-lg font-bold leading-snug mt-1 group-hover:text-brand-orange-aa transition-colors">{home.taglines[[2, 1, 4][i]].join(" ")}</span></span>
          </a>)}
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-5">
          {STATS.map((s, i) => <div key={i} className="rounded-[1.5rem] bg-white p-6"><dd className="font-heading text-4xl font-bold"><Counter value={s.value} suffix={s.suffix} /></dd><dt className="text-sm text-slate-600 mt-1">{home.stats[i]}</dt></div>)}
        </dl>
        <div className="flex flex-wrap gap-3 mt-6">
          <a href={a.findProduct.href} className={btnPrimary}>{a.findProduct.label}<Arrow /></a>
          <a href={a.nutritionist.href} className="inline-flex items-center min-h-12 px-7 rounded-full bg-white font-semibold hover:bg-slate-100">{a.nutritionist.label}</a>
        </div>
      </div>
    </section>

    {/* Who we are, as the lead article: a long read with the facts in a sidebar */}
    <section aria-labelledby="sb-who" className="py-16 md:py-24">
      <div className="max-w-[1240px] mx-auto px-5">
        <article className="rounded-[2rem] bg-white p-6 md:p-12 lg:p-16">
          <span className={`${kicker} text-teal-aa`}>{w.kicker}</span>
          <h2 id="sb-who" className="font-heading text-3xl md:text-5xl font-bold leading-tight mt-3 max-w-4xl">{w.title}</h2>
          <div className="relative aspect-[21/9] rounded-[1.5rem] overflow-hidden mt-10"><Image src={Images.people.foundersNew} alt={t.about.foundersAlt} fill sizes="(min-width: 1240px) 1100px, 100vw" className="object-cover" /></div>
          <div className="grid lg:grid-cols-12 gap-10 mt-10">
            <div className="lg:col-span-7">
              <p className="text-xl md:text-2xl leading-relaxed first-letter:float-left first-letter:font-heading first-letter:font-bold first-letter:text-6xl first-letter:leading-[0.85] first-letter:mr-3 first-letter:mt-1 first-letter:text-brand-orange-aa">{w.intro}</p>
              <blockquote className="my-10 border-l-4 border-brand-orange pl-6 font-heading text-2xl md:text-3xl font-bold">{w.tagline}</blockquote>
              <p className="text-lg text-slate-700 leading-relaxed">{w.leadershipCaption}</p>
              <h3 className="font-heading text-2xl font-bold mt-12 mb-2">Your questions</h3>
              <Questions />
              <WhoButtons className="mt-10" />
            </div>
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-28 rounded-[1.5rem] bg-[#f6f7f9] p-6 md:p-8">
                <p className="font-heading text-xl font-bold">At a glance</p>
                <dl className="mt-4 divide-y divide-slate-200">
                  {w.facts.map((f) => <div key={f.label} className="py-3"><dt className="text-sm font-bold text-teal-aa">{f.label}</dt><dd className="mt-0.5 text-[15px] leading-relaxed">{f.value}</dd></div>)}
                </dl>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </section>

    {/* What we serve: three photo stories */}
    <section aria-labelledby="sb-serve" className="pb-16 md:pb-24">
      <div className="max-w-[1240px] mx-auto px-5">
        <h2 id="sb-serve" className={h2}>{w.serveTitle}</h2>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {w.cards.map((card, i) => <a key={card.title} href={href(`/products?q=${encodeURIComponent(SERVE_CATEGORIES[i])}`)} className={`group rounded-[2rem] bg-white overflow-hidden flex flex-col ${i === 1 ? "md:-mt-0" : ""}`}>
            <div className="relative aspect-[4/3]"><RotatingImages group={i} offset={i} sizes="(min-width: 768px) 400px, 100vw" /><span className={`${tag} absolute left-4 top-4`}>{t.nav.products}</span></div>
            <div className="p-6 flex-1"><h3 className="font-heading text-2xl font-bold group-hover:text-brand-orange-aa transition-colors">{card.title}</h3><p className="text-slate-600 mt-2 leading-relaxed">{card.description}</p></div>
          </a>)}
        </div>
      </div>
    </section>

    {/* How we do it: a photo essay in four frames */}
    <section aria-labelledby="sb-how" className="bg-white py-16 md:py-24">
      <div className="max-w-[1240px] mx-auto px-5">
        <span className={`${kicker} text-teal-aa`}>{home.howWeDo.kicker}</span>
        <h2 id="sb-how" className={`${h2} mt-3`}>{home.howWeDo.title}</h2>
        <div className="grid md:grid-cols-6 gap-5 mt-10">
          {home.howWeDo.steps.map((s, i) => <Reveal key={s.title} delay={i * 0.06} className={[`md:col-span-4`, `md:col-span-2`, `md:col-span-2`, `md:col-span-4`][i]}>
            <figure className="rounded-[2rem] overflow-hidden bg-[#f6f7f9] h-full flex flex-col">
              <div className={`relative ${i === 0 || i === 3 ? "aspect-[16/9]" : "aspect-[4/3]"}`}><Image src={STEP_IMAGES[i]} alt={s.alt} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" /></div>
              <figcaption className="p-6"><span className="text-sm font-bold text-brand-orange-aa">{i + 1} of 4</span><h3 className="font-heading text-xl font-bold mt-1">{s.title}</h3><p className="text-slate-600 mt-2 leading-relaxed">{s.description}</p></figcaption>
            </figure>
          </Reveal>)}
        </div>
      </div>
    </section>

    {/* Voices and recognition, as a grid of cards */}
    <section aria-labelledby="sb-voices" className="py-16 md:py-24">
      <div className="max-w-[1240px] mx-auto px-5">
        <h2 id="sb-voices" className={h2}>{home.testimonials.title}</h2>
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {TESTIMONIALS.map((tm, i) => <figure key={tm.name} className={`rounded-[2rem] p-7 flex flex-col ${i === 0 ? "bg-brand-navy text-white" : "bg-white"}`}>
            <span className="font-heading text-6xl leading-none text-brand-orange" aria-hidden="true">&ldquo;</span>
            <blockquote className="leading-relaxed flex-1 -mt-4">{tm.quote}</blockquote>
            <figcaption className="flex items-center gap-3 mt-6"><LogoDisc src={tm.logo} alt={`${tm.company} logo`} size={48} /><span><strong className="block">{tm.name}</strong><span className={`text-sm ${i === 0 ? "text-white/80" : "text-slate-600"}`}>{tm.role}, {tm.company}</span></span></figcaption>
          </figure>)}
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold mt-16">{home.awards.title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          {home.awards.items.map((item, i) => <article key={item.title} className="rounded-[2rem] bg-white p-6">
            <div className="relative h-14"><Image src={AWARDS[i].logo} alt={AWARDS[i].organization} fill sizes="180px" className="object-contain object-left" /></div>
            <h3 className="font-heading font-bold text-lg mt-4">{item.title}</h3><p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.description}</p>
          </article>)}
        </div>
        <div className="rounded-[2rem] bg-white p-6 md:p-8 mt-5">
          <p className="font-heading text-lg font-bold">{home.partners.title}</p>
          <ul className="flex flex-wrap items-center gap-x-10 gap-y-5 mt-5">{PARTNERS.map((p) => <li key={p.src} className="relative w-24 h-10"><Image src={p.src} alt={`${p.name} ${home.partners.logo}`} fill sizes="96px" className="object-contain" /></li>)}</ul>
        </div>
      </div>
    </section>

    {/* People: the team's video story and the three commitment stories */}
    <section aria-labelledby="sb-life" className="pb-20">
      <div className="max-w-[1240px] mx-auto px-5 grid lg:grid-cols-4 gap-5">
        <div ref={lifeRef} className="lg:col-span-2 lg:row-span-2 relative rounded-[2rem] overflow-hidden min-h-[460px] bg-brand-navy">
          <BackgroundVideo src={LIFE_VIDEOS[2].src} poster={LIFE_VIDEOS[2].poster} active={near} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white"><span className={tag}>{t.nav.careers}</span><h2 id="sb-life" className="font-heading text-3xl font-bold text-white mt-3">{home.life.title}</h2>
            <p className="text-white/90 mt-2">{home.life.points.join(". ")}.</p>
            <a href={a.careers.href} className="inline-flex items-center gap-2 mt-5 min-h-11 px-5 rounded-full bg-white text-brand-navy font-semibold">{a.careers.label}<Arrow /></a></div>
        </div>
        <div className="lg:col-span-2 rounded-[2rem] bg-white p-7"><span className={`${kicker} text-teal-aa`}>{home.social.kicker}</span><h2 className="font-heading text-3xl font-bold mt-3">{home.social.journalTitle}</h2><p className="text-slate-600 mt-3">{home.social.introduction}</p></div>
        {home.social.items.slice(0, 2).map((item, i) => <article key={item.title} className="rounded-[2rem] bg-white overflow-hidden">
          <div className="relative aspect-[16/10]"><Image src={SOCIAL_IMAGES[i]} alt={home.social.imageAlts[i]} fill sizes="300px" className="object-cover" /></div>
          <div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-teal-aa">{home.social.categories[i]}</p><h3 className="font-heading font-bold mt-1">{home.social.featureTitles[i]}</h3><p className="text-sm text-slate-600 mt-1">{item.desc}</p></div>
        </article>)}
        <article className="lg:col-span-4 rounded-[2rem] bg-white overflow-hidden grid md:grid-cols-2">
          <div className="relative aspect-[16/9] md:aspect-auto"><Image src={SOCIAL_IMAGES[2]} alt={home.social.imageAlts[2]} fill sizes="600px" className="object-cover" /></div>
          <div className="p-7"><p className="text-xs font-bold uppercase tracking-wider text-teal-aa">{home.social.categories[2]}</p><h3 className="font-heading text-2xl font-bold mt-1">{home.social.featureTitles[2]}</h3><p className="text-slate-600 mt-2">{home.social.items[2].desc}</p><p className="font-semibold mt-3">{home.social.proofs.join(" · ")}</p></div>
        </article>
      </div>
      <div className="max-w-[1240px] mx-auto px-5 mt-5">
        <div className="rounded-[2rem] bg-brand-orange-aa text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white">{t.contact.titleStart} {t.contact.titleAccent} {t.contact.titleEnd}</h2>
          <a href={a.nutritionist.href} className="inline-flex items-center gap-2 min-h-12 px-7 rounded-full bg-white text-brand-orange-aa font-semibold shrink-0">{a.nutritionist.label}<Arrow /></a>
        </div>
      </div>
    </section>
    <StoryPlayer open={story} onClose={() => setStory(false)} />
  </div>;
}
