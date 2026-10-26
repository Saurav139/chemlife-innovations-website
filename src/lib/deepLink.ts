import { useEffect, useRef } from "react";

// Links straight to one item on a page, such as /products#product-maxdmold from the site search. The page opens the
// item (expands a product, selects a role…), then scrolls it into view and briefly highlights it.

/**
 * Calls `onTarget` with the page's #hash (without the #) when the page opens and whenever the hash changes, as it
 * does when a search result points to the page that's already open.
 */
export function useHashTarget(onTarget: (target: string) => void) {
  // The latest callback, so it sees the page's current state without re-subscribing.
  const callback = useRef(onTarget);
  callback.current = onTarget;

  useEffect(() => {
    const run = () => {
      const target = decodeURIComponent(window.location.hash.slice(1));
      if (target) callback.current(target);
    };
    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
  }, []);
}

const HIGHLIGHT = ["ring-4", "ring-teal-400/60", "ring-offset-2"];

/**
 * Scrolls the element with this id into view (its `scroll-mt-*` class keeps it clear of the fixed header) and
 * highlights it for a moment. Waits briefly first, so a card that was just expanded or shown has rendered.
 */
export function revealElement(id: string, delay = 350) {
  window.setTimeout(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
    el.scrollIntoView({ behavior, block: "start" });
    el.classList.add(...HIGHLIGHT);
    window.setTimeout(() => el.classList.remove(...HIGHLIGHT), 2500);
    // Sections that slide in as they appear move after the scroll; check again once they've settled.
    window.setTimeout(() => {
      const offset = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      if (Math.abs(el.getBoundingClientRect().top - offset) > 8) el.scrollIntoView({ behavior, block: "start" });
    }, 1000);
  }, delay);
}

/**
 * Goes to a search result. A result on the page that's already open only changes the #hash, which the page hears
 * through useHashTarget; the old hash is cleared first, so picking the same result twice works too.
 */
export function goToResult(href: string, push: (href: string) => void) {
  const url = new URL(href, window.location.origin);
  if (url.hash && url.pathname === window.location.pathname) {
    window.history.replaceState(window.history.state, "", url.pathname + url.search);
    window.location.hash = url.hash;
  } else {
    push(href);
  }
}
