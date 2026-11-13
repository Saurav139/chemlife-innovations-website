"use client";

import { useEffect, useState } from "react";
import type { ArticleHeading } from "@/lib/article-toc";

// "In this article": the article's sub-headings as links. On a wide screen it's a list that stays in view beside the
// text; on a phone it's a box above the text that opens on a tap. The heading being read is highlighted.

/** The id of the heading nearest the top of the reading area. */
function useActiveHeading(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;
    const pick = () => {
      // The header is 8rem tall; a heading counts as reached once it's just below it.
      const line = 8 * 16 + 24;
      let current: string | null = null;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActive(current ?? elements[0].id);
    };
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(pick);
    };
    pick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);
  return active;
}

function Links({ headings, active, onPick }: { headings: ArticleHeading[]; active: string | null; onPick?: () => void }) {
  return (
    <ol className="space-y-1">
      {headings.map((heading) => {
        const current = heading.id === active;
        return (
          <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${heading.id}`}
              onClick={onPick}
              aria-current={current ? "location" : undefined}
              className={`block border-l-2 py-1 pl-3 text-sm leading-snug transition-colors ${
                current
                  ? "border-teal-aa text-teal-aa font-semibold"
                  : "border-gray-200 text-slate-600 hover:border-teal-500/50 hover:text-brand-navy"
              }`}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export default function ArticleToc({ headings, variant }: { headings: ArticleHeading[]; variant: "sidebar" | "inline" }) {
  const ids = headings.map((heading) => heading.id);
  const active = useActiveHeading(ids);
  const [open, setOpen] = useState(false);

  if (variant === "sidebar") {
    return (
      <nav aria-label="In this article" className="sticky top-36">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-aa mb-3">In this article</p>
        <Links headings={headings} active={active} />
      </nav>
    );
  }

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="group rounded-2xl border border-gray-200 bg-gray-55 mb-8"
    >
      <summary className="flex items-center justify-between gap-3 cursor-pointer list-none min-h-12 px-5 py-3 font-heading font-bold text-brand-navy [&::-webkit-details-marker]:hidden">
        <span>In this article</span>
        <svg className="w-5 h-5 shrink-0 text-teal-aa transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="px-5 pb-4">
        <Links headings={headings} active={active} onPick={() => setOpen(false)} />
      </div>
    </details>
  );
}
