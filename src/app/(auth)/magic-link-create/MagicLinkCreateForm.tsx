"use client";

import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  magicLinkCreateAccountSchema,
  MagicLinkCreateAccountValues,
} from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { magicLinkCreate } from "./actions";

export default function MagicLinkCreateForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<MagicLinkCreateAccountValues>({
    resolver: zodResolver(magicLinkCreateAccountSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  async function onSubmit(
    values: z.infer<typeof magicLinkCreateAccountSchema>
  ) {
    startTransition(async () => {
      const res = await magicLinkCreate(values);
      if (res?.error) {
        toast.error(res.error);
      } else if (res?.success) {
        toast.success(res.success);
        form.reset();
      }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="py-10 mx-auto space-y-6"
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} />
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
              <FormLabel>
                Last Name{" "}
                <span className="text-xs text-muted-foreground">
                  (Optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
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

        <EnhancedLoadingButton
          type="submit"
          className="w-full"
          loading={isPending}
          action="send"
          loadingText="Sending Magic Link..."
        >
          Send Magic Link
        </EnhancedLoadingButton>
      </form>
    </Form>
  );
}
