"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Images } from "@/lib/assets";

export default function ChatOverlay() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 font-sans flex flex-col items-end">
      <AnimatePresence>
        {/* Expanded Panel */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-3 md:mb-4 w-[380px] max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-7rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden flex flex-col"
          >
            {/* Header with Brand Navy and Accent gradient */}
            <div className="p-5 bg-linear-to-r from-brand-navy to-[#1e3452] text-white flex justify-between items-center relative">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3.5">
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-white overflow-hidden shadow-lg flex items-center justify-center p-0.5">
                    <img
                      src={Images.mascots.poultry}
                      alt="Dr. Kukku"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-white overflow-hidden shadow-lg flex items-center justify-center p-0.5">
                    <img
                      src={Images.mascots.dairy}
                      alt="Dr. Mikku"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[18px] leading-tight text-white tracking-wide">
                    ChemLife AI Experts
                  </h3>
                  <p className="text-[11px] text-teal-aa-light font-semibold tracking-wider uppercase">
                    Poultry & Dairy Nutritionists
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white text-xl font-bold cursor-pointer"
                aria-label="Close panel"
              >
                &times;
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-grow flex flex-col gap-3">
              <p className="text-xs text-brand-navy font-bold text-center leading-relaxed mb-1">
                Select an expert to consult:
              </p>
              
              <div className="flex flex-col gap-2.5 w-full">
                {/* Dr. Kukku */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/chat/kukku");
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-all text-left cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-0.5 shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                    <img src={Images.mascots.poultry} alt="Dr. Kukku" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-slate-800">Dr. Kukku</p>
                    <p className="text-[10px] text-slate-500 truncate">Poultry Nutrition Specialist</p>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-600 flex-shrink-0">Chat →</span>
                </button>

                {/* Dr. Mikku */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/chat/mikku");
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-orange-100 bg-orange-50/50 hover:bg-orange-50 transition-all text-left cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-0.5 shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                    <img src={Images.mascots.dairy} alt="Dr. Mikku" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-slate-800">Dr. Mikku</p>
                    <p className="text-[10px] text-slate-500 truncate">Dairy & Ruminant Specialist</p>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-orange-aa flex-shrink-0">Chat →</span>
                </button>
              </div>
            </div>
 
            {/* Footer with matched styling */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-aa font-semibold uppercase tracking-wider">
              <span>Powered by ChemLife AI</span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/chat");
                }}
                className="text-brand-navy hover:text-brand-orange-aa cursor-pointer transition-colors"
              >
                All Specialists →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Bubble Trigger with LARGER Mascot Avatars */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Ask our AI experts"
        aria-expanded={isOpen}
        // Phones get a compact bubble with just the mascots; the label appears from tablet width up.
        className="flex items-center gap-2 md:gap-3 bg-brand-orange-aa text-white p-2 md:px-5 md:py-3.5 rounded-full shadow-2xl hover:bg-brand-orange-aa-hover transition-all group border-2 border-white/20 cursor-pointer"
      >
        <div className="flex -space-x-4">
          <div className="w-10 h-10 rounded-full border-2 border-white bg-white overflow-hidden shadow-md flex-shrink-0 flex items-center justify-center p-0.5">
            <img
              src={Images.mascots.poultry}
              alt="Dr. Kukku"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-white bg-white overflow-hidden shadow-md flex-shrink-0 flex items-center justify-center p-0.5">
            <img
              src={Images.mascots.dairy}
              alt="Dr. Mikku"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <span className="hidden md:inline font-heading font-bold text-xs tracking-wider uppercase select-none">
          Ask our AI Experts
        </span>
        <span className="hidden md:inline text-emerald-400 animate-pulse text-xs select-none" aria-hidden="true">●</span>
      </motion.button>
    </div>
  );
}
