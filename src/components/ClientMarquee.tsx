"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

// Every partner's logo at once, in one wall of equal tiles (six across on laptops), instead of cards flipping between
// two sets. Each logo, trimmed of its empty margins, is fitted inside the same box so wordmarks and badges read alike.
const logos = [...new Set([...Images.partnerLogos.frontRow, ...Images.partnerLogos.backRow])];

export default function ClientMarquee() {
  const t = useT().home.partners;
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="partners-title" className="bg-slate-50 border-y border-slate-200 py-16 md:py-24 lg:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-3">{t.kicker}</span>
          <h2 id="partners-title" className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy leading-tight">{t.title}</h2>
        </div>

        {/* A wrapping row, so a short last row sits centred. */}
        <ul className="flex flex-wrap justify-center gap-3 md:gap-4">
          {logos.map((logo, i) => (
            <motion.li key={logo}
              initial={{ opacity: 0, y: reduce ? 0 : 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.5, delay: (i % 6) * 0.04, ease: [0.25, 0.1, 0, 1] }}
              className="w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-5rem)/6)] aspect-[3/2] flex items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="relative w-[74%] h-[56%]">
                <Image src={Images.partnerLogos.path(logo)} alt={`${Images.partnerLogos.names[logo] ?? "Partner"} ${t.logo}`} fill className="object-contain" sizes="(min-width: 1024px) 180px, (min-width: 768px) 25vw, 30vw" />
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
