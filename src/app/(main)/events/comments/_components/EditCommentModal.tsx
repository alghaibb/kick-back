"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GenericModal } from "@/components/ui/generic-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useModal } from "@/hooks/use-modal";
import { useEditComment } from "@/hooks/mutations/useCommentMutations";
import {
  useImageUploadForm,
  IMAGE_UPLOAD_PRESETS,
} from "@/hooks/useImageUploadForm";
import {
  editCommentSchema,
  EditCommentValues,
} from "@/validations/events/createCommentSchema";
import { toast } from "sonner";
import { ActionLoader } from "@/components/ui/loading-animations";

export function EditCommentModal() {
  const { user } = useAuth();
  const { type, data, close } = useModal();
  const editCommentMutation = useEditComment();
  const [initialImageUrl, setInitialImageUrl] = React.useState<string | null>(
    null
  );

  // Image upload
  const imageUpload = useImageUploadForm(undefined, undefined, {
    ...IMAGE_UPLOAD_PRESETS.comment,
    showToasts: false,
    onSuccess: () => toast.success("Image uploaded successfully!"),
    onError: (error) => toast.error(error),
  });

  // Form
  const form = useForm<EditCommentValues>({
    resolver: zodResolver(editCommentSchema),
    defaultValues: {
      commentId: "",
      content: "",
      imageUrl: undefined,
    },
  });

  // Update form values when modal data changes
  React.useEffect(() => {
    if (data?.editCommentId && data?.editCommentContent) {
      form.setValue("commentId", data.editCommentId);
      form.setValue("content", data.editCommentContent);
      if (data.editCommentImageUrl) {
        form.setValue("imageUrl", data.editCommentImageUrl);
        setInitialImageUrl(data.editCommentImageUrl);
      } else {
        setInitialImageUrl(null);
      }
    }
  }, [
    data?.editCommentId,
    data?.editCommentContent,
    data?.editCommentImageUrl,
    form,
  ]);

  const handleSubmit = async (values: EditCommentValues) => {
    if (!data?.editCommentId) return;

    const submitData = {
      ...values,
      commentId: data.editCommentId,
      imageUrl: imageUpload.displayUrl || initialImageUrl || undefined,
    };

    try {
      await editCommentMutation.mutateAsync(submitData);
      form.reset();
      imageUpload.removeImage();
      setInitialImageUrl(null);
      close();
    } catch (error) {
      console.error("Edit submission error:", error);
    }
  };

  const handleCancel = () => {
    form.reset();
    imageUpload.removeImage();
    setInitialImageUrl(null);
    close();
  };

  if (type !== "edit-comment") return null;

  return (
    <GenericModal
      type="edit-comment"
      title="Edit Comment"
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
              placeholder="Edit your comment..."
              className="bg-muted/50"
              autoFocus
            />

            {/* Image preview */}
            {(imageUpload.displayUrl || initialImageUrl) && (
              <div className="relative w-fit">
                <Image
                  src={imageUpload.displayUrl || initialImageUrl || ""}
                  alt="Comment image"
                  width={200}
                  height={150}
                  className="rounded-lg border max-h-32 w-auto object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => {
                    imageUpload.removeImage();
                    setInitialImageUrl(null);
                  }}
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
                  disabled={editCommentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    editCommentMutation.isPending ||
                    !form.watch("content")?.trim()
                  }
                >
                  {editCommentMutation.isPending ? (
                    <ActionLoader action="save" size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </GenericModal>
  );
}
