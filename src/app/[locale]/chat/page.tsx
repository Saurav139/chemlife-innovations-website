"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { VariantProvider } from "@/context/VariantContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";

const easeOut = [0.25, 0.1, 0, 1] as const;

export default function ChatLandingPage() {
  return (
    <VariantProvider>
      <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-brand-navy">
        {/* Global Navigation Header */}
        <Header />

        {/* Main Container */}
        <main className="pt-32 flex-1 max-w-[1200px] mx-auto px-6 py-16 flex flex-col items-center justify-center w-full">
          
          {/* Main Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="w-full max-w-[850px] bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm text-center relative overflow-hidden flex flex-col items-center"
          >
            {/* Beta Version Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-aa text-xs font-bold uppercase tracking-wider mb-3 select-none no-underline">
              Beta Version
            </div>

            {/* Active Specialist Title */}
            <h1 className="font-heading text-3xl md:text-5xl font-black text-brand-navy leading-tight mb-4 max-w-xl">
              Meet Our AI Animal Nutrition Experts
            </h1>
            <div className="h-1.5 w-20 bg-teal-500 rounded-full mb-6" />

            <p className="text-slate-650 text-base md:text-lg leading-relaxed max-w-2xl mb-10 font-light">
              Select one of our specialized digital assistants below to start a conversation about feed hygiene, mycotoxins, gut health, or poultry and dairy nutrition.
            </p>

            {/* Side-by-side Mascot Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl mb-12">
              {/* Dr. Kukku (Poultry) */}
              <Link
                href="/chat/kukku"
                className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-blue-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="w-32 h-32 rounded-full bg-blue-50/50 border border-blue-100/50 p-3 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={Images.mascots.poultry}
                    alt="Dr. Kukku Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">Dr. Kukku</h3>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-4">
                  Poultry Nutrition Expert
                </p>
                <span className="inline-flex items-center justify-center min-h-11 px-6 rounded-full text-sm font-bold text-white bg-blue-aa group-hover:bg-blue-600 shadow-sm transition-colors">
                  Consult Specialist →
                </span>
              </Link>

              {/* Dr. Mikku (Dairy) */}
              <Link
                href="/chat/mikku"
                className="group bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-orange-200 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="w-32 h-32 rounded-full bg-orange-50/50 border border-orange-100/50 p-3 flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={Images.mascots.dairy}
                    alt="Dr. Mikku Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-brand-orange transition-colors">Dr. Mikku</h3>
                <p className="text-xs text-brand-orange-aa font-bold uppercase tracking-wider mb-4">
                  Dairy & Ruminant Specialist
                </p>
                <span className="inline-flex items-center justify-center min-h-11 px-6 rounded-full text-sm font-bold text-white bg-brand-orange-aa group-hover:bg-brand-orange-aa-hover shadow-sm transition-colors">
                  Consult Specialist →
                </span>
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link
                href="/products"
                className="px-8 py-3.5 rounded-full bg-brand-navy hover:bg-teal-aa hover:text-white text-white font-bold text-sm shadow transition-colors duration-300 text-center"
              >
                Explore Feed Additives
              </Link>
              <Link
                href="/"
                className="px-8 py-3.5 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold text-sm transition-colors duration-300 text-center"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
      <SiteSearch />
    </VariantProvider>
  );
}
