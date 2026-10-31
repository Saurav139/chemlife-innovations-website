"use client";

import { useState } from "react";
import { VariantProvider } from "@/context/VariantContext";
import Header from "@/components/Header";
import HeroOpenSplit from "@/components/HeroOpenSplit";
import WhoWeAre from "@/components/WhoWeAre";

import HowWeDo from "@/components/HowWeDo";
import LifeAtChemLife from "@/components/LifeAtChemLife";
import AwardsRecognition from "@/components/AwardsRecognition";
import ClientMarquee from "@/components/ClientMarquee";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import SocialResponsibilities from "@/components/SocialResponsibilities";
import Footer from "@/components/Footer";
import ChatOverlay from "@/components/ChatOverlay";
import SiteSearch from "@/components/SiteSearch";

export default function Home() {
  return (
    <VariantProvider>
      <Header />
      <main id="main" tabIndex={-1}>
        <HeroOpenSplit />
        <WhoWeAre />
        <HowWeDo />
        <AwardsRecognition />
        <LifeAtChemLife />
        <ClientMarquee />
        <TestimonialCarousel />
        <SocialResponsibilities />
      </main>
      <Footer />
      <ChatOverlay />
      <SiteSearch />
    </VariantProvider>
  );
}
