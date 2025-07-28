import { create } from "zustand";

export type ModalType =
  | "create-group"
  | "invite-group"
  | "edit-group"
  | "create-event"
  | "edit-event"
  | "delete-event"
  | "delete-photo"
  | "delete-comment";

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
