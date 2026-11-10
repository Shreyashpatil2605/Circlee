"use client";

import React, { useEffect, useRef, useState } from "react";

export function CircleCursor() {
  const [mounted, setMounted] = useState(false);

  // Direct DOM references to bypass React re-rendering for 120 FPS buttery smoothness
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Position and velocity vectors
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const glowPos = useRef({ x: -100, y: -100 });
  
  // State refs (no React state updates in RAF or mousemove)
  const isHovered = useRef(false);
  const isClicking = useRef(false);
  const isVisible = useRef(false);
  const hasMovedOnce = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable custom cursor on desktop devices with fine pointer
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!hasMovedOnce.current) {
        hasMovedOnce.current = true;
        ringPos.current.x = e.clientX;
        ringPos.current.y = e.clientY;
        glowPos.current.x = e.clientX;
        glowPos.current.y = e.clientY;
      }

      if (!isVisible.current) {
        isVisible.current = true;
        updateVisibility(true);
      }
    };

    const updateVisibility = (visible: boolean) => {
      const opacity = visible ? "1" : "0";
      if (dotRef.current) dotRef.current.style.opacity = opacity;
      if (ringRef.current) ringRef.current.style.opacity = opacity;
      if (glowRef.current) glowRef.current.style.opacity = opacity;
    };

    // Event delegation for hover states - zero lag, perfectly synchronized
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        'button, a, input, textarea, select, [role="button"], [data-cursor="pointer"], .cursor-pointer'
      );

      if (interactive && !isHovered.current) {
        isHovered.current = true;
        updateCursorState();
      } else if (!interactive && isHovered.current) {
        isHovered.current = false;
        updateCursorState();
      }
    };

    const onMouseDown = () => {
      isClicking.current = true;
      updateCursorState();
    };

    const onMouseUp = () => {
      isClicking.current = false;
      updateCursorState();
    };

    const onMouseLeave = () => {
      isVisible.current = false;
      updateVisibility(false);
    };

    const onMouseEnter = () => {
      isVisible.current = true;
      updateVisibility(true);
    };

    const updateCursorState = () => {
      if (!ringRef.current || !dotRef.current) return;

      if (isClicking.current) {
        ringRef.current.style.width = "28px";
        ringRef.current.style.height = "28px";
        ringRef.current.style.borderColor = "#FF7A35";
        ringRef.current.style.backgroundColor = "rgba(255, 122, 53, 0.25)";
        ringRef.current.style.boxShadow = "0 0 20px rgba(255, 122, 53, 0.5)";
        dotRef.current.style.transform += " scale(0.7)";
      } else if (isHovered.current) {
        ringRef.current.style.width = "54px";
        ringRef.current.style.height = "54px";
        ringRef.current.style.borderColor = "#D946EF";
        ringRef.current.style.backgroundColor = "rgba(139, 92, 246, 0.12)";
        ringRef.current.style.boxShadow = "0 0 25px rgba(217, 70, 239, 0.45)";
        dotRef.current.style.transform += " scale(1.4)";
      } else {
        ringRef.current.style.width = "36px";
        ringRef.current.style.height = "36px";
        ringRef.current.style.borderColor = "rgba(139, 92, 246, 0.65)";
        ringRef.current.style.backgroundColor = "transparent";
        ringRef.current.style.boxShadow = "0 0 14px rgba(139, 92, 246, 0.2)";
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseover", onMouseOver, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave, { passive: true });
    document.addEventListener("mouseenter", onMouseEnter, { passive: true });

    // Smooth physics loop with variable spring/lerp interpolation
    const render = () => {
      // Precise dot follows instantly with sub-pixel positioning
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Smooth trailing ring (lerp factor 0.14 for silky smooth trailing momentum)
      const ringEase = 0.14;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ringEase;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ringEase;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Soft ambient glow halo trailing gently behind (lerp factor 0.08)
      const glowEase = 0.08;
      glowPos.current.x += (mousePos.current.x - glowPos.current.x) * glowEase;
      glowPos.current.y += (mousePos.current.y - glowPos.current.y) * glowEase;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowPos.current.x}px, ${glowPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* 1. Ambient Radiant Halo Glow (softest, widest trailing light) */}
      <div
        ref={glowRef}
        aria-hidden="true"
        style={{
          width: "120px",
          height: "120px",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(217, 70, 239, 0.05) 50%, transparent 70%)",
          opacity: 0,
          transition: "opacity 0.3s ease-out",
        }}
        className="pointer-events-none fixed top-0 left-0 z-[9997] will-change-transform rounded-full"
      />

      {/* 2. Fluid Trailing Circle Ring (smooth spring momentum) */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          width: "36px",
          height: "36px",
          borderWidth: "1.5px",
          borderStyle: "solid",
          borderColor: "rgba(139, 92, 246, 0.65)",
          opacity: 0,
          transition: "width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease-out, border-color 0.25s ease-out, box-shadow 0.25s ease-out, opacity 0.3s ease-out",
        }}
        className="pointer-events-none fixed top-0 left-0 z-[9998] will-change-transform rounded-full"
      />

      {/* 3. Crisp Pinpoint Center Dot (immediate tactile feedback) */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          width: "6px",
          height: "6px",
          opacity: 0,
          transition: "opacity 0.2s ease-out, transform 0.15s ease-out",
        }}
        className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
      />
    </>
  );
}
