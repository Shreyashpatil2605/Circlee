import React from "react";

export const metadata = {
  title: "Privacy Policy — Circlee",
  description: "Circlee user privacy and data protection policies.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full bg-black py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        <div>
          <h1 className="text-3xl sm:text-5xl font-bold font-display text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#716C82]">Last updated: November 2026</p>
        </div>

        <div className="space-y-6 text-sm text-[#A5A0B2] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              Circlee collects account information necessary to create and authenticate your profile (such as name, email, username, and profile picture provided through Clerk authentication). We store content you voluntarily share, including posts, text comments, likes, and voice audio messages.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Real-Time Data & Chat Storage</h2>
            <p>
              Direct messages and group conversations are processed via our Convex cloud database to enable instant delivery, typing indicators, and read receipts. Message data is restricted strictly to active participants in each conversation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Third-Party Infrastructure</h2>
            <p>
              We utilize trusted cloud infrastructure partners including Clerk (Identity & Authentication), Convex (Real-time Database), and Cloudinary (Media CDN). We never sell your personal information or behavioural browsing history to commercial data brokers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. User Rights & Account Deletion</h2>
            <p>
              You maintain full ownership of your data. You may update your profile or delete your account at any time through application settings or by contacting privacy@circlee.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
