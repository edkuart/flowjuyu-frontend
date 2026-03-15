"use client";

import React from "react";
import "@/styles/sell-page.css";

import HeroSell        from "@/components/sell/HeroSell";
import CTASection      from "@/components/sell/CTASection";
import BenefitsSection from "@/components/sell/BenefitsSection";
import HowItWorks      from "@/components/sell/HowItWorks";
import CulturalMission from "@/components/sell/CulturalMission";
import SellerFAQ       from "@/components/sell/SellerFAQ";
import ContactSection from "@/components/sell/ContactSection";

export default function SellPage() {
  return (
    <main style={{ background: "#f6f2ea" }}>
      <HeroSell />
      <BenefitsSection />
      <HowItWorks />
      <CulturalMission />
      <CTASection />
      <SellerFAQ />
      <ContactSection />
    </main>
  );
}