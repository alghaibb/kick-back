"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
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
  Edit,
  SortAsc,
  SortDesc,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useInfiniteEventComments,
  useInfiniteReplies,
} from "@/hooks/queries/useInfiniteEventComments";
import {
  useCreateComment,
  useToggleReaction,
} from "@/hooks/mutations/useCommentMutations";
import {
  createCommentSchema,
  CreateCommentValues,
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
import { ActionLoader } from "@/components/ui/loading-animations";

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
        <ActionLoader
          action="sync"
          size="sm"
          className="text-muted-foreground"
        />
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
              <ActionLoader action="sync" size="sm" className="mr-1" />
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

  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );

  // Use the existing mobile hook
  const isMobile = useIsMobile();

  // Image upload for main comment form
  const commentImageUpload = useImageUploadForm(undefined, undefined, {
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
    (comment: EventCommentData) => {
      // Open reply modal instead of inline form
      openModal("reply-comment", {
        eventId,
        parentCommentId: comment.id,
        replyingToUser: {
          id: comment.user.id,
          name: comment.user.nickname || comment.user.firstName,
        },
      });
    },
    [eventId, openModal]
  );

  const handleEditComment = useCallback(
    (comment: EventCommentData) => {
      // Open edit modal
      openModal("edit-comment", {
        editCommentId: comment.id,
        editCommentContent: comment.content,
        editCommentImageUrl: comment.imageUrl || undefined,
      });
    },
    [openModal]
  );

  // Memoized comment component to prevent unnecessary re-renders
  const CommentItem = memo(
    ({ comment, depth = 0 }: { comment: EventCommentData; depth: number }) => {
      // Memoize reaction counts to prevent recalculation on every render
      const reactionCounts = useMemo(() => {
        const reactions = comment.reactions || [];
        const currentUserId = user?.id;
        return reactions.reduce(
          (acc, reaction) => {
            if (!acc[reaction.emoji]) {
              acc[reaction.emoji] = { count: 0, hasUserReacted: false };
            }
            acc[reaction.emoji].count++;
            if (reaction.userId === currentUserId) {
              acc[reaction.emoji].hasUserReacted = true;
            }
            return acc;
          },
          {} as Record<string, { count: number; hasUserReacted: boolean }>
        );
      }, [comment.reactions]);

      const canDelete = user?.id === comment.userId;
      const replyCount = comment._count?.replies || 0;
      const isExpanded = expandedReplies.has(comment.id);

      // Calculate responsive indentation based on mobile/desktop
      const marginLeft = isMobile
        ? (() => {
            // Mobile: MUCH more compact - you should see this difference immediately
            if (depth === 0) return 0;
            if (depth === 1) return 16; // Much smaller first level (was ~32px)
            if (depth === 2) return 24; // Very small second level (was ~64px)
            // Deep levels get minimal additional space
            return 24 + (depth - 2) * 8;
          })()
        : (() => {
            // Desktop: Original logic with reasonable max
            const baseIndentation = 32;
            const minIndentation = 16;
            const maxDesktopIndent = 300; // Reasonable max for desktop

            let indentation: number;
            if (depth <= 3) {
              indentation = depth * baseIndentation;
            } else if (depth <= 6) {
              indentation = 3 * baseIndentation + (depth - 3) * 20;
            } else {
              indentation =
                3 * baseIndentation + 3 * 20 + (depth - 6) * minIndentation;
            }

            return Math.min(indentation, maxDesktopIndent);
          })();

      // Responsive avatar size
      const avatarSize = isMobile
        ? Math.max(14, 20 - depth * 1.5) // Mobile: much smaller avatars
        : Math.max(20, 32 - depth * 2); // Desktop: original logic

      // Responsive font sizes
      const { fontSize, timeSize } = isMobile
        ? (() => {
            // Mobile: more aggressive font scaling
            if (depth > 3) return { fontSize: "text-xs", timeSize: "text-xs" };
            if (depth > 1) return { fontSize: "text-xs", timeSize: "text-xs" };
            return { fontSize: "text-sm", timeSize: "text-xs" };
          })()
        : (() => {
            // Desktop: original logic
            const fontSize =
              depth > 2 ? "text-xs" : depth > 0 ? "text-sm" : "text-sm";
            const timeSize = depth > 3 ? "text-xs" : "text-xs";
            return { fontSize, timeSize };
          })();

      // Responsive connection line calculations
      const { connectionLeft, connectionHeight } = isMobile
        ? (() => {
            // Mobile: simplified connection lines that match new indentation
            if (depth === 1)
              return { connectionLeft: -12, connectionHeight: 16 };
            if (depth === 2)
              return { connectionLeft: -16, connectionHeight: 16 };
            return { connectionLeft: -20, connectionHeight: 14 };
          })()
        : (() => {
            // Desktop: original complex logic
            const baseIndentation = 32;
            const minIndentation = 16;
            const connectionLeft = -(
              16 +
              Math.min(depth - 1, 3) * baseIndentation +
              Math.max(0, depth - 4) * 20 +
              Math.max(0, depth - 6) * minIndentation
            );
            const connectionHeight =
              depth === 1 ? 20 : Math.max(24, 32 - depth * 2);
            return { connectionLeft, connectionHeight };
          })();

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
                  left: `-${isMobile ? (depth === 1 ? 12 : depth === 2 ? 16 : 20) : Math.min(16, 12 + depth)}px`,
                  top: `${Math.floor(connectionHeight / 2)}px`,
                  width: `${isMobile ? (depth === 1 ? 12 : depth === 2 ? 16 : 20) : Math.min(16, 12 + depth)}px`,
                  height: "1px",
                }}
              />
            </>
          )}

          <div
            className="flex py-1.5"
            style={{
              gap: `${isMobile ? Math.max(4, 8 - depth) : Math.max(8, 12 - depth)}px`,
            }}
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
                  {comment.editedAt && (
                    <span className="ml-1 text-xs text-muted-foreground/70">
                      (edited)
                    </span>
                  )}
                </span>

                {/* Removed confusing depth indicator */}

                {(canDelete || isMobile) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "transition-opacity",
                          isMobile
                            ? "opacity-100 h-6 w-6"
                            : "opacity-0 group-hover:opacity-100 h-5 w-5"
                        )}
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      {isMobile && (
                        <DropdownMenuItem
                          onClick={() => handleStartReply(comment)}
                        >
                          <Reply className="h-3 w-3 mr-2" />
                          Reply
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => handleEditComment(comment)}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
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

              {/* Reactions - mobile responsive */}
              {Object.keys(reactionCounts).length > 0 && (
                <div className="flex flex-wrap gap-0.5 mt-1.5">
                  {Object.entries(reactionCounts).map(([emoji, data]) => (
                    <Button
                      key={emoji}
                      variant={data.hasUserReacted ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "px-1.5",
                        isMobile
                          ? "h-6 text-xs"
                          : depth > 3
                            ? "h-4 text-xs"
                            : "h-5 text-xs"
                      )}
                      onClick={() => handleReaction(comment.id, emoji)}
                    >
                      <span className="mr-0.5">{emoji}</span>
                      {data.count}
                    </Button>
                  ))}
                </div>
              )}

              {/* Action buttons - mobile responsive */}
              <div className="flex items-center gap-0.5 mt-1.5 flex-wrap">
                {/* Quick reactions - always visible on mobile, hover on desktop */}
                <div
                  className={cn(
                    "flex gap-0.5 transition-opacity",
                    isMobile
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  {QUICK_REACTIONS.slice(
                    0,
                    isMobile ? 3 : depth > 3 ? 3 : 5
                  ).map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "p-0 hover:bg-muted",
                        isMobile
                          ? "h-6 w-6"
                          : depth > 3
                            ? "h-5 w-5"
                            : depth > 1
                              ? "h-6 w-6"
                              : "h-7 w-7"
                      )}
                      onClick={() => handleReaction(comment.id, emoji)}
                    >
                      <span className={cn(isMobile ? "text-sm" : "text-xs")}>
                        {emoji}
                      </span>
                    </Button>
                  ))}
                </div>

                {/* Reply button - hidden on mobile (moved to three dots menu) */}
                {!isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "px-2 font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                      depth > 3 ? "h-5 text-xs" : "h-6 text-xs"
                    )}
                    onClick={() => handleStartReply(comment)}
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                )}

                {/* Show/Hide replies button - mobile responsive */}
                {depth === 0 && replyCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                      isMobile ? "h-6" : "h-7"
                    )}
                    onClick={() => toggleRepliesExpansion(comment.id)}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        {isMobile ? "Hide" : "Hide replies"}
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        {isMobile
                          ? replyCount.toString()
                          : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                      </>
                    )}
                  </Button>
                )}
              </div>

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
    }
  );

  CommentItem.displayName = "CommentItem";

  // Render comment wrapper that uses the memoized component
  const renderComment = useCallback(
    (comment: EventCommentData, depth: number = 0) => {
      return <CommentItem key={comment.id} comment={comment} depth={depth} />;
    },
    [CommentItem]
  );

  // Get all comments from all pages
  const allComments = React.useMemo(() => {
    return commentsData?.pages.flatMap((page) => page.comments) || [];
  }, [commentsData?.pages]);

  // Calculate total comments count (including replies)
  const totalCommentsCount = React.useMemo(() => {
    const countReplies = (comment: EventCommentData): number => {
      return (
        1 +
        (comment.replies?.reduce(
          (sum, reply) => sum + countReplies(reply),
          0
        ) || 0)
      );
    };

    return allComments.reduce(
      (total, comment) => total + countReplies(comment),
      0
    );
  }, [allComments]);

  return (
    <div className="space-y-6">
      {/* Comment form - mobile responsive */}
      <Card>
        <CardHeader className={cn("pb-4", isMobile && "pb-2 px-3 py-3")}>
          <div className="flex items-center justify-between">
            <h3
              className={cn(
                "font-semibold flex items-center gap-2",
                isMobile ? "text-base" : "text-lg"
              )}
            >
              <MessageCircle className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} />
              Comments
              {totalCommentsCount > 0 && (
                <span
                  className={cn(
                    "font-normal text-muted-foreground",
                    isMobile ? "text-sm" : "text-base"
                  )}
                >
                  ({totalCommentsCount})
                </span>
              )}
            </h3>
            <Select
              value={sortBy}
              onValueChange={(value: "newest" | "oldest") => setSortBy(value)}
            >
              <SelectTrigger
                className={cn(isMobile ? "w-24 h-8 text-xs" : "w-32")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  <div className="flex items-center gap-2">
                    <SortDesc className="h-4 w-4" />
                    {isMobile ? "New" : "Newest"}
                  </div>
                </SelectItem>
                <SelectItem value="oldest">
                  <div className="flex items-center gap-2">
                    <SortAsc className="h-4 w-4" />
                    {isMobile ? "Old" : "Oldest"}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent
          className={cn("space-y-4", isMobile && "px-3 py-3 space-y-3")}
        >
          <form
            onSubmit={commentForm.handleSubmit(handleCommentSubmit)}
            className={cn("space-y-3", isMobile && "space-y-2")}
          >
            <div className={cn("flex gap-3", isMobile && "gap-2")}>
              <Avatar
                className={cn(
                  "flex-shrink-0",
                  isMobile ? "h-6 w-6" : "h-8 w-8"
                )}
              >
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className={cn(isMobile && "text-xs")}>
                  {user?.firstName?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className={cn("flex-1 space-y-3", isMobile && "space-y-2")}>
                <Input
                  {...commentForm.register("content")}
                  placeholder="Write a comment..."
                  className={cn("bg-muted/50", isMobile && "h-8 text-sm")}
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
                      className={cn("px-2", isMobile ? "h-7" : "h-8")}
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
                    className={cn(
                      "px-4",
                      isMobile ? "h-7 text-xs px-3" : "h-8"
                    )}
                  >
                    {createCommentMutation.isPending ? (
                      <ActionLoader action="send" size="sm" className="mr-1" />
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
            <ActionLoader action="sync" size="lg" />
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
                    <ActionLoader action="sync" size="sm" className="mr-2" />
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
