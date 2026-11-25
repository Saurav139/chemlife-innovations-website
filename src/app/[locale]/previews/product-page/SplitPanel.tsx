"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { PURITY_LIMITS, SAFETY, qualityAssurance } from "@/lib/productData";
import { Icon } from "../../products/[slug]/icons";
import { ASSURANCES, Composition, NUTRITIONIST_HREF, ProductImage, Related, ZoneBars, documentsHref, enquiryHref, glance, protection, type PreviewProduct, type Row } from "./kit";

// D: a navy product panel that stays beside the page (picture, name, key facts, the enquiry buttons) while
// the detail scrolls past on the right in numbered chapters. The enquiry is always one click away.

const eyebrow = "text-xs font-bold uppercase tracking-[0.16em]";

const Chapter = ({ number, title, children }: { number: number; title: string; children: ReactNode }) => (
  <section className="py-10 md:py-12 border-t border-slate-200 first:border-t-0 first:pt-0">
    <p className={`${eyebrow} text-brand-orange-aa`}>{String(number).padStart(2, "0")}</p>
    <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-navy mt-1 mb-5">{title}</h2>
    {children}
  </section>
);

const Rows = ({ title, rows }: { title: string; rows: readonly Row[] }) => (
  <div className="border border-slate-200">
    <h3 className={`${eyebrow} text-brand-navy bg-slate-100 px-5 py-3 border-b border-slate-200`}>{title}</h3>
    <dl className="divide-y divide-slate-200 text-[0.9375rem]">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-[42%_1fr] gap-4 px-5 py-2.5">
          <dt className="text-slate-600">{label}</dt>
          <dd className="font-semibold text-brand-navy">{value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

export default function SplitPanel({ product }: { product: PreviewProduct }) {
  const { data, name } = product;
  let chapter = 0;

  return (
    <div className="bg-white text-slate-800">
      <div className="max-w-[1280px] mx-auto lg:px-6 lg:py-10 grid lg:grid-cols-12 lg:gap-12 items-start">
        {/* The product panel: stays in view on a desktop */}
        <aside className="lg:col-span-4 lg:sticky lg:top-56 lg:max-h-[calc(100vh-15rem)] lg:overflow-y-auto bg-brand-navy text-white">
          <div className="relative aspect-video lg:aspect-[5/2] bg-white">
            <ProductImage src={product.banner} icon={product.icon} alt={`${name} product picture`} sizes="(min-width: 1024px) 400px, 100vw" priority />
          </div>
          <div className="p-6 md:p-8">
            <p className={`${eyebrow} text-white/70`}>{product.category}</p>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mt-2">{name}</h1>
            {product.tagline && <p className="text-white/85 mt-2">{product.tagline}</p>}

            <div className="mt-6 flex flex-col gap-2.5">
              <a href={enquiryHref(name)} className="inline-flex items-center justify-center min-h-12 px-6 bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors">Enquire about {name}</a>
              <Link href={NUTRITIONIST_HREF} className="inline-flex items-center justify-center min-h-12 px-6 border border-white/70 text-white font-semibold hover:bg-white hover:text-brand-navy transition-colors">Talk to a nutritionist</Link>
            </div>

            <dl className="mt-6 divide-y divide-white/20 border-y border-white/20 text-[0.9375rem]">
              {[...glance(product).map(([, label, value]) => [label, value]), ["Pack size", product.packSize]].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[6.5rem_1fr] gap-3 py-2.5">
                  <dt className="text-white/70">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <a href={documentsHref(name)} className="mt-5 inline-block text-sm font-semibold text-white underline underline-offset-4">Request the TDS and SDS</a>
          </div>
        </aside>

        {/* The detail, in numbered chapters */}
        <div className="lg:col-span-8 px-6 lg:px-0 py-10 lg:py-0">
          <Chapter number={++chapter} title="Overview">
            <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-line">{product.about}</p>
            <p className="leading-relaxed text-slate-700 mt-4">{data.intendedUse}</p>
            <ul className="mt-6 grid sm:grid-cols-2 gap-x-8 border-t border-slate-200">
              {(data.benefits ?? product.features).map((benefit) => (
                <li key={benefit} className="flex gap-3 py-3 border-b border-slate-200 font-semibold text-brand-navy">
                  <span aria-hidden="true" className="mt-2 w-1.5 h-1.5 flex-shrink-0 bg-brand-orange-aa" />
                  {benefit}
                </li>
              ))}
            </ul>
          </Chapter>

          <Chapter number={++chapter} title="How it works">
            <ol className="space-y-px bg-slate-200 border border-slate-200">
              {data.mechanism.map(([step, text], i) => (
                <li key={step} className="bg-white grid grid-cols-[3rem_1fr] sm:grid-cols-[3rem_15rem_1fr] gap-x-4 gap-y-1 p-4">
                  <span aria-hidden="true" className="font-heading text-xl font-bold text-slate-400 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-bold text-brand-navy">{step}</p>
                  <p className="col-start-2 sm:col-start-3 text-[0.9375rem] text-slate-700 leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
            <h3 className="font-bold text-brand-navy mt-8 mb-3">Composition</h3>
            <Composition data={data} listClass="flex flex-wrap gap-2 [&>li]:border [&>li]:border-slate-300 [&>li]:px-3.5 [&>li]:py-2 [&>li]:font-semibold [&>li]:text-brand-navy" />
          </Chapter>

          <Chapter number={++chapter} title="Specifications">
            <div className="grid md:grid-cols-2 gap-5 items-start">
              <Rows title="Technical specifications" rows={data.specs} />
              <div className="space-y-5">
                <Rows title="Stability and storage" rows={data.storage} />
                <Rows title="Purity limits" rows={PURITY_LIMITS} />
              </div>
            </div>
          </Chapter>

          <Chapter number={++chapter} title="Use and application">
            <div className="bg-slate-50 border border-slate-200 p-5 md:p-6">
              <h3 className={`${eyebrow} text-slate-600`}>Inclusion rate</h3>
              <p className="mt-2 font-semibold text-brand-navy whitespace-pre-line leading-relaxed">{product.inclusionRate}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-x-10 gap-y-6 mt-6">
              <div>
                <h3 className="font-bold text-brand-navy mb-2">How to apply</h3>
                <p className="leading-relaxed text-slate-700">{data.application}</p>
              </div>
              <div>
                <h3 className="font-bold text-brand-navy mb-2">Compatibility</h3>
                <p className="leading-relaxed text-slate-700">{data.compatibility}</p>
              </div>
            </div>
          </Chapter>

          {data.efficacy && (
            <Chapter number={++chapter} title="Trial results">
              <div className="grid md:grid-cols-2 gap-x-10 gap-y-6 items-start">
                <div className="border border-slate-200 p-5">
                  <h3 className={`${eyebrow} text-brand-navy mb-4`}>In-vitro efficacy</h3>
                  <ZoneBars rows={data.efficacy.inVitro} />
                </div>
                <p className="leading-relaxed text-slate-700">{data.efficacy.inVitroNote}</p>
              </div>
              {data.efficacy.inVivo && (
                <div className="mt-6 border border-slate-200 bg-slate-50 p-5 md:p-6">
                  <h3 className={`${eyebrow} text-brand-navy mb-2`}>In-vivo trials</h3>
                  <p className="leading-relaxed text-slate-700">{data.efficacy.inVivo.text}</p>
                  <p className="text-sm font-semibold text-brand-navy mt-3">{data.efficacy.inVivo.source}</p>
                </div>
              )}
            </Chapter>
          )}

          <Chapter number={++chapter} title="Quality and safety">
            <p className="leading-relaxed text-slate-700">{qualityAssurance(name)}</p>
            <ul className="mt-6 grid sm:grid-cols-3 border-t border-l border-slate-200">
              {ASSURANCES.map(([icon, label, value]) => (
                <li key={label} className="border-r border-b border-slate-200 p-5">
                  <Icon name={icon} className="w-7 h-7 text-brand-navy" />
                  <p className={`${eyebrow} text-slate-600 mt-3`}>{label}</p>
                  <p className="font-bold text-brand-navy mt-1 leading-snug text-[0.9375rem]">{value}</p>
                </li>
              ))}
            </ul>
            <h3 className="font-bold text-brand-navy mt-8 mb-2">Safety and handling</h3>
            <div className="space-y-3 leading-relaxed text-slate-700">
              {data.handling.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p>{SAFETY.restriction}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5 mt-6 items-start">
              <Rows
                title="Handling"
                rows={[
                  ["Personal protection", protection(data)],
                  ["Disposal", SAFETY.disposal],
                ]}
              />
              <Rows title="First aid" rows={SAFETY.firstAid} />
            </div>
          </Chapter>

          {product.related.length > 0 && (
            <Chapter number={++chapter} title="More for the same animals">
              <Related product={product} cardClass="border border-slate-200" />
            </Chapter>
          )}
        </div>
      </div>
    </div>
  );
}
