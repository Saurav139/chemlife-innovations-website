// The research platform pages in the design preview, in order. Each one's content is a fragment in
// src/previews/research/<slug>.html (converted from the original stand-alone pages); `topicId` matches the topic's
// id in src/lib/catalog.ts, so the listing can use the Research page's own titles, taglines and images.
export const RESEARCH_PAGES = [
  { slug: "anbiot", topicId: 1, title: "Accelerated Natural BioTransformation (ANBioT)" },
  { slug: "green-chelation", topicId: 2, title: "Green Chelation for Smarter Bio-Trace Minerals" },
  { slug: "microencapsulation", topicId: 3, title: "Microencapsulation for Rumen-Sustained and Bypass Delivery" },
  { slug: "nano-trace-minerals", topicId: 4, title: "Nano-Activated Functionalised Trace Minerals" },
  { slug: "nature-identical-molecules", topicId: 5, title: "Synthesis of Nature-Identical Bioactive Molecules" },
] as const;

export type ResearchPageSlug = (typeof RESEARCH_PAGES)[number]["slug"];
