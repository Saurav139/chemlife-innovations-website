"use client";

import { useLayoutEffect, type RefObject } from "react";

/** Packs a CSS grid's cards like a masonry wall: each card keeps its own height and goes, in order, into the
 *  shortest column, so the first cards run across the top and none is stretched to the tallest in its row. Cards
 *  already placed don't move when more are added after them. A one-column grid (phones) is left as it is, and so is
 *  the grid until this runs. */
export function useMasonry(ref: RefObject<HTMLElement | null>, deps: readonly unknown[]) {
  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const items = () => [...grid.children] as HTMLElement[];

    const reset = () => {
      grid.style.gridAutoRows = grid.style.rowGap = grid.style.marginBottom = "";
      for (const item of items()) item.style.gridColumn = item.style.gridRow = "";
    };

    const layout = () => {
      // The grid's own classes decide the column count at each width.
      reset();
      const style = getComputedStyle(grid);
      const columns = style.gridTemplateColumns.split(" ").filter(Boolean).length;
      if (columns < 2) return;
      const gap = parseFloat(style.columnGap) || 0;
      // 1px rows: a card spans as many as it is tall, plus the gap below it.
      grid.style.gridAutoRows = "1px";
      grid.style.rowGap = "0px";
      grid.style.marginBottom = `${-gap}px`;
      const heights = new Array<number>(columns).fill(0);
      for (const item of items()) {
        const column = heights.indexOf(Math.min(...heights));
        const span = Math.ceil(item.offsetHeight) + gap;
        item.style.gridColumn = `${column + 1}`;
        item.style.gridRow = `${heights[column] + 1} / span ${span}`;
        heights[column] += span;
      }
    };

    // Lay out again when a card changes height (a picture loads, text rewraps) or the grid changes width.
    let frame = 0;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; layout(); }); };
    let width = grid.clientWidth;
    const resized = new ResizeObserver((entries) => {
      if (entries.some((entry) => entry.target !== grid) || grid.clientWidth !== width) { width = grid.clientWidth; schedule(); }
    });
    resized.observe(grid);
    for (const item of items()) resized.observe(item);
    layout();

    return () => { cancelAnimationFrame(frame); resized.disconnect(); reset(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
