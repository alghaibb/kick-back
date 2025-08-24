"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  acceptInviteSchema,
  AcceptInviteValues,
} from "@/validations/group/inviteGroupSchema";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import { useTransition, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { acceptGroupInviteAction } from "../actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { InviteData } from "@/types/invite-data";
import { ActionLoader } from "@/components/ui/loading-animations";

interface AcceptInviteFormProps {
  token: string;
}

type InviteStatus = "loading" | "valid" | "invalid" | "accepted" | "error";

export function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<InviteStatus>("loading");
  const [inviteData, setInviteData] = useState<InviteData>(null);
  const router = useRouter();

  const form = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      token,
    },
  });

  const validateToken = useCallback(async () => {
    try {
      // Just validate the token exists and is valid, don't accept it yet
      const response = await fetch(
        `/api/groups/invites/validate?token=${token}`
      );
      const data = await response.json();

      if (!response.ok || data.error) {
        setStatus("invalid");
        setInviteData({ error: data.error || "Invalid invitation" });
      } else {
        setStatus("valid");
        setInviteData(data.invite);
      }
    } catch (error) {
      console.error("Failed to validate invitation:", error);
      setStatus("error");
      setInviteData({ error: "Failed to validate invitation" });
    }
  }, [token]);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  function onSubmit(values: AcceptInviteValues) {
    // Prevent double submission
    if (isPending || status === "accepted") return;

    startTransition(async () => {
      try {
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
      } catch (error) {
        console.error("Failed to accept invitation:", error);
        toast.error("Failed to accept invitation");
        setStatus("error");
        setInviteData({ error: "Failed to accept invitation" });
      }
    });
  }

  if (status === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActionLoader action="sync" size="sm" />
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
            {inviteData && "error" in inviteData
              ? inviteData.error
              : "This invitation is invalid or has expired."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedLoadingButton
            onClick={() => router.push("/dashboard")}
            className="w-full"
            action="update"
            loadingText="Going to Dashboard..."
          >
            Go to Dashboard
          </EnhancedLoadingButton>
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
            You have successfully joined{" "}
            {inviteData && "name" in inviteData ? inviteData.name : "the group"}
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Redirecting you to the groups page...
          </div>
          <EnhancedLoadingButton
            onClick={() => router.push("/groups")}
            className="w-full"
            action="update"
            loadingText="Going to Groups..."
          >
            Go to Groups
          </EnhancedLoadingButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accept Group Invitation</CardTitle>
        <CardDescription>
          {inviteData && "groupName" in inviteData
            ? `You've been invited to join "${inviteData.groupName}" by ${inviteData.inviterName}`
            : "Click the button below to accept your invitation and join the group."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {inviteData &&
          "groupDescription" in inviteData &&
          inviteData.groupDescription && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {inviteData.groupDescription}
              </p>
            </div>
          )}
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
            <EnhancedLoadingButton
              type="submit"
              className="w-full"
              loading={isPending}
              disabled={isPending}
              action="update"
              loadingText="Accepting Invite..."
            >
              Accept Invitation
            </EnhancedLoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
