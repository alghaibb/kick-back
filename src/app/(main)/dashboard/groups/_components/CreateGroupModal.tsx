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
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { createGroupAction } from '../actions';

export default function CreateGroupModal() {
  // const { isOpen, close } = useGroupModal();
  const [isPending, startTransition] = useTransition();
  const { type, isOpen, close } = useGroupModals();

  const form = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      invites: '',
    },
  });

  if (type !== 'create') return null;

  function onSubmit(values: z.infer<typeof createGroupSchema>) {
    startTransition(async () => {
      const res = await createGroupAction(values);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        form.reset();
        close();
      }
    });
  }

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Create New Group</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Fill out the form to create a group and invite members via email.
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
                    <Input placeholder="My Group" {...field} />
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
                      placeholder="What is this group for?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="invites"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite Emails</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email1@example.com, email2@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ResponsiveModalFooter>
              <LoadingButton
                type="submit"
                className="w-full cursor-pointer"
                loading={isPending}
                disabled={isPending}
              >
                {isPending ? 'Creating...' : 'Create Group'}
              </LoadingButton>
            </ResponsiveModalFooter>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
