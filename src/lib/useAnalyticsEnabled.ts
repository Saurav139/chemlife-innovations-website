"use client";

import { useEffect, useState } from "react";
import { GA_ID } from "@/lib/analytics";
import { isStagingHost } from "@/lib/seo";

/** True on the live site once the page has loaded. False on staging and when no GA ID is set. */
export function useAnalyticsEnabled() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => setEnabled(Boolean(GA_ID) && !isStagingHost(location.host)), []);
  return enabled;
}
