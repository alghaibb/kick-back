const suppressUntilByEvent = new Map<string, number>();

export function suppressEventCommentsRefetch(eventId: string, ms: number) {
  suppressUntilByEvent.set(eventId, Date.now() + ms);
}

export function getEventCommentsSuppressRemaining(eventId: string): number {
  const until = suppressUntilByEvent.get(eventId) || 0;
  return Math.max(0, until - Date.now());
}
