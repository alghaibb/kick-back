import { create } from "zustand";

export type ModalType =
  | "create-group"
  | "invite-group"
  | "edit-group"
  | "create-event"
  | "edit-event"
  | "delete-event"
  | "edit-recurring-event"
  | "delete-recurring-event"
  | "cancel-recurring-event"
  | "create-template"
  | "edit-template"
  | "delete-photo"
  | "delete-template"
  | "delete-account"
  | "delete-user"
  | "recover-user"
  | "edit-user"
  | "reply-comment"
  | "edit-comment"
  | "contact-reply"
  | "delete-group"
  | "invite-event"
  | "leave-event"
  | "revoke-user-sessions";

interface ModalState {
  type: ModalType | null;
  isOpen: boolean;
  data?: {
    isAdmin?: boolean;
    groupId?: string;
    groupName?: string;
    eventId?: string;
    eventName?: string;
    userRole?: string;
    description?: string;
    image?: string | null;
    name?: string;
    location?: string;
    date?: string;
    time?: string;
    color?: string;
    groups?: { id: string; name: string }[];
    photoId?: string;
    commentId?: string;
    commentContent?: string;
    isReply?: boolean;
    parentCommentId?: string;
    replyingToUser?: {
      id: string;
      name: string;
    };
    // Edit comment modal fields
    editCommentId?: string;
    editCommentContent?: string;
    editCommentImageUrl?: string;
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
    revokeUserId?: string;
    revokeUserEmail?: string;
    templateId?: string;
    templateName?: string;
    templateDescription?: string | null;
    templateLocation?: string | null;
    templateTime?: string | null;
    templateGroupId?: string | null;
    // Recurring event fields
    isRecurring?: boolean;
    recurrenceId?: string;
    recurrenceRule?: string;
    eventDate?: string;
    editAllInSeries?: boolean;
    editSingleOccurrence?: boolean;
    onSingleEdit?: () => void;
    onSeriesEdit?: () => void;
    onSingleDelete?: () => void;
    onSeriesDelete?: () => void;
    onCancelOccurrence?: () => void;
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
      name?: string;
      location?: string;
      date?: string;
      time?: string;
      color?: string;
      groups?: { id: string; name: string }[];
      photoId?: string;
      commentId?: string;
      commentContent?: string;
      isReply?: boolean;
      parentCommentId?: string;
      replyingToUser?: {
        id: string;
        name: string;
      };
      // Edit comment modal fields
      editCommentId?: string;
      editCommentContent?: string;
      editCommentImageUrl?: string;
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
      revokeUserId?: string;
      revokeUserEmail?: string;
      templateId?: string;
      templateName?: string;
      templateDescription?: string | null;
      templateLocation?: string | null;
      templateTime?: string | null;
      templateGroupId?: string | null;
      // Recurring event fields
      isRecurring?: boolean;
      recurrenceId?: string;
      recurrenceRule?: string;
      eventDate?: string;
      editAllInSeries?: boolean;
      editSingleOccurrence?: boolean;
      onSingleEdit?: () => void;
      onSeriesEdit?: () => void;
      onSingleDelete?: () => void;
      onSeriesDelete?: () => void;
      onCancelOccurrence?: () => void;
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
