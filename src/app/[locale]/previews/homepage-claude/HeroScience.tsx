"use client";

import { useEffect, useRef } from "react";

// The hero's moving background, drawn from ChemLife's own science: a chelated trace mineral (MinBioZen), a
// microencapsulated active (MethioWiz, CholiWiz), a plant compound becoming a ring through ANBioT, and a
// mycotoxin caught between clay layers (FeedGenie). Faint, at the sides, so the headline stays easy to read.
// Reduced motion gets one still frame; it pauses while off screen.

const NAVY = "48, 82, 128";
const TEAL = "15, 118, 110";
const ORANGE = "207, 65, 40";
const FONT = '600 11px "Maven Pro", system-ui, sans-serif';
const IONS = ["Zn²⁺", "Cu²⁺", "Fe²⁺", "Mn²⁺"];

type Ctx = CanvasRenderingContext2D;
const rgba = (c: string, a: number) => `rgba(${c}, ${a})`;

function atom(ctx: Ctx, x: number, y: number, r: number, color: string, label?: string, alpha = 0.3) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = rgba(color, alpha * 0.55); ctx.fill();
  ctx.strokeStyle = rgba(color, alpha * 1.4); ctx.lineWidth = 1.2; ctx.stroke();
  if (label) { ctx.fillStyle = rgba(color, Math.min(0.9, alpha * 2.4)); ctx.font = FONT; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, x, y + 0.5); }
}

function bond(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color = NAVY, alpha = 0.3, width = 1.4) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = rgba(color, alpha); ctx.lineWidth = width; ctx.stroke();
}

let captions = true;
function caption(ctx: Ctx, text: string, x: number, y: number) {
  if (!captions) return;
  ctx.font = FONT; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = rgba(NAVY, 0.55); ctx.fillText(text, x, y);
}

/** A metal ion held by two five-membered rings (O and N bound to the ion), slowly turning. */
function chelate(ctx: Ctx, x: number, y: number, s: number, t: number) {
  const turn = t * 0.12;
  for (const side of [0, Math.PI]) {
    const a = turn + side;
    // Pentagon with the ion at one vertex.
    const pts = Array.from({ length: 5 }, (_, k) => {
      const ang = a + Math.PI + (k * 2 * Math.PI) / 5;
      return [x + Math.cos(a) * 34 * s + Math.cos(ang) * 30 * s, y + Math.sin(a) * 34 * s + Math.sin(ang) * 30 * s];
    });
    pts[0] = [x, y];
    for (let k = 0; k < 5; k++) bond(ctx, pts[k][0], pts[k][1], pts[(k + 1) % 5][0], pts[(k + 1) % 5][1], k === 0 || k === 4 ? TEAL : NAVY, 0.32);
    atom(ctx, pts[1][0], pts[1][1], 7 * s, TEAL, "O");
    atom(ctx, pts[4][0], pts[4][1], 7 * s, NAVY, "N");
    atom(ctx, pts[2][0], pts[2][1], 4 * s, NAVY);
    atom(ctx, pts[3][0], pts[3][1], 4 * s, NAVY);
  }
  const pulse = 1 + Math.sin(t * 1.6) * 0.08;
  ctx.beginPath(); ctx.arc(x, y, 26 * s * pulse, 0, Math.PI * 2); ctx.fillStyle = rgba(ORANGE, 0.06); ctx.fill();
  const which = Math.floor(t / 3) % IONS.length;
  atom(ctx, x, y, 15 * s, ORANGE, IONS[which], 0.36);
  caption(ctx, "Chelated trace minerals", x, y + 82 * s);
}

/** A coated pellet: a double shell turning, with the active ingredient moving inside. */
function capsule(ctx: Ctx, x: number, y: number, s: number, t: number, seeds: number[]) {
  const R = 38 * s;
  ctx.setLineDash([6 * s, 5 * s]); ctx.lineDashOffset = -t * 8;
  ctx.beginPath(); ctx.arc(x, y, R + 6 * s, 0, Math.PI * 2); ctx.strokeStyle = rgba(TEAL, 0.34); ctx.lineWidth = 1.4; ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.strokeStyle = rgba(NAVY, 0.34); ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fillStyle = rgba(TEAL, 0.05); ctx.fill();
  seeds.forEach((seed, i) => {
    const a = seed * 6.28 + t * (0.3 + (i % 3) * 0.12) * (i % 2 ? 1 : -1);
    const r = (0.25 + ((seed * 7) % 0.55)) * R;
    atom(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, (2.2 + (i % 3)) * s, i % 3 ? ORANGE : NAVY, undefined, 0.36);
  });
  caption(ctx, "Microencapsulation", x, y + R + 30 * s);
}

/** A leaf; its compounds travel along a path and become an aromatic ring (ANBioT). */
function anbiot(ctx: Ctx, x: number, y: number, s: number, t: number) {
  const lx = x - 38 * s, ly = y + 6 * s;
  ctx.save(); ctx.translate(lx, ly); ctx.rotate(-0.5);
  ctx.beginPath(); ctx.moveTo(0, 22 * s); ctx.quadraticCurveTo(22 * s, 0, 0, -26 * s); ctx.quadraticCurveTo(-22 * s, 0, 0, 22 * s);
  ctx.fillStyle = rgba(TEAL, 0.1); ctx.fill(); ctx.strokeStyle = rgba(TEAL, 0.42); ctx.lineWidth = 1.4; ctx.stroke();
  bond(ctx, 0, 30 * s, 0, -20 * s, TEAL, 0.35, 1);
  ctx.restore();
  const rx = x + 40 * s, ry = y - 14 * s, R = 20 * s;
  // The path from leaf to ring, with dots travelling along it.
  const p0 = [lx + 16 * s, ly - 12 * s], c = [x, y - 52 * s], p1 = [rx - R, ry];
  ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(c[0], c[1], p1[0], p1[1]);
  ctx.setLineDash([2, 5]); ctx.strokeStyle = rgba(NAVY, 0.3); ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
  for (let k = 0; k < 3; k++) {
    const u = (t * 0.25 + k / 3) % 1;
    const px = (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0];
    const py = (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1];
    atom(ctx, px, py, 3 * s, ORANGE, undefined, 0.4);
  }
  // Aromatic ring with an OH group, turning slowly.
  const a0 = t * 0.18;
  const hex = Array.from({ length: 6 }, (_, k) => [rx + Math.cos(a0 + (k * Math.PI) / 3) * R, ry + Math.sin(a0 + (k * Math.PI) / 3) * R]);
  for (let k = 0; k < 6; k++) bond(ctx, hex[k][0], hex[k][1], hex[(k + 1) % 6][0], hex[(k + 1) % 6][1], NAVY, 0.38, 1.6);
  ctx.beginPath(); ctx.arc(rx, ry, R * 0.55, 0, Math.PI * 2); ctx.strokeStyle = rgba(NAVY, 0.26); ctx.lineWidth = 1.2; ctx.stroke();
  const oh = [hex[0][0] + Math.cos(a0) * 16 * s, hex[0][1] + Math.sin(a0) * 16 * s];
  bond(ctx, hex[0][0], hex[0][1], oh[0], oh[1], TEAL, 0.38);
  atom(ctx, oh[0], oh[1], 8 * s, TEAL, "OH", 0.32);
  caption(ctx, "ANBioT bio-transformation", x, y + 60 * s);
}

/** Two clay layers; a toxin molecule drifts in and is held between them, then the cycle repeats. */
function binder(ctx: Ctx, x: number, y: number, s: number, t: number) {
  const w = 70 * s, gap = 26 * s;
  for (const dy of [-gap, gap]) {
    ctx.beginPath();
    for (let k = 0; k <= 20; k++) {
      const px = x - w + (k / 20) * 2 * w;
      const py = y + dy + Math.sin(k * 0.9 + t * 0.8) * 1.6 * s;
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.strokeStyle = rgba(NAVY, 0.36); ctx.lineWidth = 2.4; ctx.stroke();
    for (let k = 0; k < 7; k++) atom(ctx, x - w + 10 * s + k * (2 * w - 20 * s) / 6, y + dy, 2.2 * s, NAVY, undefined, 0.32);
  }
  // 6-second cycle: drift in from the right, settle, hold, fade.
  const p = (t % 6) / 6;
  const inX = x + w * 1.6 - Math.min(1, p / 0.45) * w * 1.6;
  const settle = 1 - Math.pow(1 - Math.min(1, p / 0.45), 3);
  const mx = x + (1 - settle) * w * 1.6, my = y;
  const fade = p > 0.85 ? (1 - p) / 0.15 : 1;
  const alpha = 0.36 * fade;
  void inX;
  const R = 9 * s;
  for (const off of [-R * 0.87, R * 0.87]) {
    const hx = mx + off, a0 = Math.PI / 6;
    const hex = Array.from({ length: 6 }, (_, k) => [hx + Math.cos(a0 + (k * Math.PI) / 3) * R, my + Math.sin(a0 + (k * Math.PI) / 3) * R]);
    for (let k = 0; k < 6; k++) bond(ctx, hex[k][0], hex[k][1], hex[(k + 1) % 6][0], hex[(k + 1) % 6][1], ORANGE, alpha, 1.5);
  }
  if (settle > 0.95) { ctx.beginPath(); ctx.arc(mx, my, 24 * s, 0, Math.PI * 2); ctx.strokeStyle = rgba(TEAL, 0.22 * fade); ctx.lineWidth = 1; ctx.stroke(); }
  caption(ctx, "Mycotoxin binding", x, y + gap + 36 * s);
}

interface Loose { x: number; y: number; vx: number; vy: number; label: string; color: string }

export default function HeroScience() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, frame = 0, visible = true, start = performance.now();
    let loose: Loose[] = [];
    const seeds = Array.from({ length: 9 }, () => Math.random());

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = el.clientWidth; height = el.clientHeight;
      el.width = width * dpr; el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const labels = ["C", "O", "H", "N", "C", "O", "H", "C"];
      loose = Array.from({ length: width < 640 ? 6 : width < 1100 ? 10 : 18 }, (_, i) => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        label: labels[i % labels.length], color: i % 4 === 0 ? TEAL : NAVY,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const a of loose) atom(ctx, a.x, a.y, 7, a.color, a.label, 0.16);
      captions = width >= 1100;
      if (width >= 1100) {
        // Desktop: two motifs each side, in the space beside the centred headline.
        const s = Math.min(1.35, width / 1100);
        const lx = Math.max(120, (width - 900) / 4), rx = width - lx;
        chelate(ctx, lx, height * 0.3, s, t);
        capsule(ctx, lx, height * 0.74, s, t, seeds);
        anbiot(ctx, rx, height * 0.28, s, t);
        binder(ctx, rx, height * 0.72, s, t);
      } else {
        // Tablets and phones: two small motifs in the empty top corners, clear of the text.
        const s = width >= 640 ? 0.62 : 0.45;
        const y = width >= 640 ? 150 : 108;
        chelate(ctx, width >= 640 ? 70 : 38, y, s, t);
        capsule(ctx, width - (width >= 640 ? 70 : 36), y, s, t, seeds);
      }
    };

    const step = (now: number) => {
      const t = (now - start) / 1000;
      for (const a of loose) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < -10) a.x = width + 10; else if (a.x > width + 10) a.x = -10;
        if (a.y < -10) a.y = height + 10; else if (a.y > height + 10) a.y = -10;
      }
      draw(t);
      frame = requestAnimationFrame(step);
    };

    setup();
    draw(1.5);
    if (!reduce) frame = requestAnimationFrame(step);
    // Redraw once the font is ready, so the element labels use it.
    document.fonts?.ready.then(() => { if (reduce) draw(1.5); });

    const resize = new ResizeObserver(() => { setup(); draw((performance.now() - start) / 1000); });
    resize.observe(el);
    const seen = new IntersectionObserver(([entry]) => {
      if (reduce) return;
      if (entry.isIntersecting && !visible) { visible = true; start = performance.now() - 1500; frame = requestAnimationFrame(step); }
      else if (!entry.isIntersecting && visible) { visible = false; cancelAnimationFrame(frame); }
    });
    seen.observe(el);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); seen.disconnect(); };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />;
}
