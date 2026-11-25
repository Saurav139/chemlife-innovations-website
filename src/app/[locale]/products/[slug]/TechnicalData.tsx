import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";
import type { Messages } from "@/i18n/messages/en";
import { Icon, type IconName } from "./icons";
import { FACILITY, PURITY_LIMITS, SAFETY, qualityAssurance, type ProductData } from "@/lib/productData";

type Labels = Messages["products"]["data"];
type Row = readonly [string, string];

const h2 = "font-heading text-2xl md:text-3xl lg:text-4xl font-bold";
const h3 = "font-heading text-xl md:text-2xl font-bold text-brand-navy";
const card = "rounded-2xl bg-white border border-slate-200 p-6 md:p-8";
const prose = "text-slate-700 text-base md:text-lg leading-relaxed";
// The page's header is fixed and 128px tall: a link to a section stops just below it.
const section = "scroll-mt-32 py-12 md:py-20";

/** An icon on a soft orange tile, beside a heading or a fact. */
const IconTile = ({ name }: { name: IconName }) => (
  <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-orange-50 text-brand-orange-aa flex items-center justify-center">
    <Icon name={name} />
  </span>
);

/** A card's heading with its icon. */
const CardHeading = ({ icon, id, children }: { icon: IconName; id?: string; children: ReactNode }) => (
  <div className="flex items-center gap-3 mb-4">
    <IconTile name={icon} />
    <h3 id={id} className="font-heading text-xl font-bold text-brand-navy">{children}</h3>
  </div>
);

/** A two-column table: what is measured, and its value. */
function DataTable({ title, id, icon, head, rows }: { title: string; id: string; icon: IconName; head: Row; rows: readonly Row[] }) {
  return (
    <div className={card}>
      <CardHeading icon={icon} id={id}>{title}</CardHeading>
      <table aria-labelledby={id} className="w-full text-left text-[0.9375rem]">
        <thead className="sr-only">
          <tr>
            <th scope="col">{head[0]}</th>
            <th scope="col">{head[1]}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row" className="py-3 pr-4 font-medium text-slate-600 align-top w-[46%]">{label}</th>
              <td className="py-3 font-semibold text-brand-navy align-top">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The in-vitro results as bars: each organism's zone of inhibition against the widest one. */
function ZoneChart({ title, head, rows }: { title: string; head: Row; rows: readonly Row[] }) {
  const widest = Math.max(...rows.map(([, mm]) => Number(mm)));
  return (
    <div className={card}>
      <CardHeading icon="inVitro" id="in-vitro">{title}</CardHeading>
      <table aria-labelledby="in-vitro" className="w-full text-left text-[0.9375rem]">
        <thead className="text-sm text-slate-aa">
          <tr>
            <th scope="col" className="pb-2 pr-4 font-semibold">{head[0]}</th>
            <th scope="col" className="pb-2 font-semibold">{head[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([organism, mm]) => (
            <tr key={organism}>
              <th scope="row" className="py-2.5 pr-4 font-medium text-slate-700 italic whitespace-nowrap w-[34%]">{organism}</th>
              <td className="py-2.5">
                <div className="flex items-center gap-3">
                  <div aria-hidden="true" className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand-orange" style={{ width: `${(Number(mm) / widest) * 100}%` }} />
                  </div>
                  <span className="w-7 text-right font-bold text-brand-navy tabular-nums">{mm}</span>
                </div>
              </td>
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
  const glance: [IconName, string, string][] = [
    ["form", t.form, data.glance.form],
    ["active", t.active, data.glance.active],
    ["shelfLife", t.shelfLife, data.glance.shelfLife],
    [data.route, t.usedIn, data.glance.usedIn],
  ];
  const assurances: [IconName, string, string][] = [
    ["facility", t.manufacturing, FACILITY],
    ["shield", t.classification, SAFETY.classification],
    ["transport", t.transport, SAFETY.transport],
  ];

  return (
    <>
      {/* What it is: the facts at a glance, composition, how it works, specifications, storage */}
      <section id="technical-data" aria-labelledby="technical-data-heading" className={`${section} bg-slate-50`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 id="technical-data-heading" className={`${h2} text-brand-navy`}>{t.heading}</h2>
          <p className={`${prose} mt-3 max-w-2xl`}>{t.intro}</p>
          {translated && <p className="text-slate-600 mt-2 max-w-2xl">{t.englishNote}</p>}

          <Reveal className="mt-8 md:mt-10">
            <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden bg-slate-200 border border-slate-200">
              {glance.map(([icon, label, value]) => (
                <div key={label} className="bg-white p-5 md:p-6 flex gap-4">
                  <IconTile name={icon} />
                  <div>
                    <dt className="text-sm font-semibold text-slate-aa">{label}</dt>
                    <dd className="mt-1 text-brand-navy text-base md:text-lg font-bold leading-snug">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>

          <div className="mt-10 md:mt-14 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <Reveal className="lg:col-span-7 space-y-10 md:space-y-12">
              <div>
                <h3 className={`${h3} mb-4`}>{t.composition}</h3>
                {data.composition.items && (
                  <ul className="flex flex-wrap gap-2">
                    {data.composition.items.map((item) => (
                      <li key={item} className="px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-brand-navy font-semibold">{item}</li>
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
                          <dd className="font-bold text-brand-navy whitespace-nowrap tabular-nums">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </>
                )}
                {data.composition.note && <p className="text-slate-700 mt-4">{data.composition.note}</p>}
              </div>

              <div>
                <h3 className={`${h3} mb-5`}>{t.mechanism}</h3>
                {/* Numbered steps joined by a line, so it reads as one chain of events. */}
                <ol>
                  {data.mechanism.map(([step, text], i) => (
                    <li key={step} className="relative pl-14 pb-7 last:pb-0 before:absolute before:left-[1.1875rem] before:top-11 before:bottom-1 before:w-px before:bg-slate-300 last:before:hidden">
                      <span aria-hidden="true" className="absolute left-0 top-0 w-10 h-10 rounded-full bg-brand-navy text-white font-bold flex items-center justify-center">{i + 1}</span>
                      <p className="font-bold text-brand-navy text-base md:text-lg pt-1.5">{step}</p>
                      <p className="text-slate-700 leading-relaxed mt-1">{text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-5 space-y-6">
              <DataTable title={t.specs} id="specifications" icon="specs" head={[t.parameter, t.specification]} rows={data.specs} />
              <DataTable title={t.storage} id="storage" icon="storage" head={[t.parameter, t.specification]} rows={data.storage} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Who it's for, what it gives, how to apply it, and trial results where there are any */}
      <section id="use-application" aria-labelledby="use-application-heading" className={section}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-x-16 gap-y-6">
            <div className="lg:col-span-4">
              <h2 id="use-application-heading" className={`${h2} text-brand-navy`}>{t.use}</h2>
            </div>
            <div className="lg:col-span-8">
              <h3 className="text-sm font-bold text-brand-orange-aa mb-2">{t.intendedUse}</h3>
              <p className="text-slate-800 text-lg md:text-xl leading-relaxed">{data.intendedUse}</p>
            </div>
          </div>

          {data.benefits && (
            <Reveal className="mt-12 md:mt-16">
              <h3 className={`${h3} mb-5`}>{t.benefits}</h3>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {data.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-4 md:p-5 text-brand-navy font-semibold leading-snug">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-orange-aa text-white flex items-center justify-center mt-px">
                      <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          )}

          <Reveal className="mt-10 md:mt-12 grid md:grid-cols-2 gap-6">
            <div className={card}>
              <CardHeading icon="apply">{t.application}</CardHeading>
              <p className="text-slate-700 leading-relaxed">{data.application}</p>
            </div>
            <div className={card}>
              <CardHeading icon="compatibility">{t.compatibility}</CardHeading>
              <p className="text-slate-700 leading-relaxed">{data.compatibility}</p>
            </div>
          </Reveal>

          {data.efficacy && (
            <Reveal className="mt-12 md:mt-16 pt-12 md:pt-16 border-t border-slate-200">
              <h3 className={`${h3} mb-6`}>{t.trials}</h3>
              <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                <div className="lg:col-span-5">
                  <ZoneChart title={t.inVitro} head={[t.organism, t.zone]} rows={data.efficacy.inVitro} />
                </div>
                <div className="lg:col-span-7 space-y-6">
                  <p className={prose}>{data.efficacy.inVitroNote}</p>
                  {data.efficacy.inVivo && (
                    <div className="rounded-2xl bg-orange-50 border border-orange-100 p-6 md:p-8">
                      <h4 className="font-heading text-lg md:text-xl font-bold text-brand-navy mb-3">{t.inVivo}</h4>
                      <p className="text-slate-800 leading-relaxed">{data.efficacy.inVivo.text}</p>
                      <p className="mt-4 pt-4 border-t border-orange-200 flex items-start gap-3 text-sm font-semibold text-brand-navy">
                        <Icon name="trial" className="w-6 h-6 text-brand-orange-aa" />
                        <span>{data.efficacy.inVivo.source}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Quality and safety: three assurances, purity limits, safe handling, and the documents behind it all */}
      <section id="quality-safety" aria-labelledby="quality-safety-heading" className={`${section} bg-brand-navy text-white`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 id="quality-safety-heading" className={`${h2} text-white`}>{t.quality}</h2>
          <p className="text-white/85 text-base md:text-lg leading-relaxed mt-3 max-w-3xl">{qualityAssurance(name)}</p>

          <Reveal className="mt-8 md:mt-10">
            <dl className="grid md:grid-cols-3 gap-4">
              {assurances.map(([icon, label, value]) => (
                <div key={label} className="flex gap-4 rounded-2xl border border-white/25 bg-white/[0.07] p-5 md:p-6">
                  <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-white text-brand-navy flex items-center justify-center">
                    <Icon name={icon} />
                  </span>
                  <div>
                    <dt className="text-sm font-semibold text-white/75">{label}</dt>
                    <dd className="mt-1 text-white font-bold leading-snug">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal className="mt-4 grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5">
              <DataTable title={t.limits} id="purity-limits" icon="limits" head={[t.parameter, t.limit]} rows={PURITY_LIMITS} />
            </div>

            <div className={`${card} lg:col-span-7`}>
              <CardHeading icon="safety">{t.safety}</CardHeading>
              <div className="space-y-3 text-slate-700 leading-relaxed">
                {data.handling.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <dl className="mt-6 pt-6 border-t border-slate-200 grid sm:grid-cols-2 gap-x-8 gap-y-5">
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

              <details className="mt-6 rounded-xl bg-slate-50 border border-slate-200 px-5 py-1">
                <summary className="cursor-pointer py-3 font-bold text-brand-navy marker:text-brand-orange-aa">{t.firstAid}</summary>
                <dl className="pb-4 grid sm:grid-cols-2 gap-x-8 gap-y-4">
                  {SAFETY.firstAid.map(([route, advice]) => (
                    <div key={route}>
                      <dt className="text-sm font-semibold text-slate-aa">{route}</dt>
                      <dd className="mt-0.5 text-slate-700">{advice}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          </Reveal>

          <div className="mt-8 md:mt-10 pt-8 border-t border-white/20 flex flex-wrap items-center justify-between gap-x-10 gap-y-5">
            <dl className="text-white/90">
              <dt className="text-sm font-semibold text-white/75">{t.documents}</dt>
              <dd className="mt-1">
                {t.tds} {data.documents.tds} <span aria-hidden="true" className="mx-1.5">·</span> {t.sds} {data.documents.sds}
              </dd>
            </dl>
            <a href={requestHref} className="inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-white text-brand-navy font-semibold hover:bg-brand-orange-aa hover:text-white transition-colors">
              {t.request}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
