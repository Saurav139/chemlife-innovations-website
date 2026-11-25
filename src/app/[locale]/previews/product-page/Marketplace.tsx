"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { PURITY_LIMITS, SAFETY, qualityAssurance } from "@/lib/productData";
import { Icon } from "../../products/[slug]/icons";
import { ASSURANCES, Composition, NUTRITIONIST_HREF, Related, ZoneBars, documentsHref, enquiryHref, glance, protection, type PreviewProduct, type Row } from "./kit";

// A: laid out like a marketplace listing. Pictures, the title with its key attributes and "About this item",
// and an enquiry box where a shop would have its buy box; then the product information tables, description,
// a manufacturer's panel, directions and important information. No prices, ratings or reviews: none exist.

const heading = "font-heading text-xl md:text-2xl font-bold text-brand-navy mb-4";

/** A listing-style table: shaded label column, ruled rows. */
const InfoTable = ({ rows }: { rows: readonly Row[] }) => (
  <table className="w-full text-left text-[0.9375rem] border-t border-slate-300">
    <tbody>
      {rows.map(([label, value]) => (
        <tr key={label} className="border-b border-slate-300">
          <th scope="row" className="w-[42%] bg-slate-100 px-3 py-2.5 font-semibold text-slate-700 align-top">{label}</th>
          <td className="px-3 py-2.5 text-slate-800 align-top">{value}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const Block = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="border-t border-slate-300 py-8 md:py-10">
    <h2 className={heading}>{title}</h2>
    {children}
  </section>
);

export default function Marketplace({ product }: { product: PreviewProduct }) {
  const { data, name } = product;
  const shots = [product.banner, product.icon].filter((src): src is string => Boolean(src));
  const [shot, setShot] = useState(0);
  const about = [...product.features, ...(data.benefits ?? [])];

  return (
    <div className="bg-white text-slate-800">
      <div className="max-w-[1280px] mx-auto px-6 pt-6 pb-4">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link href="/products" className="hover:underline">Products</Link>
          <span aria-hidden="true" className="mx-1.5">›</span>
          {product.category}
          <span aria-hidden="true" className="mx-1.5">›</span>
          <span aria-current="page" className="text-slate-900">{name}</span>
        </nav>

        <div className="mt-5 grid lg:grid-cols-12 gap-8">
          {/* Pictures: small ones down the side choose the large one */}
          <div className="lg:col-span-5 flex gap-3 items-start">
            <div className="flex flex-col gap-2">
              {shots.map((src, i) => (
                <button key={src} type="button" onClick={() => setShot(i)} aria-label={`Picture ${i + 1} of ${shots.length}`} aria-pressed={shot === i} className={`relative w-14 h-14 rounded-md overflow-hidden bg-white border ${shot === i ? "border-brand-orange-aa ring-2 ring-brand-orange-aa/40" : "border-slate-300 hover:border-slate-500"}`}>
                  <Image src={src} alt="" fill sizes="56px" className={i === 0 && product.banner ? "object-cover" : "object-contain p-1.5"} />
                </button>
              ))}
            </div>
            <div className="relative flex-1 aspect-[4/3] rounded-lg overflow-hidden bg-white border border-slate-200">
              <Image src={shots[shot]} alt={`${name} product picture`} fill priority sizes="(min-width: 1024px) 460px, 100vw" className={shot === 0 && product.banner ? "object-cover" : "object-contain p-10"} />
            </div>
          </div>

          {/* Title, key attributes and "About this item" */}
          <div className="lg:col-span-4">
            <h1 className="font-heading text-2xl md:text-[1.75rem] leading-snug font-bold text-brand-navy">
              {name}
              {product.tagline && <span className="font-semibold">: {product.tagline}</span>}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              By <Link href="/about" className="font-semibold text-brand-orange-aa hover:underline">ChemLife Innovations</Link>
              <span aria-hidden="true" className="mx-2">|</span>
              {product.category}
            </p>

            <dl className="mt-4 pt-4 border-t border-slate-300 grid grid-cols-[8.5rem_1fr] gap-x-3 gap-y-2 text-[0.9375rem]">
              {glance(product).map(([, label, value]) => (
                <div key={label} className="contents">
                  <dt className="font-bold text-slate-900">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div className="contents">
                <dt className="font-bold text-slate-900">Pack size</dt>
                <dd>{product.packSize}</dd>
              </div>
            </dl>

            <div className="mt-4 pt-4 border-t border-slate-300">
              <h2 className="font-bold text-lg text-slate-900 mb-2">About this item</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-[0.9375rem] marker:text-slate-500">
                {about.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* The enquiry box: where a shop has its buy box */}
          <aside className="lg:col-span-3">
            <div className="rounded-lg border border-slate-300 p-5">
              <p className="text-sm text-slate-600">Pack size</p>
              <p className="font-heading text-2xl font-bold text-brand-navy">{product.packSize}</p>
              <p className="mt-1 text-sm text-slate-600">Price and delivery on enquiry</p>

              <p className="mt-4 text-sm font-bold text-slate-900">Inclusion rate</p>
              <p className="text-[0.9375rem] whitespace-pre-line">{product.inclusionRate}</p>

              <div className="mt-5 flex flex-col gap-2.5">
                <a href={enquiryHref(name)} className="inline-flex items-center justify-center min-h-11 px-5 rounded-full bg-brand-orange-aa hover:bg-brand-orange-aa-hover text-white font-semibold transition-colors">
                  Enquire about {name}
                </a>
                <Link href={NUTRITIONIST_HREF} className="inline-flex items-center justify-center min-h-11 px-5 rounded-full border border-brand-navy text-brand-navy font-semibold hover:bg-brand-navy hover:text-white transition-colors">
                  Talk to a nutritionist
                </Link>
              </div>

              <dl className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-sm">
                <dt className="text-slate-600">Made by</dt>
                <dd>ChemLife Innovations Pvt. Ltd.</dd>
                <dt className="text-slate-600">Made in</dt>
                <dd>Doddaballapura, Karnataka, India</dd>
                <dt className="text-slate-600">Facility</dt>
                <dd>FAMI-QS certified</dd>
                <dt className="text-slate-600">Shelf life</dt>
                <dd>{data.glance.shelfLife}</dd>
              </dl>
              <a href={documentsHref(name)} className="mt-4 inline-block text-sm font-semibold text-brand-orange-aa hover:underline">Request the TDS and SDS</a>
            </div>
          </aside>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 pb-12">
        <Block title="Product information">
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Technical details</h3>
              <InfoTable rows={data.specs} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Additional information</h3>
              <InfoTable
                rows={[
                  ...data.storage,
                  ["Pack size", product.packSize],
                  ["Technical Data Sheet", data.documents.tds],
                  ["Safety Data Sheet", data.documents.sds],
                  ["Manufacturer", "ChemLife Innovations Pvt. Ltd."],
                ]}
              />
            </div>
          </div>
        </Block>

        <Block title="Product description">
          <div className="max-w-4xl space-y-4 text-base leading-relaxed">
            <p className="whitespace-pre-line">{product.about}</p>
            <p>{data.intendedUse}</p>
          </div>
          <h3 className="font-bold text-slate-900 mt-6 mb-2">Composition</h3>
          <div className="max-w-3xl">
            <Composition data={data} listClass="list-disc pl-5 space-y-1 marker:text-slate-500" tableClass="border border-slate-300 rounded-md" />
          </div>
        </Block>

        {/* The manufacturer's own panel: how it works, and the quality behind it */}
        <Block title="From the manufacturer">
          <div className="rounded-lg bg-brand-navy text-white p-6 md:p-10">
            <h3 className="font-heading text-xl md:text-2xl font-bold text-white">How {name} works</h3>
            <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {data.mechanism.map(([step, text], i) => (
                <li key={step}>
                  <span aria-hidden="true" className="font-heading text-3xl font-bold text-white/40">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-bold mt-1">{step}</p>
                  <p className="text-white/85 text-[0.9375rem] leading-relaxed mt-1">{text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-6 grid lg:grid-cols-12 gap-x-10 gap-y-6 items-start">
            <p className="lg:col-span-7 leading-relaxed">{qualityAssurance(name)}</p>
            <ul className="lg:col-span-5 space-y-3">
              {ASSURANCES.map(([icon, label, value]) => (
                <li key={label} className="flex gap-3">
                  <Icon name={icon} className="w-7 h-7 text-brand-navy" />
                  <p className="text-[0.9375rem]">
                    <span className="font-bold text-slate-900">{label}: </span>
                    {value}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </Block>

        <Block title="Directions for use">
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
            <div>
              <h3 className="font-bold text-slate-900 mb-2">How to apply</h3>
              <p className="leading-relaxed">{data.application}</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">Compatibility</h3>
              <p className="leading-relaxed">{data.compatibility}</p>
            </div>
          </div>
        </Block>

        {data.efficacy && (
          <Block title="Trial results">
            <div className="grid lg:grid-cols-12 gap-x-10 gap-y-6 items-start">
              <div className="lg:col-span-5 rounded-lg border border-slate-300 p-5">
                <h3 className="font-bold text-slate-900 mb-3">In-vitro efficacy</h3>
                <ZoneBars rows={data.efficacy.inVitro} barClass="bg-brand-orange-aa rounded-full" />
              </div>
              <div className="lg:col-span-7 space-y-4 leading-relaxed">
                <p>{data.efficacy.inVitroNote}</p>
                {data.efficacy.inVivo && (
                  <>
                    <h3 className="font-bold text-slate-900">In-vivo trials</h3>
                    <p>{data.efficacy.inVivo.text}</p>
                    <p className="text-sm text-slate-600">{data.efficacy.inVivo.source}</p>
                  </>
                )}
              </div>
            </div>
          </Block>
        )}

        <Block title="Important information">
          <div className="grid lg:grid-cols-12 gap-x-10 gap-y-8">
            <div className="lg:col-span-7 space-y-5 text-[0.9375rem] leading-relaxed">
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Safety and handling</h3>
                {data.handling.map((paragraph) => (
                  <p key={paragraph} className="mt-2 first:mt-0">{paragraph}</p>
                ))}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Personal protection</h3>
                <p>{protection(data)}</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">First aid</h3>
                <ul className="space-y-1">
                  {SAFETY.firstAid.map(([route, advice]) => (
                    <li key={route}>
                      <span className="font-semibold">{route}: </span>
                      {advice}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">Disposal</h3>
                <p>{SAFETY.disposal}</p>
              </div>
              <p className="text-slate-600">{SAFETY.restriction}</p>
            </div>
            <div className="lg:col-span-5">
              <h3 className="font-bold text-slate-900 mb-2">Purity limits</h3>
              <InfoTable rows={PURITY_LIMITS} />
            </div>
          </div>
        </Block>

        {product.related.length > 0 && (
          <Block title="More for the same animals">
            <Related product={product} />
          </Block>
        )}
      </div>
    </div>
  );
}
