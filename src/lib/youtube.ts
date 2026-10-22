import type { MouseEvent } from "react";

// Videos play in a pop-up player on tablets and computers. On phones they open in the YouTube app instead: the
// play controls are real links to youtube.com, and tapping one opens the app when it's installed (youtube.com
// otherwise). A real link tap is what reliably hands over to the app; a script navigation may not.

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** A touch screen whose shorter side is under 600px: phones in either orientation, not tablets. */
function isPhone() {
  return matchMedia("(pointer: coarse)").matches && Math.min(screen.width, screen.height) < 600;
}

/** Click handler for a link to a YouTube video: phones follow the link, everything else opens the pop-up player. */
export function playOnPage(event: MouseEvent, openPlayer: () => void) {
  event.stopPropagation();
  if (isPhone()) return;
  event.preventDefault();
  openPlayer();
}
