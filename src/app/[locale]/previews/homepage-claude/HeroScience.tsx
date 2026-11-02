"use client";

import { useCallback, useEffect, useRef, useState, type FocusEvent } from "react";
import Link from "next/link";
import { productPath, researchAnchor } from "@/lib/catalog";
import { useHref } from "@/i18n/LocaleProvider";

// The hero's moving background, drawn from ChemLife's own science: a chelated trace mineral (MinBioZen), a
// microencapsulated active (MethioWiz, CholiWiz), a plant compound becoming a ring through ANBioT, and a
// mycotoxin caught between clay layers (FeedGenie Prime). Each scene is also a button: hovering or focusing it
// opens a card about that science, and clicking it plays its reaction. The pointer bonds with the loose atoms
// near it. Faint and kept to the sides, so the headline stays easy to read. Reduced motion gets still frames;
// drawing pauses while the hero is off screen.

const NAVY = "48, 82, 128";
const TEAL = "15, 118, 110";
const ORANGE = "207, 65, 40";
const FONT = '600 11px "Maven Pro", system-ui, sans-serif';
const SMALL = '600 9px "Maven Pro", system-ui, sans-serif';
// MinBioZen's minerals: zinc, manganese, copper, iron (20%) and chromium (6.5%).
const IONS = ["Zn²⁺", "Mn²⁺", "Cu²⁺", "Fe²⁺", "Cr³⁺"];

type Id = "chelate" | "capsule" | "anbiot" | "binder";
interface Spot { id: Id; x: number; y: number; r: number; s: number; side: "left" | "right"; low: boolean }

/** Where the scenes sit: beside the headline on wide screens, in the top corners on narrow ones. */
function layoutFor(w: number, h: number): Spot[] {
  if (w >= 1100) {
    const s = Math.min(1.35, w / 1100);
    const lx = Math.max(130, (w - 900) / 4), rx = w - lx;
    return [
      { id: "chelate", x: lx, y: h * 0.3, r: 92 * s, s, side: "left", low: false },
      { id: "capsule", x: lx, y: h * 0.74, r: 72 * s, s, side: "left", low: true },
      { id: "anbiot", x: rx, y: h * 0.28, r: 88 * s, s, side: "right", low: false },
      { id: "binder", x: rx, y: h * 0.72, r: 96 * s, s, side: "right", low: true },
    ];
  }
  const wide = w >= 640;
  const s = wide ? 0.62 : 0.45, y = wide ? 150 : 108;
  const r = Math.max(26, 64 * s);
  return [
    { id: "chelate", x: wide ? 76 : 48, y, r, s, side: "left", low: false },
    { id: "capsule", x: w - (wide ? 70 : 36), y, r, s, side: "right", low: false },
  ];
}

const CARDS: Record<Id, { title: string; text: string; action: string; links: { label: string; product?: string; research?: string }[] }> = {
  chelate: {
    title: "Chelated trace minerals",
    text: "Zinc, manganese, copper, iron and chromium bound to hydroxy amino acids, protected through digestion so more of each mineral is absorbed.",
    action: "Click to swap the mineral",
    links: [{ label: "MinBioZen", product: "MinBioZen" }],
  },
  capsule: {
    title: "Microencapsulation",
    text: "Coatings of botanical origin carry actives past the rumen to where they are absorbed: methionine in MethioWiz, choline in CholiWiz.",
    action: "Click to release the contents",
    links: [{ label: "MethioWiz", product: "MethioWiz" }, { label: "CholiWiz", product: "CholiWiz" }],
  },
  anbiot: {
    title: "ANBioT bio-transformation",
    text: "Natural nutrient media free bioactive compounds from plants without toxic organic solvents, and turn them into functional feed actives.",
    action: "Click to start a transformation",
    links: [{ label: "The ANBioT research", research: "Accelerated Natural BioTransformation (ANBioT)" }],
  },
  binder: {
    title: "Mycotoxin binding",
    text: "A broad-spectrum binder holds aflatoxins, ochratoxins, zearalenone and deoxynivalenol so they pass through the animal instead of harming it.",
    action: "Click to bind another toxin",
    links: [{ label: "FeedGenie Prime", product: "FeedGenie Prime" }, { label: "AflaMlock", product: "AflaMlock" }],
  },
};

type Ctx = CanvasRenderingContext2D;
const rgba = (c: string, a: number) => `rgba(${c}, ${Math.max(0, Math.min(1, a))})`;
const ease = (p: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 3);

function atom(ctx: Ctx, x: number, y: number, r: number, color: string, label?: string, alpha = 0.3) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(color, alpha * 0.55); ctx.fill();
  ctx.strokeStyle = rgba(color, alpha * 1.4); ctx.lineWidth = 1.2; ctx.stroke();
  if (label) { ctx.fillStyle = rgba(color, Math.min(0.92, alpha * 2.4)); ctx.font = r < 6 ? SMALL : FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, x, y + 0.5); }
}

function bond(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color = NAVY, alpha = 0.3, width = 1.4, double = false) {
  ctx.strokeStyle = rgba(color, alpha); ctx.lineWidth = width;
  if (!double) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); return; }
  const dx = y2 - y1, dy = x1 - x2, len = Math.hypot(dx, dy) || 1, o = 1.8;
  for (const k of [-o, o]) { ctx.beginPath(); ctx.moveTo(x1 + (dx / len) * k, y1 + (dy / len) * k); ctx.lineTo(x2 + (dx / len) * k, y2 + (dy / len) * k); ctx.stroke(); }
}

function ring(ctx: Ctx, cx: number, cy: number, R: number, a0: number, color: string, alpha: number, aromatic = false) {
  const pts = Array.from({ length: 6 }, (_, k) => [cx + Math.cos(a0 + (k * Math.PI) / 3) * R, cy + Math.sin(a0 + (k * Math.PI) / 3) * R]);
  for (let k = 0; k < 6; k++) bond(ctx, pts[k][0], pts[k][1], pts[(k + 1) % 6][0], pts[(k + 1) % 6][1], color, alpha, 1.5);
  if (aromatic) { ctx.beginPath(); ctx.arc(cx, cy, R * 0.56, 0, Math.PI * 2); ctx.strokeStyle = rgba(color, alpha * 0.75); ctx.lineWidth = 1.2; ctx.stroke(); }
  return pts;
}

/** State the reactions need between frames. */
interface Live {
  ion: number; ionAt: number; ripple: number;
  release: number;
  burst: number;
  toxinAt: number; bound: number;
  glow: Record<Id, number>;
}

function caption(ctx: Ctx, text: string, x: number, y: number, a: number, show: boolean) {
  if (!show) return;
  ctx.font = FONT; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = rgba(NAVY, 0.55 + a * 0.35); ctx.fillText(text, x, y);
}

/** A metal ion held by two five-membered rings (O and N bound to it), electrons orbiting, slowly turning. */
function chelate(ctx: Ctx, sp: Spot, t: number, live: Live, show: boolean) {
  const g = live.glow.chelate, s = sp.s * (1 + g * 0.08), a = 0.32 + g * 0.18, { x, y } = sp;
  const turn = t * 0.12;
  for (const side of [0, Math.PI]) {
    const base = turn + side;
    const pts = Array.from({ length: 5 }, (_, k) => {
      const ang = base + Math.PI + (k * 2 * Math.PI) / 5;
      return [x + Math.cos(base) * 34 * s + Math.cos(ang) * 30 * s, y + Math.sin(base) * 34 * s + Math.sin(ang) * 30 * s];
    });
    pts[0] = [x, y];
    for (let k = 0; k < 5; k++) bond(ctx, pts[k][0], pts[k][1], pts[(k + 1) % 5][0], pts[(k + 1) % 5][1], k === 0 || k === 4 ? TEAL : NAVY, a, 1.4, k === 1);
    // A hydroxyl hanging off the ring, the "hydroxy" in hydroxy amino acid.
    const ox = pts[2][0] + (pts[2][0] - x) * 0.35, oy = pts[2][1] + (pts[2][1] - y) * 0.35;
    bond(ctx, pts[2][0], pts[2][1], ox, oy, TEAL, a * 0.9);
    atom(ctx, ox, oy, 6 * s, TEAL, "OH", a * 0.9);
    atom(ctx, pts[1][0], pts[1][1], 7 * s, TEAL, "O", a);
    atom(ctx, pts[4][0], pts[4][1], 7 * s, NAVY, "N", a);
    atom(ctx, pts[2][0], pts[2][1], 4.5 * s, NAVY, "C", a);
    atom(ctx, pts[3][0], pts[3][1], 4.5 * s, NAVY, "C", a);
  }
  // Electrons on two tilted orbits.
  for (const [tilt, speed] of [[0.6, 1.1], [-0.6, -0.8]] as const) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
    ctx.beginPath(); ctx.ellipse(0, 0, 24 * s, 10 * s, 0, 0, Math.PI * 2); ctx.strokeStyle = rgba(ORANGE, a * 0.45); ctx.lineWidth = 1; ctx.stroke();
    const e = t * speed * 2;
    atom(ctx, Math.cos(e) * 24 * s, Math.sin(e) * 10 * s, 2 * s, ORANGE, undefined, a * 1.3);
    ctx.restore();
  }
  // A ripple when the mineral changes.
  const rp = (t - live.ripple) / 1.2;
  if (rp >= 0 && rp < 1) { ctx.beginPath(); ctx.arc(x, y, (16 + rp * 50) * s, 0, Math.PI * 2); ctx.strokeStyle = rgba(ORANGE, 0.4 * (1 - rp)); ctx.lineWidth = 2; ctx.stroke(); }
  const pulse = 1 + Math.sin(t * 1.6) * 0.08;
  ctx.beginPath(); ctx.arc(x, y, 26 * s * pulse, 0, Math.PI * 2); ctx.fillStyle = rgba(ORANGE, 0.06 + g * 0.05); ctx.fill();
  atom(ctx, x, y, 15 * s, ORANGE, IONS[live.ion], a + 0.04);
  caption(ctx, "Chelated trace minerals", x, y + 84 * s, g, show);
}

/** A coated pellet: core, inner coat and turning outer shell. Clicked, it opens and releases what it carries. */
function capsule(ctx: Ctx, sp: Spot, t: number, live: Live, seeds: number[], show: boolean) {
  const g = live.glow.capsule, s = sp.s * (1 + g * 0.08), a = 0.32 + g * 0.18, { x, y } = sp;
  const R = 38 * s;
  const rel = (t - live.release) / 3.2;
  const opening = rel >= 0 && rel < 1 ? Math.sin(Math.min(1, rel / 0.25) * (Math.PI / 2)) * (rel > 0.75 ? (1 - rel) / 0.25 : 1) : 0;
  const gap = opening * 1.1;
  const gapAt = -Math.PI / 4;
  // Outer shell, dashed and turning; it parts where the contents leave.
  ctx.setLineDash([6 * s, 5 * s]); ctx.lineDashOffset = -t * 8;
  ctx.beginPath(); ctx.arc(x, y, R + 7 * s, gapAt + gap, gapAt - gap + Math.PI * 2); ctx.strokeStyle = rgba(TEAL, a + 0.02); ctx.lineWidth = 1.4; ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(x, y, R, gapAt + gap, gapAt - gap + Math.PI * 2); ctx.strokeStyle = rgba(NAVY, a + 0.02); ctx.lineWidth = 2.2; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, R - 6 * s, gapAt + gap, gapAt - gap + Math.PI * 2); ctx.strokeStyle = rgba(TEAL, a * 0.6); ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fillStyle = rgba(TEAL, 0.05 + g * 0.03); ctx.fill();
  seeds.forEach((seed, i) => {
    let ang = seed * 6.28 + t * (0.3 + (i % 3) * 0.12) * (i % 2 ? 1 : -1);
    let r = (0.2 + ((seed * 7) % 0.5)) * (R - 8 * s);
    let fade = 1;
    if (rel >= 0 && rel < 1 && i % 2 === 0) {
      // Half the contents leave through the opening, then drift back once it closes.
      const out = ease((rel - 0.1) / 0.5) * (rel > 0.75 ? (1 - rel) / 0.25 : 1);
      ang = ang + (gapAt - ang) * out;
      r = r + out * (R + 30 * s);
      fade = 1 - out * 0.4;
    }
    atom(ctx, x + Math.cos(ang) * r, y + Math.sin(ang) * r, (2.4 + (i % 3)) * s, i % 3 ? ORANGE : NAVY, i === 0 ? undefined : undefined, (a + 0.06) * fade);
  });
  ctx.font = SMALL; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = rgba(NAVY, a * 1.6); ctx.fillText("core", x, y + R * 0.55);
  caption(ctx, "Microencapsulation", x, y + R + 32 * s, g, show);
}

/** A veined leaf; its compounds travel along a path, change colour, and become an aromatic ring (ANBioT). */
function anbiot(ctx: Ctx, sp: Spot, t: number, live: Live, show: boolean) {
  const g = live.glow.anbiot, s = sp.s * (1 + g * 0.08), a = 0.32 + g * 0.18, { x, y } = sp;
  const lx = x - 40 * s, ly = y + 8 * s;
  const bp = (t - live.burst) / 2.4;
  const bursting = bp >= 0 && bp < 1;
  ctx.save(); ctx.translate(lx, ly); ctx.rotate(-0.5);
  const leafPulse = bursting ? 1 + Math.sin(bp * Math.PI) * 0.12 : 1;
  ctx.scale(leafPulse, leafPulse);
  ctx.beginPath(); ctx.moveTo(0, 24 * s); ctx.quadraticCurveTo(24 * s, 0, 0, -28 * s); ctx.quadraticCurveTo(-24 * s, 0, 0, 24 * s);
  ctx.fillStyle = rgba(TEAL, 0.1 + g * 0.06); ctx.fill(); ctx.strokeStyle = rgba(TEAL, a + 0.1); ctx.lineWidth = 1.4; ctx.stroke();
  bond(ctx, 0, 32 * s, 0, -22 * s, TEAL, a, 1);
  for (const k of [-12, -2, 8]) { bond(ctx, 0, k * s, 9 * s, (k - 7) * s, TEAL, a * 0.7, 0.8); bond(ctx, 0, k * s, -9 * s, (k - 7) * s, TEAL, a * 0.7, 0.8); }
  ctx.restore();
  const rx = x + 42 * s, ry = y - 16 * s, R = 20 * s;
  const p0 = [lx + 16 * s, ly - 14 * s], c = [x, y - 56 * s], p1 = [rx - R, ry];
  ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(c[0], c[1], p1[0], p1[1]);
  ctx.setLineDash([2, 5]); ctx.strokeStyle = rgba(NAVY, a * 0.9); ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
  const count = bursting ? 9 : 3, speed = bursting ? 0.8 : 0.25;
  for (let k = 0; k < count; k++) {
    const u = (t * speed + k / count) % 1;
    const px = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0];
    const py = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1];
    // Teal as it leaves the leaf, orange as it becomes a bioactive.
    atom(ctx, px, py, 3 * s, u < 0.5 ? TEAL : ORANGE, undefined, a + 0.1);
  }
  const a0 = t * 0.18;
  const hex = ring(ctx, rx, ry, R, a0, NAVY, a + 0.06, true);
  if (bursting) { ctx.beginPath(); ctx.arc(rx, ry, R + 6 * s + bp * 14 * s, 0, Math.PI * 2); ctx.strokeStyle = rgba(ORANGE, 0.35 * (1 - bp)); ctx.lineWidth = 1.6; ctx.stroke(); }
  const oh = [hex[0][0] + Math.cos(a0) * 16 * s, hex[0][1] + Math.sin(a0) * 16 * s];
  bond(ctx, hex[0][0], hex[0][1], oh[0], oh[1], TEAL, a + 0.06);
  atom(ctx, oh[0], oh[1], 8 * s, TEAL, "OH", a);
  const om = [hex[3][0] - Math.cos(a0) * 16 * s, hex[3][1] - Math.sin(a0) * 16 * s];
  bond(ctx, hex[3][0], hex[3][1], om[0], om[1], NAVY, a);
  atom(ctx, om[0], om[1], 7 * s, NAVY, "O", a * 0.9);
  caption(ctx, "ANBioT bio-transformation", x, y + 62 * s, g, show);
}

/** Two clay layers of linked tetrahedra; a toxin of three fused rings drifts in and is held between them. */
function binder(ctx: Ctx, sp: Spot, t: number, live: Live, show: boolean) {
  const g = live.glow.binder, s = sp.s * (1 + g * 0.06), a = 0.32 + g * 0.18, { x, y } = sp;
  const w = 72 * s, gap = 28 * s;
  for (const dir of [-1, 1]) {
    const ly = y + dir * gap;
    ctx.beginPath();
    for (let k = 0; k <= 24; k++) {
      const px = x - w + (k / 24) * 2 * w;
      const py = ly + Math.sin(k * 0.9 + t * 0.8) * 1.4 * s;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = rgba(NAVY, a + 0.04); ctx.lineWidth = 2.4; ctx.stroke();
    // Tetrahedra pointing away from the gap: the silica sheets of a clay.
    for (let k = 0; k < 7; k++) {
      const bx = x - w + 10 * s + (k * (2 * w - 20 * s)) / 6;
      const tip = ly + dir * 10 * s;
      bond(ctx, bx - 5 * s, ly, bx, tip, NAVY, a * 0.6, 1);
      bond(ctx, bx + 5 * s, ly, bx, tip, NAVY, a * 0.6, 1);
      atom(ctx, bx, tip, 2.4 * s, TEAL, undefined, a);
    }
  }
  // Each toxin drifts in from the right, settles, wobbles while held, then fades.
  const p = (t - live.toxinAt) / 6;
  const k = Math.max(0, Math.min(1, p));
  const settle = ease(k / 0.45);
  const mx = x + (1 - settle) * w * 1.7, my = y + (1 - settle) * -14 * s;
  const fade = k > 0.85 ? (1 - k) / 0.15 : 1;
  const wob = settle > 0.95 ? Math.sin(t * 9) * 1.4 * s : 0;
  const alpha = (a + 0.08) * fade;
  const R = 8 * s;
  // Three fused rings, roughly the shape of an aflatoxin core.
  for (const [ox, oy] of [[-R * 1.73, 0], [0, 0], [R * 1.73, 0]]) ring(ctx, mx + ox + wob, my + oy, R, Math.PI / 6, ORANGE, alpha);
  atom(ctx, mx + R * 1.73 * 1.5 + wob, my - R * 0.9, 4 * s, ORANGE, "O", alpha);
  if (settle > 0.95) { ctx.beginPath(); ctx.arc(x, y, 30 * s, 0, Math.PI * 2); ctx.strokeStyle = rgba(TEAL, 0.24 * fade); ctx.lineWidth = 1; ctx.stroke(); }
  caption(ctx, live.bound > 0 ? `Mycotoxin binding · ${live.bound} held` : "Mycotoxin binding", x, y + gap + 38 * s, g, show);
}

interface Loose { x: number; y: number; vx: number; vy: number; label: string; color: string }

export default function HeroScience({ className = "" }: { className?: string }) {
  const href = useHref();
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef<Live>({ ion: 0, ionAt: 0, ripple: -9, release: -9, burst: -9, toxinAt: 0, bound: 0, glow: { chelate: 0, capsule: 0, anbiot: 0, binder: 0 } });
  const hover = useRef<Id | null>(null);
  const clock = useRef<() => number>(() => 0);
  const redraw = useRef<() => void>(() => {});
  const [spots, setSpots] = useState<Spot[]>([]);
  const [open, setOpen] = useState<Id | null>(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(pointer: fine)").matches;
    let width = 0, height = 0, frame = 0, visible = true, layout: Spot[] = [];
    const start = performance.now() - 1500;
    const now = () => (reduce ? 1.5 : (performance.now() - start) / 1000);
    clock.current = now;
    let loose: Loose[] = [];
    const pointer = { x: 0, y: 0, inside: false };
    const seeds = Array.from({ length: 11 }, () => Math.random());

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = el.clientWidth; height = el.clientHeight;
      el.width = width * dpr; el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout = layoutFor(width, height);
      setSpots(layout);
      const labels = ["C", "O", "H", "N", "C", "O", "H", "C", "S", "P"];
      loose = Array.from({ length: width < 640 ? 6 : width < 1100 ? 10 : 22 }, (_, i) => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        label: labels[i % labels.length], color: i % 4 === 0 ? TEAL : NAVY,
      }));
    };

    const draw = (t: number) => {
      const L = live.current;
      ctx.clearRect(0, 0, width, height);
      // Glow eases towards the scene being hovered or focused.
      for (const sp of layout) {
        const near = pointer.inside && Math.hypot(pointer.x - sp.x, pointer.y - sp.y) < sp.r;
        const target = hover.current === sp.id || near ? 1 : 0;
        L.glow[sp.id] += (target - L.glow[sp.id]) * (reduce ? 1 : 0.12);
      }
      // Loose atoms; near the pointer they are nudged aside and bond to it.
      for (const p of loose) {
        if (pointer.inside && fine) {
          const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
          if (d < 150) bond(ctx, pointer.x, pointer.y, p.x, p.y, p.color, 0.22 * (1 - d / 150), 1);
        }
        atom(ctx, p.x, p.y, 7, p.color, p.label, 0.16);
      }
      if (pointer.inside && fine) { ctx.beginPath(); ctx.arc(pointer.x, pointer.y, 5, 0, Math.PI * 2); ctx.fillStyle = rgba(ORANGE, 0.25); ctx.fill(); }
      // The mineral changes every few seconds by itself, and at once when clicked.
      if (t - L.ionAt > 3.5) { L.ion = (L.ion + 1) % IONS.length; L.ionAt = t; }
      if (t - L.toxinAt > 6) L.toxinAt = t;
      const show = width >= 1100;
      for (const sp of layout) {
        if (sp.id === "chelate") chelate(ctx, sp, t, L, show);
        else if (sp.id === "capsule") capsule(ctx, sp, t, L, seeds, show);
        else if (sp.id === "anbiot") anbiot(ctx, sp, t, L, show);
        else binder(ctx, sp, t, L, show);
      }
    };
    redraw.current = () => draw(now());

    const step = () => {
      for (const p of loose) {
        if (pointer.inside && fine) {
          const dx = p.x - pointer.x, dy = p.y - pointer.y, d = Math.hypot(dx, dy);
          if (d < 90 && d > 0) { p.vx += (dx / d) * 0.03; p.vy += (dy / d) * 0.03; }
        }
        p.vx *= 0.995; p.vy *= 0.995;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp < 0.08) { p.vx *= 1.02; p.vy *= 1.02; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = width + 10; else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10; else if (p.y > height + 10) p.y = -10;
      }
      draw(now());
      frame = requestAnimationFrame(step);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
      pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= r.width && pointer.y <= r.height;
      if (reduce) draw(now());
    };
    const onLeave = () => { pointer.inside = false; if (reduce) draw(now()); };

    setup();
    draw(now());
    if (!reduce) frame = requestAnimationFrame(step);
    document.fonts?.ready.then(() => draw(now()));
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const resize = new ResizeObserver(() => { setup(); draw(now()); });
    resize.observe(el);
    const seen = new IntersectionObserver(([entry]) => {
      if (reduce) return;
      if (entry.isIntersecting && !visible) { visible = true; frame = requestAnimationFrame(step); }
      else if (!entry.isIntersecting && visible) { visible = false; cancelAnimationFrame(frame); }
    });
    seen.observe(el);
    return () => {
      cancelAnimationFrame(frame); resize.disconnect(); seen.disconnect();
      window.removeEventListener("pointermove", onMove); document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Clicking a scene plays its reaction.
  const react = useCallback((id: Id) => {
    const L = live.current, t = clock.current();
    if (id === "chelate") { L.ion = (L.ion + 1) % IONS.length; L.ionAt = t; L.ripple = t; }
    if (id === "capsule") L.release = t;
    if (id === "anbiot") L.burst = t;
    if (id === "binder") { L.toxinAt = t - 0.1; L.bound += 1; }
    redraw.current();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setPinned(false); hover.current = null; } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const show = (id: Id) => { hover.current = id; setOpen(id); };
  const hide = (id: Id) => { if (hover.current === id) hover.current = null; if (!pinned) setOpen((o) => (o === id ? null : o)); };
  const leaveGroup = (id: Id) => (e: FocusEvent<HTMLDivElement>) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) { setPinned(false); hide(id); } };

  return <div className={className}>
    <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none [mask-image:linear-gradient(to_bottom,black_70%,transparent)]" />
    {/* Each scene is a button: hover or focus shows its card, click plays its reaction. */}
    <div className="absolute inset-0 pointer-events-none z-20">
      {spots.map((sp) => {
        const card = CARDS[sp.id];
        const isOpen = open === sp.id;
        const wide = spots.length > 2;
        const cardStyle: React.CSSProperties = wide
          ? { [sp.side]: 16, ...(sp.low ? { bottom: `calc(100% - ${sp.y - sp.r}px + 8px)` } : { top: sp.y + sp.r + 8 }), width: 270 }
          : { [sp.side]: 12, top: sp.y + sp.r + 8, width: "min(270px, calc(100vw - 24px))" };
        return <div key={sp.id} onMouseEnter={() => show(sp.id)} onMouseLeave={() => hide(sp.id)} onBlur={leaveGroup(sp.id)}>
          <button type="button" aria-expanded={isOpen} aria-controls={`sci-${sp.id}`} aria-label={`${card.title}. ${card.action}.`}
            onFocus={() => show(sp.id)} onClick={() => { react(sp.id); setOpen(sp.id); setPinned(true); }}
            className="pointer-events-auto absolute rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
            style={{ left: sp.x - sp.r, top: sp.y - sp.r, width: sp.r * 2, height: sp.r * 2 }}>
            <span aria-hidden="true" className="absolute right-[24%] top-[24%] flex h-3 w-3">
              <span className="absolute inset-0 rounded-full bg-brand-orange/60 motion-safe:animate-ping" />
              <span className="relative h-3 w-3 rounded-full bg-brand-orange-aa border-2 border-white" />
            </span>
          </button>
          <div id={`sci-${sp.id}`} role="region" aria-label={card.title} hidden={!isOpen}
            className="pointer-events-auto absolute z-10 rounded-2xl bg-white/95 backdrop-blur border border-slate-200 shadow-xl shadow-brand-navy/10 p-4 text-left" style={cardStyle}>
            <p className="font-heading font-bold text-brand-navy">{card.title}</p>
            <p className="text-sm text-slate-600 leading-relaxed mt-1">{card.text}</p>
            <p className="text-xs font-semibold text-teal-aa mt-2">{card.action}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {card.links.map((l) => <Link key={l.label} href={l.product ? href(productPath(l.product)) : href(`/research#${researchAnchor(l.research!)}`)}
                className="inline-flex items-center min-h-8 text-sm font-semibold text-brand-orange-aa hover:underline">{l.label} →</Link>)}
            </div>
          </div>
        </div>;
      })}
    </div>
  </div>;
}
