"use client";

import { LoadingButton } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { magicLinkLoginSchema, MagicLinkLoginValues } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { magicLinkLogin } from "./actions";

export default function MagicLinkLoginForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<MagicLinkLoginValues>({
    resolver: zodResolver(magicLinkLoginSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof magicLinkLoginSchema>) {
    startTransition(async () => {
      const res = await magicLinkLogin(values);
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

        <LoadingButton
          type="submit"
          className="w-full"
          loading={isPending}
          disabled={isPending}
        >
          {isPending ? "Sending Magic Link..." : "Login with Magic Link"}
        </LoadingButton>

      </form>
    </Form>
  );
}
