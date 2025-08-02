"use client";

import React from "react";
import { useEventPhotos } from "@/hooks/queries/useEventPhotos";
import {
  useLikePhoto,
  useDeletePhoto,
} from "@/hooks/mutations/usePhotoMutations";
import { useAuth } from "@/hooks/use-auth";
import { useModal } from "@/hooks/use-modal";
import {
  AnimatedList,
  AnimatedListItem,
} from "@/components/ui/list-animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Heart, Trash2, User, Calendar, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PhotoGalleryProps {
  eventId: string;
}

export function PhotoGallery({ eventId }: PhotoGalleryProps) {
  const { user } = useAuth();
  const { data, isLoading, error } = useEventPhotos(eventId);
  const likeMutation = useLikePhoto();
  const deleteMutation = useDeletePhoto();
  const modal = useModal();

  const handleLike = async (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;

    try {
      await likeMutation.mutateAsync({ photoId, eventId });
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  const handleDeleteClick = (photoId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;

    modal.open("delete-photo", { photoId, eventId });
  };

  const handleConfirmDelete = async () => {
    if (!modal.data?.photoId) return;

    try {
      await deleteMutation.mutateAsync({
        photoId: modal.data.photoId,
        eventId,
      });
      modal.close();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="w-full h-48 rounded-lg mb-3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Failed to load photos</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.photos || data.photos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No photos yet</p>
          <p className="text-sm text-muted-foreground">
            Be the first to share a memory from this event!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.photos.map((photo) => (
          <AnimatedListItem key={photo.id}>
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="relative w-full h-48 bg-muted">
                        <Image
                          src={photo.imageUrl}
                          alt={photo.caption || "Event photo"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          loading="lazy"
                          className={cn(
                            "object-cover transition-transform group-hover:scale-105",
                            photo.isUploading && "opacity-50"
                          )}
                        />
                        {photo.isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={photo.isUploading}
                        >
                          {photo.isUploading
                            ? "Uploading..."
                            : "View Full Size"}
                        </Button>
                      </div>

                      <div className="absolute bottom-2 right-2 flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => handleLike(photo.id, e)}
                          disabled={likeMutation.isPending || photo.isUploading}
                          className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm transition-colors",
                            photo.isLikedByUser
                              ? "bg-red-500/80 text-white"
                              : "bg-black/60 text-white hover:bg-black/80",
                            (likeMutation.isPending || photo.isUploading) &&
                              "opacity-50"
                          )}
                        >
                          <Heart
                            className={cn(
                              "h-3 w-3",
                              photo.isLikedByUser && "fill-current"
                            )}
                          />
                          {photo._count.likes}
                        </motion.button>

                        {user?.id === photo.userId && !photo.isUploading && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => handleDeleteClick(photo.id, e)}
                            disabled={deleteMutation.isPending}
                            className={cn(
                              "p-1 rounded-full bg-black/60 text-white hover:bg-red-500/80 backdrop-blur-sm transition-colors",
                              deleteMutation.isPending && "opacity-50"
                            )}
                          >
                            <Trash2 className="h-3 w-3" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={photo.user.image || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {photo.user.nickname || photo.user.firstName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(photo.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      {photo.caption && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-7xl max-h-[95vh] p-0 flex flex-col">
                <DialogHeader className="sr-only">
                  <DialogTitle>
                    Photo by {photo.user.nickname || photo.user.firstName}
                  </DialogTitle>
                </DialogHeader>
                <div className="relative flex-1 flex flex-col min-h-0">
                  <div className="relative flex-1 flex items-center justify-center bg-black/95 min-h-[60vh]">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.caption || "Event photo"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
                      className="object-contain"
                      priority
                    />
                  </div>
                  <div className="flex-shrink-0 p-6 bg-card border-t">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={photo.user.image || undefined} />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {photo.user.nickname || photo.user.firstName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(photo.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={photo.isLikedByUser ? "default" : "outline"}
                          size="sm"
                          onClick={(e) => handleLike(photo.id, e)}
                          disabled={likeMutation.isPending}
                        >
                          <Heart
                            className={cn(
                              "h-4 w-4 mr-1",
                              photo.isLikedByUser && "fill-current"
                            )}
                          />
                          {photo._count.likes}
                        </Button>
                        {user?.id === photo.userId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleDeleteClick(photo.id, e)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {photo.caption && (
                      <div className="max-h-32 overflow-y-auto">
                        <p className="text-muted-foreground whitespace-pre-wrap break-words">
                          {photo.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </AnimatedListItem>
        ))}
      </AnimatedList>

      {/* Delete Confirmation Modal */}
      <ResponsiveModal
        open={modal.isOpen && modal.type === "delete-photo"}
        onOpenChange={(open) => !open && modal.close()}
      >
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <ResponsiveModalTitle>Delete Photo</ResponsiveModalTitle>
                <ResponsiveModalDescription>
                  Are you sure you want to delete this photo? This action cannot
                  be undone.
                </ResponsiveModalDescription>
              </div>
            </div>
          </ResponsiveModalHeader>

          <ResponsiveModalFooter>
            <Button
              variant="outline"
              onClick={modal.close}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete Photo"
              )}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </>
  );
}
