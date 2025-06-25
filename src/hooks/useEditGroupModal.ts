import { create } from 'zustand';

interface EditGroupModalStore {
  isOpen: boolean;
  groupId: string | null;
  name: string;
  description: string | null;
  open: (payload: { groupId: string; name: string; description: string | null }) => void;
  close: () => void;
}

export const useEditGroupModal = create<EditGroupModalStore>((set) => ({
  isOpen: false,
  groupId: null,
  name: '',
  description: null,
  open: ({ groupId, name, description }) =>
    set({ isOpen: true, groupId, name, description }),
  close: () => set({ isOpen: false, groupId: null, name: '', description: null }),
}));
