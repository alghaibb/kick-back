"use client";

import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Camera, X, Upload } from "lucide-react";
import Image from "next/image";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { ImageUploadFormReturn } from "@/hooks/useImageUploadForm";

interface ImageUploadSectionProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  imageUpload: ImageUploadFormReturn;
  className?: string;
  imageClassName?: string;
  variant?: "default" | "compact" | "avatar";
  placeholder?: string;
  required?: boolean;
}

export function ImageUploadSection<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  imageUpload,
  className = "",
  imageClassName,
  variant = "default",
  placeholder,
  required = false,
}: ImageUploadSectionProps<TFieldValues>) {
  const {
    displayUrl,
    hasImage,
    imageRef,
    isUploading,
    uploadError,
    handleImageChange,
    removeImage,
  } = imageUpload;

  // Variant-specific styling
  const getImageClasses = () => {
    if (imageClassName) return imageClassName;

    switch (variant) {
      case "avatar":
        return "w-24 h-24 rounded-full";
      case "compact":
        return "w-20 h-20 rounded-lg";
      default:
        return "w-32 h-32 rounded-lg";
    }
  };

  const getButtonText = () => {
    if (hasImage) return "Change Image";
    return placeholder || "Upload Image";
  };

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="space-y-4">
              {/* Image Preview */}
              {hasImage && displayUrl && (
                <div className="relative inline-block">
                  <div
                    className={`relative ${getImageClasses()} overflow-hidden border border-border bg-muted`}
                  >
                    <Image
                      src={displayUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-sm">Uploading...</div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={removeImage}
                    disabled={isUploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {/* Upload Controls */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2"
                >
                  {hasImage ? (
                    <Camera className="h-4 w-4" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {getButtonText()}
                </Button>

                {isUploading && (
                  <span className="text-sm text-muted-foreground">
                    Uploading...
                  </span>
                )}
              </div>

              {/* Error Display */}
              {uploadError && (
                <div className="text-sm text-destructive">{uploadError}</div>
              )}

              {/* Hidden File Input */}
              <Input
                ref={imageRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Convenience wrapper for avatar uploads
interface AvatarUploadProps {
  imageUpload: ImageUploadFormReturn;
  fallbackText?: string;
  className?: string;
}

export function AvatarUpload({
  imageUpload,
  fallbackText = "U",
  className = "w-24 h-24",
}: AvatarUploadProps) {
  const {
    displayUrl,
    imageRef,
    isUploading,
    handleImageChange,
    hasImage,
    removeImage,
  } = imageUpload;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative ${className} rounded-full overflow-hidden border-2 border-border bg-muted`}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt="Avatar"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold text-lg">
            {fallbackText}
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-white text-xs">Uploading...</div>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => imageRef.current?.click()}
        disabled={isUploading}
      >
        {hasImage ? "Change Avatar" : "Upload Avatar"}
      </Button>

      {hasImage && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={removeImage}
          disabled={isUploading}
          className="text-destructive hover:text-destructive"
        >
          Remove Avatar
        </Button>
      )}

      <Input
        ref={imageRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
