"use client";

import { MotionConfig } from "framer-motion";
import { VariantProvider } from "@/context/VariantContext";
import Header from "@/components/Header";
import HeroVariantA from "@/components/HeroVariants/VariantA";
import WhoWeAre from "@/components/WhoWeAre";

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
      <MotionConfig reducedMotion="user">
        <main id="main" tabIndex={-1}>
          <HeroVariantA />
          <WhoWeAre />
          <HowWeDo />
          <AwardsRecognition />
          <LifeAtChemLife />
          <ClientMarquee />
          <TestimonialCarousel />
          <SocialResponsibilities />
        </main>
      </MotionConfig>
      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
