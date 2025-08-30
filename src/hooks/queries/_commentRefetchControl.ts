// Use localStorage to persist suppression across component mounts/navigation
const SUPPRESS_STORAGE_KEY = "comment-refetch-suppress";

// In-memory fallback for SSR/initial load
const suppressUntilByEvent = new Map<string, number>();

function getSuppressData(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(SUPPRESS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setSuppressData(data: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SUPPRESS_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function suppressEventCommentsRefetch(eventId: string, ms: number) {
  const until = Date.now() + ms;

  // Update in-memory map
  suppressUntilByEvent.set(eventId, until);

  // Persist to localStorage
  const data = getSuppressData();
  data[eventId] = until;
  setSuppressData(data);
}

export function getEventCommentsSuppressRemaining(eventId: string): number {
  // Check localStorage first (persistent across mounts)
  const data = getSuppressData();
  const storedUntil = data[eventId];

  // Fallback to in-memory (for current session)
  const memoryUntil = suppressUntilByEvent.get(eventId) || 0;

  const until = Math.max(storedUntil || 0, memoryUntil);
  const remaining = Math.max(0, until - Date.now());

  // Clean up expired entries
  if (remaining === 0 && (storedUntil || memoryUntil)) {
    suppressUntilByEvent.delete(eventId);
    if (storedUntil) {
      delete data[eventId];
      setSuppressData(data);
    }
  }

  return remaining;
}
