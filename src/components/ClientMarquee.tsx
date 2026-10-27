"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

const frontLogos = [...Images.partnerLogos.frontRow];
const backLogos = [...Images.partnerLogos.backRow];

interface FlipCardProps {
  frontLogo: string;
  backLogo: string;
  index: number;
  flipped: boolean;
}

function FlipCard({ frontLogo, backLogo, index, flipped }: FlipCardProps) {
  const t = useT().home.partners;
  // The flip runs row by row, left to right.
  const row = Math.floor(index / 3);
  const col = index % 3;
  // One card style for every logo, and each logo (trimmed of its empty margins) fitted inside the same box, 78% wide
  // and 58% tall, so wide wordmarks and square badges read at a similar size.
  const face = "absolute inset-0 backface-hidden bg-white border border-slate-200 hover:border-brand-orange/40 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300";

  return (
    // Two across on phones (wide enough to read the logos), three from tablet up.
    <div className="perspective-1000 w-[calc(50%-0.375rem)] sm:w-[calc((100%-3rem)/3)] md:w-[calc((100%-4rem)/3)] aspect-[3/2]">
      <motion.div
        className="w-full h-full relative transform-style-preserve-3d"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{
          duration: 0.8,
          delay: col * 0.12 + row * 0.12,
          ease: [0.25, 0.1, 0, 1],
        }}
      >
        {/* Front Side */}
        <div className={face}>
          <div className="relative w-[78%] h-[58%]">
            <Image
              src={Images.partnerLogos.path(frontLogo)}
              alt={`${Images.partnerLogos.names[frontLogo] ?? "Partner"} ${t.logo}`}
              fill
              className="object-contain transition-all duration-300"
              sizes="(max-width: 639px) 45vw, (max-width: 896px) 30vw, 260px"
            />
          </div>
        </div>

        {/* Back Side */}
        <div className={`${face} rotate-y-180`}>
          <div className="relative w-[78%] h-[58%]">
            <Image
              src={Images.partnerLogos.path(backLogo)}
              alt={`${Images.partnerLogos.names[backLogo] ?? "Partner"} ${t.logo}`}
              fill
              className="object-contain transition-all duration-300"
              sizes="(max-width: 639px) 45vw, (max-width: 896px) 30vw, 260px"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ClientMarquee() {
  const t = useT().home.partners;
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlipped((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 mb-10 md:mb-16">
        <div className="text-center">
          <span className="text-teal-aa text-sm lg:text-base font-semibold tracking-widest uppercase">
            {t.kicker}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mt-2 mb-4 leading-tight">
            {t.title}
          </h2>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        {/* A wrapping row, so the ninth logo on a phone (two across) sits centred rather than alone on the left. */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
          {frontLogos.map((logo, i) => (
            <FlipCard
              key={`flip-${i}`}
              frontLogo={logo}
              backLogo={backLogos[i]}
              index={i}
              flipped={flipped}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
