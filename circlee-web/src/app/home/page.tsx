"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { 
  Home, 
  Compass, 
  MessageSquare, 
  Bell, 
  Bookmark, 
  User, 
  Settings, 
  Sparkles, 
  LogOut,
  Send,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";

export default function AppHomePage() {
  const { user, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-7xl mx-auto flex">
        
        {/* Left Sidebar Navigation (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 p-6 border-r border-[#272733] shrink-0 sticky top-20 h-[calc(100vh-5rem)] justify-between">
          <div className="space-y-6">
            <div className="space-y-1">
              {[
                { label: "Home Feed", icon: Home, active: true },
                { label: "Explore", icon: Compass },
                { label: "Messages", icon: MessageSquare, badge: "Live" },
                { label: "Notifications", icon: Bell },
                { label: "Saved Posts", icon: Bookmark },
                { label: "My Profile", icon: User },
                { label: "Settings", icon: Settings },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={i}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      item.active
                        ? "bg-[#14141C] text-white border border-[#272733]"
                        : "text-[#A5A0B2] hover:text-white hover:bg-[#0D0D12]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${item.active ? "text-[#8B5CF6]" : ""}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D946EF]/20 text-[#D946EF] border border-[#D946EF]/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User profile capsule at bottom of sidebar */}
          <div className="pt-4 border-t border-[#1F1F2B]">
            {isLoaded && user ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D0D12] border border-[#272733]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden relative shrink-0 bg-[#14141C]">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs bg-circlee-gradient">
                        {user.firstName?.[0] || "U"}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-xs font-bold text-white truncate">
                      {user.fullName || user.username || "Circlee User"}
                    </div>
                    <div className="text-[11px] text-[#716C82] truncate">
                      @{user.username || user.firstName?.toLowerCase() || "user"}
                    </div>
                  </div>
                </div>
                <SignOutButton>
                  <button className="text-[#A5A0B2] hover:text-rose-400 p-1.5 transition-colors" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <div className="text-xs text-[#716C82] text-center">Loading session...</div>
            )}
          </div>
        </aside>

        {/* Center Social Feed Column */}
        <main className="flex-1 max-w-2xl border-r border-[#272733] min-h-screen pb-24">
          
          {/* Header Bar */}
          <div className="sticky top-20 z-30 bg-black/90 backdrop-blur-md px-6 py-4 border-b border-[#272733] flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">Your Feed</h1>
            <div className="flex items-center gap-2 text-xs text-[#A5A0B2]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Convex Connected</span>
            </div>
          </div>

          {/* Web Preview Developer Banner */}
          <div className="mx-6 mt-6 p-4 rounded-2xl bg-gradient-to-r from-[#14141C] via-[#0D0D12] to-[#14141C] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left text-xs space-y-1">
              <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                <span>Web Version in Development Preview</span>
              </div>
              <div className="text-[#A5A0B2]">
                Circlee is currently live primarily on Android. Download the native APK for push notifications, background sync, and live voice chat!
              </div>
            </div>
            <a
              href="https://expo.dev/artifacts/eas/dD5MZWw738FxZxkomyF67SbQSBKkRLv-jFXRERfbRsA.apk"
              download="circlee.apk"
              className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold text-white bg-circlee-gradient hover:opacity-95 shadow-sm whitespace-nowrap"
            >
              Download Android APK
            </a>
          </div>

          {/* Quick Post Composer Card */}
          <div className="p-6 border-b border-[#272733] bg-[#0D0D12]/50 space-y-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 bg-[#14141C]">
                {user?.imageUrl ? (
                  <Image src={user.imageUrl} alt="Avatar" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-circlee-gradient">
                    {user?.firstName?.[0] || "C"}
                  </div>
                )}
              </div>
              <textarea
                placeholder="What's happening in your circle?"
                rows={2}
                className="w-full bg-transparent text-sm text-white placeholder-[#716C82] resize-none focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#1F1F2B]">
              <span className="text-xs text-[#716C82]">Markdown & Media Supported</span>
              <button className="px-5 py-2 rounded-full text-xs font-semibold text-white bg-circlee-gradient hover:opacity-95 shadow-sm">
                Share Post
              </button>
            </div>
          </div>

          {/* Feed Posts Stream */}
          <div className="divide-y divide-[#272733]">
            
            {/* Spotlight Post 1 */}
            <article className="p-6 space-y-4 hover:bg-[#0D0D12]/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] p-0.5">
                    <div className="w-full h-full rounded-full bg-[#14141C] flex items-center justify-center font-bold text-xs text-white">
                      CP
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>Circlee Official</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] font-semibold">
                        Verified
                      </span>
                    </div>
                    <div className="text-xs text-[#716C82]">@circlee • Just now</div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-white/95 leading-relaxed">
                Welcome to Circlee Web! 🚀 We are officially connecting mobile and browser into one seamless real-time circle. What do you think of the new experience?
              </p>

              {/* Feed Card Screenshot Attachment */}
              <div className="rounded-2xl overflow-hidden border border-[#272733] relative aspect-video bg-[#0D0D12]">
                <Image
                  src="/assets/screens/home_feed.jpg"
                  alt="Circlee Social Feed"
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* Reactions Bar */}
              <div className="flex items-center justify-between pt-2 text-xs text-[#A5A0B2]">
                <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>42 Likes</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-[#8B5CF6] transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>18 Comments</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-[#D946EF] transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Reshare</span>
                </button>
                <button className="hover:text-amber-400 transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </article>

            {/* Spotlight Post 2 */}
            <article className="p-6 space-y-4 hover:bg-[#0D0D12]/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF7A35] to-[#D946EF] p-0.5">
                    <div className="w-full h-full rounded-full bg-[#14141C] flex items-center justify-center font-bold text-xs text-white">
                      LP
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Lemon</div>
                    <div className="text-xs text-[#716C82]">@lemon • 2h ago</div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-white/95 leading-relaxed">
                The real-time audio voice notes on Circlee are next level. Zero lag, crisp waveforms, and direct delivery. 🌧️
              </p>

              <div className="p-4 rounded-2xl bg-[#14141C] border border-[#272733] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center">
                    ▶
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-white">Voice Note (0:14)</div>
                    <div className="text-[#716C82]">Circlee Audio Message</div>
                  </div>
                </div>
                <div className="text-xs text-[#A5A0B2] font-mono">0:14</div>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-[#A5A0B2]">
                <button className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>19 Likes</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-[#8B5CF6] transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>4 Comments</span>
                </button>
                <button className="flex items-center gap-1.5 hover:text-[#D946EF] transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Reshare</span>
                </button>
                <button className="hover:text-amber-400 transition-colors">
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </article>

          </div>

        </main>

        {/* Right Column: Suggested People & Trending (Desktop) */}
        <aside className="hidden lg:flex flex-col w-80 p-6 space-y-6 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          
          {/* Trending Circles */}
          <div className="p-5 rounded-2xl bg-[#0D0D12] border border-[#272733] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D946EF]" />
                <span>Trending Circles</span>
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              {[
                { tag: "#circleeLaunch", posts: "1.2k conversations" },
                { tag: "#musicProduction", posts: "840 posts" },
                { tag: "#indieHacker", posts: "620 posts" },
                { tag: "#tokyoRain", posts: "410 posts" },
              ].map((t, i) => (
                <div key={i} className="flex justify-between items-center group cursor-pointer">
                  <span className="font-semibold text-white group-hover:text-[#8B5CF6] transition-colors">
                    {t.tag}
                  </span>
                  <span className="text-[#716C82]">{t.posts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested People */}
          <div className="p-5 rounded-2xl bg-[#0D0D12] border border-[#272733] space-y-4">
            <h3 className="text-sm font-bold text-white">Suggested for You</h3>
            <div className="space-y-3">
              {[
                { name: "Maya Lin", handle: "@mayalin", role: "Photographer" },
                { name: "Devon Reed", handle: "@devonr", role: "Audio Designer" },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{p.name}</div>
                    <div className="text-[11px] text-[#716C82]">{p.handle}</div>
                  </div>
                  <button className="px-3 py-1 rounded-full text-xs font-semibold bg-[#14141C] border border-[#272733] text-white hover:border-[#8B5CF6] transition-colors">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
