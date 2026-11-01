"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { PRODUCTS, productPath } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";
import { Accented, Button, IconBadge, Reveal } from "@/components/site/ui";
import type { IconName } from "@/components/site/Icon";

const ICONS: IconName[] = ["shield", "mineral", "capsule", "leaf"];
const product = (name: string) => PRODUCTS.find((p) => p.name === name)!;

/** A product chip floating over the pictures. */
function Chip({ name, label, className, y }: { name: string; label: string; className: string; y: ReturnType<typeof useTransform<number, number>> | number }) {
  const href = useHref();
  const p = product(name);
  return <motion.a href={href(productPath(name))} style={{ y }} className={`absolute z-10 flex items-center gap-3 rounded-2xl border border-line bg-card/90 backdrop-blur-md py-2.5 pl-2.5 pr-4 shadow-2xl shadow-ink/10 hover:border-flame/50 transition-colors ${className}`}>
    <span className="relative w-10 h-10 rounded-full bg-white shrink-0 overflow-hidden"><Image src={p.icon} alt="" fill sizes="40px" className="object-contain p-1" /></span>
    <span className="text-left">
      <span className="block font-bold text-ink text-sm leading-tight">{name}</span>
      <span className="block text-xs text-copy leading-snug">{label}</span>
    </span>
  </motion.a>;
}

export default function FeatureSplit() {
  const t = useT();
  const f = t.site.feature;
  const href = useHref();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const up = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40]);
  const down = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-30, 30]);
  const tagline = (name: string) => t.products.items[PRODUCTS.indexOf(product(name))].tagline;

  return <section aria-labelledby="feature-title" className="bg-page py-20 md:py-28 overflow-hidden">
    <div className="container-site grid lg:grid-cols-2 gap-14 lg:gap-16 items-center">
      <div>
        <Reveal>
          <h2 id="feature-title" className="font-heading text-[2rem] leading-[1.12] sm:text-4xl md:text-5xl font-bold tracking-tight text-ink"><Accented text={f.title} /></h2>
          <p className="text-copy text-lg mt-5 leading-relaxed">{f.lead}</p>
        </Reveal>
        <ul className="mt-10 space-y-6">
          {f.items.map((item, i) => <Reveal as="li" key={item.title} delay={i * 0.06} className="flex gap-4">
            <IconBadge name={ICONS[i]} tone={i % 2 ? "mint" : "flame"} />
            <div>
              <h3 className="font-heading text-lg font-bold text-ink">{item.title}</h3>
              <p className="text-copy mt-1 leading-relaxed">{item.text}</p>
            </div>
          </Reveal>)}
        </ul>
        <Reveal delay={0.2} className="mt-10"><Button href={href("/products")} arrow>{f.cta}</Button></Reveal>
      </div>

      <div ref={ref} className="relative h-[460px] sm:h-[520px]">
        <motion.div style={{ y: down }} className="absolute right-0 top-4 w-[82%] aspect-[4/3] rounded-3xl overflow-hidden border border-line shadow-2xl shadow-ink/10">
          <Image src={product("MinBioZen").banner!} alt="MinBioZen trace minerals for dairy and poultry" fill sizes="(min-width: 1024px) 480px, 82vw" className="object-cover" />
        </motion.div>
        <motion.div style={{ y: up }} className="absolute left-0 bottom-6 w-[58%] aspect-[4/3] rounded-3xl overflow-hidden border-4 border-page shadow-2xl shadow-ink/10">
          <Image src={product("MaxDmold").banner!} alt="MaxDmold protecting feed grain from mould" fill sizes="(min-width: 1024px) 340px, 58vw" className="object-cover" />
        </motion.div>
        <Chip name="MethioWiz" label={tagline("MethioWiz")} className="left-[4%] top-0 max-w-[16rem]" y={up} />
        <Chip name="FeedGenie Prime" label={tagline("FeedGenie Prime")} className="right-[2%] bottom-0 max-w-[15rem]" y={down} />
      </div>
    </div>
  </section>;
}
