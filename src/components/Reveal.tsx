"use client";

import { MotionConfig, motion } from "framer-motion";
import type { ReactNode } from "react";

/** Rises into place the first time it scrolls into view. A section gives its parts rising `order`s (heading 0,
 *  text 1, picture 2) so they arrive one after another. With "reduce motion" on, it only fades. */
export default function Reveal({ children, order = 0, className, as = "div" }: {
  children: ReactNode;
  order?: number;
  className?: string;
  as?: "div" | "li";
}) {
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <MotionConfig reducedMotion="user">
      <Tag
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: order * 0.08, ease: [0.25, 0.1, 0, 1] }}
        // Shown at once, without waiting for the scroll, for visitors who ask for less motion.
        className={`motion-reduce:!opacity-100 motion-reduce:!transform-none ${className ?? ""}`}
      >
        {children}
      </Tag>
    </MotionConfig>
  );
}
