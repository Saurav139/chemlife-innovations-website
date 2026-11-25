"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { PURITY_LIMITS, SAFETY, qualityAssurance } from "@/lib/productData";
import { Icon } from "../../products/[slug]/icons";
import { ASSURANCES, Composition, NUTRITIONIST_HREF, ProductImage, Related, ZoneBars, documentsHref, enquiryHref, glance, protection, type PreviewProduct, type Row } from "./kit";

// C: a short, tabbed page, as large ingredient companies set out a product. A white hero, the four key
// facts on a navy bar, then four tabs (Overview, Specifications, Use, Quality and safety) so nothing needs a
// long scroll, and a closing band that asks for the enquiry.

const label = "text-xs font-bold uppercase tracking-[0.16em]";
const panelHeading = "font-heading text-xl md:text-2xl font-bold text-brand-navy mb-4";

/** A quiet table: a heading, then hairline rows. */
const PlainTable = ({ title, rows }: { title: string; rows: readonly Row[] }) => (
  <div>
    <h3 className={`${label} text-slate-600 pb-3 border-b-2 border-brand-navy`}>{title}</h3>
    <table className="w-full text-left text-[0.9375rem]">
      <tbody className="divide-y divide-slate-200">
        {rows.map(([name, value]) => (
          <tr key={name}>
            <th scope="row" className="w-[44%] py-3 pr-4 font-medium text-slate-600 align-top">{name}</th>
            <td className="py-3 font-semibold text-brand-navy align-top">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TABS = ["Overview", "Specifications", "Use and application", "Quality and safety"] as const;

// The steps of "How it works" in one row where they fit: products have four, five or six.
const STEP_COLUMNS: Record<number, string> = { 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-3" };

export default function Executive({ product }: { product: PreviewProduct }) {
  const { data, name } = product;
  const [tab, setTab] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const go = (next: number) => {
    const wrapped = (next + TABS.length) % TABS.length;
    setTab(wrapped);
    buttons.current[wrapped]?.focus();
  };

  const panels: ReactNode[] = [
    // Overview
    <div key="overview" className="space-y-12">
      <div className="grid lg:grid-cols-12 gap-x-16 gap-y-8">
        <div className="lg:col-span-7">
          <h2 className={panelHeading}>What it does</h2>
          <p className="text-base md:text-lg leading-relaxed text-slate-700">{data.intendedUse}</p>
        </div>
        <div className="lg:col-span-5">
          <h2 className={panelHeading}>Benefits</h2>
          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            {(data.benefits ?? product.features).map((benefit) => (
              <li key={benefit} className="flex gap-3 py-2.5 text-slate-800">
                <span aria-hidden="true" className="mt-2 w-1.5 h-1.5 flex-shrink-0 bg-brand-orange-aa" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h2 className={panelHeading}>How it works</h2>
        <ol className={`grid sm:grid-cols-2 ${STEP_COLUMNS[data.mechanism.length] ?? "lg:grid-cols-3"} border-t border-l border-slate-200`}>
          {data.mechanism.map(([step, text], i) => (
            <li key={step} className="border-r border-b border-slate-200 p-5">
              <span aria-hidden="true" className={`${label} text-brand-orange-aa`}>Step {i + 1}</span>
              <p className="font-bold text-brand-navy mt-2 leading-snug">{step}</p>
              <p className="text-sm text-slate-700 leading-relaxed mt-2">{text}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="max-w-3xl">
        <h2 className={panelHeading}>Composition</h2>
        <Composition data={data} listClass="flex flex-wrap gap-2 [&>li]:border [&>li]:border-slate-300 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-semibold [&>li]:text-brand-navy" />
      </div>
    </div>,

    // Specifications
    <div key="specifications" className="grid lg:grid-cols-2 gap-x-16 gap-y-10">
      <PlainTable title="Technical specifications" rows={data.specs} />
      <div className="space-y-10">
        <PlainTable title="Stability and storage" rows={data.storage} />
        <PlainTable title="Purity limits" rows={PURITY_LIMITS} />
      </div>
    </div>,

    // Use and application
    <div key="use" className="space-y-12">
      <div className="grid lg:grid-cols-12 gap-x-16 gap-y-8">
        <div className="lg:col-span-5">
          <div className="bg-slate-50 border border-slate-200 p-6 md:p-8">
            <h2 className={`${label} text-slate-600`}>Inclusion rate</h2>
            <p className="mt-3 font-semibold text-brand-navy whitespace-pre-line leading-relaxed">{product.inclusionRate}</p>
            <h2 className={`${label} text-slate-600 mt-6`}>Pack size</h2>
            <p className="mt-2 font-semibold text-brand-navy">{product.packSize}</p>
          </div>
        </div>
        <div className="lg:col-span-7 space-y-8">
          <div>
            <h2 className={panelHeading}>How to apply</h2>
            <p className="leading-relaxed text-slate-700">{data.application}</p>
          </div>
          <div>
            <h2 className={panelHeading}>Compatibility</h2>
            <p className="leading-relaxed text-slate-700">{data.compatibility}</p>
          </div>
        </div>
      </div>
      {data.efficacy && (
        <div className="border-t border-slate-200 pt-10 grid lg:grid-cols-12 gap-x-16 gap-y-8 items-start">
          <div className="lg:col-span-5">
            <h2 className={panelHeading}>Trial results</h2>
            <ZoneBars rows={data.efficacy.inVitro} />
          </div>
          <div className="lg:col-span-7 space-y-4 leading-relaxed text-slate-700">
            <p>{data.efficacy.inVitroNote}</p>
            {data.efficacy.inVivo && (
              <>
                <p>{data.efficacy.inVivo.text}</p>
                <p className="text-sm font-semibold text-brand-navy">{data.efficacy.inVivo.source}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>,

    // Quality and safety
    <div key="quality" className="space-y-10">
      <div className="grid md:grid-cols-3 gap-px bg-slate-200 border border-slate-200">
        {ASSURANCES.map(([icon, title, value]) => (
          <div key={title} className="bg-white p-6">
            <Icon name={icon} className="w-8 h-8 text-brand-navy" />
            <p className={`${label} text-slate-600 mt-4`}>{title}</p>
            <p className="font-bold text-brand-navy mt-1.5 leading-snug">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-12 gap-x-16 gap-y-8">
        <div className="lg:col-span-7 space-y-4 leading-relaxed text-slate-700">
          <h2 className={panelHeading}>Quality assurance</h2>
          <p>{qualityAssurance(name)}</p>
          <h2 className={`${panelHeading} pt-4`}>Safety and handling</h2>
          {data.handling.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>{SAFETY.restriction}</p>
        </div>
        <div className="lg:col-span-5 space-y-8">
          <PlainTable
            title="Handling"
            rows={[
              ["Personal protection", protection(data)],
              ["Disposal", SAFETY.disposal],
            ]}
          />
          <PlainTable title="First aid" rows={SAFETY.firstAid} />
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="bg-white text-slate-800">
      {/* Hero: the product in a sentence, and the two things to do */}
      <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-12 md:pb-16 grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-6">
          <p className={`${label} text-brand-orange-aa`}>{product.category}</p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-brand-navy mt-3 leading-tight">{name}</h1>
          {product.tagline && <p className="text-xl text-brand-navy/80 mt-3">{product.tagline}</p>}
          <p className="text-base md:text-lg leading-relaxed text-slate-700 mt-5 whitespace-pre-line">{product.about}</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <a href={enquiryHref(name)} className="inline-flex items-center justify-center min-h-12 px-7 bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors">Enquire about {name}</a>
            <a href={documentsHref(name)} className="inline-flex items-center justify-center min-h-12 px-7 border border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors">Request the TDS and SDS</a>
          </div>
        </div>
        <div className="lg:col-span-6 relative">
          <div aria-hidden="true" className="absolute -right-3 -bottom-3 w-2/3 h-2/3 bg-brand-navy" />
          <div className="relative aspect-[4/3] bg-white border border-slate-200 overflow-hidden">
            <ProductImage src={product.banner} icon={product.icon} alt={`${name} product picture`} sizes="(min-width: 1024px) 560px, 100vw" priority />
          </div>
        </div>
      </div>

      {/* The four key facts */}
      <div className="bg-brand-navy text-white">
        <dl className="max-w-[1200px] mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 lg:divide-x divide-white/20">
          {glance(product).map(([, title, value]) => (
            <div key={title} className="py-6 lg:px-6 lg:first:pl-0">
              <dt className={`${label} text-white/70`}>{title}</dt>
              <dd className="mt-2 font-bold text-lg leading-snug">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div role="tablist" aria-label={`${name} details`} className="max-w-[1200px] mx-auto px-6 flex gap-x-8 overflow-x-auto [scrollbar-width:none]">
          {TABS.map((title, i) => (
            <button
              key={title}
              ref={(el) => { buttons.current[i] = el; }}
              type="button"
              role="tab"
              id={`executive-tab-${i}`}
              aria-selected={tab === i}
              aria-controls="executive-panel"
              tabIndex={tab === i ? 0 : -1}
              onClick={() => setTab(i)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") { event.preventDefault(); go(i + 1); }
                if (event.key === "ArrowLeft") { event.preventDefault(); go(i - 1); }
              }}
              className={`flex-shrink-0 h-16 whitespace-nowrap border-b-[3px] font-semibold transition-colors ${tab === i ? "border-brand-orange-aa text-brand-navy" : "border-transparent text-slate-600 hover:text-brand-navy"}`}
            >
              {title}
            </button>
          ))}
        </div>
      </div>
      <div id="executive-panel" role="tabpanel" aria-labelledby={`executive-tab-${tab}`} tabIndex={0} className="max-w-[1200px] mx-auto px-6 py-10 md:py-14">
        {panels[tab]}
      </div>

      {/* Closing band */}
      <div className="bg-slate-100 border-y border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-12 flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy">Is {name} right for your feed?</h2>
            <p className="text-slate-700 mt-2">Talk it through with one of our nutritionists, or send us an enquiry.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={NUTRITIONIST_HREF} className="inline-flex items-center justify-center min-h-12 px-7 bg-brand-navy text-white font-semibold hover:bg-brand-navy/90 transition-colors">Talk to a nutritionist</Link>
            <a href={enquiryHref(name)} className="inline-flex items-center justify-center min-h-12 px-7 border border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors">Enquire about {name}</a>
          </div>
        </div>
      </div>

      {product.related.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-6 py-10 md:py-14">
          <h2 className={panelHeading}>More for the same animals</h2>
          <Related product={product} cardClass="border border-slate-200" />
        </div>
      )}
    </div>
  );
}
