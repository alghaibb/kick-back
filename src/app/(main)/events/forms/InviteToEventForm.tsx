"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ChipsInput, type Chip } from "@/components/ui/chips-input";
import { useUserSearch } from "@/hooks/queries/useUserSearch";
import {
  inviteToEventFormSchema,
  type InviteToEventFormValues,
} from "@/validations/events/inviteToEventSchema";
import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import { useInviteToEventBatch } from "@/hooks/mutations/useEventMutations";

interface InviteToEventFormProps {
  eventId: string;
  eventName: string;
  onSuccess?: () => void;
}

export function InviteToEventForm({
  eventId,
  eventName,
  onSuccess,
}: InviteToEventFormProps) {
  const [chips, setChips] = useState<Chip[]>([]);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const inviteMutation = useInviteToEventBatch();

  const form = useForm<InviteToEventFormValues>({
    resolver: zodResolver(inviteToEventFormSchema),
    defaultValues: { emails: [] },
  });

  const { setQuery, results, isLoading } = useUserSearch();
  const suggestions: Chip[] = results.map((u) => ({
    id: u.id,
    value: u.email,
    label: u.nickname || u.firstName || u.email,
  }));

  const handleChipsChange = (next: Chip[]) => {
    setChips(next);
    const deduped = Array.from(new Set(next.map((c) => c.value)));
    form.setValue("emails", deduped, { shouldValidate: true });
  };

  const onSubmit = (values: InviteToEventFormValues) => {
    const emails = Array.from(new Set(values.emails.filter(Boolean)));
    if (emails.length === 0) return;

    inviteMutation.mutate(
      { eventId, emails },
      {
        onSuccess: (res) => {
          const succeeded = (res?.succeeded ?? []) as string[];
          if (succeeded.length)
            setInvitedEmails((prev) => [...prev, ...succeeded]);
          setChips([]);
          form.reset({ emails: [] });
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Inviting to &quot;<span className="font-bold">{eventName}</span>&quot;
        </div>
        <FormField
          control={form.control}
          name="emails"
          render={() => (
            <FormItem>
              <FormLabel>Email Addresses</FormLabel>
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

        <EnhancedLoadingButton
          type="submit"
          loading={inviteMutation.isPending}
          action="send"
          loadingText="Sending Invitations..."
          className="w-full sm:w-auto"
        >
          Send
        </EnhancedLoadingButton>

        {invitedEmails.length > 0 && (
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">
              Recently Invited
            </span>
            {invitedEmails.map((email, idx) => (
              <div
                key={`${email}-${idx}`}
                className="text-sm text-muted-foreground"
              >
                {email}
              </div>
            ))}
          </div>
        )}
      </form>
    </Form>
  );
}
