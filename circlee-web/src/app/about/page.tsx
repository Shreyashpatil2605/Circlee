import React from "react";
import { PhilosophySection } from "@/components/home/PhilosophySection";
import Image from "next/image";

export const metadata = {
  title: "About Us — Circlee",
  description: "Learn about the mission, values, and community behind Circlee.",
};

export default function AboutPage() {
  return (
    <div className="w-full bg-black py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Image
            src="/assets/circlee-symbol.png"
            alt="Circlee"
            width={64}
            height={64}
            className="object-contain"
          />
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold font-display text-white">
          Every Connection Starts Somewhere.
        </h1>
        <p className="text-lg sm:text-xl text-[#A5A0B2] leading-relaxed max-w-2xl mx-auto">
          Circlee is a community-first social platform built for authentic human connection. We unite real-time messaging, expressive posts, and private circles in a clean, ad-free environment.
        </p>
      </div>

      <div className="mt-12">
        <PhilosophySection />
      </div>
    </div>
  );
}
