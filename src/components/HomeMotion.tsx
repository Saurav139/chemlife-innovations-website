"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { REVEAL_VIEWPORT } from "@/lib/reveal";

// The homepage's motion graphics. Everything here is decoration: the page reads the same with it switched off, and
// visitors who ask for less motion get the still version.

export const easeOut = [0.25, 0.1, 0, 1] as const;

// Decorations draw themselves once they are properly on screen (content reveals start earlier: see REVEAL_VIEWPORT).
const ON_SCREEN = { once: true, amount: 0.35 } as const;

/** Fades and rises into view once, as it scrolls in (still for visitors who prefer less motion). */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.6, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

const draw = { hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } };
const appear = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const drawTransition = { duration: 1.1, ease: easeOut };

/** A two-ring molecule in line art: the bonds draw themselves, then the atoms at the ends appear and pulse. */
function Molecule({ delay = 0, style }: { delay?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="-62 -70 176 140"
      className="w-full h-auto"
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={ON_SCREEN}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.18, delayChildren: delay } } }}
    >
      <motion.polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" variants={draw} transition={drawTransition} />
      <motion.polygon points="26,-15 52,-30 78,-15 78,15 52,30 26,15" variants={draw} transition={drawTransition} />
      {/* The double bonds, inside the rings. */}
      <motion.path
        d="M0,-23 L19.9,-11.5 M19.9,11.5 L0,23 M-19.9,11.5 V-11.5 M52,-23 L71.9,-11.5 M71.9,11.5 L52,23"
        strokeWidth="1"
        variants={draw}
        transition={drawTransition}
      />
      {/* The side chains, and the atoms at their ends. */}
      <motion.path d="M0,-30 V-56 M78,15 L100,28 M-26,15 L-48,28" variants={draw} transition={drawTransition} />
      <motion.g variants={appear} transition={{ duration: 0.5 }} fill="currentColor" stroke="none">
        <circle cx="0" cy="-56" r="4.5" className="animate-node-pulse" />
        <circle cx="100" cy="28" r="4.5" className="animate-node-pulse" style={{ animationDelay: "-1.2s" }} />
        <circle cx="-48" cy="28" r="4.5" className="animate-node-pulse" style={{ animationDelay: "-2.4s" }} />
      </motion.g>
    </motion.svg>
  );
}

/**
 * Molecules drifting slowly behind a section, in the corners clear of its text. The colour (and how faint it is)
 * comes from the text colour in `className`; the section needs `relative` and its content a higher layer.
 */
export function MoleculeField({ className = "text-teal-aa/20" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute -top-4 -right-12 w-52 md:w-80 animate-drift-a">
        <Molecule style={{ rotate: "18deg" }} />
      </div>
      <div className="absolute -bottom-6 -left-14 w-44 md:w-72 animate-drift-b">
        <Molecule delay={0.3} style={{ rotate: "-24deg" }} />
      </div>
      <div className="hidden lg:block absolute top-[46%] -right-6 w-28 animate-drift-b">
        <Molecule delay={0.6} style={{ rotate: "70deg" }} />
      </div>
    </div>
  );
}

/**
 * A frame whose contents (a photo) move a little slower than the page as it scrolls past. `className` positions
 * and sizes the frame; `amount` is how far the contents travel, as a percentage of the frame's height.
 */
export function Parallax({ children, className = "", amount = 4 }: { children: ReactNode; className?: string; amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      {/* Enlarged by the distance it travels, so its edges never show. */}
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y, scale: 1 + (amount * 2 + 1) / 100 }}>
        {children}
      </motion.div>
    </div>
  );
}

/** A ring that draws itself around a round badge (which needs `relative`) when the badge is on screen. */
export function DrawRing({ className = "text-brand-orange" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" className={`absolute -inset-1.5 -rotate-90 ${className}`}>
      <motion.circle
        cx="24"
        cy="24"
        r="22.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 1 }}
        transition={{ duration: 1.1, ease: easeOut }}
      />
    </svg>
  );
}
