"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function LaunchGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // If the path is /launch, let the user load it
    if (pathname === "/launch") {
      setIsReady(true);
      return;
    }

    const isLaunched = localStorage.getItem("chemlife_launched") === "true";
    if (!isLaunched) {
      window.location.href = "/launch";
    } else {
      setIsReady(true);
    }
  }, [pathname]);

  // While checking, render a premium loading screen if not on /launch
  if (!isReady && pathname !== "/launch") {
    return (
      <div className="min-h-screen bg-[#305280] flex flex-col items-center justify-center text-white relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        </div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#E65C38] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-mono text-sm tracking-wider uppercase text-teal-400 animate-pulse">
            Connecting to ChemLife R&D Lab...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
