"use client";

import { Squares } from "./Squares";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  direction?: "right" | "left" | "up" | "down" | "diagonal";
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
}

export function AnimatedBackground({
  children,
  direction = "diagonal",
  speed = 0.5,
  borderColor = "rgba(255, 255, 255, 0.1)",
  squareSize = 50,
  hoverFillColor = "rgba(255, 255, 255, 0.05)",
}: AnimatedBackgroundProps) {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <Squares
          direction={direction}
          speed={speed}
          borderColor={borderColor}
          squareSize={squareSize}
          hoverFillColor={hoverFillColor}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 