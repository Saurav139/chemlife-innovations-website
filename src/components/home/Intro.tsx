"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Images } from "@/lib/assets";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { Accented, ArrowLink, Kicker, Marquee, Reveal, accentSecond } from "@/components/site/ui";

// Three photos for each species group, in the order of home.whoWeAre.cards (their alt texts are there too).
const CARD_IMAGES = [
  [Images.gallery.rotate11, Images.gallery.rotate12, Images.gallery.rotate13],
  [Images.gallery.rotate21, Images.gallery.rotate22, Images.gallery.rotate23],
  [Images.research.pellets, Images.gallery.rotate32, Images.gallery.rotate33],
];
// The products page filter for each group.
const CATEGORIES = ["Mono-gastric", "Ruminants", "Value Addition"];
const NUMERALS = ["I", "II", "III"];

/** The running line of taglines under the hero. */
export function TaglineRibbon() {
  const taglines = useT().home.taglines;
  return <div className="theme-dark bg-page py-6 md:py-8 border-y border-line">
    <Marquee items={taglines.map((lines, i) => <span key={i} className="font-display text-3xl md:text-5xl text-ink whitespace-nowrap">
      {lines[0]} <em className="italic text-flame">{lines[1]}</em> {lines[2]}
    </span>)} />
  </div>;
}

export default function Intro() {
  const t = useT().home.whoWeAre;
  const products = useT().products;
  const href = useHref();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section aria-labelledby="who-title" className="paper relative bg-page py-20 md:py-28 lg:py-36">
      <div className="container-site">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal><Kicker index="01">{t.kicker}</Kicker></Reveal>
              <Reveal delay={0.05}>
                <h2 id="who-title" className="font-display text-[2.6rem] leading-[1] sm:text-6xl xl:text-7xl tracking-[-0.025em] text-ink mt-8"><Accented text={accentSecond(t.tagline)} /></h2>
                <p className="label-mono text-copy-dim mt-8 max-w-md leading-relaxed">{t.title}</p>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="text-ink text-xl md:text-[1.55rem] leading-[1.6] first-letter:font-display first-letter:text-[4.6rem] first-letter:leading-[0.8] first-letter:float-left first-letter:mr-3 first-letter:mt-2 first-letter:text-flame">{t.intro}</p>
            </Reveal>

            {/* The facts, as a register */}
            <dl className="mt-14 grid sm:grid-cols-2 border-t border-line">
              {t.facts.map((fact, i) => (
                <Reveal key={fact.label} delay={(i % 2) * 0.06} className={`border-b border-line py-6 ${i % 2 ? "sm:pl-6 sm:border-l" : "sm:pr-6"} ${i === t.facts.length - 1 && t.facts.length % 2 ? "sm:col-span-2 sm:pl-0 sm:border-l-0" : ""}`}>
                  <dt className="label-mono text-flame flex gap-3"><span className="text-copy-dim">{String(i + 1).padStart(2, "0")}</span>{fact.label}</dt>
                  <dd className="text-ink leading-relaxed mt-2.5">{fact.value}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>

        {/* What we serve */}
        <div className="mt-24 md:mt-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
            <h3 className="font-display text-4xl md:text-5xl text-ink tracking-tight"><Accented text={`*${t.serveTitle}*`} /></h3>
            <ArrowLink href={href("/products")}>{products.allProducts}</ArrowLink>
          </Reveal>
          <ul className="grid md:grid-cols-3 gap-x-8 gap-y-14 mt-12">
            {t.cards.map((card, i) => {
              const shown = (tick + i) % 3;
              return <Reveal as="li" key={card.title} delay={i * 0.08} className="group">
                <a href={href(`/products?category=${encodeURIComponent(CATEGORIES[i])}`)} className="block">
                  <div className={`relative aspect-[4/5] overflow-hidden bg-card-hi ${i === 1 ? "rounded-[2rem] md:mt-16" : "rounded-t-full"}`}>
                    {CARD_IMAGES[i].map((src, j) => (
                      <Image key={src} src={src} alt={card.alts[j]} fill sizes="(min-width: 768px) 30vw, 100vw" aria-hidden={j !== shown}
                        className={`object-cover transition-[opacity,transform] duration-[1200ms] group-hover:scale-[1.04] motion-reduce:transition-none ${j === shown ? "opacity-100" : "opacity-0"}`} />
                    ))}
                    <span className="absolute top-5 left-1/2 -translate-x-1/2 font-display italic text-2xl text-white drop-shadow">{NUMERALS[i]}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4 mt-6">
                    <h4 className="font-display text-3xl text-ink group-hover:text-flame transition-colors">{card.title}</h4>
                    <span aria-hidden="true" className="grid place-items-center w-11 h-11 rounded-full border border-line text-ink shrink-0 group-hover:bg-ink group-hover:text-page transition-colors">→</span>
                  </div>
                  <p className="text-copy leading-relaxed mt-3">{card.description}</p>
                </a>
              </Reveal>;
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
