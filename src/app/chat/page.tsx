"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { VariantProvider } from "@/context/VariantContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";

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
            {/* Subtle Top Badge */}
            <span className="px-4 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-black uppercase tracking-wider block mb-6">
              📣 Coming Soon
            </span>

            {/* Title */}
            <h1 className="font-heading text-3xl md:text-5xl font-black text-brand-navy leading-tight mb-4 max-w-xl">
              Meet Our AI Animal Nutrition Experts
            </h1>
            <div className="h-1.5 w-20 bg-teal-500 rounded-full mb-6" />

            <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mb-10 font-light">
              We are currently fine-tuning our customized animal health specialists. 
              Dr. Kukku and Dr. Mikku will be live soon to provide instant, validated scientific insights for your feed additive and veterinary formulations.
            </p>

            {/* Side-by-side Mascot Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl mb-12">
              {/* Dr. Kukku */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-blue-50 border border-blue-100/50 p-3 flex items-center justify-center mb-4 shadow-sm">
                  <img
                    src="/images/poultry-mascot.png"
                    alt="Dr. Kukku Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Dr. Kukku</h3>
                <p className="text-sm text-blue-650 font-bold uppercase tracking-wider">
                  Poultry Nutrition Expert
                </p>
              </div>

              {/* Dr. Mikku */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-orange-50 border border-orange-100/50 p-3 flex items-center justify-center mb-4 shadow-sm">
                  <img
                    src="/images/dairy-mascot.png"
                    alt="Dr. Mikku Mascot"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Dr. Mikku</h3>
                <p className="text-sm text-brand-orange font-bold uppercase tracking-wider">
                  Dairy & Ruminant Specialist
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Link
                href="/products"
                className="px-8 py-3.5 rounded-full bg-brand-navy hover:bg-teal-650 text-white font-bold text-sm shadow transition-colors duration-300 text-center"
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
