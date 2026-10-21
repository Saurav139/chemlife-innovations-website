"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { VariantProvider } from "@/context/VariantContext";
import SiteSearch from "@/components/SiteSearch";
import { Images } from "@/lib/assets";

const easeOut = [0.25, 0.1, 0, 1] as const;

// Card image widths for the browser to pick a file size from. They follow the product grid below.
const BANNER_SIZES = "(min-width: 1024px) 366px, (min-width: 640px) calc(50vw - 38px), calc(100vw - 50px)";

interface Product {
  id: number;
  name: string;
  category: string;
  tagline?: string;
  about: string;
  features: string[];
  inclusionRate: string;
  packSize: string;
  icon: string;
  variants?: string[];
  banner?: string;
}

const productsData: Product[] = [
  {
    id: 1,
    name: "MaxDmold",
    category: "Mono-gastric",
    tagline: "Bio-copper power. Dual-action mould shield",
    about: "MaxDmold is a bioactive mold inhibition solution formulated with copper chelates and natural phenolic compounds. It provides efficient fungal control, protects nutrient integrity, and offers a safer, low-inclusion alternative to conventional copper-based preservatives.",
    features: [
      "Chelated bio-copper mold inhibtion system",
      "Natural phenolic-enhanced mold inhibition",
      "Low-dose application with improved safety",
      "Protects feed nutrients during storage"
    ],
    inclusionRate: "25 g/MT of feed or feed ingredients (or as recommended by the Nutritionist)",
    packSize: "25 kg Bag",
    icon: Images.products.icons.maxdmold,
    banner: Images.products.banners.maxdmold
  },
  {
    id: 2,
    name: "MaxDmold Spray",
    category: "Value Addition",
    tagline: "Spray-on shield for storage hygiene.",
    about: "MaxDmold Spray is an advanced liquid feed hygiene solution designed for silos and bulk feed storage. Its bioactive mineral and hydroxyacid technology controls mold and bacteria, helping preserve feed quality, nutritional value, and storage stability.",
    features: [
      "Protects feed ingeredients from mold growth",
      "Long-time protection across full storage cycle",
      "Kills mold before secondary toxins formation",
      "Safe for galvanized silos, augers & stainless steel",
      "Lower inclusion lvels, safer ingeredients"
    ],
    inclusionRate: "Spray 250 g of MaxDMold spray diluted with 250 mL water per metric ton of feed or feed ingredients (or as recommended by the Nutritionist)",
    packSize: "35L can",
    icon: Images.products.icons.maxdmoldSpray,
    banner: Images.products.banners.maxdmoldSpray
  },
  {
    id: 3,
    name: "SynDmold",
    category: "Ruminants",
    tagline: "Bio-mineral mould guard. Designed for Dairy",
    about: "SynDmold is an advanced feed hygiene additive for dairy cattle feeds that combines bioactive mineral complexes with a proprietary natural phytoactive matrix to control bacteria and molds. It helps preserve feed hygiene, nutrient quality, and feed stability throughout feed manufacture, storage, and feeding.",
    features: [
      "Broad-Spectrum Mold & Bacterial Control",
      "Controls Toxin Formation in Feed",
      "Maintains Feed Hygiene & Stability",
      "Enhances Dairy Production Performance"
    ],
    inclusionRate: "50 g/MT of feed or feed ingredients (or as recommended by the Nutritionist)",
    packSize: "25 kg Bag",
    icon: Images.products.icons.syndmold,
    banner: Images.products.banners.syndmold
  },
  {
    id: 4,
    name: "MaxDmold Plus",
    category: "Mono-gastric",
    tagline: "Smart feed hygiene. Clean feed, Gain profit",
    about: "MaxDmold Plus is an advanced feed hygiene solution engineered for simultaneous control of molds and pathogenic bacteria. Its dual-action antimicrobial technology improves feed stability, extends shelf life, and supports consistent feed quality under commercial production conditions.",
    features: [
      "Dual control against molds and bacteria",
      "Phytogenic-enhanced antimicrobial technology",
      "Supports gut health and intestinal integrity",
      "Thermostable during commercial feed pelleting",
      "Improves body weight and FCR"
    ],
    inclusionRate: "250 g/MT of feed or feed ingredients (or as recommended by the Nutritionist)",
    packSize: "25 kg Bag",
    icon: Images.products.icons.maxdmoldPlus,
    banner: Images.products.banners.maxdmoldPlus
  },
  {
    id: 5,
    name: "MethioWiz",
    category: "Ruminants",
    tagline: "Rumen-bypass methionine pearls assuring protein.",
    about: "MethioWiz is a rumen-protected methionine supplement developed to maximize post-ruminal methionine availability in dairy cattle. Its protected delivery system supports protein synthesis, metabolic efficiency, and milk component production without ruminal degradation.",
    features: [
      "Rumen-protected DL-methionine technology",
      "High post-ruminal bioavailability",
      "Optimizes protein utilization",
      "Free-flowing formulation for uniform mixing"
    ],
    inclusionRate: "Transition Dairy Animals: 20 g/animal/day\nEarly lactation Dairy Animals: 15-25 g/cow/day\nMid-late lactation Dairy Animals: 10-15 g/cow/day\nSmall Ruminants: 5-10 g/animal/day\nFor Dairy Feed: 0.5-2 kg/MT\n\nOr as per the recommendation of a Nutritionist",
    packSize: "25kg Bag",
    icon: Images.products.icons.methiowiz,
    banner: Images.products.banners.methiowiz
  },
  {
    id: 6,
    name: "MBioWiz Plus",
    category: "Ruminants",
    tagline: "Activate rumen power. Drive productivity.",
    about: "MBioWiz Plus is a multi-component rumen optimization solution that combines active yeast, enzyme complexes, and phytogenic actives. It enhances rumen fermentation, improves fibre utilization, and supports microbial efficiency for higher dairy productivity.",
    features: [
      "Triple-action rumen optimization technology",
      "Enhances fibre digestibility",
      "Stabilizes rumen fermentation",
      "Promotes efficient microbial activity"
    ],
    inclusionRate: "1 kg/MT of feed (or as recommended by the Nutritionist)",
    packSize: "25kg Bag",
    icon: Images.products.icons.mbiowizPlus,
    banner: Images.products.banners.mbiowizPlus
  },
  {
    id: 7,
    name: "MBioWiz TS",
    category: "Ruminants",
    tagline: "Heat Stable. Stronger rumen power",
    about: "MBioWiz TS is a thermostable rumen optimization technology designed for pelleted and processed dairy feeds. Its heat-stable formulation preserves microbial and enzymatic activity throughout feed manufacturing for consistent field performance.",
    features: [
      "Thermostable microbial technology",
      "Pelleting-compatible formulation",
      "Maintains efficacy after processing",
      "Supports rumen fermentation efficiency"
    ],
    inclusionRate: "1 kg/MT of feed (or as recommended by the Nutritionist)",
    packSize: "25kg Bag",
    icon: Images.products.icons.mbiowizTs,
    banner: Images.products.banners.mbiowizTs
  },
  {
    id: 8,
    name: "CholiWiz",
    category: "Ruminants",
    tagline: "Rumen-bypass choline pearls for peak milk.",
    about: "CholiWiz is a rumen-protected choline supplement formulated to support liver function during transition and early lactation. Its protected pearl technology enhances fat metabolism, helping maintain metabolic balance and productive performance.",
    features: [
      "Rumen-protected choline delivery",
      "Supports hepatic fat metabolism",
      "Low-dust pearl technology",
      "Designed for transition cow nutrition"
    ],
    inclusionRate: "Dairy Cattle & Buffalo: 25 g/head/day\nHigh-yield dairy cows & Buffaloes in transition: 25 - 50 g/head/day\n\nFeed inclusion:\nDairy Cow: 0.75 - 2 kg/MT of Dairy Feed\nGoat/Sheep: 2 - 5 g per animal per day\n\nOr as per the recommendation of a Nutritionist",
    packSize: "25kg Bag",
    icon: Images.products.icons.choliwiz,
    banner: Images.products.banners.choliwiz
  },
  {
    id: 9,
    name: "RumiWiz",
    category: "Ruminants",
    tagline: "Rumen pH balance. Steady performance.",
    about: "RumiWiz is a scientifically formulated rumen buffering solution that delivers immediate and sustained pH stabilization. Its balanced combination of buffering agents, minerals, and electrolytes promotes optimal rumen function under production and heat stress conditions.",
    features: [
      "Sustained rumen buffering system",
      "Multi-phase pH stabilization",
      "Mineral and electrolyte support",
      "Suitable for high-producing dairy animals"
    ],
    inclusionRate: "1 kg/MT As recommended by the Nutritionist",
    packSize: "25kg Bag",
    icon: Images.products.icons.rumiwiz,
    banner: Images.products.banners.rumiwiz
  },
  {
    id: 10,
    name: "MinBioZen",
    category: "Value Addition",
    tagline: "Smarter minerals. Productive animals.",
    about: "MinBioZen is a hydroxy amino acid chelated trace mineral technology engineered to maximize mineral bioavailability. The advanced chelation system protects minerals throughout digestion, improving absorption, utilization, and overall nutritional efficiency.",
    variants: [
      "MinBioZen-Zn: Zinc 20%",
      "MinBioZen-Mn: Manganese 20%",
      "MinBioZen-Cu: Copper 20%",
      "MinBioZen-Fe: Iron 20%",
      "MinBioZen-Cr: Chromium 6.5%",
      "Need-based customizable species-specific blends"
    ],
    features: [
      "Hydroxy amino acid chelation technology",
      "High mineral bioavailability",
      "Reduced mineral antagonism",
      "Improved biological utilization"
    ],
    inclusionRate: "As recommended by the Nutritionist",
    packSize: "25kg Bag",
    icon: Images.products.icons.minbiozen,
    banner: Images.products.banners.minbiozen
  },
  {
    id: 11,
    name: "GroGenie (12% & 60%)",
    category: "Mono-gastric",
    tagline: "Non-antibiotic gut performance solution.",
    about: "GroGenie is a non-antibiotic gut performance solution developed to improve intestinal microbial balance and nutrient utilization. Its Halquinol-based technology helps control enteric pathogens while supporting consistent growth and production efficiency.",
    features: [
      "Halquinol-based antimicrobial technology",
      "Triple-action pathogen control",
      "Supports intestinal microbial balance",
      "Optimizes nutrient absorption"
    ],
    inclusionRate: "GroGenie 12%: 500 g/MT of feed (up to 1 kg/MT under challenge conditions)\nGroGenie 60%: 100 g/MT of feed (up to 500 g/MT under challenge conditions)",
    packSize: "25kg Bag",
    icon: Images.products.icons.grogenie,
    banner: Images.products.banners.grogenie
  },
  {
    id: 12,
    name: "LivproGenie",
    category: "Mono-gastric",
    tagline: "Revitalize hepatocytes. Sustain performance.",
    about: "LivproGenie is a phyto-nutritional liver support solution designed to optimize hepatic metabolism and detoxification in poultry. It enhances metabolic resilience, nutrient utilization, and liver function during production and toxin-associated stress.",
    features: [
      "Supports Phase I & II liver detoxification",
      "Enhances metabolic efficiency",
      "Helps manage oxidative stress",
      "Optimizes liver–gut functionality"
    ],
    inclusionRate: "Broilers: 10 ml/ 100 birds: 2-3 weeks\nBroilers: 20 ml/100 birds: 4th week onward\nBreeders & layers: 20 ml/100 birds\n\nOr as recommended by the Nutritionist",
    packSize: "5L | 35L | 200L",
    icon: Images.products.icons.livprogenie,
    banner: Images.products.banners.livprogenie
  },
  {
    id: 13,
    name: "EggGenie",
    category: "Mono-gastric",
    tagline: "Precision layer nutrition for shell quality.",
    about: "EggGenie is a precision layer nutrition solution combining bioavailable trace minerals, essential amino acids, and botanical actives. It supports eggshell formation, reproductive performance, and sustained laying persistence in commercial poultry.",
    features: [
      "Precision bio-mineral nutrition",
      "Supports shell quality and strength",
      "Optimizes mineral transport",
      "Antioxidant nutritional support"
    ],
    inclusionRate: "Standard Inclusion: 500g/MT feed\nStress Conditions: 750g/MT feed\n\nOr as recommended by the Nutritionist",
    packSize: "25kg Bag",
    icon: Images.products.icons.egggenie,
    banner: Images.products.banners.egggenie
  },
  {
    id: 14,
    name: "GutproGenie",
    category: "Mono-gastric",
    tagline: "Dynamic gut flora. Predictable performance.",
    about: "GutproGenie is a targeted poultry gut health solution that integrates organic acids, phytogenic compounds, and amino acid complexes. Its advanced delivery technology promotes intestinal integrity, microbial balance, and efficient nutrient utilization.",
    features: [
      "Multi-modal gut health technology",
      "Targeted pathogen suppression",
      "Supports intestinal barrier integrity",
      "Stable, non-corrosive formulation"
    ],
    inclusionRate: "Chicks: 2-4 ml / L of water\nBroilers: 1-2 ml/L of water\nBreeders & Layers: 1-2 ml/L of water\n\nOr as recommended by the Nutritionist",
    packSize: "5L | 35L | 200L",
    icon: Images.products.icons.gutprogenie,
    banner: Images.products.banners.gutprogenie
  },
  {
    id: 15,
    name: "AflaMlock",
    category: "Ruminants",
    tagline: "Locks aflatoxins. Secures milk quality.",
    about: "AflaMlock is an advanced mycotoxin management solution for dairy cattle, designed to protect against aflatoxin contamination while supporting feed hygiene and nutrient integrity. It helps reduce aflatoxin M1 carryover into milk, promoting safer milk production, improved animal health, and consistent dairy performance.",
    features: [
      "Advanced Aflatoxin Management Technology",
      "Helps Reduce Aflatoxin M1 Carryover into Milk",
      "Advanced Adsorption-Based Formulation",
      "Scientifically Validated Performance"
    ],
    inclusionRate: "1kg /MT",
    packSize: "25kg Bag",
    icon: Images.products.icons.aflamlock,
    banner: Images.products.banners.aflamlock
  },
  {
    id: 16,
    name: "FeedGenie Forte",
    category: "Mono-gastric",
    tagline: "Super-activated toxin trap for clean feed.",
    about: "FeedGenie Forte is an advanced aflatoxin management solution developed for poultry feeds. Designed with mineral-based adsorption technology, it supports feed safety and quality by integrating seamlessly into modern feed management programs.",
    features: [
      "Advanced Aflatoxin Management Technology",
      "Mineral-Based Adsorption System",
      "Supports Feed Safety & Hygiene",
      "Easy Feed Incorporation"
    ],
    inclusionRate: "1-2kg /MT",
    packSize: "25kg Bag",
    icon: Images.products.icons.feedgenie,
    banner: Images.products.banners.feedgenieFort
  },
  {
    id: 17,
    name: "DDGS-Dtox",
    category: "Value Addition",
    tagline: "Detoxed DDGS for safer nutrition. Clean DDGS. Choice of Animal Nutritionist",
    about: "DDGS-Dtox is a cutting-edge, dual-acting detoxification strategy specifically designed to target and deactivate aflatoxins and destroy aflatoxin-producing molds. Formulated as a dual-active Copper Bio-complex, it breaks down AFB1 by disrupting its toxic structure and inhibits mold formation by interfering with its metabolic activities, delivering a safe feed ingredient with high protein content.",
    features: [
      "Over 90% Aflatoxin Reduction - Effective and reliable detoxification",
      "Preserves Nutrients - Ensures feed retains its full nutritional quality",
      "Eco-Friendly - Operates under mild, environmentally safe conditions",
      "Safe Metabolites - Converts AFB1 into non-toxic metabolites",
      "Easy Integration - Compatible with standard DDGS processing systems"
    ],
    inclusionRate: "Compatible with standard DDGS processing systems (or as recommended by the Nutritionist)",
    packSize: "25kg Bag",
    icon: Images.products.icons.ddgsDtox,
    banner: Images.products.banners.ddgsDtox
  },
  {
    id: 18,
    name: "FeedGenie Prime",
    category: "Mono-gastric",
    tagline: "Multi-mode, multi-mycotoxin defense.",
    about: "FeedGenie Prime is a holistic mycotoxin management system developed for poultry feeds. Formulated with super activated bio-composite clay, Lactobacillus culture metabolites, mannan oligosaccharide, and copper activated charcoal, it effectively binds a broad spectrum of challenging mycotoxins (including aflatoxins, ochratoxins, zearalenone, and deoxynivalenol) while actively supporting immune function and flock resilience.",
    features: [
      "Broad-Spectrum Adsorption: Effectively binds diverse mycotoxins",
      "Immune Support: Enhances animal's resilience and immune defense",
      "Feed Safety: Neutralizes toxin risks and improves flock performance",
      "Active Synergy: Integrates probiotics and activated charcoal"
    ],
    inclusionRate: "1-2 kg/MT of feed (or as recommended by the Nutritionist)",
    packSize: "25kg Bag",
    icon: Images.products.icons.feedgeniePrime,
    banner: Images.products.banners.feedgeniePrime
  }
];

export default function ProductsPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "Mono-gastric", "Ruminants", "Value Addition"];

  // Handle auto-expansion and search filtering via query parameter (e.g. ?expand=MaxDmold) or hash (#MaxDmold)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("q") || params.get("query") || "";
      
      // Check query parameter 'expand' or hash fragment
      let expand = params.get("expand") || "";
      if (!expand && window.location.hash) {
        expand = decodeURIComponent(window.location.hash.substring(1));
      }

      if (query) {
        setSearchQuery(query);
      }
      
      if (expand) {
        const prod = productsData.find(
          (p) => p.name.toLowerCase() === expand.toLowerCase()
        ) || productsData.find(
          (p) => p.name.toLowerCase().startsWith(expand.toLowerCase())
        ) || productsData.find(
          (p) => p.name.toLowerCase().includes(expand.toLowerCase())
        );
        if (prod) {
          // If the product belongs to a specific category, ensure that category is selected (or select All)
          if (prod.category) {
            setSelectedCategory(prod.category);
          } else {
            setSelectedCategory("All");
          }
          setExpandedId(prod.id);
          
          // Smooth scroll to the product element
          setTimeout(() => {
            const el = document.getElementById(`product-${prod.id}`);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 300);
        }
      }
    }
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredProducts = productsData.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.about.toLowerCase().includes(query) ||
      product.features.some((f) => f.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const categoryColorStyles = {
    "All": {
      focus: "focus-within:border-brand-navy focus-within:ring-brand-navy",
      accent: "hover:text-brand-navy text-slate-400",
      icon: "text-slate-400"
    },
    "Mono-gastric": {
      focus: "focus-within:border-brand-orange focus-within:ring-brand-orange",
      accent: "hover:text-brand-orange text-brand-orange",
      icon: "text-brand-orange"
    },
    "Ruminants": {
      focus: "focus-within:border-blue-600 focus-within:ring-blue-600",
      accent: "hover:text-blue-600 text-blue-600",
      icon: "text-blue-600"
    },
    "Value Addition": {
      focus: "focus-within:border-emerald-600 focus-within:ring-emerald-600",
      accent: "hover:text-emerald-600 text-emerald-600",
      icon: "text-emerald-600"
    }
  };

  const activeStyle = categoryColorStyles[selectedCategory as keyof typeof categoryColorStyles] || categoryColorStyles["All"];

  return (
    <VariantProvider>
      <Header />

      <main className="bg-slate-50/50 min-h-screen text-brand-navy">
        {/* Hero and product list are plain sections: they're in the first screen, so they show without waiting for a fade-in.
            The hero image is the page's largest paint (LCP), so it loads first. */}
        <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 text-white relative overflow-hidden bg-brand-navy flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src={Images.products.heroBanner}
              alt="Rows of bioreactors in a biotechnology production lab"
              fill
              sizes="100vw"
              className="object-cover opacity-60"
              priority
              fetchPriority="high"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/75 to-transparent" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6 w-full text-center md:text-left">
            <span className="text-teal-400 text-xs md:text-sm font-semibold tracking-widest uppercase block mb-3">Our Offerings</span>
            <h1 className="font-heading text-4xl lg:text-5xl font-bold leading-tight mb-4 text-white">
              Feed <span className="text-teal-400">Additives & Solutions</span>
            </h1>
            <p className="text-white/85 text-base lg:text-lg leading-relaxed max-w-3xl font-light">
              Science-backed solutions formulated for superior mold inhibition, pathogen control, and grain preservation.
            </p>
          </div>
        </section>

        {/* Products List Section */}
        <section className="py-16 bg-slate-50/30 relative overflow-hidden">
          {/* Subtle Product-based Background Image. At 4% opacity a small file looks the same as the 3840px original,
              and it's decorative, so its empty alt makes screen readers skip it. */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-[0.04]">
            <Image
              src={Images.products.customBg}
              alt=""
              fill
              sizes="640px"
              className="object-cover object-center"
            />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-6">

            {/* Left-Aligned Search and Category Selector Container */}
            <div className="flex flex-col md:flex-row items-center gap-4 mb-10 w-full">
              <div className={`flex items-center bg-slate-50 border border-slate-200 rounded-full shadow-xs text-sm w-full md:max-w-xl ${activeStyle.focus} focus-within:ring-1 transition-all duration-300 relative`}>
                {/* Search Icon */}
                <div className={`pl-4 ${activeStyle.icon} flex-shrink-0 transition-colors duration-300`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Input Text Field */}
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 px-3 py-3 text-brand-navy placeholder-slate-400 focus:outline-none focus:ring-0 text-sm"
                />

                {/* Clear Search Button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`mr-2 text-slate-400 ${activeStyle.accent} transition-colors duration-250 cursor-pointer`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Vertical Divider Line */}
                <div className="h-6 w-[1px] bg-slate-200 flex-shrink-0" />

                {/* Category Dropdown Selector inside Search Bar */}
                <div className="relative flex-shrink-0">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="appearance-none bg-transparent pl-4 pr-10 py-3 font-semibold text-xs text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category} className="text-brand-navy font-semibold">
                        {category === "All" ? "All Species" : category}
                      </option>
                    ))}
                  </select>
                  {/* Dropdown Chevron Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {filteredProducts.map((product) => {
                const isExpanded = expandedId === product.id;
                const emailSubject = encodeURIComponent(`Product Inquiry: ${product.name}`);
                const emailBody = encodeURIComponent(
                  `Hi ChemLife Innovations team,\n\nI am writing to inquire about ${product.name}. Please share technical datasheets, pricing, and packaging options.\n\nBest regards,\n[Your Name]\n[Your Company]`
                );
                const emailHref = `mailto:innovate@chemlifeinnovations.com?subject=${emailSubject}&body=${emailBody}`;

                return (
                  <motion.div
                    key={product.id}
                    id={`product-${product.id}`}
                    data-analytics-item={product.name}
                    layout
                    transition={{ duration: 0.4, ease: easeOut }}
                    className="border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50/85 transition-colors duration-300 overflow-hidden shadow-xs hover:border-brand-orange/30 flex flex-col h-fit group"
                  >
                    {/* Card Header (Image/Icon + Title & Category) */}
                    <div
                      onClick={() => toggleExpand(product.id)}
                      data-analytics-click={isExpanded ? "Show Less" : "Learn More"}
                      className="cursor-pointer select-none flex flex-col"
                    >
                      {/* Top: Product Image or Icon Container */}
                      {product.banner ? (
                        <div className="w-full aspect-video relative overflow-hidden bg-slate-100 border-b border-slate-200/60">
                          <Image
                            src={product.banner}
                            alt={`${product.name} banner`}
                            fill
                            sizes={BANNER_SIZES}
                            className="object-cover object-center group-hover:scale-102 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-full aspect-video bg-white border-b border-slate-200/60 flex items-center justify-center p-6 relative">
                          <div className="w-16 h-16 rounded-xl bg-white border border-slate-150 shadow-sm flex items-center justify-center p-2.5">
                            <div className="relative w-full h-full">
                              <Image
                                src={product.icon}
                                alt={`${product.name} icon`}
                                fill
                                sizes="42px"
                                className="object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Content: Title & Category */}
                      <div className="p-5 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-heading text-lg font-black text-brand-navy group-hover:text-brand-orange transition-colors duration-300 leading-tight">
                            {product.name}
                          </h3>

                          <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border whitespace-nowrap ${product.category === "Mono-gastric"
                            ? "bg-orange-50 border-orange-150 text-brand-orange"
                            : product.category === "Ruminants"
                              ? "bg-blue-50 border-blue-150 text-blue-700"
                              : "bg-emerald-50 border-emerald-150 text-emerald-700"
                            }`}>
                            {product.category}
                          </span>
                        </div>

                        {product.tagline && (
                          <p className="text-xs text-slate-550 italic leading-relaxed">
                            {product.tagline}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 text-brand-orange text-xs font-bold mt-2">
                          <span>{isExpanded ? "Show Less" : "Learn More"}</span>
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
                          className="overflow-hidden border-t border-slate-100 bg-white"
                        >
                          <div className="p-5 space-y-5">
                            {/* About section */}
                            <div>
                              <span className="text-[9px] font-black uppercase text-teal-600 tracking-wider block mb-1.5">
                                About Product
                              </span>
                              <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
                                {product.about}
                              </p>
                            </div>

                            {/* Variants section */}
                            {product.variants && product.variants.length > 0 && (
                              <div>
                                <span className="text-[9px] font-black uppercase text-teal-600 tracking-wider block mb-1.5">
                                  Available Variants
                                </span>
                                <ul className="grid grid-cols-1 gap-1.5 text-slate-600 text-xs font-semibold">
                                  {product.variants.map((variant, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                                      {variant}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Key Features section */}
                            <div>
                              <span className="text-[9px] font-black uppercase text-teal-600 tracking-wider block mb-2">
                                Key Features
                              </span>
                              <ul className="space-y-2">
                                {product.features.map((feature, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-slate-600 text-xs">
                                    <svg className="w-3.5 h-3.5 text-brand-orange mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="leading-tight">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Usage & Presentation section */}
                            <div className="space-y-3">
                              <span className="text-[9px] font-black uppercase text-teal-600 tracking-wider block">
                                Usage & Presentation
                              </span>

                              <div className="space-y-2.5">
                                {/* Inclusion rate */}
                                <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                  <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Inclusion Rate</span>
                                    <span className="text-xs text-brand-navy font-semibold leading-relaxed mt-0.5 block whitespace-pre-line">
                                      {product.inclusionRate}
                                    </span>
                                  </div>
                                </div>

                                {/* Pack size */}
                                <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                  <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Pack Size</span>
                                    <span className="text-xs text-brand-navy font-semibold leading-relaxed mt-0.5 block whitespace-pre-line">
                                      {product.packSize}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Enquire button */}
                            <a
                              href={emailHref}
                              className="w-full py-3 px-4 rounded-xl bg-brand-orange hover:bg-brand-navy text-white text-xs font-semibold transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center gap-2 group/btn cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5 text-white group-hover/btn:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Enquire about {product.name}
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl col-span-full">
                  <p className="text-slate-500 text-sm">No products match your search query.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
