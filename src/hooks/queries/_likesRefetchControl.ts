const suppressUntilByPhoto = new Map<string, number>();

export function suppressPhotoLikeRefetch(photoId: string, ms: number) {
  suppressUntilByPhoto.set(photoId, Date.now() + ms);
}

export function getPhotoLikeSuppressRemaining(photoId: string): number {
  const until = suppressUntilByPhoto.get(photoId) || 0;
  return Math.max(0, until - Date.now());
}
