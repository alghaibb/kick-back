"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  acceptInviteSchema,
  AcceptInviteValues,
} from "@/validations/group/inviteGroupSchema";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { LoadingButton } from "@/components/ui/button";
import { useTransition, useEffect, useState } from "react";
import { toast } from "sonner";
import { acceptGroupInviteAction } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface AcceptInviteFormProps {
  token: string;
}

type InviteStatus = "loading" | "valid" | "invalid" | "accepted" | "error";

export function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<InviteStatus>("loading");
  const [inviteData, setInviteData] = useState<any>(null);
  const router = useRouter();

  const form = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      token,
    },
  });

  useEffect(() => {
    // Validate token on component mount
    validateToken();
  }, [token]);

  async function validateToken() {
    try {
      const formData = new FormData();
      formData.append("token", token);

      const res = await acceptGroupInviteAction(formData);
      if (res?.error) {
        setStatus("invalid");
        setInviteData({ error: res.error });
      } else if (res?.success) {
        setStatus("accepted");
        setInviteData(res.group);
        toast.success("Successfully joined the group!");
        setTimeout(() => {
          router.push("/groups");
        }, 2000);
      }
    } catch (error) {
      setStatus("error");
      setInviteData({ error: "Failed to validate invitation" });
    }
  }

  function onSubmit(values: AcceptInviteValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("token", values.token);

      const res = await acceptGroupInviteAction(formData);
      if (res?.error) {
        toast.error(
          typeof res.error === "string"
            ? res.error
            : "Failed to accept invitation"
        );
        setStatus("invalid");
        setInviteData({ error: res.error });
      } else if (res?.success) {
        setStatus("accepted");
        setInviteData(res.group);
        toast.success("Successfully joined the group!");
        setTimeout(() => {
          router.push("/groups");
        }, 2000);
      }
    });
  }

  if (status === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 animate-spin" />
            Validating Invitation
          </CardTitle>
          <CardDescription>
            Please wait while we validate your invitation...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === "invalid" || status === "error") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Invalid Invitation
          </CardTitle>
          <CardDescription>
            {inviteData?.error || "This invitation is invalid or has expired."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingButton
            onClick={() => router.push("/dashboard")}
            className="w-full"
          >
            Go to Dashboard
          </LoadingButton>
        </CardContent>
      </Card>
    );
  }

  if (status === "accepted") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Welcome to the Group!
          </CardTitle>
          <CardDescription>
            You have successfully joined {inviteData?.name || "the group"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Redirecting you to the groups page...
          </div>
          <LoadingButton
            onClick={() => router.push("/groups")}
            className="w-full"
          >
            Go to Groups
          </LoadingButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accept Group Invitation</CardTitle>
        <CardDescription>
          Click the button below to accept your invitation and join the group.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input type="hidden" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <LoadingButton type="submit" className="w-full" loading={isPending}>
              {isPending ? "Accepting..." : "Accept Invitation"}
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
