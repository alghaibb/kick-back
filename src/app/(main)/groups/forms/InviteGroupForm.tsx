"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inviteGroupSchema,
  InviteGroupValues,
} from "@/validations/group/inviteGroupSchema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/button";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { inviteToGroupAction } from "../actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InviteGroupFormProps {
  groupId: string;
  groupName: string;
  onSuccess?: () => void;
}

export function InviteGroupForm({
  groupId,
  groupName,
  onSuccess,
}: InviteGroupFormProps) {
  const [isPending, startTransition] = useTransition();
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  const form = useForm<InviteGroupValues>({
    resolver: zodResolver(inviteGroupSchema),
    defaultValues: {
      groupId,
      email: "",
      role: "member",
    },
  });

  function onSubmit(values: InviteGroupValues) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("groupId", values.groupId);
      formData.append("email", values.email);
      formData.append("role", values.role);

      const res = await inviteToGroupAction(formData);
      if (res?.error) {
        toast.error(
          typeof res.error === "string"
            ? res.error
            : "Failed to send invitation"
        );
      } else {
        toast.success(`Invitation sent to ${values.email}!`);
        setInvitedEmails((prev) => [...prev, values.email]);
        form.reset({ groupId, email: "", role: "member" });
        onSuccess?.();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Invite to {groupName}</h3>
        <p className="text-sm text-muted-foreground">
          Send an invitation to join your group. They&apos;ll receive an email with a
          link to accept.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <LoadingButton type="submit" className="w-full" loading={isPending}>
            {isPending ? "Sending Invitation..." : "Send Invitation"}
          </LoadingButton>
        </form>
      </Form>

      {invitedEmails.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Recently Invited</h4>
          <div className="space-y-1">
            {invitedEmails.map((email, index) => (
              <div
                key={index}
                className="text-sm text-muted-foreground flex items-center gap-2"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {email}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
