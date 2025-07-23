"use client";
import React, { createContext, useContext, useState } from "react";

interface SectionAnimationContextType {
  unlocked: number;
  unlockNext: () => void;
}

const SectionAnimationContext = createContext<SectionAnimationContextType>({
  unlocked: 0,
  unlockNext: () => {},
});

export function SectionAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(0);
  const unlockNext = () => setUnlocked((u) => u + 1);
  return (
    <SectionAnimationContext.Provider value={{ unlocked, unlockNext }}>
      {children}
    </SectionAnimationContext.Provider>
  );
}

export function useSectionAnimation() {
  return useContext(SectionAnimationContext);
}
