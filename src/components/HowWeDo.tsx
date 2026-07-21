"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/context/VariantContext";

interface Step {
  step: number;
  title: string;
  description: string;
  image: string;
  objectPosition?: string;
}

const steps: Step[] = [
  {
    step: 1,
    title: "Research",
    description: "In-depth scientific research and analysis to identify bioactive molecules and their applications in animal nutrition.",
    image: "/images/research_image.jpeg",
  },
  {
    step: 2,
    title: "Development",
    description: "Formulation and development of innovative feed additives using patented technologies and green chemistry pathways.",
    image: "/images/development_image.jpeg",
  },
  {
    step: 3,
    title: "Manufacturing",
    description: "Scalable feed-additives manufacturing setup with rigorous quality control to ensure consistency, safety, and efficacy.",
    image: "/images/manufacturing_image.jpeg",
  },
  {
    step: 4,
    title: "Delivery",
    description: "Protected feed additive bio-actives en route to the site of absorption with enhanced bioavailability and targeted release systems.",
    image: "/images/process-delivery_crop.png",
  },
];

export default function HowWeDo() {
  const { theme } = useTheme();

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-brand-navy">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="/images/how-we-do-bg.avif"
          alt="How We Do It Process Background"
          fill
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-brand-navy/90 mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Title Section */}
        <div className="text-center mb-20">
          <span className="text-teal-400 text-sm font-bold tracking-widest uppercase block mb-3">
            Our Process
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-white leading-tight">
            How We Do It?
          </h2>
        </div>

        {/* Unified Chessboard Container (Attached rows, shrunken dimensions) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0, 1] }}
          className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 max-w-[850px] mx-auto bg-white divide-y divide-slate-100"
        >
          {steps.map((s, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={s.step}
                className="grid grid-cols-1 md:grid-cols-2 gap-0 md:h-[260px] items-stretch group"
              >
                {/* Image Box */}
                <div className={`relative w-full h-[200px] md:h-full overflow-hidden order-1 ${isEven ? "md:order-1" : "md:order-2"}`}>
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    sizes="(max-w-768px) 100vw, 425px"
                    className={`object-cover group-hover:scale-102 transition-transform duration-700 ${s.objectPosition || ""}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/15 to-transparent animate-fade-in" />
                </div>

                {/* Text Box */}
                <div className={`w-full p-6 lg:p-10 flex flex-col justify-center bg-white order-2 ${isEven ? "md:order-2" : "md:order-1"} relative`}>
                  {/* Hover Left Side Accent Line */}
                  <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-brand-orange scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                  <div className="flex items-start gap-4">
                    {/* Step Number Circle */}
                    <div className={`w-10 h-10 rounded-full ${theme.processCircleBg} flex items-center justify-center ${theme.processCircleText} font-bold flex-shrink-0 text-lg shadow-sm`}>
                      {s.step}
                    </div>

                    {/* Step Description */}
                    <div className="flex-1">
                      <h3 className="font-heading text-xl lg:text-2xl font-bold text-slate-800 mb-2 group-hover:text-brand-orange transition-colors duration-300">
                        {s.title}
                      </h3>
                      <p className="text-slate-600 text-xs lg:text-sm leading-relaxed font-normal">
                        {s.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
