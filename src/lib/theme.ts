// Light and dark themes. The page follows the device's setting unless the visitor picks one in the footer; their
// pick is kept in localStorage. The theme is <html data-theme="light|dark">, which the `dark:` classes key off.

export type ThemeChoice = "system" | "light" | "dark";

export const THEME_KEY = "chemlife-theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";
/** Sent on window when the visitor picks a theme, so every switch on the page shows the new pick. */
export const THEME_EVENT = "chemlife-theme-change";

// Dark palettes on trial, all takes on the brand navy: midnight (the default), a darker ink and a richer royal. Picked
// on staging from the footer, or with ?palette=ink in a link, and kept in localStorage. Remove once one is chosen.
export const PALETTES = [
  { id: "navy", name: "Midnight navy", swatch: "#12213a" },
  { id: "ink", name: "Deep ink", swatch: "#0c182b" },
  { id: "royal", name: "Royal navy", swatch: "#122249" },
] as const;
export type PaletteId = (typeof PALETTES)[number]["id"];
export const PALETTE_KEY = "chemlife-dark-palette";
const PALETTE_IDS = PALETTES.map((p) => p.id).join("|");

/** Runs in <head> before the page paints, so a dark page never flashes white first. Kept tiny and dependency-free. */
export const THEME_SCRIPT = `(function(){var h=document.documentElement,c=null,p=null;try{var q=new URLSearchParams(location.search).get("palette");if(q&&/^(${PALETTE_IDS})$/.test(q)){localStorage.setItem("${PALETTE_KEY}",q);localStorage.setItem("${THEME_KEY}","dark")}c=localStorage.getItem("${THEME_KEY}");p=localStorage.getItem("${PALETTE_KEY}")}catch(e){}var d=c==="dark"||(c!=="light"&&window.matchMedia("${DARK_QUERY}").matches);h.setAttribute("data-theme",d?"dark":"light");if(p&&p!=="navy")h.setAttribute("data-palette",p)})()`;

export function readPalette(): PaletteId {
  try {
    const value = localStorage.getItem(PALETTE_KEY);
    return PALETTES.some((p) => p.id === value) ? (value as PaletteId) : "navy";
  } catch {
    return "navy";
  }
}

export function applyPalette(palette: PaletteId) {
  if (palette === "navy") document.documentElement.removeAttribute("data-palette");
  else document.documentElement.setAttribute("data-palette", palette);
}

/** Picks a palette and shows it: the page switches to dark, since that's the only place a palette shows. */
export function savePalette(palette: PaletteId) {
  try {
    localStorage.setItem(PALETTE_KEY, palette);
  } catch {
    // Applies to this page only.
  }
  applyPalette(palette);
  saveChoice("dark");
}

export function readChoice(): ThemeChoice {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && window.matchMedia(DARK_QUERY).matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function saveChoice(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    // Private browsing can refuse storage; the pick still applies to this page.
  }
  applyTheme(choice);
  window.dispatchEvent(new Event(THEME_EVENT));
}
