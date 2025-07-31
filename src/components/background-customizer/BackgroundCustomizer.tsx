"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useImageUpload } from "@/hooks/mutations/useFileUpload";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image, Upload, X, Palette, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Professional preset background options - optimized for text readability
const PRESET_BACKGROUNDS = [
  {
    id: "soft-blue",
    name: "Soft Blue",
    url: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    type: "gradient" as const,
  },
  {
    id: "warm-cream",
    name: "Warm Cream",
    url: "linear-gradient(135deg, #fefefe 0%, #fecaca 100%)",
    type: "gradient" as const,
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    url: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    type: "gradient" as const,
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    url: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
    type: "gradient" as const,
  },
  {
    id: "peach-sunset",
    name: "Peach Sunset",
    url: "linear-gradient(135deg, #fefefe 0%, #fed7aa 100%)",
    type: "gradient" as const,
  },
  {
    id: "sage-green",
    name: "Sage Green",
    url: "linear-gradient(135deg, #f7faf7 0%, #e6f3e6 100%)",
    type: "gradient" as const,
  },
  {
    id: "none",
    name: "No Background",
    url: "",
    type: "none" as const,
  },
];

interface BackgroundCustomizerProps {
  className?: string;
}

export function BackgroundCustomizer({ className }: BackgroundCustomizerProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Removed unused overlayIntensity state

  // Upload mutation
  const uploadMutation = useImageUpload({
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: "dashboard-backgrounds",
    showToasts: false,
  });

  // Update user background mutation
  const updateBackgroundMutation = useMutation({
    mutationFn: async (backgroundUrl: string) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dashboardBackground: backgroundUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update background");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.refetchQueries({ queryKey: ["user"] });
      toast.success("App background updated!");
      setIsOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast.error("Failed to update background");
      console.error("Update background error:", error);
    },
  });

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check for HEIC files (iPhone default format) - check both extension and MIME type
    const fileExtension = file.name.toLowerCase().split(".").pop();
    const isHeicByExtension =
      fileExtension === "heic" || fileExtension === "heif";
    const isHeicByMime =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      file.type === "image/heic-sequence" ||
      file.type === "image/heif-sequence";

    if (isHeicByExtension || isHeicByMime) {
      toast.error(
        "HEIC files are not supported. Please convert to JPEG or PNG first, or take a new photo in a different format."
      );
      return;
    }

    // Validate file type - be more specific about supported formats
    const supportedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!supportedTypes.includes(file.type)) {
      toast.error("Please select a JPEG, PNG, WebP, or GIF image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview with error handling
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.onerror = () => {
      toast.error("Error reading image file. Please try a different image.");
      setSelectedFile(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle custom background upload
  const handleCustomUpload = async () => {
    if (!selectedFile) return;

    try {
      const url = await uploadMutation.uploadAsync(selectedFile);
      await updateBackgroundMutation.mutateAsync(url);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  // Handle preset background selection
  const handlePresetSelect = async (
    background: (typeof PRESET_BACKGROUNDS)[0]
  ) => {
    await updateBackgroundMutation.mutateAsync(background.url);
  };

  // Remove background
  const handleRemoveBackground = async () => {
    await updateBackgroundMutation.mutateAsync("");
  };

  const currentBackground = user?.dashboardBackground;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Current Background Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            App Background
          </CardTitle>
          <CardDescription>
            Personalize your app with a custom background image or choose from
            soft, professional gradients. Tip: Images with high contrast work
            best for text readability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Background Preview */}
          {currentBackground && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Current Background:</p>
              <div className="relative group">
                <div
                  className="w-full h-32 rounded-lg bg-cover bg-center bg-no-repeat border"
                  style={{
                    backgroundImage: currentBackground.startsWith(
                      "linear-gradient"
                    )
                      ? currentBackground
                      : `url(${currentBackground})`,
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveBackground}
                    disabled={updateBackgroundMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4" />
              {currentBackground ? "Change Background" : "Add Background"}
            </Button>

            {currentBackground && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveBackground}
                disabled={updateBackgroundMutation.isPending}
                className="w-full sm:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Remove Background
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Background Customization Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Customize Background</CardTitle>
            <CardDescription>
              Upload your own image or choose from our beautiful preset options.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custom Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Your Own
              </h3>
              <p className="text-sm text-muted-foreground">
                For best results, choose images with good contrast or dark areas
                where text will appear.
              </p>

              <div className="space-y-4">
                {/* File Input */}
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="background-upload"
                  />
                  <Label
                    htmlFor="background-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-dashed border-muted-foreground/25 rounded-lg hover:border-muted-foreground/50 transition-colors"
                  >
                    <Image className="w-4 h-4" />
                    Choose Image
                  </Label>
                  {selectedFile && (
                    <span className="text-sm text-muted-foreground">
                      {selectedFile.name}
                    </span>
                  )}
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Preview:</p>
                    <div
                      className="w-full h-32 rounded-lg bg-cover bg-center bg-no-repeat border"
                      style={{ backgroundImage: `url(${previewUrl})` }}
                    />
                    <Button
                      onClick={handleCustomUpload}
                      disabled={
                        uploadMutation.isUploading ||
                        updateBackgroundMutation.isPending
                      }
                      className="w-full sm:w-auto"
                    >
                      {uploadMutation.isUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Set as Background
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Preset Backgrounds */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Or Choose a Preset</h3>
              <p className="text-sm text-muted-foreground">
                These gradients are optimized for text readability.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PRESET_BACKGROUNDS.map((background) => (
                  <button
                    key={background.id}
                    onClick={() => handlePresetSelect(background)}
                    disabled={updateBackgroundMutation.isPending}
                    className="group relative aspect-video rounded-lg border-2 border-transparent hover:border-primary transition-all overflow-hidden"
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{
                        backgroundImage: background.url,
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-medium text-white drop-shadow-sm">
                        {background.name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
