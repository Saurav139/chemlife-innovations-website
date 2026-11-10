"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/** Packs a CSS grid's cards like a masonry wall: each card keeps its own height and goes, in order, into the
 *  shortest column, so the first cards run across the top and none is stretched to the tallest in its row. A one-column
 *  grid (phones) is left as it is, and so is the grid until this runs.
 *
 *  A card keeps its column once placed: when its height changes (a picture loads while the visitor scrolls), only the
 *  cards below it in that column move up or down. Re-sorting every card then made cards hop between columns, and the
 *  page jump as the browser chased the one it was keeping in view. Cards are sorted afresh only when the column count
 *  changes or `packKey` does (a new filter or search); cards added later (Load more) go into the shortest column. */
export function useMasonry(ref: RefObject<HTMLElement | null>, deps: readonly unknown[], packKey?: unknown) {
  // Each card's column, kept across re-runs (Load more re-runs this) until the column count or packKey changes.
  const placed = useRef<{ columns: number; packKey: unknown; column: WeakMap<Element, number> }>({ columns: 0, packKey, column: new WeakMap() });

  useLayoutEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    const items = () => [...grid.children] as HTMLElement[];
    if (placed.current.packKey !== packKey) placed.current = { columns: 0, packKey, column: new WeakMap() };

    const reset = () => {
      grid.style.gridAutoRows = grid.style.rowGap = grid.style.marginBottom = "";
      for (const item of items()) item.style.gridColumn = item.style.gridRow = "";
    };

    // The grid's own classes decide the column count at each width. It is read from an empty, invisible copy of the
    // grid: the grid itself would count a column its cards were placed in at a wider width, and clearing the cards
    // to read it makes the browser lay the page out half-built and move the visitor's scroll position.
    const columnCount = () => {
      const probe = document.createElement("div");
      probe.className = grid.className;
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;overflow-anchor:none;height:0;width:${grid.clientWidth}px`;
      grid.after(probe);
      const count = getComputedStyle(probe).gridTemplateColumns.split(" ").filter(Boolean).length;
      probe.remove();
      return count;
    };

    const layout = () => {
      const columns = columnCount();
      if (columns < 2) { reset(); placed.current.columns = columns; return; }
      const style = getComputedStyle(grid);
      if (columns !== placed.current.columns) placed.current = { columns, packKey, column: new WeakMap() };
      const gap = parseFloat(style.columnGap) || 0;
      // 1px rows: a card spans as many as it is tall, plus the gap below it.
      grid.style.gridAutoRows = "1px";
      grid.style.rowGap = "0px";
      grid.style.marginBottom = `${-gap}px`;
      // Every card is measured before any is moved, so the browser never lays out a half-placed grid.
      const cards = items().map((item) => ({ item, span: Math.ceil(item.offsetHeight) + gap }));
      const heights = new Array<number>(columns).fill(0);
      for (const { item, span } of cards) {
        const kept = placed.current.column.get(item);
        const column = kept !== undefined && kept < columns ? kept : heights.indexOf(Math.min(...heights));
        placed.current.column.set(item, column);
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

    return () => { cancelAnimationFrame(frame); resized.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, packKey]);

  // Clears the placement when the grid goes away.
  useLayoutEffect(() => () => {
    const grid = ref.current;
    if (!grid) return;
    grid.style.gridAutoRows = grid.style.rowGap = grid.style.marginBottom = "";
    for (const item of [...grid.children] as HTMLElement[]) item.style.gridColumn = item.style.gridRow = "";
  }, [ref]);
}
