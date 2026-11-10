import React from "react";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { AppShowcaseSection } from "@/components/home/AppShowcaseSection";

export const metadata = {
  title: "Features — Circlee",
  description: "Explore the complete social feature suite of Circlee.",
};

export default function FeaturesPage() {
  return (
    <div className="w-full bg-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-8">
        <h1 className="text-4xl sm:text-6xl font-bold font-display text-white mb-4">
          All Features
        </h1>
        <p className="text-lg text-[#A5A0B2] max-w-2xl mx-auto">
          Explore real-time messaging, social feed, user circles, and discovery tools.
        </p>
      </div>
      <FeaturesSection />
      <AppShowcaseSection />
    </div>
  );
}
