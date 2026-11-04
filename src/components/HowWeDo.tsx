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
        <div className="text-center mb-10 md:mb-14">
          <span className="text-teal-aa-light text-sm lg:text-base font-semibold tracking-widest uppercase block mb-3">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {t.title}
          </h2>
        </div>

        {/* The four steps side by side on laptops, two by two on tablets, and a row to swipe through on phones. */}
        <ol className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 scroll-px-6 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 sm:pb-0 sm:overflow-visible sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-5 lg:gap-6">
          {steps.map((s, i) => (
            <motion.li
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.25, 0.1, 0, 1] }}
              className="group flex w-[82%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/20 sm:w-auto"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw"
                  className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${s.objectPosition || ""}`}
                />
              </div>
              <div className="relative flex flex-1 flex-col p-5 lg:p-6">
                <span className={`absolute -top-5 left-5 lg:left-6 grid place-items-center w-10 h-10 rounded-full ring-4 ring-white ${theme.processCircleBg} ${theme.processCircleText} font-bold text-lg shadow-md`}>
                  {s.step}
                </span>
                <h3 className="font-heading text-xl font-bold text-brand-navy mt-4">{s.title}</h3>
                <p className="text-slate-600 text-sm lg:text-[15px] leading-relaxed mt-2">{s.description}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
