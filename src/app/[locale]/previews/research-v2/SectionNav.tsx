"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  sections: { id: string; label: string }[];
  number: number;
  total: number;
  prev?: { href: string; label: string };
  next?: { href: string; label: string };
};

/** The bar that stays under the header: the page's sections (the one on screen is marked) and the platforms either side. */
export default function SectionNav({ sections, number, total, prev, next }: Props) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const targets = sections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    let frame = 0;
    // The section on screen is the last one whose top has passed under the bar.
    const sync = () => {
      frame = 0;
      const line = (bar.current?.getBoundingClientRect().bottom ?? 0) + 48;
      const current = targets.filter((el) => el.getBoundingClientRect().top <= line).pop() ?? targets[0];
      if (current) setActive(current.id);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(sync); };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sections]);

  // The bar sits right under the site header, whose height changes with the screen width: measure it.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>("header");
    const root = bar.current?.closest<HTMLElement>(".rv2");
    if (!header || !root) return;
    const ro = new ResizeObserver(() => root.style.setProperty("--hdr", `${header.offsetHeight}px`));
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // On a phone the links scroll sideways: keep the marked one in view.
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const ul = list.current;
    const link = ul?.querySelector<HTMLElement>("[aria-current]");
    if (!ul || !link || ul.scrollWidth <= ul.clientWidth) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    ul.scrollTo({ left: link.offsetLeft - (ul.clientWidth - link.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  return (
    <nav className="rv2-bar" aria-label="On this page" ref={bar}>
      <div className="rv2-wrap rv2-bar-in">
        <ul className="rv2-bar-links" ref={list}>
          {sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="rv2-bar-pager">
          <span>
            <span className="rv2-bar-word">Platform </span>
            {number} of {total}
          </span>
          {prev ? (
            <a href={prev.href} aria-label={`Previous platform: ${prev.label}`} title={prev.label}>
              <Arrow flip />
            </a>
          ) : (
            <span className="rv2-bar-off" aria-hidden="true"><Arrow flip /></span>
          )}
          {next ? (
            <a href={next.href} aria-label={`Next platform: ${next.label}`} title={next.label}>
              <Arrow />
            </a>
          ) : (
            <span className="rv2-bar-off" aria-hidden="true"><Arrow /></span>
          )}
        </div>
      </div>
    </nav>
  );
}

function Arrow({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={flip ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}
