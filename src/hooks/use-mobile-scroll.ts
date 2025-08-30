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

    // Fix viewport height on mobile browsers
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Force scroll to top function for mobile
    const ensureScrollToTop = () => {
      // Find all scroll containers and reset their scroll position
      const scrollContainers = document.querySelectorAll(
        ".mobile-scroll-container"
      );
      scrollContainers.forEach((container) => {
        if (container.scrollTop > 0) {
          container.scrollTop = 0;
        }
      });

      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
      }

      if (document.documentElement.scrollTop > 0) {
        document.documentElement.scrollTop = 0;
      }
      if (document.body.scrollTop > 0) {
        document.body.scrollTop = 0;
      }
    };

    const handleOrientationChange = () => {
      // Wait for browser UI to settle
      setTimeout(() => {
        setViewportHeight();
        ensureScrollToTop();
      }, 100);

      setTimeout(() => {
        setViewportHeight();
      }, 500);
    };

    const handleResize = () => {
      setViewportHeight();
      setTimeout(setViewportHeight, 100);
    };

    setViewportHeight();
    ensureScrollToTop();

    document.addEventListener("touchend", preventDoubleTouch, {
      passive: false,
    });

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        setTimeout(() => {
          setViewportHeight();
          ensureScrollToTop();
        }, 100);
      }
    });

    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        if (scrollTop > 0 && scrollTop < 10) {
          // We're stuck in a weird scroll position, force to top
          ensureScrollToTop();
        }
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("touchend", preventDoubleTouch);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      document.removeEventListener("visibilitychange", () => {});
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);
}
