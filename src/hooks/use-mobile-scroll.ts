"use client";

import { useEffect } from "react";

export function useMobileScrollFix() {
  useEffect(() => {
    // Prevent double-tap zoom on iOS
    let lastTouchEnd = 0;

    const preventDoubleTouch = (event: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    };

    // Fix iOS scroll issues
    const preventScrollBounce = (event: TouchEvent) => {
      // Allow scrolling only on scrollable elements
      const target = event.target as HTMLElement;
      const scrollableParent = target.closest('.mobile-scroll-container, [data-scroll="true"]');

      if (!scrollableParent) {
        // If not in a scrollable container, prevent default
        const isAtTop = window.scrollY === 0;
        const isAtBottom = window.scrollY >= document.documentElement.scrollHeight - window.innerHeight;

        // Prevent bounce at top/bottom
        if ((isAtTop && event.touches[0].clientY > event.touches[0].clientY) ||
          (isAtBottom && event.touches[0].clientY < event.touches[0].clientY)) {
          event.preventDefault();
        }
      }
    };

    // Add event listeners
    document.addEventListener('touchend', preventDoubleTouch, { passive: false });
    document.addEventListener('touchmove', preventScrollBounce, { passive: false });

    // Fix viewport height on mobile browsers
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      document.removeEventListener('touchend', preventDoubleTouch);
      document.removeEventListener('touchmove', preventScrollBounce);
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);
} 