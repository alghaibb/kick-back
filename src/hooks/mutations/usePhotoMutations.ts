import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { suppressPhotoLikeRefetch } from "@/hooks/queries/_likesRefetchControl";
import { useImageUpload } from "@/hooks/mutations/useFileUpload";
import {
  savePhotoMetadataAction,
  likePhotoAction,
  deletePhotoAction,
} from "@/app/(main)/events/photos/actions";

interface PhotoData {
  photos: Array<{
    id: string;
    eventId: string;
    userId: string;
    imageUrl: string;
    caption: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      firstName: string;
      nickname: string | null;
      image: string | null;
    };
    _count: { likes: number };
    isLikedByUser: boolean;
    isUploading?: boolean;
  }>;
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Use your existing image upload hook with progress tracking
  const imageUpload = useImageUpload({
    maxSize: 10 * 1024 * 1024, // 10MB for event photos
    showToasts: false, // We'll handle toasts manually
  });

  const saveMetadata = useMutation({
    mutationFn: async (data: {
      eventId: string;
      imageUrl: string;
      caption?: string;
    }) => {
      const result = await savePhotoMetadataAction(data);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
  });

  const uploadPhoto = useMutation({
    mutationFn: async (data: {
      file: File;
      eventId: string;
      caption?: string;
    }) => {
      // First upload the file using your existing system
      const imageUrl = await imageUpload.uploadAsync(data.file);

      // Then save the metadata
      const result = await saveMetadata.mutateAsync({
        eventId: data.eventId,
        imageUrl,
        caption: data.caption,
      });

      return result;
    },
    onMutate: async (data) => {
      if (!user?.id) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["event-photos", data.eventId],
      });

      // Snapshot the previous value
      const previousPhotos = queryClient.getQueryData([
        "event-photos",
        data.eventId,
      ]);

      // Optimistically add temp photo with progress
      const tempPhotoUrl = URL.createObjectURL(data.file);
      const tempPhoto = {
        id: `temp-${Date.now()}`,
        eventId: data.eventId,
        userId: user.id,
        imageUrl: tempPhotoUrl,
        caption: data.caption || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          id: user.id,
          firstName: user.firstName,
          nickname: user.nickname,
          image: user.image,
        },
        _count: { likes: 0 },
        isLikedByUser: false,
        isUploading: true,
      };

      queryClient.setQueryData(
        ["event-photos", data.eventId],
        (old: PhotoData | undefined) => ({
          photos: [tempPhoto, ...(old?.photos || [])],
        })
      );

      return { previousPhotos, eventId: data.eventId };
    },
    onSuccess: (result, variables) => {
      // Replace temp photo with real one
      queryClient.setQueryData(
        ["event-photos", variables.eventId],
        (old: PhotoData | undefined) => {
          if (!old?.photos) return old;

          const filteredPhotos = old.photos.filter(
            (photo) => !photo.id.startsWith("temp-")
          );
          return {
            photos: [result.photo, ...filteredPhotos],
          };
        }
      );

      toast.success("Photo uploaded successfully! 📸");

      // Invalidate notifications so attendees get photo notifications immediately
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousPhotos && context?.eventId) {
        queryClient.setQueryData(
          ["event-photos", context.eventId],
          context.previousPhotos
        );
      }
      console.error("Upload photo error:", error);
      toast.error(error.message || "Failed to upload photo");
    },
  });

  return {
    ...uploadPhoto,
    uploadProgress: imageUpload.isUploading
      ? 50
      : uploadPhoto.isPending
        ? 75
        : 0,
  };
}

export function useLikePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["photo-like"],
    mutationFn: async (data: { photoId: string; eventId: string }) => {
      // Fire and forget - don't wait for server response for instant feel
      likePhotoAction({ photoId: data.photoId }).catch((error) => {
        console.error("Photo like error (background):", error);
      });
      return { success: true }; // Always return success for optimistic UI
    },
    onMutate: async ({ photoId, eventId }) => {
      // If there is a pending like mutation on this photo, do nothing to avoid double toggles
      const isMutatingSame = queryClient
        .getMutationCache()
        .getAll()
        .some((m) => {
          const v = m.state.variables as
            | { photoId?: string; eventId?: string }
            | undefined;
          return (
            m.state.status === "pending" &&
            v?.photoId === photoId &&
            v?.eventId === eventId
          );
        });
      if (isMutatingSame) return;
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["event-photos", eventId] });

      // Snapshot the previous value
      const previousPhotos = queryClient.getQueryData([
        "event-photos",
        eventId,
      ]);

      // Optimistically update the like status
      queryClient.setQueryData(
        ["event-photos", eventId],
        (old: PhotoData | undefined) => {
          if (!old?.photos) return old;

          return {
            photos: old.photos.map((photo) => {
              if (photo.id === photoId) {
                const wasLiked = photo.isLikedByUser === true;
                return {
                  ...photo,
                  isLikedByUser: !wasLiked,
                  _count: {
                    ...photo._count,
                    likes: Math.max(
                      0,
                      wasLiked ? photo._count.likes - 1 : photo._count.likes + 1
                    ),
                  },
                };
              }
              return photo;
            }),
          };
        }
      );

      // Suppress polling refresh for this photo briefly to avoid bounce
      suppressPhotoLikeRefetch(photoId, 800);
      return { previousPhotos, eventId };
    },
    onError: (error: Error, variables, context) => {
      // Only rollback and show error if something went really wrong
      console.error("Photo like error:", error);
      if (context?.previousPhotos && context?.eventId) {
        queryClient.setQueryData(
          ["event-photos", context.eventId],
          context.previousPhotos
        );
      }
      // Don't show toast error - likes should feel instant even if they fail
    },
    // No onSuccess invalidation; rely on optimistic state + polling to refresh
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { photoId: string; eventId: string }) => {
      const result = await deletePhotoAction({ photoId: data.photoId });
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    onMutate: async ({ photoId, eventId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["event-photos", eventId] });

      // Snapshot the previous value
      const previousPhotos = queryClient.getQueryData([
        "event-photos",
        eventId,
      ]);

      // Optimistically remove the photo
      queryClient.setQueryData(
        ["event-photos", eventId],
        (old: PhotoData | undefined) => {
          if (!old?.photos) return old;

          return {
            photos: old.photos.filter((photo) => photo.id !== photoId),
          };
        }
      );

      return { previousPhotos, eventId };
    },
    onSuccess: () => {
      toast.success("Photo deleted successfully!");
    },
    onError: (error: Error, variables, context) => {
      // Rollback on error
      if (context?.previousPhotos && context?.eventId) {
        queryClient.setQueryData(
          ["event-photos", context.eventId],
          context.previousPhotos
        );
      }
      console.error("Delete photo error:", error);
      toast.error(error.message || "Failed to delete photo");
    },
  });
}
