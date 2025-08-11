"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
// Removed Input - replaced by ChipsInput
import { ChipsInput, type Chip } from "@/components/ui/chips-input";
import { useUserSearch } from "@/hooks/queries/useUserSearch";
import { Label } from "@/components/ui/label";
import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import { Loader2, Mail, CheckCircle, XCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { inviteToEventBatchAction } from "../actions";
import { inviteToEventFormSchema } from "@/validations/events/inviteToEventSchema";

export function InviteToEventModal() {
  const { type, close, data } = useModal();
  const [email, setEmail] = useState("");
  const [chips, setChips] = useState<Chip[]>([]);
  const { setQuery, results, isLoading: isSearching } = useUserSearch();
  const suggestions: Chip[] = results.map((u) => ({
    id: u.id,
    value: u.email,
    label: u.nickname || u.firstName || u.email,
  }));
  const [isLoading, setIsLoading] = useState(false);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  // Validation logic - only render if we have the required data
  if (type !== "invite-event" || !data?.eventId || !data?.eventName)
    return null;

  const eventId = data.eventId;
  const eventName = data.eventName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allEmails = [
      ...chips.map((c) => c.value),
      ...email
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
    ];

    if (allEmails.length === 0) {
      toast.error("Please enter at least one email address");
      return;
    }

    // Parse comma-separated emails
    const emailList = Array.from(new Set(allEmails));

    if (emailList.length === 0) {
      toast.error("Please enter at least one valid email address");
      return;
    }

    // Validate emails using Zod schema
    try {
      const validatedData = inviteToEventFormSchema.parse({
        emails: emailList,
      });
      setIsLoading(true);
      const batchResult = await inviteToEventBatchAction(
        eventId,
        validatedData.emails
      );
      const successfulEmails: string[] = batchResult?.succeeded || [];
      const failedEmails: string[] = batchResult?.failed || [];

      // Show results
      if (successfulEmails.length > 0) {
        const message =
          successfulEmails.length === 1
            ? `Invitation sent to ${successfulEmails[0]}`
            : `Invitations sent to ${successfulEmails.length} people`;
        toast.success(message);
        setInvitedEmails((prev) => [...prev, ...successfulEmails]);
      }

      if (failedEmails.length > 0) {
        const message =
          failedEmails.length === 1
            ? `Failed to send invitation to ${failedEmails[0]}`
            : `Failed to send invitations to ${failedEmails.length} people`;
        toast.error(message);
      }

      setEmail("");
      setChips([]);
    } catch (error) {
      console.error("Error inviting to event:", error);
      toast.error("Please enter valid email addresses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setInvitedEmails([]);
    close();
  };

  return (
    <GenericModal
      type="invite-event"
      title="Invite to Event"
      className="space-y-4"
      showCancel={false}
    >
      <div className="text-sm text-muted-foreground mb-4">
        Send invitations to &quot;{eventName}&quot; via email
      </div>

      {/* Instructions */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">How to invite multiple people:</p>
          <p>
            Separate email addresses with commas. Only users who have signed up
            for the app can be invited.
          </p>
          <p className="text-xs mt-1">
            Example: friend@example.com, colleague@work.com, family@home.com
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Addresses</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <ChipsInput
                value={chips}
                onChange={setChips}
                placeholder="Type a name or email, press , to add"
                onQueryChange={setQuery}
                suggestions={suggestions}
                isLoading={isSearching}
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !email.trim()}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Recently Invited */}
        {invitedEmails.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Recently Invited
            </Label>
            <div className="space-y-1">
              {invitedEmails.map((invitedEmail, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm p-2 bg-green-50 dark:bg-green-950/20 rounded-md"
                >
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="flex-1">{invitedEmail}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setInvitedEmails((prev) =>
                        prev.filter((_, i) => i !== index)
                      )
                    }
                    className="h-6 w-6 p-0"
                  >
                    <XCircle className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleClose}>
          Close
        </Button>
      </div>
    </GenericModal>
  );
}
