"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

// Quotes stay in the words our partners wrote them, in English.

const testimonials = [
  {
    quote: "We are happy to inform that we have collaboration arrangement with Chemlife Innovations since 2018 and continuing to have technology developer & novel product manufacturing understanding with them. Specifically with the help of Chemlife Innovations using their proprietary multi-layer microencapsulation technology, we have introduced a novel functionalized feed ingredient for dairy. We are happy with the quality of the product and happy with service support provided by them.",
    name: "Akmal Reyaz",
    role: "Business Head – Dairy & Aqua",
    company: "Huvepharma Sea (Pune) Private Limited",
    short: "Huvepharma",
    logo: Images.testimonials.huve,
  },
  {
    quote: "We are associated with M/S Chemlife Innovations Pvt Ltd at # 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapur, Bengaluru Rural District for last 2 years. Chemlife is our Technology partner and Product developer in the field of mold inhibition and toxin management using innovative technology for animal health. We are highly satisfied with the quality of Chemlife's Products and Technologies.",
    name: "Dr Manjunatha B P",
    role: "Chief Executive Officer",
    company: "GROEXL Vet Private Limited",
    short: "GROEXL Vet",
    logo: Images.testimonials.groxel,
  },
  {
    quote: "We are happy to inform, that we have collaboration arrangement with Chemlife Innovations Private Limited, since 2016 and continuing to have technology developer & novel product manufacturing understanding with them. We have been able to launch PromoGen (Natural Growth promoter for poultry) and SlimEat (Lean meat inducer for swine) for export market and Bio-trace minerals for poultry for domestic market specifically with the support of Chemlife Innovations using their ANBioT technology. We are pleased with quality and service/support of ChemLife Innovation.",
    name: "Lakshmikanth Yadav",
    role: "Managing Director",
    company: "Quadragen VetHealth Private Limited",
    short: "Quadragen",
    logo: Images.testimonials.quadragen,
  },
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  // Phones show the first 6 lines of a long quote, with Read more.
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);
  const quoteEl = useRef<HTMLQuoteElement | null>(null);
  const measure = useCallback(() => {
    const el = quoteEl.current;
    setClamped(!!el && el.scrollHeight > el.clientHeight + 1);
  }, []);
  // Measured when each new quote appears (it fades in after the old one leaves), on Read more, and on resize.
  const quoteRef = useCallback(
    (el: HTMLQuoteElement | null) => {
      quoteEl.current = el;
      if (el) requestAnimationFrame(measure);
    },
    [measure]
  );
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, expanded]);
  const choose = (i: number) => {
    setCurrent(i);
    setExpanded(false);
  };
  const t = useT().home.testimonials;

  return (
    <section className="field-deep section-y">
      <div className="frame">
        <SectionHead title={t.title} />

        <div className="grid lg:grid-cols-12 gap-x-8 gap-y-10">
          {/* The partners, as a list to choose from: three tabs across on phones and tablets, a column on desktop. */}
          <Reveal className="lg:col-span-4">
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
              {testimonials.map((testimonial, i) => {
                const active = i === current;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => choose(i)}
                    aria-label={`${testimonial.name}, ${testimonial.company}`}
                    aria-pressed={active}
                    className={`w-full flex flex-col lg:flex-row items-center gap-2 lg:gap-4 px-2 py-3 lg:p-4 text-center lg:text-left transition-colors cursor-pointer active:scale-[0.98] ${
                      active ? "bg-white text-ink" : "bg-white/10 hover:bg-white/15 text-white"
                    }`}
                  >
                    <span className="relative w-11 h-11 lg:w-12 lg:h-12 rounded-full overflow-hidden shrink-0 bg-white">
                      <Image src={testimonial.logo} alt="" fill sizes="48px" className="object-contain p-1.5" />
                    </span>
                    <span className="lg:hidden text-small font-semibold leading-tight">{testimonial.short}</span>
                    <span className="hidden lg:block min-w-0">
                      <span className="block font-semibold">{testimonial.name}</span>
                      <span className="block text-small">{testimonial.role}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* The chosen quote, on the axis */}
          <Reveal order={1} className="lg:col-start-6 lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.figure
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
              >
                <blockquote ref={quoteRef} className={`text-lead ${expanded ? "" : "max-md:line-clamp-6"}`}>
                  &ldquo;{testimonials[current].quote}&rdquo;
                </blockquote>
                {(clamped || expanded) && (
                  <button
                    type="button"
                    onClick={() => setExpanded((open) => !open)}
                    aria-expanded={expanded}
                    className="md:hidden mt-2 inline-flex items-center min-h-11 link cursor-pointer"
                  >
                    {expanded ? t.showLess : t.readMore}
                  </button>
                )}
                <figcaption className="mt-8">
                  <span className="block font-semibold">{testimonials[current].name}</span>
                  <span className="block text-small">{testimonials[current].role}, {testimonials[current].company}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
