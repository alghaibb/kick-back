export type InviteData =
  | { error: string }
  | { id: string; name: string; description?: string | null; createdBy: string }
  | { 
      id: string; 
      groupId: string; 
      groupName: string; 
      groupDescription?: string | null; 
      groupImage?: string | null;
      inviterName: string; 
      email: string; 
    }
  | null;
