"use client";

import dynamic from "next/dynamic";
import { useAnalyticsEnabled } from "@/lib/useAnalyticsEnabled";

// The banner and GA code load after the page is interactive, so they never delay the first render.
// Web Vitals measured before then aren't lost: the browser keeps them until web-vitals asks.
const Analytics = dynamic(() => import("./Analytics"), { ssr: false });

export default function AnalyticsLoader() {
  return useAnalyticsEnabled() ? <Analytics /> : null;
}
