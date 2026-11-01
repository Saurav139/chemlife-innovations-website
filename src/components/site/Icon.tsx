// Line icons for the redesign, drawn on a 24px grid in the current text colour.
const PATHS = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  arrowUpRight: "M7 17 17 7M8 7h9v9",
  check: "M5 12.5l4.5 4.5L19 7.5",
  chevron: "m6 9 6 6 6-6",
  plus: "M12 5v14M5 12h14",
  shield: "M12 3 4.5 6v5.5c0 4.7 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.8 7.5-9.5V6L12 3Zm-3.5 9 2.5 2.5 4.5-5",
  leaf: "M5 19c0-8 5-13 14-14 0 9-5 14-13 14H5Zm0 0 8-8",
  flask: "M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3M7.5 15h9",
  molecule: "M12 4.5a2 2 0 1 0 0 .1M5 16.5a2 2 0 1 0 0 .1M19 16.5a2 2 0 1 0 0 .1M12 6.5v4m0 0-5.3 4.5M12 10.5l5.3 4.5M7 16.5h10",
  capsule: "M8.5 15.5 15.5 8.5M6.3 17.7a4.5 4.5 0 0 1 0-6.4l5-5a4.5 4.5 0 0 1 6.4 6.4l-5 5a4.5 4.5 0 0 1-6.4 0Z",
  mineral: "m12 3 7 4v10l-7 4-7-4V7l7-4Zm0 0v18M5 7l14 10M19 7 5 17",
  chick: "M15 8.5a3 3 0 1 0-6 0c0 .9.4 1.7 1 2.3C7.6 11.7 6 14 6 16.5 6 19 8.7 21 12 21s6-2 6-4.5c0-2.5-1.6-4.8-4-5.7.6-.6 1-1.4 1-2.3ZM15 8.5h2.5L15.8 10M10 21v1.5M14 21v1.5",
  cow: "M6 7 3.5 5.5M18 7l2.5-1.5M7 6.5h10c.6 0 1 .4 1 1V14a6 6 0 0 1-12 0V7.5c0-.6.4-1 1-1ZM9.5 16.5h5M10 11h.01M14 11h.01",
  pig: "M5 13a7 6 0 1 0 14 0 7 6 0 0 0-14 0Zm4-6.5L7.5 4M15 6.5 16.5 4M10.5 14.5h.01M13.5 14.5h.01M9.5 13a2.5 2 0 0 0 5 0",
  factory: "M3 21V11l5 3v-3l5 3V5h4v16H3Zm14 0h4V9h-4",
  truck: "M3 6h11v9H3V6Zm11 3h4l3 3v3h-7M6.5 18a1.5 1.5 0 1 0 0-.1M17.5 18a1.5 1.5 0 1 0 0-.1",
  warehouse: "M3 21V8l9-5 9 5v13M7 21v-8h10v8M7 17h10",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8",
  users: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm10 9v-1.5a3.5 3.5 0 0 0-2.5-3.4M15.5 4.2a3.5 3.5 0 0 1 0 6.6",
  award: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm-3.5 4.5L12 21l3.5-1.5-.9-5.1M9.4 14.4 8.5 19.5",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  quote: "M9.5 7C6.5 8 5 10.3 5 13.5V17h5v-5H7.5c0-2 .8-3.3 2.5-4M19 7c-3 1-4.5 3.3-4.5 6.5V17h5v-5H17c0-2 .8-3.3 2.5-4",
  mail: "M3.5 6.5h17v11h-17v-11Zm0 0L12 13l8.5-6.5",
  phone: "M5 4h3.5l1.5 4-2 1.3a10 10 0 0 0 6.7 6.7L16 14l4 1.5V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4Z",
  pin: "M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z",
  play: "M8 5.5v13l10.5-6.5L8 5.5Z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4.5 4.5",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
  briefcase: "M3.5 8h17v11.5h-17V8Zm5 0V5.5h7V8M3.5 13h17",
  heart: "M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  doc: "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h6",
} as const;

export type IconName = keyof typeof PATHS;

/** An icon's path on its 24px grid, for drawing it inside another SVG. */
export const iconPath = (name: IconName) => PATHS[name];

export default function Icon({ name, className = "w-5 h-5", strokeWidth = 1.8 }: { name: IconName; className?: string; strokeWidth?: number }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={PATHS[name]} />
  </svg>;
}
