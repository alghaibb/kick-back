import { useRef, useCallback } from "react";

interface PausablePolling {
  isPaused: () => boolean;
  pause: (duration: number) => void;
  resume: () => void;
}

const pausedQueries = new Map<string, number>();

export function usePausablePolling(queryKey: string): PausablePolling {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const isPaused = useCallback(() => {
    const pausedUntil = pausedQueries.get(queryKey);
    if (!pausedUntil) return false;

    if (Date.now() > pausedUntil) {
      pausedQueries.delete(queryKey);
      return false;
    }

    return true;
  }, [queryKey]);

  const pause = useCallback(
    (duration: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      pausedQueries.set(queryKey, Date.now() + duration);

      timeoutRef.current = setTimeout(() => {
        pausedQueries.delete(queryKey);
      }, duration);
    },
    [queryKey]
  );

  const resume = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    pausedQueries.delete(queryKey);
  }, [queryKey]);

  return { isPaused, pause, resume };
}

export function pausePolling(queryKey: string, duration: number) {
  pausedQueries.set(queryKey, Date.now() + duration);

  setTimeout(() => {
    pausedQueries.delete(queryKey);
  }, duration);
}

export function isPollingPaused(queryKey: string): boolean {
  const pausedUntil = pausedQueries.get(queryKey);
  if (!pausedUntil) return false;

  if (Date.now() > pausedUntil) {
    pausedQueries.delete(queryKey);
    return false;
  }

  return true;
}
