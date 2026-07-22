"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/VariantContext";

const taglines = [
  { id: 1, line1: "Nature Driven", line2: "Functional Feed", line3: "Additives" },
  { id: 2, line1: "Goodness of Nature", line2: "Ayurvedic Holistic", line3: "Approach" },
  { id: 3, line1: "Novel Accelerated", line2: "Bio-Transformation", line3: "Technology" },
  { id: 4, line1: "Protected Bio-Actives", line2: "Enroute to Site of", line3: "Absorption" },
  { id: 5, line1: "Enhanced Bioavailability", line2: "of Bio-Actives where it", line3: "Matters" },
  { id: 6, line1: "Green Trace Mineral", line2: "Chelation & Nano", line3: "Technologies" },
];

const bgImages = [
  { id: "poultry", src: "/images/chicken-bg.jpg", alt: "Free range chicken farm" },
  { id: "dairy", src: "/images/dairy-bg.jpg", alt: "Dairy cattle farm" },
  { id: "img76", src: "/images/76.png", alt: "Nature visualization" },
  { id: "img87", src: "/images/87.png", alt: "Farm visualization" },
];

const stats = [
  { value: 30, suffix: "+", label: "Years of Research" },
  { value: 16, suffix: "+", label: "Products" },
  { value: 22, suffix: "+", label: "Customers Served" },
  { value: 7, suffix: "+", label: "Awards Won" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="font-heading text-5xl lg:text-6xl font-bold text-teal-400">
      {count}{suffix}
    </span>
  );
}

export default function HeroVariantA() {
  const [currentTag, setCurrentTag] = useState(0);
  const [bgIndex, setBgIndex] = useState(0);
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTag((p) => (p + 1) % taglines.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setBgIndex((p) => (p + 1) % bgImages.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-navy">
      {/* Deep Navy Backdrop Base */}
      <div className="absolute inset-0 bg-brand-navy z-0" />

      {/* Dynamic Background Image cross-fading */}
      <div className="absolute inset-0 z-10 opacity-100 transition-opacity duration-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={bgImages[bgIndex].src}
              alt={bgImages[bgIndex].alt}
              fill
              className="object-cover animate-ken-burns"
              priority
              unoptimized
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Dark Overlay for text readability (keeps original image colors) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent z-20" />
      <div className="absolute inset-0 bg-black/10 z-20" />

      <div className="relative z-30 max-w-[1200px] mx-auto px-6 py-32 w-full h-full flex flex-col justify-center">
        <div className="max-w-4xl flex-1 flex flex-col justify-center mx-auto text-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}
            className="min-h-[340px] flex flex-col justify-center items-center text-center w-full"
          >
            <AnimatePresence mode="wait">
              <motion.h1
                key={taglines[currentTag].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0, 1] }}
                className="font-heading text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-16 text-white font-bold text-center"
              >
                {taglines[currentTag].line1}<br />
                <span className="text-teal-400">{taglines[currentTag].line2}</span><br />
                {taglines[currentTag].line3}
              </motion.h1>
            </AnimatePresence>

            <div className="flex flex-wrap gap-4 justify-center w-full mt-2">
              <a
                href="https://youtu.be/-amOgNcjYNg?si=a5jh1ag8rOQ14QxX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-7 py-3 rounded-full text-sm font-semibold bg-white border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Our Story
              </a>
            </div>
          </motion.div>
        </div>

        {/* Serial Embedded Company Stats */}
        <div className="w-full mt-24 pt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center text-center">
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <span className="text-white/70 text-sm font-semibold uppercase tracking-widest mt-3">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Vertical Dotted Navigator on the Right */}
      <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40">
        {taglines.map((_, i) => {
          const isActive = i === currentTag;
          return (
            <button
              key={i}
              onClick={() => setCurrentTag(i)}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-350 ${isActive
                ? "bg-teal-400 scale-125 shadow-lg shadow-teal-400/50"
                : "bg-white/30 border border-white/10 hover:bg-white/60"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          );
        })}
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t ${theme.heroBottomGradient} to-transparent`} />
    </section>
  );
}
