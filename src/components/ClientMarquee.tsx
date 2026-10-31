"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";
import Reveal from "./Reveal";

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
  // One tile for every logo, a tone step off the page, and each logo (trimmed of its empty margins) fitted inside the
  // same box, 78% wide and 58% tall, so wide wordmarks and square badges read at a similar size.
  const face = "absolute inset-0 backface-hidden bg-surface flex items-center justify-center";

  return (
    <div className="perspective-1000 aspect-[3/2]">
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
              sizes="(min-width: 1024px) 220px, 31vw"
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
              sizes="(min-width: 1024px) 220px, 31vw"
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

  // The heading in the left column, the logos hanging from the axis beside it.
  return (
    <section className="section-y bg-white overflow-hidden">
      <div className="frame grid lg:grid-cols-12 gap-x-8">
        <Reveal className="lg:col-span-4">
          <h2 className="text-title mb-12 md:mb-16 [overflow-wrap:anywhere]">{t.title}</h2>
        </Reveal>
        <Reveal order={1} className="lg:col-start-6 lg:col-span-7 grid grid-cols-3 gap-1.5">
          {frontLogos.map((logo, i) => (
            <FlipCard
              key={`flip-${i}`}
              frontLogo={logo}
              backLogo={backLogos[i]}
              index={i}
              flipped={flipped}
            />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
