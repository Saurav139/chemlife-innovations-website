import type { Metadata } from "next";
import { englishOnly } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Launch Lab",
  description:
    "Mix natural ingredients in the reaction vessel to launch the ChemLife Innovations website.",
  path: "/launch",
  noIndex: true,
});

// English only for now.
export default async function LaunchLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  await englishOnly(params);
  return children;
}
