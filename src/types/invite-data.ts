type InviteData =
  | { error: string }
  | { id: string; name: string; description?: string | null; createdBy: string }
  | null;
