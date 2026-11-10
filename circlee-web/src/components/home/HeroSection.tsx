"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, ArrowRight, Smartphone, CheckCircle2, Radio } from "lucide-react";
import { PhoneMockup } from "../ui/PhoneMockup";
import { FluidWaves } from "../ui/FluidWaves";

const APK_URL = "https://expo.dev/artifacts/eas/dD5MZWw738FxZxkomyF67SbQSBKkRLv-jFXRERfbRsA.apk";

export function HeroSection() {
  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const screens = [
    {
      id: "welcome",
      label: "✨ Welcome",
      image: "/assets/screens/welcome.jpg",
      badge: "Onboarding Flow",
    },
    {
      id: "feed",
      label: "🔥 Live Feed",
      image: "/assets/screens/home_feed.jpg",
      badge: "Chronological Stream",
    },
    {
      id: "explore",
      label: "🔍 Explore",
      image: "/assets/screens/explore.jpg",
      badge: "Discover Circles",
    },
  ];

  // Auto-advance screen every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveScreenIndex((prev) => (prev + 1) % screens.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, screens.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const currentScreen = screens[activeScreenIndex];

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative w-full pt-8 sm:pt-16 pb-0 overflow-hidden bg-black select-none"
    >
      {/* Interactive Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0 opacity-60"
        style={{
          background: `radial-gradient(700px circle at ${mousePos.x || "50%"}px ${mousePos.y || "30%"}px, rgba(139, 92, 246, 0.18), transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Background Radial Violet & Orange Keynote Lights */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#8B5CF6]/20 via-[#D946EF]/5 to-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-[#FF7A35]/10 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        
        {/* Main Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            


            {/* Headline with 4-Point Star Accents & Capsule Badge */}
            <div className="relative pt-1">
              {/* Top Star Accent */}
              <span className="inline-block text-[#8B5CF6] text-xl sm:text-3xl mr-2 animate-pulse select-none align-middle">
                ✦
              </span>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white font-display leading-[1.08] inline">
                Creating Circles{" "}
                <span className="inline-flex align-middle mx-2 my-1 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-circlee-gradient shadow-[0_0_30px_rgba(217,70,239,0.55)] group cursor-pointer hover:scale-105 transition-transform">
                  <span className="w-8 sm:w-12 h-3 sm:h-4 rounded-full bg-white/25 backdrop-blur-sm animate-pulse" />
                </span>
                <br />
                With Your Friends
              </h1>

              {/* Bottom Star Accent */}
              <div className="pt-2">
                <span className="inline-block text-[#FF7A35] text-lg sm:text-2xl select-none animate-pulse" style={{ animationDelay: "1s" }}>
                  ✦
                </span>
              </div>
            </div>

            {/* Subtitle & Philosophy */}
            <div className="space-y-3 max-w-xl mx-auto lg:mx-0">
              <p className="text-lg sm:text-2xl text-[#E2E0EB] font-sans font-normal leading-relaxed">
                Find your friends and <strong className="text-white font-semibold">form a circle</strong> with them and <strong className="text-white font-semibold">expand it</strong>.
              </p>
              <p className="text-sm sm:text-base text-[#A5A0B2] leading-relaxed">
                The CIRCLEE. Connecting to People. Real-time WebSocket conversations, authentic media sharing, and close-knit community circles without algorithmic distortion.
              </p>
            </div>

            {/* CTA Button Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href={APK_URL}
                download="circlee.apk"
                className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white bg-circlee-gradient hover:opacity-95 transition-all shadow-[0_0_35px_-5px_rgba(217,70,239,0.5)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                <span>Download Android App</span>
              </a>

              <Link
                href="#showcase"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white bg-[#14141C] border border-[#272733] hover:border-[#8B5CF6]/60 hover:bg-[#1A1A24] transition-all"
              >
                <span>View Screenshots</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#A5A0B2]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Direct APK Download Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#8B5CF6]" />
                <span>Android 10.0+ Verified</span>
              </div>
              <div className="flex items-center gap-2 text-[#716C82]">
                <span>Web & iOS in Development</span>
              </div>
            </div>

          </div>

          {/* Right Phone Showcase with Interactive Screen Switcher & Floating Badges */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="lg:col-span-5 relative flex flex-col items-center justify-center pt-4 lg:pt-0"
          >
            
            {/* Interactive Screen Switcher Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#14141C]/90 border border-[#272733] backdrop-blur-md mb-4 z-30 shadow-lg">
              {screens.map((screen, idx) => {
                const isActive = activeScreenIndex === idx;
                return (
                  <button
                    key={screen.id}
                    onClick={() => setActiveScreenIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-circlee-gradient text-white shadow-sm scale-105"
                        : "text-[#A5A0B2] hover:text-white"
                    }`}
                  >
                    {screen.label}
                  </button>
                );
              })}
            </div>

            {/* Phone Container with Ambient Violet Rim Glow */}
            <div className="relative">
              
              {/* Backlight Glow Blob */}
              <div
                className="absolute w-[380px] h-[380px] rounded-full bg-[#8B5CF6]/25 blur-[100px] pointer-events-none -top-10 -right-10"
                aria-hidden="true"
              />
              <div
                className="absolute w-[320px] h-[320px] rounded-full bg-[#FF7A35]/20 blur-[110px] pointer-events-none -bottom-10 -left-10"
                aria-hidden="true"
              />

              {/* Floating Badge 1: Top-Left Voice Note Pill (Floating Animation) */}
              <div className="hidden sm:flex absolute -top-4 -left-16 sm:-left-20 z-30 animate-float-slow items-center gap-3 p-3 rounded-2xl bg-[#0D0D12]/90 border border-[#8B5CF6]/40 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(139,92,246,0.3)]">
                <div className="w-8 h-8 rounded-full bg-circlee-gradient flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Radio className="w-4 h-4 text-white" />
                </div>
                <div className="text-left text-xs space-y-0.5 pr-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Voice Note</span>
                    <span className="text-[10px] text-[#D946EF]">0:14</span>
                  </div>
                  {/* Mini bouncing equalizer bars */}
                  <div className="flex items-center gap-1 h-3 pt-0.5">
                    <div className="w-0.5 rounded-full bg-[#D946EF] animate-bar-1" />
                    <div className="w-0.5 rounded-full bg-[#8B5CF6] animate-bar-2" />
                    <div className="w-0.5 rounded-full bg-[#FF7A35] animate-bar-3" />
                    <div className="w-0.5 rounded-full bg-[#3B82F6] animate-bar-4" />
                    <div className="w-0.5 rounded-full bg-[#D946EF] animate-bar-5" />
                  </div>
                </div>
              </div>

              {/* Floating Badge 2: Bottom-Right Member Circle Count (Reverse Float Animation) */}
              <div className="hidden sm:flex absolute bottom-12 -right-12 sm:-right-16 z-30 animate-float-reverse items-center gap-3 p-3 rounded-2xl bg-[#0D0D12]/90 border border-[#D946EF]/40 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(217,70,239,0.3)]">
                <div className="flex items-center -space-x-2">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] border border-black flex items-center justify-center text-[10px] font-bold text-white">
                    S
                  </span>
                  <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF] border border-black flex items-center justify-center text-[10px] font-bold text-white">
                    L
                  </span>
                  <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF7A35] to-[#F59E0B] border border-black flex items-center justify-center text-[10px] font-bold text-white">
                    M
                  </span>
                </div>
                <div className="text-left text-xs pr-1">
                  <div className="font-bold text-white">+42 joined</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Active in Circle</span>
                  </div>
                </div>
              </div>

              {/* 3D Smartphone Displaying Active Screen with Smooth Fade */}
              <div className="animate-float relative z-20">
                <PhoneMockup
                  key={currentScreen.image}
                  imageSrc={currentScreen.image}
                  alt={currentScreen.label}
                  priority
                />
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Smooth Fluid Wave Ribbon across lower boundary (Glow reference style) */}
      <div className="-mt-12 sm:-mt-20 relative z-10 pointer-events-none">
        <FluidWaves />
      </div>

    </section>
  );
}
