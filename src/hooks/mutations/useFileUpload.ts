"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export interface FileUploadOptions {
  maxSize?: number; // in bytes, default 4MB
  allowedTypes?: string[]; // mime types, default: images
  generateUniqueName?: boolean; // default: true
  folder?: string; // folder organization: profile, groups, events, comments
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
  showToasts?: boolean; // default: true
}

interface UploadResponse {
  url: string;
}

interface UploadError {
  error: string;
}

// File upload API function
async function uploadFile(
  file: File,
  options: FileUploadOptions = {}
): Promise<string> {
  const {
    maxSize = 4 * 1024 * 1024, // 4MB default
    allowedTypes = ["image/"],
    generateUniqueName = true,
    folder = "uploads",
    onProgress,
  } = options;

  // Validate file type
  const isValidType = allowedTypes.some((type) =>
    type.endsWith("/") ? file.type.startsWith(type) : file.type === type
  );

  if (!isValidType) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
    );
  }

  // Validate file size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }

  // Generate unique filename if requested
  let fileToUpload = file;
  if (generateUniqueName) {
    const ext = file.name.split(".").pop();
    const base = file.name.replace(/\.[^/.]+$/, "");
    const uniqueName = `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    fileToUpload = new File([file], uniqueName, { type: file.type });
  }

  // Create FormData
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("folder", folder);

  // Upload with progress tracking if supported
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: UploadResponse = JSON.parse(xhr.responseText);
          if (!response.url) {
            reject(new Error("No URL returned from upload"));
            return;
          }
          resolve(response.url);
        } catch (error) {
          console.error("Failed to parse upload response:", error);
          reject(new Error("Invalid response format"));
        }
      } else {
        try {
          const errorResponse: UploadError = JSON.parse(xhr.responseText);
          reject(new Error(errorResponse.error || "Upload failed"));
        } catch (error) {
          console.error("Failed to parse error response:", error);
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.open("POST", "/api/blob/upload");
    xhr.send(formData);
  });
}

export function useFileUpload(options: FileUploadOptions = {}) {
  const { onSuccess, onError, showToasts = true } = options;

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadFile(file, options),
    onSuccess: (url: string) => {
      if (showToasts) {
        toast.success("File uploaded successfully!");
      }
      onSuccess?.(url);
    },
    onError: (error: Error) => {
      console.error("Upload error:", error);
      const errorMessage = error.message || "Failed to upload file";

      if (showToasts) {
        toast.error(errorMessage);
      }
      onError?.(errorMessage);
    },
  });

  return {
    // Upload function
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,

    // States
    isUploading: uploadMutation.isPending,
    error: uploadMutation.error?.message || null,
    data: uploadMutation.data || null,

    // Status
    isError: uploadMutation.isError,
    isSuccess: uploadMutation.isSuccess,
    isIdle: uploadMutation.isIdle,

    // Reset function
    reset: uploadMutation.reset,
  };
}

// Convenience hooks for common use cases
export function useImageUpload(
  options: Omit<FileUploadOptions, "allowedTypes"> = {}
) {
  return useFileUpload({
    ...options,
    allowedTypes: ["image/"],
    maxSize: options.maxSize || 4 * 1024 * 1024, // 4MB for images
  });
}

export function useAvatarUpload(
  options: Omit<FileUploadOptions, "allowedTypes" | "maxSize"> = {}
) {
  return useFileUpload({
    ...options,
    allowedTypes: ["image/"],
    maxSize: 2 * 1024 * 1024, // 2MB for avatars
  });
}
