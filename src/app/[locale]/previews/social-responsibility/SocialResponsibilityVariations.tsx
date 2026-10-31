"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Images, Videos, VideoPosters } from "@/lib/assets";
import SocialResponsibilities from "@/components/SocialResponsibilities";
import styles from "./variations.module.css";

const designs = [
  { id: "stories", label: "Photo stories", type: "Clear & familiar", note: "Three real photographs with the full story beneath each. Easy to scan and the closest fit with the existing homepage." },
  { id: "blue", label: "Blue feature", type: "Confident & compact", note: "A blue introduction paired with three concise stories on white. A stronger visual finish to the homepage." },
  { id: "journal", label: "Community journal", type: "Human & editorial", note: "A featured story with two selectable cards below. Choose either card to bring that initiative into focus." },
  { id: "focus", label: "Explore the work", type: "Focused & interactive", note: "Choose an initiative to see its photograph and story in a shared frame. No automatic rotation; visitors set the pace." },
  { id: "pillars", label: "Open commitments", type: "Light & understated", note: "Three illustrated commitments with open spacing and fine dividers. A compact option without photography or moving backgrounds." },
] as const;
type Design = typeof designs[number]["id"];

const initiatives = [
  { id: "students", category: "Community", title: "Empowering students", description: "Supporting access to education through bicycle donations to students from families below the poverty line.", proof: "Bicycle donations", image: VideoPosters.social1, alt: "Students riding donated bicycles in a school courtyard" },
  { id: "workplace", category: "Our people", title: "Dignity at work", description: "Certified under the Prevention of Sexual Harassment at the Workplace (POSH) framework.", proof: "POSH certification", image: Images.social.image2, alt: "ChemLife team members holding certificates at a workplace programme" },
  { id: "welfare", category: "Animal welfare", title: "Care beyond nutrition", description: "Supporting the feeding of two cows for one full year.", proof: "Two cows. One full year.", image: Images.social.image3, alt: "Cows resting and feeding at the animal welfare shelter" },
] as const;
type Initiative = typeof initiatives[number];
const introduction = "Our work extends beyond animal nutrition, through support for students, dignity in the workplace and care for animals.";

function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number, count: number, select: (index: number) => void) {
  const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
  if (!step && event.key !== "Home" && event.key !== "End") return;
  event.preventDefault();
  select(event.key === "Home" ? 0 : event.key === "End" ? count - 1 : (index + step + count) % count);
}

function CommitmentIcon({ kind }: { kind: Initiative["id"] }) {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === "students" ? <>
      <circle cx="11" cy="33" r="8" /><circle cx="37" cy="33" r="8" />
      <path d="m11 33 9-18 9 18H11l15-13h7l4 13M17 15h8m7-6h5l-4 11" />
    </> : kind === "workplace" ? <>
      <path d="M24 4 41 11v12c0 10-8 17-17 21C15 40 7 33 7 23V11L24 4Z" />
      <path d="m16 24 6 6 11-13" />
    </> : <>
      <path d="M12 14 6 7c-2 7 0 10 6 12m24-5 6-7c2 7 0 10-6 12M15 16c-9-5-12 0-10 5l9 3m19-8c9-5 12 0 10 5l-9 3" />
      <path d="M14 14c5-5 15-5 20 0l-2 18H16l-2-18Z" /><rect x="14" y="29" width="20" height="12" rx="6" />
      <path d="M20 21h.1M28 21h.1M20 35h.1M28 35h.1" strokeWidth="3" />
    </>}
  </svg>;
}

function InitiativePhoto({ item, playable = false }: { item: Initiative; playable?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (playing) video.current?.focus(); }, [playing]);
  return <div className={styles.photo} data-kind={item.id}>
    {playing && item.id === "students" ? <video ref={video} src={Videos.social1} poster={item.image} controls autoPlay muted playsInline aria-label="Bicycle donation community video" tabIndex={0} /> : <>
      <Image src={item.image} alt={item.alt} fill sizes="(min-width: 1000px) 700px, (min-width: 640px) 50vw, 100vw" />
      {playable && item.id === "students" && <button type="button" className={styles.play} onClick={() => setPlaying(true)}>
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m7 4 9 6-9 6z" /></svg>
        Watch bicycle donation video
      </button>}
    </>}
  </div>;
}

function SectionIntro({ title = "Social responsibilities", dark = false }: { title?: string; dark?: boolean }) {
  return <div className={`${styles.sectionIntro} ${dark ? styles.onBlue : ""}`}>
    <span className={styles.eyebrow}>Our commitment</span>
    <h2>{title}</h2>
    <p>{introduction}</p>
  </div>;
}

function ExploreWork() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const item = initiatives[active];
  return <section className={`${styles.section} ${styles.explore}`} aria-label="Social responsibilities, explore the work">
    <div className={styles.wrap}>
      <SectionIntro />
      <div className={styles.initiativeTabs} role="tablist" aria-label="Choose an initiative">
        {initiatives.map((initiative, index) => <button key={initiative.id} type="button" role="tab" ref={el => { tabs.current[index] = el; }}
          id={`initiative-${initiative.id}`} aria-controls="initiative-story" aria-selected={index === active} tabIndex={index === active ? 0 : -1}
          onClick={() => setActive(index)} onKeyDown={event => onTabKey(event, index, initiatives.length, next => { setActive(next); tabs.current[next]?.focus(); })}>
          <span aria-hidden="true">0{index + 1}</span>{initiative.category}
        </button>)}
      </div>
      <div className={styles.exploreFrame} role="tabpanel" id="initiative-story" aria-labelledby={`initiative-${item.id}`} tabIndex={0}>
        <InitiativePhoto key={item.id} item={item} playable />
        <div className={styles.exploreCopy}>
          <span className={styles.largeIcon}><CommitmentIcon kind={item.id} /></span>
          <span className={styles.whiteEyebrow}>{item.category}</span>
          <h3>{item.title}</h3><p>{item.description}</p>
          <div className={styles.lightProof}><span aria-hidden="true" />{item.proof}</div>
          <span className={styles.storyCount}>0{active + 1} <span>/ 03 initiatives</span></span>
        </div>
      </div>
    </div>
  </section>;
}

export default function SocialResponsibilityVariations() {
  const [design, setDesign] = useState<Design>("stories");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const sync = () => {
      const value = window.location.hash.slice(1);
      const found = designs.find(option => option.id === value);
      if (found) setDesign(found.id);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  function select(index: number) {
    setDesign(designs[index].id);
    window.history.replaceState(null, "", `#${designs[index].id}`);
  }
  const selected = designs.find(option => option.id === design)!;
  return <main id="main" tabIndex={-1} className={styles.page}>
    <div className={`${styles.wrap} ${styles.intro}`}>
      <Link href="/previews" className={styles.back}>← Design previews</Link>
      <span className={styles.eyebrow}>Homepage / Design variations</span>
      <h1>Social responsibility</h1>
      <p>Five directions for the same three commitments. Original ChemLife photography, readable stories and the brand guide’s blue, orange and typography.</p>
      <div className={styles.designTabs} role="tablist" aria-label="Social responsibility designs">
        {designs.map((option, index) => <button key={option.id} type="button" role="tab" ref={el => { tabs.current[index] = el; }}
          id={`design-${option.id}`} aria-controls="section-preview" aria-selected={option.id === design} tabIndex={option.id === design ? 0 : -1}
          onClick={() => select(index)} onKeyDown={event => onTabKey(event, index, designs.length, next => { select(next); tabs.current[next]?.focus(); })}>
          <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>{option.label}
        </button>)}
      </div>
      <div className={styles.caption}><strong>{selected.type}</strong><p>{selected.note}</p></div>
    </div>
    <div className={styles.context}><div className={styles.wrap}><span>Homepage placement</span><span>After testimonials · Before the footer</span></div></div>
    <div role="tabpanel" id="section-preview" aria-labelledby={`design-${design}`} tabIndex={0}>
      {design === "stories" && <section className={`${styles.section} ${styles.stories}`} aria-label="Social responsibilities, photo stories">
        <div className={styles.wrap}>
          <SectionIntro />
          <div className={styles.storyGrid}>{initiatives.map((item, index) => <article key={item.id}>
            <InitiativePhoto item={item} playable />
            <div className={styles.storyText}><span className={styles.category}><span aria-hidden="true">0{index + 1}</span>{item.category}</span>
              <h3>{item.title}</h3><p>{item.description}</p><span className={styles.proof}>{item.proof}</span>
            </div>
          </article>)}</div>
        </div>
      </section>}
      {design === "blue" && <section className={`${styles.section} ${styles.blue}`} aria-label="Social responsibilities, blue feature">
        <div className={`${styles.wrap} ${styles.blueLayout}`}>
          <div className={styles.blueIntro}><SectionIntro title="Responsibility, put into practice." dark /><span className={styles.blueClosing}>Community. People. Animal welfare.</span></div>
          <div className={styles.blueStories}>{initiatives.map(item => <article key={item.id}>
            <InitiativePhoto item={item} />
            <div><span className={styles.category}>{item.category}</span><h3>{item.title}</h3><p>{item.description}</p><span className={styles.proof}>{item.proof}</span></div>
          </article>)}</div>
        </div>
      </section>}
      {design === "journal" && <SocialResponsibilities id="social-responsibility-preview" />}
      {design === "focus" && <ExploreWork />}
      {design === "pillars" && <section className={`${styles.section} ${styles.pillars}`} aria-label="Social responsibilities, open commitments">
        <div className={styles.wrap}>
          <div className={styles.pillarIntro}><SectionIntro title="Care is part of how we work." /><p>Social responsibility at ChemLife takes shape in three areas: our community, our people and the animals around us.</p></div>
          <div className={styles.pillarGrid}>{initiatives.map(item => <article key={item.id}>
            <span className={styles.pillarIcon}><CommitmentIcon kind={item.id} /></span><span className={styles.category}>{item.category}</span><h3>{item.title}</h3><p>{item.description}</p><span className={styles.proof}>{item.proof}</span>
          </article>)}</div>
        </div>
      </section>}
    </div>
    <div className={`${styles.wrap} ${styles.endNote}`}><p>Each option uses the same existing initiatives. Choose a direction to refine for the homepage.</p><Link href="/#social-responsibility">View current section →</Link></div>
  </main>;
}
