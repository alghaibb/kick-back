'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { PasswordInput } from '@/components/ui/password-input';
import { Separator } from '@/components/ui/separator';
import {
  AccountSettingsValues,
  accountSettingsSchema,
} from '@/validations/user/accountSettingsSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { updateAccountSettings } from './actions';

export default function AccountSettingsForm({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const [currentFile, setCurrentFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.image ?? null
  );
  const imageRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const isCredentialsUser = !!user.password;

  const form = useForm<AccountSettingsValues>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      email: user.email ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      nickname: user.nickname ?? '',
      newPassword: isCredentialsUser ? '' : undefined,
      confirmPassword: isCredentialsUser ? '' : undefined,
    },
  });

  useEffect(() => {
    if (!currentFile) return;
    const objectUrl = URL.createObjectURL(currentFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [currentFile]);

  function onSubmit(values: AccountSettingsValues) {
    startTransition(async () => {
      let imageUrl = user.image;

      if (currentFile) {
        const formData = new FormData();
        formData.append('file', currentFile);

        const upload = await fetch('/api/blob/upload', {
          method: 'POST',
          body: formData,
        });

        if (!upload.ok) {
          toast.error('Failed to upload image');
          return;
        }

        const { url } = await upload.json();
        imageUrl = url;
      }

      const res = await updateAccountSettings({
        ...values,
        image: imageUrl,
        previousImage: user.image ?? undefined,
      });

      if (res?.error) toast.error(res.error);
      else {
        toast.success(res.success);
        router.refresh();
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="py-10 mx-auto space-y-8 max-w-xl"
      >
        {/* Profile Image */}
        <div className="text-center">
          <Avatar className="mx-auto size-20">
            <AvatarImage src={previewUrl ?? undefined} />
            <AvatarFallback>
              {(user.firstName?.[0] ?? user.nickname?.[0] ?? 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Section: Personal Information */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" value={user.email ?? ''} disabled />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Profile Image</FormLabel>
            <FormControl>
              <Input
                type="file"
                accept="image/*"
                ref={imageRef}
                disabled={isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCurrentFile(file);
                }}
              />
            </FormControl>
          </FormItem>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nickname (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Nickname" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Divider */}
        {isCredentialsUser && (
          <>
            <Separator />
            {/* Section: Change Password */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Change Password</h2>
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="*******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="*******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <Separator />

        {/* Save Button */}
        <LoadingButton
          type="submit"
          className="w-full md:w-auto cursor-pointer"
          loading={isPending}
          disabled={isPending}
        >
          {isPending ? 'Saving Changes...' : 'Save Changes'}
        </LoadingButton>
      </form>
    </Form>
  );
}
