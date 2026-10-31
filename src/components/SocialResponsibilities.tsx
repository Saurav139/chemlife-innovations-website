"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Images, Videos, VideoPosters } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import styles from "./SocialResponsibilities.module.css";

const media = [
  { id: "students", image: VideoPosters.social1 },
  { id: "workplace", image: Images.social.image2 },
  { id: "welfare", image: Images.social.image3 },
] as const;

function JournalMedia({ index, alt, watchLabel }: { index: number; alt: string; watchLabel: string }) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (playing) video.current?.focus(); }, [playing]);
  return <div className={styles.media} data-kind={media[index].id}>
    {playing && index === 0 ? <video ref={video} src={Videos.social1} poster={media[0].image} controls autoPlay muted playsInline aria-label={alt} tabIndex={0} /> : <>
      <Image src={media[index].image} alt={alt} fill sizes="(min-width: 1200px) 650px, (min-width: 768px) 56vw, 100vw" />
      {index === 0 && <button type="button" className={styles.play} onClick={() => setPlaying(true)}>
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m7 4 9 6-9 6z" /></svg>{watchLabel}
      </button>}
    </>}
  </div>;
}

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

  return <section id={id} className={styles.journal} aria-labelledby={`${scope}-section-title`}>
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>{t.kicker}</span>
        <h2 id={`${scope}-section-title`}>{t.journalTitle}</h2>
        <p>{t.introduction}</p>
      </div>
      <article ref={feature} id={featureId} className={styles.feature} data-featured-story={media[active].id} aria-labelledby={titleId}>
        <JournalMedia key={media[active].id} index={active} alt={t.imageAlts[active]} watchLabel={t.watchVideo} />
        <div key={`${media[active].id}-copy`} className={styles.featureCopy}>
          <span className={styles.category}>{t.categories[active]}</span>
          <h3 ref={heading} id={titleId} tabIndex={-1}>{t.featureTitles[active]}</h3>
          <p>{t.items[active].desc}</p>
          <span className={styles.proof}>{t.proofs[active]}</span>
        </div>
      </article>
      <ul className={styles.support} aria-label={t.moreStories}>
        {media.map((item, index) => index !== active && <li key={item.id}>
          <button type="button" className={styles.storyButton} aria-controls={featureId}
            aria-label={`${t.viewStory}: ${t.items[index].title}`} aria-describedby={`${scope}-${item.id}-summary`} onClick={() => select(index)}>
            <span className={styles.thumbnail} data-kind={item.id}><Image src={item.image} alt="" fill sizes="120px" /></span>
            <span className={styles.supportCopy}>
              <span className={styles.category}>{t.categories[index]}</span>
              <span className={styles.supportTitle}>{t.items[index].title}</span>
              <span id={`${scope}-${item.id}-summary`} className={styles.summary}>{t.items[index].desc}</span>
              <span className={styles.viewStory}>{t.viewStory}<span aria-hidden="true">↗</span></span>
            </span>
          </button>
        </li>)}
      </ul>
    </div>
  </section>;
}
