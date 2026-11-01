"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { PRODUCTS, productPath } from "@/lib/catalog";
import { useHref, useT } from "@/i18n/LocaleProvider";
import Icon, { type IconName } from "@/components/site/Icon";
import { Button, Reveal, Section, SectionTitle, easeOut } from "@/components/site/ui";

const CATEGORIES = ["Mono-gastric", "Ruminants", "Value Addition"] as const;
const ICONS: IconName[] = ["chick", "cow", "layers", "flask"];

export default function Solutions() {
  const t = useT();
  const s = t.site.solutions;
  const href = useHref();
  const [tab, setTab] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const category = CATEGORIES[tab];
  const items = PRODUCTS.map((p, i) => ({ ...p, ...t.products.items[i] })).filter((p) => p.category === category);
  const categoryName = t.products.categories[category];
  // The old homepage's description of each group, from its "What we serve" cards.
  const description = t.home.whoWeAre.cards[tab].description;

  return <Section labelledBy="solutions-title">
    <SectionTitle id="solutions-title" title={s.title} lead={s.lead} />
    <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {s.cards.map((card, i) => {
        const isTab = i < 3;
        const inner = <>
          <span className={`grid place-items-center w-14 h-14 rounded-2xl ${isTab && tab === i ? "bg-brand-orange-aa text-white" : "bg-ink/5 text-flame"} transition-colors`}><Icon name={ICONS[i]} className="w-7 h-7" /></span>
          <span className="flex items-center gap-2 font-heading text-lg font-bold text-ink mt-5">{card.title}<Icon name="arrowUpRight" className="w-4 h-4 text-copy-dim" /></span>
          <span className="block text-copy text-[15px] leading-relaxed mt-2">{card.text}</span>
          {isTab && <span className="block text-xs font-semibold text-copy-dim mt-4">{PRODUCTS.filter((p) => p.category === CATEGORIES[i]).length} {s.products}</span>}
        </>;
        const cls = `block h-full w-full text-left rounded-2xl border p-6 transition-colors cursor-pointer ${isTab && tab === i ? "border-flame/60 bg-card-hi" : "border-line bg-card/70 hover:border-flame/40"}`;
        return <Reveal as="li" key={card.title} delay={i * 0.06}>
          {isTab
            ? <button type="button" className={cls} aria-pressed={tab === i} aria-controls="solutions-panel" onClick={() => { setTab(i); tabs.current[i]?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }}>{inner}</button>
            : <a className={cls} href={href("/research")}>{inner}</a>}
        </Reveal>;
      })}
    </ul>

    <div className="mt-14 md:mt-20">
      <div role="tablist" aria-label={s.title.replace(/\*/g, "")} className="flex gap-6 md:gap-10 border-b border-line overflow-x-auto">
        {CATEGORIES.map((c, i) => <button key={c} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab" id={`solutions-tab-${i}`} aria-selected={tab === i} aria-controls="solutions-panel"
          onClick={() => setTab(i)} className={`relative whitespace-nowrap pb-4 font-heading text-lg md:text-xl font-semibold transition-colors cursor-pointer ${tab === i ? "text-flame" : "text-copy hover:text-ink"}`}>
          {s.cards[i].title}
          {tab === i && <motion.span layoutId="solutions-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-orange-aa" />}
        </button>)}
      </div>
      <div id="solutions-panel" role="tabpanel" aria-labelledby={`solutions-tab-${tab}`} className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div key={category} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: easeOut }}
            className="grid lg:grid-cols-[1fr_22rem] gap-6">
            <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {items.map((item) => <li key={item.id}>
                <a href={href(productPath(item.name))} className="group flex items-center gap-4 h-full rounded-2xl border border-line bg-card/60 p-4 hover:border-flame/40 hover:bg-card-hi/70 transition-colors">
                  <span className="relative w-12 h-12 rounded-full bg-white shrink-0 overflow-hidden"><Image src={item.icon} alt="" fill sizes="48px" className="object-contain p-1" /></span>
                  <span className="min-w-0">
                    <span className="block font-bold text-ink group-hover:text-flame transition-colors">{item.name}</span>
                    <span className="block text-sm text-copy leading-snug line-clamp-2">{item.tagline}</span>
                  </span>
                </a>
              </li>)}
            </ul>
            <div className="rounded-2xl border border-line bg-gradient-to-br from-card-hi to-page-alt p-7 flex flex-col">
              <p className="font-heading text-6xl font-bold text-ink">{items.length}</p>
              <p className="font-heading text-xl font-bold text-flame">{categoryName}</p>
              <p className="text-copy leading-relaxed mt-4">{description}</p>
              <Button href={href(`/products?category=${encodeURIComponent(category)}`)} className="mt-8 lg:mt-auto self-stretch text-center" arrow>{s.browse.replace("{category}", categoryName)}</Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  </Section>;
}
