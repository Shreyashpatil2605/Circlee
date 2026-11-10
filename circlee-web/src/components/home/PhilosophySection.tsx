"use client";

import React from "react";
import Image from "next/image";
import { Heart, Compass, Shield, Users, Radio, Lock, Sparkles } from "lucide-react";
import { SpotlightCard } from "../ui/SpotlightCard";

export function PhilosophySection() {
  const pillars = [
    {
      icon: Heart,
      title: "Connect Genuinely",
      gradient: "from-[#3B82F6] to-[#8B5CF6]",
      tag: "True Closeness",
      text: "We believe social networking should bring people closer together, not keep them scrolling endlessly in isolation. Circlee is engineered around private and semi-private circles where conversations stay personal.",
      microUi: (
        <div className="pt-4 flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] border-2 border-[#0D0D12] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              A
            </span>
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF] border-2 border-[#0D0D12] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              M
            </span>
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF7A35] to-[#F59E0B] border-2 border-[#0D0D12] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              S
            </span>
          </div>
          <span className="text-xs text-[#A5A0B2] font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Close Circles Only</span>
          </span>
        </div>
      ),
    },
    {
      icon: Compass,
      title: "Share Freely",
      gradient: "from-[#8B5CF6] to-[#D946EF]",
      tag: "Zero Pressure",
      text: "From spontaneous daily thoughts to rich photos and real-time voice notes, express yourself without the pressure of chasing follower vanity metrics or optimizing for automated content algorithms.",
      microUi: (
        <div className="pt-4 flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#14141C] border border-[#272733] text-white flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#D946EF]" />
            <span>Voice Audio Notes</span>
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#14141C] border border-[#272733] text-[#A5A0B2]">
            Rich Photos
          </span>
        </div>
      ),
    },
    {
      icon: Shield,
      title: "Belong Safely",
      gradient: "from-[#D946EF] to-[#FF7A35]",
      tag: "Complete Ownership",
      text: "Your privacy is paramount. With Clerk multi-factor authentication, end-to-end data validation, and complete user ownership of circles, your community remains a safe harbor.",
      microUi: (
        <div className="pt-4 flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clerk Protected</span>
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#14141C] border border-[#272733] text-[#A5A0B2]">
            Zero Ad Tracking
          </span>
        </div>
      ),
    },
  ];

  return (
    <section className="w-full py-24 sm:py-32 bg-[#07070A] border-t border-[#1F1F2B] relative overflow-hidden">
      
      {/* Background Ambient Violet Spotlight */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#8B5CF6]/15 via-transparent to-transparent pointer-events-none"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14141C] border border-[#272733] text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D946EF]" />
            <span>Brand Philosophy</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white font-display tracking-tight leading-tight">
            Every Connection Starts Somewhere.
          </h2>

          <p className="text-base sm:text-lg text-[#A5A0B2] leading-relaxed max-w-2xl mx-auto">
            Circlee was founded on a simple conviction: technology should serve human relationships, not exploit human attention.
          </p>
        </div>

        {/* 3 Pillars Bento Grid with Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <SpotlightCard
                key={idx}
                spotlightColor="rgba(168, 85, 247, 0.22)"
                className="p-8 sm:p-10 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="relative">
                      {/* Pulse Ring on Hover */}
                      <div className="absolute inset-0 rounded-2xl bg-[#8B5CF6]/20 blur-md group-hover:bg-[#D946EF]/30 transition-colors" />
                      <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-tr ${pillar.gradient} p-0.5 shadow-md`}>
                        <div className="w-full h-full bg-[#14141C] rounded-[14px] flex items-center justify-center text-white">
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#14141C] border border-[#272733] text-[#A5A0B2] font-semibold">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3 font-display">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-[#A5A0B2] leading-relaxed">
                    {pillar.text}
                  </p>
                </div>

                {/* Micro Visual */}
                <div className="pt-6 border-t border-[#1F1F2B] mt-6">
                  {pillar.microUi}
                </div>
              </SpotlightCard>
            );
          })}
        </div>

        {/* Radiant Visual Brand Statement Box */}
        <div className="mt-20 rounded-3xl bg-gradient-to-r from-[#14141C] via-[#0D0D12] to-[#14141C] border border-[#272733] p-8 sm:p-14 text-center max-w-4xl mx-auto space-y-6 shadow-2xl relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-colors">
          
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-40" />

          <div className="w-16 h-16 mx-auto flex items-center justify-center">
            <Image
              src="/assets/circlee-symbol.png"
              alt="Circlee Symbol"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>

          <blockquote className="text-xl sm:text-3xl font-display text-white leading-relaxed max-w-2xl mx-auto">
            “The CIRCLEE. Connecting to People. We don’t measure success by minutes trapped on a screen, but by the real relationships deepened through it.”
          </blockquote>

          <div className="inline-flex items-center gap-3 text-xs uppercase tracking-widest text-[#716C82] pt-2">
            <span>Connect</span>
            <span>•</span>
            <span>Share</span>
            <span>•</span>
            <span>Belong</span>
          </div>
        </div>

      </div>
    </section>
  );
}
