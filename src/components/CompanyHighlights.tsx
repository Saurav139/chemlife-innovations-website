"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/VariantContext";

const stats = [
  { value: 30, suffix: "+", label: "Years of Research" },
  { value: 12, suffix: "+", label: "Products" },
  { value: 5, suffix: "+", label: "States Served" },
  { value: 7, suffix: "+", label: "Awards Won" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);
  const { theme } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1500;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={`font-heading text-4xl lg:text-5xl font-bold ${theme.highlightsCounterText}`}>
      {count}{suffix}
    </span>
  );
}

export default function CompanyHighlights() {
  const { theme } = useTheme();

  return (
    <section className={`${theme.highlightsBg} py-16 lg:py-20`}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <AnimatedCounter value={s.value} suffix={s.suffix} />
               <div className={`${theme.highlightsCounterLabel} text-sm mt-2 font-medium`}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
