"use client";

import { useState, useRef } from "react";
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
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { useEventComments } from "@/hooks/queries/useEventComments";
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
import { useImageUpload } from "@/hooks/mutations/useFileUpload";
import { toast } from "sonner";
import { useModal } from "@/hooks/use-modal";

interface EventCommentsFormProps {
  eventId: string;
}

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉", "👏"];

export default function EventCommentsForm({ eventId }: EventCommentsFormProps) {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [commentImage, setCommentImage] = useState<string | null>(null);
  const [replyImage, setReplyImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  // Image upload hooks
  const commentImageUpload = useImageUpload({
    maxSize: 5 * 1024 * 1024,
    showToasts: false,
    onSuccess: (url) => {
      setCommentImage(url);
      toast.success("Image uploaded successfully!");
    },
    onError: (error) => toast.error(error),
  });

  const replyImageUpload = useImageUpload({
    maxSize: 5 * 1024 * 1024,
    showToasts: false,
    onSuccess: (url) => {
      setReplyImage(url);
      toast.success("Image uploaded successfully!");
    },
    onError: (error) => toast.error(error),
  });

  const { data: commentsData, isLoading } = useEventComments(eventId, sortBy);
  const createCommentMutation = useCreateComment();
  const createReplyMutation = useCreateReply();
  const toggleReactionMutation = useToggleReaction();
  const { open: openModal } = useModal();

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
      parentId: "temp", // Will be set when replying
      imageUrl: undefined,
    },
  });

  const handleCommentSubmit = async (values: CreateCommentValues) => {
    try {
      await createCommentMutation.mutateAsync({
        ...values,
        imageUrl: commentImage || undefined,
      });
      commentForm.reset();
      setCommentImage(null);
      commentImageUpload.reset();
    } catch (error) {
      console.error("Failed to submit comment:", error);
    }
  };

  const handleReplySubmit = async (values: ReplyCommentValues) => {
    try {
      await createReplyMutation.mutateAsync({
        ...values,
        imageUrl: replyImage || undefined,
      });
      replyForm.reset();
      setReplyingTo(null);
      setReplyImage(null);
      replyImageUpload.reset();
    } catch (error) {
      console.error("Failed to submit reply:", error);
      toast.error("Failed to submit reply. Please try again.");
    }
  };

  const handleReaction = (commentId: string, emoji: string) => {
    // Fire and forget - rely on optimistic updates for instant feel
    toggleReactionMutation.mutate({ commentId, emoji });
    setShowEmojiPicker(null);
  };

  const handleImageUpload = (file: File, isReply = false) => {
    if (isReply) {
      replyImageUpload.upload(file);
    } else {
      commentImageUpload.upload(file);
    }
  };

  const removeImage = (isReply = false) => {
    if (isReply) {
      setReplyImage(null);
      replyImageUpload.reset();
    } else {
      setCommentImage(null);
      commentImageUpload.reset();
    }
  };

  const handleDeleteComment = (comment: EventCommentData) => {
    openModal("delete-comment", {
      commentId: comment.id,
      eventId: eventId,
      commentContent: comment.content,
      isReply: !!comment.parentId,
    });
  };

  const getReactionCounts = (reactions: EventCommentData["reactions"]) => {
    const counts: Record<
      string,
      { count: number; users: string[]; hasUserReacted: boolean }
    > = {};

    reactions.forEach((reaction) => {
      if (!counts[reaction.emoji]) {
        counts[reaction.emoji] = { count: 0, users: [], hasUserReacted: false };
      }
      counts[reaction.emoji].count++;
      counts[reaction.emoji].users.push(
        reaction.user.nickname || reaction.user.firstName
      );
      if (reaction.userId === user?.id) {
        counts[reaction.emoji].hasUserReacted = true;
      }
    });

    return counts;
  };

  const renderComment = (comment: EventCommentData, isReply = false) => {
    const reactionCounts = getReactionCounts(comment.reactions);
    const canDelete = comment.userId === user?.id;

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
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDeleteComment(comment)}
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
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              {/* Quick reactions */}
              {QUICK_REACTIONS.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className="h-6 sm:h-7 px-1.5 sm:px-2 flex-shrink-0"
                  onClick={() => handleReaction(comment.id, emoji)}
                >
                  {emoji}
                </Button>
              ))}

              {/* More emoji picker */}
              <div className="relative flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 sm:h-7 px-1.5 sm:px-2"
                  onClick={() =>
                    setShowEmojiPicker(
                      showEmojiPicker === comment.id ? null : comment.id
                    )
                  }
                >
                  😀
                </Button>

                {showEmojiPicker === comment.id && (
                  <div className="absolute top-8 left-0 sm:left-auto sm:right-0 z-50">
                    <EmojiPicker
                      onEmojiClick={(emojiData) =>
                        handleReaction(comment.id, emojiData.emoji)
                      }
                      width={280}
                      height={350}
                    />
                  </div>
                )}
              </div>

              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 sm:h-7 px-1.5 sm:px-2 flex-shrink-0"
                  onClick={() => {
                    const newReplyingTo =
                      replyingTo === comment.id ? null : comment.id;
                    setReplyingTo(newReplyingTo);
                    if (newReplyingTo) {
                      // Set the parentId when opening reply form
                      replyForm.setValue("parentId", comment.id);
                    } else {
                      // Reset form when closing
                      replyForm.reset();
                    }
                  }}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Reply</span>
                </Button>
              )}
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <form
                onSubmit={replyForm.handleSubmit(handleReplySubmit)}
                className="space-y-3 pt-3 border-t"
              >
                <div className="flex gap-2">
                  <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={user?.image || undefined} />
                    <AvatarFallback className="text-xs">
                      {user?.firstName?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-2">
                    <Input
                      {...replyForm.register("content")}
                      placeholder="Write a reply..."
                      className="text-sm w-full"
                    />

                    {/* Reply image preview */}
                    {replyImage && (
                      <div className="relative max-w-xs">
                        <Image
                          src={replyImage}
                          alt="Reply attachment"
                          width={300}
                          height={200}
                          className="w-full h-auto rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(true)}
                        >
                          ×
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-between items-center gap-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => replyFileInputRef.current?.click()}
                          disabled={replyImageUpload.isUploading}
                        >
                          <ImageIcon className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">
                            {replyImageUpload.isUploading
                              ? "Uploading..."
                              : "Image"}
                          </span>
                          <span className="sm:hidden">
                            {replyImageUpload.isUploading ? "..." : "📷"}
                          </span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={createReplyMutation.isPending}
                        className={cn(
                          createReplyMutation.isPending &&
                            "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">
                          {createReplyMutation.isPending
                            ? "Replying..."
                            : "Reply"}
                        </span>
                        <span className="sm:hidden">
                          {createReplyMutation.isPending ? "..." : "Reply"}
                        </span>
                      </Button>
                    </div>

                    {/* Reply file input */}
                    <input
                      ref={replyFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file, true);
                        }
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-3">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted rounded w-24"></div>
                    <div className="h-3 bg-muted rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      {/* Header with sort controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MessageCircle className="h-5 w-5 flex-shrink-0" />
          <h3 className="text-lg font-semibold truncate">
            Comments ({commentsData?.totalCount || 0})
          </h3>
        </div>

        <Select
          value={sortBy}
          onValueChange={(value: "newest" | "oldest") => setSortBy(value)}
        >
          <SelectTrigger className="w-28 sm:w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center gap-2">
                <SortDesc className="h-4 w-4" />
                <span className="hidden sm:inline">Newest</span>
                <span className="sm:hidden">New</span>
              </div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                <span className="hidden sm:inline">Oldest</span>
                <span className="sm:hidden">Old</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comment form */}
      <Card className="w-full">
        <CardHeader className="px-3 sm:px-6">
          <h4 className="text-sm font-medium">Add a comment</h4>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <form
            onSubmit={commentForm.handleSubmit(handleCommentSubmit)}
            className="space-y-4"
          >
            <div className="flex gap-2 sm:gap-3">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback className="text-xs">
                  {user?.firstName?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-3">
                <Input
                  {...commentForm.register("content")}
                  placeholder="What's on your mind?"
                  className="text-sm w-full"
                />

                {/* Image preview */}
                {commentImage && (
                  <div className="relative max-w-xs">
                    <Image
                      src={commentImage}
                      alt="Comment attachment"
                      width={300}
                      height={200}
                      className="w-full h-auto rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeImage(false)}
                    >
                      ×
                    </Button>
                  </div>
                )}

                <div className="flex justify-between items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={commentImageUpload.isUploading}
                    className="flex-shrink-0"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      {commentImageUpload.isUploading
                        ? "Uploading..."
                        : "Add Image"}
                    </span>
                    <span className="sm:hidden">
                      {commentImageUpload.isUploading ? "..." : "Image"}
                    </span>
                  </Button>
                  <Button
                    type="submit"
                    disabled={createCommentMutation.isPending}
                    className={cn(
                      "flex-shrink-0",
                      createCommentMutation.isPending &&
                        "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">
                      {createCommentMutation.isPending
                        ? "Posting..."
                        : "Post Comment"}
                    </span>
                    <span className="sm:hidden">
                      {createCommentMutation.isPending ? "..." : "Post"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageUpload(file, false);
                }
                // Reset input so same file can be selected again
                e.target.value = "";
              }}
            />
          </form>
        </CardContent>
      </Card>

      {/* Comments list */}
      <div className="space-y-4">
        {commentsData?.comments && commentsData.comments.length > 0 ? (
          commentsData.comments.map((comment) => renderComment(comment))
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
