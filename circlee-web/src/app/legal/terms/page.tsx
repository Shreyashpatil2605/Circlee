import React from "react";

export const metadata = {
  title: "Terms of Service — Circlee",
  description: "Circlee Terms of Service and user conduct guidelines.",
};

export default function TermsOfServicePage() {
  return (
    <div className="w-full bg-black py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-white mb-2">
            Terms of Service
          </h1>
          <p className="text-xs text-[#716C82]">Last updated: November 2026</p>
        </div>

        <div className="space-y-6 text-sm text-[#A5A0B2] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Circlee mobile application or website, you agree to comply with and be bound by these Terms of Service. If you do not agree, do not use our services.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. User Conduct & Content Standards</h2>
            <p>
              You agree not to post abusive, illegal, harassing, or harmful content. Circlee reserves the right to suspend or terminate accounts that violate community safety or engage in spamming, harassment, or unauthorized automated activity.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Intellectual Property</h2>
            <p>
              You retain copyright ownership of your posts, comments, and media. By posting on Circlee, you grant Circlee a non-exclusive license to host, display, and distribute your content strictly within the application according to your privacy settings.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
