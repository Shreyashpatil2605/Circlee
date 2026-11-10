"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  MessageSquare, 
  Flame, 
  Sparkles, 
  UserCheck, 
  Bookmark, 
  Share2, 
  Heart, 
  Play, 
  Pause,
  Send,
  Radio,
  Compass
} from "lucide-react";
import { SpotlightCard } from "../ui/SpotlightCard";
import { PhoneMockup } from "../ui/PhoneMockup";

export function FeaturesSection() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [likeCount, setLikeCount] = useState(42);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
      setIsLiked(false);
    } else {
      setLikeCount(likeCount + 1);
      setIsLiked(true);
    }
  };

  return (
    <section id="features" className="w-full py-24 sm:py-32 bg-[#000000] relative overflow-hidden">
      
      {/* Background Subtle Dot-Grid & Ambient Color Blobs */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      <div
        className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/10 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-[#FF7A35]/10 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14141C] border border-[#272733] text-xs font-semibold text-[#D946EF] uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#D946EF] animate-ping" />
            <span>Interactive Feature Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white font-display tracking-tight">
            Designed for genuine human connection.
          </h2>

          <p className="text-base sm:text-lg text-[#A5A0B2] leading-relaxed">
            Move your cursor across each feature card to experience live micro-interactions. Real WebSocket latency, voice waveforms, and organic circles.
          </p>
        </div>

        {/* Bento Grid with Live Micro-Interactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card 1: Real-Time WebSocket Chat (With Animated Waveform & Typing) */}
          <SpotlightCard spotlightColor="rgba(139, 92, 246, 0.25)" className="p-8 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] p-0.5 shadow-sm">
                  <div className="w-full h-full bg-[#14141C] rounded-[14px] flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Convex WebSocket
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Real-Time WebSocket Chat
              </h3>
              <p className="text-sm text-[#A5A0B2] leading-relaxed mb-6">
                Zero lag bi-directional messaging with live typing states, read receipts, and audio voice messages.
              </p>

              {/* Interactive Mini Chat UI */}
              <div className="rounded-2xl bg-[#14141C] border border-[#272733] p-4 space-y-3">
                {/* Message 1 */}
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] text-[10px] flex items-center justify-center font-bold shrink-0">
                    S
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-[#1F1F2B] px-3.5 py-2 text-xs text-white max-w-[80%]">
                    Are you ready for the circle launch tonight? 🚀
                  </div>
                </div>

                {/* Message 2: Live Voice Note with Equalizer */}
                <div className="flex items-start gap-2.5 justify-end">
                  <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-[#8B5CF6]/30 to-[#D946EF]/30 border border-[#8B5CF6]/40 p-2.5 text-xs text-white max-w-[85%] flex items-center gap-3">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-7 h-7 rounded-full bg-circlee-gradient flex items-center justify-center text-white shrink-0 hover:scale-105 transition-transform"
                    >
                      {isPlayingAudio ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                    </button>
                    {/* Bouncing Equalizer Waveform */}
                    <div className="flex items-center gap-1 h-7">
                      <div className={`w-1 rounded-full bg-[#D946EF] ${isPlayingAudio ? "animate-bar-1" : "h-2"}`} />
                      <div className={`w-1 rounded-full bg-[#8B5CF6] ${isPlayingAudio ? "animate-bar-2" : "h-4"}`} />
                      <div className={`w-1 rounded-full bg-[#FF7A35] ${isPlayingAudio ? "animate-bar-3" : "h-5"}`} />
                      <div className={`w-1 rounded-full bg-[#3B82F6] ${isPlayingAudio ? "animate-bar-4" : "h-3"}`} />
                      <div className={`w-1 rounded-full bg-[#A855F7] ${isPlayingAudio ? "animate-bar-5" : "h-6"}`} />
                      <div className={`w-1 rounded-full bg-[#D946EF] ${isPlayingAudio ? "animate-bar-6" : "h-2"}`} />
                    </div>
                    <span className="text-[10px] font-mono text-[#A5A0B2]">0:14</span>
                  </div>
                </div>

                {/* Live Typing Indicator */}
                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#716C82]">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D946EF] animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A35] animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </span>
                  <span>Lemon is typing...</span>
                </div>
              </div>
            </div>

            <div className="pt-4 text-xs text-[#716C82] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
              <span>Convex Realtime Subscriptions</span>
            </div>
          </SpotlightCard>

          {/* Card 2: Vibrant Social Feed (With Interactive Heart & Reactions) */}
          <SpotlightCard spotlightColor="rgba(217, 70, 239, 0.25)" className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#D946EF] p-0.5 shadow-sm">
                  <div className="w-full h-full bg-[#14141C] rounded-[14px] flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#D946EF]/10 text-[#D946EF] border border-[#D946EF]/20 font-semibold">
                  Zero Algorithms
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Vibrant Social Feed
              </h3>
              <p className="text-sm text-[#A5A0B2] leading-relaxed mb-6">
                Pure chronological updates from the people you actually chose to follow. No synthetic virality traps.
              </p>

              {/* Interactive Mini Post Card */}
              <div className="rounded-2xl bg-[#14141C] border border-[#272733] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF7A35] to-[#D946EF] p-0.5">
                      <div className="w-full h-full rounded-full bg-[#14141C] flex items-center justify-center text-[10px] font-bold text-white">
                        L
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <span>Lemon</span>
                        <span className="text-[9px] px-1 rounded bg-[#8B5CF6]/20 text-[#8B5CF6]">Active</span>
                      </div>
                      <div className="text-[10px] text-[#716C82]">Just now</div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/90 leading-relaxed">
                  Rainy Tokyo vibes today. Loving the fluid interface in Circlee! 🌧️🗼
                </p>

                {/* Interactive Heart Like Button */}
                <div className="pt-2 border-t border-[#1F1F2B] flex items-center justify-between">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isLiked
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 scale-105"
                        : "bg-[#0D0D12] text-[#A5A0B2] border border-[#272733] hover:text-white"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 transition-transform ${isLiked ? "fill-current scale-110" : ""}`} />
                    <span>{likeCount} Likes</span>
                  </button>

                  <div className="flex items-center -space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500 border border-[#14141C] inline-block" />
                    <span className="w-5 h-5 rounded-full bg-purple-500 border border-[#14141C] inline-block" />
                    <span className="w-5 h-5 rounded-full bg-pink-500 border border-[#14141C] inline-block" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 text-xs text-[#716C82] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D946EF]" />
              <span>Full Media Carousels & Video Support</span>
            </div>
          </SpotlightCard>

          {/* Card 3: Explore & Trending Circles (With Interactive Tag Cloud) */}
          <SpotlightCard spotlightColor="rgba(255, 122, 53, 0.25)" className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D946EF] to-[#FF7A35] p-0.5 shadow-sm">
                  <div className="w-full h-full bg-[#14141C] rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#FF7A35]/10 text-[#FF7A35] border border-[#FF7A35]/20 font-semibold">
                  Live Trends
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Explore & Trending Circles
              </h3>
              <p className="text-sm text-[#A5A0B2] leading-relaxed mb-6">
                Discover breakout creator circles, fresh conversations, and trending topics across the network.
              </p>

              {/* Interactive Floating Tag Cloud */}
              <div className="rounded-2xl bg-[#14141C] border border-[#272733] p-4 flex flex-wrap gap-2">
                {[
                  { tag: "#circleeLaunch", count: "1.2k", hot: true },
                  { tag: "#ambientMusic", count: "890", hot: false },
                  { tag: "#indieDev", count: "640", hot: false },
                  { tag: "#creativeCoding", count: "430", hot: true },
                  { tag: "#photography", count: "310", hot: false },
                ].map((item, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${
                      item.hot
                        ? "bg-circlee-gradient text-white shadow-sm"
                        : "bg-[#0D0D12] border border-[#272733] text-[#A5A0B2] hover:text-white hover:border-[#8B5CF6]/50"
                    }`}
                  >
                    <span>{item.tag}</span>
                    <span className="text-[10px] opacity-75">{item.count}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 text-xs text-[#716C82] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A35]" />
              <span>Real-Time Topic Aggregation</span>
            </div>
          </SpotlightCard>

          {/* Card 4: Verified Identity & Live Presence (With Radar Pulse Animation) */}
          <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.25)" className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#8B5CF6] p-0.5 shadow-sm">
                  <div className="w-full h-full bg-[#14141C] rounded-[14px] flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  Clerk Identity
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Presence & Verified Identity
              </h3>
              <p className="text-sm text-[#A5A0B2] leading-relaxed mb-6">
                See when circle members are actively online. Seamless Google & Apple auth with complete session persistence.
              </p>

              {/* Radar Presence Card */}
              <div className="rounded-2xl bg-[#14141C] border border-[#272733] p-4 flex items-center gap-4">
                {/* Avatar with Animated Expanding Radar Ripple */}
                <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ripple" />
                  <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#3B82F6] to-[#8B5CF6] p-0.5 z-10">
                    <div className="w-full h-full rounded-full bg-[#14141C] flex items-center justify-center text-xs font-bold text-white">
                      SP
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black z-20" />
                </div>

                <div className="text-left text-xs space-y-0.5">
                  <div className="font-bold text-white">Shreyash Patil</div>
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Active in Circle now</span>
                  </div>
                  <div className="text-[#716C82]">Last active: moments ago</div>
                </div>
              </div>
            </div>

            <div className="pt-4 text-xs text-[#716C82] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              <span>Multi-Factor Clerk Authentication</span>
            </div>
          </SpotlightCard>

          {/* Card 5: Saved Posts & Collections (With 3D Hover Card Stack) */}
          <SpotlightCard spotlightColor="rgba(168, 85, 247, 0.25)" className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#06B6D4] p-0.5 shadow-sm">
                  <div className="w-full h-full bg-[#14141C] rounded-[14px] flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                  Private Vault
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Saved Collections
              </h3>
              <p className="text-sm text-[#A5A0B2] leading-relaxed mb-6">
                Curate your favorite moments, design inspiration, and guides into personal saved collections.
              </p>

              {/* 3D Visual Card Stack */}
              <div className="relative h-24 flex items-center justify-center">
                {/* Back card */}
                <div className="absolute w-[85%] h-14 rounded-xl bg-[#14141C] border border-[#272733] -rotate-3 -translate-y-2 opacity-50" />
                {/* Mid card */}
                <div className="absolute w-[92%] h-14 rounded-xl bg-[#1A1A24] border border-[#3B3B4F] rotate-2 -translate-y-1 opacity-75" />
                {/* Front card */}
                <div className="relative w-full h-14 rounded-xl bg-gradient-to-r from-[#14141C] to-[#1F1F2B] border border-[#8B5CF6]/40 p-3 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-[#8B5CF6]" />
                    <span className="text-xs font-semibold text-white">Inspiration & Ideas</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] font-mono">
                    18 saved
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 text-xs text-[#716C82] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]" />
              <span>Instant Cloud Sync Across Devices</span>
            </div>
          </SpotlightCard>

          {/* Card 6: Authentic Reshares (With Quote Post Nested Box) */}
          <SpotlightCard spotlightColor="rgba(236, 72, 153, 0.25)" className="p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#EC4899] p-0.5 shadow-sm">
                  <div className="w-full h-full bg-[#14141C] rounded-[14px] flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-semibold">
                  Amplify Voices
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Authentic Reshares
              </h3>
              <p className="text-sm text-[#A5A0B2] leading-relaxed mb-6">
                Quote and broadcast conversations to your circle with your own perspective and commentary.
              </p>

              {/* Nested Reshare Quote Box */}
              <div className="rounded-2xl bg-[#14141C] border border-[#272733] p-3.5 space-y-2">
                <div className="text-[11px] text-[#A5A0B2] flex items-center gap-1.5">
                  <Share2 className="w-3 h-3 text-[#EC4899]" />
                  <span>Reshared by <strong>Lemon</strong></span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0D0D12] border border-[#1F1F2B] text-xs text-white/90">
                  <span className="text-[10px] text-[#8B5CF6] font-bold block mb-0.5">@circlee_official</span>
                  “The best community is the one where everyone feels heard.”
                </div>
              </div>
            </div>

            <div className="pt-4 text-xs text-[#716C82] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
              <span>Attributed Community Amplification</span>
            </div>
          </SpotlightCard>

        </div>

      </div>
    </section>
  );
}
