'use client';

import { Button } from '@/components/ui/button';
import { EnhancedLoadingButton } from '@/components/ui/enhanced-loading-button';
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
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal';
import { resendOTPSchema, ResendOTPValues } from '@/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { resendOTP } from '../actions';

export default function ResendOTPModal() {
  const [isPending, startTransition] = useTransition();
  const [cooldown, setCooldown] = useState<number>(0);

  const form = useForm<ResendOTPValues>({
    resolver: zodResolver(resendOTPSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    const cooldownExpireTime = localStorage.getItem('otpCooldownExpire');

    if (cooldownExpireTime) {
      const expireTimestamp = parseInt(cooldownExpireTime, 10);
      const remainingTime = Math.ceil((expireTimestamp - Date.now()) / 1000);

      if (remainingTime > 0) {
        setCooldown(remainingTime);
      } else {
        localStorage.removeItem('otpCooldownExpire');
      }
    }
  }, []);

  async function onSubmit(values: z.infer<typeof resendOTPSchema>) {
    startTransition(async () => {
      const res = await resendOTP(values);
      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success) {
        toast.success(res.success);
        form.reset();

        const cooldownEndTime = Date.now() + 60000;
        localStorage.setItem('otpCooldownExpire', cooldownEndTime.toString());
        setCooldown(60);
      }
    });
  }

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          const newCooldown = prev - 1;
          if (newCooldown <= 0) {
            localStorage.removeItem('otpCooldownExpire');
            clearInterval(timer);
          }
          return newCooldown;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [cooldown]);

  return (
    <ResponsiveModalContent>
      <ResponsiveModalHeader>
        <ResponsiveModalTitle>Resend OTP</ResponsiveModalTitle>
        <ResponsiveModalDescription>
          Please enter your email address to resend the OTP. Ensure you have
          access to this email as the OTP will be sent there.
        </ResponsiveModalDescription>
      </ResponsiveModalHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="johndoe@gmail.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ResponsiveModalFooter className="gap-3 md:gap-1">
            <ResponsiveModalClose asChild>
              <Button variant="outline">Cancel</Button>
            </ResponsiveModalClose>
            <EnhancedLoadingButton
              type="submit"
              className="w-full"
              loading={isPending}
              action="send"
              loadingText="Sending OTP..."
            >
              Send OTP
            </EnhancedLoadingButton>
          </ResponsiveModalFooter>
        </form>
      </Form>
    </ResponsiveModalContent>
  );
}
