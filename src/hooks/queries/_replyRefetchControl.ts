// Use localStorage to persist suppression across component mounts/navigation
const SUPPRESS_STORAGE_KEY = "reply-refetch-suppress";

// In-memory fallback for SSR/initial load
const suppressUntilByReply = new Map<string, number>();

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

export function suppressReplyRefetch(replyId: string, ms: number) {
  const until = Date.now() + ms;

  // Update in-memory map
  suppressUntilByReply.set(replyId, until);

  // Persist to localStorage
  const data = getSuppressData();
  data[replyId] = until;
  setSuppressData(data);
}

export function getReplyRefetchSuppressRemaining(replyId: string): number {
  // Check localStorage first (persistent across mounts)
  const data = getSuppressData();
  const storedUntil = data[replyId];

  // Fallback to in-memory (for current session)
  const memoryUntil = suppressUntilByReply.get(replyId) || 0;

  const until = Math.max(storedUntil || 0, memoryUntil);
  const remaining = Math.max(0, until - Date.now());

  // Clean up expired entries
  if (remaining === 0 && (storedUntil || memoryUntil)) {
    suppressUntilByReply.delete(replyId);
    if (storedUntil) {
      delete data[replyId];
      setSuppressData(data);
    }
  }

  return remaining;
}

export function isReplyRefetchSuppressed(replyId: string): boolean {
  return getReplyRefetchSuppressRemaining(replyId) > 0;
}
