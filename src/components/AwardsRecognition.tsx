"use client";

import Image from "next/image";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

// Titles and descriptions are in the language file (home.awards.items), in this order.
const certificateFiles = [
  {
    file: "c-camp-logo.png",
    organization: "Centre for Cellular and Molecular Platforms (C-CAMP)",
    year: "2020-21",
  },
  {
    file: "animal-husbandry.png",
    organization: "Department of Animal Husbandry, Dairying & Fisheries",
    year: "2019",
  },
  {
    file: "birac.png",
    organization: "Biotechnology Industry Research Assistance Council (BIRAC)",
    year: "2021",
  },
  {
    file: "naarm.png",
    organization: "a-IDEA, ICAR-NAARM",
    year: "2020",
  },
];

/** Every award at once, as a list: the awarding body's mark in the left column, what it was for on the axis. */
export default function AwardsRecognition() {
  const t = useT().home.awards;
  const certificates = certificateFiles.map((c, i) => ({ ...c, ...t.items[i] }));

  return (
    <section className="section-y bg-white">
      <div className="frame">
        <SectionHead title={t.title} />
        <ul className="grid gap-y-12 md:gap-y-16">
          {certificates.map((award) => (
            <Reveal as="li" key={award.file} className="grid grid-cols-[6.5rem_1fr] sm:grid-cols-[10rem_1fr] lg:grid-cols-12 gap-x-6 lg:gap-x-8 items-start">
              <div className="relative aspect-[3/2] bg-surface lg:col-span-3">
                <Image src={Images.awards.path(award.file)} alt={award.organization} fill sizes="(min-width: 1024px) 270px, 160px" className="object-contain p-3 sm:p-5" />
              </div>
              <div className="lg:col-start-6 lg:col-span-7">
                {award.title && <h3 className="text-lead font-bold">{award.title}</h3>}
                <p className="text-small text-ink-soft mt-1">{award.organization}, {award.year}</p>
                <p className="mt-3 max-w-[60ch]">{award.description}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
