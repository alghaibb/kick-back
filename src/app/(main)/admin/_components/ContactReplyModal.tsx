"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { Button, LoadingButton } from "@/components/ui/button";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { useModal } from "@/hooks/use-modal";
import { useContactReply } from "@/hooks/queries/useAdminContacts";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ContactReplyModal() {
  const { type, data, close } = useModal();
  const contactReplyMutation = useContactReply();
  const [replyMessage, setReplyMessage] = useState("");

  if (type !== "contact-reply") {
    return null;
  }

  // Type assertion for contact reply data
  const contactData = data as {
    contactId: string;
    contactEmail: string;
    contactSubject: string;
    contactMessage: string;
  };

  if (
    !contactData?.contactId ||
    !contactData?.contactEmail ||
    !contactData?.contactSubject ||
    !contactData?.contactMessage
  ) {
    return null;
  }

  const handleReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    try {
      await contactReplyMutation.mutateAsync({
        contactId: contactData.contactId,
        replyMessage: replyMessage.trim(),
      });

      toast.success("Reply sent successfully");
      setReplyMessage("");
      close();
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send reply");
    }
  };

  return (
    <GenericModal
      type="contact-reply"
      title="Reply to Contact Message"
      description={
        <>
          Reply to <span className="font-bold">{contactData.contactEmail}</span>{" "}
          regarding their message.
        </>
      }
      showCancel={false}
      onCancel={close}
    >
      <div className="flex flex-col gap-6 p-6">
        {/* Original Message */}
        <div className="relative overflow-hidden rounded-xl border border-blue-200/50 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-900/10 p-4 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <h4 className="font-semibold text-blue-700 dark:text-blue-300">
                Original Message
              </h4>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Subject: {contactData.contactSubject}
              </p>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed whitespace-pre-wrap">
                  {contactData.contactMessage}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reply Form */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Your Reply
          </label>
          <AutosizeTextarea
            placeholder="Type your reply here..."
            value={replyMessage}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setReplyMessage(e.target.value)
            }
            className="min-h-[120px] resize-none"
            disabled={contactReplyMutation.isPending}
          />
          <p className="text-xs text-muted-foreground">
            This reply will be sent to {contactData.contactEmail}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={close}
            disabled={contactReplyMutation.isPending}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="default"
            onClick={handleReply}
            loading={contactReplyMutation.isPending}
            icon={<Send className="h-4 w-4" />}
          >
            Send Reply
          </LoadingButton>
        </div>
      </div>
    </GenericModal>
  );
}
