"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { PURITY_LIMITS, SAFETY, qualityAssurance } from "@/lib/productData";
import { Composition, NUTRITIONIST_HREF, ProductImage, Related, ZoneBars, documentsHref, enquiryHref, safetyRows, type PreviewProduct, type Row } from "./kit";

// B: set like the Technical Data Sheet itself. A document header with its reference numbers, a numbered index
// that stays beside the page, and numbered sections of ruled tables in the data sheet's own order.
// Navy and grey only, square corners, tighter type: the most formal of the four.

const rule = "border-slate-300";

/** A ruled, square table, as in a printed data sheet. */
const SheetTable = ({ head, rows }: { head: Row; rows: readonly Row[] }) => (
  <table className={`w-full text-left text-[0.9375rem] border ${rule}`}>
    <thead>
      <tr className="bg-brand-navy text-white">
        <th scope="col" className="w-[38%] px-4 py-2.5 font-semibold">{head[0]}</th>
        <th scope="col" className="px-4 py-2.5 font-semibold">{head[1]}</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(([label, value]) => (
        <tr key={label} className={`border-t ${rule} even:bg-slate-50`}>
          <th scope="row" className={`px-4 py-2.5 font-semibold text-brand-navy align-top border-r ${rule}`}>{label}</th>
          <td className="px-4 py-2.5 text-slate-800 align-top">{value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default function DataSheet({ product }: { product: PreviewProduct }) {
  const { data, name } = product;

  // The sections, in the data sheet's order. Numbered as they come, so a product without trials has no gap.
  const sections: { id: string; title: string; body: ReactNode }[] = [
    {
      id: "overview",
      title: "Overview",
      body: (
        <div className="grid md:grid-cols-12 gap-6 items-start">
          <p className="md:col-span-8 leading-relaxed whitespace-pre-line">{product.about}</p>
          <div className={`md:col-span-4 relative aspect-video border ${rule} bg-white overflow-hidden`}>
            <ProductImage src={product.banner} icon={product.icon} alt={`${name} product picture`} sizes="(min-width: 768px) 300px, 100vw" priority />
          </div>
        </div>
      ),
    },
    { id: "intended-use", title: "Intended use", body: <p className="leading-relaxed">{data.intendedUse}</p> },
    { id: "composition", title: "Composition", body: <Composition data={data} listClass="list-[square] pl-5 space-y-1 marker:text-brand-navy" tableClass={`border ${rule}`} /> },
    { id: "mechanism", title: "Mechanism of action", body: <SheetTable head={["Step", "What happens"]} rows={data.mechanism} /> },
    {
      id: "benefits",
      title: "Benefits",
      body: (
        <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-1.5 list-[square] pl-5 marker:text-brand-navy">
          {(data.benefits ?? product.features).map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>
      ),
    },
    { id: "specifications", title: "Technical specifications", body: <SheetTable head={["Parameter", "Specification"]} rows={data.specs} /> },
    { id: "storage", title: "Stability and storage", body: <SheetTable head={["Parameter", "Specification"]} rows={data.storage} /> },
    {
      id: "usage",
      title: "Usage",
      body: (
        <>
          <SheetTable
            head={["Parameter", "Specification"]}
            rows={[
              ["Inclusion rate", product.inclusionRate.replace(/\n+/g, "; ")],
              ["Used in", data.glance.usedIn],
            ]}
          />
          <h3 className="font-bold text-brand-navy mt-5 mb-1">Application instructions</h3>
          <p className="leading-relaxed">{data.application}</p>
        </>
      ),
    },
    ...(data.efficacy
      ? [
          {
            id: "efficacy",
            title: "Efficacy summary",
            body: (
              <div className="space-y-4">
                <div className={`border ${rule} p-5 max-w-xl`}>
                  <h3 className="font-bold text-brand-navy mb-3">In-vitro efficacy</h3>
                  <ZoneBars rows={data.efficacy.inVitro} />
                </div>
                <p className="leading-relaxed">{data.efficacy.inVitroNote}</p>
                {data.efficacy.inVivo && (
                  <>
                    <h3 className="font-bold text-brand-navy">In-vivo trials</h3>
                    <p className="leading-relaxed">{data.efficacy.inVivo.text}</p>
                    <p className="text-sm text-slate-600">{data.efficacy.inVivo.source}</p>
                  </>
                )}
              </div>
            ),
          },
        ]
      : []),
    { id: "compatibility", title: "Compatibility", body: <p className="leading-relaxed">{data.compatibility}</p> },
    {
      id: "safety",
      title: "Safety and handling",
      body: (
        <div className="space-y-4">
          {data.handling.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed">{paragraph}</p>
          ))}
          <SheetTable head={["Subject", "Guidance"]} rows={safetyRows(data)} />
          <SheetTable head={["First aid", "What to do"]} rows={SAFETY.firstAid} />
        </div>
      ),
    },
    { id: "purity", title: "Purity limits", body: <SheetTable head={["Parameter", "Limit"]} rows={PURITY_LIMITS} /> },
    { id: "packaging", title: "Packaging", body: <p>{product.packSize}</p> },
    { id: "quality", title: "Quality assurance", body: <p className="leading-relaxed">{qualityAssurance(name)}</p> },
  ];

  return (
    <div className="bg-white text-slate-800 text-[0.9375rem]">
      {/* The document's header: what it is, and its reference numbers */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        <div className="border-t-4 border-brand-navy pt-6 grid lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">Technical data sheet · {product.category}</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-navy mt-2">{name}</h1>
            {product.tagline && <p className="text-lg text-slate-700 mt-2">{product.tagline}</p>}
          </div>
          <dl className={`lg:col-span-5 grid grid-cols-[auto_1fr] border ${rule} text-sm`}>
            {(
              [
                ["Document no.", data.documents.tds],
                ["Safety data sheet", data.documents.sds],
                ["Manufacturer", "ChemLife Innovations Pvt. Ltd."],
                ["Pack size", product.packSize],
              ] as const
            ).map(([label, value], i) => (
              <div key={label} className={`contents ${i ? "[&>*]:border-t" : ""}`}>
                <dt className={`px-3 py-2 bg-slate-100 font-semibold text-brand-navy border-r ${rule}`}>{label}</dt>
                <dd className={`px-3 py-2 ${rule}`}>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className={`mt-6 pb-6 border-b ${rule} flex flex-wrap gap-3`}>
          <a href={documentsHref(name)} className="inline-flex items-center justify-center min-h-11 px-5 bg-brand-navy text-white font-semibold hover:bg-brand-navy/90 transition-colors">Request the TDS and SDS</a>
          <a href={enquiryHref(name)} className="inline-flex items-center justify-center min-h-11 px-5 border border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors">Enquire about {name}</a>
          <Link href={NUTRITIONIST_HREF} className="inline-flex items-center justify-center min-h-11 px-5 text-brand-navy font-semibold underline underline-offset-4">Talk to a nutritionist</Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10 grid lg:grid-cols-12 gap-10">
        {/* The numbered index stays beside the page on a desktop */}
        <nav aria-label="Sections" className="lg:col-span-3">
          <ol className={`lg:sticky lg:top-56 border-l-2 ${rule} text-sm columns-2 lg:columns-1`}>
            {sections.map((section, i) => (
              <li key={section.id}>
                <a href={`#sheet-${section.id}`} className="flex gap-2.5 pl-4 py-1.5 -ml-0.5 border-l-2 border-transparent text-slate-700 hover:text-brand-navy hover:border-brand-navy">
                  <span className="tabular-nums text-slate-500 w-5">{i + 1}.</span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="lg:col-span-9">
          {sections.map((section, i) => (
            <section key={section.id} id={`sheet-${section.id}`} className={`scroll-mt-56 py-7 border-t ${rule} first:border-t-0 first:pt-0`}>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-brand-navy mb-4">
                <span className="tabular-nums text-slate-500 mr-2">{i + 1}.</span>
                {section.title}
              </h2>
              {section.body}
            </section>
          ))}

          {product.related.length > 0 && (
            <section className={`py-7 border-t ${rule}`}>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-brand-navy mb-4">Related products</h2>
              <Related product={product} cardClass={`border ${rule}`} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
