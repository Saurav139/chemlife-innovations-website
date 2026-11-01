"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Images } from "@/lib/assets";
import { Closing, PINNED, easeOut, useWhoWeAre } from "./shared";

// Each stop sits at a fraction of the way along the path; its words come from the Who We Are copy.
const STOPS = [
  { at: 0.02, title: "Nature", text: "Ayurvedic plant wisdom and natural inputs are where every product starts.", image: Images.heroes.about, alt: "A seedling growing in a laboratory flask", icon: "leaf" },
  { at: 0.2, title: "ANBioT lab", text: "Accelerated Natural Bio Transformation turns natural inputs into functional feed additives.", image: Images.research.researchImage, alt: "ChemLife's research laboratory", icon: "flask" },
  { at: 0.39, title: "Doddaballapura plant", text: "Made in Bengaluru Rural District, Karnataka, with FAMI-QS feed-additive quality and safety certification.", image: Images.process.manufacturingImage, alt: "Machinery at the Doddaballapura plant", icon: "factory" },
  { at: 0.58, title: "Storage and silo", text: "MaxDmold and FeedGenie Prime guard feed against mould and mycotoxins, so quality holds in the silo.", image: Images.products.banners.maxdmold, alt: "Feed grain shielded from mould", icon: "silo" },
  { at: 0.78, title: "Transport", text: "Warehouses and varied transport networks deliver directly or through distributors.", image: Images.process.delivery, alt: "A feed warehouse and delivery trucks", icon: "truck" },
  { at: 0.98, title: "The farm", text: "Performance holds on the farm, for poultry, dairy cattle and swine.", image: Images.gallery.rotate11, alt: "Broiler chickens on a poultry farm", icon: "barn" },
] as const;

const PATH = "M40 250 C 140 250 140 110 240 110 S 340 250 440 250 S 540 110 640 110 S 740 250 840 250 S 940 110 960 110";

function Icon({ name }: { name: (typeof STOPS)[number]["icon"] }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "leaf": return <path {...common} d="M-11 10 C-11 -7 2 -12 12 -12 C12 1 5 11 -11 10 Z M-11 10 L4 -4" />;
    case "flask": return <path {...common} d="M-5 -12 H5 M-3 -12 V-3 L-11 10 H11 L3 -3 V-12 M-7 4 H7" />;
    case "factory": return <path {...common} d="M-12 11 V-1 L-5 3 V-1 L2 3 V-11 H8 V11 Z" />;
    case "silo": return <path {...common} d="M-8 11 V-4 A8 8 0 0 1 8 -4 V11 Z M-8 0 H8 M-8 5 H8" />;
    case "truck": return <g {...common}><path d="M-12 5 V-6 H3 V5 Z M3 -2 H8 L12 2 V5 H3" /><circle cx="-6" cy="8" r="2.5" /><circle cx="7" cy="8" r="2.5" /></g>;
    case "barn": return <path {...common} d="M-11 11 V-2 L0 -11 L11 -2 V11 Z M-4 11 V3 H4 V11" />;
  }
}

/** A feed pellet travels from nature to the farm as you scroll, lighting each stop as it passes. */
export default function FeedJourney() {
  const t = useWhoWeAre();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const cx = useMotionValue(40);
  const cy = useMotionValue(250);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    setPoints(STOPS.map((stop) => { const p = path.getPointAtLength(stop.at * length); return { x: p.x, y: p.y }; }));
  }, [reduce]);

  useMotionValueEvent(progress, "change", (v) => {
    const path = pathRef.current;
    if (!path) return;
    const p = path.getPointAtLength(Math.min(1, Math.max(0, v)) * path.getTotalLength());
    cx.set(p.x);
    cy.set(p.y);
    setActive(STOPS.reduce((last, stop, i) => (v >= stop.at - 0.05 ? i : last), 0));
  });

  const map = (all: boolean) => <svg viewBox="0 0 1000 340" className="w-full h-auto" role="img" aria-label="The path feed takes: nature, the ANBioT lab, the Doddaballapura plant, storage, transport and the farm.">
    <path ref={pathRef} d={PATH} fill="none" stroke="#cbd5e1" strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
    {!all && <motion.path d={PATH} fill="none" stroke="#d4462a" strokeWidth={5} strokeLinecap="round" style={{ pathLength: progress }} />}
    {all && <path d={PATH} fill="none" stroke="#d4462a" strokeWidth={5} strokeLinecap="round" />}
    {points.map((p, i) => {
      const reached = all || i <= active;
      const above = p.y < 180;
      return <g key={STOPS[i].title} transform={`translate(${p.x} ${p.y})`}>
        <motion.circle r={26} initial={false} animate={{ scale: !all && i === active ? 1.15 : 1 }} fill={reached ? "#2f4f7f" : "#ffffff"} stroke={reached ? "#2f4f7f" : "#cbd5e1"} strokeWidth={3} />
        <g className={reached ? "text-white" : "text-slate-400"}><Icon name={STOPS[i].icon} /></g>
        <text y={above ? -44 : 56} textAnchor="middle" className={`max-md:hidden text-[19px] font-bold ${reached ? "fill-[#2f4f7f]" : "fill-slate-400"}`}>{STOPS[i].title}</text>
      </g>;
    })}
    {!all && <motion.circle cx={cx} cy={cy} r={10} fill="#d4462a" stroke="#ffffff" strokeWidth={4} />}
  </svg>;

  const intro = <div className="max-w-[1200px] mx-auto px-6 pt-14 md:pt-20 pb-6">
    <p className="text-sm font-semibold tracking-widest uppercase text-teal-aa">{t.kicker}</p>
    <h2 className="font-heading text-3xl md:text-5xl font-bold text-brand-navy leading-tight mt-3 max-w-4xl">{t.title}</h2>
    <p className="text-slate-700 md:text-lg leading-relaxed mt-5 max-w-3xl">{t.intro}</p>
  </div>;

  // Reduced motion: the whole path drawn, with every stop described below it.
  if (reduce) return <section aria-label="Who we are, storage to stomach" className="bg-slate-50">
    {intro}
    <div ref={ref} className="max-w-[1200px] mx-auto px-6 pb-16">
      {map(true)}
      <ol className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">{STOPS.map((stop, i) => <li key={stop.title} className="rounded-2xl bg-white p-5 border border-slate-200">
        <p className="text-xs font-bold tracking-widest uppercase text-brand-orange-aa">Stop {i + 1}</p>
        <h3 className="font-heading text-lg font-bold text-brand-navy mt-1">{stop.title}</h3>
        <p className="text-slate-600 mt-1">{stop.text}</p>
      </li>)}</ol>
    </div>
    <Closing />
  </section>;

  const stop = STOPS[active];
  return <section aria-label="Who we are, storage to stomach" className="bg-slate-50">
    {intro}
    <div ref={ref} className="relative" style={{ height: "520svh" }}>
      <div className={`${PINNED} flex flex-col justify-center`}>
        <div className="max-w-[1200px] mx-auto px-6 w-full">
          <p className="font-heading text-xl md:text-2xl font-bold text-brand-orange-aa italic">{t.tagline}</p>
          <div className="mt-2 md:mt-4">{map(false)}</div>
          <div className="relative mt-4 md:mt-6 min-h-[220px] md:min-h-[170px]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div key={stop.title} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35, ease: easeOut }}
                className="grid grid-cols-[96px_minmax(0,1fr)] md:grid-cols-[200px_minmax(0,1fr)] gap-4 md:gap-8 items-center rounded-2xl bg-white border border-slate-200 p-3 md:p-4">
                <div className="relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden"><Image src={stop.image} alt={stop.alt} fill sizes="200px" className="object-cover" /></div>
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-brand-orange-aa">Stop {active + 1} of {STOPS.length}</p>
                  <h3 className="font-heading text-lg md:text-2xl font-bold text-brand-navy mt-1">{stop.title}</h3>
                  <p className="text-slate-600 text-[15px] md:text-base leading-relaxed mt-1">{stop.text}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
    <Closing />
  </section>;
}
