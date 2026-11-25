"use client";

import { useEffect, useRef, useState } from "react";

// The bar that follows the visitor down the product page: the page's parts, the one being read marked, and the
// enquiry button always in reach. It sits under the site header from tablet width up; on a phone the two
// together would take a third of the screen, so there it stays where it is.

/** Where a section counts as "being read": just under the header and this bar. */
const READING_LINE = 128 + 56 + 48;

export default function SectionNav({ sections, cta }: { sections: { id: string; label: string }[]; cta: { href: string; label: string } }) {
  const [active, setActive] = useState(sections[0].id);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const update = () => {
      let current = sections[0].id;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= READING_LINE) current = section.id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  // On a narrow bar the links scroll sideways: keep the current one in view (moving the list, not the page).
  useEffect(() => {
    const ul = list.current;
    const link = ul?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!ul || !link || ul.scrollWidth <= ul.clientWidth) return;
    ul.scrollTo({ left: link.offsetLeft - (ul.clientWidth - link.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="On this page" className="mt-10 md:mt-14 md:sticky md:top-32 z-30 border-b border-brand-navy/10 bg-white/95 backdrop-blur-sm">
      <div className="max-w-[1240px] mx-auto px-6 md:px-8 flex items-center gap-6">
        <ul ref={list} className="relative flex flex-1 gap-x-7 lg:gap-x-9 overflow-x-auto overflow-y-hidden [scrollbar-width:none]">
          {sections.map((section) => (
            <li key={section.id} className="flex-shrink-0">
              <a
                href={`#${section.id}`}
                aria-current={active === section.id ? "true" : undefined}
                className="inline-flex items-center h-14 whitespace-nowrap border-b-[3px] border-transparent font-semibold text-slate-600 transition-colors hover:text-brand-navy aria-[current]:border-brand-orange-aa aria-[current]:text-brand-navy"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
        <a href={cta.href} className="hidden lg:inline-flex items-center justify-center min-h-10 px-5 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white text-sm font-semibold transition-colors">
          {cta.label}
        </a>
      </div>
    </nav>
  );
}
