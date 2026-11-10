"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

const APK_URL = "https://expo.dev/artifacts/eas/dD5MZWw738FxZxkomyF67SbQSBKkRLv-jFXRERfbRsA.apk";
const GITHUB_REPO = "https://github.com/Shreyashpatil2605/Circlee";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Features", href: "/features" },
    { label: "About", href: "/about" },
    { label: "Download", href: "/download" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/85 backdrop-blur-md border-b border-[#272733]/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 transition-transform group-hover:scale-105 shrink-0 flex items-center justify-center">
            <Image
              src="/assets/circlee-symbol.png"
              alt="Circlee Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white font-display">
            Circlee
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-white ${
                  isActive ? "text-white" : "text-[#A5A0B2]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[#A5A0B2] hover:text-white transition-colors px-3 py-2"
          >
            GitHub
          </a>
          <a
            href={APK_URL}
            download="circlee.apk"
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-circlee-gradient hover:opacity-95 transition-all shadow-[0_0_25px_-5px_rgba(217,70,239,0.45)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Download APK</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <a
            href={APK_URL}
            download="circlee.apk"
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white bg-circlee-gradient shadow-sm"
          >
            Download
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#A5A0B2] hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D0D12] border-b border-[#272733] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-base font-medium py-2 transition-colors ${
                  pathname === link.href ? "text-white" : "text-[#A5A0B2]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#272733] flex flex-col gap-3">
            <a
              href={APK_URL}
              download="circlee.apk"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full text-sm font-semibold text-white bg-circlee-gradient"
            >
              Download Android APK
            </a>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full text-sm font-medium text-white border border-[#272733] bg-[#14141C]"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
