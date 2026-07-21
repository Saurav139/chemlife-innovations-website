"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const easeOut = [0.25, 0.1, 0, 1] as const;

type ReactantType = "phytochemical" | "anbiot" | "heavy_metal";

interface Reactant {
  type: ReactantType;
  name: string;
  color: string; // Tailwind color class for liquid
  textColor: string;
  glowColor: string;
  description: string;
}

const reactants: Reactant[] = [
  {
    type: "phytochemical",
    name: "Active Phytochemicals",
    color: "from-emerald-400 to-green-500",
    textColor: "text-emerald-400",
    glowColor: "shadow-emerald-500/50",
    description: "Bioactive fractions extracted from natural botanicals.",
  },
  {
    type: "anbiot",
    name: "ANBioT Catalyst",
    color: "from-teal-400 to-cyan-500",
    textColor: "text-teal-400",
    glowColor: "shadow-teal-500/50",
    description: "Deep eutectic solvent platform for clean chelation.",
  },
  {
    type: "heavy_metal",
    name: "Volatile Heavy Metal Oxides",
    color: "from-rose-500 to-red-650",
    textColor: "text-rose-500",
    glowColor: "shadow-rose-500/50",
    description: "Unrefined inorganic compounds (toxic impurities).",
  },
];

export default function LaunchPage() {
  const [beakerContent, setBeakerContent] = useState<ReactantType[]>([]);
  const [reactionState, setReactionState] = useState<"empty" | "mixing" | "success" | "failure">("empty");
  const [statusMessage, setStatusMessage] = useState("Pour reactants into the reaction flask to begin the synthesis.");

  const handlePour = (type: ReactantType) => {
    if (reactionState === "success" || reactionState === "failure" || reactionState === "mixing") return;

    const newContent = [...beakerContent, type];
    setBeakerContent(newContent);

    // If heavy metal is added, it's an immediate fail
    if (type === "heavy_metal") {
      setReactionState("mixing");
      setStatusMessage("Reaction initiated... warning, system unstable!");
      setTimeout(() => {
        setReactionState("failure");
        setStatusMessage("Exothermic overload! Toxic residues detected. Please clean the lab apparatus and try again.");
      }, 1500);
      return;
    }

    // Check if both correct ingredients are mixed
    if (newContent.includes("phytochemical") && newContent.includes("anbiot")) {
      setReactionState("mixing");
      setStatusMessage("Biotransformation in progress... molecular bonding active.");
      setTimeout(() => {
        setReactionState("success");
        setStatusMessage("Synthesis successful! Clean organic chelation achieved. Click below to launch the website!");
      }, 2000);
    } else {
      setStatusMessage(`Added ${type === "phytochemical" ? "Active Phytochemicals" : "ANBioT Catalyst"}. Add the corresponding reaction medium.`);
    }
  };

  const handleReset = () => {
    setBeakerContent([]);
    setReactionState("empty");
    setStatusMessage("Pour reactants into the reaction flask to begin the synthesis.");
  };

  // Determine current beaker liquid color
  const getBeakerLiquidClass = () => {
    if (reactionState === "failure") return "bg-gradient-to-t from-zinc-800 to-zinc-950 shadow-inner";
    if (reactionState === "success") return "bg-gradient-to-t from-emerald-400 via-teal-400 to-cyan-300 animate-pulse shadow-[0_0_40px_rgba(20,184,166,0.6)]";
    
    if (beakerContent.includes("phytochemical") && beakerContent.includes("anbiot")) {
      return "bg-gradient-to-t from-teal-500 to-green-400 animate-pulse";
    }
    if (beakerContent.includes("phytochemical")) return "bg-gradient-to-t from-green-500 to-emerald-400";
    if (beakerContent.includes("anbiot")) return "bg-gradient-to-t from-teal-500 to-cyan-400";
    return "bg-transparent";
  };

  return (
    <div className="min-h-screen bg-brand-navy relative overflow-hidden flex flex-col items-center justify-center p-6 text-white font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        <div className="absolute -top-[30%] -left-[20%] w-[80%] aspect-square rounded-full bg-teal-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[80%] aspect-square rounded-full bg-brand-orange/10 blur-[120px] pointer-events-none" />
      </div>

      {/* Lab Header */}
      <header className="relative z-10 text-center mb-12 max-w-2xl select-none">
        <span className="text-teal-400 text-xs font-bold uppercase tracking-widest block mb-3 bg-teal-500/10 px-3 py-1 rounded-full w-fit mx-auto border border-teal-500/20">
          R&D Launch Simulator
        </span>
        <h1 className="font-heading text-3xl md:text-5xl font-black leading-tight text-white mb-4">
          ChemLife <span className="text-teal-400">Launch Lab</span>
        </h1>
        <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed">
          To launch the corporate website, you must successfully synthesize our organic chelates. Mix the correct natural agents in the reaction flask.
        </p>
      </header>

      {/* Main Interactive Lab Area */}
      <main className="relative z-10 max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Test Tubes (Reactants) */}
        <section className="lg:col-span-4 flex flex-col gap-6" aria-label="Chemical Reactants">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-2">
            Available Reactants
          </h2>
          {reactants.map((reactant) => {
            const isAdded = beakerContent.includes(reactant.type);
            const isDisabled = reactionState === "mixing" || reactionState === "success" || reactionState === "failure";
            
            return (
              <button
                key={reactant.type}
                disabled={isDisabled || isAdded}
                onClick={() => handlePour(reactant.type)}
                className={`bg-white/5 backdrop-blur-md border rounded-2xl p-4 text-left flex items-start gap-4 transition-all duration-300 relative group cursor-pointer ${
                  isAdded
                    ? "border-slate-800 opacity-40 cursor-not-allowed"
                    : isDisabled
                    ? "border-white/5 opacity-50 cursor-not-allowed"
                    : "border-white/10 hover:border-white/20 hover:bg-white/10 shadow-lg hover:shadow-2xl"
                }`}
              >
                {/* Tube Graphic */}
                <div className="w-8 h-20 bg-white/10 border border-white/20 rounded-b-full rounded-t-lg relative flex items-end overflow-hidden flex-shrink-0">
                  <div className={`w-full bg-gradient-to-t ${reactant.color} rounded-b-full transition-all duration-500 ${isAdded ? 'h-0' : 'h-12 group-hover:h-14'}`} />
                  <div className="absolute inset-x-0 bottom-0 top-1/3 bg-white/5 animate-pulse" />
                </div>

                <div>
                  <h3 className={`font-bold text-base ${reactant.textColor}`}>
                    {reactant.name}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {reactant.description}
                  </p>
                </div>

                {isAdded && (
                  <span className="absolute right-4 top-4 text-xs font-bold text-slate-500 uppercase">
                    Poured
                  </span>
                )}
              </button>
            );
          })}
        </section>

        {/* Center/Right Column: The Beaker & Control Board */}
        <section className="lg:col-span-8 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-between min-h-[500px]" aria-label="Reaction Chamber">
          {/* Status Message Board */}
          <div className="w-full bg-black/30 border border-white/5 rounded-2xl p-4 text-center">
            <p className="font-mono text-sm leading-relaxed text-slate-200">
              {statusMessage}
            </p>
          </div>

          {/* Visual Reaction Flask Container */}
          <div className="relative my-8 flex items-center justify-center min-h-[220px]">
            {/* Smoke / Vapor Animation */}
            <AnimatePresence>
              {reactionState === "failure" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: [0, 0.8, 0], y: -80, scale: [0.8, 1.4, 2] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                  className="absolute -top-16 text-slate-500 text-6xl pointer-events-none select-none"
                >
                  💨
                </motion.div>
              )}
              {reactionState === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: [0, 0.7, 0], y: -100, scale: [0.8, 1.3, 1.8] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                  className="absolute -top-16 text-teal-400 text-6xl pointer-events-none select-none filter blur-xs"
                >
                  ✨
                </motion.div>
              )}
              {reactionState === "mixing" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.6, 0], y: -60 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute -top-10 text-white/50 text-3xl pointer-events-none select-none"
                >
                  🫧
                </motion.div>
              )}
            </AnimatePresence>

            {/* Glowing Aura backdrop */}
            <div className={`absolute w-32 h-32 rounded-full blur-[40px] opacity-40 transition-all duration-1000 pointer-events-none ${
              reactionState === "success" ? "bg-teal-400 scale-125" :
              reactionState === "failure" ? "bg-red-650 scale-125" :
              reactionState === "mixing" ? "bg-cyan-500 animate-pulse" : "bg-transparent"
            }`} />

            {/* Flask Glass Body */}
            <div className="w-48 h-56 relative flex items-end justify-center select-none">
              {/* Beaker Outline shape */}
              <svg className="absolute inset-0 w-full h-full text-white/30 fill-none filter drop-shadow-md" viewBox="0 0 100 120">
                {/* Lip */}
                <path d="M40 10 L60 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                {/* Neck */}
                <path d="M42 10 L42 35" stroke="currentColor" strokeWidth="2.5" />
                <path d="M58 10 L58 35" stroke="currentColor" strokeWidth="2.5" />
                {/* Base flask body */}
                <path d="M42 35 L15 105 A6 6 0 0 0 20 112 L80 112 A6 6 0 0 0 85 105 L58 35" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
              </svg>

              {/* Inside Liquid */}
              <div className="w-[170px] h-[100px] absolute bottom-[3px] overflow-hidden rounded-b-[40px] flex items-end">
                <div
                  className={`w-full transition-all duration-1000 ease-out rounded-b-[45px] ${getBeakerLiquidClass()} ${
                    beakerContent.length === 0 ? "h-0" :
                    beakerContent.length === 1 ? "h-12" : "h-20"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Controls Area (Reset or Launch Button) */}
          <div className="w-full flex justify-center h-16">
            <AnimatePresence mode="wait">
              {reactionState === "success" ? (
                <motion.div
                  key="success-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: easeOut }}
                >
                  <Link
                    href="/"
                    className="px-10 py-4 rounded-full bg-teal-500 hover:bg-teal-600 text-white font-black text-lg tracking-wider shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 transition-all duration-300 hover:scale-105"
                  >
                    🚀 Enter Website
                  </Link>
                </motion.div>
              ) : reactionState === "failure" ? (
                <motion.button
                  key="reset-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={handleReset}
                  className="px-8 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow transition-all duration-300 cursor-pointer"
                >
                  🔄 Reset Lab Bench
                </motion.button>
              ) : beakerContent.length > 0 ? (
                <motion.button
                  key="clear-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleReset}
                  className="text-slate-450 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                >
                  Clear Flask
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>
        </section>

      </main>
    </div>
  );
}
