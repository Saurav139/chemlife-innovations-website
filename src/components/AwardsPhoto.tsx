"use client";

import Image from "next/image";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

/** The photo of ChemLife's founders accepting an award, in full under the hero. It isn't a hero background: the
 *  hero's centred headline and buttons would sit across the faces and the trophy. */
export default function AwardsPhoto() {
  const t = useT().home.recognition;
  return (
    <section aria-labelledby="recognition-title" className="bg-white py-16 md:py-24 border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-12">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase block mb-2">{t.kicker}</span>
          <h2 id="recognition-title" className="font-heading text-3xl md:text-4xl lg:text-5xl text-brand-navy font-bold leading-tight">
            {t.title}
          </h2>
        </div>
        <figure className="max-w-5xl mx-auto">
          {/* 3:2 as shot on phones; a wider frame from tablets up, keeping the faces and the trophy in it */}
          <div className="relative aspect-[3/2] md:aspect-[2/1] rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 shadow-xl">
            <Image
              src={Images.heroes.awards}
              alt={t.alt}
              fill
              sizes="(min-width: 1024px) 1024px, calc(100vw - 48px)"
              className="object-cover object-[50%_55%]"
            />
          </div>
          <figcaption className="mt-4 text-center text-sm md:text-base text-slate-600 max-w-2xl mx-auto">{t.caption}</figcaption>
        </figure>
      </div>
    </section>
  );
}
