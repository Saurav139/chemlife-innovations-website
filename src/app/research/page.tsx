"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionWrapper from "@/components/SectionWrapper";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";

const easeOut = [0.25, 0.1, 0, 1] as const;

interface ResearchTopic {
  id: number;
  title: string;
  category: string;
  tagline: string;
  preview: string;
  challenge: string;
  advantage: string;
  recognition?: string;
  applications?: string;
  banner: string;
}

const researchTopics: ResearchTopic[] = [
  {
    id: 1,
    title: "Accelerated Natural BioTransformation (ANBioT)",
    category: "Research",
    tagline: "Transforming Phytochemicals into Functional Power",
    preview: "A biologically inspired platform designed to recover, transform, and preserve functional phytochemicals for advanced animal feed applications.",
    challenge: "Modern feed industries demand high bioavailability, consistent efficacy, low residue, and sustainable manufacturing. Conventional extraction methods often fall short, leaving bioactives trapped, relying on toxic solvents, and wasting valuable phytochemical potential.",
    advantage: "Uses nutrient media with natural hydrogen-bond donors and acceptors (deep eutectic solvents) to mimic and accelerate natural biological transformations. This liberates hidden bioactive compounds without relying on toxic organic solvents.",
    recognition: "BIRAC / DBT ecosystem, and the Technology Development Board (TDB), Government of India.",
    banner: "/images/anbiot.jpg"
  },
  {
    id: 2,
    title: "Green Chelation for Smarter Bio-Trace Minerals",
    category: "Research",
    tagline: "Eco-friendly, sustainable mineral chelation",
    preview: "Naturally derived hydroxy amino acid media and ANBioT processing to create functional trace mineral chelates for animal nutrition.",
    challenge: "Traditional trace mineral chelation processes rely heavily on chemical syntheses and synthetic ligands, which generate downstream effluent waste and increase environmental residues.",
    advantage: "Employs plant and animal derived hydroxy amino acids as a natural ligand base. Combined with deep eutectic solvents, this green chelation workflow completely avoids downstream effluent generation while delivering superior diet stability.",
    recognition: "Technology Development Board (TDB), Govt. of India.",
    applications: "Poultry, dairy, and swine diets to maximize bioavailability.",
    banner: "/images/green_technology.jpg"
  },
  {
    id: 3,
    title: "Microencapsulation Technologies: Targeting Rumen-Sustained and Bypass Deliveries",
    category: "Research",
    tagline: "Precision intestinal and bypass release systems",
    preview: "Developing microencapsulated granules of various sizes and shapes using coating materials of botanical origin to protect and target bioactives.",
    challenge: "Traditional administration of sensitive bioactives leads to premature degradation in the stomach or rumen, reducing nutritional efficacy and increasing waste.",
    advantage: "Develops microencapsulated granules tailored for intestinal delivery in monogastrics and rumen-bypass in ruminants. The botanical coatings ensure biocompatibility and controlled release. Synthesized in an ANBioT deep eutectic solvent system.",
    applications: "Rumen bypass and targeted intestinal bioactive release in dairy and monogastric feeds.",
    banner: "/images/microencapsulation.png"
  },
  {
    id: 4,
    title: "Nano-Activated Functionalized Trace Minerals: The Next Frontier in Bioavailability",
    category: "Research",
    tagline: "Enhanced absorption and tagged bioactivity at lower doses",
    preview: "Synthesizing designer nano-trace minerals functionalized with bioactive tag molecules to maximize bioavailability and stimulate metabolic response.",
    challenge: "Conventional inorganic trace mineral supplements suffer from very low absorption rates, demanding higher dosages that cause gut irritation and heavy environmental waste.",
    advantage: "Nanoscale minerals coupled with bioactive molecules show dual-action: extremely high bioavailability via cross-intestinal wall absorption and targeted cellular delivery of desired activities. Sourced from chemical synthesis, bio-transformation, and phytoactives, prepared within an ANBioT deep eutectic solvent system.",
    applications: "Providing antimicrobial, probiotic, and metabolic stimulation effects at micro-dosages.",
    banner: "/images/nano_trace_mineral.jpg"
  },
  {
    id: 5,
    title: "Synthesis of Nature-Identical Bioactive Molecules: Scaling Green Biotechnology",
    category: "Research",
    tagline: "Standardizing herbal efficacy through green synthesis",
    preview: "Developing green synthetic methods to manufacture bioactive compounds found in herbs and botanicals, ensuring absolute standardization of bioactivity.",
    challenge: "Natural plant extracts are highly variable due to seasonal, geographical, and extraction differences, making consistent therapeutic performance difficult to guarantee at scale.",
    advantage: "Synthesizes nature-identical molecules that match botanical compounds exactly, ensuring standardized potency, high quality, and a stable delivery matrix. Synthesized in an ANBioT deep eutectic solvent medium.",
    applications: "Stable natural alternatives to chemical feed growth promoters and preservatives.",
    banner: "/images/nature_identical_bio.png"
  }
];

export default function ResearchPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredTopics = researchTopics.filter((topic) => {
    const query = searchQuery.toLowerCase();
    return (
      topic.title.toLowerCase().includes(query) ||
      topic.preview.toLowerCase().includes(query) ||
      topic.tagline.toLowerCase().includes(query)
    );
  });

  return (
    <VariantProvider>
      <Header />

      <main className="bg-slate-50/50 min-h-screen text-brand-navy">
        {/* Research Hero Banner */}
        <SectionWrapper className="pt-32 pb-20 lg:pt-40 lg:pb-28 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/research_hero_banner.png"
              alt="Research Hero Background"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/75 to-transparent" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-center md:text-left">
            <span className="text-teal-400 text-sm font-semibold tracking-widest uppercase block mb-3">
              Research & Development
            </span>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold leading-tight mb-4 text-white">
              Biotechnology And Chemistry <span className="text-teal-400">Research Pipelines</span>
            </h1>
            <p className="text-white/85 text-lg lg:text-xl leading-relaxed max-w-3xl font-light">
              Science-backed studies and platforms formulated for superior bioavailability, green chelation, and stable animal nutrition.
            </p>
          </div>
        </SectionWrapper>

        {/* Research List Section */}
        <SectionWrapper className="py-16 bg-slate-50/30 relative overflow-hidden">
          <div className="relative z-10 max-w-[1200px] mx-auto px-6">

            {/* Left-Aligned Search bar */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-10 w-full">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full shadow-xs text-sm w-full md:max-w-xl focus-within:border-teal-500 focus-within:ring-teal-500 focus-within:ring-1 transition-all duration-300 relative">
                {/* Search Icon */}
                <div className="pl-4 text-teal-650 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Input Text Field */}
                <input
                  type="text"
                  placeholder="Search research pipeline..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 px-3 py-3.5 text-brand-navy placeholder-slate-400 focus:outline-none focus:ring-0 text-lg"
                />

                {/* Clear Search Button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mr-4 text-slate-400 hover:text-teal-600 transition-colors duration-250 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Research Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {filteredTopics.map((topic) => {
                const isExpanded = expandedId === topic.id;
                const emailSubject = encodeURIComponent(`Collaboration Inquiry: ${topic.title}`);
                const emailBody = encodeURIComponent(
                  `Dear ChemLife Innovations R&D Team,\n\nI am interested in learning more about your research pipeline: "${topic.title}". Please share publication details, trial results, and potential partnership scopes.\n\nBest regards,\n[Your Name]\n[Your Institution/Company]`
                );
                const emailHref = `mailto:innovate@chemlifeinnovations.com?subject=${emailSubject}&body=${emailBody}`;

                return (
                  <motion.div
                    key={topic.id}
                    layout
                    transition={{ duration: 0.4, ease: easeOut }}
                    className="border-2 border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50/85 transition-colors duration-300 overflow-hidden shadow-xs hover:border-brand-orange/40 flex flex-col h-full group"
                  >
                    {/* Card Header (Image/Banner + Title) */}
                    <div
                      onClick={() => toggleExpand(topic.id)}
                      className="cursor-pointer select-none flex flex-col h-full flex-grow"
                    >
                      {/* Top: Product Image or Icon Container */}
                      <div className="w-full aspect-video relative overflow-hidden bg-slate-100 border-b border-slate-200">
                        <img
                          src={topic.banner}
                          alt={`${topic.title} banner`}
                          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                        />
                      </div>

                      {/* Content: Title */}
                      <div className="p-6 flex flex-col gap-3 flex-grow">
                        <h3 className="font-heading text-2xl font-black text-brand-navy group-hover:text-brand-orange transition-colors duration-300 leading-tight">
                          {topic.title}
                        </h3>

                        {topic.tagline && (
                          <p className="text-base text-slate-550 font-semibold italic leading-relaxed">
                            {topic.tagline}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 text-brand-orange text-sm font-bold mt-auto pt-2">
                          <span>{isExpanded ? "Show Less" : "Explore Dossier"}</span>
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Body */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.4, ease: easeOut }}
                          className="overflow-hidden bg-white border-t-2 border-slate-200"
                        >
                          <div className="p-6 space-y-6">
                            {/* Summary section */}
                            <div>
                              <span className="text-xs font-bold uppercase text-teal-655 tracking-wider block mb-2">
                                Executive Summary
                              </span>
                              <p className="text-slate-655 text-base leading-relaxed font-light">
                                {topic.preview}
                              </p>
                            </div>

                            {/* Challenge section */}
                            <div>
                              <span className="text-xs font-bold uppercase text-teal-655 tracking-wider block mb-2">
                                Core Challenge
                              </span>
                              <p className="text-slate-655 text-base leading-relaxed font-light">
                                {topic.challenge}
                              </p>
                            </div>

                            {/* Efficacy & Advantage section */}
                            <div>
                              <span className="text-xs font-bold uppercase text-teal-655 tracking-wider block mb-2">
                                Mechanism & Advantage
                              </span>
                              <p className="text-slate-655 text-base leading-relaxed font-light">
                                {topic.advantage}
                              </p>
                            </div>

                            {/* Target Applications (if any) */}
                            {topic.applications && (
                              <div>
                                <span className="text-xs font-bold uppercase text-teal-655 tracking-wider block mb-2">
                                  Target Applications
                                </span>
                                <p className="text-slate-655 text-base leading-relaxed font-light">
                                  {topic.applications}
                                </p>
                              </div>
                            )}

                            {/* Recognition & Support (if any) */}
                            {topic.recognition && (
                              <div className="bg-teal-50/70 border border-teal-150 p-4 rounded-xl">
                                <span className="text-xs font-bold uppercase text-teal-800 tracking-wider block mb-1.5">
                                  Support & Recognition
                                </span>
                                <p className="text-teal-700 text-base leading-relaxed font-black">
                                  {topic.recognition}
                                </p>
                              </div>
                            )}

                            {/* Mailto Inquiry Button */}
                            <div className="pt-2">
                              <a
                                href={emailHref}
                                className="w-full inline-flex items-center justify-center py-3 rounded-full border-2 border-teal-600 hover:border-teal-700 text-teal-650 hover:text-teal-750 font-bold text-base hover:bg-teal-50/50 transition-colors duration-300 text-center"
                              >
                                Inquire About Collaboration
                              </a>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              })}
            </div>

          </div>
        </SectionWrapper>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
