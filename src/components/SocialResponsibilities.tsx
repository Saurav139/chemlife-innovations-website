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

function StoryPhoto({ index, alt, watchLabel }: { index: number; alt: string; watchLabel: string }) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (playing) video.current?.focus(); }, [playing]);
  return <div className={styles.photo} data-kind={media[index].id}>
    {playing && index === 0 ? <video ref={video} src={Videos.social1} poster={media[0].image} controls autoPlay muted playsInline aria-label={alt} tabIndex={0} /> : <>
      <Image src={media[index].image} alt={alt} fill sizes="(min-width: 1000px) 380px, (min-width: 640px) 33vw, 100vw" />
      {index === 0 && <button type="button" className={styles.play} onClick={() => setPlaying(true)}>
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m7 4 9 6-9 6z" /></svg>{watchLabel}
      </button>}
    </>}
  </div>;
}

/** Social responsibility as a photo series: three real photographs, each with its full story beneath. */
export default function SocialResponsibilities({ id = "social-responsibility" }: { id?: string }) {
  const t = useT().home.social;
  const scope = useId();
  return <section id={id} className={styles.journal} aria-labelledby={`${scope}-title`}>
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <span className={styles.eyebrow}>{t.kicker}</span>
        <h2 id={`${scope}-title`}>{t.journalTitle}</h2>
        <p>{t.introduction}</p>
      </div>
      <div className={styles.storyGrid}>
        {media.map((item, index) => <article key={item.id} aria-labelledby={`${scope}-${item.id}`}>
          <StoryPhoto index={index} alt={t.imageAlts[index]} watchLabel={t.watchVideo} />
          <div className={styles.storyText}>
            <span className={styles.category}><span aria-hidden="true">0{index + 1}</span>{t.categories[index]}</span>
            <h3 id={`${scope}-${item.id}`}>{t.featureTitles[index]}</h3>
            <p>{t.items[index].desc}</p>
            <span className={styles.proof}>{t.proofs[index]}</span>
          </div>
        </article>)}
      </div>
    </div>
  </section>;
}
