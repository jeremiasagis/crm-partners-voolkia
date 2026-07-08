"use client";

import { useEffect, useMemo, useState } from "react";

const COLORS = ["#FF6B1A", "#E55A0E", "#FFE3D1", "#2A0E04", "#FFD700", "#4ADE80"];

type Piece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
};

/** Lluvia de confetti de ~2.5s. Montar condicionalmente para dispararlo. */
export function Confetti({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(true);

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: ((i * 13) % 40) / 100,
        duration: 1.6 + ((i * 7) % 12) / 10,
        color: COLORS[i % COLORS.length],
        size: 6 + ((i * 11) % 8),
        rotate: (i * 47) % 360,
      })),
    []
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-[-20px] block animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.45,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}
