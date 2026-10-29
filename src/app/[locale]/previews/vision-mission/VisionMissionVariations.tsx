"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Images } from "@/lib/assets";
import styles from "./variations.module.css";

const options = [
  { id: "columns", label: "Open columns", note: "A lighter approach: open space, clear headings and a fine divider. The content sits naturally between the Journey and Leadership sections.", type: "Light & minimal" },
  { id: "panel", label: "Shared blue panel", note: "A single blue panel brings the two statements together and creates a stronger visual pause between the surrounding light sections.", type: "Bold & unified" },
  { id: "rows", label: "Editorial rows", note: "Two horizontal rows give each statement a clear reading path, with the heading on the left and its statement on the right.", type: "Structured & compact" },
  { id: "split", label: "Blue & white split", note: "Vision takes the blue half; Mission sits on white. One shared frame gives the statements equal importance with a clear change in tone.", type: "Balanced contrast" },
  { id: "path", label: "Connected path", note: "A fine vertical line connects Vision to Mission, making the section read as a direction followed by the commitment behind it.", type: "Connected & purposeful" },
  { id: "photo", label: "Photo-led", note: "Research imagery sits alongside both statements, bringing a human, practical context to the section while keeping the text on a clear white background.", type: "Visual & grounded" },
] as const;
type Variant = (typeof options)[number]["id"];
type Statement = { title: string; text: string };

function PurposeIcon({ mission }: { mission: boolean }) {
  return <svg aria-hidden="true" width="30" height="30" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {mission ? <><circle cx="16" cy="16" r="11" /><circle cx="16" cy="16" r="6" /><path d="M16 16 29 3m-7 0h7v7" /></> : <><path d="M2 16s5-9 14-9 14 9 14 9-5 9-14 9S2 16 2 16Z" /><circle cx="16" cy="16" r="4" /><path d="M16 2v2m0 24v2" /></>}
  </svg>;
}

export default function VisionMissionVariations({ statements }: { statements: Statement[] }) {
  const [variant, setVariant] = useState<Variant>("columns");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const sync = () => {
      const value = window.location.hash.slice(1);
      if (options.some((option) => option.id === value)) setVariant(value as Variant);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const select = (id: Variant) => {
    setVariant(id);
    window.history.replaceState(null, "", `#${id}`);
  };
  const selected = options.find((option) => option.id === variant)!;

  return <main id="main" className={styles.page}>
    <div className={`${styles.wrap} ${styles.intro}`}>
      <Link className={styles.back} href="/previews">← Design previews</Link>
      <span className={styles.kicker}>About ChemLife / Design variations</span>
      <h1>Vision &amp; Mission</h1>
      <p>Six ways to present the same statements, using the About page’s colours and typography.</p>
      <div className={styles.tabs} role="tablist" aria-label="Vision and Mission designs">
        {options.map((option, index) => <button key={option.id} ref={(el) => { tabs.current[index] = el; }}
          type="button" role="tab" id={`tab-${option.id}`} aria-selected={variant === option.id} aria-controls="design-preview"
          tabIndex={variant === option.id ? 0 : -1} onClick={() => select(option.id)}
          onKeyDown={(event) => {
            const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
            if (!direction && event.key !== "Home" && event.key !== "End") return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (index + direction + options.length) % options.length;
            select(options[next].id); tabs.current[next]?.focus();
          }}>
          <span className={styles.tabLetter} aria-hidden="true">{String.fromCharCode(65 + index)}</span><span className={styles.tabText}>{option.label}</span>
        </button>)}
      </div>
      <div className={styles.caption}><strong>{selected.type}</strong><p>{selected.note}</p></div>
    </div>

    <div className={styles.stage}>
      <div className={`${styles.wrap} ${styles.context}`} aria-hidden="true"><span>Our Journey</span><span>Previous section ↑</span></div>
      <div id="design-preview" role="tabpanel" aria-labelledby={`tab-${variant}`} tabIndex={0} className={styles.preview}>
        {variant === "columns" && <section className={styles.columns} aria-label="Vision and Mission, open columns">
          <div className={styles.wrap}>
            <div className={styles.columnGrid}>{statements.map((statement, i) => <article key={statement.title}>
              <div className={styles.columnTitle}><span className={styles.icon}><PurposeIcon mission={i === 1} /></span><h2>{statement.title}</h2></div>
              <p>{statement.text}</p>
            </article>)}</div>
          </div>
        </section>}
        {variant === "panel" && <section className={styles.panelSection} aria-label="Vision and Mission, shared blue panel">
          <div className={styles.wrap}><div className={styles.bluePanel}>
            <span className={styles.panelKicker}>Our purpose</span>
            <div className={styles.panelGrid}>{statements.map((statement, i) => <article key={statement.title}>
              <span className={styles.panelIcon}><PurposeIcon mission={i === 1} /></span>
              <h2>{statement.title}</h2><p>{statement.text}</p>
            </article>)}</div>
          </div></div>
        </section>}
        {variant === "rows" && <section className={styles.rowsSection} aria-label="Vision and Mission, editorial rows">
          <div className={styles.wrap}><div className={styles.rows}>{statements.map((statement, i) => <article key={statement.title}>
            <div className={styles.rowTitle}><span aria-hidden="true">0{i + 1}</span><h2>{statement.title}</h2></div><p>{statement.text}</p>
          </article>)}</div></div>
        </section>}
        {variant === "split" && <section className={styles.splitSection} aria-label="Vision and Mission, blue and white split">
          <div className={styles.wrap}><div className={styles.splitFrame}>
            {statements.map((statement, i) => <article key={statement.title}>
              <span className={styles.splitIcon}><PurposeIcon mission={i === 1} /></span>
              <h2>{statement.title}</h2><p>{statement.text}</p>
            </article>)}
          </div></div>
        </section>}
        {variant === "path" && <section className={styles.pathSection} aria-label="Vision and Mission, connected path">
          <div className={`${styles.wrap} ${styles.pathLayout}`}>
            <div className={styles.pathIntro}><span className={styles.kicker}>Our purpose</span><h2>Direction.<br />Commitment.<br /><span>Progress.</span></h2><div className={styles.pathAccent} aria-hidden="true" /></div>
            <div className={styles.pathStatements}>{statements.map((statement, i) => <article key={statement.title}>
              <span className={styles.pathNode} aria-hidden="true">0{i + 1}</span>
              <div><h2>{statement.title}</h2><p>{statement.text}</p></div>
            </article>)}</div>
          </div>
        </section>}
        {variant === "photo" && <section className={styles.photoSection} aria-label="Vision and Mission, photo-led">
          <div className={styles.wrap}><div className={styles.photoLayout}>
            <figure className={styles.purposePhoto}>
              <Image src={Images.research.researchImage} alt="Laboratory workspace with research equipment and people at work" fill sizes="(min-width: 900px) 420px, calc(100vw - 48px)" className={styles.photoImage} />
              <figcaption><span>Research &amp; development</span><strong>Built on science.<br />Driven by purpose.</strong></figcaption>
            </figure>
            <div className={styles.photoStatements}>{statements.map((statement, i) => <article key={statement.title}>
              <div className={styles.photoTitle}><span aria-hidden="true">0{i + 1}</span><h2>{statement.title}</h2></div><p>{statement.text}</p>
            </article>)}</div>
          </div></div>
        </section>}
      </div>
      <div className={`${styles.wrap} ${styles.context}`} aria-hidden="true"><span>Leadership team</span><span>Next section ↓</span></div>
    </div>
    <div className={`${styles.wrap} ${styles.endNote}`}><p>Compare the designs above, or view the current section in context.</p><Link href="/about#vision-mission">Current About page →</Link></div>
  </main>;
}
