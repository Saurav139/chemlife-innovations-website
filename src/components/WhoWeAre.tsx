"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Images } from "@/lib/assets";
import { PRODUCTS, slugify } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";
import type { Messages } from "@/i18n/messages/en";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Each card's title, description and photo descriptions are in the language file (home.whoWeAre.cards), in this order.
export const cardImages = [
  [Images.gallery.rotate11, Images.gallery.rotate12, Images.gallery.rotate13],
  [Images.gallery.rotate21, Images.gallery.rotate22, Images.gallery.rotate23],
  [Images.research.pellets, Images.gallery.rotate32, Images.gallery.rotate33],
];

export type Card = Messages["home"]["whoWeAre"]["cards"][number] & { images: { src: string; alt: string }[] };

// The products page's category for each "What we serve" card, in the cards' order.
const SERVE_CATEGORIES = ["Mono-gastric", "Ruminants", "Value Addition"];

/** A card's photo, cross-fading through its three pictures; the cards change a little out of step. Still for visitors
 *  who prefer less motion. */
function FadingPhoto({ images, offset, priority, className = "" }: { images: Card["images"]; offset: number; priority?: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduce) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => { timer = setInterval(() => setIndex((i) => i + 1), 4500); }, offset * 1500);
    return () => { clearTimeout(start); clearInterval(timer); };
  }, [offset, reduce]);
  const image = images[index % images.length];
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      <AnimatePresence initial={false}>
        <motion.div key={image.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: easeOut }}>
          <Image src={image.src} alt={image.alt} fill priority={priority && index === 0} sizes="(min-width: 1024px) 370px, (min-width: 768px) 33vw, 128px" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Fades and rises into view once, as it scrolls in (still for visitors who prefer less motion). */
function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export default function WhoWeAre() {
  const messages = useT();
  const t = messages.home.whoWeAre;
  const foundersAlt = messages.about.foundersAlt;
  const href = useHref();
  const cards: Card[] = t.cards.map((card, i) => ({
    ...card,
    images: cardImages[i].map((src, j) => ({ src, alt: card.alts[j] })),
  }));


  return (
    <section aria-labelledby="who-we-are-title" className="bg-white py-20 md:py-32 overflow-hidden border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-3">
            {t.homeKicker}
          </span>
          <h2 id="who-we-are-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy">
            {t.homeTitle}
          </h2>
        </div>

        {/* Who we are: the introduction beside the founders' photo, with a link to the full Who We Are page. */}
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <Reveal className="lg:col-span-6">
            {/* What ChemLife is, in a line, under the heading. */}
            <p className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug text-brand-orange-aa mt-4">{t.title}</p>
            <p className="text-lg text-slate-700 leading-relaxed mt-6">{t.homeIntro}</p>
            {/* The facts and questions that used to be here, in full on their own page. */}
            <a href={href("/who-we-are")} data-analytics-click={t.moreAboutUs} className="inline-flex items-center gap-2 min-h-12 px-6 mt-8 rounded-full bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold transition-colors">
              {t.moreAboutUs}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-6">
            {/* The photo is wider than the frame: positioned 42% across (not centred) to trim 5% more off its right side. */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
              <Image src={Images.people.foundersNew} alt={foundersAlt} fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover object-[42%_50%]" />
            </div>
          </Reveal>
        </div>

        {/* What we serve: the three animal groups, each a photo card linking to its products. */}
        <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy text-center mt-16 md:mt-24">
          {t.serveTitle}
        </h3>
        {/* Phones: compact rows, a small photo beside the text. Tablets up: three photo cards. */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
          {cards.map((card, i) => {
            const category = SERVE_CATEGORIES[i];
            const count = PRODUCTS.filter((product) => product.category === category).length;
            return (
              <Reveal key={card.title} delay={i * 0.08} className="h-full">
                <a href={`${href("/products")}?category=${slugify(category)}`} data-analytics-click={card.title}
                  className="group flex h-full flex-row md:flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
                  <FadingPhoto images={card.images} offset={i} className="w-28 shrink-0 self-stretch md:w-auto md:self-auto md:aspect-[4/3]" />
                  <div className="flex flex-1 flex-col p-4 md:p-6">
                    <h4 className="font-heading text-lg md:text-xl font-bold text-brand-navy group-hover:text-brand-orange-aa transition-colors">{card.title}</h4>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed mt-1 md:mt-2 flex-1">{card.description}</p>
                    <span className="inline-flex items-center gap-2 min-h-11 mt-1 md:mt-3 text-sm md:text-base font-semibold text-teal-aa">
                      {t.serveLink.replace("{count}", String(count))}
                      <svg aria-hidden="true" className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5" /></svg>
                    </span>
                  </div>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>

    </section>
  );
}
