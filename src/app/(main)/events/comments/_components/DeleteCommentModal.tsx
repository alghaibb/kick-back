"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { ResponsiveModalFooter } from "@/components/ui/responsive-modal";
import { Button, LoadingButton } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useDeleteComment } from "@/hooks/mutations/useCommentMutations";

export function DeleteCommentModal() {
  const { type, close, data } = useModal();
  const deleteCommentMutation = useDeleteComment();

  const handleDelete = () => {
    if (!data?.commentId || !data?.eventId) return;

    deleteCommentMutation.mutate(
      { commentId: data.commentId, eventId: data.eventId },
      {
        onSuccess: () => {
          close();
        },
      }
    );
  };

  if (type !== "delete-comment") return null;

  const itemType = data?.isReply ? "reply" : "comment";
  const previewContent = data?.commentContent
    ? data.commentContent.length > 50
      ? `${data.commentContent.substring(0, 50)}...`
      : data.commentContent
    : "this comment";

  return (
    <GenericModal
      type="delete-comment"
      title={`Delete ${itemType}`}
      className="space-y-4"
      showCancel={false}
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this {itemType}? This action cannot be
          undone.
        </p>

        {data?.commentContent && (
          <div className="p-3 bg-muted rounded-lg border-l-4 border-destructive">
            <p className="text-sm italic text-muted-foreground">
              &ldquo;{previewContent}&rdquo;
            </p>
          </div>
        )}
      </div>

      <ResponsiveModalFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:space-x-2">
        <Button onClick={close} variant="outline" className="sm:flex-1">
          Cancel
        </Button>
        <LoadingButton
          variant="destructive"
          onClick={handleDelete}
          loading={deleteCommentMutation.isPending}
          className="sm:flex-1"
        >
          {deleteCommentMutation.isPending
            ? `Deleting ${itemType}...`
            : `Delete ${itemType}`}
        </LoadingButton>
      </ResponsiveModalFooter>
    </GenericModal>
  );
}
