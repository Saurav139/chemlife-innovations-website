import type { ReactNode } from "react";
import { DuotoneMark, type Mark } from "../../products/[slug]/TechnicalData";
import { ICON_PATHS } from "../../products/[slug]/icons";
import { FILL, REGULAR } from "./iconSets";

// The four icon styles in the preview. Each draws the same icons in the three places the product page uses
// them: on a light card, on the navy band, and in a line of text.

const Svg = ({ className, children }: { className: string; children: ReactNode }) => (
  <svg aria-hidden="true" className={`${className} flex-shrink-0`} fill="currentColor" viewBox="0 0 256 256">
    {children}
  </svg>
);

const Flat = ({ paths, className }: { paths: string[]; className: string }) => (
  <Svg className={className}>
    {paths.map((d) => (
      <path key={d} d={d} />
    ))}
  </Svg>
);

/** B: thin navy outlines in a white, bordered tile. Quiet and corporate. */
const OutlineMark: Mark = ({ name, on }) =>
  on === "inline" ? (
    <Flat paths={REGULAR[name]} className="w-6 h-6 text-brand-navy" />
  ) : (
    <span className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${on === "navy" ? "border-white/45 text-white" : "border-slate-300 bg-white text-brand-navy"}`}>
      <Flat paths={REGULAR[name]} className="w-6 h-6" />
    </span>
  );

/** C: solid white icons on round orange badges. The boldest. */
const SolidMark: Mark = ({ name, on }) =>
  on === "inline" ? (
    <Flat paths={FILL[name]} className="w-6 h-6 text-brand-orange-aa" />
  ) : (
    <span className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${on === "navy" ? "bg-white text-brand-orange-aa" : "bg-brand-orange-aa text-white"}`}>
      <Flat paths={FILL[name]} className="w-6 h-6" />
    </span>
  );

/** D: the two brand colours and no tile. A navy outline (white on the navy band) over an orange shape. */
const TwoColourMark: Mark = ({ name, on }) => (
  <Svg className={on === "inline" ? "w-7 h-7" : "w-11 h-11"}>
    {ICON_PATHS[name].map(([d, backing]) => (
      <path key={d} d={d} className={backing ? (on === "navy" ? "fill-brand-orange" : "fill-brand-orange opacity-55") : on === "navy" ? "fill-white" : "fill-brand-navy"} />
    ))}
  </Svg>
);

export const ICON_STYLES = [
  { id: "duotone", label: "Duotone", Mark: DuotoneMark, note: "Now on the product pages: an orange icon with a soft backing shape, on a pale orange tile." },
  { id: "outline", label: "Outline", Mark: OutlineMark, note: "Thin navy outlines in a white, bordered tile. The quietest: it leaves the attention on the figures." },
  { id: "solid", label: "Solid", Mark: SolidMark, note: "Solid white icons on round orange badges. The boldest, and the easiest to spot when scanning the page." },
  { id: "two-colour", label: "Two-colour", Mark: TwoColourMark, note: "No tile: a larger icon in the two brand colours, a navy outline over an orange shape." },
] as const;

export type IconStyleId = (typeof ICON_STYLES)[number]["id"];
