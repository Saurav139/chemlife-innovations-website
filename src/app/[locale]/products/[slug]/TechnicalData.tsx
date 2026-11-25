import type { Messages } from "@/i18n/messages/en";
import { PURITY_LIMITS, SAFETY, qualityAssurance, type ProductData } from "@/lib/productData";

type Labels = Messages["products"]["data"];
type Row = readonly [string, string];

const h2 = "font-heading text-2xl md:text-3xl lg:text-4xl font-bold";
const h3 = "font-heading text-xl md:text-2xl font-bold text-brand-navy mb-4";
const card = "rounded-2xl bg-white border border-slate-200 p-6 md:p-8";
const prose = "text-slate-700 text-base md:text-lg leading-relaxed";

/** A two-column table: what is measured, and its value. */
function DataTable({ title, id, head, rows, showHead = false }: { title: string; id: string; head: Row; rows: readonly Row[]; showHead?: boolean }) {
  return (
    <div className={card}>
      <h3 id={id} className="font-heading text-xl font-bold text-brand-navy mb-4">{title}</h3>
      <table aria-labelledby={id} className="w-full text-left text-[0.9375rem]">
        <thead className={showHead ? "text-sm text-slate-aa border-b border-slate-200" : "sr-only"}>
          <tr>
            <th scope="col" className="pb-2 pr-4 font-semibold">{head[0]}</th>
            <th scope="col" className="pb-2 font-semibold">{head[1]}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row" className="py-2.5 pr-4 font-medium text-slate-600 align-top w-[46%]">{label}</th>
              <td className="py-2.5 font-semibold text-brand-navy align-top">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A product's approved technical data, below its description: what's in it and how it works, how to use it,
 * and its quality and safety limits. Rendered on the server, so it's on the page without JavaScript.
 * The data is in English in every language; `translated` adds a line saying so.
 */
export default function TechnicalData({ name, data, t, translated }: { name: string; data: ProductData; t: Labels; translated: boolean }) {
  const requestHref = `mailto:innovate@chemlifeinnovations.com?subject=${encodeURIComponent(`TDS and SDS request: ${name}`)}&body=${encodeURIComponent(
    `Hi ChemLife Innovations team,\n\nPlease share the Technical Data Sheet and Safety Data Sheet for ${name}.\n\nBest regards,\n[Your Name]\n[Your Company]`
  )}`;
  const glance: Row[] = [
    [t.form, data.glance.form],
    [t.active, data.glance.active],
    [t.shelfLife, data.glance.shelfLife],
    [t.usedIn, data.glance.usedIn],
  ];

  return (
    <>
      {/* What it is: composition, how it works, specifications, storage */}
      <section aria-labelledby="technical-data" className="py-12 md:py-20 bg-slate-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 id="technical-data" className={`${h2} text-brand-navy`}>{t.heading}</h2>
          <p className={`${prose} mt-3 max-w-2xl`}>{t.intro}</p>
          {translated && <p className="text-slate-600 mt-2 max-w-2xl">{t.englishNote}</p>}

          <dl className="mt-8 md:mt-10 grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-slate-200 border border-slate-200">
            {glance.map(([label, value]) => (
              <div key={label} className="bg-white p-5 md:p-6">
                <dt className="text-sm font-semibold text-slate-aa">{label}</dt>
                <dd className="mt-1.5 text-brand-navy font-semibold leading-snug">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 md:mt-14 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7 space-y-10">
              <div>
                <h3 className={h3}>{t.composition}</h3>
                {data.composition.items && (
                  <ul className="flex flex-wrap gap-2">
                    {data.composition.items.map((item) => (
                      <li key={item} className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-brand-navy font-semibold">{item}</li>
                    ))}
                  </ul>
                )}
                {data.composition.table && (
                  <>
                    <p className="text-slate-700 font-semibold mb-3">{data.composition.per}</p>
                    <dl className="grid sm:grid-cols-2 gap-x-10 rounded-2xl bg-white border border-slate-200 px-6 py-3">
                      {data.composition.table.map(([label, value]) => (
                        <div key={label} className="flex items-baseline justify-between gap-4 py-2.5 border-b border-slate-200 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                          <dt className="text-slate-700">{label}</dt>
                          <dd className="font-semibold text-brand-navy whitespace-nowrap">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
                {data.composition.note && <p className="text-slate-700 mt-4">{data.composition.note}</p>}
              </div>

              <div>
                <h3 className={h3}>{t.mechanism}</h3>
                <ol className="space-y-5">
                  {data.mechanism.map(([step, text], i) => (
                    <li key={step} className="flex gap-4">
                      <span aria-hidden="true" className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-navy text-white text-sm font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <div>
                        <p className="font-semibold text-brand-navy text-base md:text-lg">{step}</p>
                        <p className="text-slate-700 leading-relaxed mt-1">{text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <DataTable title={t.specs} id="specifications" head={[t.parameter, t.specification]} rows={data.specs} />
              <DataTable title={t.storage} id="storage" head={[t.parameter, t.specification]} rows={data.storage} />
            </div>
          </div>
        </div>
      </section>

      {/* How it's used, what it gives, and trial results where there are any */}
      <section aria-labelledby="use-application" className="py-12 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 id="use-application" className={`${h2} text-brand-navy`}>{t.use}</h2>
          <div className="mt-8 md:mt-10 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-7 space-y-10">
              <div>
                <h3 className={h3}>{t.intendedUse}</h3>
                <p className={prose}>{data.intendedUse}</p>
              </div>
              <div>
                <h3 className={h3}>{t.application}</h3>
                <p className={prose}>{data.application}</p>
              </div>
              <div>
                <h3 className={h3}>{t.compatibility}</h3>
                <p className={prose}>{data.compatibility}</p>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              {data.benefits && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 md:p-8">
                  <h3 className="font-heading text-xl font-bold text-brand-navy mb-4">{t.benefits}</h3>
                  <ul className="space-y-3">
                    {data.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3 text-slate-700">
                        <svg aria-hidden="true" className="w-5 h-5 text-brand-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {data.efficacy && (
            <div className="mt-12 md:mt-16 pt-12 md:pt-16 border-t border-slate-200 grid lg:grid-cols-12 gap-10 lg:gap-16">
              <div className="lg:col-span-7">
                <h3 className={h3}>{t.trials}</h3>
                <p className={prose}>{data.efficacy.inVitroNote}</p>
                {data.efficacy.inVivo && (
                  <>
                    <h4 className="font-semibold text-brand-navy text-base md:text-lg mt-6 mb-2">{t.inVivo}</h4>
                    <p className={prose}>{data.efficacy.inVivo.text}</p>
                    <p className="text-slate-600 mt-3">{data.efficacy.inVivo.source}</p>
                  </>
                )}
              </div>
              <div className="lg:col-span-5">
                <DataTable title={t.inVitro} id="in-vitro" head={[t.organism, t.zone]} rows={data.efficacy.inVitro} showHead />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quality and safety: purity limits, safe handling, quality assurance and the documents behind it all */}
      <section aria-labelledby="quality-safety" className="py-12 md:py-20 bg-brand-navy text-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 id="quality-safety" className={`${h2} text-white`}>{t.quality}</h2>
          <p className="text-white/85 text-base md:text-lg leading-relaxed mt-3 max-w-3xl">{qualityAssurance(name)}</p>

          <div className="mt-8 md:mt-10 grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <DataTable title={t.limits} id="purity-limits" head={[t.parameter, t.limit]} rows={PURITY_LIMITS} />
            </div>

            <div className={`${card} lg:col-span-7`}>
              <h3 className="font-heading text-xl font-bold text-brand-navy mb-4">{t.safety}</h3>
              <div className="space-y-3 text-slate-700 leading-relaxed">
                {data.handling.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <dl className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-5">
                <div>
                  <dt className="text-sm font-semibold text-slate-aa">{t.classification}</dt>
                  <dd className="mt-1 text-brand-navy font-semibold">{SAFETY.classification}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-aa">{t.transport}</dt>
                  <dd className="mt-1 text-brand-navy font-semibold">{SAFETY.transport}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-aa">{t.protection}</dt>
                  <dd className="mt-1 text-slate-700">{SAFETY.protection}{data.dry ? ` ${SAFETY.dustMask}` : ""}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-slate-aa">{t.disposal}</dt>
                  <dd className="mt-1 text-slate-700">{SAFETY.disposal}</dd>
                </div>
              </dl>
              <p className="mt-5 text-slate-700">{SAFETY.restriction}</p>

              <details className="mt-6 border-t border-slate-200 pt-4 group">
                <summary className="tap-target cursor-pointer font-semibold text-brand-navy marker:text-brand-orange-aa">{t.firstAid}</summary>
                <dl className="mt-3 space-y-3">
                  {SAFETY.firstAid.map(([route, advice]) => (
                    <div key={route}>
                      <dt className="text-sm font-semibold text-slate-aa">{route}</dt>
                      <dd className="mt-0.5 text-slate-700">{advice}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          </div>

          <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
            <dl className="text-white/85">
              <dt className="text-sm font-semibold text-white/75">{t.documents}</dt>
              <dd className="mt-1">
                {t.tds} {data.documents.tds} <span aria-hidden="true" className="mx-1.5">·</span> {t.sds} {data.documents.sds}
              </dd>
            </dl>
            <a href={requestHref} className="inline-flex items-center justify-center min-h-12 px-7 rounded-full border-2 border-white/80 text-white font-semibold hover:bg-white hover:text-brand-navy transition-colors">
              {t.request}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
