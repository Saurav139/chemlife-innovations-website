import { useCallback, useEffect, useState } from "react";

// For content that moves on its own (slideshows, rotating pictures, background video): whether the visitor has
// paused it, and the toggle for a PauseButton. Visitors who ask their device for less motion start paused.
export function usePausable() {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);
  const toggle = useCallback(() => setPaused((p) => !p), []);
  return [paused, toggle] as const;
}
