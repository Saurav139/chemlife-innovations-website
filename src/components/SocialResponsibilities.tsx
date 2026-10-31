"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Images, Videos, VideoPosters } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

const media = [
  { id: "students", image: VideoPosters.social1 },
  { id: "workplace", image: Images.social.image2 },
  { id: "welfare", image: Images.social.image3 },
] as const;

// The workplace photo shows certificates, so it is shown whole rather than cropped.
const fit = (id: string) => (id === "workplace" ? "object-contain" : "object-cover");

function JournalMedia({ index, alt, watchLabel }: { index: number; alt: string; watchLabel: string }) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (playing) video.current?.focus(); }, [playing]);
  return <div className="relative aspect-[4/3] overflow-hidden bg-surface animate-[fade-in_0.4s_ease-out] motion-reduce:animate-none">
    {playing && index === 0 ? <video ref={video} src={Videos.social1} poster={media[0].image} controls autoPlay muted playsInline aria-label={alt} tabIndex={0} className="absolute inset-0 w-full h-full object-cover bg-deep" /> : <>
      <Image src={media[index].image} alt={alt} fill sizes="(min-width: 1200px) 460px, (min-width: 1024px) 38vw, 100vw" className={fit(media[index].id)} />
      {index === 0 && <button type="button" className="btn btn-paper absolute left-3 bottom-3 min-h-11 px-4 text-small" onClick={() => setPlaying(true)}>
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-5 h-5"><path d="m7 4 9 6-9 6z" /></svg>{watchLabel}
      </button>}
    </>}
  </div>;
}

/** One featured story with its picture in the left column and its text on the axis; the other two wait below,
 *  each a button that brings it up. */
export default function SocialResponsibilities({ id = "social-responsibility" }: { id?: string }) {
  const t = useT().home.social;
  const [active, setActive] = useState(0);
  const feature = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const selectedByVisitor = useRef(false);
  const scope = useId();
  const featureId = `${scope}-story`;
  const titleId = `${scope}-title`;

  useEffect(() => {
    if (!selectedByVisitor.current) return;
    selectedByVisitor.current = false;
    // The chosen story takes focus on both touch and keyboard, clear of the fixed header.
    heading.current?.focus({ preventScroll: true });
    feature.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [active]);

  function select(index: number) {
    selectedByVisitor.current = true;
    setActive(index);
  }

  return <section id={id} className="section-y bg-white scroll-mt-18 md:scroll-mt-20 lg:scroll-mt-24" aria-labelledby={`${scope}-section-title`}>
    <div className="frame">
      <SectionHead id={`${scope}-section-title`} title={t.journalTitle} lead={t.introduction} />
      <Reveal order={2}>
        <article ref={feature} id={featureId} data-featured-story={media[active].id} aria-labelledby={titleId} className="grid lg:grid-cols-12 gap-x-8 gap-y-8 scroll-mt-24 lg:scroll-mt-32">
          <div className="lg:col-span-5">
            <JournalMedia key={media[active].id} index={active} alt={t.imageAlts[active]} watchLabel={t.watchVideo} />
          </div>
          <div key={`${media[active].id}-copy`} className="lg:col-start-6 lg:col-span-7 animate-[fade-in_0.4s_ease-out] motion-reduce:animate-none">
            <h3 ref={heading} id={titleId} tabIndex={-1} className="text-title focus:outline-none">{t.featureTitles[active]}</h3>
            <p className="text-small text-ink-soft mt-3">{t.categories[active]}</p>
            <p className="mt-5 max-w-[60ch]">{t.items[active].desc}</p>
            <p className="mt-4 font-semibold">{t.proofs[active]}</p>
          </div>
        </article>
      </Reveal>
      <div className="grid lg:grid-cols-12 gap-x-8 mt-12 md:mt-16">
        <ul className="lg:col-start-6 lg:col-span-7 grid sm:grid-cols-2 gap-3" aria-label={t.moreStories}>
          {media.map((item, index) => index !== active && <li key={item.id}>
            <button type="button" aria-controls={featureId} aria-label={`${t.viewStory}: ${t.items[index].title}`} aria-describedby={`${scope}-${item.id}-summary`} onClick={() => select(index)}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 w-full h-full p-3 bg-surface hover:bg-[#dfe6ef] text-left transition-colors cursor-pointer active:scale-[0.99]">
              <span className="relative block aspect-square overflow-hidden bg-white"><Image src={item.image} alt="" fill sizes="88px" className={fit(item.id)} /></span>
              <span className="flex min-w-0 flex-col items-start">
                <span className="text-small text-ink-soft">{t.categories[index]}</span>
                <span className="font-bold mt-1">{t.items[index].title}</span>
                <span id={`${scope}-${item.id}-summary`} className="text-small mt-1">{t.items[index].desc}</span>
                <span className="text-small font-semibold mt-auto pt-2">{t.viewStory} <span aria-hidden="true">↗</span></span>
              </span>
            </button>
          </li>)}
        </ul>
      </div>
    </div>
  </section>;
}
