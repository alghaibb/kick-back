"use client";

import { useState, useRef, useEffect } from "react";
import { useImageUpload } from "@/hooks/mutations/useFileUpload";
import { UseFormSetValue, Path, FieldValues } from "react-hook-form";
import { toast } from "sonner";

export interface ImageUploadConfig {
  maxSize?: number; // in bytes
  initialImageUrl?: string | null;
  showToasts?: boolean;
  folder?: string; // Vercel blob folder organization
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  generateUniqueName?: boolean;
}

export interface ImageUploadFormReturn {
  // File state
  currentFile: File | undefined;
  previewUrl: string | null;
  imageRef: React.RefObject<HTMLInputElement | null>;

  // Upload state
  isUploading: boolean;
  uploadError: string | null;
  uploadProgress?: number;

  // Actions
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  uploadImage: (file: File) => Promise<string | null>;
  reset: () => void;

  // Form integration
  hasImage: boolean;
  displayUrl: string | null;
  isDeleted: boolean; // Track explicit deletion
}

export function useImageUploadForm<TFormData extends FieldValues>(
  setValue?: UseFormSetValue<TFormData>,
  fieldName?: Path<TFormData>,
  config: ImageUploadConfig = {}
): ImageUploadFormReturn {
  const {
    maxSize = 4 * 1024 * 1024, // 4MB default
    initialImageUrl = null,
    showToasts = false,
    folder = "uploads",
    onSuccess,
    onError,
    generateUniqueName = true,
  } = config;

  // Normalize empty string to null
  const normalizedInitialUrl =
    initialImageUrl && initialImageUrl.trim() !== "" ? initialImageUrl : null;

  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    normalizedInitialUrl
  );
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const {
    uploadAsync,
    isUploading,
    error: uploadError,
    reset: resetUpload,
  } = useImageUpload({
    maxSize,
    generateUniqueName,
    folder,
    showToasts,
    onSuccess,
    onError,
  });

  // Handle image preview cleanup
  useEffect(() => {
    if (!currentFile) return;
    const objectUrl = URL.createObjectURL(currentFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [currentFile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size immediately on selection
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        const errorMessage = `File size must be less than ${maxSizeMB}MB`;

        if (showToasts) {
          toast.error(errorMessage);
        }
        if (onError) {
          onError(errorMessage);
        }

        // Clear the input
        if (imageRef.current) {
          imageRef.current.value = "";
        }
        return;
      }

      // Validate file type
      const allowedTypes = ["image/"];
      const isValidType = allowedTypes.some((type) =>
        type.endsWith("/") ? file.type.startsWith(type) : file.type === type
      );

      if (!isValidType) {
        const errorMessage = "Only image files are allowed";

        if (showToasts) {
          toast.error(errorMessage);
        }
        if (onError) {
          onError(errorMessage);
        }

        // Clear the input
        if (imageRef.current) {
          imageRef.current.value = "";
        }
        return;
      }

      setCurrentFile(file);
      setIsDeleted(false); // Clear deletion flag when new file is selected
      // Update form value if form integration is provided
      if (setValue && fieldName) {
        setValue(fieldName, file as never);
      }
    }
  };

  const removeImage = () => {
    setCurrentFile(undefined);
    setPreviewUrl(null); // Set to null to indicate deletion
    setIsDeleted(true); // Mark as explicitly deleted
    if (imageRef.current) {
      imageRef.current.value = "";
    }
    // Update form value if form integration is provided
    if (setValue && fieldName) {
      setValue(fieldName, undefined as never);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      return await uploadAsync(file);
    } catch (error) {
      console.error("Failed to upload image:", error);
      return null;
    }
  };

  const reset = () => {
    setCurrentFile(undefined);
    setPreviewUrl(normalizedInitialUrl);
    setIsDeleted(false);
    resetUpload();
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  return {
    // File state
    currentFile,
    previewUrl,
    imageRef,

    // Upload state
    isUploading,
    uploadError,

    // Actions
    handleImageChange,
    removeImage,
    uploadImage,
    reset,

    // Computed values
    hasImage: Boolean(
      currentFile || (previewUrl && previewUrl.trim() !== "" && !isDeleted)
    ),
    displayUrl: currentFile
      ? previewUrl
      : isDeleted
        ? null
        : previewUrl && previewUrl.trim() !== ""
          ? previewUrl
          : null,
    isDeleted,
  };
}

// Preset configurations for common use cases
export const IMAGE_UPLOAD_PRESETS = {
  avatar: { maxSize: 2 * 1024 * 1024, folder: "profile" }, // 2MB
  profile: { maxSize: 2 * 1024 * 1024, folder: "profile" }, // 2MB
  group: { maxSize: 4 * 1024 * 1024, folder: "groups" }, // 4MB
  comment: { maxSize: 5 * 1024 * 1024, folder: "comments" }, // 5MB
  eventPhoto: { maxSize: 10 * 1024 * 1024, folder: "events" }, // 10MB
} as const;

export type ImageUploadPreset = keyof typeof IMAGE_UPLOAD_PRESETS;
