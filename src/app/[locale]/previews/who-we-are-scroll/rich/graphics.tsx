"use client";

import { useEffect, useId, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import type { ChapterId } from "./content";

const NAVY = "#2f4f7f";
const ORANGE = "#d4462a";
const TEAL = "#14a08f";
const GOLD = "#e0a020";
const GREEN = "#3f9142";
const MIST = "#dbe3ee";
const easeOut = [0.25, 0.1, 0, 1] as const;

type G = { play: boolean };

/** A number that counts up from zero the first time `play` turns on. */
export function Counter({ to, play, duration = 1.4 }: { to: number; play: boolean; duration?: number }) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reduce) { setValue(to); return; }
    if (!play) return;
    const controls = animate(0, to, { duration, ease: easeOut, onUpdate: (v) => setValue(Math.round(v)), onComplete: () => setValue(to) });
    return () => controls.stop();
  }, [play, to, duration, reduce]);
  return <>{value}</>;
}

// Shared timing: loops only run while the chapter is on screen and motion is allowed.
function useLoop(play: boolean) {
  const reduce = useReducedMotion();
  const on = play || !!reduce;
  const moving = play && !reduce;
  const loop = (duration: number, delay = 0) => (moving ? { duration, delay, repeat: Infinity, ease: "linear" as const } : { duration: 0 });
  return { on, moving, loop };
}

const svgProps = { viewBox: "0 0 400 300", className: "w-full h-full", "aria-hidden": true } as const;

/** Who we are: the three species circle ChemLife, with the leadership's combined years at the centre. */
function Orbit({ play }: G) {
  const { on, moving, loop } = useLoop(play);
  const species = ["Poultry", "Dairy", "Swine"];
  return <svg {...svgProps}>
    <circle cx={200} cy={150} r={112} fill="none" stroke={MIST} strokeWidth={2} strokeDasharray="4 8" />
    <circle cx={200} cy={150} r={74} fill="none" stroke={MIST} strokeWidth={2} />
    {[0, 1, 2].map((i) => <motion.circle key={i} cx={200} cy={150} r={52} fill="none" stroke={ORANGE} strokeWidth={2} initial={{ opacity: 0 }}
      animate={moving ? { scale: [1, 2.2], opacity: [0.45, 0] } : { opacity: 0 }} transition={{ duration: 3, delay: i, repeat: Infinity, ease: "easeOut" }} />)}
    <motion.g animate={{ rotate: moving ? 360 : 0 }} transition={loop(40)}>
      {/* Invisible, so the group turns about the centre. */}
      <circle cx={200} cy={150} r={142} fill="none" />
      {species.map((name, i) => {
        const a = ((i * 120 - 90) * Math.PI) / 180;
        const x = 200 + 112 * Math.cos(a), y = 150 + 112 * Math.sin(a);
        return <motion.g key={name} animate={{ rotate: moving ? -360 : 0 }} transition={loop(40)}>
          <motion.circle cx={x} cy={y} r={31} fill="#fff" stroke={NAVY} strokeWidth={2} initial={{ scale: 0 }} animate={{ scale: on ? 1 : 0 }} transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.3 + i * 0.15 }} />
          <text x={x} y={y + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill={NAVY}>{name}</text>
        </motion.g>;
      })}
    </motion.g>
    <motion.circle cx={200} cy={150} r={52} fill={NAVY} initial={{ scale: 0 }} animate={{ scale: on ? 1 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} />
    <text x={200} y={152} textAnchor="middle" fill="#fff" fontSize={30} fontWeight={800}><Counter to={106} play={play} /></text>
    <text x={200} y={172} textAnchor="middle" fill="#fff" fontSize={11} opacity={0.85}>years combined</text>
  </svg>;
}

/** What we make: three platforms as vials filling up, each topped with its flagship product. */
function Vials({ play }: G) {
  const { on, moving } = useLoop(play);
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const vials = [
    { lines: ["Feed", "hygiene"], product: "MaxDmold", color: ORANGE, level: 0.82 },
    { lines: ["Bio-trace", "minerals"], product: "MinBioZen", color: TEAL, level: 0.64 },
    { lines: ["Rumen-", "bypass"], product: "MethioWiz", color: NAVY, level: 0.74 },
  ];
  return <svg {...svgProps}>
    {vials.map((vial, i) => {
      const cx = 90 + i * 110;
      return <g key={vial.product}>
        <defs><clipPath id={`${id}-v${i}`}><rect x={cx - 32} y={44} width={64} height={176} rx={32} /></clipPath></defs>
        <rect x={cx - 32} y={44} width={64} height={176} rx={32} fill="#f5f8fb" stroke={MIST} strokeWidth={3} />
        <g clipPath={`url(#${id}-v${i})`}>
          <motion.rect x={cx - 32} y={44} width={64} height={176} fill={vial.color} style={{ originY: 1 }} initial={{ scaleY: 0 }}
            animate={{ scaleY: on ? vial.level : 0 }} transition={{ duration: 1.3, delay: i * 0.2, ease: easeOut }} />
          {moving && [0, 1, 2, 3].map((b) => <motion.circle key={b} cx={cx - 14 + b * 9} r={3 + (b % 2)} fill="#fff" fillOpacity={0.6}
            initial={{ cy: 214 }} animate={{ cy: [214, 220 - 176 * vial.level + 8], opacity: [0, 1, 0] }}
            transition={{ duration: 2.2, delay: 1.2 + b * 0.5 + i * 0.3, repeat: Infinity, ease: "easeOut" }} />)}
        </g>
        <motion.text x={cx} y={30} textAnchor="middle" fontSize={13} fontWeight={800} fill={vial.color} initial={{ opacity: 0, y: -8 }}
          animate={on ? { opacity: 1, y: 0 } : {}} transition={{ delay: 1 + i * 0.2, duration: 0.5 }}>{vial.product}</motion.text>
        <text x={cx} y={246} textAnchor="middle" fontSize={13} fontWeight={700} fill={NAVY}>
          <tspan x={cx} dy={0}>{vial.lines[0]}</tspan><tspan x={cx} dy={16}>{vial.lines[1]}</tspan>
        </text>
      </g>;
    })}
  </svg>;
}

/** Technologies: a plant leaf becomes a bioactive molecule through ANBioT, then a coated, targeted additive. */
function TechFlow({ play }: G) {
  const { on, moving, loop } = useLoop(play);
  const links = ["M146 120 Q 166 96 182 124", "M250 124 Q 272 154 292 128"];
  const hex = Array.from({ length: 6 }, (_, k) => { const a = ((60 * k - 30) * Math.PI) / 180; return [216 + 36 * Math.cos(a), 128 + 36 * Math.sin(a)]; });
  return <svg {...svgProps}>
    <motion.path d="M48 196 C 38 128 86 70 150 60 C 150 150 104 202 48 196 Z" fill={TEAL} fillOpacity={0.1} stroke={TEAL} strokeWidth={3} strokeLinejoin="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={{ duration: 1.1, ease: easeOut }} />
    <motion.path d="M36 212 L48 196 C 84 156 120 110 150 60" fill="none" stroke={TEAL} strokeWidth={3} strokeLinecap="round"
      initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={{ duration: 1, delay: 0.3, ease: easeOut }} />
    {links.map((d, i) => <g key={d}>
      <motion.path d={d} fill="none" stroke={NAVY} strokeOpacity={0.35} strokeWidth={2.5} strokeDasharray="3 6"
        initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={{ duration: 0.6, delay: 0.9 + i * 0.8 }} />
      {moving && <circle r={4} fill={ORANGE}><animateMotion dur="1.6s" begin={`${1.5 + i * 0.8}s`} repeatCount="indefinite" path={d} /></circle>}
    </g>)}
    <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={on ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.6, delay: 1.2, ease: easeOut }}>
      <motion.g animate={{ rotate: moving ? 360 : 0 }} transition={loop(18)}>
        <circle cx={216} cy={128} r={48} fill="none" />
        <polygon points={hex.map((p) => p.join(",")).join(" ")} fill="#fff" stroke={NAVY} strokeWidth={3} />
        <circle cx={216} cy={128} r={16} fill="none" stroke={NAVY} strokeWidth={2.5} />
        {hex.filter((_, k) => k % 2 === 0).map(([x, y]) => <circle key={`${x}`} cx={x} cy={y} r={6} fill={ORANGE} />)}
      </motion.g>
    </motion.g>
    <g>
      <motion.circle cx={334} cy={128} r={44} fill="none" stroke={NAVY} strokeOpacity={0.4} strokeWidth={2.5} strokeDasharray="4 7"
        initial={{ scale: 0 }} animate={{ scale: on ? 1 : 0, rotate: moving ? 360 : 0 }} transition={{ scale: { delay: 2, duration: 0.5 }, rotate: loop(14) }} />
      {[32, 22].map((r, k) => <motion.circle key={r} cx={334} cy={128} r={r} fill="none" stroke={GOLD} strokeWidth={4}
        initial={{ scale: 0 }} animate={{ scale: on ? (moving ? [1, 1.06, 1] : 1) : 0 }} transition={{ delay: 1.9 - k * 0.1, duration: moving ? 2.4 : 0.4, repeat: moving ? Infinity : 0 }} />)}
      <motion.circle cx={334} cy={128} r={12} fill={ORANGE} initial={{ scale: 0 }} animate={{ scale: on ? 1 : 0 }} transition={{ delay: 1.8, type: "spring", stiffness: 260, damping: 12 }} />
    </g>
    {[["Plant", 92], ["ANBioT", 216], ["Additive", 334]].map(([label, x], i) => <motion.text key={label} x={x} y={232} textAnchor="middle" fontSize={15} fontWeight={800} fill={i === 1 ? ORANGE : NAVY}
      initial={{ opacity: 0 }} animate={{ opacity: on ? 1 : 0 }} transition={{ delay: 0.6 + i * 0.7 }}>{label}</motion.text>)}
    {[["Ayurvedic botanicals", 92], ["bio-transformation", 216], ["coated for release", 334]].map(([label, x], i) => <motion.text key={label} x={x} y={252} textAnchor="middle" fontSize={11} fill="#64748b"
      initial={{ opacity: 0 }} animate={{ opacity: on ? 1 : 0 }} transition={{ delay: 0.7 + i * 0.7 }}>{label}</motion.text>)}
  </svg>;
}

/** Feed hygiene: mould spores drift in and bounce off a shield over the grain. */
function Shield({ play }: G) {
  const { on, moving } = useLoop(play);
  const grains: [number, number][] = [];
  [[238, 120, 280], [226, 136, 264], [214, 152, 248], [202, 168, 232], [190, 184, 216]].forEach(([y, from, to]) => { for (let x = from; x <= to; x += 16) grains.push([x, y]); });
  const spores = [[40, 70], [130, 28], [290, 24], [370, 84], [26, 168], [376, 170]].map(([sx, sy]) => {
    const dx = sx - 200, dy = sy - 250, len = Math.hypot(dx, dy);
    return { sx, sy, tx: 200 + (dx / len) * 122, ty: 250 + (dy / len) * 122 };
  });
  return <svg {...svgProps}>
    <line x1={60} y1={250} x2={340} y2={250} stroke={MIST} strokeWidth={3} strokeLinecap="round" />
    {grains.map(([x, y], i) => <motion.ellipse key={`${x}-${y}`} cx={x} cy={y} rx={9} ry={6} fill={i % 3 ? GOLD : "#f2be4a"}
      initial={{ opacity: 0, y: -20 }} animate={on ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.02, duration: 0.4 }} />)}
    <motion.path d="M88 250 A112 112 0 0 1 312 250" fill={TEAL} fillOpacity={0.08} stroke={TEAL} strokeWidth={4}
      initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={{ duration: 1.2, delay: 0.4, ease: easeOut }} />
    {moving && <motion.path d="M88 250 A112 112 0 0 1 312 250" fill="none" stroke={TEAL} strokeWidth={14} strokeOpacity={0.15}
      animate={{ strokeOpacity: [0.05, 0.25, 0.05] }} transition={{ duration: 2.4, repeat: Infinity }} />}
    <text x={200} y={176} textAnchor="middle" fontSize={12} fontWeight={800} fill={TEAL}>MaxDmold · FeedGenie Prime</text>
    {spores.map((s, i) => <motion.g key={i} initial={{ x: 0, y: 0, opacity: 0 }}
      animate={moving ? { x: [0, s.tx - s.sx, 0], y: [0, s.ty - s.sy, 0], opacity: [0, 1, 1, 0.2] } : { opacity: on ? 1 : 0 }}
      transition={{ duration: 3.2, delay: 1.2 + i * 0.45, repeat: Infinity, ease: "easeInOut" }}>
      <circle cx={s.sx} cy={s.sy} r={8} fill={GREEN} />
      <circle cx={s.sx - 4} cy={s.sy - 9} r={3} fill={GREEN} />
      <circle cx={s.sx + 7} cy={s.sy - 5} r={2.5} fill={GREEN} />
    </motion.g>)}
    <text x={200} y={18} textAnchor="middle" fontSize={12} fontWeight={700} fill={GREEN}>Mould and mycotoxins, kept out</text>
  </svg>;
}

/** Proof: four seals stamp in, one after another. */
function Seals({ play }: G) {
  const { on, moving, loop } = useLoop(play);
  const seals = [
    { top: "FAMI-QS", bottom: "certified", color: NAVY },
    { top: "TDB · DST", bottom: "supported, 2023", color: TEAL },
    { top: "K-SAP BIO 50", bottom: "C-CAMP, 2020-21", color: ORANGE },
    { top: "Since 2018", bottom: "Huvepharma partner", color: GOLD },
  ];
  return <svg {...svgProps}>
    {seals.map((seal, i) => {
      const cx = i % 2 ? 292 : 108, cy = i < 2 ? 82 : 218;
      return <motion.g key={seal.top} initial={{ scale: 1.8, opacity: 0, rotate: -25 }} animate={on ? { scale: 1, opacity: 1, rotate: 0 } : {}}
        transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.2 + i * 0.35 }}>
        <circle cx={cx} cy={cy} r={62} fill="#fff" stroke={seal.color} strokeWidth={3} />
        <motion.g animate={{ rotate: moving ? 360 : 0 }} transition={loop(20 + i * 4)}>
          <circle cx={cx} cy={cy} r={53} fill="none" stroke={seal.color} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" />
        </motion.g>
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize={seal.top.length > 9 ? 14 : 18} fontWeight={800} fill={seal.color}>{seal.top}</text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize={10.5} fill="#64748b">{seal.bottom}</text>
        <path d={`M${cx - 10} ${cy - 30} l7 7 l13 -14`} fill="none" stroke={seal.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </motion.g>;
    })}
  </svg>;
}

function Building({ x, y, kind }: { x: number; y: number; kind: "factory" | "warehouse" | "barn" }) {
  const d = kind === "factory" ? "M-15 12 V-2 L-7 3 V-2 L1 3 V-13 H8 V12 Z" : kind === "warehouse" ? "M-15 12 V-4 L0 -13 L15 -4 V12 Z M-8 12 V2 H8 V12 M-8 6 H8" : "M-14 12 V-2 L0 -13 L14 -2 V12 Z M-5 12 V3 H5 V12";
  return <g transform={`translate(${x} ${y})`}>
    <circle r={28} fill="#fff" stroke={NAVY} strokeWidth={2.5} />
    <path d={d} fill="none" stroke={NAVY} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
  </g>;
}

/** Delivery: a truck runs the route from the Doddaballapura plant through the warehouses to the farm. */
function Route({ play }: G) {
  const { on, moving } = useLoop(play);
  const path = "M56 214 C 126 214 130 92 200 92 S 274 214 344 214";
  return <svg {...svgProps}>
    <path d={path} fill="none" stroke={MIST} strokeWidth={10} strokeLinecap="round" />
    <motion.path d={path} fill="none" stroke={ORANGE} strokeWidth={4} strokeLinecap="round" strokeDasharray="10 10"
      initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={{ duration: 1.6, ease: easeOut }} />
    {moving && <g>
      <animateMotion dur="4.5s" repeatCount="indefinite" rotate="auto" path={path} />
      <g transform="translate(-16 -16)">
        <rect x={0} y={4} width={20} height={14} rx={2} fill={NAVY} />
        <path d="M20 8 H27 L31 13 V18 H20 Z" fill={ORANGE} />
        <circle cx={7} cy={20} r={3.5} fill="#1e293b" /><circle cx={25} cy={20} r={3.5} fill="#1e293b" />
      </g>
    </g>}
    {([[56, 214, "factory", "Doddaballapura"], [200, 92, "warehouse", "Warehouses"], [344, 214, "barn", "Farms"]] as const).map(([x, y, kind, label], i) =>
      <motion.g key={label} initial={{ opacity: 0, y: 10 }} animate={on ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.5 }}>
        <Building x={x} y={y} kind={kind} />
        <text x={x} y={i === 1 ? y - 40 : y + 50} textAnchor="middle" fontSize={13} fontWeight={800} fill={NAVY}>{label}</text>
      </motion.g>)}
    <motion.text x={200} y={286} textAnchor="middle" fontSize={11.5} fill="#64748b" initial={{ opacity: 0 }} animate={{ opacity: on ? 1 : 0 }} transition={{ delay: 1.8 }}>
      Direct, or through distributor channels
    </motion.text>
  </svg>;
}

/** Leadership: four directors' years, filling rings around the combined total. */
function Rings({ play }: G) {
  const { on } = useLoop(play);
  const rings = [
    { years: 30, label: "Nutraceuticals", color: ORANGE, x: 78, y: 76 },
    { years: 23, label: "R&D", color: TEAL, x: 322, y: 76 },
    { years: 15, label: "Finance & HR", color: GOLD, x: 78, y: 214 },
    { years: 38, label: "Commercial", color: NAVY, x: 322, y: 214 },
  ];
  return <svg {...svgProps}>
    {rings.map((ring, i) => <motion.line key={ring.label} x1={200} y1={150} x2={ring.x} y2={ring.y} stroke={MIST} strokeWidth={2} strokeDasharray="3 6"
      initial={{ pathLength: 0 }} animate={{ pathLength: on ? 1 : 0 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }} />)}
    <motion.circle cx={200} cy={150} r={56} fill={NAVY} initial={{ scale: 0 }} animate={{ scale: on ? 1 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} />
    <text x={200} y={154} textAnchor="middle" fill="#fff" fontSize={32} fontWeight={800}><Counter to={106} play={play} duration={1.8} /></text>
    <text x={200} y={174} textAnchor="middle" fill="#fff" fontSize={11} opacity={0.85}>years combined</text>
    {rings.map((ring, i) => <g key={ring.label}>
      <circle cx={ring.x} cy={ring.y} r={38} fill="#fff" stroke={MIST} strokeWidth={8} />
      <motion.circle cx={ring.x} cy={ring.y} r={38} fill="none" stroke={ring.color} strokeWidth={8} strokeLinecap="round" transform={`rotate(-90 ${ring.x} ${ring.y})`}
        initial={{ pathLength: 0 }} animate={{ pathLength: on ? ring.years / 40 : 0 }} transition={{ duration: 1.4, delay: 0.3 + i * 0.15, ease: easeOut }} />
      <text x={ring.x} y={ring.y + 7} textAnchor="middle" fontSize={20} fontWeight={800} fill={NAVY}><Counter to={ring.years} play={play} /></text>
      <text x={ring.x} y={ring.y + 58} textAnchor="middle" fontSize={12} fontWeight={700} fill={NAVY}>{ring.label}</text>
    </g>)}
  </svg>;
}

const GRAPHICS: Record<ChapterId, (props: G) => React.ReactElement> = { intro: Orbit, make: Vials, tech: TechFlow, hygiene: Shield, proof: Seals, delivery: Route, leaders: Rings };

export function ChapterGraphic({ id, play }: { id: ChapterId; play: boolean }) {
  const Graphic = GRAPHICS[id];
  return <Graphic play={play} />;
}
