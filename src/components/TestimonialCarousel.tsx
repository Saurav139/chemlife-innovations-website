"use client";

import { useState } from "react";
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
    logo: Images.testimonials.huve,
  },
  {
    quote: "We are associated with M/S Chemlife Innovations Pvt Ltd at # 18, KIADB Industrial Area, 3rd Phase, Obadenahalli, Doddaballapur, Bengaluru Rural District for last 2 years. Chemlife is our Technology partner and Product developer in the field of mold inhibition and toxin management using innovative technology for animal health. We are highly satisfied with the quality of Chemlife's Products and Technologies.",
    name: "Dr Manjunatha B P",
    role: "Chief Executive Officer",
    company: "GROEXL Vet Private Limited",
    logo: Images.testimonials.groxel,
  },
  {
    quote: "We are happy to inform, that we have collaboration arrangement with Chemlife Innovations Private Limited, since 2016 and continuing to have technology developer & novel product manufacturing understanding with them. We have been able to launch PromoGen (Natural Growth promoter for poultry) and SlimEat (Lean meat inducer for swine) for export market and Bio-trace minerals for poultry for domestic market specifically with the support of Chemlife Innovations using their ANBioT technology. We are pleased with quality and service/support of ChemLife Innovation.",
    name: "Lakshmikanth Yadav",
    role: "Managing Director",
    company: "Quadragen VetHealth Private Limited",
    logo: Images.testimonials.quadragen,
  },
];

export default function TestimonialCarousel() {
  const [current, setCurrent] = useState(0);
  const { theme } = useTheme();
  const t = useT().home.testimonials;

  return (
    <SectionWrapper className={`py-16 md:py-24 lg:py-32 ${theme.testimonialsBg}`}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-10 md:mb-16">
          <span className="text-teal-aa-light text-base lg:text-lg font-semibold tracking-widest uppercase">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl lg:text-4xl text-white mt-2 mb-4 leading-tight">
            {t.title}
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 md:gap-12 lg:gap-16 items-start">
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

                  <blockquote className={`text-lg md:text-2xl lg:text-3xl leading-relaxed mb-8 font-light italic ${theme.testimonialsText}`}>
                    &ldquo;{testimonials[current].quote}&rdquo;
                  </blockquote>

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

          {/* Person Switcher */}
          <div className="lg:col-span-1">
            <h3 className={`text-lg font-semibold mb-6 ${theme.testimonialsTitle}`}>
              Our Partners
            </h3>

            <div className="space-y-3">
              {testimonials.map((testimonial, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 border ${i === current
                    ? 'bg-teal-500/20 border-teal-400 shadow-md shadow-teal-500/10'
                    : 'bg-teal-950/20 border-teal-500/10 hover:bg-teal-500/10 hover:border-teal-500/30'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`relative w-14 h-14 rounded-full border overflow-hidden shrink-0 bg-white ${i === current
                      ? 'border-2 border-brand-orange'
                      : 'border border-brand-orange/40'
                      }`}>
                      <Image
                        src={testimonial.logo}
                        alt={`${testimonial.company} logo`}
                        fill
                        sizes="56px"
                        className="object-contain p-1.5"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${theme.testimonialsName}`}>
                        {testimonial.name}
                      </p>
                      <p className={`text-xs ${theme.testimonialsRole} opacity-75`}>
                        {testimonial.role}
                      </p>
                    </div>

                    {i === current && (
                      <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}