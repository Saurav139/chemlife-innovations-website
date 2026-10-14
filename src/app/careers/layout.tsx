import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Careers & Internships",
  description:
    "Apply for ChemLife's 6-month paid industrial internship in Bengaluru, with roles in research, animal nutrition, and operations, marketing and HR.",
  path: "/careers",
});

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
