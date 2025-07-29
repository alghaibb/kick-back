import { useState, useEffect, useRef, useCallback } from "react";

type PollingStrategy = "ultra-fast" | "standard" | "relaxed";

interface SmartPollingOptions {
  strategy?: PollingStrategy;
  activeInterval?: number;
  idleInterval?: number;
  backgroundInterval?: number;
  idleTimeout?: number;
}

const POLLING_STRATEGIES: Record<PollingStrategy, SmartPollingOptions> = {
  "ultra-fast": {
    activeInterval: 2000, // 2 seconds (for comments/calendar)
    idleInterval: 10000, // 10 seconds
    backgroundInterval: 60000, // 1 minute
    idleTimeout: 30000, // 30 seconds to become idle
  },
  standard: {
    activeInterval: 5000, // 5 seconds (notifications)
    idleInterval: 30000, // 30 seconds
    backgroundInterval: 120000, // 2 minutes
    idleTimeout: 120000, // 2 minutes to become idle
  },
  relaxed: {
    activeInterval: 15000, // 15 seconds (dashboard/events)
    idleInterval: 60000, // 1 minute
    backgroundInterval: 300000, // 5 minutes
    idleTimeout: 180000, // 3 minutes to become idle
  },
};

export function useSmartPolling(options: SmartPollingOptions = {}) {
  const strategy = options.strategy || "standard";
  const defaults = POLLING_STRATEGIES[strategy];

  const {
    activeInterval = defaults.activeInterval!,
    idleInterval = defaults.idleInterval!,
    backgroundInterval = defaults.backgroundInterval!,
    idleTimeout = defaults.idleTimeout!,
  } = { ...defaults, ...options };

  const [isActive, setIsActive] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const lastActivityRef = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset activity timer
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (!isActive) {
      setIsActive(true);
    }
  }, [isActive]);

  // Check if user has been idle
  const checkIdleStatus = useCallback(() => {
    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;

    if (timeSinceActivity >= idleTimeout && isActive) {
      setIsActive(false);
    }
  }, [idleTimeout, isActive]);

  useEffect(() => {
    // Track user activity events
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) =>
      document.addEventListener(event, resetActivity, true)
    );

    // Track tab visibility
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      if (!document.hidden) {
        resetActivity(); // User came back, they're active
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Check idle status every 30 seconds
    const idleCheckInterval = setInterval(checkIdleStatus, 30000);

    // Capture the current timeout ref for cleanup
    const currentTimeout = timeoutRef.current;

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, resetActivity, true)
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(idleCheckInterval);
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, [idleTimeout, isActive, checkIdleStatus, resetActivity]);

  // Calculate current polling interval
  const getPollingInterval = (): number => {
    if (!isVisible) return backgroundInterval; // Tab in background
    if (!isActive) return idleInterval; // User idle
    return activeInterval; // User active
  };

  return {
    pollingInterval: getPollingInterval(),
    isActive,
    isVisible,
    userStatus: !isVisible ? "background" : !isActive ? "idle" : "active",
  };
}
