import { create } from "zustand";

export type ModalType =
  | "create-group"
  | "invite-group"
  | "edit-group"
  | "create-event"
  | "edit-event"
  | "delete-event"
  | "delete-photo"
  | "delete-comment"
  | "delete-account"
  | "delete-user"
  | "recover-user"
  | "edit-user"
  | "reply-comment"
  | "edit-comment"
  | "contact-reply";

interface ModalState {
  type: ModalType | null;
  isOpen: boolean;
  data?: {
    groupId?: string;
    groupName?: string;
    eventId?: string;
    eventName?: string;
    userRole?: string;
    description?: string;
    image?: string | null;
    // Event editing fields
    name?: string;
    location?: string;
    date?: string;
    time?: string;
    groups?: { id: string; name: string }[];
    // Photo deletion fields
    photoId?: string;
    // Comment deletion fields
    commentId?: string;
    commentContent?: string;
    isReply?: boolean;
    // Reply modal fields
    parentCommentId?: string;
    replyingToUser?: {
      id: string;
      name: string;
    };
    // Edit comment modal fields
    editCommentId?: string;
    editCommentContent?: string;
    editCommentImageUrl?: string;
    // Delete user modal fields
    userId?: string;
    userName?: string;
    // Edit user modal fields
    user?: {
      id: string;
      firstName: string;
      lastName: string | null;
      email: string;
      nickname: string | null;
      role: "USER" | "ADMIN";
      hasOnboarded: boolean;
      accounts?: Array<{ provider: string }>;
    };
  };
  open: (
    type: ModalType,
    data?: {
      groupId?: string;
      groupName?: string;
      eventId?: string;
      eventName?: string;
      userRole?: string;
      description?: string;
      image?: string | null;
      // Event editing fields
      name?: string;
      location?: string;
      date?: string;
      time?: string;
      groups?: { id: string; name: string }[];
      // Photo deletion fields
      photoId?: string;
      // Comment deletion fields
      commentId?: string;
      commentContent?: string;
      isReply?: boolean;
      // Reply modal fields
      parentCommentId?: string;
      replyingToUser?: {
        id: string;
        name: string;
      };
      // Edit comment modal fields
      editCommentId?: string;
      editCommentContent?: string;
      editCommentImageUrl?: string;
      // Delete user modal fields
      userId?: string;
      userName?: string;
      // Edit user modal fields
      user?: {
        id: string;
        firstName: string;
        lastName: string | null;
        email: string;
        nickname: string | null;
        role: "USER" | "ADMIN";
        hasOnboarded: boolean;
        accounts?: Array<{ provider: string }>;
      };
      // Contact reply modal fields
      contactId?: string;
      contactEmail?: string;
      contactSubject?: string;
      contactMessage?: string;
      // Admin edit event field
      isAdmin?: boolean;
    }
  ) => void;
  close: () => void;
}

export const useModal = create<ModalState>((set) => ({
  type: null,
  isOpen: false,
  data: undefined,
  open: (type, data) => set({ type, isOpen: true, data }),
  close: () => set({ type: null, isOpen: false, data: undefined }),
}));
