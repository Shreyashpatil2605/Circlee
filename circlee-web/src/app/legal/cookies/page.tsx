import React from "react";

export const metadata = {
  title: "Cookie Policy — Circlee",
  description: "Circlee Cookie and local storage policy.",
};

export default function CookiePolicyPage() {
  return (
    <div className="w-full bg-black py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-white mb-2">
            Cookie Policy
          </h1>
          <p className="text-xs text-[#716C82]">Last updated: November 2026</p>
        </div>

        <div className="space-y-6 text-sm text-[#A5A0B2] leading-relaxed">
          <p>
            Circlee uses essential cookies and local browser storage strictly required for user authentication, session security, and theme preferences. We do not use third-party advertising tracking cookies.
          </p>
        </div>
      </div>
    </div>
  );
}
