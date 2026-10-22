"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";
import { useT } from "@/i18n/LocaleProvider";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Core values redefined using G.I.F.T. framework directly in layout

export default function AboutPage() {
  const t = useT().about;
  return (
    <VariantProvider>
      <Header />

      <main className="bg-brand-navy min-h-screen pt-18 md:pt-20 lg:pt-24">
        {/* Intro Hero Section with Glass Plant Image BG */}
        <SectionWrapper className="py-12 md:py-24 lg:py-32 text-white relative overflow-hidden md:min-h-[500px] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.heroes.about}
              alt={t.heroAlt}
              fill
              className="object-cover opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/70 to-brand-navy/55" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          <div className="relative z-10 max-w-[900px] mx-auto text-center px-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="font-heading text-[34px] md:text-4xl lg:text-6xl font-bold leading-tight mb-6 md:mb-8"
            >
              <span className="text-teal-400">{t.titleLine1}</span><br />
              <span className="text-white">{t.titleLine2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
              className="text-white/85 text-base md:text-lg lg:text-2xl leading-relaxed max-w-3xl mx-auto font-light"
            >
              {t.intro}
            </motion.p>
          </div>
        </SectionWrapper>

        {/* Founder & Mission Section (White BG) */}
        <SectionWrapper className="py-12 md:py-24 bg-white text-brand-navy">
          <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Founder/Team Image Section with Founders Tag */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="flex flex-col items-center w-full"
            >
              <div
                className="aspect-[1024/531] w-full border-4 border-orange-200 rounded-2xl relative overflow-hidden shadow-md group hover:border-brand-orange/60 transition-colors duration-300"
                style={{ backgroundColor: "#55c2fa" }}
              >
                <Image
                  src={Images.people.foundersNew}
                  alt={t.foundersAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  priority
                />
              </div>
              <div className="mt-4 bg-teal-50 border border-teal-200 text-teal-700 text-xs md:text-sm font-bold uppercase tracking-wider px-5 py-1.5 rounded-full shadow-xs select-none">
                {t.founders}
              </div>
            </motion.div>

            {/* Mission Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeOut }}
            >
              <span className="text-teal-700 text-sm font-semibold tracking-widest uppercase block mb-3">{t.missionKicker}</span>
              <h2 className="font-heading text-3xl lg:text-4xl text-brand-navy mb-6 font-bold leading-tight">
                {t.missionTitle}
              </h2>
              <p className="text-brand-navy/80 text-base lg:text-lg leading-relaxed">
                {t.missionText}
              </p>
            </motion.div>
          </div>
        </SectionWrapper>

        {/* Core Values Section (Brand Navy BG with Honeycomb Hexagons) */}
        <SectionWrapper className="py-16 md:py-24 lg:py-36 bg-brand-navy text-white">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-10 md:mb-20">
              <span className="text-teal-300 text-sm font-semibold tracking-widest uppercase block mb-2">{t.valuesKicker}</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight">
                {t.valuesTitle}
              </h2>
            </div>

            {/* G.I.F.T. Core Values Diamond Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-y-12 md:gap-x-12 max-w-5xl mx-auto pb-4 md:pb-12 relative mt-8 md:mt-16">

               {/* Connection Lines for Desktop - Positioned underneath the boxes (z-0) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <style>{`
                  @keyframes stroke-flow {
                    to {
                      stroke-dashoffset: -20;
                    }
                  }
                  .stroke-animated {
                    animation: stroke-flow 1.2s linear infinite;
                  }
                `}</style>
 
                {/* Clockwise: Top G (50, 20) -> Right I (84, 50) */}
                <path
                  d="M 50 20 C 68 20, 84 32, 84 50"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                  fill="none"
                  className="stroke-animated opacity-55"
                />
 
                {/* Clockwise: Right I (84, 50) -> Bottom F (50, 80) */}
                <path
                  d="M 84 50 C 84 68, 68 80, 50 80"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                  fill="none"
                  className="stroke-animated opacity-55"
                />
 
                {/* Clockwise: Bottom F (50, 80) -> Left T (16, 50) */}
                <path
                  d="M 50 80 C 32 80, 16 68, 16 50"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                  fill="none"
                  className="stroke-animated opacity-55"
                />
 
                {/* Clockwise: Left T (16, 50) -> Top G (50, 20) */}
                <path
                  d="M 16 50 C 16 32, 32 20, 50 20"
                  stroke="#f97316"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                  fill="none"
                  className="stroke-animated opacity-55"
                />
              </svg>

              {/* Card G - Top Center */}
              <div className="col-start-1 md:col-start-2 md:row-start-1 flex justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1, ease: easeOut }}
                  className="relative w-full max-w-[320px] bg-linear-to-b from-teal-900 to-teal-950 rounded-2xl pt-8 pb-14 px-6 text-center border border-white/10 shadow-xl hover:border-brand-orange/45 hover:scale-[1.02] transition-all duration-300 group overflow-hidden"
                >
                  <div className="h-10 px-4 rounded-full bg-[#e2e2e2] border-2 border-brand-orange flex items-center justify-center shadow-md mb-4 mx-auto relative z-10 w-fit">
                    <div className="flex gap-2.5 font-heading font-black text-base md:text-lg select-none tracking-wider">
                      <span className="text-brand-orange text-xl scale-110">G</span>
                      <span className="text-brand-navy/30">I</span>
                      <span className="text-brand-navy/30">F</span>
                      <span className="text-brand-navy/30">T</span>
                    </div>
                  </div>
                  <div className="bg-[#102a43] text-blue-200 font-heading text-xs font-bold px-4 py-1.5 rounded-md border border-blue-500/30 inline-block mb-3.5 shadow-md mx-auto relative z-10 uppercase tracking-wider">
                    {t.values.green.name}
                  </div>
                  <p className="text-white/90 text-sm md:text-[14px] leading-relaxed max-w-[75%] mx-auto relative z-10">
                    {t.values.green.text}
                  </p>

                  {/* Sprout Icon sticking to bottom right */}
                  <svg className="absolute -right-4 -bottom-4 w-24 h-24 opacity-80 pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="leafGradG" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                      <linearGradient id="handGradG" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#64748b" />
                      </linearGradient>
                      <linearGradient id="glowGradG" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <circle cx="85" cy="85" r="35" fill="url(#glowGradG)" />
                    <g transform="translate(50, 15)">
                      <path d="M12 25C12 25 25 18 20 2C20 2 5 8 12 25Z" fill="url(#leafGradG)" />
                      <path d="M8 25C8 25 -5 18 0 2C0 2 15 8 8 25Z" fill="url(#leafGradG)" />
                      <path d="M10 25V38" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                    </g>
                    <path d="M10 90C22 90 32 82 45 80C55 78 65 82 75 82C85 82 98 72 105 65C110 60 108 55 100 58L78 67C70 70 62 70 55 65L32 50L25 55L45 70C50 74 58 74 65 72L95 60" stroke="url(#handGradG)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </div>

              {/* Card T - Middle Left */}
              <div className="col-start-1 md:col-start-1 md:row-start-2 flex justify-center md:-translate-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4, ease: easeOut }}
                  className="relative w-full max-w-[320px] bg-linear-to-b from-teal-900 to-teal-950 rounded-2xl pt-8 pb-14 px-6 text-center border border-white/10 shadow-xl hover:border-brand-orange/45 hover:scale-[1.02] transition-all duration-300 group overflow-hidden"
                >
                  <div className="h-10 px-4 rounded-full bg-[#e2e2e2] border-2 border-brand-orange flex items-center justify-center shadow-md mb-4 mx-auto relative z-10 w-fit">
                    <div className="flex gap-2.5 font-heading font-black text-base md:text-lg select-none tracking-wider">
                      <span className="text-brand-navy/30">G</span>
                      <span className="text-brand-navy/30">I</span>
                      <span className="text-brand-navy/30">F</span>
                      <span className="text-brand-orange text-xl scale-110">T</span>
                    </div>
                  </div>
                  <div className="bg-[#102a43] text-blue-200 font-heading text-xs font-bold px-4 py-1.5 rounded-md border border-blue-500/30 inline-block mb-3.5 shadow-md mx-auto relative z-10 uppercase tracking-wider">
                    {t.values.trust.name}
                  </div>
                  <p className="text-white/90 text-sm md:text-[14px] leading-relaxed max-w-[75%] mx-auto relative z-10">
                    {t.values.trust.text}
                  </p>

                  {/* Handshake Icon sticking to bottom right */}
                  <svg className="absolute -right-4 -bottom-4 w-28 h-28 opacity-80 pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="glowGradT" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="handLeftT" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0284c7" />
                      </linearGradient>
                    </defs>
                    <circle cx="85" cy="85" r="35" fill="url(#glowGradT)" />
                    <path d="M35 80H85" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
                    <path d="M48 80V92" stroke="#f97316" strokeWidth="2.5" />
                    <path d="M72 80V92" stroke="#f97316" strokeWidth="2.5" />

                    {/* Left Person */}
                    <g transform="translate(20, 38)">
                      <circle cx="15" cy="12" r="5" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
                      <path d="M7 30C7 22 11 20 15 20C19 20 23 22 23 30" fill="url(#handLeftT)" stroke="#0369a1" strokeWidth="2" />
                      <path d="M21 24L32 28" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
                    </g>

                    {/* Right Person */}
                    <g transform="translate(55, 38)">
                      <circle cx="15" cy="12" r="5" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
                      <path d="M7 30C7 22 11 20 15 20C19 20 23 22 23 30" fill="#ffedd5" stroke="#ea580c" strokeWidth="2" />
                      <path d="M9 24L-2 28" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
                    </g>

                    {/* Handshake Details */}
                    <g transform="translate(42, 60)">
                      <circle cx="8" cy="8" r="4" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
                    </g>
                  </svg>
                </motion.div>
              </div>

              {/* Card I - Middle Right */}
              <div className="col-start-1 md:col-start-3 md:row-start-2 flex justify-center md:-translate-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2, ease: easeOut }}
                  className="relative w-full max-w-[320px] bg-linear-to-b from-teal-900 to-teal-950 rounded-2xl pt-8 pb-14 px-6 text-center border border-white/10 shadow-xl hover:border-brand-orange/45 hover:scale-[1.02] transition-all duration-300 group overflow-hidden"
                >
                  <div className="h-10 px-4 rounded-full bg-[#e2e2e2] border-2 border-brand-orange flex items-center justify-center shadow-md mb-4 mx-auto relative z-10 w-fit">
                    <div className="flex gap-2.5 font-heading font-black text-base md:text-lg select-none tracking-wider">
                      <span className="text-brand-navy/30">G</span>
                      <span className="text-brand-orange text-xl scale-110">I</span>
                      <span className="text-brand-navy/30">F</span>
                      <span className="text-brand-navy/30">T</span>
                    </div>
                  </div>
                  <div className="bg-[#102a43] text-blue-200 font-heading text-xs font-bold px-4 py-1.5 rounded-md border border-blue-500/30 inline-block mb-3.5 shadow-md mx-auto relative z-10 uppercase tracking-wider">
                    {t.values.innovation.name}
                  </div>
                  <p className="text-white/90 text-sm md:text-[14px] leading-relaxed max-w-[75%] mx-auto relative z-10">
                    {t.values.innovation.text}
                  </p>

                  {/* Bulb Icon sticking to bottom right */}
                  <svg className="absolute -right-4 -bottom-4 w-24 h-24 opacity-80 pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:rotate-6" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="bulbGradI" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef08a" />
                        <stop offset="100%" stopColor="#eab308" />
                      </linearGradient>
                      <linearGradient id="gearGradI" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#475569" />
                      </linearGradient>
                      <linearGradient id="glowGradI" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#eab308" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <circle cx="85" cy="85" r="35" fill="url(#glowGradI)" />
                    <g stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
                      <line x1="60" y1="25" x2="60" y2="15" />
                      <line x1="35" y1="40" x2="28" y2="33" />
                      <line x1="85" y1="40" x2="92" y2="33" />
                      <line x1="25" y1="65" x2="15" y2="65" />
                      <line x1="95" y1="65" x2="105" y2="65" />
                    </g>
                    <path d="M60 28C43 28 38 40 38 53C38 64 47 70 50 78H70C73 70 82 64 82 53C82 40 77 28 60 28Z" fill="url(#bulbGradI)" stroke="#ca8a04" strokeWidth="3" />
                    <path d="M50 78H70V85C70 87 67 89 60 89C53 89 50 87 50 85V78Z" fill="#64748b" stroke="#475569" strokeWidth="3" />
                    <line x1="52" y1="81" x2="68" y2="81" stroke="#334155" strokeWidth="2" />
                    <g transform="translate(60, 53)">
                      <circle cx="0" cy="0" r="8" fill="url(#gearGradI)" stroke="#334155" strokeWidth="2" />
                      <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
                      <g stroke="#334155" strokeWidth="2" strokeLinecap="round">
                        <line x1="0" y1="-8" x2="0" y2="-10" />
                        <line x1="0" y1="8" x2="0" y2="10" />
                        <line x1="-8" y1="0" x2="-10" y2="0" />
                        <line x1="8" y1="0" x2="10" y2="0" />
                      </g>
                    </g>
                  </svg>
                </motion.div>
              </div>

              {/* Card F - Bottom Center */}
              <div className="col-start-1 md:col-start-2 md:row-start-3 flex justify-center md:-translate-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3, ease: easeOut }}
                  className="relative w-full max-w-[320px] bg-linear-to-b from-teal-900 to-teal-950 rounded-2xl pt-8 pb-14 px-6 text-center border border-white/10 shadow-xl hover:border-brand-orange/45 hover:scale-[1.02] transition-all duration-300 group overflow-hidden"
                >
                  <div className="h-10 px-4 rounded-full bg-[#e2e2e2] border-2 border-brand-orange flex items-center justify-center shadow-md mb-4 mx-auto relative z-10 w-fit">
                    <div className="flex gap-2.5 font-heading font-black text-base md:text-lg select-none tracking-wider">
                      <span className="text-brand-navy/30">G</span>
                      <span className="text-brand-navy/30">I</span>
                      <span className="text-brand-orange text-xl scale-110">F</span>
                      <span className="text-brand-navy/30">T</span>
                    </div>
                  </div>
                  <div className="bg-[#102a43] text-blue-200 font-heading text-xs font-bold px-4 py-1.5 rounded-md border border-blue-500/30 inline-block mb-3.5 shadow-md mx-auto relative z-10 uppercase tracking-wider">
                    {t.values.facts.name}
                  </div>
                  <p className="text-white/90 text-sm md:text-[14px] leading-relaxed max-w-[75%] mx-auto relative z-10">
                    {t.values.facts.text}
                  </p>

                  {/* Document Icon sticking to bottom right */}
                  <svg className="absolute -right-4 -bottom-4 w-24 h-24 opacity-80 pointer-events-none transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="docGradF" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f8fafc" />
                        <stop offset="100%" stopColor="#cbd5e1" />
                      </linearGradient>
                      <linearGradient id="chartGradF" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#0284c7" />
                      </linearGradient>
                      <linearGradient id="glowGradF" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <circle cx="85" cy="85" r="35" fill="url(#glowGradF)" />
                    <rect x="40" y="30" width="45" height="60" rx="4" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
                    <rect x="30" y="40" width="45" height="60" rx="4" fill="url(#docGradF)" stroke="#334155" strokeWidth="3" />
                    <g stroke="#64748b" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="38" y1="52" x2="60" y2="52" />
                      <line x1="38" y1="60" x2="68" y2="60" />
                      <line x1="38" y1="68" x2="52" y2="68" />
                    </g>
                    <g fill="url(#chartGradF)" stroke="#0369a1" strokeWidth="1.5">
                      <rect x="38" y="78" width="6" height="12" rx="1" />
                      <rect x="48" y="74" width="6" height="16" rx="1" />
                      <rect x="58" y="81" width="6" height="9" rx="1" />
                    </g>
                    <circle cx="82" cy="82" r="10" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
                    <path d="M78 82L81 85L87 79" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </div>

            </div>
          </div>
        </SectionWrapper>

        {/* Leadership Team Section (Solid White BG) */}
        <SectionWrapper className="py-16 md:py-24 lg:py-32 bg-white text-brand-navy border-t border-gray-100">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-10 md:mb-20">
              <span className="text-teal-700 text-sm font-semibold tracking-widest uppercase block mb-2">{t.leadersKicker}</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-brand-navy font-bold leading-tight">
                {t.leadersTitle}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-[1200px] mx-auto">
              {[
                {
                  name: "Radhakrishna PM",
                  degree: "Ph.D, PG-Dip in Mgmt",
                  image: Images.people.leaderRadhakrishna
                },
                {
                  name: "Sharada KC",
                  degree: "Ph.D",
                  image: Images.people.leaderSharada
                },
                {
                  name: "Sneha R",
                  degree: "M.Com",
                  image: Images.people.leaderSneehaCropped
                },
                {
                  name: "Shankar CV",
                  degree: "BE, MBA",
                  image: Images.people.leaderShankar
                }
                // Roles and bios are in the language file (about.leaders), in this order.
              ].map((leader, i) => ({ ...leader, ...t.leaders[i] })).map((leader, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15, ease: easeOut }}
                  className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 flex flex-col items-center text-center shadow-sm hover:border-brand-orange/30 hover:shadow-md transition-all duration-300 group hover:scale-[1.02]"
                >
                  {/* Headshot container */}
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-2 border-orange-100 group-hover:border-brand-orange flex items-center justify-center bg-gray-100 mb-6 shadow-sm relative overflow-hidden transition-all duration-300">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      sizes="(max-width: 768px) 112px, 128px"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h3 className="font-heading text-base md:text-lg font-bold text-brand-orange mb-1">
                    {leader.name}
                  </h3>
                  <p className="text-brand-navy font-bold text-xs md:text-[11px] uppercase tracking-wider mb-0.5">
                    {leader.role}
                  </p>
                  <p className="text-brand-navy text-xs font-semibold mb-4">
                    {leader.degree}
                  </p>
                  <p className="text-teal-700 text-xs md:text-sm leading-relaxed max-w-[90%]">
                    {leader.bio}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
