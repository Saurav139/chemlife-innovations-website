"use client";

import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

// A scroll-in fade that never hides content a visitor is waiting for. The server sends the element fully
// visible. Once the page's JavaScript runs, only elements still below the screen are hidden, and each fades in
// as it scrolls up. Anything already on screen stays as it is, and so does the whole page if the JavaScript is
// slow or never arrives. The styles are in globals.css ([data-reveal]).

interface Props {
  children: ReactNode;
  as?: "div" | "section" | "aside" | "span" | "li";
  /** The side it moves in from. */
  from?: "up" | "left" | "right";
  /** Seconds to wait before fading in, to stagger a row. */
  delay?: number;
  className?: string;
  id?: string;
}

export default function Reveal({ children, as = "div", from = "up", delay = 0, className, id }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    // Already on screen, or about to be: leave it showing.
    if (el.getBoundingClientRect().top < window.innerHeight * 1.25) return;
    el.dataset.reveal = "hidden";
    let settled: ReturnType<typeof setTimeout> | undefined;
    // Starts while the element is still a little below the screen, so a fast scroll never lands on an empty space.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        el.dataset.reveal = "shown";
        // Once it has faded in, hand back the element's own transitions (hover effects).
        settled = setTimeout(() => delete el.dataset.reveal, (delay + 0.7) * 1000);
      },
      { rootMargin: "0px 0px 25% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(settled);
      delete el.dataset.reveal;
    };
  }, [delay]);

  return createElement(
    as,
    {
      ref,
      id,
      className,
      "data-reveal-from": from === "up" ? undefined : from,
      style: delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined,
    },
    children,
  );
}
