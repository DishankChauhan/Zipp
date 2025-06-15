"use client";

import { cn } from "@/lib/utils";
import { GlowingEffect } from "./GlowingEffect";
import { ReactNode } from "react";

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
  blur?: number;
  spread?: number;
  proximity?: number;
  borderWidth?: number;
  disabled?: boolean;
}

export function GlowingCard({
  children,
  className,
  blur = 4,
  spread = 40,
  proximity = 120,
  borderWidth = 4,
  disabled = false,
}: GlowingCardProps) {
  return (
    <div className={cn("relative", className)}>
      <GlowingEffect
        blur={blur}
        spread={spread}
        proximity={proximity}
        borderWidth={borderWidth}
        disabled={disabled}
      />
      {children}
    </div>
  );
} 