"use client";

import { MotionConfig } from "framer-motion";
import { VariantProvider } from "@/context/VariantContext";
import Header from "@/components/Header";
import HeroVariantA from "@/components/HeroVariants/VariantA";
import TrustBar from "@/components/TrustBar";
import ProductPathways from "@/components/ProductPathways";
import WhyChemLife from "@/components/WhyChemLife";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import HowWeDo from "@/components/HowWeDo";
import AwardsRecognition from "@/components/AwardsRecognition";
import WhoWeAre from "@/components/WhoWeAre";
import SocialResponsibilities from "@/components/SocialResponsibilities";
import LifeAtChemLife from "@/components/LifeAtChemLife";
import HomeFaq from "@/components/HomeFaq";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";
import SiteSearch from "@/components/SiteSearch";

// The homepage is ordered the way a buyer decides: who else buys (the logo strip), what to buy (products by
// species), why to trust it (proof, partners' words, process, awards), who we are, and finally how to get in touch.
export default function Home() {
  return (
    <VariantProvider>
      <Header />
      <MotionConfig reducedMotion="user">
        <main id="main" tabIndex={-1}>
          <HeroVariantA />
          <TrustBar />
          <ProductPathways />
          <WhyChemLife />
          <TestimonialCarousel />
          <HowWeDo />
          <AwardsRecognition />
          <WhoWeAre />
          <SocialResponsibilities />
          <LifeAtChemLife />
          <HomeFaq />
          <FinalCta />
        </main>
      </MotionConfig>
      <Footer />
      <SiteSearch />
    </VariantProvider>
  );
}
