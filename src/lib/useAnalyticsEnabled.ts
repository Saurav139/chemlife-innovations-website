"use client";

import { useEffect, useState } from "react";
import { GA_ID } from "@/lib/analytics";
import { isLiveHost } from "@/lib/seo";

/** True on the live site once the page has loaded. False everywhere else (staging, localhost) and when no GA ID is set. */
export function useAnalyticsEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => setEnabled(Boolean(GA_ID) && isLiveHost(location.host)), []);
  return enabled;
}
