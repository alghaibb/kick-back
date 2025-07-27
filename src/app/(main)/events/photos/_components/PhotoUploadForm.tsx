"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";
import { useUploadPhoto } from "@/hooks/mutations/usePhotoMutations";
import {
  uploadPhotoSchema,
  UploadPhotoValues,
} from "@/validations/photos/uploadPhotoSchema";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PhotoUploadFormProps {
  eventId: string;
}

export function PhotoUploadForm({ eventId }: PhotoUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const uploadMutation = useUploadPhoto();

  const form = useForm<UploadPhotoValues>({
    resolver: zodResolver(uploadPhotoSchema),
    defaultValues: {
      eventId,
      caption: "",
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const onSubmit = async (data: UploadPhotoValues) => {
    if (!selectedFile) {
      alert("Please select a photo to upload");
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        file: selectedFile,
        eventId: data.eventId,
        caption: data.caption,
      });
      form.reset();
      clearSelection();
    } catch (error) {
      console.error("Upload error:", error);
      // Error handling is done in the mutation
    }
  };

  const isUploading = uploadMutation.isPending;
  const uploadProgress = uploadMutation.uploadProgress;

  return (
    <Card className={isUploading ? "pointer-events-none opacity-75" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Add Photos
          {isUploading && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              {uploadProgress > 0 && (
                <span className="text-xs text-muted-foreground">
                  {uploadProgress}%
                </span>
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
              {!selectedFile ? (
                <div
                  onClick={() =>
                    !isUploading &&
                    document.getElementById("photo-upload")?.click()
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
                    <Image
                      src={previewUrl!}
                      alt="Preview"
                      fill
                      className={cn(
                        "object-cover",
                        isUploading && "opacity-50"
                      )}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-white">
                            {uploadProgress > 0
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
                    onClick={clearSelection}
                    disabled={isUploading}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading}
                className="hidden"
                id="photo-upload"
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
            disabled={!selectedFile || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
