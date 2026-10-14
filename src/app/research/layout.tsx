import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Research & Technology",
  description:
    "The science behind ChemLife additives: ANBioT bio-transformation, green trace-mineral chelation and bioavailability research.",
  path: "/research",
});

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
