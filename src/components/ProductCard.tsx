"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/context/VariantContext";

interface Props {
  title: string;
  description: string;
  link: string;
  imageSrc: string;
  index: number;
}

export default function ProductCard({ title, description, link, imageSrc, index }: Props) {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.25, 0.1, 0, 1] }}
      className={`group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${theme.cardBg} ${theme.cardHoverBorder}`}
    >
      <div className="relative h-48 overflow-hidden">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${theme.cardImageOverlay} to-transparent`} />
      </div>
      <div className="p-8">
        <h3 className={`font-heading text-xl mb-3 ${theme.cardTitle}`}>{title}</h3>
        <p className={`text-sm leading-relaxed mb-6 ${theme.cardText}`}>{description}</p>
        <a
          href={link}
          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${theme.cardTagline} hover:opacity-80`}
        >
          Know More
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
