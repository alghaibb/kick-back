'use client';

import { Button, LoadingButton } from '@/components/ui/button';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { useDeleteModal } from '@/hooks/useDeleteGroupModal';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { deleteGroupAction } from '../actions';

export default function DeleteGroupModal() {
  const { isOpen, groupId, close } = useDeleteModal();
  const [isPending, startTransition] = useTransition();

  const onConfirm = () => {
    if (!groupId) return;

    startTransition(async () => {
      const res = await deleteGroupAction(groupId);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Group deleted successfully');
        close();
      }
    });
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Are you sure?</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            This action cannot be undone. The group and its data will be
            permanently deleted.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <ResponsiveModalFooter>
          <Button
            variant="ghost"
            onClick={close}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <LoadingButton
            variant="destructive"
            onClick={onConfirm}
            loading={isPending}
            disabled={isPending}
            className="cursor-pointer text-background"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </LoadingButton>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
