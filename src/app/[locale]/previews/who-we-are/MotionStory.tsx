"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { useHref, useT } from "@/i18n/LocaleProvider";

const easeOut = [0.25, 0.1, 0, 1] as const;

// From nature to the farm: each column feeds the next through a shared point, so no single product is tied to one
// technology here. Positions are in the diagram's viewBox (1100 × 460).
const FLOW = [
  { title: "Nature", x: 115, nodes: [{ label: "Ayurvedic plants" }, { label: "Natural inputs" }, { label: "Silkworm-pupae protein" }] },
  { title: "Our technologies", x: 400, nodes: [{ label: "ANBioT" }, { label: "Green synthesis" }, { label: "Microencapsulation" }] },
  { title: "Product ranges", x: 700, nodes: [
    { label: "Feed hygiene", sub: "MaxDmold · FeedGenie" },
    { label: "Bio-trace minerals", sub: "MinBioZen" },
    { label: "Rumen-bypass", sub: "MethioWiz · CholiWiz" },
    { label: "Natural growth promoters" },
  ] },
  { title: "Animals", x: 980, nodes: [{ label: "Poultry" }, { label: "Dairy cattle" }, { label: "Swine" }] },
];
const NODE_W = 210;
const MID_Y = 250;
const nodeY = (count: number, i: number) => MID_Y + (i - (count - 1) / 2) * (count > 3 ? 92 : 112);

// Between two columns, every node curves into one meeting point and out again.
function links() {
  const out: { d: string; key: string; delay: number }[] = [];
  FLOW.slice(0, -1).forEach((col, c) => {
    const next = FLOW[c + 1];
    const meet = (col.x + next.x) / 2;
    col.nodes.forEach((_, i) => {
      const x = col.x + NODE_W / 2, y = nodeY(col.nodes.length, i);
      out.push({ key: `in-${c}-${i}`, delay: c * 0.6, d: `M${x} ${y} C ${meet - 30} ${y}, ${meet - 40} ${MID_Y}, ${meet} ${MID_Y}` });
    });
    next.nodes.forEach((_, j) => {
      const x = next.x - NODE_W / 2, y = nodeY(next.nodes.length, j);
      out.push({ key: `out-${c}-${j}`, delay: c * 0.6 + 0.3, d: `M${meet} ${MID_Y} C ${meet + 40} ${MID_Y}, ${meet + 30} ${y}, ${x} ${y}` });
    });
  });
  return out;
}
const LINKS = links();

// The leadership caption, one director per field (roles from the facts list).
const EXPERIENCE = [
  { years: 30, field: "Animal-nutraceutical innovation", who: "Dr Radhakrishna PM, Chairman and MD" },
  { years: 23, field: "Feed-additive R&D", who: "Dr Sharada KC, Director, Technical" },
  { years: 38, field: "Commercial project management", who: "Shankar CV, Director, Business and Development" },
  { years: 15, field: "Supply-chain accounting and HR", who: "Sneha R, Director, HR and Finance" },
];

const MILESTONES = [
  { year: "2018", title: "Huvepharma", text: "Collaboration begins" },
  { year: "2020", title: "EW Nutrition", text: "Partnership begins" },
  { year: "2020-21", title: "C-CAMP K-SAP BIO 50", text: "Selected for the cohort" },
  { year: "2023", title: "Technology Development Board", text: "DST support for the bio-trace minerals project" },
  { year: "Today", title: "FAMI-QS", text: "Feed-additive quality and safety certified" },
];

const CHAIN = ["Doddaballapura facility", "Warehouses", "Transport networks", "Direct or distributors", "Poultry, swine and dairy producers"];

function FlowDiagram() {
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const seen = useInView(ref, { once: true, margin: "-120px" });
  const show = seen || reduce;
  return <svg ref={ref} viewBox="0 0 1100 470" role="img" aria-label="Nature's inputs go through ChemLife's three technologies into four product ranges for poultry, dairy cattle and swine." className="w-full h-auto">
    {FLOW.map((col) => <text key={col.title} x={col.x} y={36} textAnchor="middle" className="fill-slate-500 text-[13px] font-bold uppercase tracking-[0.15em]">{col.title}</text>)}
    {LINKS.map((link) => <g key={link.key}>
      <motion.path d={link.d} fill="none" stroke="#2f4f7f" strokeOpacity={0.22} strokeWidth={2}
        initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: show ? 1 : 0 }} transition={{ duration: 0.9, delay: reduce ? 0 : link.delay, ease: easeOut }} />
      {show && !reduce && <circle r={4} fill="#d4462a">
        <animateMotion dur="2.6s" begin={`${link.delay + 0.9}s`} repeatCount="indefinite" path={link.d} />
      </circle>}
    </g>)}
    {FLOW.map((col, c) => col.nodes.map((node, i) => {
      const y = nodeY(col.nodes.length, i);
      const h = node.sub ? 58 : 46;
      return <motion.g key={node.label} initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.85 }} animate={show ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: reduce ? 0 : c * 0.6 + i * 0.08, ease: easeOut }} style={{ transformOrigin: `${col.x}px ${y}px` }}>
        <rect x={col.x - NODE_W / 2} y={y - h / 2} width={NODE_W} height={h} rx={h / 2} fill={c === 1 ? "#2f4f7f" : "#ffffff"} stroke={c === 1 ? "#2f4f7f" : "#cbd5e1"} strokeWidth={1.5} />
        <text x={col.x} y={node.sub ? y - 4 : y + 5} textAnchor="middle" className={`text-[15px] font-bold ${c === 1 ? "fill-white" : "fill-[#2f4f7f]"}`}>{node.label}</text>
        {node.sub && <text x={col.x} y={y + 15} textAnchor="middle" className="fill-[#b8391f] text-[12px] font-semibold">{node.sub}</text>}
      </motion.g>;
    }))}
  </svg>;
}

// Phones: the same flow, one column under the next, joined by a line a dot runs down.
function FlowStack() {
  const reduce = useReducedMotion();
  return <ol className="space-y-0">
    {FLOW.map((col, c) => <li key={col.title}>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, ease: easeOut }}
        className={`rounded-2xl p-5 ${c === 1 ? "bg-brand-navy text-white" : "bg-slate-50 border border-slate-200"}`}>
        <p className={`text-xs font-bold uppercase tracking-widest ${c === 1 ? "text-white/70" : "text-slate-500"}`}>{col.title}</p>
        <ul className="flex flex-wrap gap-2 mt-3">
          {col.nodes.map((node) => <li key={node.label} className={`rounded-full px-3 py-1.5 text-sm font-semibold ${c === 1 ? "bg-white/15" : "bg-white border border-slate-200 text-brand-navy"}`}>
            {node.label}{"sub" in node && node.sub && <span className="text-brand-orange-aa font-normal"> · {node.sub}</span>}
          </li>)}
        </ul>
      </motion.div>
      {c < FLOW.length - 1 && <div aria-hidden="true" className="relative mx-auto w-px h-10 bg-slate-300 overflow-hidden">
        {!reduce && <motion.span className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-orange" animate={{ top: ["-10%", "100%"] }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay: c * 0.3 }} />}
      </div>}
    </li>)}
  </ol>;
}

function Counter({ to, start }: { to: number; start: boolean }) {
  const [value, setValue] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!start) return;
    if (reduce) { setValue(to); return; }
    const controls = animate(0, to, { duration: 1.6, ease: easeOut, onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [start, to, reduce]);
  return <>{value}</>;
}

function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-80px" });
  const total = EXPERIENCE.reduce((sum, e) => sum + e.years, 0);
  return <div ref={ref} className="grid lg:grid-cols-12 gap-10 items-center">
    <div className="lg:col-span-4">
      <p className="font-heading text-7xl md:text-8xl font-bold text-brand-navy leading-none"><Counter to={total} start={seen} /></p>
      <p className="font-heading text-xl font-bold text-brand-orange-aa mt-2">years of combined leadership</p>
      <p className="text-slate-600 mt-3">Four directors, each leading the field they know best.</p>
    </div>
    <ul className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-6">
      {EXPERIENCE.map((e, i) => <li key={e.field} className="text-center">
        <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto">
          <svg viewBox="0 0 120 120" aria-hidden="true" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <motion.circle cx="60" cy="60" r="52" fill="none" stroke={i % 2 ? "#2f4f7f" : "#d4462a"} strokeWidth="8" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: seen ? e.years / 40 : 0 }} transition={{ duration: 1.4, delay: 0.15 * i, ease: easeOut }} />
          </svg>
          <span className="absolute inset-0 grid place-items-center font-heading text-3xl font-bold text-brand-navy"><Counter to={e.years} start={seen} /></span>
        </div>
        <p className="font-bold text-brand-navy mt-3 leading-snug">{e.field}</p>
        <p className="text-slate-500 text-sm mt-1">{e.who}</p>
      </li>)}
    </ul>
  </div>;
}

function Milestones() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <ol ref={ref} className="relative grid md:grid-cols-5 gap-8 md:gap-6 pl-8 md:pl-0">
    <span aria-hidden="true" className="absolute md:hidden left-[11px] top-0 bottom-0 w-px bg-slate-200" />
    <motion.span aria-hidden="true" style={{ scaleY: progress }} className="absolute md:hidden left-[11px] top-0 bottom-0 w-px bg-brand-orange origin-top" />
    <span aria-hidden="true" className="hidden md:block absolute left-0 right-0 top-[11px] h-px bg-slate-200" />
    <motion.span aria-hidden="true" style={{ scaleX: progress }} className="hidden md:block absolute left-0 right-0 top-[11px] h-0.5 bg-brand-orange origin-left" />
    {MILESTONES.map((m, i) => <motion.li key={m.title} className="relative"
      initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.12, ease: easeOut }}>
      <motion.span aria-hidden="true" className="absolute -left-8 md:static block w-6 h-6 rounded-full bg-white border-4 border-brand-orange"
        initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: i * 0.12 }} />
      <span className="block font-heading text-3xl font-bold text-brand-navy md:mt-5">{m.year}</span>
      <p className="font-bold text-brand-orange-aa mt-1">{m.title}</p>
      <p className="text-slate-600 text-[15px] leading-relaxed mt-1">{m.text}</p>
    </motion.li>)}
  </ol>;
}

function SupplyChain() {
  const reduce = useReducedMotion();
  return <div className="relative">
    <div aria-hidden="true" className="hidden md:block absolute left-[10%] right-[10%] top-7 h-0.5 bg-white/20 overflow-hidden">
      {!reduce && [0, 1, 2].map((n) => <motion.span key={n} className="absolute top-1/2 -translate-y-1/2 w-10 h-1.5 rounded-full bg-brand-orange"
        animate={{ left: ["-10%", "105%"] }} transition={{ duration: 4.5, repeat: Infinity, ease: "linear", delay: n * 1.5 }} />)}
    </div>
    <ol className="relative grid md:grid-cols-5 gap-6">
      {CHAIN.map((step, i) => <motion.li key={step} className="flex md:flex-col items-center md:text-center gap-4"
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1, ease: easeOut }}>
        <span className="shrink-0 grid place-items-center w-14 h-14 rounded-full bg-white text-brand-navy font-heading text-xl font-bold ring-4 ring-brand-navy">{i + 1}</span>
        <span className="font-semibold text-white">{step}</span>
      </motion.li>)}
    </ol>
  </div>;
}

function Faq() {
  const t = useT().home.whoWeAre;
  const [open, setOpen] = useState(0);
  return <ul className="divide-y divide-slate-200 border-y border-slate-200">
    {t.faq.map((item, i) => <li key={item.q}>
      <h3>
        <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}
          className="w-full flex items-start justify-between gap-6 py-5 text-left font-heading text-lg md:text-xl font-bold text-brand-navy cursor-pointer">
          {item.q}
          <motion.span aria-hidden="true" animate={{ rotate: open === i ? 45 : 0 }} className="shrink-0 grid place-items-center w-8 h-8 rounded-full border border-slate-300 text-brand-orange-aa">+</motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: easeOut }} className="overflow-hidden">
          <p className="text-slate-600 leading-relaxed pb-5 max-w-[68ch]">{item.a}</p>
        </motion.div>}
      </AnimatePresence>
    </li>)}
  </ul>;
}

function SectionLabel({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`text-sm font-semibold tracking-widest uppercase mb-6 ${light ? "text-white/70" : "text-teal-aa"}`}>{children}</p>;
}

export default function MotionStory() {
  const t = useT().home.whoWeAre;
  const href = useHref();
  const reduce = useReducedMotion();
  const words = t.title.split(" ");
  const actions = [
    { label: t.exploreProducts, path: "/products" },
    { label: t.seeResearch, path: "/research" },
    { label: t.meetLeadership, path: "/about" },
    { label: t.requestDossier, path: "/contact?type=dossier" },
  ];

  return <section aria-label="Who we are, motion story" className="bg-white overflow-hidden">
    {/* Opening: the title word by word over slowly drifting molecules */}
    <div className="relative py-16 md:py-24">
      <svg aria-hidden="true" viewBox="0 0 400 400" className="absolute -right-24 -top-10 w-[460px] text-brand-navy/[0.07] pointer-events-none">
        <motion.g animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 200px" }} fill="none" stroke="currentColor" strokeWidth="3">
          <polygon points="200,80 304,140 304,260 200,320 96,260 96,140" />
          <polygon points="200,130 261,165 261,235 200,270 139,235 139,165" />
          {[[200, 80], [304, 140], [304, 260], [200, 320], [96, 260], [96, 140]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="12" fill="currentColor" />)}
        </motion.g>
      </svg>
      <div className="relative max-w-[1200px] mx-auto px-6 grid lg:grid-cols-12 gap-10 items-end">
        <div className="lg:col-span-7">
          <span className="text-teal-aa text-sm font-semibold tracking-widest uppercase block mb-3">{t.kicker}</span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-brand-navy">
            {words.map((word, i) => <motion.span key={`${word}-${i}`} className="inline-block mr-[0.25em]"
              initial={{ opacity: 0, y: reduce ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06, ease: easeOut }}>{word}</motion.span>)}
          </h2>
          <motion.p className="font-heading text-lg md:text-xl font-semibold italic text-brand-orange-aa mt-4"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: words.length * 0.06 + 0.1 }}>{t.tagline}</motion.p>
        </div>
        <motion.p className="lg:col-span-5 text-brand-navy text-lg leading-relaxed"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4, ease: easeOut }}>{t.intro}</motion.p>
      </div>
    </div>

    {/* From nature to the farm */}
    <div className="bg-slate-50 py-16 md:py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionLabel>From nature to the farm</SectionLabel>
        <div className="hidden md:block"><FlowDiagram /></div>
        <div className="md:hidden"><FlowStack /></div>
      </div>
    </div>

    {/* The leadership's experience */}
    <div className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionLabel>Leadership</SectionLabel>
        <Experience />
      </div>
    </div>

    {/* Partnerships, recognition and support */}
    <div className="bg-slate-50 py-16 md:py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionLabel>Milestones</SectionLabel>
        <Milestones />
      </div>
    </div>

    {/* How it reaches the farm */}
    <div className="bg-brand-navy py-16 md:py-20">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionLabel light>From Doddaballapura to your farm</SectionLabel>
        <SupplyChain />
      </div>
    </div>

    {/* The questions, then where to go next */}
    <div className="py-16 md:py-24">
      <div className="max-w-[900px] mx-auto px-6">
        <SectionLabel>Questions</SectionLabel>
        <Faq />
        <div className="flex flex-wrap gap-3 mt-10">
          {actions.map((action, i) => <a key={action.path} href={href(action.path)}
            className={i === 0
              ? "inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors"
              : "inline-flex items-center justify-center min-h-12 px-7 rounded-full border-2 border-brand-navy/20 hover:border-brand-navy text-brand-navy font-semibold transition-colors"}>{action.label}</a>)}
        </div>
      </div>
    </div>
  </section>;
}
