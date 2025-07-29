"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Send,
  Image as ImageIcon,
  Reply,
  MoreVertical,
  Trash2,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import {
  useInfiniteEventComments,
  useInfiniteReplies,
} from "@/hooks/queries/useInfiniteEventComments";
import {
  useCreateComment,
  useCreateReply,
  useToggleReaction,
} from "@/hooks/mutations/useCommentMutations";
import {
  createCommentSchema,
  CreateCommentValues,
  replyCommentSchema,
  ReplyCommentValues,
} from "@/validations/events/createCommentSchema";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import EmojiPicker from "emoji-picker-react";
import type { EventCommentData } from "@/hooks/queries/useEventComments";
import {
  useImageUploadForm,
  IMAGE_UPLOAD_PRESETS,
} from "@/hooks/useImageUploadForm";
import { toast } from "sonner";
import { useModal } from "@/hooks/use-modal";

interface ThreadedEventCommentsProps {
  eventId: string;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "👏"];

export default function ThreadedEventComments({
  eventId,
}: ThreadedEventCommentsProps) {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyingToUser, setReplyingToUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );

  // Image upload for main comment form
  const commentImageUpload = useImageUploadForm(undefined, undefined, {
    ...IMAGE_UPLOAD_PRESETS.comment,
    showToasts: false,
    onSuccess: () => toast.success("Image uploaded successfully!"),
    onError: (error) => toast.error(error),
  });

  // Image upload for reply form
  const replyImageUpload = useImageUploadForm(undefined, undefined, {
    ...IMAGE_UPLOAD_PRESETS.comment,
    showToasts: false,
    onSuccess: () => toast.success("Image uploaded successfully!"),
    onError: (error) => toast.error(error),
  });

  // Infinite queries
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    fetchNextPage: fetchNextComments,
    hasNextPage: hasNextComments,
    isFetchingNextPage: isFetchingNextComments,
  } = useInfiniteEventComments(eventId, sortBy);

  // Mutations
  const createCommentMutation = useCreateComment();
  const createReplyMutation = useCreateReply();
  const toggleReactionMutation = useToggleReaction();
  const { open: openModal } = useModal();

  // Forms
  const commentForm = useForm<CreateCommentValues>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: "",
      eventId,
      parentId: undefined,
      imageUrl: undefined,
    },
  });

  const replyForm = useForm<ReplyCommentValues>({
    resolver: zodResolver(replyCommentSchema),
    defaultValues: {
      content: "",
      eventId,
      parentId: "temp",
      imageUrl: undefined,
    },
  });

  // Handlers
  const handleCommentSubmit = async (values: CreateCommentValues) => {
    try {
      let imageUrl: string | undefined = undefined;

      if (commentImageUpload.currentFile) {
        imageUrl =
          (await commentImageUpload.uploadImage(
            commentImageUpload.currentFile
          )) || undefined;
      }

      await createCommentMutation.mutateAsync({
        ...values,
        imageUrl: imageUrl || undefined,
      });

      commentForm.reset();
      commentImageUpload.reset();
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const handleReplySubmit = async (values: ReplyCommentValues) => {
    if (!replyingTo) return;

    try {
      let imageUrl: string | undefined = undefined;

      if (replyImageUpload.currentFile) {
        const uploadedUrl = await replyImageUpload.uploadImage(
          replyImageUpload.currentFile
        );
        imageUrl = uploadedUrl || undefined;
      }

      // For flat threading: if replying to a reply, use the top-level parent
      // but prepend @mention to show context
      let content = values.content;
      let parentId = replyingTo;

      // If we're replying to someone specific, add @mention
      if (replyingToUser && replyingToUser.id !== user?.id) {
        content = `@${replyingToUser.name} ${values.content}`;
      }

      await createReplyMutation.mutateAsync({
        ...values,
        content,
        parentId,
        imageUrl,
      });

      replyForm.reset();
      replyImageUpload.reset();
      setReplyingTo(null);
      setReplyingToUser(null);
    } catch (error) {
      console.error("Error creating reply:", error);
    }
  };

  const handleReaction = (commentId: string, emoji: string) => {
    toggleReactionMutation.mutate({ commentId, emoji });
  };

  const handleDeleteComment = (commentId: string) => {
    openModal("delete-comment", { commentId });
  };

  const toggleRepliesExpansion = useCallback((commentId: string) => {
    setExpandedReplies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  }, []);

  const handleStartReply = useCallback(
    (comment: EventCommentData, isReplyToReply: boolean = false) => {
      if (isReplyToReply) {
        // For replies to replies, use flat threading:
        // - parentId is the top-level comment (comment.parentId if it exists, otherwise comment.id)
        // - Set up @mention for the person we're replying to
        const topLevelParentId = comment.parentId || comment.id;
        const replyToUser = {
          id: comment.userId,
          name: comment.user.nickname || comment.user.firstName,
        };

        setReplyingTo(topLevelParentId);
        setReplyingToUser(replyToUser);
      } else {
        // Standard reply to top-level comment
        setReplyingTo(comment.id);
        setReplyingToUser(null);
      }
    },
    []
  );

  // Render individual comment
  const renderComment = (
    comment: EventCommentData,
    isReply: boolean = false
  ) => {
    const reactions = comment.reactions || [];
    const reactionCounts = reactions.reduce(
      (acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = { count: 0, hasUserReacted: false };
        }
        acc[reaction.emoji].count++;
        if (reaction.userId === user?.id) {
          acc[reaction.emoji].hasUserReacted = true;
        }
        return acc;
      },
      {} as Record<string, { count: number; hasUserReacted: boolean }>
    );

    const canDelete = user?.id === comment.userId;
    const replyCount = comment._count?.replies || 0;
    const isExpanded = expandedReplies.has(comment.id);

    return (
      <div
        key={comment.id}
        className={cn(
          "w-full space-y-3",
          isReply && "ml-4 sm:ml-8 border-l-2 border-muted pl-2 sm:pl-4"
        )}
      >
        <Card className="border-0 shadow-none bg-muted/30 w-full overflow-hidden">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                  <AvatarImage src={comment.user.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {comment.user.firstName?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {comment.user.nickname || comment.user.firstName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3 px-3 sm:px-6">
            <p className="text-sm break-words">{comment.content}</p>

            {comment.imageUrl && (
              <div className="rounded-lg overflow-hidden border max-w-full">
                <Image
                  src={comment.imageUrl}
                  alt="Comment attachment"
                  width={400}
                  height={300}
                  className="w-full max-w-xs sm:max-w-sm h-auto"
                />
              </div>
            )}

            {/* Reactions */}
            {Object.keys(reactionCounts).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {Object.entries(reactionCounts).map(([emoji, data]) => (
                  <Button
                    key={emoji}
                    variant={data.hasUserReacted ? "default" : "outline"}
                    size="sm"
                    className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs"
                    onClick={() => handleReaction(comment.id, emoji)}
                  >
                    <span className="mr-1">{emoji}</span>
                    {data.count}
                  </Button>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex gap-1">
                {QUICK_REACTIONS.map((emoji) => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 hover:bg-muted"
                    onClick={() => handleReaction(comment.id, emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>

              {/* Reply button - now works on all comments */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => handleStartReply(comment, isReply)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>

              {/* Show/Hide replies button - only for top-level comments */}
              {!isReply && replyCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => toggleRepliesExpansion(comment.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  )}
                  {replyCount} {replyCount === 1 ? "reply" : "replies"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <ReplyForm
            form={replyForm}
            onSubmit={handleReplySubmit}
            onCancel={() => {
              setReplyingTo(null);
              setReplyingToUser(null);
            }}
            imageUpload={replyImageUpload}
            isSubmitting={createReplyMutation.isPending}
            replyingToUser={replyingToUser}
          />
        )}

        {/* Threaded replies */}
        {!isReply && isExpanded && (
          <RepliesSection
            eventId={eventId}
            commentId={comment.id}
            onReaction={handleReaction}
            onDelete={handleDeleteComment}
            onStartReply={handleStartReply}
          />
        )}
      </div>
    );
  };

  // Get all comments from all pages
  const allComments =
    commentsData?.pages.flatMap((page) => page.comments) || [];

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Comments
            </h3>
            <Select
              value={sortBy}
              onValueChange={(value: "newest" | "oldest") => setSortBy(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4" />
                    Newest
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    Oldest
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <form
            onSubmit={commentForm.handleSubmit(handleCommentSubmit)}
            className="space-y-3"
          >
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback>
                  {user?.firstName?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Input
                  {...commentForm.register("content")}
                  placeholder="Write a comment..."
                  className="bg-muted/50"
                />

                {/* Image preview */}
                {commentImageUpload.displayUrl && (
                  <div className="relative w-fit">
                    <Image
                      src={commentImageUpload.displayUrl}
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
                      onClick={commentImageUpload.removeImage}
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
                      onClick={() =>
                        commentImageUpload.imageRef.current?.click()
                      }
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <input
                      ref={commentImageUpload.imageRef}
                      type="file"
                      accept="image/*"
                      onChange={commentImageUpload.handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      createCommentMutation.isPending ||
                      !commentForm.watch("content")?.trim()
                    }
                    className="h-8 px-4"
                  >
                    {createCommentMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Send className="h-3 w-3 mr-1" />
                    )}
                    Comment
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comments list */}
      <div className="space-y-4">
        {isLoadingComments ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : allComments.length > 0 ? (
          <>
            {allComments.map((comment) => renderComment(comment))}

            {/* Load more button */}
            {hasNextComments && (
              <div className="flex justify-center py-4">
                <Button
                  onClick={() => fetchNextComments()}
                  disabled={isFetchingNextComments}
                  variant="outline"
                >
                  {isFetchingNextComments ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load More Comments
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Reply form component
interface ReplyFormProps {
  form: ReturnType<typeof useForm<ReplyCommentValues>>;
  onSubmit: (values: ReplyCommentValues) => void;
  onCancel: () => void;
  imageUpload: ReturnType<typeof useImageUploadForm>;
  isSubmitting: boolean;
  replyingToUser: { id: string; name: string } | null;
}

function ReplyForm({
  form,
  onSubmit,
  onCancel,
  imageUpload,
  isSubmitting,
  replyingToUser,
}: ReplyFormProps) {
  const { user } = useAuth();

  return (
    <Card className="ml-4 sm:ml-8">
      <CardContent className="pt-4">
        {/* Show who we're replying to if it's a reply-to-reply */}
        {replyingToUser && (
          <div className="mb-3 p-2 bg-muted/50 rounded-md border-l-2 border-blue-500">
            <p className="text-xs text-muted-foreground">
              Replying to{" "}
              <span className="font-medium text-foreground">
                @{replyingToUser.name}
              </span>
            </p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-6 w-6 flex-shrink-0">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback className="text-xs">
                {user?.firstName?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <Input
                {...form.register("content")}
                placeholder="Write a reply..."
                className="bg-muted/50 text-sm"
                autoFocus
              />

              {/* Image preview */}
              {imageUpload.displayUrl && (
                <div className="relative w-fit">
                  <Image
                    src={imageUpload.displayUrl}
                    alt="Reply image"
                    width={150}
                    height={100}
                    className="rounded-lg border max-h-24 w-auto object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5"
                    onClick={imageUpload.removeImage}
                  >
                    ×
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => imageUpload.imageRef.current?.click()}
                >
                  <ImageIcon className="h-3 w-3" />
                </Button>
                <input
                  ref={imageUpload.imageRef}
                  type="file"
                  accept="image/*"
                  onChange={imageUpload.handleImageChange}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="h-7 px-3 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || !form.watch("content")?.trim()}
                    className="h-7 px-3 text-xs"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Send className="h-3 w-3 mr-1" />
                    )}
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Replies section component
interface RepliesSectionProps {
  eventId: string;
  commentId: string;
  onReaction: (commentId: string, emoji: string) => void;
  onDelete: (commentId: string) => void;
  onStartReply: (comment: EventCommentData, isReplyToReply: boolean) => void;
}

function RepliesSection({
  eventId,
  commentId,
  onReaction,
  onDelete,
  onStartReply,
}: RepliesSectionProps) {
  const { user } = useAuth();

  const {
    data: repliesData,
    isLoading: isLoadingReplies,
    fetchNextPage: fetchNextReplies,
    hasNextPage: hasNextReplies,
    isFetchingNextPage: isFetchingNextReplies,
  } = useInfiniteReplies(eventId, commentId, true);

  const allReplies = repliesData?.pages.flatMap((page) => page.replies) || [];

  if (isLoadingReplies) {
    return (
      <div className="ml-4 sm:ml-8 flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allReplies.map((reply) => {
        const reactions = reply.reactions || [];
        const reactionCounts = reactions.reduce(
          (acc, reaction) => {
            if (!acc[reaction.emoji]) {
              acc[reaction.emoji] = { count: 0, hasUserReacted: false };
            }
            acc[reaction.emoji].count++;
            if (reaction.userId === user?.id) {
              acc[reaction.emoji].hasUserReacted = true;
            }
            return acc;
          },
          {} as Record<string, { count: number; hasUserReacted: boolean }>
        );

        const canDelete = user?.id === reply.userId;

        return (
          <div
            key={reply.id}
            className="ml-4 sm:ml-8 border-l-2 border-muted pl-2 sm:pl-4"
          >
            <Card className="border-0 shadow-none bg-muted/20 w-full overflow-hidden">
              <CardHeader className="pb-2 px-3 sm:px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={reply.user.image || undefined} />
                      <AvatarFallback className="text-xs">
                        {reply.user.firstName?.[0]?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">
                        {reply.user.nickname || reply.user.firstName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  {canDelete && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onDelete(reply.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-2 px-3 sm:px-4">
                <p className="text-xs break-words">{reply.content}</p>

                {reply.imageUrl && (
                  <div className="rounded-lg overflow-hidden border max-w-full">
                    <Image
                      src={reply.imageUrl}
                      alt="Reply attachment"
                      width={300}
                      height={200}
                      className="w-full max-w-xs h-auto"
                    />
                  </div>
                )}

                {/* Reactions */}
                {Object.keys(reactionCounts).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(reactionCounts).map(([emoji, data]) => (
                      <Button
                        key={emoji}
                        variant={data.hasUserReacted ? "default" : "outline"}
                        size="sm"
                        className="h-5 px-1.5 text-xs"
                        onClick={() => onReaction(reply.id, emoji)}
                      >
                        <span className="mr-1">{emoji}</span>
                        {data.count}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Quick reactions */}
                <div className="flex gap-1">
                  {QUICK_REACTIONS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1 hover:bg-muted"
                      onClick={() => onReaction(reply.id, emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>

                {/* Reply button for replies */}
                <div className="flex gap-2 text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-2 text-xs"
                    onClick={() => onStartReply(reply, true)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}

      {/* Load more replies */}
      {hasNextReplies && (
        <div className="ml-4 sm:ml-8 flex justify-center py-2">
          <Button
            onClick={() => fetchNextReplies()}
            disabled={isFetchingNextReplies}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            {isFetchingNextReplies ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : null}
            Load More Replies
          </Button>
        </div>
      )}
    </div>
  );
}
