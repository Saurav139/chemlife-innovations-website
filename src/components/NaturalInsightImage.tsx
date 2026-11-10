"use client";

import { useState } from "react";
import Image from "next/image";

/** Feed pictures arrive without dimensions. Use their decoded proportions and keep all edges visible while loading. */
export default function NaturalInsightImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const [measured, setMeasured] = useState<{ src: string; ratio: number } | null>(null);
  return <div
    className="relative w-full overflow-hidden rounded-xl border border-gray-200 bg-slate-100 select-none"
    style={{ aspectRatio: measured?.src === src ? measured.ratio : "1 / 1" }}
    data-image-layout="natural"
  >
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-contain"
      unoptimized={!(
        src.startsWith("/") ||
        src.startsWith("https://chemlifeinnovations.wordpress.com/wp-content/uploads/") ||
        src.startsWith("https://img.youtube.com/vi/")
      )}
      onLoad={({ currentTarget }) => {
        if (currentTarget.naturalWidth && currentTarget.naturalHeight) {
          setMeasured({ src, ratio: currentTarget.naturalWidth / currentTarget.naturalHeight });
        }
      }}
    />
  </div>;
}
