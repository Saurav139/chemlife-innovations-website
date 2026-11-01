"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import { Reveal, SectionHead, accentLast } from "@/components/site/ui";

const STEP_IMAGES = [Images.process.researchImage, Images.process.developmentImage, Images.process.manufacturingImage, Images.process.delivery];

/** From lab to farm: four steps on a line that draws itself as the section scrolls past. */
export default function Process() {
  const t = useT().home.howWeDo;
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  return (
    <section aria-labelledby="process-title" className="paper relative bg-page-alt py-20 md:py-28 lg:py-36 overflow-hidden">
      <div className="container-site">
        <SectionHead id="process-title" index="02" kicker={t.kicker} title={accentLast(t.title)} />

        <ol ref={ref} className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
          {/* The line through the step numbers, which zig-zag on desktop; down the side on phones */}
          <svg aria-hidden="true" className="hidden lg:block absolute inset-x-0 top-0 w-full h-[200px] overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <path d="M17 50 C 145 50, 145 146, 273 146 S 402 50, 530 50 S 659 146, 787 146 S 930 96, 1000 96" fill="none" stroke="var(--color-line)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <motion.path d="M17 50 C 145 50, 145 146, 273 146 S 402 50, 530 50 S 659 146, 787 146 S 930 96, 1000 96" fill="none" stroke="var(--color-flame)" strokeWidth="2" vectorEffect="non-scaling-stroke"
              style={{ pathLength: reduce ? 1 : progress }} />
          </svg>
          <span aria-hidden="true" className="md:hidden absolute left-[1.15rem] top-2 bottom-2 w-px bg-line" />
          <motion.span aria-hidden="true" style={{ scaleY: reduce ? 1 : progress }} className="md:hidden absolute left-[1.15rem] top-2 bottom-2 w-px bg-flame origin-top" />

          {t.steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.1} className={`relative pl-14 md:pl-0 ${i % 2 ? "lg:mt-24" : ""}`}>
              <div className="flex items-end gap-4">
                <span aria-hidden="true" className="absolute left-0 top-1 md:static grid place-items-center w-10 h-10 rounded-full bg-page-alt border border-flame text-flame label-mono z-10">{String(i + 1).padStart(2, "0")}</span>
                <span aria-hidden="true" className="hidden lg:block font-display italic text-[5.5rem] leading-[0.8] text-ink/10">{["i", "ii", "iii", "iv"][i]}</span>
              </div>
              <div className={`relative aspect-[5/4] overflow-hidden mt-0 md:mt-8 lg:mt-12 ${i % 2 ? "rounded-t-full" : "rounded-[1.75rem]"}`}>
                <Image src={STEP_IMAGES[i]} alt={step.alt} fill sizes="(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 90vw" className="object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <h3 className="font-display text-3xl text-ink mt-6">{step.title}</h3>
              <p className="text-copy leading-relaxed mt-3">{step.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
