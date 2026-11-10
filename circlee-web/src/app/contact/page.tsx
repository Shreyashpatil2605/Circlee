import React from "react";
import { Mail, Bug, Github, HelpCircle } from "lucide-react";

const SUPPORT_EMAIL = "shreyashpatil2605@gmail.com";
const GITHUB_REPO = "https://github.com/Shreyashpatil2605/Circlee";
const GITHUB_ISSUES = "https://github.com/Shreyashpatil2605/Circlee/issues/";

export const metadata = {
  title: "Contact & Support — Circlee",
  description: "Get in touch with the Circlee team, submit bug reports, or view GitHub issues.",
};

export default function ContactPage() {
  return (
    <div className="w-full bg-black py-16 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#14141C] border border-[#272733] text-xs font-semibold text-[#D946EF] uppercase tracking-wider">
            Help & Developer Channels
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-display text-white">
            We’re Here to Help.
          </h1>
          <p className="text-base sm:text-lg text-[#A5A0B2] max-w-xl mx-auto">
            Contact the developer directly or file issues on our official GitHub repository.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Support */}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Circlee%20General%20Support`}
            className="group rounded-2xl bg-[#0D0D12] border border-[#272733] p-6 space-y-3 hover:border-[#8B5CF6]/60 transition-all block"
          >
            <div className="w-10 h-10 rounded-xl bg-[#14141C] border border-[#272733] flex items-center justify-center text-[#8B5CF6] group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-[#8B5CF6] transition-colors">
              General Support
            </h3>
            <p className="text-xs text-[#A5A0B2] break-all">{SUPPORT_EMAIL}</p>
          </a>

          {/* Bug Reports */}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Circlee%20Bug%20Report`}
            className="group rounded-2xl bg-[#0D0D12] border border-[#272733] p-6 space-y-3 hover:border-[#FF7A35]/60 transition-all block"
          >
            <div className="w-10 h-10 rounded-xl bg-[#14141C] border border-[#272733] flex items-center justify-center text-[#FF7A35] group-hover:scale-105 transition-transform">
              <Bug className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-[#FF7A35] transition-colors">
              Bug Reports
            </h3>
            <p className="text-xs text-[#A5A0B2] break-all">{SUPPORT_EMAIL}</p>
          </a>

          {/* GitHub Issues */}
          <a
            href={GITHUB_ISSUES}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl bg-[#0D0D12] border border-[#272733] p-6 space-y-3 hover:border-[#D946EF]/60 transition-all block"
          >
            <div className="w-10 h-10 rounded-xl bg-[#14141C] border border-[#272733] flex items-center justify-center text-[#D946EF] group-hover:scale-105 transition-transform">
              <Github className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-[#D946EF] transition-colors">
              GitHub Issues
            </h3>
            <p className="text-xs text-[#A5A0B2]">Shreyashpatil2605/Circlee</p>
          </a>

        </div>

        {/* GitHub Repository Box */}
        <div className="rounded-2xl bg-gradient-to-r from-[#14141C] via-[#0D0D12] to-[#14141C] border border-[#272733] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider">
              Open Source Ecosystem
            </div>
            <div className="text-lg font-bold text-white">
              Circlee Official Repository
            </div>
            <div className="text-xs text-[#A5A0B2]">
              Track commits, roadmaps, and submit community pull requests.
            </div>
          </div>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-[#14141C] border border-[#272733] hover:border-white transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Visit GitHub Repo</span>
          </a>
        </div>

        {/* FAQs */}
        <div id="faq" className="space-y-6 pt-8 border-t border-[#1F1F2B]">
          <h2 className="text-2xl font-bold text-white font-display text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {[
              {
                q: "Where can I download the live Circlee app?",
                a: "You can download the production Android APK directly from our Download page via the Expo EAS artifact link. It installs directly on Android 10.0+ devices.",
              },
              {
                q: "Is the web application live yet?",
                a: "Not yet! The full browser-based web application is currently in active development. Please download the Android APK to access your live account, posts, and real-time chat.",
              },
              {
                q: "How can I report a bug or request a feature?",
                a: "You can email shreyashpatil2605@gmail.com directly or open an issue on our official GitHub repository at github.com/Shreyashpatil2605/Circlee/issues.",
              },
            ].map((faq, i) => (
              <div key={i} className="rounded-xl bg-[#0D0D12] border border-[#272733] p-6 space-y-2">
                <div className="text-base font-semibold text-white">{faq.q}</div>
                <div className="text-sm text-[#A5A0B2] leading-relaxed">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
