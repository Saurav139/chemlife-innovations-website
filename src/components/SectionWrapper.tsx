"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { REVEAL_VIEWPORT } from "@/lib/reveal";

interface Props {
  children: ReactNode;
  className?: string;
  id?: string;
}

const variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SectionWrapper({ children, className = "", id }: Props) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.section>
  );
}
