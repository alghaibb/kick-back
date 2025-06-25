import { create } from 'zustand';

interface DeleteModalStore {
  isOpen: boolean;
  groupId: string | null;
  open: (groupId: string) => void;
  close: () => void;
}

export const useDeleteModal = create<DeleteModalStore>((set) => ({
  isOpen: false,
  groupId: null,
  open: (groupId) => set({ isOpen: true, groupId }),
  close: () => set({ isOpen: false, groupId: null }),
}));
