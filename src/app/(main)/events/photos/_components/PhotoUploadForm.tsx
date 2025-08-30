"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";
import {
  ActionLoader,
  ProgressLoader,
} from "@/components/ui/loading-animations";
import { useUploadPhoto } from "@/hooks/mutations/usePhotoMutations";
import {
  uploadPhotoSchema,
  UploadPhotoValues,
} from "@/validations/photos/uploadPhotoSchema";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  useImageUploadForm,
  IMAGE_UPLOAD_PRESETS,
} from "@/hooks/useImageUploadForm";

interface PhotoUploadFormProps {
  eventId: string;
}

export function PhotoUploadForm({ eventId }: PhotoUploadFormProps) {
  const uploadMutation = useUploadPhoto();

  const form = useForm<UploadPhotoValues>({
    resolver: zodResolver(uploadPhotoSchema),
    defaultValues: {
      eventId,
      caption: "",
    },
  });

  const imageUpload = useImageUploadForm(undefined, undefined, {
    ...IMAGE_UPLOAD_PRESETS.eventPhoto,
    showToasts: false,
  });

  const onSubmit = async (data: UploadPhotoValues) => {
    if (!imageUpload.currentFile) {
      alert("Please select a photo to upload");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        file: imageUpload.currentFile,
        eventId: data.eventId,
        caption: data.caption,
      });
      form.reset();
      imageUpload.reset();
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const isUploading = uploadMutation.isPending || imageUpload.isUploading;
  const uploadProgress =
    uploadMutation.uploadProgress || imageUpload.uploadProgress;

  return (
    <Card className={isUploading ? "pointer-events-none opacity-75" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Add Photos
          {isUploading && (
            <div className="flex items-center gap-2 ml-auto">
              <ActionLoader action="upload" size="sm" />
              {uploadProgress && uploadProgress > 0 && (
                <ProgressLoader
                  progress={uploadProgress}
                  size="sm"
                  showPercentage={false}
                />
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Photo</Label>
            <div className="mt-2">
              {!imageUpload.hasImage ? (
                <div
                  onClick={() =>
                    !isUploading && imageUpload.imageRef.current?.click()
                  }
                  className={cn(
                    "border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors",
                    isUploading && "cursor-not-allowed opacity-50"
                  )}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isUploading
                      ? "Uploading photo..."
                      : "Click to upload a photo or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                    {imageUpload.previewUrl && (
                      <Image
                        src={imageUpload.previewUrl}
                        alt="Preview"
                        fill
                        className={cn(
                          "object-cover",
                          isUploading && "opacity-50"
                        )}
                      />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="text-center">
                          <ActionLoader
                            action="upload"
                            size="lg"
                            className="mx-auto mb-2"
                          />
                          <p className="text-sm text-white">
                            {uploadProgress && uploadProgress > 0
                              ? `${uploadProgress}%`
                              : "Uploading..."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={imageUpload.removeImage}
                    disabled={isUploading}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                ref={imageUpload.imageRef}
                type="file"
                accept="image/*"
                onChange={imageUpload.handleImageChange}
                disabled={isUploading}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input
              id="caption"
              placeholder="Add a caption for your photo..."
              disabled={isUploading}
              {...form.register("caption")}
              className="mt-1"
            />
          </div>

          <Button
            type="submit"
            disabled={!imageUpload.hasImage || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <ActionLoader action="upload" size="sm" className="mr-2" />
                Uploading...
              </>
            ) : (
              "Upload Photo"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
