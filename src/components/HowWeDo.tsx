"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/context/VariantContext";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

// Titles, descriptions and photo descriptions are in the language file (home.howWeDo.steps), in this order.
const stepImages: { image: string; objectPosition?: string }[] = [
  { image: Images.process.researchImage },
  { image: Images.process.developmentImage },
  { image: Images.process.manufacturingImage },
  { image: Images.process.delivery },
];

export default function HowWeDo() {
  const { theme } = useTheme();
  const t = useT().home.howWeDo;
  const steps = t.steps.map((step, i) => ({ ...step, ...stepImages[i], step: i + 1 }));

  return (
    <section className="relative py-16 md:py-24 lg:py-32 overflow-hidden bg-brand-navy">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src={Images.process.howWeDoBg}
          alt={t.bgAlt}
          fill
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-brand-navy/90 mix-blend-multiply" />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6">
        {/* Title Section */}
        <div className="text-center mb-10 md:mb-20">
          <span className="text-teal-aa-light text-sm font-bold tracking-widest uppercase block mb-3">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {t.title}
          </h2>
        </div>

        {/* Unified Chessboard Container (Attached rows, shrunken dimensions) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0, 1] }}
          className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 max-w-[850px] lg:max-w-[1100px] mx-auto bg-white divide-y divide-slate-100"
        >
          {steps.map((s, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={s.step}
                className="grid grid-cols-1 md:grid-cols-2 gap-0 md:h-[260px] lg:h-[300px] items-stretch group"
              >
                {/* Image Box */}
                <div className={`relative w-full h-[200px] md:h-full overflow-hidden order-1 ${isEven ? "md:order-1" : "md:order-2"}`}>
                  <Image
                    src={s.image}
                    alt={s.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 550px"
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
                      <p className="text-slate-600 text-xs md:text-sm lg:text-base leading-relaxed font-normal">
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
