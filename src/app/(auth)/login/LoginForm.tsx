"use client";

import { Button, LoadingButton } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { loginSchema, LoginValues } from "@/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { login } from "./actions";

export default function LoginForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    startTransition(async () => {
      const res = await login(values);
      if (res?.error) {
        toast.error(res.error);
      } else {
        window.location.href = "/dashboard";
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email"
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 ease-in-out"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 ease-in-out"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            asChild
            variant="link"
            className="px-0 text-primary hover:text-primary/80"
          >
            <Link href="/forgot-password">Forgot password?</Link>
          </Button>
        </div>

        <LoadingButton type="submit" className="w-full" loading={isPending}>
          {isPending ? "Logging in..." : "Log in"}
        </LoadingButton>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground font-medium">
              or
            </span>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-full" asChild>
          <Link href="/magic-link-login">Continue with Magic Link</Link>
        </Button>
      </form>
    </Form>
  );
}
