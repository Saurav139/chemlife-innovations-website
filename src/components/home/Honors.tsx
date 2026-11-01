"use client";

import Image from "next/image";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import { Reveal, SectionHead, accentLast } from "@/components/site/ui";

// Titles and descriptions are in the language file (home.awards.items), in this order.
const AWARDS = [
  { logo: Images.awards.ccamp, organization: "Centre for Cellular and Molecular Platforms (C-CAMP)", year: "2020–21" },
  { logo: Images.awards.animalHusbandry, organization: "Department of Animal Husbandry, Dairying & Fisheries", year: "2019" },
  { logo: Images.awards.birac, organization: "Biotechnology Industry Research Assistance Council (BIRAC)", year: "2021" },
  { logo: Images.awards.naarm, organization: "a-IDEA, ICAR-NAARM", year: "2020" },
];

/** Awards and recognition, as a catalogue: year, emblem, title and what it was for. */
export default function Honors() {
  const t = useT().home.awards;
  return (
    <section aria-labelledby="awards-title" className="paper relative bg-page py-20 md:py-28 lg:py-36">
      <div className="container-site">
        <SectionHead id="awards-title" index="03" kicker={t.kicker} title={accentLast(t.title)} />
        <ol className="border-t border-ink">
          {t.items.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 0.05}
              className="group grid grid-cols-[auto_1fr] md:grid-cols-12 gap-x-5 md:gap-x-8 gap-y-4 items-center border-b border-line py-8 md:py-10 transition-colors hover:bg-card/70">
              <span className="label-mono text-flame md:col-span-1 md:pl-3 self-start md:self-center">{AWARDS[i].year}</span>
              <div className="md:col-span-2 row-span-2 md:row-span-1 col-start-1 row-start-2 md:col-start-auto md:row-start-auto relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-white border border-line overflow-hidden transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
                <Image src={AWARDS[i].logo} alt={AWARDS[i].organization} fill sizes="112px" className="object-contain p-3.5" />
              </div>
              <div className="md:col-span-4 col-start-2 row-start-1 row-span-2 md:col-start-auto md:row-start-auto md:row-span-1">
                <h3 className="font-display text-2xl md:text-3xl text-ink leading-tight group-hover:text-flame transition-colors">{item.title}</h3>
                <p className="label-mono text-copy-dim mt-2 normal-case tracking-normal text-[13px]">{AWARDS[i].organization}</p>
              </div>
              <p className="col-span-2 md:col-span-5 text-copy leading-relaxed">{item.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
