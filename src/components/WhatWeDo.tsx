"use client";

import SectionWrapper from "./SectionWrapper";
import ProductCard from "./ProductCard";
import { useTheme } from "@/context/VariantContext";

export default function WhatWeDo() {
  const { theme } = useTheme();

  const products = [
    {
      title: "Mono-Gastric Animals",
      description:
        "Eco-friendly concepts that promote health and productivity in poultry and swine through nature-derived functional feed additives.",
      link: "#",
      imageSrc: "/images/product-mono.png",
    },
    {
      title: "Ruminants",
      description:
        "Innovative bio-active concepts that focus on health, increase milk yield and quality in cattle through targeted nutrition.",
      link: "#",
      imageSrc: "/images/product-rumi.png",
    },
    {
      title: "Value Addition to Feed Ingredients",
      description:
        "Feed Additives concepts for multiple species designed for better growth and feed conversion ratios through enhanced nutrition.",
      link: "#",
      imageSrc: "/images/product-value.png",
    },
  ];

  return (
    <SectionWrapper id="what-we-do" className={`py-24 lg:py-32 ${theme.productsSectionBg}`}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <span className={`${theme.cardTagline} text-base lg:text-lg font-semibold tracking-widest uppercase`}>
            What We&apos;re Doing
          </span>
          <h2 className={`font-heading text-4xl lg:text-5xl mt-3 leading-tight ${theme.cardTitle}`}>
            Our Concepts
          </h2>
          <div className={`w-12 h-1 mx-auto mt-4 ${theme.cardTagline.replace("text-", "bg-").replace("hover:opacity-80", "")}`} />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <ProductCard key={product.title} {...product} index={i} />
          ))}
        </div>
        </div>
    </SectionWrapper>
  );
}
