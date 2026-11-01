"use client";

import { useEffect, useId, useRef } from "react";
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { PRODUCTS } from "@/lib/catalog";
import { PLATFORM_NAMES, type ChapterId, type RichChapter } from "./content";

// Full-size scenes for the "motion graphics only" versions. Each one is scrubbed by `p`, how far the reader has
// scrolled through its chapter (0 to 1), so scrolling back runs it backwards; `active` adds the ambient loops.
const INK = "#ffffff";
const DIM = "rgba(255,255,255,0.16)";
const SOFT = "rgba(255,255,255,0.65)";
const ORANGE = "#ff7a59";
const TEAL = "#43d1bd";
const GOLD = "#f5bf4f";
const GREEN = "#8bd96f";
const STAGE = "#0f1d33";

type S = { p: MotionValue<number>; active: boolean };
const VB = { viewBox: "0 0 600 560", className: "w-full h-full", "aria-hidden": true } as const;
const deg = (d: number) => (d * Math.PI) / 180;

/** Draws a line as `p` moves from a to b. */
function Draw({ p, a, b, d, stroke = INK, width = 3, fill = "none" }: { p: MotionValue<number>; a: number; b: number; d: string; stroke?: string; width?: number; fill?: string }) {
  const pathLength = useTransform(p, [a, b], [0, 1]);
  const opacity = useTransform(p, [a, a + 0.005], [0, 1]);
  return <motion.path d={d} fill={fill} stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength, opacity }} />;
}

/** Fades, scales and slides its children in as `p` moves from a to b. */
function Pop({ p, a, b, from = 0.6, dx = 0, dy = 0, children }: { p: MotionValue<number>; a: number; b?: number; from?: number; dx?: number; dy?: number; children: React.ReactNode }) {
  const t = useTransform(p, [a, b ?? a + 0.08], [0, 1]);
  const scale = useTransform(t, [0, 1], [from, 1]);
  const x = useTransform(t, [0, 1], [dx, 0]);
  const y = useTransform(t, [0, 1], [dy, 0]);
  return <motion.g style={{ opacity: t, scale, x, y }}>{children}</motion.g>;
}

/** A number scrubbed from 0 to `to`. */
function ScrubNumber({ p, a, b, to, x, y, size, fill = INK }: { p: MotionValue<number>; a: number; b: number; to: number; x: number; y: number; size: number; fill?: string }) {
  const value = useTransform(p, [a, b], [0, to]);
  const rounded = useTransform(value, (v) => Math.round(v));
  return <motion.text x={x} y={y} textAnchor="middle" fontSize={size} fontWeight={800} fill={fill}>{rounded}</motion.text>;
}

/** Turns its children slowly about (cx, cy) while the scene is active. */
function Spin({ active, duration, cx, cy, r, reverse = false, children }: { active: boolean; duration: number; cx: number; cy: number; r: number; reverse?: boolean; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const on = active && !reduce;
  return <motion.g animate={{ rotate: on ? (reverse ? -360 : 360) : 0 }} transition={on ? { duration, repeat: Infinity, ease: "linear" } : { duration: 0.6 }}>
    {/* Invisible, so the group turns about its centre. */}
    <circle cx={cx} cy={cy} r={r} fill="none" />
    {children}
  </motion.g>;
}

function Pulse({ active, cx, cy, r, color, grow = 2.2 }: { active: boolean; cx: number; cy: number; r: number; color: string; grow?: number }) {
  const reduce = useReducedMotion();
  if (!active || reduce) return null;
  return <>{[0, 1, 2].map((i) => <motion.circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2} initial={{ opacity: 0 }}
    animate={{ scale: [1, grow], opacity: [0.5, 0] }} transition={{ duration: 3, delay: i, repeat: Infinity, ease: "easeOut" }} />)}</>;
}

/** Moves its children along a path as `p` moves from a to b, turned to face the way they're going. */
function PathRider({ p, d, a, b, children }: { p: MotionValue<number>; d: string; a: number; b: number; children: React.ReactNode }) {
  const ref = useRef<SVGPathElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useMotionValue(0);
  const place = (v: number) => {
    const path = ref.current;
    if (!path) return;
    const length = path.getTotalLength();
    const at = Math.min(1, Math.max(0, (v - a) / (b - a))) * length;
    const point = path.getPointAtLength(at);
    const ahead = path.getPointAtLength(Math.min(length, at + 1));
    x.set(point.x);
    y.set(point.y);
    if (at < length) rotate.set((Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => place(p.get()), []);
  useMotionValueEvent(p, "change", place);
  return <><path ref={ref} d={d} fill="none" /><motion.g style={{ x, y, rotate }}>{children}</motion.g></>;
}

function Dot({ p, a, cx, cy, r, color }: { p: MotionValue<number>; a: number; cx: number; cy: number; r: number; color: string }) {
  const t = useTransform(p, [a, a + 0.05], [0, 1]);
  return <motion.circle cx={cx} cy={cy} r={r} fill={color} style={{ opacity: t, scale: t }} />;
}

const hexPoints = (cx: number, cy: number, r: number) => Array.from({ length: 6 }, (_, k) => [cx + r * Math.cos(deg(60 * k - 30)), cy + r * Math.sin(deg(60 * k - 30))]);
const hexPath = (cx: number, cy: number, r: number) => `M${hexPoints(cx, cy, r).map((pt) => pt.join(" ")).join(" L")} Z`;

/** 1. Who we are: the leadership's years at the core, the platforms, species and products circling it. */
function IntroScene({ p, active }: S) {
  const cx = 300, cy = 262;
  const orbit = useTransform(p, [0, 1], [-50, 70]);
  const counter = useTransform(orbit, (v) => -v);
  const core = useTransform(p, [0, 0.15], [0.3, 1]);
  const species = ["Poultry", "Dairy", "Swine"];
  return <svg {...VB}>
    {[96, 150, 214].map((r, i) => <Spin key={r} active={active} duration={50 + i * 20} cx={cx} cy={cy} r={r} reverse={i % 2 === 1}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={DIM} strokeWidth={1.5} strokeDasharray={i === 1 ? "2 10" : "6 14"} />
    </Spin>)}
    <Pulse active={active} cx={cx} cy={cy} r={66} color={ORANGE} />
    {PRODUCTS.map((product, i) => {
      const a = deg((360 / PRODUCTS.length) * i - 90);
      return <Dot key={product.id} p={p} a={0.3 + (i / PRODUCTS.length) * 0.35} cx={cx + 214 * Math.cos(a)} cy={cy + 214 * Math.sin(a)} r={7} color={i % 3 === 0 ? ORANGE : i % 3 === 1 ? TEAL : GOLD} />;
    })}
    {PLATFORM_NAMES.map((name, i) => {
      const a = deg(72 * i - 90);
      return <Pop key={name} p={p} a={0.45 + i * 0.05}><path d={hexPath(cx + 96 * Math.cos(a), cy + 96 * Math.sin(a), 13)} fill={STAGE} stroke={TEAL} strokeWidth={2.5} /></Pop>;
    })}
    <motion.g style={{ rotate: orbit }}>
      <circle cx={cx} cy={cy} r={186} fill="none" />
      {species.map((name, i) => {
        const a = deg(120 * i - 90);
        const x = cx + 150 * Math.cos(a), y = cy + 150 * Math.sin(a);
        return <motion.g key={name} style={{ rotate: counter }}>
          <Pop p={p} a={0.18 + i * 0.06}>
            <circle cx={x} cy={y} r={34} fill={INK} />
            <text x={x} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={STAGE}>{name}</text>
          </Pop>
        </motion.g>;
      })}
    </motion.g>
    <motion.circle cx={cx} cy={cy} r={62} fill={ORANGE} style={{ scale: core }} />
    <ScrubNumber p={p} a={0.05} b={0.55} to={106} x={cx} y={cy + 10} size={44} />
    <text x={cx} y={cy + 32} textAnchor="middle" fontSize={12} fill={INK} opacity={0.9}>years combined</text>
    {[[`${PRODUCTS.length} products`, 110, ORANGE], [`${PLATFORM_NAMES.length} research platforms`, 300, TEAL], ["3 species", 490, INK]].map(([label, x, color], i) =>
      <Pop key={label as string} p={p} a={0.6 + i * 0.08} dy={12}>
        <text x={x as number} y={528} textAnchor="middle" fontSize={16} fontWeight={800} fill={color as string}>{label}</text>
      </Pop>)}
  </svg>;
}

/** 2. What we make: one stream splits into the three platforms, each vial filling and naming its products. */
function MakeScene({ p, active }: S) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduce = useReducedMotion();
  const vials = [
    { x: 130, color: ORANGE, level: 0.86, name: ["Feed", "hygiene"], products: ["MaxDmold", "FeedGenie"] },
    { x: 300, color: TEAL, level: 0.7, name: ["Bio-trace", "minerals"], products: ["MinBioZen"] },
    { x: 470, color: GOLD, level: 0.8, name: ["Rumen-", "bypass"], products: ["MethioWiz", "CholiWiz"] },
  ];
  return <svg {...VB}>
    <Draw p={p} a={0} b={0.12} d="M300 24 V118" stroke={SOFT} width={6} />
    <Pop p={p} a={0} from={0.4}><circle cx={300} cy={24} r={14} fill={ORANGE} /></Pop>
    {vials.map((vial, i) => {
      const pipe = `M300 118 C 300 160 ${vial.x} 150 ${vial.x} 194`;
      return <g key={vial.x}>
        <Draw p={p} a={0.08 + i * 0.03} b={0.24 + i * 0.03} d={pipe} stroke={SOFT} width={6} />
        {active && !reduce && <circle r={5} fill={vial.color}><animateMotion dur="1.8s" begin={`${i * 0.4}s`} repeatCount="indefinite" path={`M300 24 V118 ${pipe.slice(9)}`} /></circle>}
        <defs><clipPath id={`${id}-${i}`}><rect x={vial.x - 50} y={198} width={100} height={262} rx={50} /></clipPath></defs>
        <rect x={vial.x - 50} y={198} width={100} height={262} rx={50} fill="rgba(255,255,255,0.05)" stroke={SOFT} strokeWidth={2.5} />
        <g clipPath={`url(#${id}-${i})`}>
          <VialFill p={p} a={0.2 + i * 0.08} b={0.6 + i * 0.08} x={vial.x} level={vial.level} color={vial.color} />
          {active && !reduce && [0, 1, 2, 3, 4].map((k) => <motion.circle key={k} cx={vial.x - 26 + k * 13} r={3 + (k % 2) * 2} fill="#fff" fillOpacity={0.5}
            initial={{ cy: 450 }} animate={{ cy: [450, 460 - 262 * vial.level + 10], opacity: [0, 1, 0] }} transition={{ duration: 2.4, delay: k * 0.45 + i * 0.3, repeat: Infinity, ease: "easeOut" }} />)}
        </g>
        {vial.products.map((name, j) => <Pop key={name} p={p} a={0.62 + i * 0.08 + j * 0.04} dy={-10}>
          <rect x={vial.x - 46} y={250 + j * 34} width={92} height={26} rx={13} fill="#fff" />
          <text x={vial.x} y={268 + j * 34} textAnchor="middle" fontSize={12.5} fontWeight={800} fill={STAGE}>{name}</text>
        </Pop>)}
        <Pop p={p} a={0.15 + i * 0.05} dy={10}>
          <text x={vial.x} y={490} textAnchor="middle" fontSize={15} fontWeight={800} fill={INK}><tspan x={vial.x} dy={0}>{vial.name[0]}</tspan><tspan x={vial.x} dy={19}>{vial.name[1]}</tspan></text>
        </Pop>
      </g>;
    })}
  </svg>;
}

function VialFill({ p, a, b, x, level, color }: { p: MotionValue<number>; a: number; b: number; x: number; level: number; color: string }) {
  const scaleY = useTransform(p, [a, b], [0, level]);
  return <motion.rect x={x - 50} y={198} width={100} height={262} fill={color} style={{ scaleY, originY: 1 }} />;
}

/** 3. Technologies: a leaf, through the ANBioT medium, becomes a bioactive molecule and then a coated additive. */
function TechScene({ p, active }: S) {
  const hex = hexPoints(150, 352, 50);
  const chips = PLATFORM_NAMES.map((name) => ({ name, w: name.length * 7.4 + 26 }));
  const rows = [chips.slice(0, 3), chips.slice(3)];
  return <svg {...VB}>
    <Draw p={p} a={0} b={0.14} d="M70 178 C 58 112 104 60 172 52 C 174 136 128 184 70 178 Z" stroke={GREEN} width={3.5} fill="rgba(139,217,111,0.08)" />
    <Draw p={p} a={0.05} b={0.16} d="M56 196 L70 178 C 106 142 140 100 172 52" stroke={GREEN} width={3} />
    <Pop p={p} a={0.1} dy={8}><text x={118} y={222} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>Plant</text></Pop>

    <Draw p={p} a={0.14} b={0.24} d="M200 100 C 280 60 350 64 392 96" stroke={SOFT} width={2.5} />
    <Draw p={p} a={0.2} b={0.36} d="M438 54 V116 A62 62 0 1 0 462 116 V54" stroke={INK} width={3.5} />
    <Draw p={p} a={0.2} b={0.24} d="M430 54 H470" stroke={INK} width={3.5} />
    <Pop p={p} a={0.3} b={0.42} from={0.2}><circle cx={450} cy={176} r={52} fill={TEAL} fillOpacity={0.35} /></Pop>
    <Spin active={active} duration={8} cx={450} cy={176} r={40}>
      {[0, 1, 2, 3, 4, 5].map((k) => <Dot key={k} p={p} a={0.34 + k * 0.01} cx={450 + 30 * Math.cos(deg(k * 60))} cy={176 + 30 * Math.sin(deg(k * 60))} r={k % 2 ? 5 : 7} color={k % 2 ? INK : ORANGE} />)}
    </Spin>
    <Pop p={p} a={0.36} dy={8}>
      <text x={450} y={262} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>ANBioT</text>
      <text x={450} y={280} textAnchor="middle" fontSize={11.5} fill={SOFT}>deep eutectic medium</text>
    </Pop>

    <Draw p={p} a={0.4} b={0.5} d="M400 296 C 330 310 260 318 214 334" stroke={SOFT} width={2.5} />
    <Draw p={p} a={0.48} b={0.64} d={`M${hex.map((pt) => pt.join(" ")).join(" L")} Z`} stroke={INK} width={3.5} fill={STAGE} />
    <Draw p={p} a={0.56} b={0.64} d="M150 330 A22 22 0 1 1 149.9 330" stroke={INK} width={2.5} />
    {hex.filter((_, k) => k % 2 === 0).map(([x, y], k) => <Dot key={k} p={p} a={0.62 + k * 0.02} cx={x} cy={y} r={8} color={ORANGE} />)}
    <Pop p={p} a={0.6} dy={8}><text x={150} y={430} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>Bioactive molecule</text></Pop>

    <Draw p={p} a={0.64} b={0.72} d="M214 380 C 280 414 350 406 388 372" stroke={SOFT} width={2.5} />
    <Spin active={active} duration={14} cx={450} cy={352} r={62}>
      <Pop p={p} a={0.82} from={0.3}><circle cx={450} cy={352} r={60} fill="none" stroke={SOFT} strokeWidth={2.5} strokeDasharray="4 8" /></Pop>
    </Spin>
    {[46, 32].map((r, k) => <Pop key={r} p={p} a={0.76 + (1 - k) * 0.03} from={0.3}><circle cx={450} cy={352} r={r} fill="none" stroke={GOLD} strokeWidth={5} /></Pop>)}
    <Pop p={p} a={0.72} from={0.2}><circle cx={450} cy={352} r={18} fill={ORANGE} /></Pop>
    <Pulse active={active} cx={450} cy={352} r={60} color={GOLD} grow={1.4} />
    <Pop p={p} a={0.78} dy={8}><text x={450} y={436} textAnchor="middle" fontSize={14} fontWeight={800} fill={INK}>Coated additive</text></Pop>

    {rows.map((row, r) => {
      const total = row.reduce((sum, chip) => sum + chip.w, 0) + (row.length - 1) * 10;
      let x = 300 - total / 2;
      return row.map((chip, k) => {
        const left = x;
        x += chip.w + 10;
        return <Pop key={chip.name} p={p} a={0.84 + (r * 3 + k) * 0.025} dy={10}>
          <rect x={left} y={470 + r * 40} width={chip.w} height={30} rx={15} fill="rgba(255,255,255,0.1)" stroke={TEAL} strokeWidth={1.5} />
          <text x={left + chip.w / 2} y={490 + r * 40} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={INK}>{chip.name}</text>
        </Pop>;
      });
    })}
  </svg>;
}

/** 4. Feed hygiene: a shield rises over the silo and turns the mould away; on the way to the stomach,
 *  mycotoxins are locked one by one. */
function HygieneScene({ p, active }: S) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const reduce = useReducedMotion();
  const cx = 300, ground = 430;
  const grain = useTransform(p, [0.1, 0.3], [0, 0.78]);
  const shieldFill = useTransform(p, [0.4, 0.55], [0, 0.14]);
  const pellet = useTransform(p, [0.55, 0.98], [80, 520]);
  const spores = [25, 55, 90, 125, 155].map((a) => {
    const s = { x: cx + 250 * Math.cos(deg(a)), y: ground - 250 * Math.sin(deg(a)) };
    const t = { x: cx + 182 * Math.cos(deg(a)), y: ground - 182 * Math.sin(deg(a)) };
    return { s, t };
  });
  const toxins = [170, 260, 350, 440];
  return <svg {...VB}>
    <Draw p={p} a={0} b={0.1} d={`M60 ${ground} H540`} stroke={SOFT} width={2.5} />
    <defs><clipPath id={`${id}-silo`}><path d={`M250 ${ground} V300 C250 258 350 258 350 300 V${ground} Z`} /></clipPath></defs>
    <g clipPath={`url(#${id}-silo)`}><motion.rect x={250} y={262} width={100} height={ground - 262} fill={GOLD} style={{ scaleY: grain, originY: 1 }} /></g>
    <Draw p={p} a={0.02} b={0.18} d={`M250 ${ground} V300 C250 258 350 258 350 300 V${ground}`} stroke={INK} width={3.5} />
    {[330, 365, 400].map((y, k) => <Draw key={y} p={p} a={0.12 + k * 0.02} b={0.2 + k * 0.02} d={`M250 ${y} H350`} stroke={SOFT} width={1.5} />)}

    <motion.path d={`M118 ${ground} A182 182 0 0 1 482 ${ground} Z`} fill={TEAL} style={{ fillOpacity: shieldFill }} />
    <Draw p={p} a={0.28} b={0.5} d={`M118 ${ground} A182 182 0 0 1 482 ${ground}`} stroke={TEAL} width={5} />
    {active && !reduce && <motion.path d={`M118 ${ground} A182 182 0 0 1 482 ${ground}`} fill="none" stroke={TEAL} strokeWidth={16}
      animate={{ strokeOpacity: [0.04, 0.22, 0.04] }} transition={{ duration: 2.4, repeat: Infinity }} />}
    <Pop p={p} a={0.48} dx={-10}>
      <text x={366} y={364} fontSize={15} fontWeight={800} fill={TEAL}>MaxDmold</text>
      <text x={366} y={382} fontSize={11.5} fill={SOFT}>bio-copper</text>
      <text x={366} y={397} fontSize={11.5} fill={SOFT}>mould shield</text>
    </Pop>

    {spores.map(({ s, t }, i) => <g key={i}>
      <motion.g initial={false} animate={active && !reduce ? { x: [0, t.x - s.x, 0], y: [0, t.y - s.y, 0], opacity: [0.2, 1, 0.2] } : { x: 0, y: 0, opacity: 1 }}
        transition={active && !reduce ? { duration: 3, delay: i * 0.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}>
        <circle cx={s.x} cy={s.y} r={10} fill={GREEN} />
        <circle cx={s.x - 6} cy={s.y - 10} r={4} fill={GREEN} />
        <circle cx={s.x + 8} cy={s.y - 6} r={3} fill={GREEN} />
      </motion.g>
      {active && !reduce && <motion.circle cx={t.x} cy={t.y} r={10} fill="none" stroke={TEAL} strokeWidth={2.5} initial={{ opacity: 0 }}
        animate={{ scale: [0.4, 0.4, 2, 2], opacity: [0, 0, 0.9, 0] }} transition={{ duration: 3, delay: i * 0.5, times: [0, 0.45, 0.55, 0.75], repeat: Infinity }} />}
    </g>)}
    <Pop p={p} a={0.05} dy={-6}><text x={cx} y={34} textAnchor="middle" fontSize={13} fontWeight={800} fill={GREEN}>Mould and mycotoxins</text></Pop>

    <Draw p={p} a={0.5} b={0.6} d="M80 520 H520" stroke={SOFT} width={2.5} />
    <Pop p={p} a={0.52} dy={6}>
      <text x={80} y={548} textAnchor="middle" fontSize={11.5} fill={SOFT}>Storage</text>
      <text x={520} y={548} textAnchor="middle" fontSize={11.5} fill={SOFT}>Stomach</text>
      <text x={cx} y={476} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>FeedGenie Prime · multi-mycotoxin defence</text>
    </Pop>
    {toxins.map((x, i) => <Toxin key={x} p={p} x={x} at={0.55 + ((x - 80) / 440) * 0.43} index={i} />)}
    <motion.circle cx={pellet} cy={520} r={9} fill={ORANGE} />
  </svg>;
}

function Toxin({ p, x, at, index }: { p: MotionValue<number>; x: number; at: number; index: number }) {
  const show = useTransform(p, [0.5 + index * 0.02, 0.56 + index * 0.02], [0, 1]);
  const locked = useTransform(p, [at - 0.01, at + 0.02], [0, 1]);
  const fill = useTransform(locked, [0, 1], ["#ff5d5d", "#64748b"]);
  return <motion.g style={{ opacity: show }}>
    <motion.path d={hexPath(x, 498, 10)} style={{ fill }} />
    <motion.circle cx={x} cy={498} r={17} fill="none" stroke={TEAL} strokeWidth={2.5} style={{ opacity: locked, scale: locked }} />
  </motion.g>;
}

/** 5. Proof: the timeline draws down through partnerships and recognition while the seals stamp in. */
function ProofScene({ p, active }: S) {
  const milestones = [
    ["2018", "Huvepharma", "collaboration begins"],
    ["2019", "Animal Husbandry Grand Challenge", "finalist"],
    ["2020", "EW Nutrition", "partnership begins"],
    ["2020-21", "C-CAMP K-SAP BIO 50", "2nd cohort"],
    ["2023", "TDB · DST", "bio-trace minerals project"],
    ["Today", "FAMI-QS", "feed-additive quality and safety"],
  ];
  const seals = [
    { top: "BIRAC", bottom: "supported", x: 488, y: 120, r: 54, color: TEAL, a: 0.32 },
    { top: "a-IDEA", bottom: "NAARM incubated", x: 488, y: 268, r: 54, color: GOLD, a: 0.56 },
    { top: "FAMI-QS", bottom: "certified", x: 476, y: 430, r: 72, color: ORANGE, a: 0.84 },
  ];
  return <svg {...VB}>
    <line x1={70} y1={50} x2={70} y2={520} stroke={DIM} strokeWidth={3} strokeLinecap="round" />
    <Draw p={p} a={0} b={0.88} d="M70 50 V520" stroke={ORANGE} width={3} />
    {milestones.map(([year, title, note], i) => {
      const y = 76 + i * 86;
      const a = 0.04 + i * 0.14;
      return <g key={title}>
        <Pop p={p} a={a} from={0.2}><circle cx={70} cy={y} r={10} fill={ORANGE} stroke={STAGE} strokeWidth={4} /></Pop>
        <Pop p={p} a={a + 0.02} dx={-16}>
          <text x={96} y={y + 6} fontSize={21} fontWeight={800} fill={INK}>{year}</text>
          <text x={96} y={y + 27} fontSize={13.5} fontWeight={700} fill={i % 2 ? TEAL : GOLD}>{title}</text>
          <text x={96} y={y + 45} fontSize={12} fill={SOFT}>{note}</text>
        </Pop>
      </g>;
    })}
    {seals.map((seal) => <Pop key={seal.top} p={p} a={seal.a} b={seal.a + 0.06} from={1.8}>
      <circle cx={seal.x} cy={seal.y} r={seal.r} fill={STAGE} stroke={seal.color} strokeWidth={3} />
      <Spin active={active} duration={22} cx={seal.x} cy={seal.y} r={seal.r - 8}>
        <circle cx={seal.x} cy={seal.y} r={seal.r - 9} fill="none" stroke={seal.color} strokeOpacity={0.6} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
      </Spin>
      <path d={`M${seal.x - 10} ${seal.y - seal.r * 0.45} l7 7 l13 -14`} fill="none" stroke={seal.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <text x={seal.x} y={seal.y + 6} textAnchor="middle" fontSize={seal.r > 60 ? 22 : 17} fontWeight={800} fill={INK}>{seal.top}</text>
      <text x={seal.x} y={seal.y + 24} textAnchor="middle" fontSize={10.5} fill={SOFT}>{seal.bottom}</text>
    </Pop>)}
  </svg>;
}

function Node({ x, y, icon }: { x: number; y: number; icon: string }) {
  return <g>
    <circle cx={x} cy={y} r={30} fill={STAGE} stroke={INK} strokeWidth={2.5} />
    <path d={icon} transform={`translate(${x} ${y})`} fill="none" stroke={INK} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
  </g>;
}
const ICONS = {
  factory: "M-15 12 V-2 L-7 3 V-2 L1 3 V-13 H8 V12 Z",
  warehouse: "M-15 12 V-4 L0 -13 L15 -4 V12 Z M-8 12 V2 H8 V12 M-8 6 H8",
  truck: "M-14 6 V-7 H4 V6 Z M4 -3 H10 L14 1 V6 H4 M-8 10 a2.5 2.5 0 1 0 0.1 0 M8 10 a2.5 2.5 0 1 0 0.1 0",
  shop: "M-13 -3 L-10 -12 H10 L13 -3 Z M-11 -3 V12 H11 V-3 M-4 12 V4 H4 V12",
  barn: "M-14 12 V-2 L0 -13 L14 -2 V12 Z M-5 12 V3 H5 V12",
};

/** 6. Delivery: a truck drives the route from the plant to the farms as you scroll; another takes the distributors' road. */
function DeliveryScene({ p, active }: S) {
  const reduce = useReducedMotion();
  const main = "M84 110 H300 C420 110 480 150 480 220 V430";
  const branch = "M480 220 C 330 232 200 262 200 360 C 200 432 330 440 452 440";
  const truck = <g>
    <rect x={-17} y={-9} width={22} height={16} rx={2} fill={INK} />
    <path d="M5 -5 H12 L17 1 V7 H5 Z" fill={ORANGE} />
    <circle cx={-10} cy={9} r={3.5} fill="#cbd5e1" /><circle cx={10} cy={9} r={3.5} fill="#cbd5e1" />
  </g>;
  const nodes = [
    { x: 84, y: 110, icon: ICONS.factory, label: "Doddaballapura plant", lx: 84, ly: 166, a: 0 },
    { x: 300, y: 110, icon: ICONS.warehouse, label: "Warehouses", lx: 300, ly: 70, a: 0.22 },
    { x: 480, y: 220, icon: ICONS.truck, label: "Transport networks", lx: 480, ly: 172, a: 0.4 },
    { x: 200, y: 360, icon: ICONS.shop, label: "Distributors", lx: 200, ly: 416, a: 0.55 },
    { x: 480, y: 440, icon: ICONS.barn, label: "Poultry, swine and dairy farms", lx: 410, ly: 500, a: 0.82 },
  ];
  return <svg {...VB}>
    {Array.from({ length: 10 }, (_, i) => <line key={`v${i}`} x1={i * 64 + 12} y1={0} x2={i * 64 + 12} y2={560} stroke="rgba(255,255,255,0.05)" />)}
    {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 64 + 24} x2={600} y2={i * 64 + 24} stroke="rgba(255,255,255,0.05)" />)}
    <path d={main} fill="none" stroke={DIM} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    <path d={branch} fill="none" stroke={DIM} strokeWidth={10} strokeLinecap="round" />
    <Draw p={p} a={0.02} b={0.85} d={main} stroke={ORANGE} width={5} />
    <Draw p={p} a={0.45} b={0.8} d={branch} stroke={TEAL} width={4} />
    <Pop p={p} a={0.6} dy={6}>
      <text x={500} y={334} fontSize={12.5} fontWeight={800} fill={ORANGE}>Direct</text>
      <text x={268} y={300} fontSize={12.5} fontWeight={800} fill={TEAL}>Through distributors</text>
    </Pop>
    {active && !reduce && <g opacity={0.9}><animateMotion dur="5s" repeatCount="indefinite" rotate="auto" path={branch} />{truck}</g>}
    {nodes.map((node) => <Pop key={node.label} p={p} a={node.a} from={0.3}>
      <Node x={node.x} y={node.y} icon={node.icon} />
      <text x={node.lx} y={node.ly} textAnchor="middle" fontSize={13} fontWeight={800} fill={INK}>{node.label}</text>
    </Pop>)}
    <Pulse active={active} cx={480} cy={440} r={30} color={ORANGE} grow={1.8} />
    <PathRider p={p} d={main} a={0.02} b={0.85}>{truck}</PathRider>
  </svg>;
}

/** 7. Leadership: four rings fill to each director's years around the combined total. */
function LeadersScene({ p }: S) {
  const cx = 300, cy = 268;
  const rings = [
    { name: "Shankar CV", field: "Commercial", years: 38, r: 214, color: ORANGE },
    { name: "Dr Radhakrishna PM", field: "Nutraceuticals", years: 30, r: 174, color: GOLD },
    { name: "Dr Sharada KC", field: "R&D", years: 23, r: 134, color: TEAL },
    { name: "Sneha R", field: "Finance & HR", years: 15, r: 94, color: GREEN },
  ];
  return <svg {...VB}>
    {[10, 20, 30, 40].map((y) => {
      const a = deg((y / 40) * 360 - 90);
      return <g key={y}>
        <line x1={cx + 230 * Math.cos(a)} y1={cy + 230 * Math.sin(a)} x2={cx + 240 * Math.cos(a)} y2={cy + 240 * Math.sin(a)} stroke={SOFT} strokeWidth={2} />
        {y < 40 && <text x={cx + 254 * Math.cos(a)} y={cy + 254 * Math.sin(a) + 4} textAnchor="middle" fontSize={11} fill={SOFT}>{y}</text>}
      </g>;
    })}
    {rings.map((ring, i) => <Ring key={ring.name} p={p} cx={cx} cy={cy} {...ring} a={0.08 + i * 0.08} />)}
    <ScrubNumber p={p} a={0.08} b={0.8} to={106} x={cx} y={cy + 14} size={50} />
    <text x={cx} y={cy + 36} textAnchor="middle" fontSize={12} fill={SOFT}>years combined</text>
    {rings.map((ring, i) => <Pop key={ring.field} p={p} a={0.55 + i * 0.06} dy={10}>
      <circle cx={42 + i * 142} cy={530} r={6} fill={ring.color} />
      <text x={54 + i * 142} y={535} fontSize={13} fontWeight={700} fill={INK}>{ring.field}</text>
    </Pop>)}
  </svg>;
}

function Ring({ p, cx, cy, r, years, color, name, a }: { p: MotionValue<number>; cx: number; cy: number; r: number; years: number; color: string; name: string; a: number }) {
  const pathLength = useTransform(p, [a, a + 0.45], [0, years / 40]);
  return <g>
    <circle cx={cx} cy={cy} r={r} fill="none" stroke={DIM} strokeWidth={22} />
    <motion.circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={22} strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`} style={{ pathLength }} />
    <Pop p={p} a={a} dx={10}>
      <text x={cx - 18} y={cy - r + 5} textAnchor="end" fontSize={13} fontWeight={800} fill={INK}>{name} · {years}</text>
    </Pop>
  </g>;
}

const SCENES: Record<ChapterId, (props: S) => React.ReactElement> = {
  intro: IntroScene, make: MakeScene, tech: TechScene, hygiene: HygieneScene, proof: ProofScene, delivery: DeliveryScene, leaders: LeadersScene,
};

/** The stage a scene plays on: a deep backdrop of slowly turning hexagons, a glow in the chapter's colour, a light
 *  sweeping down, and a small readout of how far the scene has got. */
export function SceneStage({ chapter, index, p, active, framed = true }: { chapter: RichChapter; index: number; p: MotionValue<number>; active: boolean; framed?: boolean }) {
  const reduce = useReducedMotion();
  const moving = active && !reduce;
  const one = useMotionValue(1);
  const progress = reduce ? one : p;
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const percent = useTransform(progress, (v) => `${Math.round(v * 100)}%`);
  const Scene = SCENES[chapter.id];
  return <div className={`relative w-full h-full overflow-hidden ${framed ? "rounded-3xl" : "rounded-2xl border border-white/10"}`} style={{ backgroundColor: framed ? chapter.deep : "rgba(255,255,255,0.04)" }}>
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice">
      <defs>
        <pattern id={`${id}-hex`} width={52} height={90} patternUnits="userSpaceOnUse">
          <path d="M26 0 L52 15 V45 L26 60 L0 45 V15 Z M26 60 V90" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1.5} />
        </pattern>
        <radialGradient id={`${id}-glow`}><stop offset="0" stopColor={chapter.accent} stopOpacity={0.6} /><stop offset="1" stopColor={chapter.accent} stopOpacity={0} /></radialGradient>
      </defs>
      <motion.g animate={{ rotate: moving ? 360 : 0 }} transition={moving ? { duration: 160, repeat: Infinity, ease: "linear" } : { duration: 0.6 }}>
        <rect x={-300} y={-300} width={1200} height={1200} fill={`url(#${id}-hex)`} />
      </motion.g>
      <motion.circle cx={300} cy={300} r={330} fill={`url(#${id}-glow)`} animate={moving ? { scale: [1, 1.12, 1] } : { scale: 1 }} transition={{ duration: 5, repeat: moving ? Infinity : 0 }} />
    </svg>
    {moving && <motion.div aria-hidden="true" className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" animate={{ top: ["-20%", "110%"] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />}
    <div className="absolute inset-0 px-3 pt-14 pb-3 md:px-5 md:pt-16 md:pb-5"><Scene p={progress} active={active} /></div>
    <div className="absolute left-3 top-3 md:left-4 md:top-4 flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="w-9 h-9 -rotate-90" aria-hidden="true">
        <circle cx={20} cy={20} r={16} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={3} />
        <motion.circle cx={20} cy={20} r={16} fill="none" stroke={ORANGE} strokeWidth={3} strokeLinecap="round" style={{ pathLength: progress }} />
      </svg>
      <span className="text-white text-xs font-bold tracking-widest uppercase">Scene {String(index + 1).padStart(2, "0")} · {chapter.kicker}</span>
    </div>
    <motion.span aria-hidden="true" className="absolute right-4 bottom-3 text-white/60 text-xs font-bold tabular-nums tracking-widest">{percent}</motion.span>
  </div>;
}
