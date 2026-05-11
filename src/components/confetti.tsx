"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function Confetti() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const colors = ["#f0a838", "#e89320", "#a4d4a8", "#fbf7ed"];
    const burst = (origin: { x: number; y: number }) => {
      confetti({ particleCount: 80, spread: 70, origin, colors, disableForReducedMotion: true, scalar: 1.1 });
    };
    burst({ x: 0.3, y: 0.5 });
    setTimeout(() => burst({ x: 0.7, y: 0.5 }), 200);
    setTimeout(() => burst({ x: 0.5, y: 0.3 }), 400);
  }, []);
  return null;
}
