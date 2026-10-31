"use client";

import Image from "next/image";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

// Titles, descriptions and photo descriptions are in the language file (home.howWeDo.steps), in this order.
const stepImages = [
  Images.process.researchImage,
  Images.process.developmentImage,
  Images.process.manufacturingImage,
  Images.process.delivery,
];

// Each stage starts two columns further right than the one before, so the four read as a staircase, from the lab to
// the lorry. Phones keep a smaller step.
const STEP_START = [
  "lg:col-start-1",
  "ml-[6vw] lg:ml-0 lg:col-start-3",
  "ml-[12vw] lg:ml-0 lg:col-start-5",
  "ml-[18vw] lg:ml-0 lg:col-start-7",
];

export default function HowWeDo() {
  const t = useT().home.howWeDo;

  return (
    <section className="field-ink section-y overflow-hidden">
      <div className="frame">
        <SectionHead title={t.title} />
        <ol className="grid lg:grid-cols-12 gap-x-8 gap-y-10 md:gap-y-14">
          {t.steps.map((step, i) => (
            <Reveal as="li" key={step.title} order={i} className={`${STEP_START[i]} lg:col-span-6`}>
              <h3 className="text-title">{step.title}</h3>
              <p className="mt-3 max-w-[40ch]">{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>

      {/* The four stages in pictures, butted together across the full width. */}
      <Reveal order={1} className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4">
        {t.steps.map((step, i) => (
          <div key={step.title} className="relative aspect-[4/3] overflow-hidden">
            <Image src={stepImages[i]} alt={step.alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition-transform duration-700 hover:scale-105" />
          </div>
        ))}
      </Reveal>
    </section>
  );
}
