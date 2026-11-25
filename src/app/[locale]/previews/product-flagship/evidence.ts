// What this design shows beyond the approved text in src/lib/productData.ts, all taken from the same documents:
// the photographs and the charts' figures in each Technical Data Sheet, and the inclusion rates as numbers so a
// visitor can work out a batch. For the preview only; it moves beside the approved data if the design is chosen.

/** A test plate's photograph, from the product's Technical Data Sheet. Keyed by the organism's name in productData. */
export const PLATES: Record<string, Record<string, string>> = {
  MaxDmold: {
    "A. niger": "/images/products/trials/maxdmold-plate-a-niger.jpg",
    "C. albicans": "/images/products/trials/maxdmold-plate-c-albicans.jpg",
  },
  "MaxDmold Spray": {
    "A. niger": "/images/products/trials/maxdmold-spray-plate-a-niger.jpg",
    "C. albicans": "/images/products/trials/maxdmold-spray-plate-c-albicans.jpg",
    "C. sporogenes": "/images/products/trials/maxdmold-spray-plate-c-sporogenes.jpg",
    "E. coli": "/images/products/trials/maxdmold-spray-plate-e-coli.jpg",
    "P. aeruginosa": "/images/products/trials/maxdmold-spray-plate-p-aeruginosa.jpg",
    "S. typhi": "/images/products/trials/maxdmold-spray-plate-s-typhi.jpg",
  },
};

export interface TrialResult {
  measure: string;
  unit: string;
  control: number;
  treated: number;
  /** The difference as the data sheet's chart states it. */
  change: string;
  p?: string;
}

/** The figures on the in-vivo charts in the Technical Data Sheet (the text beside them is in productData). */
export const TRIALS: Record<string, TrialResult[]> = {
  MaxDmold: [
    { measure: "Ileal villus height", unit: "µm", control: 713.1, treated: 776.1, change: "+8.8%", p: "P < 0.001" },
    { measure: "Villus height to crypt depth", unit: "ratio", control: 5.63, treated: 6.13, change: "+8.9%", p: "P = 0.001" },
    { measure: "Final body weight", unit: "g", control: 2439, treated: 2507, change: "+68 g" },
  ],
};

export interface Dose {
  /** What the visitor enters: "tonnes of feed", "birds". */
  basis: string;
  /** The rate is for this many of them (10 mL per 100 birds). */
  per: number;
  /** The amount the calculator opens on. */
  start: number;
  unit: "g" | "mL";
  /** Follows the answer where the rate is a daily one. */
  suffix?: string;
  rates: { label: string; min: number; max: number }[];
}

/** Each product's inclusion rate as numbers, exactly as its page states it. */
export const DOSES: Record<string, Dose> = {
  MaxDmold: { basis: "tonnes of feed", per: 1, start: 10, unit: "g", rates: [{ label: "Complete feed", min: 25, max: 25 }] },
  "MaxDmold Spray": { basis: "tonnes of feed ingredients", per: 1, start: 10, unit: "g", rates: [{ label: "Feed ingredients", min: 250, max: 500 }] },
  MethioWiz: { basis: "tonnes of dairy feed", per: 1, start: 10, unit: "g", rates: [{ label: "Dairy feed", min: 500, max: 2000 }] },
  "MBioWiz Plus": {
    basis: "animals",
    per: 1,
    start: 100,
    unit: "g",
    suffix: "a day",
    rates: [
      { label: "Calves and heifers", min: 2.5, max: 5 },
      { label: "Lactating", min: 10, max: 20 },
      { label: "Far-off transition", min: 20, max: 20 },
    ],
  },
  CholiWiz: { basis: "tonnes of dairy feed", per: 1, start: 10, unit: "g", rates: [{ label: "Dairy cow feed", min: 750, max: 2000 }] },
  LivproGenie: {
    basis: "birds",
    per: 100,
    start: 10000,
    unit: "mL",
    rates: [
      { label: "Broilers, weeks 2–3", min: 10, max: 10 },
      { label: "Broilers, week 4 on", min: 20, max: 20 },
      { label: "Breeders and layers", min: 20, max: 20 },
    ],
  },
  EggGenie: {
    basis: "tonnes of feed",
    per: 1,
    start: 10,
    unit: "g",
    rates: [
      { label: "Standard", min: 500, max: 500 },
      { label: "Stress conditions", min: 750, max: 750 },
    ],
  },
  GutproGenie: {
    basis: "litres of drinking water",
    per: 1,
    start: 1000,
    unit: "mL",
    rates: [
      { label: "Chicks", min: 2, max: 4 },
      { label: "Broilers", min: 1, max: 2 },
      { label: "Breeders and layers", min: 1, max: 2 },
    ],
  },
};
