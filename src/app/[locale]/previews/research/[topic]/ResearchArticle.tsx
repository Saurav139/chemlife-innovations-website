"use client";

import { useEffect, useRef } from "react";
import "../research.css";

type Anim = HTMLElement & { _played?: boolean; _live?: number };

/**
 * A research platform page's content (trusted HTML from src/previews/research) and its figures' behaviour, ported
 * from the original pages' script:
 * - each figure draws itself once when it scrolls into view, then runs a quiet loop that pauses off screen;
 * - Replay redraws the figure; the microencapsulation figure has a Bypass / Rumen-sustained switch.
 * Visitors who ask for reduced motion see the finished drawings, still (the CSS only animates without that setting).
 */
export default function ResearchArticle({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const anims = Array.from(root.querySelectorAll<Anim>(".anim"));
    const timers = new Set<number>();

    const play = (el: Anim) => {
      if (el._live) clearTimeout(el._live);
      el.classList.remove("in", "live", "off");
      void el.getBoundingClientRect(); // restart the CSS animations
      el.classList.add("in");
      if (reduce) return;
      const after = parseFloat(el.getAttribute("data-live") || "0");
      el._live = window.setTimeout(() => el.classList.add("live"), Math.max(0, after) * 1000);
      timers.add(el._live);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as Anim;
          if (entry.isIntersecting) {
            if (!el._played) {
              el._played = true;
              play(el);
            }
            el.classList.remove("off");
          } else if (el._played) {
            el.classList.add("off");
          }
        });
      },
      { threshold: 0.25 }
    );
    anims.forEach((el) => io.observe(el));

    const controller = new AbortController();
    root.querySelectorAll<HTMLButtonElement>("[data-replay]").forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          button.closest("figure")?.querySelectorAll<Anim>(".anim").forEach((el) => {
            if (el.getClientRects().length) {
              el._played = true;
              play(el);
            }
          });
        },
        { signal: controller.signal }
      );
    });
    root.querySelectorAll<HTMLButtonElement>("[data-mode-set]").forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const figure = button.closest("figure");
          if (!figure) return;
          figure.setAttribute("data-mode", button.getAttribute("data-mode-set") || "");
          figure.querySelectorAll("[data-mode-set]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        },
        { signal: controller.signal }
      );
    });

    return () => {
      io.disconnect();
      controller.abort();
      timers.forEach((t) => clearTimeout(t));
    };
  }, [html]);

  // rp-js: the figures start hidden and draw in (set from the first render, so they don't flash in finished first).
  return <div ref={ref} className="rp rp-js" dangerouslySetInnerHTML={{ __html: html }} />;
}
