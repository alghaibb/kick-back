"use client";

import { useThemeConfig } from "@/providers/ActiveThemeProvider";
import { FooterLinks } from "../footer/_components/FooterLinks";
import { Logo } from "../Logo";

export default function Footer() {
  const { activeTheme } = useThemeConfig();

  return (
    <footer className={`py-16 md:py-32 border-t theme-${activeTheme}`}>
      <div className="mx-auto max-w-5xl px-6 justify-center items-center flex flex-col space-y-8">
        <div>
          <Logo />
        </div>
        <FooterLinks />
        <span className="text-muted-foreground block text-center text-sm">
          © {new Date().getFullYear()} Kick Back, All rights reserved
        </span>
      </div>
    </footer>
  );
}
