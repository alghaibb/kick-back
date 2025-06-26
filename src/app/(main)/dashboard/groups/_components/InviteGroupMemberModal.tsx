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
import { useGroupModals } from '@/hooks/useModal';
import { emailField } from '@/validations/fields';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { inviteSingleEmail } from '../actions';

const inviteSchema = z.object({
  email: emailField,
});

export default function InviteGroupMemberModal() {
  // const { isOpen, groupId, close } = useInviteModal();
  const [isPending, startTransition] = useTransition();
  const { type, isOpen, close, groupId } = useGroupModals();

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '' },
  });

  if (type !== 'invite') return null;

  function onSubmit(data: z.infer<typeof inviteSchema>) {
    if (!groupId) return;
    startTransition(async () => {
      const res = await inviteSingleEmail(groupId, data.email);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(res.success);
        form.reset();
        close();
      }
    });
  }

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(o) => !o && close()}>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>Invite Member</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Enter the email of the person you want to invite to this group.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
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
                className="w-full cursor-pointer"
              >
                {isPending ? 'Sending...' : 'Send Invite'}
              </LoadingButton>
            </ResponsiveModalFooter>
          </form>
        </Form>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
