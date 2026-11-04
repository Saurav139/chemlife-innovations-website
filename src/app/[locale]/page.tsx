"use client";

import { useState } from "react";
import { VariantProvider } from "@/context/VariantContext";
import Header from "@/components/Header";
import HeroVariantA from "@/components/HeroVariants/VariantA";
import WhoWeAre from "@/components/WhoWeAre";
import FlagshipProducts from "@/components/FlagshipProducts";

import HowWeDo from "@/components/HowWeDo";
import LifeAtChemLife from "@/components/LifeAtChemLife";
import AwardsRecognition from "@/components/AwardsRecognition";
import ClientMarquee from "@/components/ClientMarquee";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import SocialResponsibilities from "@/components/SocialResponsibilities";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";

export default function Home() {
  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1}>
        <HeroVariantA />
        {/* A buyer's story first (who, what, how, proof), then the people: CSR and life at ChemLife. */}
        <WhoWeAre />
        <FlagshipProducts />
        <HowWeDo />
        <AwardsRecognition />
        <ClientMarquee />
        <TestimonialCarousel />
        <SocialResponsibilities />
        <LifeAtChemLife />
      </main>
      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
