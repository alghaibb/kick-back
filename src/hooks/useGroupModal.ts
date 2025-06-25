import { create } from 'zustand';

interface GroupModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useGroupModal = create<GroupModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
