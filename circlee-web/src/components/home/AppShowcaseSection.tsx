"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Download, Sparkles, Smartphone, ChevronRight } from "lucide-react";
import { PhoneMockup } from "../ui/PhoneMockup";

const APK_URL = "https://expo.dev/artifacts/eas/dD5MZWw738FxZxkomyF67SbQSBKkRLv-jFXRERfbRsA.apk";

export function AppShowcaseSection() {
  const [activeDevice, setActiveDevice] = useState<number>(1);

  const devices = [
    {
      title: "Welcome Experience",
      tag: "Onboarding",
      subtitle: "Effortless, secure Google authentication in seconds.",
      image: "/assets/screens/welcome.jpg",
    },
    {
      title: "Home Feed Stream",
      tag: "Live Social Feed",
      subtitle: "Full-bleed chronological updates with real-time comments & likes.",
      image: "/assets/screens/home_feed.jpg",
      featured: true,
    },
    {
      title: "Explore & Circles",
      tag: "Discovery Engine",
      subtitle: "Uncover trending hashtags, creator circles, and topics without ads.",
      image: "/assets/screens/explore.jpg",
    },
    {
      title: "Profile & Identity",
      tag: "Verified Circle",
      subtitle: "Expressive bio, avatar, and live online presence indicators.",
      image: "/assets/screens/auth-hero.png",
    },
  ];

  return (
    <section id="showcase" className="w-full py-24 sm:py-32 bg-[#050508] border-t border-[#1F1F2B] relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8B5CF6]/15 via-[#D946EF]/5 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Pavilion Style with Avatar Group) */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#14141C] border border-[#272733] text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider">
            Mobile Interface Architecture
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white font-display leading-tight">
              To the genuine, <br />
              <span className="inline-flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                {/* 3 Circular Avatar Badges */}
                <span className="inline-flex items-center -space-x-2 py-0.5 px-2 bg-[#14141C] border border-[#272733] rounded-full">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] border-2 border-black inline-block" />
                  <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF] border-2 border-black inline-block" />
                  <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF7A35] to-[#F59E0B] border-2 border-black inline-block" />
                </span>
                <span>people-centric</span>
              </span>{" "}
              social circle.
            </h2>
            <p className="text-base sm:text-lg text-[#A5A0B2] max-w-2xl mx-auto leading-relaxed">
              Real screenshots from the native Circlee Android application. Designed with high-contrast OLED black themes and fluent gesture responses.
            </p>
          </div>
        </div>

        {/* Floating 3D Geometric Accents (Matching Pavilion reference style) */}
        <div className="relative">
          {/* Left Floating Sphere */}
          <div
            className="hidden lg:block absolute -top-8 left-16 w-16 h-16 rounded-full bg-gradient-to-br from-[#2E2E3A] via-[#12121A] to-black border border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.3)] animate-float"
            aria-hidden="true"
          >
            <div className="w-3 h-3 rounded-full bg-[#8B5CF6]/50 blur-[2px] m-3" />
          </div>

          {/* Right Floating Prism/Cube */}
          <div
            className="hidden lg:block absolute top-12 right-20 w-14 h-14 rounded-2xl rotate-45 bg-gradient-to-tr from-[#1A1A24] to-[#2E2E3A] border border-white/10 shadow-[0_0_30px_rgba(255,122,53,0.25)] animate-float"
            style={{ animationDelay: "2s" }}
            aria-hidden="true"
          />

          {/* Multi-Device Horizontal Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto pt-6">
            
            {/* Device 1 (Left): Welcome Screen */}
            <div
              onClick={() => setActiveDevice(0)}
              className={`cursor-pointer transition-all duration-500 rounded-3xl p-4 bg-[#0D0D12] border ${
                activeDevice === 0 ? "border-[#8B5CF6] shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]" : "border-[#272733] opacity-80 hover:opacity-100"
              }`}
            >
              <div className="text-center mb-4">
                <span className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider block">
                  {devices[0].tag}
                </span>
                <h4 className="text-base font-bold text-white mt-1">
                  {devices[0].title}
                </h4>
              </div>
              <div className="transform hover:scale-[1.02] transition-transform">
                <PhoneMockup imageSrc={devices[0].image} alt={devices[0].title} />
              </div>
            </div>

            {/* Device 2 (Center Hero): Home Feed Stream */}
            <div
              onClick={() => setActiveDevice(1)}
              className={`cursor-pointer transition-all duration-500 rounded-3xl p-4 sm:p-6 bg-gradient-to-b from-[#14141C] to-[#0D0D12] border ${
                activeDevice === 1 ? "border-[#D946EF] shadow-[0_0_40px_-5px_rgba(217,70,239,0.35)] scale-105" : "border-[#272733]"
              } z-20`}
            >
              <div className="text-center mb-4">
                <span className="text-xs font-semibold text-[#D946EF] uppercase tracking-wider block">
                  {devices[1].tag}
                </span>
                <h4 className="text-lg font-bold text-white mt-1">
                  {devices[1].title}
                </h4>
              </div>
              <div className="transform hover:scale-[1.02] transition-transform">
                <PhoneMockup imageSrc={devices[1].image} alt={devices[1].title} priority />
              </div>
            </div>

            {/* Device 3 (Right): Explore & Circles */}
            <div
              onClick={() => setActiveDevice(2)}
              className={`cursor-pointer transition-all duration-500 rounded-3xl p-4 bg-[#0D0D12] border ${
                activeDevice === 2 ? "border-[#FF7A35] shadow-[0_0_30px_-5px_rgba(255,122,53,0.3)]" : "border-[#272733] opacity-80 hover:opacity-100"
              }`}
            >
              <div className="text-center mb-4">
                <span className="text-xs font-semibold text-[#FF7A35] uppercase tracking-wider block">
                  {devices[2].tag}
                </span>
                <h4 className="text-base font-bold text-white mt-1">
                  {devices[2].title}
                </h4>
              </div>
              <div className="transform hover:scale-[1.02] transition-transform">
                <PhoneMockup imageSrc={devices[2].image} alt={devices[2].title} />
              </div>
            </div>

          </div>

          {/* Bottom Callout & Direct Download Button */}
          <div className="mt-16 text-center space-y-4">
            <a
              href={APK_URL}
              download="circlee.apk"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white bg-circlee-gradient hover:opacity-95 transition-all shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              <span>Download Direct APK (Production Build)</span>
            </a>
            <p className="text-xs text-[#716C82]">
              Direct download from Expo EAS • Safe & verified package • Size ~120 MB
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
