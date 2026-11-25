// Approved technical data for the product pages, taken from each product's Technical Data Sheet (TDS),
// Specification and Safety Data Sheet (SDS). It is shown in English in every language, as approved.
// Keyed by the product's name in catalog.ts. A product without an entry simply has no technical sections.
//
// Where the three documents disagree on a figure, the figure is left out rather than guessed:
// MethioWiz bulk density and MBioWiz Plus protein.

type Row = readonly [label: string, value: string];

export interface ProductData {
  /** Dry products raise dust; liquids don't. Decides the dust-mask line under Safety. */
  dry: boolean;
  /** Four facts under the section heading. */
  glance: { form: string; active: string; shelfLife: string; usedIn: string };
  intendedUse: string;
  composition: { items?: readonly string[]; per?: string; table?: readonly Row[]; note?: string };
  /** How it works: a short name for each step, then what happens. */
  mechanism: readonly Row[];
  /** Left out where the page's Key Features already say the same thing. */
  benefits?: readonly string[];
  specs: readonly Row[];
  storage: readonly Row[];
  application: string;
  compatibility: string;
  handling: readonly string[];
  efficacy?: {
    inVitro: readonly Row[];
    inVitroNote: string;
    inVivo?: { source: string; text: string };
  };
  documents: { tds: string; sds: string };
}

export const PRODUCT_DATA: Record<string, ProductData> = {
  MaxDmold: {
    dry: true,
    glance: {
      form: "Light green to dark green free-flowing powder",
      active: "Bioactive copper 57.0–63.0%",
      shelfLife: "24 months",
      usedIn: "Complete feed, mash or pellet",
    },
    intendedUse:
      "MaxDmold is intended for incorporation into complete poultry feed as a feed hygiene additive to minimize mold proliferation and preserve feed quality. It is recommended for poultry (broilers, breeders, and layers) and swine, particularly where feeds contain stored cereals, oilseed meals, or other ingredients susceptible to fungal contamination. The product is suitable for both mash and pellet feed manufactured under commercial conditions and can be used continuously throughout the production cycle.",
    composition: { items: ["Bio-active copper", "Natural phenolic compounds"] },
    mechanism: [
      ["Fungal membrane destruction", "Phenolic compounds rupture cell membranes, causing rapid mold death."],
      ["Metabolic blockade", "Copper chelate and phenolics disrupt enzymes to halt growth and replication."],
      ["Mycotoxin-induced oxidative neutralization", "Phenolics scavenge mycotoxin-induced free radicals, preventing intestinal cell apoptosis and feed quality degradation."],
      ["Enhanced bioavailability", "Chelation delivers 3–5 times higher absorption for sustained antifungal activity."],
      ["Dual-action gut health", "Supports intestinal villi development for better nutrient utilization and FCR."],
    ],
    benefits: [
      "Superior mold inhibition",
      "Ultra-low inclusion rate",
      "Improves feed conversion",
      "Enhances gut health",
      "Boosts production performance",
      "Reduced toxicity risk",
    ],
    specs: [
      ["Physical form", "Free-flowing powder"],
      ["Colour", "Light green to dark green"],
      ["Assay (bioactive copper)", "57.0–63.0%"],
      ["pH (2% suspension)", "Not less than 5.0"],
      ["Loss on drying", "Not more than 15.0%"],
      ["Bulk density", "0.5–0.8 g/mL"],
      ["Solubility in water", "Insoluble"],
    ],
    storage: [
      ["Thermal stability", "Stable under commercial pelleting conditions"],
      ["Storage", "Store in a cool, dry place away from direct sunlight."],
      ["Shelf life", "24 months"],
    ],
    application:
      "Incorporate into complete poultry or swine feed at the rate of 25 g per metric ton of feed. The product should be added during the feed mixing stage to ensure homogeneous distribution throughout the feed. It is suitable for both mash and pellet feed manufacturing systems and is recommended for continuous inclusion from starter through finisher phases to maintain consistent feed hygiene and quality.",
    compatibility:
      "MaxDmold is compatible with conventional poultry feed ingredients and standard feed manufacturing operations. It can be incorporated into both mash and pelleted feeds without affecting feed-processing characteristics. The product is also compatible with commonly used nutritional and feed hygiene additives, including vitamin premixes, trace mineral premixes, amino acids, enzymes, probiotics, prebiotics, organic acids, coccidiostats, and toxin management programs. No known incompatibilities have been identified when used according to the recommended inclusion rate.",
    handling: [
      "Controlled safety evaluations have demonstrated that MaxDmold is safe for poultry when used at the recommended inclusion level. No evidence of hepatotoxicity, organ abnormalities, impaired immune response, reduced feed intake, or adverse growth effects was observed during experimental evaluation.",
      "During handling, standard feed manufacturing hygiene practices should be followed. Personnel should avoid excessive dust generation and wear appropriate protective equipment where necessary. The product is intended solely for animal feeding and should be stored out of reach of children.",
    ],
    efficacy: {
      inVitro: [
        ["A. niger", "29"],
        ["C. albicans", "27"],
      ],
      inVitroNote:
        "MaxDmold exhibited strong in-vitro antifungal activity against representative mold and yeast species associated with feed spoilage. The observed inhibition supports its use for maintaining feed hygiene, reducing fungal proliferation, and improving the storage stability of feed and feed ingredients.",
      inVivo: {
        source: "Scientifically validated under controlled poultry performance trials at Veterinary College, Hebbal, Bengaluru (KVAFSU).",
        text: "Dietary supplementation with MaxDmold resulted in significant improvements in intestinal morphology, characterized by increased ileal villus height and a higher villus height-to-crypt depth ratio (P < 0.001). These histomorphological improvements corresponded with increased final body weight (+68 g versus control), suggesting enhanced nutrient absorption efficiency and improved intestinal function. The findings demonstrate that maintaining feed hygiene with MaxDmold can support gut health and productive performance in poultry under commercial feeding conditions.",
      },
    },
    documents: { tds: "CIPL/R&D/TDS/001", sds: "SDS-MXD-005" },
  },

  "MaxDmold Spray": {
    dry: false,
    glance: {
      form: "Orange to reddish thick liquid",
      active: "Bioactive calcium 1.8–2.2%",
      shelfLife: "18 months",
      usedIn: "Sprayed on feed and feed ingredients",
    },
    intendedUse:
      "MaxDmold Spray is intended for application onto feed and feed ingredients as a liquid feed hygiene solution to minimize bacterial and fungal proliferation during storage and handling. It is recommended for poultry and livestock feeds, including maize, soybean meal, DDGS, complete feeds, and other ingredients susceptible to microbial contamination. The product is suitable for application through automated spray systems during feed manufacture, conveying, cooling, or storage.",
    composition: { items: ["Bioactive calcium: 2%", "Aqua-based carrier: q.s."] },
    mechanism: [
      ["Membrane disruption", "Hydroxyacid-driven pH shift destabilizes the proton-motive force, increasing membrane permeability."],
      ["Metabolic inhibition", "Bioactive minerals penetrate cells and inhibit key enzymes, disrupting the electron transport chain."],
      ["ATP collapse", "Inhibition of oxidative phosphorylation halts ATP production, shutting down cellular metabolism."],
      ["Fungicidal outcome", "Irreversible metabolic failure leads to cell death and prevents mycotoxin production."],
    ],
    specs: [
      ["Physical form", "Thick liquid"],
      ["Colour", "Orange to reddish"],
      ["Bioactive calcium", "1.8–2.2%"],
      ["pH (2% suspension)", "1.5–3.5"],
      ["Specific gravity", "1.1–1.3 g/mL"],
      ["Solubility in water", "Soluble"],
    ],
    storage: [
      ["Storage", "Store in a cool, dry place away from direct sunlight. Keep the container tightly closed after use."],
      ["Shelf life", "18 months"],
    ],
    application:
      "Apply MaxDmold Spray through an automated fine-mist spray system at a rate of 250–500 g/MT of feed to ensure uniform distribution across feed particles in silos. The product may be applied during conveying, cooling, storage, or transfer operations to maintain consistent feed hygiene throughout the production cycle. Mix or shake well before application.",
    compatibility:
      "Compatible with cereals, oilseed meals, DDGS, complete feeds, pelleted feeds, storage silos, bulk bins, augers, conveyors, elevators, and automated liquid dosing systems. The formulation is non-corrosive and suitable for galvanized steel and stainless-steel storage infrastructure. No known incompatibilities have been identified when used according to the recommended application rate.",
    handling: [
      "Controlled safety evaluations have demonstrated that MaxDmold Spray is safe when used at the recommended application level. The non-corrosive formulation is designed for safe handling and is compatible with galvanized steel and stainless-steel equipment.",
      "During handling, standard feed manufacturing hygiene practices should be followed. Personnel should avoid unnecessary exposure and wear appropriate protective equipment where required. The product is intended solely for animal feeding applications and should be stored out of reach of children.",
    ],
    efficacy: {
      inVitro: [
        ["A. niger", "28"],
        ["C. albicans", "37"],
        ["C. sporogenes", "32"],
        ["E. coli", "34"],
        ["P. aeruginosa", "38"],
        ["S. typhi", "40"],
      ],
      inVitroNote:
        "The observed zones of inhibition demonstrate that MaxDmold Spray possesses broad-spectrum antimicrobial activity against common feed spoilage fungi and bacteria. The in-vitro results support its application as a feed hygiene solution to help preserve feed quality, inhibit microbial growth during storage, and protect feed ingredients stored in silos and bulk handling systems.",
    },
    documents: { tds: "CIPL/R&D/TDS/003", sds: "SDS-MXS-008" },
  },

  MethioWiz: {
    dry: true,
    glance: {
      form: "Off-white to pale yellow free-flowing granules",
      active: "Methionine 48.0–52.0%",
      shelfLife: "24 months",
      usedIn: "Complete feed, concentrate or TMR",
    },
    intendedUse:
      "MethioWiz is intended for supplementation in transition, early-, mid-, and late-lactation dairy animals where metabolizable methionine supply is limiting. It helps optimize amino acid nutrition, improve milk production and composition, support liver metabolism, and enhance feed protein utilization while reducing nitrogen losses.",
    composition: { items: ["Rumen-protected methionine, encapsulated using PhytoNovaCoat technology"] },
    mechanism: [
      ["Rumen protection", "PhytoNovaCoat protects methionine from extensive ruminal microbial degradation, increasing the proportion available for post-ruminal absorption."],
      ["Post-ruminal availability", "Releases methionine in the small intestine, increasing the supply of metabolizable methionine to the animal."],
      ["Milk protein synthesis", "Supplies methionine as a key limiting amino acid for casein and milk protein synthesis, supporting milk protein concentration and yield."],
      ["Amino acid utilization", "Improves dietary amino acid balance, supporting efficient nitrogen utilization and reducing excess nitrogen losses."],
      ["Liver and lipid metabolism", "Supports hepatic protein synthesis and methylation-dependent pathways involved in lipid transport and hepatic fat metabolism."],
    ],
    benefits: [
      "Provides rumen-protected metabolisable methionine to improve overall methionine availability post rumen.",
      "Improves milk yield and milk protein content in dairy cows and buffaloes.",
      "Reduces fat buildup in the liver during the transition period.",
      "Lowers oxidative stress and supports immune function.",
      "Helps reduce nitrogen excretion through better amino acid utilisation.",
    ],
    specs: [
      ["Physical form", "Free-flowing granules"],
      ["Colour", "Off-white to pale yellow"],
      ["Assay (methionine)", "48.0–52.0%"],
      ["Solubility", "Insoluble in cold water"],
    ],
    storage: [
      ["Stability", "Stable under normal feed processing conditions"],
      ["Storage", "Store in cool, dry conditions away from direct sunlight."],
      ["Shelf life", "24 months"],
    ],
    application:
      "MethioWiz may be incorporated into complete dairy feed, concentrate mixtures, or total mixed ration (TMR). Uniform mixing is recommended to ensure consistent intake. Supplementation should be based on production stage, milk yield, dietary protein level, and metabolizable amino acid requirements.",
    compatibility: "MethioWiz is compatible with conventional feed ingredients and commonly used nutritional additives when used at the recommended inclusion level.",
    handling: [
      "MethioWiz is safe for dairy cattle, buffaloes, and small ruminants when used according to the recommended dosage. Follow standard feed manufacturing and handling practices. Store in the original sealed container under cool and dry conditions. Intended exclusively for animal feeding.",
    ],
    documents: { tds: "CIPL/R&D/TDS/014", sds: "SDS-MTWZ-004" },
  },

  "MBioWiz Plus": {
    dry: true,
    glance: {
      form: "Light brown to brown free-flowing powder",
      active: "Yeast activity not less than 1800 billion CFU/kg",
      shelfLife: "24 months",
      usedIn: "Concentrate feed or TMR",
    },
    intendedUse:
      "MBioWiz Plus is intended for supplementation in dairy cattle and buffaloes to support rumen fermentation, fiber digestion, nutrient utilization, and productive performance. The product is suitable for use during growth, transition, lactation, and other periods of increased nutritional demand.",
    composition: {
      items: ["Active dried yeast", "Protein (inactive dried yeast)", "Phyto-active extracts", "Polysaccharides of natural source", "Fibrolytic enzymes"],
    },
    mechanism: [
      ["Rumen microbial activation", "Functional ingredients support the growth and metabolic activity of beneficial rumen microorganisms, establishing an active microbial population for feed degradation."],
      ["Structural carbohydrate breakdown", "Fibrolytic enzymes act on dietary fiber, breaking down complex structural carbohydrates into simpler fermentable components and making nutrients more accessible to rumen microbes."],
      ["Fermentation enhancement", "The released fermentable components are utilized by rumen microorganisms, supporting carbohydrate fermentation and the production of volatile fatty acids (VFAs)."],
      ["Nutrient conversion and utilization", "The microbial fermentation process converts dietary components into VFAs and microbial biomass, contributing to the availability of energy and microbial nutrients for the animal."],
      ["Rumen environment maintenance", "By supporting microbial activity, fiber breakdown and balanced fermentation, the formulation helps maintain rumen function and stability under changing dietary conditions."],
    ],
    benefits: [
      "Improvement in dry matter intake, thus enhancing milk yield, milk fat and SNF.",
      "Enhances nutrient digestibility through effective improvement in fiber digestion.",
      "Helps maintain the right pH of the rumen, reducing the chances of SARA (subacute rumen acidosis).",
    ],
    specs: [
      ["Physical form", "Free-flowing powder"],
      ["Colour", "Light brown to brown"],
      ["Fibrolytic enzymes", "2,000,000 combined International Units/kg"],
      ["Yeast activity", "Not less than 1800 billion CFU/kg"],
      ["Phytoactive extract", "Equivalent to 180 g pure herbs"],
      ["pH (2%)", "3.5–7.5"],
      ["Loss on drying", "Not more than 8.0%"],
      ["Bulk density", "0.6–0.7 g/mL"],
      ["Solubility in water", "Sparingly soluble"],
    ],
    storage: [
      ["Stability", "Stable under normal commercial feed manufacturing conditions"],
      ["Storage", "Store below 18°C in a dry place, away from direct sunlight."],
      ["Shelf life", "24 months"],
    ],
    application:
      "Mix MBioWiz Plus uniformly with concentrate feed or total mixed ration (TMR). The product may be used continuously as part of a balanced nutritional program or as recommended by a dairy nutritionist.",
    compatibility: "MBioWiz Plus is compatible with conventional feed ingredients and commonly used nutritional additives and other feed additives when used at the recommended inclusion level.",
    handling: [
      "MBioWiz Plus is intended solely for animal feeding. Follow standard feed manufacturing and handling practices during use. Store in a cool, dry place and avoid exposure to excessive moisture.",
    ],
    documents: { tds: "CIPL/R&D/TDS/006", sds: "SDS-MBWP-012" },
  },

  CholiWiz: {
    dry: true,
    glance: {
      form: "Brown free-flowing pearls",
      active: "Choline chloride 28.0–32.0%",
      shelfLife: "18 months",
      usedIn: "Complete feed or TMR",
    },
    intendedUse:
      "CholiWiz is intended for supplementation in transition dairy cattle, buffaloes, goats, and sheep from approximately three weeks pre-calving through early lactation. It supports liver function, energy metabolism, and lipid transport, helping reduce metabolic disorders associated with the transition period while improving productivity and reproductive efficiency.",
    composition: { items: ["Choline chloride 30% (w/w), in free-flowing pearls encapsulated using PhytoNovaCoat technology"] },
    mechanism: [
      ["Rumen protection", "PhytoNovaCoat protects choline chloride from ruminal degradation, improving its potential for post-ruminal delivery."],
      ["Intestinal release and absorption", "Protected choline reaches the lower digestive tract, where it is released and absorbed for metabolic utilization."],
      ["Phosphatidylcholine synthesis", "Absorbed choline supports phosphatidylcholine synthesis, essential for cell membranes and hepatic lipoprotein formation."],
      ["Hepatic fat export", "Supports VLDL synthesis and triglyceride export from the liver, helping limit hepatic fat accumulation during the transition period."],
      ["Energy metabolism", "Supports hepatic lipid metabolism and utilization of mobilized body fat during periods of negative energy balance."],
    ],
    benefits: [
      "Supports healthy liver function during transition.",
      "Reduces the risk of fatty liver and ketosis.",
      "Improves fat metabolism and energy utilization.",
      "Promotes phospholipid synthesis for efficient lipid transport.",
      "Maintains tissue integrity and healthy cell membrane function.",
      "Supports overall transition performance.",
    ],
    specs: [
      ["Physical form", "Free-flowing pearls"],
      ["Colour", "Brown"],
      ["Assay (choline chloride)", "28.0–32.0%"],
      ["Loss on drying", "Not more than 8.0%"],
      ["Bulk density", "0.3–0.6 g/mL"],
      ["Solubility in water", "Insoluble"],
    ],
    storage: [
      ["Stability", "Stable under normal feed processing conditions"],
      ["Storage", "Store in a cool, dry place away from direct sunlight."],
      ["Shelf life", "18 months"],
    ],
    application:
      "CholiWiz may be incorporated directly into complete dairy feed or total mixed ration (TMR) to ensure uniform distribution. For optimal metabolic support, supplementation should begin approximately three weeks before calving and continue through early lactation. Higher supplementation levels are recommended for high-yielding animals or herds experiencing elevated metabolic stress.",
    compatibility: "CholiWiz is compatible with conventional feed ingredients and commonly used nutritional additives when used at the recommended inclusion level.",
    handling: [
      "CholiWiz is safe for dairy cattle and buffaloes when used at the recommended dosage. Standard feed handling practices should be followed. Store in the original sealed packaging in a cool and dry location. The product is intended exclusively for animal feeding.",
    ],
    documents: { tds: "CIPL/R&D/TDS/013", sds: "SDS-CHW-017" },
  },

  LivproGenie: {
    dry: false,
    glance: {
      form: "Light brown to dark brown liquid",
      active: "Choline chloride 9.5–10.5%",
      shelfLife: "24 months",
      usedIn: "Drinking water",
    },
    intendedUse:
      "LivproGenie is intended for administration through drinking water in broilers, layers, breeders, and replacement pullets to improve liver function, nutrient metabolism, detoxification efficiency, flock uniformity, and overall productive performance during periods of metabolic, nutritional, or environmental stress.",
    composition: {
      per: "Each litre contains",
      table: [
        ["Niacin", "2500 mg"],
        ["Vitamin B1", "250 mg"],
        ["Vitamin B12", "60 mcg"],
        ["Biotin", "1000 mcg"],
        ["Vitamin E", "2000 mg"],
        ["Choline chloride", "100 g"],
        ["Essential oils", "500 mg"],
        ["Inositol", "2500 mg"],
        ["Vitamin B5", "250 mg"],
      ],
      note: "Hepatoprotective phytobioactives and amino acids optimised to the requirement.",
    },
    mechanism: [
      ["Lipotropic mobilization", "Choline supports VLDL assembly and secretion, promotes fat export from the liver, and helps reduce excessive hepatic fat accumulation."],
      ["Enzymatic bio-amplification", "Vitamins and amino acids drive metabolic enzymes for energy synthesis."],
      ["Hepatocyte protection", "Tocopherols and phytogenics stabilize cell membranes, combat oxidative stress and support regeneration."],
      ["Bile and gut axis optimization", "Hydroxy acids and essential oils stimulate bile flow and improve fat digestion, easing liver workload."],
      ["Detoxification and defence", "Supports hepatic fat export, boosts glutathione and enhances Phase I and II detoxification."],
    ],
    benefits: [
      "Helps in fat mobilization",
      "Improves feed conversion ratio (FCR)",
      "Enhances liver detoxification and recovery",
      "Reduces mortality during heat and metabolic stress",
      "Improves flock uniformity and consistency",
      "Safe for automated nipple-drinker systems",
    ],
    specs: [
      ["Physical form", "Liquid"],
      ["Colour", "Light brown to dark brown"],
      ["Assay (choline chloride)", "9.5–10.5%"],
      ["pH (2% suspension)", "3.50–5.50"],
      ["Specific gravity", "0.9–1.2 g/mL"],
      ["Solubility in water", "Soluble"],
    ],
    storage: [
      ["Storage", "Store in a cool, dry place away from direct sunlight."],
      ["Shelf life", "24 months"],
    ],
    application:
      "Dilute LivproGenie uniformly in the daily drinking water requirement and ensure complete consumption within the recommended period. Prepare a fresh solution daily for optimum efficacy. Suitable for routine supplementation as well as during periods of heat stress, disease recovery, vaccination, feed transition, or other metabolic challenges.",
    compatibility: "Compatible with conventional feed ingredients and commonly used nutritional additives when used at the recommended inclusion level.",
    handling: [
      "Follow standard poultry farm hygiene practices during handling. Shake well before use. Keep the container tightly closed after opening. Intended exclusively for animal feeding.",
    ],
    documents: { tds: "CIPL/R&D/TDS/009", sds: "SDS-LPG-013" },
  },

  EggGenie: {
    dry: true,
    glance: {
      form: "Off-white free-flowing powder",
      active: "Functional bioactive minerals 47–53 g/kg",
      shelfLife: "24 months",
      usedIn: "Complete feed, mash or pellet",
    },
    intendedUse:
      "EggGenie is intended for incorporation into complete feeds for commercial layers, breeder hens, and parent stock to improve eggshell quality, egg mass, laying persistency, reproductive efficiency, and nutrient utilisation.",
    composition: { items: ["Bio-active mineral chelate", "Essential amino acids", "Pro-vitamin D3", "Phytoactives"] },
    mechanism: [
      ["Enhanced mineral bioavailability", "Bio-active mineral chelates protect essential trace minerals from antagonistic interactions within the gastrointestinal tract, allowing significantly greater absorption compared with conventional inorganic mineral sources."],
      ["Improved calcium utilisation", "Pro-vitamin D3 enhances intestinal calcium and phosphorus absorption, increasing mineral availability for eggshell formation and reducing shell defects."],
      ["Efficient eggshell mineralisation", "Highly bioavailable calcium-supporting minerals promote uniform crystal deposition within the shell matrix, resulting in thicker, stronger shells with reduced breakage."],
      ["Antioxidant protection", "Natural phytoactive compounds reduce oxidative stress in reproductive tissues, preserving ovarian function and improving laying persistency."],
      ["Improved protein deposition", "Essential amino acids support efficient albumen synthesis, resulting in improved Haugh units and egg quality."],
      ["Improved nutrient efficiency", "Enhanced nutrient utilisation supports an improved feed conversion ratio and greater egg output from the same feed intake."],
    ],
    benefits: [
      "Improves shell strength and egg quality",
      "Enhances yolk color and albumen density",
      "Supports reproductive hormonal balance",
      "Extends productive laying cycle",
      "Improves flock resilience and uniformity",
      "Supports premium egg production",
    ],
    specs: [
      ["Physical form", "Free-flowing powder"],
      ["Colour", "Off-white"],
      ["Functional bioactive minerals", "47–53 g/kg"],
      ["Polyunsaturated fatty acid", "20–30 g/kg"],
      ["Calcitriol", "1000 mcg/kg"],
      ["pH (2% suspension)", "Not less than 6"],
      ["Bulk density", "0.4–0.7 g/mL"],
      ["Solubility in water", "Insoluble"],
    ],
    storage: [
      ["Storage", "Store in a cool, dry place away from direct sunlight."],
      ["Shelf life", "24 months"],
    ],
    application:
      "EggGenie should be incorporated during feed mixing to ensure homogeneous distribution throughout the complete feed. The product is compatible with mash and pelleted feed manufacturing systems and is suitable for continuous use throughout the laying cycle.",
    compatibility: "Compatible with conventional feed ingredients and commonly used nutritional additives when used at the recommended inclusion level.",
    handling: [
      "Follow standard feed manufacturing practices during handling. Avoid excessive dust generation and wear appropriate personal protective equipment where necessary. The product is intended exclusively for animal feeding.",
    ],
    documents: { tds: "CIPL/R&D/TDS/010", sds: "SDS-EGG-014" },
  },

  GutproGenie: {
    dry: false,
    glance: {
      form: "Brown liquid",
      active: "Methionine activity (MHA) 25–27%",
      shelfLife: "24 months",
      usedIn: "Drinking water",
    },
    intendedUse:
      "GutproGenie is intended for supplementation through drinking water in broilers, layers, breeders, and chicks to support gut health, liver function, nutrient utilisation, and overall productive performance. It is recommended during early growth, feed transitions, heat and production stress, vaccination, disease recovery, antibiotic withdrawal, reduced feed intake, poor feed conversion, wet litter conditions, and other periods of increased nutritional or metabolic demand.",
    composition: {
      per: "Each 500 mL contains",
      table: [
        ["Methionine activity (MHA)", "127 g"],
        ["Lysine hydrochloride", "63 g"],
        ["Choline chloride", "63 g"],
        ["Cobalt", "210 mg"],
        ["Zinc", "220 mg"],
        ["Copper", "160 mg"],
        ["Manganese", "400 mg"],
        ["Magnesium", "600 mg"],
        ["Phosphorus", "150 mg"],
        ["Iron", "230 mg"],
        ["Sodium chloride", "1300 mg"],
      ],
      note: "Phytoactives and gut health-promoting amino acids optimised to the requirement.",
    },
    mechanism: [
      ["Enhanced digestibility and intestinal integrity", "Optimised amino acid nutrition improves digestive enzyme activity and nutrient utilisation while supporting intestinal epithelial regeneration, villus development, and tight junction integrity for better nutrient absorption."],
      ["Gut flora modulation and antioxidant protection", "Natural phytoactives promote a balanced intestinal microbiota by suppressing undesirable microorganisms while reducing oxidative stress to protect intestinal and hepatic tissues during environmental and metabolic challenges."],
      ["Liver function support", "Enhances lipid metabolism and hepatic detoxification, reducing excessive fat accumulation in the liver and supporting metabolic efficiency."],
      ["Improved trace mineral utilisation", "Bioavailable chelated trace minerals support numerous enzyme systems involved in immunity, antioxidant defence, tissue repair, and growth."],
      ["Enhanced metabolic efficiency", "The synergistic combination of amino acids, minerals, and bioactive compounds supports energy metabolism, resulting in improved growth rate, feed conversion ratio, and flock consistency."],
    ],
    benefits: [
      "Improves FCR and weight gain",
      "Promotes flock uniformity and consistency",
      "Supports intestinal health and villi integrity",
      "Enhances nutrient digestibility and absorption",
      "Strengthens immunity and livability",
      "Reduces mortality",
      "Improves egg production and shell quality",
      "Supports metabolic efficiency during stress",
    ],
    specs: [
      ["Physical form", "Liquid"],
      ["Colour", "Brown"],
      ["Assay (MHA)", "25–27%"],
      ["pH (2% suspension)", "2.0–4.0"],
      ["Specific gravity", "0.9–1.2 g/mL"],
      ["Solubility in water", "Soluble"],
    ],
    storage: [
      ["Thermal stability", "Stable under normal storage conditions"],
      ["Storage", "Store in a cool, dry place away from direct sunlight."],
      ["Shelf life", "24 months"],
    ],
    application:
      "Dilute the recommended quantity of GutproGenie in fresh drinking water immediately before use. Ensure adequate mixing to achieve a homogeneous solution and provide continuously during the recommended supplementation period. Fresh solution should be prepared daily. The product is suitable for routine supplementation as well as strategic use during periods of nutritional, environmental, or disease-related stress.",
    compatibility: "GutproGenie is compatible with conventional feed ingredients and commonly used nutritional additives when used at the recommended inclusion level.",
    handling: [
      "GutproGenie is safe for poultry when used at the recommended inclusion rates.",
      "During handling, standard hygiene practices should be followed. Avoid contamination of the product during use. The product is intended exclusively for animal feeding and should be stored out of reach of children.",
    ],
    documents: { tds: "CIPL/R&D/TDS/007", sds: "SDS-GPG-009" },
  },
};

// The acceptance limits in every product's Specification. They are the same for all eight products.
export const PURITY_LIMITS: readonly Row[] = [
  ["Arsenic (As)", "Less than 12 ppm"],
  ["Cadmium (Cd)", "Less than 2 ppm"],
  ["Lead (Pb)", "Less than 30 ppm"],
  ["Mercury (Hg)", "Less than 0.5 ppm"],
  ["E. coli", "Absent in 1 g"],
  ["Salmonella spp.", "Absent in 25 g"],
  ["Foreign matter", "No metal pieces, stones, threads or hair"],
];

// From the Safety Data Sheets, which say the same for every product.
export const SAFETY = {
  classification: "Not classified as a hazardous substance or mixture according to GHS.",
  transport: "Non-hazardous. Not regulated for road, sea or air freight.",
  restriction: "Not intended for direct human consumption. Use strictly in accordance with recommended feed inclusion rates.",
  protection: "Wear safety goggles or glasses with side shields, nitrile gloves and long-sleeved work clothing. Wash hands and exposed skin thoroughly after handling.",
  dustMask: "Use a dust mask when handling open bulk material or where airborne dust may occur.",
  firstAid: [
    ["Inhalation", "Inhalation may cause discomfort to the respiratory tract. If this occurs, move to fresh air. Seek medical advice if the discomfort persists."],
    ["Skin contact", "Wash off immediately with soap and plenty of water for at least 15 minutes. Consult a physician if necessary."],
    ["Eye contact", "Rinse with water for a minimum of 15 minutes. Consult a physician if irritation continues."],
    ["Ingestion", "Rinse the mouth with water; do not induce vomiting. Seek medical help."],
  ] as readonly Row[],
  disposal: "Dispose of contents and container in accordance with applicable local, regional and national regulations. Do not reuse empty containers.",
} as const;

/** The quality paragraph that closes every Technical Data Sheet. */
export const qualityAssurance = (name: string) =>
  `${name} is manufactured in a FAMI-QS-certified facility using carefully selected raw materials and stringent quality management systems to ensure consistent product performance and batch-to-batch uniformity. Each production batch undergoes comprehensive quality control testing, including identity verification, physical characterization, and compliance with defined manufacturing specifications prior to release.`;
