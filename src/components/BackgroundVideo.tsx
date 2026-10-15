"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/** Whether the element is on screen or within `rootMargin` of it. */
export function useNearViewport<T extends Element>(rootMargin = "300px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return [ref, near] as const;
}

/**
 * A muted, looping background video. Nothing downloads until `active` (its section is near the screen);
 * it pauses when inactive, and shows only the poster to visitors who ask for reduced motion.
 */
export default function BackgroundVideo({
  src,
  poster,
  active,
  className,
}: {
  src: string;
  poster?: string;
  active: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const play = active && !reduceMotion;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (play) {
      video.muted = true;
      // Browsers may still refuse to autoplay (e.g. iOS Low Power Mode); the poster stays up.
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [play, src]);

  return (
    <video ref={ref} muted loop playsInline preload="none" poster={active ? poster : undefined} className={className}>
      <source src={src} type="video/mp4" />
    </video>
  );
}
