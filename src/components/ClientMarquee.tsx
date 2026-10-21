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
  // Staggered chessboard effect for 3 columns
  const row = Math.floor(index / 3);
  const col = index % 3;
  const isChessLight = (row + col) % 2 === 0;
  const cardBg = isChessLight ? "bg-white" : "bg-[#f1f5f9]/60";
  const borderStyle = isChessLight 
    ? "border-2 border-brand-orange/35 hover:border-brand-orange/65" 
    : "border-2 border-white";
  const shadowStyle = isChessLight
    ? "shadow-[0_4px_12px_rgba(230,92,56,0.03)] hover:shadow-[0_8px_20px_rgba(230,92,56,0.08)]"
    : "shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)]";

  return (
    <div className="perspective-1000 w-full aspect-[4/3]">
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
        <div className={`absolute inset-0 backface-hidden ${cardBg} ${borderStyle} rounded-2xl flex items-center justify-center p-6 ${shadowStyle} hover:scale-[1.02] transition-all duration-300`}>
          <div className="relative w-full h-full">
            <Image
              src={Images.partnerLogos.path(frontLogo)}
              alt={`${Images.partnerLogos.names[frontLogo] ?? "Partner"} ${t.logo}`}
              fill
              className="object-contain transition-all duration-300"
              sizes="(max-width: 768px) 50vw, 250px"
            />
          </div>
        </div>

        {/* Back Side */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 ${cardBg} ${borderStyle} rounded-2xl flex items-center justify-center p-6 ${shadowStyle} hover:scale-[1.02] transition-all duration-300`}>
          <div className="relative w-full h-full">
            <Image
              src={Images.partnerLogos.path(backLogo)}
              alt={`${Images.partnerLogos.names[backLogo] ?? "Partner"} ${t.logo}`}
              fill
              className="object-contain transition-all duration-300"
              sizes="(max-width: 768px) 50vw, 250px"
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
    <section className="bg-white py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 mb-16">
        <div className="text-center">
          <span className="text-teal-400 text-base lg:text-lg font-semibold tracking-widest uppercase">
            {t.kicker}
          </span>
          <h2 className="font-heading text-4xl lg:text-5xl text-brand-navy mt-2 mb-4 leading-tight">
            {t.title}
          </h2>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-8">
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
