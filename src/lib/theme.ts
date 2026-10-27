// Light and dark themes. The page follows the device's setting unless the visitor picks one in the footer; their
// pick is kept in localStorage. The theme is <html data-theme="light|dark">, which the `dark:` classes key off.

export type ThemeChoice = "system" | "light" | "dark";

export const THEME_KEY = "chemlife-theme";
export const DARK_QUERY = "(prefers-color-scheme: dark)";
/** Sent on window when the visitor picks a theme, so every switch on the page shows the new pick. */
export const THEME_EVENT = "chemlife-theme-change";

/** Runs in <head> before the page paints, so a dark page never flashes white first. Kept tiny and dependency-free. */
export const THEME_SCRIPT = `(function(){var c=null;try{c=localStorage.getItem("${THEME_KEY}")}catch(e){}var d=c==="dark"||(c!=="light"&&window.matchMedia("${DARK_QUERY}").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")})()`;

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
