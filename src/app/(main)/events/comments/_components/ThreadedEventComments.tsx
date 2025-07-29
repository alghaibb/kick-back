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

// Threaded replies section component - defined before main component
interface ThreadedRepliesSectionProps {
  eventId: string;
  commentId: string;
  renderComment: (comment: EventCommentData, depth: number) => React.ReactNode;
  expandedReplies: Set<string>;
  toggleRepliesExpansion: (commentId: string) => void;
}

function ThreadedRepliesSection({
  eventId,
  commentId,
  renderComment,
  expandedReplies,
  toggleRepliesExpansion,
}: ThreadedRepliesSectionProps) {
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
      <div className="flex justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Build the reply tree for proper threading
  const buildReplyTree = (replies: EventCommentData[]): EventCommentData[] => {
    const replyMap = new Map<string, EventCommentData[]>();
    const topLevelReplies: EventCommentData[] = [];

    // Group replies by their parent
    replies.forEach((reply) => {
      if (reply.parentId === commentId) {
        // Direct reply to the main comment
        topLevelReplies.push(reply);
      } else {
        // Reply to another reply
        const parentId = reply.parentId || commentId;
        if (!replyMap.has(parentId)) {
          replyMap.set(parentId, []);
        }
        replyMap.get(parentId)!.push(reply);
      }
    });

    // Recursively attach nested replies
    const attachNestedReplies = (
      comment: EventCommentData
    ): EventCommentData => {
      const nestedReplies = replyMap.get(comment.id) || [];
      return {
        ...comment,
        replies: nestedReplies.map(attachNestedReplies),
      };
    };

    return topLevelReplies.map(attachNestedReplies);
  };

  // Recursively render threaded replies with proper infinite nesting
  const renderThreadedReply = (
    reply: EventCommentData,
    depth: number
  ): React.ReactNode => {
    const nestedReplies = reply.replies || [];
    const hasNestedReplies = nestedReplies.length > 0;
    const isExpanded = expandedReplies.has(reply.id);
    const replyCount = reply._count?.replies || nestedReplies.length;

    return (
      <div key={reply.id}>
        {/* Render the reply itself */}
        <div className="relative">
          {renderComment(reply, depth + 1)}

          {/* Show/Hide nested replies button for replies with children */}
          {hasNestedReplies && (
            <div
              className="flex items-center mt-1"
              style={{ marginLeft: `${Math.min(depth * 32 + 48, 200)}px` }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => toggleRepliesExpansion(reply.id)}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide {replyCount} {replyCount === 1 ? "reply" : "replies"}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show {replyCount} {replyCount === 1 ? "reply" : "replies"}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Recursively render nested replies when expanded */}
        {hasNestedReplies && isExpanded && (
          <div className="mt-2">
            {nestedReplies.map((nestedReply) =>
              renderThreadedReply(nestedReply, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const threadedReplies = buildReplyTree(allReplies);

  return (
    <div className="space-y-2">
      {threadedReplies.map((reply) => renderThreadedReply(reply, 0))}

      {/* Load more replies */}
      {hasNextReplies && (
        <div className="flex justify-center py-2">
          <Button
            onClick={() => fetchNextReplies()}
            disabled={isFetchingNextReplies}
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {isFetchingNextReplies ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : null}
            Show more replies
          </Button>
        </div>
      )}
    </div>
  );
}

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
      const parentId = replyingTo;

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
    openModal("delete-comment", {
      commentId,
      eventId,
      isReply: false,
      commentContent: "",
    });
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
    (comment: EventCommentData, isNestedReply: boolean = false) => {
      if (isNestedReply) {
        // For true threading: reply directly to this comment
        // The new reply will be a child of this comment
        setReplyingTo(comment.id);
        setReplyingToUser({
          id: comment.userId,
          name: comment.user.nickname || comment.user.firstName,
        });
      } else {
        // Standard reply to top-level comment
        setReplyingTo(comment.id);
        setReplyingToUser(null);
      }
    },
    []
  );

  // Render individual comment with infinite threading depth
  const renderComment = (comment: EventCommentData, depth: number = 0) => {
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

    // Calculate styling based on depth with graceful degradation for deep nesting
    const baseIndentation = 32; // 32px per level
    const minIndentation = 16; // Minimum indentation for very deep threads

    // Use progressive indentation that gets smaller for very deep threads
    let marginLeft: number;
    if (depth <= 3) {
      marginLeft = depth * baseIndentation;
    } else if (depth <= 6) {
      // Levels 4-6: smaller increments
      marginLeft = 3 * baseIndentation + (depth - 3) * 20;
    } else {
      // Levels 7+: minimal increments to prevent overflow
      marginLeft = 3 * baseIndentation + 3 * 20 + (depth - 6) * minIndentation;
    }

    // Avatar size scales down but never smaller than 20px
    const avatarSize = Math.max(20, 32 - depth * 2);

    // Font size scales down but stays readable
    const fontSize = depth > 2 ? "text-xs" : depth > 0 ? "text-sm" : "text-sm";
    const timeSize = depth > 3 ? "text-xs" : "text-xs";

    // Connection line calculations for infinite depth
    const connectionLeft = -(
      16 +
      Math.min(depth - 1, 3) * baseIndentation +
      Math.max(0, depth - 4) * 20 +
      Math.max(0, depth - 6) * minIndentation
    );
    const connectionHeight = depth === 1 ? 20 : Math.max(24, 32 - depth * 2);

    return (
      <div
        key={comment.id}
        className="group relative"
        style={{ marginLeft: `${marginLeft}px` }}
      >
        {/* Connection lines for infinite threading */}
        {depth > 0 && (
          <>
            {/* Vertical line connecting to parent */}
            <div
              className="absolute bg-border opacity-60"
              style={{
                left: `${connectionLeft}px`,
                top: "0px",
                width: "1px", // Thinner lines for deep threads
                height: `${connectionHeight}px`,
              }}
            />
            {/* Horizontal line to comment */}
            <div
              className="absolute bg-border opacity-60"
              style={{
                left: `-${Math.min(16, 12 + depth)}px`, // Shorter lines for deep threads
                top: `${Math.floor(connectionHeight / 2)}px`,
                width: `${Math.min(16, 12 + depth)}px`,
                height: "1px",
              }}
            />
          </>
        )}

        <div
          className="flex gap-2 py-1.5"
          style={{ gap: `${Math.max(8, 12 - depth)}px` }}
        >
          {/* Avatar with infinite scaling */}
          <Avatar
            className="flex-shrink-0"
            style={{ width: `${avatarSize}px`, height: `${avatarSize}px` }}
          >
            <AvatarImage src={comment.user.image || undefined} />
            <AvatarFallback
              className={cn(fontSize, "font-medium")}
              style={{ fontSize: `${Math.max(10, 14 - depth)}px` }}
            >
              {comment.user.firstName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className={cn("font-medium text-foreground", fontSize)}>
                {comment.user.nickname || comment.user.firstName}
              </span>
              <span className={cn("text-muted-foreground", timeSize)}>
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>

              {/* Show nesting indicator for deep threads */}
              {depth > 4 && (
                <span className="text-xs text-muted-foreground/50 px-1 py-0.5 bg-muted rounded">
                  +{depth}
                </span>
              )}

              {canDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity",
                        depth > 3
                          ? "h-4 w-4"
                          : depth > 1
                            ? "h-5 w-5"
                            : "h-6 w-6"
                      )}
                    >
                      <MoreVertical
                        className={cn(depth > 3 ? "h-2.5 w-2.5" : "h-3 w-3")}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Comment content */}
            <div className={cn("text-foreground leading-relaxed", fontSize)}>
              {comment.content}
            </div>

            {/* Image attachment - smaller for deep threads */}
            {comment.imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border">
                <Image
                  src={comment.imageUrl}
                  alt="Comment attachment"
                  width={Math.max(150, 400 - depth * 30)}
                  height={Math.max(100, 300 - depth * 25)}
                  className={cn(
                    "w-full h-auto object-cover",
                    depth > 3
                      ? "max-w-32 max-h-24"
                      : depth > 1
                        ? "max-w-48 max-h-32"
                        : "max-w-sm max-h-60"
                  )}
                />
              </div>
            )}

            {/* Reactions - smaller for deep threads */}
            {Object.keys(reactionCounts).length > 0 && (
              <div className="flex flex-wrap gap-0.5 mt-1.5">
                {Object.entries(reactionCounts).map(([emoji, data]) => (
                  <Button
                    key={emoji}
                    variant={data.hasUserReacted ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "px-1.5",
                      depth > 3
                        ? "h-4 text-xs"
                        : depth > 1
                          ? "h-5 text-xs"
                          : "h-6 text-xs"
                    )}
                    onClick={() => handleReaction(comment.id, emoji)}
                  >
                    <span className="mr-0.5">{emoji}</span>
                    {data.count}
                  </Button>
                ))}
              </div>
            )}

            {/* Action buttons - scale with depth */}
            <div className="flex items-center gap-0.5 mt-1.5">
              {/* Quick reactions - hide for very deep threads to save space */}
              {depth < 6 && (
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {QUICK_REACTIONS.slice(0, depth > 3 ? 3 : 5).map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "p-0 hover:bg-muted",
                        depth > 3
                          ? "h-5 w-5"
                          : depth > 1
                            ? "h-6 w-6"
                            : "h-7 w-7"
                      )}
                      onClick={() => handleReaction(comment.id, emoji)}
                    >
                      <span
                        className={cn(
                          depth > 3
                            ? "text-xs"
                            : depth > 1
                              ? "text-xs"
                              : "text-sm"
                        )}
                      >
                        {emoji}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Reply button - always available for infinite threading */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "px-2 font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                  depth > 3
                    ? "h-5 text-xs"
                    : depth > 1
                      ? "h-6 text-xs"
                      : "h-7 text-xs"
                )}
                onClick={() => handleStartReply(comment, depth > 0)}
              >
                <Reply
                  className={cn(
                    depth > 3 ? "h-2.5 w-2.5 mr-0.5" : "h-3 w-3 mr-1"
                  )}
                />
                Reply
              </Button>

              {/* Show/Hide replies button - only for top-level comments */}
              {depth === 0 && replyCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  onClick={() => toggleRepliesExpansion(comment.id)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide replies
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      {replyCount} {replyCount === 1 ? "reply" : "replies"}
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-2">
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
              </div>
            )}

            {/* Infinite threaded replies - only show for top-level */}
            {depth === 0 && isExpanded && (
              <div className="mt-3">
                <ThreadedRepliesSection
                  eventId={eventId}
                  commentId={comment.id}
                  renderComment={renderComment}
                  expandedReplies={expandedReplies}
                  toggleRepliesExpansion={toggleRepliesExpansion}
                />
              </div>
            )}
          </div>
        </div>
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
    <div className="bg-muted/30 rounded-lg p-3 border">
      {/* Show who we're replying to if it's a reply-to-reply */}
      {replyingToUser && (
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Reply className="h-3 w-3" />
          <span>
            Replying to{" "}
            <span className="font-medium text-foreground">
              @{replyingToUser.name}
            </span>
          </span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="flex gap-2">
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage src={user?.image || undefined} />
            <AvatarFallback className="text-xs">
              {user?.firstName?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Input
              {...form.register("content")}
              placeholder={
                replyingToUser
                  ? `Reply to @${replyingToUser.name}...`
                  : "Add a reply..."
              }
              className="bg-background border-border text-sm"
              autoFocus
            />

            {/* Image preview */}
            {imageUpload.displayUrl && (
              <div className="relative w-fit">
                <Image
                  src={imageUpload.displayUrl}
                  alt="Reply image"
                  width={200}
                  height={120}
                  className="rounded-md border max-h-24 w-auto object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 h-5 w-5"
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
                <ImageIcon className="h-3 w-3 mr-1" />
                <span className="text-xs">Image</span>
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
    </div>
  );
}
