"use client";

import { useEffect, useRef } from "react";

// The hero's moving background: molecules drifting slowly and linking up when they come near, with a few
// hexagonal rings turning in place. Drawn faintly on a canvas so the headline stays easy to read. Visitors who
// ask for reduced motion get one still frame; it pauses while it's off screen.

const NAVY = "48, 82, 128";
const TEAL = "15, 118, 110";
const ORANGE = "207, 65, 40";

interface Node { x: number; y: number; vx: number; vy: number; r: number; color: string }
interface Ring { x: number; y: number; size: number; angle: number; spin: number; color: string }

export default function HeroMolecules() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0, height = 0, frame = 0, visible = true;
    let nodes: Node[] = [];
    let rings: Ring[] = [];

    const pick = (i: number) => (i % 7 === 0 ? ORANGE : i % 3 === 0 ? TEAL : NAVY);
    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = el.clientWidth; height = el.clientHeight;
      el.width = width * dpr; el.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(26, (width * height) / 16000)));
      nodes = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        r: 1.6 + Math.random() * 2.4, color: pick(i),
      }));
      // Rings sit towards the sides, away from the centred headline.
      const spots = [[0.1, 0.25], [0.88, 0.2], [0.14, 0.78], [0.86, 0.72], [0.5, 0.95]];
      const phone = width < 640 ? [[0.08, 0.6], [0.93, 0.52]] : spots;
      rings = phone.map(([fx, fy], i) => ({
        x: fx * width, y: fy * height, size: 26 + (i % 3) * 12, angle: Math.random() * Math.PI,
        spin: (i % 2 ? 1 : -1) * 0.0018, color: i % 2 ? TEAL : NAVY,
      }));
    };

    const hexagon = (ring: Ring) => {
      ctx.beginPath();
      for (let k = 0; k <= 6; k++) {
        const a = ring.angle + (k * Math.PI) / 3;
        const px = ring.x + Math.cos(a) * ring.size, py = ring.y + Math.sin(a) * ring.size;
        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `rgba(${ring.color}, 0.16)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      for (let k = 0; k < 6; k += 2) {
        const a = ring.angle + (k * Math.PI) / 3;
        ctx.beginPath();
        ctx.arc(ring.x + Math.cos(a) * ring.size, ring.y + Math.sin(a) * ring.size, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ring.color}, 0.28)`;
        ctx.fill();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const link = Math.min(150, width / 7);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < link) {
            ctx.strokeStyle = `rgba(${NAVY}, ${0.14 * (1 - d / link)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${n.color}, 0.34)`;
        ctx.fill();
      }
      rings.forEach(hexagon);
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -10) n.x = width + 10; else if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10; else if (n.y > height + 10) n.y = -10;
      }
      for (const r of rings) r.angle += r.spin;
      draw();
      frame = requestAnimationFrame(step);
    };

    setup();
    draw();
    if (!reduce) frame = requestAnimationFrame(step);

    const resize = new ResizeObserver(() => { setup(); draw(); });
    resize.observe(el);
    const seen = new IntersectionObserver(([entry]) => {
      if (reduce) return;
      if (entry.isIntersecting && !visible) { visible = true; frame = requestAnimationFrame(step); }
      else if (!entry.isIntersecting && visible) { visible = false; cancelAnimationFrame(frame); }
    });
    seen.observe(el);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); seen.disconnect(); };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none" />;
}
