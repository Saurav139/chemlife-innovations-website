"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Logo Flower SVG Component
interface FlowerProps {
  size?: number;
  className?: string;
}

const LogoFlower = ({ size = 24, className = "" }: FlowerProps) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    {/* Petals */}
    <circle cx="50" cy="22" r="18" fill="#E65C38" />
    <circle cx="77" cy="41" r="18" fill="#E65C38" />
    <circle cx="66" cy="73" r="18" fill="#E65C38" />
    <circle cx="34" cy="73" r="18" fill="#E65C38" />
    <circle cx="23" cy="41" r="18" fill="#E65C38" />
    {/* Center */}
    <circle cx="50" cy="50" r="15" fill="#305280" />
    <circle cx="50" cy="50" r="7" fill="#E65C38" />
  </svg>
);

// Reactant source flask configuration
interface SourceFlask {
  id: number;
  name: string;
  chemical: string;
  color: string;
  glowColor: string;
  streamColor: string;
  description: string;
  baseStyle: { left: string; bottom: string; rotate: number };
  pourStyle: { left: string; bottom: string; rotate: number };
}

const sourceFlasks: SourceFlask[] = [
  {
    id: 1,
    name: "Phytochemicals",
    chemical: "Active Phytochemicals",
    color: "from-emerald-400 to-emerald-600",
    glowColor: "shadow-emerald-500/50",
    streamColor: "#10B981",
    description: "Bioactive fractions extracted from botanicals.",
    baseStyle: { left: "8%", bottom: "20px", rotate: 0 },
    pourStyle: { left: "32%", bottom: "160px", rotate: 75 },
  },
  {
    id: 2,
    name: "ANBioT",
    chemical: "ANBioT Catalyst",
    color: "from-teal-450 to-cyan-500",
    glowColor: "shadow-teal-500/50",
    streamColor: "#0D9488",
    description: "Novel bio-transformation solvent platform.",
    baseStyle: { left: "28%", bottom: "20px", rotate: 0 },
    pourStyle: { left: "36%", bottom: "160px", rotate: 75 },
  },
  {
    id: 3,
    name: "Bio-Extract",
    chemical: "Ayurvedic Bio-Extract",
    color: "from-amber-450 to-orange-500",
    glowColor: "shadow-orange-500/50",
    streamColor: "#F59E0B",
    description: "Ayurvedic plant active ingredients.",
    baseStyle: { left: "60%", bottom: "20px", rotate: 0 },
    pourStyle: { left: "46%", bottom: "160px", rotate: -75 },
  },
  {
    id: 4,
    name: "Acid Impurity",
    chemical: "Volatile Acid Oxides",
    color: "from-rose-500 to-red-700",
    glowColor: "shadow-red-500/50",
    streamColor: "#EF4444",
    description: "Unrefined inorganic compounds (toxic impurity).",
    baseStyle: { left: "80%", bottom: "20px", rotate: 0 },
    pourStyle: { left: "52%", bottom: "160px", rotate: -75 },
  },
];

const puzzle2Options = [
  { id: "citric_acid", label: "Citric Acid", description: "Organic acid found in citrus fruits." },
  { id: "baking_soda", label: "Baking Soda", description: "Sodium Bicarbonate (NaHCO3), fizzes with acid." },
  { id: "salt", label: "Sodium Chloride", description: "Common table salt, neutral in water." },
  { id: "limestone", label: "Calcium Carbonate", description: "Inorganic chalky mineral compound." },
];

const puzzle3Options = [
  { id: "amino_acid", label: "Amino Acid", description: "Building blocks of proteins, no catalytic speedup." },
  { id: "hormone", label: "Hormone", description: "Chemical messenger regulating cellular processes." },
  { id: "enzyme", label: "Enzyme / Catalyst", description: "Biological catalysts that accelerate chemical reactions." },
  { id: "vitamin", label: "Vitamin", description: "Organic micronutrient essential for metabolism." },
];

export default function LaunchPage() {

  const [isMounted, setIsMounted] = useState(false);

  // States
  const [correctAnswers, setCorrectAnswers] = useState<boolean[]>([false, false, false]);
  const [wrongAttempt, setWrongAttempt] = useState<boolean[]>([false, false, false]);
  const [inputs, setInputs] = useState<string[]>(["", "", ""]);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  
  // Animation states
  const [pouringFlask, setPouringFlask] = useState<number | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [smokeActive, setSmokeActive] = useState<boolean>(false);
  const [potVolume, setPotVolume] = useState<number>(0);
  const [smokeParticles, setSmokeParticles] = useState<{ id: number; delay: number; x: number }[]>([]);
  const [flowerParticles, setFlowerParticles] = useState<{ id: number; delay: number; x: number; scale: number; rotate: number }[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if already launched, so they can reset or bypass
    const launched = localStorage.getItem("chemlife_launched") === "true";
    if (launched) {
      setCorrectAnswers([true, true, true]);
      setPotVolume(100);
    }
  }, []);

  const validateAnswer = (index: number, val: string): boolean => {
    const normalized = val.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (index === 0) {
      return normalized === "chemlife";
    }
    if (index === 1) {
      return ["bakingsoda", "sodiumbicarbonate", "nahco3", "sodiumhydrogencarbonate"].includes(normalized);
    }
    if (index === 2) {
      return ["enzyme", "enzymes", "catalyst"].includes(normalized);
    }
    return false;
  };

  const triggerSmoke = () => {
    const particles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      delay: i * 0.1,
      x: (Math.random() - 0.5) * 60,
    }));
    setSmokeParticles(particles);
    setTimeout(() => setSmokeParticles([]), 3500);
  };

  const triggerFlowers = () => {
    const particles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      delay: i * 0.12,
      x: (Math.random() - 0.5) * 180,
      scale: 0.6 + Math.random() * 0.7,
      rotate: (Math.random() - 0.5) * 360,
    }));
    setFlowerParticles(particles);
  };

  const handleSubmit = (qIdx: number) => {
    if (pouringFlask !== null) return; // Busy animating
    const answer = inputs[qIdx];
    const isCorrect = validateAnswer(qIdx, answer);

    if (isCorrect) {
      // Good chemical flask pouring
      const flaskId = qIdx + 1;
      setPouringFlask(flaskId);
      setWrongAttempt((prev) => {
        const next = [...prev];
        next[qIdx] = false;
        return next;
      });

      // Step 1: Flask moves/tilts (800ms)
      setTimeout(() => {
        setStreamActive(true);
        // Step 2: Liquid stream starts, fills pot (1200ms)
        setTimeout(() => {
          setCorrectAnswers((prev) => {
            const next = [...prev];
            next[qIdx] = true;
            return next;
          });
          setPotVolume((prev) => Math.min(100, prev + 33.4));
          setStreamActive(false);

          // Step 3: Flask returns to normal (800ms)
          setTimeout(() => {
            setPouringFlask(null);
            // Move to next question if any
            if (qIdx < 2) {
              setActiveQuestion(qIdx + 1);
            }
          }, 800);
        }, 1200);
      }, 800);
    } else {
      // Wrong chemical flask pouring (Acid Impurity - Flask 4)
      setPouringFlask(4);
      setWrongAttempt((prev) => {
        const next = [...prev];
        next[qIdx] = true;
        return next;
      });

      // Step 1: Flask 4 tilts (800ms)
      setTimeout(() => {
        setStreamActive(true);
        setSmokeActive(true);
        triggerSmoke();

        // Step 2: Pour bad chemical and create smoke (1600ms)
        setTimeout(() => {
          setStreamActive(false);
          setSmokeActive(false);

          // Step 3: Flask returns to normal (800ms)
          setTimeout(() => {
            setPouringFlask(null);
          }, 800);
        }, 1600);
      }, 800);
    }
  };

  // Run success flowers when all are correct
  const allCorrect = correctAnswers.every(Boolean);
  useEffect(() => {
    if (allCorrect && isMounted) {
      triggerFlowers();
    }
  }, [allCorrect, isMounted]);

  const handleLaunch = () => {
    localStorage.setItem("chemlife_launched", "true");
    window.location.href = "/";
  };

  const handleReset = () => {
    setIsResetting(true);
    localStorage.removeItem("chemlife_launched");
    setCorrectAnswers([false, false, false]);
    setWrongAttempt([false, false, false]);
    setInputs(["", "", ""]);
    setActiveQuestion(0);
    setPotVolume(0);
    setPouringFlask(null);
    setStreamActive(false);
    setSmokeActive(false);
    setSmokeParticles([]);
    setFlowerParticles([]);
    setTimeout(() => setIsResetting(false), 500);
  };

  // Calculate dynamic liquid colors inside the central flask
  const getCentralLiquidGradient = () => {
    if (smokeActive) {
      return "#991B1B"; // Bubbling acid dark red
    }
    const colors: string[] = [];
    if (correctAnswers[0]) colors.push("#10B981"); // Emerald
    if (correctAnswers[1]) colors.push("#0D9488"); // Teal
    if (correctAnswers[2]) colors.push("#F59E0B"); // Gold

    if (colors.length === 0) return "transparent";
    if (colors.length === 1) return colors[0];
    if (colors.length === 2) return `url(#grad-2)`;
    return `url(#grad-3)`;
  };

  if (!isMounted) return null;

  return (
    <VariantProvider>
      <div className="min-h-screen bg-[#F5F2ED] flex flex-col font-sans">
        <Header />

        {/* Outer container aligned like standard website pages */}
        <main className="flex-grow pt-36 pb-16 px-6 max-w-[1200px] mx-auto w-full flex flex-col items-center">
          
          {/* Main Titles */}
          <div className="text-center max-w-2xl mb-12">
            <h1 className="font-heading text-4xl lg:text-5xl font-black leading-tight text-[#305280] mb-4">
              ChemLife <span className="text-brand-orange">Launch Lab</span>
            </h1>
            <p className="text-[#757873] text-sm md:text-base leading-relaxed">
              Mix the correct natural ingredients inside the reaction vessel to synthesize the functional feed additives and launch the corporate website.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            
            {/* Left Column: Interactive Lab Bench (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-[#305280] rounded-3xl p-6 shadow-xl relative overflow-hidden min-h-[500px]">
              
              {/* Lab Bench Background grid */}
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e3a8a_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-25" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#E65C38]/10 rounded-full blur-3xl" />
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl" />
              </div>

              {/* Status Header */}
              <div className="relative z-10 w-full bg-black/35 border border-white/10 rounded-2xl p-4 text-center mb-6">
                <p className="font-mono text-[13px] text-slate-200 leading-normal">
                  {pouringFlask === 4 ? (
                    <span className="text-red-400 animate-pulse font-bold">
                      ⚠ WARNING: TOXIC ACID RELEASED! SMOKE DETECTED.
                    </span>
                  ) : pouringFlask !== null ? (
                    <span className="text-teal-450 animate-pulse font-bold">
                      POURING: {sourceFlasks[pouringFlask - 1].chemical}...
                    </span>
                  ) : allCorrect ? (
                    <span className="text-emerald-400 font-bold">
                      ✓ SYNTHESIS COMPLETE. WEBPAGE COMPILED.
                    </span>
                  ) : (
                    <span>SYSTEM IDLE. POUR REACTANTS TO INITIALIZE.</span>
                  )}
                </p>
              </div>

              {/* Bench Interactive Area */}
              <div className="relative z-10 flex-grow h-[340px] w-full border border-white/5 bg-white/5 rounded-2xl shadow-inner relative flex items-center justify-center">
                
                {/* 1. Liquid Stream Animation */}
                {streamActive && pouringFlask !== null && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                    <motion.line
                      x1={
                        pouringFlask === 1
                          ? "35%"
                          : pouringFlask === 2
                          ? "39%"
                          : pouringFlask === 3
                          ? "61%"
                          : "65%"
                      }
                      y1="120"
                      x2="50%"
                      y2="175"
                      stroke={sourceFlasks[pouringFlask - 1].streamColor}
                      strokeWidth="5"
                      strokeLinecap="round"
                      animate={{ strokeDashoffset: [0, -20] }}
                      transition={{ repeat: Infinity, ease: "linear", duration: 0.5 }}
                      style={{ strokeDasharray: "10 5" }}
                    />
                  </svg>
                )}

                {/* 2. Smoke Particle Animation (Incorrect answers) */}
                <div className="absolute inset-0 pointer-events-none z-30">
                  {smokeParticles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 0, scale: 0.2, rotate: 0 }}
                      animate={{
                        opacity: [0, 0.8, 0.6, 0],
                        y: [0, -180],
                        x: [0, p.x],
                        scale: [0.2, 1.4, 2.4],
                        rotate: [0, (Math.random() - 0.5) * 180],
                      }}
                      transition={{
                        duration: 2.2,
                        delay: p.delay,
                        ease: "easeOut",
                      }}
                      className={`absolute rounded-full blur-[6px] ${
                        p.id % 2 === 0
                          ? "bg-white/40 border border-white/20"
                          : "bg-rose-400/25 border border-rose-300/15"
                      }`}
                      style={{
                        width: "44px",
                        height: "44px",
                        top: "70px",
                        left: "calc(50% - 22px)",
                      }}
                    />
                  ))}
                </div>

                {/* 3. Logo Flower Animation (Success celebration) */}
                <div className="absolute inset-0 pointer-events-none z-35">
                  {flowerParticles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 0, scale: 0.1, rotate: 0 }}
                      animate={{
                        opacity: [0, 1, 1, 0],
                        y: [0, -220 - Math.random() * 80],
                        x: [0, p.x],
                        scale: [0.1, p.scale, p.scale],
                        rotate: [0, p.rotate],
                      }}
                      transition={{
                        duration: 3,
                        delay: p.delay,
                        ease: "easeOut",
                      }}
                      className="absolute"
                      style={{
                        top: "70px",
                        left: "calc(50% - 15px)",
                      }}
                    >
                      <LogoFlower size={30} />
                    </motion.div>
                  ))}
                </div>

                {/* 4. Central Reaction Flask (Logo Flask Style) */}
                <div className="absolute bottom-[130px] left-[calc(50%-75px)] w-[150px] h-[150px] z-10 flex items-center justify-center">
                  <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
                    <defs>
                      {/* Linear Gradients for Mixing Liquids */}
                      <linearGradient id="grad-2" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#0D9488" />
                      </linearGradient>
                      <linearGradient id="grad-3" x1="0" y1="1" x2="0" y2="0">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="50%" stopColor="#0D9488" />
                        <stop offset="100%" stopColor="#E65C38" />
                      </linearGradient>

                      {/* Clip path for the interior liquid */}
                      <clipPath id="flask-clip">
                        <circle cx="50" cy="74" r="28" />
                        <rect x="41.5" y="20" width="17" height="32" />
                      </clipPath>
                    </defs>

                    {/* Logo: Tilted Orange Square in background */}
                    <rect
                      x="23"
                      y="40"
                      width="54"
                      height="54"
                      fill="#E65C38"
                      transform="rotate(15 50 65)"
                      rx="6"
                    />

                    {/* Rotated Flask Group (25 degrees to the right) */}
                    <g transform="rotate(25 50 65)">
                      
                      {/* Solid White Base background of the flask (for light mask) */}
                      <circle cx="50" cy="74" r="28" fill="white" />
                      <rect x="42" y="20" width="16" height="30" fill="white" />

                      {/* Liquid Content inside the clip mask */}
                      <g clipPath="url(#flask-clip)">
                        {(potVolume > 0 || smokeActive) && (
                          <motion.rect
                            x="10"
                            y={smokeActive ? 75 : 102 - potVolume * 0.8}
                            width="80"
                            height="100"
                            fill={getCentralLiquidGradient()}
                            animate={smokeActive ? { fill: "#991B1B" } : {}}
                            transition={{ duration: 0.5 }}
                          />
                        )}
                        {/* Bubbles animation if liquid is present */}
                        {(potVolume > 0 || smokeActive) && (
                          <g opacity="0.6">
                            <circle cx="42" cy="78" r="2" fill="white" className="animate-ping" />
                            <circle cx="58" cy="84" r="1.5" fill="white" className="animate-pulse" />
                            <circle cx="50" cy="68" r="2" fill="white" className="animate-ping" />
                          </g>
                        )}
                      </g>

                      {/* Molecules Overlay inside the flask (semi-transparent) */}
                      <g opacity="0.85" className="pointer-events-none select-none">
                        {/* Connecting Bonds (Lines) */}
                        <line x1="50" y1="74" x2="50" y2="60" stroke="#305280" strokeWidth="2.5" />
                        <line x1="50" y1="74" x2="38" y2="80" stroke="#305280" strokeWidth="2.5" />
                        <line x1="50" y1="74" x2="46" y2="88" stroke="#305280" strokeWidth="2.5" />
                        <line x1="50" y1="74" x2="58" y2="82" stroke="#305280" strokeWidth="2.5" />
                        <line x1="50" y1="74" x2="60" y2="69" stroke="#305280" strokeWidth="2.5" />
                        
                        {/* Atom Spheres */}
                        <circle cx="50" cy="74" r="6.5" fill="#E65C38" stroke="#305280" strokeWidth="2" /> {/* Central Orange */}
                        <circle cx="50" cy="60" r="5" fill="#305280" stroke="#F5F2ED" strokeWidth="1" /> {/* Top Blue */}
                        <circle cx="38" cy="80" r="5" fill="#305280" stroke="#F5F2ED" strokeWidth="1" /> {/* Bottom Left Blue */}
                        <circle cx="46" cy="88" r="4.5" fill="#E65C38" stroke="#305280" strokeWidth="1" /> {/* Bottom Orange */}
                        <circle cx="58" cy="82" r="4.5" fill="#E65C38" stroke="#305280" strokeWidth="1" /> {/* Bottom Right Orange */}
                        <circle cx="60" cy="69" r="4.5" fill="#305280" stroke="#F5F2ED" strokeWidth="1" /> {/* Top Right Blue */}
                      </g>

                      {/* Flask Outline Border (drawn on top) */}
                      <circle
                        cx="50"
                        cy="74"
                        r="28.5"
                        stroke="#305280"
                        strokeWidth="3.5"
                        fill="none"
                      />
                      <line x1="41.5" y1="20" x2="41.5" y2="52" stroke="#305280" strokeWidth="3.5" />
                      <line x1="58.5" y1="20" x2="58.5" y2="52" stroke="#305280" strokeWidth="3.5" />
                      
                      {/* Flask Lip */}
                      <rect x="36" y="16.5" width="28" height="4" rx="2" fill="#305280" />
                    </g>
                  </svg>
                </div>

                {/* 5. 4 Source Flasks Row */}
                {sourceFlasks.map((flask) => {
                  const isPouring = pouringFlask === flask.id;
                  const targetStyle = isPouring ? flask.pourStyle : flask.baseStyle;

                  return (
                    <motion.div
                      key={flask.id}
                      style={{
                        left: flask.baseStyle.left,
                        bottom: flask.baseStyle.bottom,
                      }}
                      animate={{
                        left: targetStyle.left,
                        bottom: targetStyle.bottom,
                        rotate: targetStyle.rotate,
                      }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute w-12 h-24 select-none flex flex-col items-center pointer-events-none"
                    >
                      {/* Flask Outline & Liquid */}
                      <div className="w-10 h-20 bg-white/10 border-2 border-white/20 rounded-b-full rounded-t-lg relative flex items-end overflow-hidden">
                        {/* Colored Chemical Liquid inside */}
                        <div
                          className={`w-full bg-gradient-to-t ${flask.color} rounded-b-full transition-all duration-[1.2s] ${
                            isPouring
                              ? "h-2" // liquid drains
                              : flask.id <= 3 && correctAnswers[flask.id - 1]
                              ? "h-0" // completely empty once poured correctly
                              : "h-11" // filled
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wider mt-2 select-none">
                        {flask.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bench control panel (reset button) */}
              <div className="relative z-10 w-full flex justify-between items-center mt-4">
                <span className="text-[10px] text-white/50 font-mono tracking-widest">
                  CHEM-BENCH V1.0
                </span>
                <button
                  onClick={handleReset}
                  className="px-4 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/15 text-xs font-semibold tracking-wider transition-all duration-300 cursor-pointer"
                >
                  🔄 Reset Bench
                </button>
              </div>
            </div>

            {/* Right Column: Question & Riddles Panel (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Question Index Tabs */}
              <div className="flex border-b-2 border-[#305280]/10">
                {[0, 1, 2].map((idx) => {
                  const isCorrect = correctAnswers[idx];
                  const isCurrent = activeQuestion === idx;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => pouringFlask === null && setActiveQuestion(idx)}
                      disabled={pouringFlask !== null}
                      className={`px-6 py-3 font-semibold text-sm transition-all duration-300 relative border-b-2 ${
                        isCurrent
                          ? "border-[#E65C38] text-[#E65C38] bg-[#E65C38]/5"
                          : "border-transparent text-[#305280] hover:text-[#E65C38]"
                      } ${pouringFlask !== null ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                      Puzzle {idx + 1}
                      {isCorrect && (
                        <span className="ml-2 text-emerald-600 font-bold">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Active Question Box */}
              <div className="bg-white border border-[#305280]/15 rounded-3xl p-8 shadow-sm flex-grow flex flex-col justify-between min-h-[360px]">
                
                {/* Active Question Details */}
                <div>
                  {activeQuestion === 0 && (
                    <div className="space-y-4">
                      <h3 className="font-heading text-lg font-bold text-[#305280]">
                        Puzzle 1: The Chemical Cryptogram
                      </h3>
                      <p className="text-sm text-[#757873] leading-relaxed">
                        Can you decipher the hidden message encoded in these elemental symbols? Read the element names in sequence to unlock the code.
                      </p>

                      {/* Element Card Grid */}
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-3.5 my-8">
                        {[
                          { sym: "E", name: "Energy" },
                          { sym: "L", name: "Lithium" },
                          { sym: "M", name: "Magnesium" },
                          { sym: "H", name: "Hydrogen" },
                          { sym: "I", name: "Iodine" },
                          { sym: "C", name: "Carbon" },
                          { sym: "E", name: "Energy" },
                          { sym: "F", name: "Fluorine" },
                        ].map((el, idx) => (
                          <div
                            key={idx}
                            className="bg-[#F5F2ED] border border-[#305280]/10 rounded-2xl p-4 py-6 text-center flex flex-col items-center justify-between shadow-sm hover:scale-[1.03] transition-all duration-300"
                          >
                            <span className="text-xs text-[#305280]/60 font-mono font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-3xl font-black text-[#E65C38] my-2">
                              {el.sym}
                            </span>
                            <span className="text-[9px] text-[#757873] font-bold block text-center uppercase tracking-wider leading-tight whitespace-normal break-words">
                              {el.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeQuestion === 1 && (
                    <div className="space-y-4">
                      <h3 className="font-heading text-lg font-bold text-[#305280]">
                        Puzzle 2: The Effervescent Agent
                      </h3>
                      <blockquote className="border-l-4 border-[#E65C38] pl-4 italic text-base text-[#305280] font-medium my-4">
                        "Mix me with an acid, and I’ll fizz up immediately. Neutralize me, and I’ll calm down. What am I?"
                      </blockquote>
                      <p className="text-sm text-[#757873]">
                        This common chemical is vital for regulating pH and is standard in feed science formulations to prevent acidosis.
                      </p>
                    </div>
                  )}

                  {activeQuestion === 2 && (
                    <div className="space-y-4">
                      <h3 className="font-heading text-lg font-bold text-[#305280]">
                        Puzzle 3: The Bio-Catalytic Machine
                      </h3>
                      <blockquote className="border-l-4 border-[#E65C38] pl-4 italic text-base text-[#305280] font-medium my-4">
                        "I only eat specific shapes, I speed up drama without getting involved in it myself, and if you change my pH even a little bit, I shut down. Who am I?"
                      </blockquote>
                      <p className="text-sm text-[#757873]">
                        Ayurvedic bio-transformations (ANBioT) rely on these molecular helpers to metabolize botanical actives cleanly.
                      </p>
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <div className="mt-8 pt-6 border-t border-[#305280]/10">
                  {correctAnswers[activeQuestion] ? (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-center gap-3">
                      <span className="text-lg font-bold">✓</span>
                      <p className="text-sm font-semibold">
                        Correct! The chemical reactant has been successfully added to the reaction vessel.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#305280] mb-2">
                        {activeQuestion === 0 ? "Enter Chemical Answer:" : "Select the Correct Chemical Option:"}
                      </label>

                      {activeQuestion === 0 ? (
                        <div className="flex gap-3">
                          <motion.input
                            type="text"
                            value={inputs[activeQuestion]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInputs((prev) => {
                                const next = [...prev];
                                next[activeQuestion] = val;
                                return next;
                              });
                            }}
                            animate={
                              wrongAttempt[activeQuestion]
                                ? { x: [0, -10, 10, -10, 10, 0] }
                                : {}
                            }
                            transition={{ duration: 0.5 }}
                            placeholder="Type the decoded word..."
                            disabled={pouringFlask !== null}
                            className={`flex-grow px-5 py-3 rounded-xl border bg-[#F5F2ED]/50 text-[#305280] focus:outline-none focus:ring-2 focus:ring-[#E65C38]/40 transition-all font-semibold ${
                              wrongAttempt[activeQuestion]
                                ? "border-red-500 bg-red-50"
                                : "border-[#305280]/20 focus:border-[#E65C38]"
                            }`}
                          />
                          <button
                            onClick={() => handleSubmit(activeQuestion)}
                            disabled={pouringFlask !== null || !inputs[activeQuestion].trim()}
                            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/20 cursor-pointer text-white bg-[#E65C38] hover:bg-[#E65C38]/90 ${
                              pouringFlask !== null || !inputs[activeQuestion].trim()
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            Submit
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(activeQuestion === 1 ? puzzle2Options : puzzle3Options).map((opt) => {
                              const isSelected = inputs[activeQuestion] === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() => {
                                    setInputs((prev) => {
                                      const next = [...prev];
                                      next[activeQuestion] = opt.id;
                                      return next;
                                    });
                                  }}
                                  disabled={pouringFlask !== null}
                                  className={`p-5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-300 min-h-[110px] cursor-pointer group ${
                                    isSelected
                                      ? "border-[#E65C38] bg-[#E65C38]/5 shadow-sm shadow-brand-orange/5"
                                      : "border-[#305280]/15 hover:border-[#E65C38]/50 hover:bg-[#F5F2ED]"
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className={`font-heading font-bold text-sm md:text-base ${isSelected ? "text-[#E65C38]" : "text-[#305280]"}`}>
                                      {opt.label}
                                    </span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#E65C38] bg-[#E65C38]" : "border-[#305280]/20"}`}>
                                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                  </div>
                                  <p className="text-xs text-[#757873] mt-2 group-hover:text-[#305280]/85">
                                    {opt.description}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex justify-end pt-2">
                            <button
                              onClick={() => handleSubmit(activeQuestion)}
                              disabled={pouringFlask !== null || !inputs[activeQuestion].trim()}
                              className={`px-8 py-3.5 rounded-xl font-bold transition-all shadow-md shadow-brand-orange/15 hover:shadow-brand-orange/20 cursor-pointer text-white bg-[#E65C38] hover:bg-[#E65C38]/90 ${
                                pouringFlask !== null || !inputs[activeQuestion].trim()
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              Submit Answer
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {wrongAttempt[activeQuestion] && (
                        <p className="text-xs text-red-500 font-semibold animate-pulse">
                          ✗ Incorrect answer. The reaction was unstable and emitted impurities! Try again.
                        </p>
                      )}
                    </div>
                  )}
                </div>

              </div>

              {/* Enter Site Overlay */}
              <AnimatePresence>
                {allCorrect && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: easeOut }}
                    className="w-full flex justify-center pt-4"
                  >
                    <button
                      onClick={handleLaunch}
                      className="w-full py-4.5 rounded-2xl bg-[#E65C38] hover:bg-[#E65C38]/90 text-white font-extrabold text-lg tracking-wider shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                    >
                      Launch Website
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

        </main>

        <Footer />
      </div>
    </VariantProvider>
  );
}
