"use client";

import React from "react";
import Image from "next/image";

interface PhoneMockupProps {
  imageSrc: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function PhoneMockup({
  imageSrc,
  alt,
  priority = false,
  className = "",
}: PhoneMockupProps) {
  return (
    <div
      style={{ maxWidth: 360, width: "100%", aspectRatio: "9 / 19.2", position: "relative" }}
      className={`relative mx-auto w-[280px] sm:w-[320px] md:w-[360px] select-none ${className}`}
    >
      {/* Outer Metallic Titanium Chassis */}
      <div 
        style={{ position: "absolute", inset: 0 }}
        className="absolute inset-0 rounded-[48px] p-[10px] sm:p-[12px] bg-gradient-to-b from-[#2E2E3A] via-[#1A1A24] to-[#12121A] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_40px_-5px_rgba(139,92,246,0.18)] border border-[#3B3B4F]/80"
      >
        
        {/* Antenna band accents */}
        <div className="absolute top-[80px] -left-[1px] w-[2px] h-[6px] bg-[#3B3B4F]" />
        <div className="absolute top-[140px] -left-[1px] w-[2px] h-[6px] bg-[#3B3B4F]" />
        <div className="absolute top-[80px] -right-[1px] w-[2px] h-[6px] bg-[#3B3B4F]" />
        
        {/* Inner OLED Bezel */}
        <div 
          style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "38px" }}
          className="relative w-full h-full rounded-[38px] overflow-hidden bg-black border border-[#181822]"
        >
          
          {/* Authentic App Screenshot */}
          <div 
            style={{ position: "relative", width: "100%", height: "100%" }}
            className="relative w-full h-full"
          >
            <Image
              src={imageSrc}
              alt={alt}
              fill
              priority={priority}
              sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 360px"
              className="object-cover object-top"
            />
          </div>

          {/* Dynamic Island Pill Cutout */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[92px] sm:w-[104px] h-[24px] sm:h-[26px] bg-black rounded-full z-20 flex items-center justify-between px-3 border border-white/5 shadow-sm">
            {/* Front Camera Lens */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#0a0a14] border border-[#1c1c2e] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-[#182642]" />
            </div>
            {/* Ambient Sensor */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#0f0f18]" />
          </div>

          {/* Glass Specular Reflection Sweep */}
          <div
            className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent opacity-80"
            aria-hidden="true"
          />
          {/* Subtle Dynamic Light Sheen Sweep */}
          <div
            className="absolute -inset-full pointer-events-none z-10 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent rotate-45 animate-shimmer"
            style={{ animationDuration: "7s" }}
            aria-hidden="true"
          />

          {/* Bottom Home Indicator Bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-20" />
        </div>
      </div>
    </div>
  );
}
