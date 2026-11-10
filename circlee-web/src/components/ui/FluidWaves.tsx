"use client";

import React from "react";

interface FluidWavesProps {
  className?: string;
}

export function FluidWaves({ className = "" }: FluidWavesProps) {
  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto min-h-[180px] max-h-[380px] object-cover animate-wave"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Main Circlee sunset fluid gradient */}
          <linearGradient id="waveGradBack" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#7C3AED" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#C026D3" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EA580C" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="waveGradMid" x1="0%" y1="30%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="28%" stopColor="#8B5CF6" />
            <stop offset="55%" stopColor="#D946EF" />
            <stop offset="85%" stopColor="#FF7A35" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>

          <linearGradient id="waveGradFront" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="35%" stopColor="#A855F7" />
            <stop offset="70%" stopColor="#EC4899" />
            <stop offset="90%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#FF7A35" />
          </linearGradient>

          <radialGradient
            id="waveHighlight"
            cx="50%"
            cy="0%"
            r="70%"
            fx="50%"
            fy="0%"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Back wave layer */}
        <path
          d="M0 240C240 160 480 300 720 210C960 120 1200 260 1440 180V380H0V240Z"
          fill="url(#waveGradBack)"
          opacity="0.65"
        />

        {/* Middle wave layer */}
        <path
          d="M0 200C220 290 460 140 700 230C940 320 1180 180 1440 250V380H0V200Z"
          fill="url(#waveGradMid)"
          opacity="0.9"
        />

        {/* Front wave ribbon with smooth organic crests */}
        <path
          d="M0 160C260 80 500 270 760 180C1020 90 1260 220 1440 140V380H0V160Z"
          fill="url(#waveGradFront)"
        />

        {/* Soft specular crest sheen */}
        <path
          d="M0 160C260 80 500 270 760 180C1020 90 1260 220 1440 140V190C1260 270 1020 140 760 230C500 320 260 130 0 210V160Z"
          fill="url(#waveHighlight)"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
