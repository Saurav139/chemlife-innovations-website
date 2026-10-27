"use client";

import { useEffect, useRef, useState } from "react";

// The design system for the redesign: colour roles, type, buttons, cards, forms, badges and sections, each shown in
// the light and the dark theme side by side. Everything here uses only the role colours (bg-page, text-fg, border-line,
// bg-action...), so what passes here passes on every page built from it.

type Theme = "light" | "dark";

/** Shows its children twice: once in the light theme, once in the dark. */
function Both({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {(["light", "dark"] as Theme[]).map((theme) => (
        <div key={theme} data-theme={theme} className={`min-w-0 rounded-2xl border border-line bg-page p-5 text-fg-soft sm:p-7 ${className}`}>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-fg-muted">{theme === "light" ? "Light" : "Dark"}</p>
          {children}
        </div>
      ))}
    </div>
  );
}

function Block({ id, title, intro, children }: { id: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-slate-200 py-12 first:border-t-0 md:py-16" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="font-heading text-2xl font-bold text-brand-navy md:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-slate-600">{intro}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

// ---------- Colour roles, with their contrast measured in the page ----------

const ROLES: { name: string; cls: string; use: string; text?: boolean }[] = [
  { name: "page", cls: "bg-page", use: "The page" },
  { name: "sunken", cls: "bg-sunken", use: "Alternate sections" },
  { name: "card", cls: "bg-card", use: "Cards, forms, panels" },
  { name: "raised", cls: "bg-raised", use: "Menus, pop-ups, hover" },
  { name: "band", cls: "bg-band", use: "Brand sections, page headers" },
  { name: "action", cls: "bg-action", use: "The main button" },
  { name: "fg", cls: "bg-fg", use: "Headings, key text", text: true },
  { name: "fg-soft", cls: "bg-fg-soft", use: "Body text", text: true },
  { name: "fg-muted", cls: "bg-fg-muted", use: "Captions, labels", text: true },
  { name: "link", cls: "bg-link", use: "Links, eyebrows", text: true },
  { name: "action-text", cls: "bg-action-text", use: "Orange text links", text: true },
  { name: "line", cls: "bg-line", use: "Borders, dividers" },
];

function luminance(rgb: number[]) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function parse(color: string): number[] {
  const m = color.match(/[\d.]+/g) ?? ["0", "0", "0"];
  return m.slice(0, 3).map(Number);
}
function ratio(a: string, b: string) {
  const [la, lb] = [luminance(parse(a)), luminance(parse(b))].sort((x, y) => y - x);
  return (la + 0.05) / (lb + 0.05);
}

// Written out in full so Tailwind generates each class.
const PROBES: Record<string, string> = {
  fg: "bg-fg", "fg-soft": "bg-fg-soft", "fg-muted": "bg-fg-muted", link: "bg-link", "action-text": "bg-action-text", page: "bg-page",
  card: "bg-card", sunken: "bg-sunken", "on-action": "bg-on-action", action: "bg-action", "on-band": "bg-on-band", band: "bg-band",
};

/** Each text colour on the page and card surfaces, measured from the rendered colours (so it follows the palette). */
function ContrastTable() {
  const ref = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<{ text: string; on: string; value: number }[]>([]);

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const read = (cls: string) => getComputedStyle(el.querySelector(`[data-probe="${cls}"]`)!).backgroundColor;
      const out: typeof rows = [];
      for (const text of ["fg", "fg-soft", "fg-muted", "link", "action-text"])
        for (const on of ["page", "card", "sunken"]) out.push({ text, on, value: ratio(read(text), read(on)) });
      out.push({ text: "on-action", on: "action", value: ratio(read("on-action"), read("action")) });
      out.push({ text: "on-band", on: "band", value: ratio(read("on-band"), read("band")) });
      setRows(out);
    };
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-palette"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <div hidden>
        {Object.entries(PROBES).map(([c, cls]) => (
          <span key={c} data-probe={c} className={cls} />
        ))}
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-fg-muted"><th className="py-1.5 font-semibold">Text</th><th className="font-semibold">On</th><th className="text-right font-semibold">Contrast</th></tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={`${r.text}-${r.on}`}>
              <td className="py-1.5 font-mono text-fg">{r.text}</td>
              <td className="font-mono text-fg-soft">{r.on}</td>
              <td className={`text-right font-semibold tabular-nums ${r.value >= 4.5 ? "text-ok" : r.value >= 3 ? "text-warn" : "text-bad"}`}>
                {r.value.toFixed(1)}:1 {r.value >= 4.5 ? "AA" : r.value >= 3 ? "large only" : "fails"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- Pieces ----------

function Buttons({ onBand = false }: { onBand?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" className="inline-flex min-h-12 items-center rounded-full bg-action px-6 font-heading text-[15px] font-semibold text-on-action transition-colors hover:bg-action-hover">
        Find the right product
      </button>
      <button
        type="button"
        className={`inline-flex min-h-12 items-center rounded-full border-2 px-6 font-heading text-[15px] font-semibold transition-colors ${
          onBand ? "border-on-band/70 text-on-band hover:bg-on-band/10" : "border-line-strong text-fg hover:border-fg"
        }`}
      >
        Talk to a nutritionist
      </button>
      <a href="#buttons" className={`inline-flex min-h-11 items-center font-heading text-[15px] font-semibold underline decoration-2 underline-offset-4 ${onBand ? "text-link-on-band" : "text-link"}`}>
        Read the dossier
      </a>
      {!onBand && (
        <button type="button" disabled className="inline-flex min-h-12 cursor-not-allowed items-center rounded-full bg-line px-6 font-heading text-[15px] font-semibold text-fg-muted">
          Disabled
        </button>
      )}
    </div>
  );
}

function ProductCard() {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-shadow hover:shadow-raised">
      <div className="aspect-[16/9] bg-[url('/images/products/banner-maxdmold.jpg'),linear-gradient(135deg,#c8a24a,#7a6a3a)] bg-cover bg-center" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-bold text-fg">MaxDmold</h3>
          <span className="rounded-md bg-action/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-action-text ring-1 ring-action/25">Mono-gastric</span>
        </div>
        <p className="mt-1.5 text-sm italic text-fg-soft">Bio-copper power. Dual-action mould shield.</p>
        <a href="#cards" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-action-text">Learn more →</a>
      </div>
    </article>
  );
}

function InfoCard() {
  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tint text-link">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 3h6M10 3v6L4.5 18.5A1.6 1.6 0 0 0 5.9 21h12.2a1.6 1.6 0 0 0 1.4-2.5L14 9V3" /></svg>
      </span>
      <h3 className="mt-4 font-heading text-lg font-bold text-fg">Research-led</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-fg-soft">Five research platforms behind 18 additives, with DBT/BIRAC and TDB support.</p>
    </div>
  );
}

function Badges() {
  const badge = "rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ring-1";
  return (
    <div className="flex flex-wrap gap-2">
      <span className={`${badge} bg-action/10 text-action-text ring-action/25`}>Mono-gastric</span>
      <span className={`${badge} bg-link/10 text-link ring-link/25`}>Ruminants</span>
      <span className={`${badge} bg-ok/10 text-ok ring-ok/25`}>Value addition</span>
      <span className={`${badge} bg-sunken text-fg-muted ring-line`}>Blog</span>
      <span className={`${badge} bg-warn/10 text-warn ring-warn/25`}>Waiting</span>
      <span className={`${badge} bg-bad/10 text-bad ring-bad/25`}>Hidden</span>
    </div>
  );
}

function Form() {
  const field = "mt-1.5 block w-full min-h-12 rounded-xl border border-line-strong bg-card px-4 text-[15px] text-fg placeholder:text-fg-muted focus:border-link focus:outline-none focus:ring-2 focus:ring-link/30";
  return (
    <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
      <label className="block text-xs font-bold uppercase tracking-wider text-fg">
        Full name <span className="text-action-text">*</span>
        <input className={field} placeholder="Your full name" />
      </label>
      <label className="block text-xs font-bold uppercase tracking-wider text-fg">
        Enquiry type
        <select className={field} defaultValue="product">
          <option value="product">Product enquiry</option>
          <option value="dossier">Technical dossier</option>
        </select>
      </label>
      <label className="block text-xs font-bold uppercase tracking-wider text-fg">
        Email
        <input className={`${field} border-bad focus:border-bad focus:ring-bad/30`} defaultValue="name@company" aria-invalid="true" />
        <span className="mt-1.5 block text-xs font-semibold normal-case tracking-normal text-bad">Enter a full email address, like name@company.com</span>
      </label>
      <label className="flex items-center gap-3 text-sm text-fg-soft">
        <input type="checkbox" defaultChecked className="h-5 w-5 accent-[var(--ds-link)]" />
        Send me the product dossier
      </label>
    </form>
  );
}

function Sections() {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="bg-page px-5 py-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-link">Our products</p>
        <h3 className="mt-1.5 font-heading text-xl font-bold text-fg">Feed additives that work</h3>
        <p className="mt-1.5 text-sm text-fg-soft">The page: most content sits here.</p>
      </div>
      <div className="border-y border-line bg-sunken px-5 py-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-link">How we do it</p>
        <h3 className="mt-1.5 font-heading text-xl font-bold text-fg">From research to the farm</h3>
        <p className="mt-1.5 text-sm text-fg-soft">Sunken: alternate sections, so long pages have rhythm.</p>
      </div>
      <div className="relative bg-band px-5 py-8 text-on-band">
        <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(#9fb2cc_1px,transparent_1px)] [background-size:18px_18px]" />
        <p className="relative text-xs font-bold uppercase tracking-[0.14em] text-link-on-band">Work with us</p>
        <h3 className="relative mt-1.5 font-heading text-xl font-bold text-on-band">Want the technical dossier?</h3>
        <p className="relative mt-1.5 text-sm text-on-band-soft">Band: the brand moments, page headers and calls to action.</p>
        <div className="relative mt-4"><Buttons onBand /></div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-band">
      <div className="absolute inset-0 bg-[url('/images/products/products-hero-bg.png'),linear-gradient(135deg,#3b6696,#1f3a60)] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-r from-band via-band/80 to-band/30" />
      <div className="relative px-5 py-10 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-link-on-band">Our offerings</p>
        <h3 className="mt-2 max-w-sm font-heading text-3xl font-bold leading-tight text-on-band">Feed additives &amp; solutions</h3>
        <p className="mt-2 max-w-sm text-sm text-on-band-soft">Photos sit under a band-coloured wash, so headers match each theme.</p>
      </div>
    </div>
  );
}

// ---------- The page ----------

const NAV = [
  ["colours", "Colour roles"],
  ["type", "Type"],
  ["buttons", "Buttons"],
  ["cards", "Cards"],
  ["badges", "Badges"],
  ["forms", "Forms"],
  ["sections", "Sections"],
  ["headers", "Page headers"],
];

export default function DesignSystem() {
  return (
    <main className="min-h-screen bg-white pt-18 md:pt-20 lg:pt-24">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-[1200px] px-6 py-10 md:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-aa">Redesign · design system</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-brand-navy md:text-4xl">One design, two themes</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Every piece below uses colour roles (page, card, text, line, action) rather than fixed colours, so light and dark come from the same
            design. Each one is shown in both. The dark side follows the palette picked in the footer.
          </p>
          <nav aria-label="On this page" className="mt-5 flex flex-wrap gap-2">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-brand-navy hover:border-brand-navy">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6">
        <Block id="colours" title="Colour roles" intro="Twelve roles cover the whole site. Components only ever use these, never a hex value, so a new theme or palette is a change in one place.">
          <Both>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ROLES.map((r) => (
                <li key={r.name} className="min-w-0">
                  <span className={`block h-12 rounded-lg ring-1 ring-line ${r.cls}`} />
                  <span className="mt-1.5 block font-mono text-xs font-semibold text-fg">{r.name}</span>
                  <span className="block text-xs text-fg-muted">{r.use}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line pt-4">
              <ContrastTable />
            </div>
          </Both>
        </Block>

        <Block id="type" title="Type" intro="Maven Pro throughout. Headings in the strongest text colour, body a step softer, captions softer again: the same hierarchy in both themes.">
          <Both>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-link">Eyebrow label</p>
            <h3 className="mt-1 font-heading text-4xl font-bold leading-tight text-fg">Nature-driven feed additives</h3>
            <h4 className="mt-3 font-heading text-2xl font-bold text-fg">Section heading</h4>
            <h5 className="mt-2 font-heading text-lg font-bold text-fg">Card heading</h5>
            <p className="mt-2 leading-relaxed text-fg-soft">
              Body text: ChemLife develops functional feed additives from botanicals and minerals, using green chemistry and our own
              research platforms. <a href="#type" className="font-semibold text-link underline decoration-2 underline-offset-4">An inline link</a>.
            </p>
            <p className="mt-2 text-sm text-fg-muted">Caption or label: Updated 25 October 2026 · 5 min read</p>
          </Both>
        </Block>

        <Block id="buttons" title="Buttons" intro="One orange main action per view, an outline for the second choice, and text links for the rest. The same three on brand bands.">
          <Both>
            <Buttons />
            <div className="mt-5 rounded-xl bg-band p-5">
              <Buttons onBand />
            </div>
          </Both>
        </Block>

        <Block id="cards" title="Cards" intro="Cards sit on the page with a hairline border. In light they lift with a soft shadow; in dark, with a lighter surface and a line, since shadows barely show on dark.">
          <Both>
            <div className="grid gap-4 sm:grid-cols-2">
              <ProductCard />
              <InfoCard />
            </div>
            <div className="mt-4 rounded-2xl bg-raised p-5 shadow-raised">
              <h3 className="font-heading text-base font-bold text-fg">Raised: menus, pop-ups, the chat window</h3>
              <p className="mt-1 text-sm text-fg-soft">One step above cards.</p>
            </div>
          </Both>
        </Block>

        <Block id="badges" title="Badges" intro="Tinted, with a matching outline and strong text, so they read on any surface in either theme.">
          <Both>
            <Badges />
          </Both>
        </Block>

        <Block id="forms" title="Forms" intro="Fields are cards with a stronger line; focus is a teal ring; errors say what to do.">
          <Both>
            <Form />
          </Both>
        </Block>

        <Block id="sections" title="Sections" intro="Three backgrounds give long pages rhythm: the page, a sunken alternate, and the brand band for key moments.">
          <Both>
            <Sections />
          </Both>
        </Block>

        <Block id="headers" title="Page headers" intro="Photo headers sit under a wash of the band colour, so they match the theme instead of staying navy in dark.">
          <Both>
            <Hero />
          </Both>
        </Block>
      </div>
    </main>
  );
}
