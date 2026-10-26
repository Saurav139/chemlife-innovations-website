"use client";

import { useEffect, useRef } from "react";
import "../research.css";

type Anim = HTMLElement & { _played?: boolean; _live?: number };

/**
 * A research platform page's content (trusted HTML from src/previews/research) and its figures' behaviour, ported
 * from the original pages' script:
 * - each figure draws itself once when it scrolls into view, then runs a quiet loop that pauses off screen;
 * - Replay redraws the figure; the microencapsulation figure has a Bypass / Rumen-sustained switch.
 * - On phones the three stages are a step-through (CSS scroll snap): each stage draws when it comes into view, a
 *   stage swiped aside pauses, and Replay redraws the stage on screen.
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

    // Shown: laid out, and (in the phone step-through) the stage in view rather than one scrolled to the side.
    const shown = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      if (!r.width) return false;
      const scroller = el.closest<HTMLElement>(".stages-m")?.getBoundingClientRect();
      return !scroller || Math.min(r.right, scroller.right) - Math.max(r.left, scroller.left) > r.width / 2;
    };

    const controller = new AbortController();
    const { signal } = controller;
    root.querySelectorAll<HTMLButtonElement>("[data-replay]").forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          button.closest("figure")?.querySelectorAll<Anim>(".anim").forEach((el) => {
            if (shown(el)) {
              el._played = true;
              play(el);
            }
          });
        },
        { signal }
      );
    });

    // Phone step-through: the arrows and dots move between the stages, and follow a swipe.
    root.querySelectorAll<HTMLElement>("[data-stage-nav]").forEach((nav) => {
      const list = nav.parentElement?.querySelector<HTMLElement>(".stages-m");
      if (!list) return;
      const stages = Array.from(list.children) as HTMLElement[];
      const dots = Array.from(nav.querySelectorAll<HTMLButtonElement>("[data-stage-go]"));
      const prev = nav.querySelector<HTMLButtonElement>("[data-stage-prev]");
      const next = nav.querySelector<HTMLButtonElement>("[data-stage-next]");
      const status = nav.querySelector<HTMLElement>("[data-stage-status]");
      let index = 0;
      let frame = 0;

      const sync = () => {
        frame = 0;
        if (!list.clientWidth) return;
        const now = Math.min(stages.length - 1, Math.max(0, Math.round(list.scrollLeft / list.clientWidth)));
        if (now === index && dots[now]?.hasAttribute("aria-current")) return;
        index = now;
        dots.forEach((dot, i) => (i === now ? dot.setAttribute("aria-current", "step") : dot.removeAttribute("aria-current")));
        if (prev) prev.disabled = now === 0;
        if (next) next.disabled = now === stages.length - 1;
        if (status) status.textContent = dots[now]?.getAttribute("aria-label") ?? "";
      };
      const go = (i: number) =>
        list.scrollTo({ left: Math.max(0, Math.min(stages.length - 1, i)) * list.clientWidth, behavior: reduce ? "auto" : "smooth" });

      list.addEventListener("scroll", () => { if (!frame) frame = requestAnimationFrame(sync); }, { passive: true, signal });
      prev?.addEventListener("click", () => go(index - 1), { signal });
      next?.addEventListener("click", () => go(index + 1), { signal });
      dots.forEach((dot, i) => dot.addEventListener("click", () => go(i), { signal }));
      // Keep the same stage in place when the width changes (a phone turned sideways).
      window.addEventListener("resize", () => list.scrollTo({ left: index * list.clientWidth }), { signal });
      signal.addEventListener("abort", () => cancelAnimationFrame(frame));
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
        { signal }
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
