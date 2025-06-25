import { create } from 'zustand';

interface InviteModalStore {
  isOpen: boolean;
  groupId: string | null;
  open: (groupId: string) => void;
  close: () => void;
}

export const useInviteModal = create<InviteModalStore>((set) => ({
  isOpen: false,
  groupId: null,
  open: (groupId) => set({ isOpen: true, groupId }),
  close: () => set({ isOpen: false, groupId: null }),
}));
