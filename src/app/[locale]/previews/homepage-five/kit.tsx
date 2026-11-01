"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Images, Videos, VideoPosters } from "@/lib/assets";
import { PRODUCTS, productPath } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";

// What the five homepage designs share: the staging homepage's content (from the language file and the same lists
// the live sections use) and a few small pieces. Each design only changes how it's laid out.

export const easeOut = [0.25, 0.1, 0, 1] as const;

// The hero counters; their labels are home.stats.
export const STATS = [{ value: 30, suffix: "+" }, { value: 16, suffix: "+" }, { value: 22, suffix: "+" }, { value: 7, suffix: "+" }];

// Titles and descriptions are in home.awards.items, in this order.
export const AWARDS = [
  { logo: Images.awards.ccamp, organization: "C-CAMP", year: "2020-21" },
  { logo: Images.awards.animalHusbandry, organization: "Dept. of Animal Husbandry, Dairying & Fisheries", year: "2019" },
  { logo: Images.awards.birac, organization: "BIRAC", year: "2021" },
  { logo: Images.awards.naarm, organization: "a-IDEA, ICAR-NAARM", year: "2020" },
];

// Quotes stay in the words our partners wrote them, in English.
export const TESTIMONIALS = [
  { quote: "Specifically with the help of Chemlife Innovations using their proprietary multi-layer microencapsulation technology, we have introduced a novel functionalized feed ingredient for dairy. We are happy with the quality of the product and happy with service support provided by them.",
    name: "Akmal Reyaz", role: "Business Head – Dairy & Aqua", company: "Huvepharma", logo: Images.testimonials.huve },
  { quote: "Chemlife is our Technology partner and Product developer in the field of mold inhibition and toxin management using innovative technology for animal health. We are highly satisfied with the quality of Chemlife's Products and Technologies.",
    name: "Dr Manjunatha B P", role: "Chief Executive Officer", company: "GROEXL Vet", logo: Images.testimonials.groxel },
  { quote: "We have been able to launch PromoGen (Natural Growth promoter for poultry) and SlimEat (Lean meat inducer for swine) for export market and Bio-trace minerals for poultry for domestic market specifically with the support of Chemlife Innovations using their ANBioT technology.",
    name: "Lakshmikanth Yadav", role: "Managing Director", company: "Quadragen VetHealth", logo: Images.testimonials.quadragen },
];

/** Every partner logo once, with its alt text. */
export const PARTNERS = [...new Set([...Images.partnerLogos.frontRow, ...Images.partnerLogos.backRow])]
  .map((file) => ({ src: Images.partnerLogos.path(file), name: Images.partnerLogos.names[file] ?? "Partner" }));

export const STEP_IMAGES = [Images.process.researchImage, Images.process.developmentImage, Images.process.manufacturingImage, Images.process.delivery];
// Three photos for each species group, in the order of home.whoWeAre.cards.
export const SERVE_IMAGES = [
  [Images.gallery.rotate11, Images.gallery.rotate12, Images.gallery.rotate13],
  [Images.gallery.rotate21, Images.gallery.rotate22, Images.gallery.rotate23],
  [Images.research.pellets, Images.gallery.rotate32, Images.gallery.rotate33],
];
export const SERVE_CATEGORIES = ["Mono-gastric", "Ruminants", "Value Addition"];
export const SOCIAL_IMAGES = [VideoPosters.social1, Images.social.image2, Images.social.image3];
export const LIFE_VIDEOS = [
  { src: Videos.trip1, poster: VideoPosters.trip1 },
  { src: Videos.trip2, poster: VideoPosters.trip2 },
  { src: Videos.trip3, poster: VideoPosters.trip3 },
];
export const STORY_VIDEO_ID = "-amOgNcjYNg";

/** Every product with its translated text and page link. */
export function useProducts() {
  const t = useT().products;
  const href = useHref();
  return PRODUCTS.map((p, i) => ({ ...p, ...t.items[i], href: href(productPath(p.name)), categoryName: t.categories[p.category as keyof typeof t.categories] }));
}

/** The flagship ranges named in Who We Are. */
export const FLAGSHIPS = ["MaxDmold", "FeedGenie Prime", "MinBioZen", "MethioWiz", "CholiWiz", "MaxDmold Plus"];

/** The homepage's four calls to action, in order. */
export function useActions() {
  const t = useT();
  const href = useHref();
  const w = t.home.whoWeAre;
  return {
    findProduct: { label: t.home.findProduct, href: href("/products") },
    nutritionist: { label: t.home.talkToNutritionist, href: href("/contact?type=nutritionist") },
    research: { label: w.seeResearch, href: href("/research") },
    leadership: { label: w.meetLeadership, href: href("/about") },
    dossier: { label: w.requestDossier, href: href("/contact?type=dossier") },
    careers: { label: t.home.life.joinUs, href: href("/careers") },
  };
}

/** Counts up the first time it's on screen; the server renders the final number. */
export function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  useEffect(() => {
    if (!inView || reduce) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1500);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduce, value]);
  return <span ref={ref} className="tabular-nums">{shown}{suffix}</span>;
}

/** Fades up into place the first time it's on screen. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: 0, y: reduce ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "0px 0px -8% 0px" }} transition={{ duration: 0.6, delay, ease: easeOut }}>{children}</motion.div>;
}

/** Index of the slide to show, moving on every `ms`. */
export function useRotate(count: number, ms = 5000) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ms);
    return () => clearInterval(timer);
  }, [count, ms]);
  return [index, setIndex] as const;
}

/** The YouTube story video in a pop-up player. */
export function StoryPlayer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT().home;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return <div role="dialog" aria-modal="true" aria-label={t.storyVideo} onClick={onClose} className="fixed inset-0 z-[60] flex overflow-y-auto bg-black/90 p-4">
    <div className="m-auto w-full flex flex-col gap-3" style={{ width: "min(100%, 64rem, calc((100dvh - 8rem) * 16 / 9))" }} onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={onClose} autoFocus aria-label={t.closeVideo} className="self-end w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl cursor-pointer">×</button>
      <div className="aspect-video bg-black rounded-2xl overflow-hidden">
        <iframe src={`https://www.youtube-nocookie.com/embed/${STORY_VIDEO_ID}?autoplay=1&rel=0`} title="ChemLife Innovations story" allowFullScreen className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; compute-pressure; encrypted-media; gyroscope; picture-in-picture; web-share" />
      </div>
    </div>
  </div>;
}

export const btnPrimary = "inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors";
export const btnOutline = "inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-full border-2 border-brand-navy/20 hover:border-brand-navy text-brand-navy font-semibold transition-colors";
export const btnLight = "inline-flex items-center justify-center gap-2 min-h-12 px-7 rounded-full border-2 border-white/60 hover:bg-white hover:text-brand-navy text-white font-semibold transition-colors";
export const kicker = "text-sm font-semibold tracking-widest uppercase";
export const h2 = "font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight";

export function Arrow({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>;
}

export function Play({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>;
}

export function Check({ className = "w-5 h-5" }: { className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
}
