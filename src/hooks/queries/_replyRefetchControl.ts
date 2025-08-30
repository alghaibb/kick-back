const suppressUntilByReply = new Map<string, number>();

export function suppressReplyRefetch(replyId: string, ms: number) {
  suppressUntilByReply.set(replyId, Date.now() + ms);
}

export function getReplyRefetchSuppressRemaining(replyId: string): number {
  const until = suppressUntilByReply.get(replyId) || 0;
  return Math.max(0, until - Date.now());
}

export function isReplyRefetchSuppressed(replyId: string): boolean {
  return getReplyRefetchSuppressRemaining(replyId) > 0;
}
