import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Download, Github, Mail, Bug } from "lucide-react";

const APK_URL = "https://expo.dev/artifacts/eas/dD5MZWw738FxZxkomyF67SbQSBKkRLv-jFXRERfbRsA.apk";
const GITHUB_REPO = "https://github.com/Shreyashpatil2605/Circlee";
const GITHUB_ISSUES = "https://github.com/Shreyashpatil2605/Circlee/issues/";
const SUPPORT_EMAIL = "shreyashpatil2605@gmail.com";

export function Footer() {
  return (
    <footer className="w-full bg-[#07070A] border-t border-[#272733]/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-[#1F1F2B]">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                <Image
                  src="/assets/circlee-symbol.png"
                  alt="Circlee Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-2xl text-white font-display">
                Circlee
              </span>
            </Link>
            <p className="text-sm text-[#A5A0B2] max-w-sm leading-relaxed">
              The CIRCLEE. Connecting to People. Build genuine circles, share your raw moments, and experience real-time connections that matter.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={APK_URL}
                download="circlee.apk"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-circlee-gradient shadow-sm hover:opacity-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Android APK</span>
              </a>
              <a
                href={GITHUB_REPO}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-[#A5A0B2] bg-[#14141C] border border-[#272733] hover:text-white"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-[#A5A0B2]">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <a
                  href={APK_URL}
                  download="circlee.apk"
                  className="hover:text-white transition-colors text-white font-medium"
                >
                  Download Android APK
                </a>
              </li>
              <li>
                <Link href="/download" className="hover:text-white transition-colors">
                  All Platforms & APK
                </Link>
              </li>
              <li>
                <span className="text-[#716C82] cursor-not-allowed flex items-center gap-1.5">
                  <span>Web Version</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Coming Soon
                  </span>
                </span>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Circlee
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Support
            </h4>
            <ul className="space-y-2 text-sm text-[#A5A0B2]">
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Circlee%20General%20Support`}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span>General Support</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Circlee%20Bug%20Report`}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Bug className="w-3.5 h-3.5 text-[#FF7A35]" />
                  <span>Bug Reports</span>
                </a>
              </li>
              <li>
                <a
                  href={GITHUB_ISSUES}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5 text-[#D946EF]" />
                  <span>GitHub Issues</span>
                </a>
              </li>
              <li>
                <Link href="/contact#faq" className="hover:text-white transition-colors">
                  Frequently Asked
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white tracking-wider uppercase">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-[#A5A0B2]">
              <li>
                <Link href="/legal/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies" className="hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/guidelines" className="hover:text-white transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#716C82]">
          <p>© {new Date().getFullYear()} Circlee Social Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Connect. Share. Belong.</span>
            <span>•</span>
            <span>Created by Shreyash Patil</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
