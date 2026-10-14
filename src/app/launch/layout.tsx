import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Launch Lab",
  description:
    "Mix natural ingredients in the reaction vessel to launch the ChemLife Innovations website.",
  path: "/launch",
  noIndex: true,
});

export default function LaunchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
