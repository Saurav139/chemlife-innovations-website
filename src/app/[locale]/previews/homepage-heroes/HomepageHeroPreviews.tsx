"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import WhoWeAre from "@/components/WhoWeAre";
import HowWeDo from "@/components/HowWeDo";
import AwardsRecognition from "@/components/AwardsRecognition";
import LifeAtChemLife from "@/components/LifeAtChemLife";
import ClientMarquee from "@/components/ClientMarquee";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import SocialResponsibilities from "@/components/SocialResponsibilities";
import ChatOverlay from "@/components/ChatOverlay";
import SiteSearch from "@/components/SiteSearch";
import { useT } from "@/i18n/LocaleProvider";
import { Images } from "@/lib/assets";
import { youtubeWatchUrl } from "@/lib/youtube";
import styles from "./heroes.module.css";
import SignatureHomepage from "./SignatureHomepage";

const designs = [
  { id: "split", label: "Open split", character: "Clear & balanced", note: "A white introduction beside a framed photograph. The message and image have their own space, with the next section close at hand." },
  { id: "split-tall", label: "Open split tall", character: "More room to breathe", note: "The same open layout with a taller hero, a wider photograph and more space above and below. Compare it directly with the original Open split." },
  { id: "centered", label: "Centered heading", character: "Open & composed", note: "A centered headline introduces a smaller photograph and a separate block of copy. A calm, open alternative to the split layout." },
  { id: "text-first", label: "Text first", character: "Message first", note: "A larger headline leads the page, with the copy and a smaller photograph beneath. More emphasis on the message, less on the image." },
  { id: "photo-story", label: "Photo story", character: "A closer look", note: "A light photograph frame with a thumbnail rail. Choose an image to bring the team, farms or innovation into focus." },
  { id: "science", label: "Science pathway", character: "An introduction to the process", note: "A photograph paired with ChemLife’s four process stages. The connection from research to delivery is visible from the start." },
  { id: "bubbles", label: "Brand bubbles", character: "Inspired by your reference", note: "Circular species photography, the coral shape from the ChemLife identity, a working product finder and illustrated science. A complete homepage concept inspired by the attached design." },
  { id: "field-journal", label: "Field journal", character: "Nature, in focus", note: "Warm paper, a photographic arch and a strong editorial headline. Choose a species to change the photograph and product selection, then follow the story from research to the field." },
  { id: "living-science", label: "Living science", character: "Biotechnology, made visible", note: "A calm green canvas, an animated ANBioT diagram and a research-led homepage. Product discovery, process stories and ChemLife’s values complete the page." },
] as const;
type Design = typeof designs[number]["id"];

const photos = [
  { src: Images.heroes.awardsLandscape, label: "Awards", alt: "ChemLife's founders accepting an award on stage" },
  { src: Images.heroes.chicken, label: "Poultry", alt: "Poultry farming" },
  { src: Images.heroes.dairy, label: "Dairy", alt: "Dairy farming" },
  { src: Images.heroes.slide76, label: "Animal nutrition", alt: "ChemLife animal nutrition" },
  { src: Images.heroes.slide87, label: "Innovation", alt: "ChemLife innovation" },
] as const;
type Photo = typeof photos[number];
const figures = ["30+", "16+", "22+", "7+"];

function PhotoFrame({ photo, primary = false }: { photo: Photo; primary?: boolean }) {
  return <figure className={styles.photo}>
    <div className={styles.image}>
      <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1280px) 560px, (min-width: 768px) 48vw, calc(100vw - 48px)" className={styles.photoImage} priority={primary} />
    </div>
    <figcaption>{photo.label === "Awards" ? "The people behind ChemLife Innovations" : photo.label}</figcaption>
  </figure>;
}

function HeroHeading() {
  return <>
    <p className={styles.kicker}>Innovations in bioactives</p>
    <h2>Nature Driven.<br /><span>Functional Feed Additives.</span></h2>
  </>;
}

function HeroDetails() {
  const t = useT().home;
  return <>
    <p className={styles.summary}>Novel accelerated bio-transformation technology delivering protected bio-actives en route to the site of absorption.</p>
    <div className={styles.actions}>
      <Link href="/products" className={styles.primary}>{t.findProduct}<span aria-hidden="true">↗</span></Link>
      <Link href="/contact?type=nutritionist" className={styles.secondary}>{t.talkToNutritionist}</Link>
    </div>
    <a className={styles.story} href={youtubeWatchUrl("-amOgNcjYNg")} target="_blank" rel="noopener noreferrer">
      <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m7 4 9 6-9 6z" /></svg>{t.watchStory}
    </a>
  </>;
}

function HeroCopy() {
  return <div className={styles.copy}><HeroHeading /><HeroDetails /></div>;
}

export default function HomepageHeroPreviews() {
  const [design, setDesign] = useState<Design>("split");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [rotating, setRotating] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const homepage = useRef<HTMLDivElement>(null);
  const t = useT().home;
  const selected = designs.find(option => option.id === design) ?? designs[0];
  const photo = photos[photoIndex];
  const signature = design === "bubbles" || design === "field-journal" || design === "living-science" ? design : null;

  useEffect(() => {
    const sync = () => {
      const hash = window.location.hash.slice(1);
      const previous: Record<string, Design> = { panel: "centered", editorial: "text-first", "image-first": "photo-story", mosaic: "science" };
      const target = previous[hash] ?? hash;
      if (designs.some(option => option.id === target)) setDesign(target as Design);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    if (!rotating || signature) return;
    const interval = setInterval(() => setPhotoIndex(index => (index + 1) % photos.length), 6000);
    return () => clearInterval(interval);
  }, [rotating, signature]);

  function select(index: number) {
    setDesign(designs[index].id);
    if (["bubbles", "field-journal", "living-science"].includes(designs[index].id)) setRotating(false);
    window.history.replaceState(null, "", `#${designs[index].id}`);
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? designs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + designs.length) % designs.length;
    select(next);
    tabs.current[next]?.focus();
  }

  return <>
    <main id="main" tabIndex={-1} className={styles.page}>
      <section className={styles.comparison} aria-labelledby="hero-preview-title">
        <div className={styles.wrap}>
          <Link href="/previews" className={styles.back}>← Design previews</Link>
          <div className={styles.intro}>
            <div><p className={styles.eyebrow}>Homepage · Six retained designs & three new concepts</p><h1 id="hero-preview-title">The ChemLife homepage studio.</h1></div>
            <a className={styles.jump} href="#homepage-preview" onClick={event => {
              event.preventDefault();
              homepage.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
              homepage.current?.focus({ preventScroll: true });
            }}>View homepage <span aria-hidden="true">↓</span></a>
          </div>
          <div className={styles.tabs} role="tablist" aria-label="Homepage hero designs">
            {designs.map((option, index) => <button key={option.id} ref={el => { tabs.current[index] = el; }} type="button" role="tab" id={`hero-design-${option.id}`} aria-controls="homepage-preview" aria-selected={design === option.id} tabIndex={design === option.id ? 0 : -1} onClick={() => select(index)} onKeyDown={event => onTabKey(event, index)}>
              <span aria-hidden="true">{String.fromCharCode(65 + index)}</span>{option.label}
            </button>)}
          </div>
          <div className={styles.note}><strong>{selected.character}</strong><p>{selected.note}</p></div>
          {signature ? <div className={styles.photoControls}><span>Complete homepage concept · Species choices connect to the product finder below</span></div> : <div className={styles.photoControls}>
            <div className={styles.photoField}><label htmlFor="hero-photo">Hero photo</label><select id="hero-photo" value={photoIndex} onChange={event => { setPhotoIndex(Number(event.target.value)); setRotating(false); }}>{photos.map((item, index) => <option key={item.src} value={index}>{item.label}</option>)}</select></div>
            <button type="button" aria-pressed={rotating} onClick={() => setRotating(value => !value)}>{rotating ? "Pause photo rotation" : "Rotate photos"}</button>
            <span>Same homepage below each design · Preview only</span>
          </div>}
        </div>
      </section>

      <div ref={homepage} id="homepage-preview" role="tabpanel" aria-labelledby={`hero-design-${design}`} tabIndex={0} className={styles.homepage}>
        {signature ? <SignatureHomepage key={signature} variant={signature} /> : <>
        <section className={`${styles.hero} ${styles[design]}`} aria-label={`${selected.label} homepage hero`}>
          <div className={`${styles.wrap} ${styles.heroInner}`}>
            {design === "centered" ? <>
              <div className={`${styles.copy} ${styles.centeredHeading}`}><HeroHeading /></div>
              <div className={styles.centeredBody}><PhotoFrame photo={photo} primary /><div className={styles.details}><HeroDetails /></div></div>
            </> : design === "text-first" ? <>
              <div className={`${styles.copy} ${styles.typeHeading}`}><HeroHeading /></div>
              <div className={styles.typeBody}><div className={styles.details}><HeroDetails /></div><PhotoFrame photo={photo} primary /></div>
            </> : design === "photo-story" ? <>
              <HeroCopy />
              <div className={styles.storyFrame}>
                <div className={styles.storyTop}><span>ChemLife in focus</span><span>{String(photoIndex + 1).padStart(2, "0")} / 05</span></div>
                <PhotoFrame photo={photo} primary />
                <div className={styles.thumbnails} role="group" aria-label="Choose the featured photograph">
                  {photos.map((item, index) => <button key={item.src} type="button" aria-label={`Show ${item.label.toLowerCase()} photo`} aria-pressed={photoIndex === index} onClick={() => { setPhotoIndex(index); setRotating(false); }}>
                    <Image src={item.src} alt="" fill sizes="100px" /><span>{item.label}</span>
                  </button>)}
                </div>
              </div>
            </> : design === "science" ? <>
              <HeroCopy />
              <div className={styles.scienceVisual}>
                <PhotoFrame photo={photo} primary />
                <div className={styles.pathway}>
                  <p>From research to delivery</p>
                  <ol>{t.howWeDo.steps.map((step, index) => <li key={step.title}><span aria-hidden="true">0{index + 1}</span><strong>{step.title}</strong></li>)}</ol>
                  <Link href="/research">Explore our research <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
            </> : <>
              <HeroCopy />
              <PhotoFrame photo={photo} primary />
            </>}
          </div>
        </section>
        <section className={styles.stats} aria-label="ChemLife at a glance">
          <dl className={styles.wrap}>{figures.map((value, index) => <div key={value}><dt>{t.stats[index]}</dt><dd>{value}</dd></div>)}</dl>
        </section>
        <WhoWeAre />
        <HowWeDo />
        <AwardsRecognition />
        <LifeAtChemLife />
        <ClientMarquee />
        <TestimonialCarousel />
        <SocialResponsibilities />
        </>}
      </div>
    </main>
    <ChatOverlay />
    <SiteSearch />
  </>;
}
