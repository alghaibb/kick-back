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
import { ChipsInput, type Chip } from "@/components/ui/chips-input";
import { useUserSearch } from "@/hooks/queries/useUserSearch";
import { LoadingButton } from "@/components/ui/button";
import { useState } from "react";
import { useInviteToGroupBatch } from "@/hooks/mutations/useGroupMutations";
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
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const inviteToGroupMutation = useInviteToGroupBatch();

  const form = useForm<InviteGroupValues>({
    resolver: zodResolver(inviteGroupSchema),
    defaultValues: {
      groupId,
      email: "",
      role: "member",
    },
  });

  function onSubmit(values: InviteGroupValues) {
    const emails = Array.from(
      new Set(
        [...chips.map((c) => c.value), values.email?.trim() || ""].filter(
          Boolean
        )
      )
    );

    if (emails.length === 0) {
      return;
    }

    inviteToGroupMutation.mutate(
      {
        groupId: values.groupId,
        emails,
        role: values.role,
      },
      {
        onSuccess: (res) => {
          if (res?.succeeded?.length) {
            setInvitedEmails((prev) => [...prev, ...res.succeeded!]);
          }
          setChips([]);
          form.reset({ groupId, email: "", role: "member" });
          onSuccess?.();
        },
      }
    );
  }

  const [chips, setChips] = useState<Chip[]>([]);
  const { setQuery, results, isLoading } = useUserSearch();

  const suggestions: Chip[] = results.map((u) => ({
    id: u.id,
    value: u.email,
    label: u.nickname || u.firstName || u.email,
  }));

  const handleChipsChange = (next: Chip[]) => {
    setChips(next);
    const last = next[next.length - 1];
    if (last) {
      form.setValue("email", last.value, { shouldValidate: true });
    } else {
      form.setValue("email", "", { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Invite to {groupName}</h3>
        <p className="text-sm text-muted-foreground">
          Send an invitation to join your group. They&apos;ll receive an email
          with a link to accept.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={() => (
              <FormItem>
                <FormLabel>Invite</FormLabel>
                <FormControl>
                  <ChipsInput
                    value={chips}
                    onChange={handleChipsChange}
                    placeholder="Type a name or email, press , to add"
                    onQueryChange={setQuery}
                    suggestions={suggestions}
                    isLoading={isLoading}
                    validateEmailOnly
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

          <LoadingButton
            type="submit"
            className="w-full"
            loading={inviteToGroupMutation.isPending}
          >
            {inviteToGroupMutation.isPending
              ? "Sending Invitation..."
              : "Send Invitation"}
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
