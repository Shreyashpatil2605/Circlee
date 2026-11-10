import React from "react";

export const metadata = {
  title: "Community Guidelines — Circlee",
  description: "Circlee Community Guidelines for genuine, safe interactions.",
};

export default function GuidelinesPage() {
  return (
    <div className="w-full bg-black py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-white mb-2">
            Community Guidelines
          </h1>
          <p className="text-xs text-[#716C82]">Last updated: November 2026</p>
        </div>

        <div className="space-y-6 text-sm text-[#A5A0B2] leading-relaxed">
          <p>
            Circlee is designed to be a respectful community. Treat others with dignity, respect private circle boundaries, and refrain from spam, hate speech, or impersonation.
          </p>
        </div>
      </div>
    </div>
  );
}
