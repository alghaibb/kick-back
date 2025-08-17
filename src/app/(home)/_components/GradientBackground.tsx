"use client";
import { useThemeConfig } from "@/providers/ActiveThemeProvider";

const HERO_GRADIENTS = {
  default:
    "radial-gradient(110% 80% at 60% 0%, rgba(180,190,200,0.08) 0%, rgba(180,190,200,0.04) 60%, var(--background) 100%)",
  blue: "radial-gradient(110% 80% at 60% 0%, rgba(80,150,255,0.08) 0%, rgba(80,150,255,0.04) 60%, var(--background) 100%)",
  green:
    "radial-gradient(110% 80% at 60% 0%, rgba(80,255,190,0.08) 0%, rgba(80,255,190,0.04) 60%, var(--background) 100%)",
  amber:
    "radial-gradient(110% 80% at 60% 0%, rgba(255,210,80,0.08) 0%, rgba(255,210,80,0.04) 60%, var(--background) 100%)",
  purple:
    "radial-gradient(110% 80% at 60% 0%, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.04) 60%, var(--background) 100%)",
  rose: "radial-gradient(110% 80% at 60% 0%, rgba(244,63,94,0.08) 0%, rgba(244,63,94,0.04) 60%, var(--background) 100%)",
  emerald:
    "radial-gradient(110% 80% at 60% 0%, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.04) 60%, var(--background) 100%)",
  indigo:
    "radial-gradient(110% 80% at 60% 0%, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.04) 60%, var(--background) 100%)",
  teal: "radial-gradient(110% 80% at 60% 0%, rgba(20,184,166,0.08) 0%, rgba(20,184,166,0.04) 60%, var(--background) 100%)",
  violet:
    "radial-gradient(110% 80% at 60% 0%, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.04) 60%, var(--background) 100%)",
};

export function GradientBackground() {
  const { activeTheme } = useThemeConfig();
  const themeKey = activeTheme in HERO_GRADIENTS ? activeTheme : "default";
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: HERO_GRADIENTS[themeKey as keyof typeof HERO_GRADIENTS],
        transition: "background 0.6s cubic-bezier(.4,0,.2,1)",
      }}
    />
  );
}
