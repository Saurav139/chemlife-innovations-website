"use client";

import { useEffect, useState } from "react";

// A thin teal line under the site header that fills as the reader moves down the article (the element with `id`).

export default function ReadingProgress({ id }: { id: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.getElementById(id);
    if (!article) return;
    let frame = 0;
    const measure = () => {
      const { top, height } = article.getBoundingClientRect();
      const start = window.scrollY + top;
      const end = start + height - window.innerHeight;
      const read = end > start ? (window.scrollY - start) / (end - start) : 1;
      setProgress(Math.min(1, Math.max(0, read)));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [id]);

  return (
    <div className="fixed top-32 left-0 w-full h-1 z-40 pointer-events-none" aria-hidden="true">
      <div className="h-full bg-teal-aa origin-left transition-transform duration-75" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
