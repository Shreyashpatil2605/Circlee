import React from "react";
import Link from "next/link";
import { Download, Smartphone, CheckCircle2, ShieldCheck, Github, HelpCircle, FileText } from "lucide-react";
import { PhoneMockup } from "@/components/ui/PhoneMockup";

const APK_URL = "https://expo.dev/artifacts/eas/dD5MZWw738FxZxkomyF67SbQSBKkRLv-jFXRERfbRsA.apk";
const GITHUB_REPO = "https://github.com/Shreyashpatil2605/Circlee";
const GITHUB_ISSUES = "https://github.com/Shreyashpatil2605/Circlee/issues/";

export const metadata = {
  title: "Download Circlee — Android APK",
  description: "Download the Circlee Android application directly (Production APK build).",
};

export default function DownloadPage() {
  return (
    <div className="w-full bg-black py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#14141C] border border-[#272733] text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider">
            Direct Installation Hub
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold font-display text-white">
            Download Circlee for Android
          </h1>
          <p className="text-base sm:text-lg text-[#A5A0B2]">
            Install the native Android release APK directly on your phone and start connecting with your people.
          </p>
        </div>

        {/* Primary Download Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-5xl mx-auto items-center">
          
          <div className="lg:col-span-7 rounded-3xl bg-[#0D0D12] border border-[#272733] p-8 sm:p-12 space-y-8 text-left">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#14141C] border border-[#272733] flex items-center justify-center text-[#FF7A35]">
                <Smartphone className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Live Build
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Circlee Android APK
              </h2>
              <p className="text-sm text-[#A5A0B2] leading-relaxed">
                Direct production APK package compiled via Expo EAS. Full support for Clerk authentication, Convex WebSocket chat, audio voice notes, and instant media feeds.
              </p>
            </div>

            {/* Build Specifications */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#14141C] border border-[#272733] text-xs text-[#A5A0B2]">
              <div>
                <span className="text-[#716C82] block">Version</span>
                <span className="font-semibold text-white">1.0.0 (Production)</span>
              </div>
              <div>
                <span className="text-[#716C82] block">Package Size</span>
                <span className="font-semibold text-white">~120 MB</span>
              </div>
              <div>
                <span className="text-[#716C82] block">OS Requirement</span>
                <span className="font-semibold text-white">Android 10.0+</span>
              </div>
              <div>
                <span className="text-[#716C82] block">Build Provider</span>
                <span className="font-semibold text-white">Expo EAS Artifacts</span>
              </div>
            </div>

            {/* Big Action Button */}
            <div className="space-y-3">
              <a
                href={APK_URL}
                download="circlee.apk"
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white bg-circlee-gradient hover:opacity-95 transition-all shadow-[0_0_30px_rgba(217,70,239,0.4)] hover:scale-[1.01]"
              >
                <Download className="w-5 h-5" />
                <span>Download Circlee APK (Direct Link)</span>
              </a>

              <p className="text-[11px] text-[#716C82] text-center">
                Artifact URL: expo.dev/artifacts/eas/dD5MZWw738FxZxkomyF67SbQSBKkRLv-jFXRERfbRsA.apk
              </p>
            </div>

            {/* Quick Steps */}
            <div className="pt-4 border-t border-[#1F1F2B] space-y-2 text-xs text-[#A5A0B2]">
              <div className="font-semibold text-white mb-1">How to Install on Android:</div>
              <div className="flex items-start gap-2">
                <span className="text-[#8B5CF6] font-bold">1.</span>
                <span>Tap the download button above to download the `.apk` file to your device.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#8B5CF6] font-bold">2.</span>
                <span>Open your Notifications or Downloads folder and tap the downloaded file.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#8B5CF6] font-bold">3.</span>
                <span>If prompted, enable &quot;Install from unknown sources&quot; in device settings to complete setup.</span>
              </div>
            </div>

          </div>

          {/* Right Phone Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <PhoneMockup
              imageSrc="/assets/screens/home_feed.jpg"
              alt="Circlee App Experience"
            />
          </div>

        </div>

        {/* Other Platforms Status */}
        <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-[#0D0D12] border border-[#272733] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#8B5CF6]" />
                <span>Apple iOS</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] font-semibold">
                Coming Soon
              </span>
            </div>
            <p className="text-xs text-[#A5A0B2] leading-relaxed">
              An iOS TestFlight build is currently being prepared for Apple iPhone users.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D0D12] border border-[#272733] space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#D946EF]" />
                <span>Web Application</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                In Development
              </span>
            </div>
            <p className="text-xs text-[#A5A0B2] leading-relaxed">
              Full browser desktop & tablet client currently in active engineering. Not web-supported yet — please use the Android app for the live experience.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
