"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { useTheme } from "@/context/VariantContext";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

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
  const { theme } = useTheme();
  const t = useT().home.testimonials;

  return (
    <SectionWrapper className={`py-16 md:py-24 lg:py-32 ${theme.testimonialsBg}`}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-teal-aa-light text-sm lg:text-base font-semibold tracking-widest uppercase">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-2 mb-4 leading-tight">
            {t.title}
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 md:gap-10 lg:gap-16 items-start">
          {/* Large Quote Section */}
          <div className="lg:col-span-2">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0, 1] }}
                >
                  <svg className="w-10 h-10 mb-5 md:w-16 md:h-16 md:mb-8 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
                  </svg>

                  {/* Phones: regular (not light italic) text, which is easier to read at this length, cut to 6 lines. */}
                  <blockquote
                    ref={quoteRef}
                    className={`text-base md:text-2xl lg:text-3xl leading-relaxed font-normal md:font-light not-italic md:italic ${expanded ? "" : "max-md:line-clamp-6"} ${theme.testimonialsText}`}
                  >
                    &ldquo;{testimonials[current].quote}&rdquo;
                  </blockquote>
                  {(clamped || expanded) && (
                    <button
                      type="button"
                      onClick={() => setExpanded((open) => !open)}
                      aria-expanded={expanded}
                      className="md:hidden mt-2 inline-flex items-center min-h-11 text-sm font-semibold text-teal-aa-light underline underline-offset-4 cursor-pointer"
                    >
                      {expanded ? t.showLess : t.readMore}
                    </button>
                  )}
                  <div className="mb-8" />

                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 rounded-full border-2 border-brand-orange bg-white overflow-hidden flex-shrink-0">
                      <Image
                        src={testimonials[current].logo}
                        alt={`${testimonials[current].company} logo`}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </div>

                    <div>
                      <p className={`font-heading text-xl ${theme.testimonialsName}`}>
                        {testimonials[current].name}
                      </p>
                      <p className={`text-base ${theme.testimonialsRole}`}>
                        {testimonials[current].role}
                      </p>
                      <p className={`text-sm opacity-75 ${theme.testimonialsRole}`}>
                        {testimonials[current].company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Person Switcher. Phones and tablets: three labelled tabs above the quote, the chosen one filled white.
              Desktop: a list beside the quote with each partner's name and role. */}
          <div className="order-first lg:order-none lg:col-span-1">
            <h3 className={`hidden lg:block text-lg font-semibold mb-6 ${theme.testimonialsTitle}`}>
              Our Partners
            </h3>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:block lg:space-y-3">
              {testimonials.map((testimonial, i) => {
                const active = i === current;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => choose(i)}
                    aria-label={`${testimonial.name}, ${testimonial.company}`}
                    aria-pressed={active}
                    className={`w-full rounded-xl border transition-all duration-200 cursor-pointer text-center lg:text-left px-2 py-3 lg:p-4 ${
                      active
                        ? "bg-white dark:bg-night-800 border-white shadow-lg lg:bg-teal-500/20 lg:border-teal-400 lg:shadow-md lg:shadow-teal-500/10"
                        : "bg-white/5 border-white/20 hover:bg-white/10 lg:bg-teal-950/20 lg:border-teal-500/10 lg:hover:bg-teal-500/10 lg:hover:border-teal-500/30"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3">
                      <div className={`relative w-11 h-11 lg:w-14 lg:h-14 rounded-full overflow-hidden shrink-0 bg-white ${
                        active ? "border-2 border-brand-orange" : "border border-brand-orange/40"
                      }`}>
                        <Image
                          src={testimonial.logo}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-contain p-1.5"
                        />
                      </div>

                      {/* Phones and tablets: the company name under the logo */}
                      <span className={`lg:hidden text-xs font-semibold leading-tight ${active ? "text-brand-navy dark:text-night-text" : "text-white/85"}`}>
                        {testimonial.short}
                      </span>

                      {/* Desktop: name and role */}
                      <div className="hidden lg:block flex-1 min-w-0">
                        <p className={`font-medium text-sm ${theme.testimonialsName}`}>
                          {testimonial.name}
                        </p>
                        <p className={`text-xs ${theme.testimonialsRole} opacity-75`}>
                          {testimonial.role}
                        </p>
                      </div>

                      {active && (
                        <div className="hidden lg:block w-2 h-2 rounded-full bg-teal-400"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}