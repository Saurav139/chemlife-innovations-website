"use client";

import { useEffect, useId, useRef, useState } from "react";
import InsightCardContent, { INSIGHT_CARD_CLASS, originalLink } from "@/components/InsightCard";
import NaturalInsightImage from "@/components/NaturalInsightImage";
import type { InsightItem } from "@/lib/insights";
import styles from "./preview.module.css";

const CHANNELS = ["All posts", "LinkedIn", "Instagram"] as const;
type Channel = typeof CHANNELS[number];
const channelOf = (post: InsightItem) => originalLink(post.linkUrl).short;

export default function SocialCardsPreview({ posts }: { posts: InsightItem[] }) {
  const [layout, setLayout] = useState<"natural" | "cropped">("natural");
  const [channel, setChannel] = useState<Channel>("All posts");
  const [limit, setLimit] = useState(12);
  const [active, setActive] = useState<InsightItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const filtered = posts
    .filter(post => channel === "All posts" || channelOf(post) === channel)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  useEffect(() => {
    if (!active || !dialog.current) return;
    const element = dialog.current;
    element.showModal();
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      element.close();
      document.documentElement.style.overflow = previous;
    };
  }, [active]);

  return <main id="main" tabIndex={-1} className={styles.page}>
    <div className={styles.wrap}>
      <header className={styles.intro}>
        <a className={styles.back} href="/previews">← Design previews</a>
        <p className={styles.eyebrow}>Insights · Design preview</p>
        <h1>The whole picture.</h1>
        <p className={styles.description}>Social posts in their original proportions. Each card grows with its image, keeping every headline, detail and edge in view.</p>
      </header>

      <div className={styles.controls}>
        <div role="group" aria-label="Filter by channel" className={styles.channels}>
          {CHANNELS.map(name => <button key={name} type="button" aria-pressed={channel === name} onClick={() => { setChannel(name); setLimit(12); }}>
            {name} <span>{name === "All posts" ? posts.length : posts.filter(post => channelOf(post) === name).length}</span>
          </button>)}
        </div>
        <div role="group" aria-label="Card image display" className={styles.layout}>
          <button type="button" aria-pressed={layout === "natural"} onClick={() => setLayout("natural")}>Full image</button>
          <button type="button" aria-pressed={layout === "cropped"} onClick={() => setLayout("cropped")}>Current crop</button>
        </div>
      </div>

      <div className={styles.caption}>
        <p role="status">{filtered.length} {filtered.length === 1 ? "post" : "posts"} · {layout === "natural" ? "Original image proportions" : "Fixed 16:9 image crop"}</p>
        <p>Preview only · The main Insights page is unchanged</p>
      </div>

      <section aria-label="Social post cards" className={styles.cards}>
        {filtered.slice(0, limit).map(post => <article key={`${post.linkUrl}:${post.title}`} aria-label={post.title} className={`${INSIGHT_CARD_CLASS} ${styles.card}`}>
          <InsightCardContent item={post} imageLayout={layout} centerTextWithoutImage onRead={setActive} onPlay={() => {}} />
        </article>)}
      </section>
      {filtered.length === 0 && <div className={styles.empty}>
        <h2>No {channel === "All posts" ? "social" : channel} posts to preview yet.</h2>
        <p>This preview uses posts already approved for Insights. Add posts from this channel in the dashboard to see them here.</p>
      </div>}
      {filtered.length > limit && <button className={styles.more} onClick={() => setLimit(count => count + 12)}>Show more posts ({filtered.length - limit})</button>}

      <dialog ref={dialog} className={styles.reader} aria-labelledby={titleId} onClose={() => setActive(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        {active && <>
          <div className={styles.readerBar}>
            <span>{channelOf(active)} · {active.date}</span>
            <button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Close post preview">Close ×</button>
          </div>
          <div className={styles.readerBody}>
            <h2 id={titleId}>{active.title}</h2>
            {active.imageUrl && <NaturalInsightImage src={active.imageUrl} alt={active.title} sizes="(min-width: 800px) 700px, calc(100vw - 80px)" />}
            <p>{active.content || active.description}</p>
            <a href={active.linkUrl} target="_blank" rel="noopener noreferrer">{originalLink(active.linkUrl).reader}</a>
          </div>
        </>}
      </dialog>
    </div>
  </main>;
}
