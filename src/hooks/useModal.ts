import { create } from 'zustand';

type ModalType = 'create' | 'edit' | 'invite' | 'delete' | 'view-members' | null;

interface GroupModalStore {
  type: ModalType;
  isOpen: boolean;
  groupId: string | null;
  name?: string;
  description?: string | null;
  open: (type: ModalType, payload?: { groupId?: string; name?: string; description?: string | null }) => void;
  close: () => void;
}

export const useGroupModals = create<GroupModalStore>((set) => ({
  type: null,
  isOpen: false,
  groupId: null,
  name: '',
  description: null,
  open: (type, payload) =>
    set({
      type,
      isOpen: true,
      groupId: payload?.groupId ?? null,
      name: payload?.name ?? '',
      description: payload?.description ?? '',
    }),
  close: () =>
    set({
      type: null,
      isOpen: false,
      groupId: null,
      name: '',
      description: null,
    }),
}));