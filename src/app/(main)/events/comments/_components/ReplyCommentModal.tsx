"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GenericModal } from "@/components/ui/generic-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useModal } from "@/hooks/use-modal";
import { useCreateReply } from "@/hooks/mutations/useCommentMutations";
import {
  useImageUploadForm,
  IMAGE_UPLOAD_PRESETS,
} from "@/hooks/useImageUploadForm";
import {
  replyCommentSchema,
  ReplyCommentValues,
} from "@/validations/events/createCommentSchema";
import { toast } from "sonner";

export function ReplyCommentModal() {
  const { user } = useAuth();
  const { type, data, close } = useModal();
  const createReplyMutation = useCreateReply();

  // Image upload
  const imageUpload = useImageUploadForm(undefined, undefined, {
    ...IMAGE_UPLOAD_PRESETS.comment,
    showToasts: false,
    onSuccess: () => toast.success("Image uploaded successfully!"),
    onError: (error) => toast.error(error),
  });

  // Form
  const form = useForm<ReplyCommentValues>({
    resolver: zodResolver(replyCommentSchema),
    defaultValues: {
      content: "",
      eventId: "",
      parentId: "",
      imageUrl: undefined,
    },
  });

  // Update form values when modal data changes
  React.useEffect(() => {
    if (data?.eventId && data?.parentCommentId) {
      form.setValue("eventId", data.eventId);
      form.setValue("parentId", data.parentCommentId);
    }
  }, [data?.eventId, data?.parentCommentId, form]);

  const handleSubmit = async (values: ReplyCommentValues) => {
    if (!data?.eventId || !data?.parentCommentId) return;

    const submitData = {
      ...values,
      eventId: data.eventId,
      parentId: data.parentCommentId,
      imageUrl: imageUpload.displayUrl || undefined,
    };

    try {
      await createReplyMutation.mutateAsync(submitData);
      form.reset();
      imageUpload.removeImage();
      close();
    } catch (error) {
      console.error("Reply submission error:", error);
    }
  };

  const handleCancel = () => {
    form.reset();
    imageUpload.removeImage();
    close();
  };

  if (type !== "reply-comment") return null;

  const replyingToUser = data?.replyingToUser;

  return (
    <GenericModal
      type="reply-comment"
      title={`Reply to ${replyingToUser?.name || "comment"}`}
      onCancel={handleCancel}
      showCancel={false}
      className="space-y-4"
    >
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={user?.image || undefined} />
            <AvatarFallback>
              {user?.firstName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Input
              {...form.register("content")}
              placeholder={`Reply to ${replyingToUser?.name || "comment"}...`}
              className="bg-muted/50"
              autoFocus
            />

            {/* Image preview */}
            {imageUpload.displayUrl && (
              <div className="relative w-fit">
                <Image
                  src={imageUpload.displayUrl}
                  alt="Reply image"
                  width={200}
                  height={150}
                  className="rounded-lg border max-h-32 w-auto object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={imageUpload.removeImage}
                >
                  ×
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => imageUpload.imageRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <input
                  ref={imageUpload.imageRef}
                  type="file"
                  accept="image/*"
                  onChange={imageUpload.handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={createReplyMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createReplyMutation.isPending ||
                    !form.watch("content")?.trim()
                  }
                >
                  {createReplyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Reply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </GenericModal>
  );
}
