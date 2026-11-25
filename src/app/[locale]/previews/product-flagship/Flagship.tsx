import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { slugify } from "@/lib/catalog";
import { PURITY_LIMITS, SAFETY, qualityAssurance } from "@/lib/productData";
import { Icon, type IconName } from "../../products/[slug]/icons";
import { ASSURANCES, NUTRITIONIST_HREF, ProductImage, documentsHref, enquiryHref, glance, protection, type PreviewProduct, type Row } from "../product-page/kit";
import DoseCalculator from "./DoseCalculator";
import { TrialCharts, ZoneChart } from "./Charts";
import SectionNav from "./SectionNav";
import { DOSES, PLATES, TRIALS } from "./evidence";

// The flagship product page. It answers a buyer's questions in the order they ask them: what is it, how does
// it work, where is the proof, what are the figures, how do I dose it, is it safe. The proof is the centre of
// the page: the data sheet's own plate photographs and trial figures on a dark band, where the lab photographs
// (shot on black) sit naturally. The inclusion rate gets the one orange panel, with a batch calculator.

const wrap = "max-w-[1240px] mx-auto px-6 md:px-8";
const section = "scroll-mt-28 md:scroll-mt-48 py-16 md:py-24";
const eyebrow = "text-[0.8125rem] font-bold uppercase tracking-[0.14em]";
const heading = "font-heading text-3xl md:text-[2.5rem] font-bold tracking-tight leading-[1.1] text-brand-navy";
const TINT = "bg-[#f3f6fa]";
const INK = "bg-[#15273F]";

const Title = ({ kicker, children }: { kicker: string; children: ReactNode }) => (
  <>
    <p className={`${eyebrow} text-brand-orange-aa`}>{kicker}</p>
    <h2 className={`${heading} mt-3`}>{children}</h2>
  </>
);

/** A ruled table of parameter and value, as on the data sheet. */
const SpecTable = ({ title, rows, stacked = false }: { title: string; rows: readonly Row[]; stacked?: boolean }) => (
  <div>
    <h3 className={`${eyebrow} text-slate-600 pb-3 border-b-2 border-brand-navy`}>{title}</h3>
    <dl>
      {rows.map(([label, value]) => (
        <div key={label} className={`border-b border-brand-navy/10 py-3.5 ${stacked ? "" : "grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-x-6"}`}>
          <dt className={stacked ? "font-bold text-brand-navy" : "text-slate-600"}>{label}</dt>
          <dd className={stacked ? "mt-1 text-slate-700 leading-relaxed" : "font-semibold text-brand-navy tabular-nums"}>{value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const Prose = ({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) => (
  <div>
    <h3 className="flex items-center gap-3 text-xl md:text-2xl font-bold text-brand-navy">
      <Icon name={icon} className="w-7 h-7 text-brand-orange-aa" />
      {title}
    </h3>
    <div className="mt-3 space-y-4 text-base md:text-lg leading-relaxed text-slate-700 max-w-[65ch]">{children}</div>
  </div>
);

type DoseLine = { kind: "lead" | "head" | "note"; text: string } | { kind: "row"; label: string; value: string };

/**
 * The inclusion rate is written as lines of text ("Broilers: 1-2 mL/L of water"). This reads them as a table:
 * "who: how much" rows, headings that end in a colon, and the "or as recommended" line as a note.
 */
function doseLines(text: string): DoseLine[] {
  const sentence = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line): DoseLine[] => {
      const aside = line.match(/^(.*?)\s*\((or as [^)]*)\)$/i);
      if (aside) return [{ kind: "lead", text: aside[1] }, { kind: "note", text: sentence(aside[2]) }];
      if (line.endsWith(":")) return [{ kind: "head", text: line.slice(0, -1) }];
      if (/^or as /i.test(line)) return [{ kind: "note", text: line }];
      const pair = line.match(/^([^:]+):\s+(.+)$/);
      return [pair ? { kind: "row", label: pair[1], value: pair[2] } : { kind: "lead", text: line }];
    });
}

export default function Flagship({ product, products }: { product: PreviewProduct; products: { name: string; slug: string }[] }) {
  const { data, name } = product;
  const { efficacy } = data;
  const trials = TRIALS[name];
  const dose = DOSES[name];
  // The first sentence of "Intended use" says what the product is for; it is set larger than the rest.
  const [lead, ...rest] = data.intendedUse.split(/(?<=\.)\s+/);
  const lines = doseLines(product.inclusionRate);

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "how-it-works", label: "How it works" },
    ...(efficacy ? [{ id: "evidence", label: "Evidence" }] : []),
    { id: "specifications", label: "Specifications" },
    { id: "use", label: "Dosing and use" },
    { id: "quality", label: "Quality and safety" },
  ];

  return (
    <main id="main" tabIndex={-1} className="bg-white pt-32 text-slate-800">
      {/* For the reviewer: back to the previews, and the same design on each product that has approved data. */}
      <div className="border-b border-brand-navy/10">
        <div className={`${wrap} flex items-center gap-x-5 py-2.5`}>
          <Link href="/previews" className="flex-shrink-0 text-sm font-semibold text-brand-navy/70 hover:text-brand-navy">← Previews</Link>
          <nav aria-label="Show this design on another product" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {products.map((item) => (
              <Link
                key={item.slug}
                href={`/previews/product-flagship?product=${item.slug}`}
                aria-current={item.name === name ? "page" : undefined}
                className="flex-shrink-0 inline-flex items-center min-h-9 rounded-full border border-brand-navy/20 px-3.5 text-sm font-semibold text-brand-navy transition-colors hover:border-brand-navy aria-[current]:border-brand-navy aria-[current]:bg-brand-navy aria-[current]:text-white"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* The product: its photograph runs off the right edge and dissolves into the navy behind the name. */}
      <div className="relative isolate overflow-hidden bg-[linear-gradient(110deg,#1f3a61_0%,#305280_62%)] text-white">
        <div className="relative h-56 sm:h-72 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[56%] lg:max-w-[1040px] [mask-image:linear-gradient(to_bottom,#000_50%,transparent)] lg:[mask-image:linear-gradient(to_right,transparent,#000_45%)]">
          {product.banner && <Image src={product.banner} alt={`${name} product picture`} fill priority sizes="(min-width: 1024px) 56vw, 100vw" className="object-cover" />}
        </div>
        <div className={`${wrap} relative pb-32 lg:pt-20 lg:pb-44`}>
          <div className="lg:max-w-[36rem]">
            <nav aria-label="Breadcrumb" className="text-sm text-white/75">
              <Link href="/products" className="tap-target hover:text-white hover:underline underline-offset-4">Products</Link>
              <span aria-hidden="true" className="mx-2">/</span>
              {product.category}
            </nav>
            <h1 className="mt-5 font-heading font-bold text-white tracking-[-0.035em] leading-[0.95] text-[clamp(2.75rem,7.4vw,5.25rem)]">{name}</h1>
            {product.tagline && <p className="mt-5 text-xl md:text-2xl font-semibold leading-snug text-brand-gold">{product.tagline}</p>}
            <p className="mt-5 text-base md:text-lg leading-relaxed text-white/90 whitespace-pre-line">{product.about}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={enquiryHref(name)} className="inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors">
                Enquire about {name}
              </a>
              <a href={documentsHref(name)} className="inline-flex items-center justify-center min-h-12 px-7 rounded-full border-2 border-white/80 text-white font-semibold hover:bg-white hover:text-brand-navy transition-colors">
                Request the TDS and SDS
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* The four facts a buyer checks first, on a card that sits across the hero's lower edge. */}
      <div className={`${wrap} relative z-10 -mt-20 lg:-mt-24`}>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl bg-brand-navy/10 ring-1 ring-brand-navy/10 shadow-[0_28px_60px_-30px_rgb(21_39_63/0.55)]">
          {glance(product).map(([icon, title, value]) => (
            <div key={title} className="flex gap-4 bg-white p-5 md:p-6">
              <Icon name={icon} className="w-8 h-8 text-brand-orange-aa" />
              <div>
                <dt className={`${eyebrow} text-slate-600`}>{title}</dt>
                <dd className="mt-1.5 font-bold leading-snug text-brand-navy">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      {/* A direct child of the page, so it can follow the visitor all the way down. */}
      <SectionNav sections={sections} cta={{ href: enquiryHref(name), label: `Enquire about ${name}` }} />

      {/* Overview: what it is for, what it does, what is in it */}
      <section id="overview" className={section}>
        <div className={wrap}>
          <div className="grid lg:grid-cols-12 gap-x-16 gap-y-12">
            <Reveal className="lg:col-span-7">
              <Title kicker="Overview">What {name} is for</Title>
              <p className="mt-6 text-xl md:text-2xl font-medium leading-snug text-brand-navy">{lead}</p>
              {rest.length > 0 && <p className="mt-5 text-base md:text-lg leading-relaxed text-slate-700 max-w-[65ch]">{rest.join(" ")}</p>}
            </Reveal>
            <Reveal className="lg:col-span-5" delay={0.1}>
              <h3 className={`${eyebrow} text-slate-600 pb-3 border-b-2 border-brand-navy`}>Benefits</h3>
              <ul>
                {(data.benefits ?? product.features).map((benefit) => (
                  <li key={benefit} className="flex gap-3 border-b border-brand-navy/10 py-3.5 font-medium text-brand-navy">
                    <svg aria-hidden="true" className="mt-1 w-5 h-5 flex-shrink-0 text-brand-orange-aa" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal className="mt-14 md:mt-20 grid lg:grid-cols-12 gap-x-16 gap-y-6 border-t border-brand-navy/10 pt-12 md:pt-14">
            <div className="lg:col-span-4">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-navy">What&rsquo;s inside</h3>
              {data.composition.note && <p className="mt-3 text-slate-700 leading-relaxed">{data.composition.note}</p>}
            </div>
            <div className="lg:col-span-8">
              {data.composition.items && (
                <ul className={`grid gap-3 ${data.composition.items.length > 1 ? "sm:grid-cols-2" : ""}`}>
                  {data.composition.items.map((item) => (
                    <li key={item} className={`flex items-center gap-4 rounded-xl ${TINT} px-5 py-4 text-lg font-semibold leading-snug text-brand-navy`}>
                      <span aria-hidden="true" className="w-2.5 h-2.5 flex-shrink-0 rotate-45 bg-brand-orange" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {/* A liquid's contents, set like the panel on its label */}
              {data.composition.table && (
                <div className="rounded-2xl border-2 border-brand-navy px-6 pt-5 pb-3 md:px-8">
                  <p className="border-b-4 border-brand-navy pb-3 text-xl font-bold text-brand-navy">{data.composition.per}</p>
                  <dl className="sm:columns-2 gap-x-12">
                    {data.composition.table.map(([label, value]) => (
                      <div key={label} className="flex items-baseline justify-between gap-4 break-inside-avoid border-b border-brand-navy/15 py-2.5">
                        <dt className="text-slate-700">{label}</dt>
                        <dd className="font-bold text-brand-navy whitespace-nowrap tabular-nums">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works: the mode of action, in the data sheet's order */}
      <section id="how-it-works" className={`${section} ${TINT}`}>
        <div className={`${wrap} grid lg:grid-cols-12 gap-x-16 gap-y-10`}>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-56">
              <Title kicker="Mode of action">How it works</Title>
              <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-700">
                {name} acts in {data.mechanism.length} ways, as set out in its technical data sheet.
              </p>
            </div>
          </div>
          <ol className="lg:col-span-8">
            {data.mechanism.map(([step, text], i) => (
              <Reveal as="li" key={step} delay={i * 0.06} className="relative grid grid-cols-[3rem_1fr] gap-x-5 md:gap-x-7 pb-9 last:pb-0">
                {i < data.mechanism.length - 1 && <span aria-hidden="true" className="absolute left-6 top-12 bottom-0 w-px bg-brand-navy/20" />}
                <span aria-hidden="true" className="relative grid place-items-center w-12 h-12 rounded-full bg-white ring-1 ring-brand-navy/15 text-lg font-bold text-brand-orange-aa tabular-nums">
                  {i + 1}
                </span>
                <div className="pt-2">
                  <h3 className="text-xl md:text-2xl font-bold leading-snug text-brand-navy">{step}</h3>
                  <p className="mt-2 text-base md:text-lg leading-relaxed text-slate-700 max-w-[60ch]">{text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Evidence: the lab plates and the trial, on the dark band */}
      {efficacy && (
        <section id="evidence" className={`${section} ${INK} text-white`}>
          <div className={wrap}>
            <Reveal className="max-w-3xl">
              <p className={`${eyebrow} text-brand-gold`}>Evidence</p>
              <h2 className={`${heading} mt-3 !text-white`}>Tested in the lab{efficacy.inVivo ? ", proven in the flock" : ""}</h2>
            </Reveal>

            <div className="mt-12 md:mt-14">
              <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-white">In vitro: zone of inhibition</h3>
                <p className="text-white/75 max-w-xl">The clear ring around each well is where growth stopped. The wider the zone, the stronger the effect.</p>
              </div>
              <div className="mt-9">
                <ZoneChart rows={efficacy.inVitro} plates={PLATES[name]} />
              </div>
              <p className="mt-9 max-w-[75ch] text-base md:text-lg leading-relaxed text-white/85">{efficacy.inVitroNote}</p>
              {PLATES[name] && <p className="mt-3 text-sm text-white/65">Plate photographs from the {name} technical data sheet.</p>}
            </div>

            {efficacy.inVivo && (
              <Reveal className="mt-14 md:mt-16 border-t border-white/15 pt-12 md:pt-14">
                <div className="grid lg:grid-cols-12 gap-x-16 gap-y-4">
                  <h3 className="lg:col-span-5 text-xl md:text-2xl font-bold text-white">In vivo: poultry performance trial</h3>
                  <p className="lg:col-span-7 text-white/75">{efficacy.inVivo.source}</p>
                </div>
                {trials && (
                  <div className="mt-8">
                    <TrialCharts results={trials} name={name} />
                  </div>
                )}
                <p className="mt-9 max-w-[75ch] text-base md:text-lg leading-relaxed text-white/85">{efficacy.inVivo.text}</p>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* Specifications: the data sheet's tables, with its document numbers */}
      <section id="specifications" className={section}>
        <div className={wrap}>
          <Reveal className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
            <div>
              <Title kicker="Technical data">Specifications</Title>
            </div>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <dl className="flex gap-x-8 text-sm">
                {(
                  [
                    ["Technical Data Sheet", data.documents.tds],
                    ["Safety Data Sheet", data.documents.sds],
                  ] as const
                ).map(([title, reference]) => (
                  <div key={title}>
                    <dt className="text-slate-600">{title}</dt>
                    <dd className="font-bold text-brand-navy tabular-nums">{reference}</dd>
                  </div>
                ))}
              </dl>
              <a href={documentsHref(name)} className="inline-flex items-center justify-center min-h-11 px-6 rounded-full border-2 border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors">
                Request the TDS and SDS
              </a>
            </div>
          </Reveal>
          <Reveal className="mt-10 md:mt-12 grid lg:grid-cols-12 gap-x-16 gap-y-12">
            <div className="lg:col-span-7">
              <SpecTable title="Technical specifications" rows={data.specs} />
            </div>
            <div className="lg:col-span-5 space-y-12">
              <SpecTable title="Stability and storage" rows={data.storage} />
              <SpecTable title="Purity limits" rows={PURITY_LIMITS} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Dosing and use: the inclusion rate on the orange panel, then how to apply it */}
      <section id="use" className={`${section} ${TINT}`}>
        <div className={wrap}>
          <Reveal>
            <Title kicker="Use">Dosing and application</Title>
          </Reveal>
          <div className="mt-10 md:mt-12 grid lg:grid-cols-12 gap-x-16 gap-y-12 items-start">
            <Reveal className="lg:col-span-5 rounded-3xl bg-brand-orange-aa p-7 md:p-9 text-white">
              <h3 className={`${eyebrow} text-white`}>Inclusion rate</h3>
              <div className="mt-3">
                {lines.map((line) =>
                  line.kind === "row" ? (
                    <p key={line.label + line.value} className="flex items-baseline justify-between gap-5 border-b border-white/30 py-2.5">
                      <span>{line.label}</span>
                      <span className="max-w-[58%] text-right font-bold tabular-nums">{line.value}</span>
                    </p>
                  ) : line.kind === "lead" ? (
                    <p key={line.text} className={`font-bold leading-tight ${line.text.length < 40 ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"}`}>{line.text}</p>
                  ) : line.kind === "head" ? (
                    <p key={line.text} className={`${eyebrow} pt-6 text-white`}>{line.text}</p>
                  ) : (
                    <p key={line.text} className="pt-3 text-[0.9375rem] text-white">{line.text}</p>
                  ),
                )}
              </div>
              <div className="mt-6 flex items-baseline justify-between gap-5 border-t border-white/30 pt-5">
                <h3 className={`${eyebrow} text-white`}>Pack size</h3>
                <p className="text-xl font-bold">{product.packSize}</p>
              </div>
              {dose && <DoseCalculator dose={dose} name={name} />}
            </Reveal>

            <Reveal className="lg:col-span-7 space-y-10" delay={0.1}>
              <Prose icon="apply" title="How to apply">
                <p>{data.application}</p>
              </Prose>
              <Prose icon="compatibility" title="Compatibility">
                <p>{data.compatibility}</p>
              </Prose>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Quality and safety */}
      <section id="quality" className={section}>
        <div className={wrap}>
          <Reveal>
            <Title kicker="Assurance">Quality and safety</Title>
          </Reveal>
          <Reveal className="mt-10 md:mt-12 grid md:grid-cols-3 gap-px overflow-hidden rounded-2xl bg-brand-navy/10 ring-1 ring-brand-navy/10">
            {ASSURANCES.map(([icon, title, value]) => (
              <div key={title} className="bg-white p-6 md:p-7">
                <Icon name={icon} className="w-9 h-9 text-brand-orange-aa" />
                <p className={`${eyebrow} mt-4 text-slate-600`}>{title}</p>
                <p className="mt-1.5 text-lg font-bold leading-snug text-brand-navy">{value}</p>
              </div>
            ))}
          </Reveal>
          <div className="mt-12 md:mt-14 grid lg:grid-cols-12 gap-x-16 gap-y-12">
            <Reveal className="lg:col-span-7 space-y-10">
              <Prose icon="limits" title="Quality assurance">
                <p>{qualityAssurance(name)}</p>
              </Prose>
              <Prose icon="safety" title="Safety and handling">
                {data.handling.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </Prose>
            </Reveal>
            <Reveal className="lg:col-span-5" delay={0.1}>
              <SpecTable
                stacked
                title="Handling"
                rows={[
                  ["Personal protection", protection(data)],
                  ["Disposal", SAFETY.disposal],
                  ["Restrictions", SAFETY.restriction],
                ]}
              />
            </Reveal>
          </div>
          <Reveal className="mt-12 md:mt-14">
            <h3 className={`${eyebrow} text-slate-600 pb-3 border-b-2 border-brand-navy`}>First aid</h3>
            <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-10">
              {SAFETY.firstAid.map(([route, advice]) => (
                <div key={route} className="border-b border-brand-navy/10 py-4 lg:border-b-0">
                  <dt className="font-bold text-brand-navy">{route}</dt>
                  <dd className="mt-1 text-slate-700 leading-relaxed">{advice}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* The ask */}
      <div className="bg-[linear-gradient(110deg,#1f3a61_0%,#305280_62%)] text-white">
        <div className={`${wrap} py-14 md:py-20 flex flex-wrap items-center justify-between gap-x-12 gap-y-8`}>
          <div className="max-w-xl">
            <h2 className={`${heading} !text-white`}>Is {name} right for your feed?</h2>
            <p className="mt-4 text-lg text-white/90">Talk it through with one of our nutritionists, or send us an enquiry.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={NUTRITIONIST_HREF} className="inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-white text-brand-navy font-semibold hover:bg-brand-gold transition-colors">
              Talk to a nutritionist
            </Link>
            <a href={enquiryHref(name)} className="inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors">
              Enquire about {name}
            </a>
          </div>
        </div>
      </div>

      {product.related.length > 0 && (
        <section className="py-16 md:py-20">
          <div className={wrap}>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-navy">More for the same animals</h2>
            <ul className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
              {product.related.map((item) => (
                <li key={item.name}>
                  <Link href={previewPath(products, item.name) ?? item.path} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f3f6fa]">
                      <ProductImage src={item.banner} icon={item.icon} alt="" sizes="(min-width: 1024px) 290px, 50vw" />
                    </div>
                    <p className="mt-4 text-lg font-bold text-brand-navy group-hover:text-brand-orange-aa transition-colors">{item.name}</p>
                    {item.tagline && <p className="mt-1 text-[0.9375rem] leading-snug text-slate-600">{item.tagline}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}

/** A related product opens in this design where it has approved data, and on its current page where it has none. */
function previewPath(products: { name: string; slug: string }[], name: string) {
  return products.some((item) => item.name === name) ? `/previews/product-flagship?product=${slugify(name)}` : undefined;
}
