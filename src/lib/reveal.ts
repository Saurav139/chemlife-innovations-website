// Scroll-in animations start while a section is still a little below the screen, so by the time it scrolls
// into view it is already showing. A fast scroll never lands on an empty, not-yet-faded-in space.
export const REVEAL_VIEWPORT = { once: true, margin: "0px 0px 25% 0px" } as const;
