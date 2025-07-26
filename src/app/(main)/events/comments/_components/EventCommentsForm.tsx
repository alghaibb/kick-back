"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  createCommentSchema,
  CreateCommentValues,
} from "@/validations/events/createCommentSchema";
import { useEventComments } from "@/hooks/queries/useEventComments";
import {
  useCreateComment,
  useDeleteComment,
} from "@/hooks/mutations/useCommentMutations";
import { useAuth } from "@/hooks/use-auth";
import { MessageCircle, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/date-utils";

interface EventCommentsFormProps {
  eventId: string;
}

export default function EventCommentsForm({ eventId }: EventCommentsFormProps) {
  const { user } = useAuth();
  const { data: comments, isLoading } = useEventComments(eventId);
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();

  const form = useForm<CreateCommentValues>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: "",
      eventId,
    },
  });

  const onSubmit = async (values: CreateCommentValues) => {
    try {
      await createCommentMutation.mutateAsync(values);
      form.reset();
    } catch (error) {
      console.error("Failed to create comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const getUserDisplayName = (user: {
    firstName: string;
    lastName: string | null;
    nickname: string | null;
  }) => {
    if (user.nickname) return user.nickname;
    return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`;
  };

  const getUserInitials = (user: {
    firstName: string;
    lastName: string | null;
    nickname: string | null;
  }) => {
    const displayName = getUserDisplayName(user);
    return displayName.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Discussion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-9 w-28" />
            </div>
          </div>

          <Separator />

          {/* Comments skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 p-4 bg-muted/30 rounded-lg">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Discussion
          {comments && comments.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({comments.length}{" "}
              {comments.length === 1 ? "comment" : "comments"})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add a comment</FormLabel>
                  <FormControl>
                    <AutosizeTextarea
                      placeholder="Share updates, ask questions, or coordinate details..."
                      {...field}
                      minHeight={80}
                      maxHeight={200}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <LoadingButton
                type="submit"
                loading={createCommentMutation.isPending}
                disabled={!form.watch("content")?.trim()}
                size="sm"
              >
                {createCommentMutation.isPending
                  ? "Posting..."
                  : "Post Comment"}
              </LoadingButton>
            </div>
          </form>
        </Form>

        {/* Comments List */}
        {comments && comments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex gap-3 p-4 bg-muted/30 rounded-lg"
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.user.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(comment.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {getUserDisplayName(comment.user)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(new Date(comment.createdAt), {
                            includeTime: true,
                          })}
                        </span>
                      </div>
                      {user?.id === comment.userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {comments && comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No comments yet</p>
            <p className="text-xs">Be the first to start the discussion!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
