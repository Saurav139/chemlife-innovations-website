"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/context/VariantContext";

export default function Hero() {
  const { theme } = useTheme();

  return (
    <section id="hero" className={`relative h-screen flex items-center overflow-hidden ${theme.heroBg}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(31,99,6,0.1),transparent_50%)]" />

      {theme.heroBg === "bg-brand-navy" && (
        <div className="absolute right-0 top-0 bottom-0 w-[45%] hidden lg:block">
          <Image src="/images/product-rumi.png" alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-brand-navy" />
        </div>
      )}

      {theme.heroBg === "bg-warm-white" && (
        <>
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-green/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </>
      )}

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-32 w-full">
        <div className={`grid gap-12 items-center ${
          theme.heroBg === "bg-brand-navy" ? "lg:grid-cols-2" :
          theme.heroBg === "bg-warm-white" ? "lg:grid-cols-5" :
          "lg:grid-cols-2"
        }`}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}
            className={theme.heroBg === "bg-warm-white" ? "lg:col-span-3" : ""}
          >
            {theme.heroBg === "bg-brand-navy" ? (
              <span className={`inline-flex items-center gap-2 bg-brand-orange/20 ${theme.heroTagline} text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6`}>
                Nature Driven Functional Feed Additives
              </span>
            ) : (
              <span className={`inline-block ${theme.heroTagline} text-sm font-semibold tracking-widest uppercase mb-4`}>
                Nature Driven Functional Feed Additives
              </span>
            )}
            <h1 className={`font-heading text-5xl lg:text-6xl leading-tight mb-6 ${theme.heroHeading}`}>
              Goodness of nature through{" "}
              <span className={theme.heroAccent}>ayurvedic holistic</span> approach
            </h1>
            <p className={`text-lg max-w-xl mb-8 leading-relaxed ${theme.heroText}`}>
              Novel accelerated bio-transformation technology delivering
              protected bio-actives en route to the site of absorption.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#how-we-do"
                className={`inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all ${theme.heroCtaPrimary}`}
              >
                {theme.heroBg === "bg-brand-navy" ? (
                  <>Discover Our Technology <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></>
                ) : (
                  "Discover Our Technology"
                )}
              </a>
              <a
                href="#what-we-do"
                className={`inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all ${theme.heroCtaSecondary}`}
              >
                Our Concepts
              </a>
            </div>
          </motion.div>

          {theme.heroBg !== "bg-brand-navy" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0, 1] }}
              className={`hidden lg:flex justify-center ${theme.heroBg === "bg-warm-white" ? "lg:col-span-2" : ""}`}
            >
              {theme.heroBg === "bg-warm-white" ? (
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-full h-full border-2 border-brand-orange/30 rounded-2xl" />
                  <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/5]">
                    <Image src="/images/product-value.png" alt="Feed ingredients" fill className="object-cover" priority />
                  </div>
                  <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="relative w-full max-w-md aspect-[4/3]">
                  <div className="absolute inset-0 bg-white/10 rounded-[2rem] blur-3xl" />
                  <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                    <Image src="/images/product-mono.png" alt="Poultry farming" fill className="object-cover" priority />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t ${theme.heroBottomGradient} to-transparent`} />
    </section>
  );
}
