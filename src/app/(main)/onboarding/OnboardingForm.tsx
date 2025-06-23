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
import {
  onboardingSchema,
  OnboardingValues,
} from '@/validations/onboardingSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { onboarding } from './actions';

export default function OnboardingForm({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const imageRef = useRef<HTMLInputElement>(null);
  const [preview] = useState<string | null>(user.image ?? null);
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      nickname: user.nickname ?? '',
    },
  });

  function onSubmit(values: z.infer<typeof onboardingSchema>) {
    startTransition(async () => {
      let imageUrl = user.image ?? null;

      if (currentFile) {
        const formData = new FormData();
        formData.append('file', currentFile);

        const uploadRes = await fetch('/api/blob/upload', {
          method: 'POST',
          body: formData,
        });

        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      const res = await onboarding({
        ...values,
        image: imageUrl,
        previousImage: user.image,
      });

      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success) {
        toast.success(res.success);
        router.push('/dashboard');
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="py-10 mx-auto space-y-8 max-w-xl"
      >
        <div className="text-center">
          <Avatar className="mx-auto size-20">
            <AvatarImage
              src={
                currentFile
                  ? URL.createObjectURL(currentFile)
                  : preview ?? undefined
              }
              alt="Profile"
            />
            <AvatarFallback>
              {user.firstName?.[0] ?? user.nickname?.[0] ?? 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Your first name" {...field} />
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
                <Input placeholder="Your last name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nickname (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Your nickname" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, onBlur, name, ref } }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  name={name}
                  accept="image/*"
                  disabled={isPending}
                  ref={imageRef}
                  onBlur={onBlur}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                      setCurrentFile(file);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          type="submit"
          className="w-full md:w-auto"
          loading={isPending}
          disabled={isPending}
        >
          {isPending ? 'Saving...' : 'Continue to Dashboard'}
        </LoadingButton>
      </form>
    </Form>
  );
}
