'use client';

import { LoadingButton } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { AutosizeTextarea } from '@/components/ui/textarea';
import { useGroupModals } from '@/hooks/useModal';
import { createGroupSchema, CreateGroupValues } from '@/validations/group';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateGroupAction } from '../actions';

export default function EditGroupModal() {
  // const { isOpen, close, groupId, name, description } = useEditGroupModal();
  const [isPending, startTransition] = useTransition();
  const { type, isOpen, close, groupId, name, description } = useGroupModals();

  const form = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      invites: '', // ignored on edit
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.setValue('name', name || '');
      form.setValue('description', description || '');
      form.setValue('invites', ''); // no-op for editing
    }
  }, [isOpen, name, description, form]);

  if (type !== 'edit') return null;

  function onSubmit(values: CreateGroupValues) {
    if (!groupId) return;

    startTransition(async () => {
      const res = await updateGroupAction(groupId, values);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(res.success);
        close();
      }
    });
  }

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Edit Group</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Change the group name or description below.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Updated Group" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <AutosizeTextarea
                      placeholder="Updated group purpose..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ResponsiveModalFooter>
              <LoadingButton
                loading={isPending}
                disabled={isPending}
                type="submit"
                className="w-full"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </LoadingButton>
            </ResponsiveModalFooter>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
