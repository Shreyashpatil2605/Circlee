import React from "react";
import Link from "next/link";
import { Download, Smartphone, CheckCircle2, ShieldCheck, Github } from "lucide-react";

const APK_URL = "https://expo.dev/artifacts/eas/dD5MZWw738FxZxkomyF67SbQSBKkRLv-jFXRERfbRsA.apk";
const GITHUB_REPO = "https://github.com/Shreyashpatil2605/Circlee";

export function DownloadCTASection() {
  return (
    <section className="w-full py-24 sm:py-32 bg-[#000000] border-t border-[#1F1F2B] relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#D946EF]/15 via-[#8B5CF6]/5 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="rounded-3xl bg-gradient-to-b from-[#14141C] to-[#0D0D12] border border-[#272733] p-8 sm:p-14 lg:p-20 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/50 border border-[#272733] text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider mb-6">
            Instant Mobile Installation
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold text-white font-display mb-6 leading-tight">
            Ready to experience your circle in real time?
          </h2>

          <p className="text-base sm:text-lg text-[#A5A0B2] max-w-xl mx-auto mb-10 leading-relaxed">
            Download the official Circlee Android APK directly to your device and start forming your circle today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={APK_URL}
              download="circlee.apk"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white bg-circlee-gradient hover:opacity-95 transition-all shadow-[0_0_35px_rgba(217,70,239,0.45)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              <span>Download Android APK</span>
            </a>

            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-base font-semibold text-white bg-[#14141C] border border-[#272733] hover:border-[#8B5CF6]/60 transition-all"
            >
              <Github className="w-5 h-5 text-[#8B5CF6]" />
              <span>GitHub Repository</span>
            </a>
          </div>

          {/* Platform status cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 pt-10 border-t border-[#1F1F2B] text-left text-xs">
            <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20">
              <div className="font-semibold text-white flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Android APK</span>
              </div>
              <div className="text-[#A5A0B2]">Live Production EAS Build</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-[#272733]/60">
              <div className="font-semibold text-white flex items-center gap-2 mb-1">
                <Smartphone className="w-4 h-4 text-[#8B5CF6]" />
                <span>Apple iOS</span>
              </div>
              <div className="text-[#716C82]">TestFlight In Preparation</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-[#272733]/60">
              <div className="font-semibold text-white flex items-center gap-2 mb-1">
                <ShieldCheck className="w-4 h-4 text-[#D946EF]" />
                <span>Web Application</span>
              </div>
              <div className="text-[#716C82]">Coming Soon in Next Phase</div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
