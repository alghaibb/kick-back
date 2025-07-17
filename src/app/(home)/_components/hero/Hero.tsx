"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import HeroMobile from "./HeroMobile";
import HeroDesktop from "./HeroDesktop";

export default function Hero() {
  const isMobile = useIsMobile();
  return isMobile ? <HeroMobile /> : <HeroDesktop />;
}
