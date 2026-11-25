import Image from "next/image";
import Link from "next/link";
import { FACILITY, SAFETY, type ProductData } from "@/lib/productData";
import type { IconName } from "../../products/[slug]/icons";

// Shared by the four product-page designs in this preview: the product each one is given, and the pieces that
// read the same in every design. Each design does its own layout and styling.

export type Row = readonly [string, string];

/** Everything a design needs about one product: its page text and its approved technical data. */
export interface PreviewProduct {
  name: string;
  path: string;
  category: string;
  tagline: string;
  about: string;
  features: string[];
  inclusionRate: string;
  packSize: string;
  banner?: string;
  icon: string;
  data: ProductData;
  related: { name: string; tagline: string; path: string; banner?: string; icon: string }[];
}

const mail = (subject: string, body: string) => `mailto:innovate@chemlifeinnovations.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export const enquiryHref = (name: string) =>
  mail(`Product Inquiry: ${name}`, `Hi ChemLife Innovations team,\n\nI am writing to inquire about ${name}. Please share technical datasheets, pricing, and packaging options.\n\nBest regards,\n[Your Name]\n[Your Company]`);

export const documentsHref = (name: string) =>
  mail(`TDS and SDS request: ${name}`, `Hi ChemLife Innovations team,\n\nPlease share the Technical Data Sheet and Safety Data Sheet for ${name}.\n\nBest regards,\n[Your Name]\n[Your Company]`);

export const NUTRITIONIST_HREF = "/contact?type=nutritionist";

/** The four facts a buyer checks first. */
export const glance = ({ data }: PreviewProduct): [IconName, string, string][] => [
  ["form", "Form", data.glance.form],
  ["active", "Active content", data.glance.active],
  ["shelfLife", "Shelf life", data.glance.shelfLife],
  [data.route, "Used in", data.glance.usedIn],
];

/** The three assurances from the data sheets. */
export const ASSURANCES: [IconName, string, string][] = [
  ["facility", "Manufacturing", FACILITY],
  ["shield", "Hazard classification", SAFETY.classification],
  ["transport", "Transport", SAFETY.transport],
];

export const protection = (data: ProductData) => `${SAFETY.protection}${data.dry ? ` ${SAFETY.dustMask}` : ""}`;

/** Safe handling as label and text, for designs that set it in a table. */
export const safetyRows = (data: ProductData): Row[] => [
  ["Hazard classification", SAFETY.classification],
  ["Transport", SAFETY.transport],
  ["Personal protection", protection(data)],
  ["Disposal", SAFETY.disposal],
  ["Restrictions", SAFETY.restriction],
];

/** The product's picture, filling its (positioned) parent. Falls back to the icon where there's no photo. */
export function ProductImage({ src, icon, alt, sizes, priority = false }: { src?: string; icon: string; alt: string; sizes: string; priority?: boolean }) {
  return src ? (
    <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
  ) : (
    <Image src={icon} alt={alt} fill priority={priority} sizes="200px" className="object-contain p-8" />
  );
}

/** What's in the product: a list of components, or a per-litre table. `tableClass` styles the table's box. */
export function Composition({ data, listClass, tableClass = "border border-slate-200" }: { data: ProductData; listClass: string; tableClass?: string }) {
  const { items, per, table, note } = data.composition;
  return (
    <>
      {items && (
        <ul className={listClass}>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {table && (
        <>
          <p className="font-semibold text-brand-navy mb-2">{per}</p>
          <dl className={`grid sm:grid-cols-2 gap-x-10 px-5 py-2 ${tableClass}`}>
            {table.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-2 border-b border-slate-200 last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                <dt className="text-slate-700">{label}</dt>
                <dd className="font-bold text-brand-navy whitespace-nowrap tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      {note && <p className="text-slate-700 mt-3">{note}</p>}
    </>
  );
}

/** In-vitro results as bars: each organism's zone of inhibition against the widest one. */
export function ZoneBars({ rows, barClass = "bg-brand-navy" }: { rows: readonly Row[]; barClass?: string }) {
  const widest = Math.max(...rows.map(([, mm]) => Number(mm)));
  return (
    <table className="w-full text-left text-[0.9375rem]">
      <thead className="text-sm text-slate-600">
        <tr>
          <th scope="col" className="pb-2 pr-4 font-semibold">Organism</th>
          <th scope="col" className="pb-2 font-semibold">Zone of inhibition (mm)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([organism, mm]) => (
          <tr key={organism}>
            <th scope="row" className="py-2 pr-4 font-medium text-slate-700 italic whitespace-nowrap w-[34%]">{organism}</th>
            <td className="py-2">
              <div className="flex items-center gap-3">
                <div aria-hidden="true" className="flex-1 h-2.5 bg-slate-100 overflow-hidden">
                  <div className={`h-full ${barClass}`} style={{ width: `${(Number(mm) / widest) * 100}%` }} />
                </div>
                <span className="w-7 text-right font-bold text-brand-navy tabular-nums">{mm}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Other products for the same animals, as a plain row of cards. */
export function Related({ product, cardClass = "rounded-lg border border-slate-200" }: { product: PreviewProduct; cardClass?: string }) {
  if (product.related.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {product.related.map((item) => (
        <li key={item.name}>
          <Link href={item.path} className={`group block h-full overflow-hidden bg-white hover:border-brand-navy transition-colors ${cardClass}`}>
            <div className="relative aspect-video bg-white">
              <ProductImage src={item.banner} icon={item.icon} alt="" sizes="(min-width: 1024px) 280px, 50vw" />
            </div>
            <div className="p-4">
              <p className="font-bold text-brand-navy group-hover:underline underline-offset-4">{item.name}</p>
              {item.tagline && <p className="text-sm text-slate-600 mt-1">{item.tagline}</p>}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
