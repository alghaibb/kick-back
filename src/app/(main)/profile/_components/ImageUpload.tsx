"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAvatarUpload } from "@/hooks/mutations/useFileUpload";
import { Camera, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (imageUrl: string | null) => void;
  fallbackText: string;
  className?: string;
}

export function ImageUpload({
  currentImage,
  onImageChange,
  fallbackText,
  className = "w-24 h-24",
}: ImageUploadProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    currentImage || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { upload, isUploading } = useAvatarUpload({
    onSuccess: (url) => {
      setCurrentImageUrl(url);
      onImageChange(url);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    upload(file);
  };

  const handleRemoveImage = () => {
    // Update state and notify parent - actual blob deletion happens in server action
    setCurrentImageUrl(null);
    onImageChange(null);
    toast.success("Image removed");
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group cursor-pointer" onClick={triggerFileInput}>
        <Avatar className={`${className} object-cover`}>
          <AvatarImage
            src={currentImageUrl || undefined}
            className="object-cover"
          />
          <AvatarFallback className="text-lg">{fallbackText}</AvatarFallback>
        </Avatar>

        {/* Overlay for hover effect */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileInput}
          disabled={isUploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {isUploading ? "Uploading..." : "Upload"}
        </Button>

        {currentImageUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveImage}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground text-center max-w-[200px]">
        Upload a profile picture. Supported formats: JPG, PNG, GIF. Max size:
        4MB.
      </p>
    </div>
  );
}
