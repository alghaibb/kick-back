"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createGroupSchema,
  CreateGroupValues,
} from "@/validations/group/createGroupSchema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button, LoadingButton } from "@/components/ui/button";
import { useTransition, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { createGroupAction } from "../actions";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { useModal } from "@/hooks/use-modal";
import Image from "next/image";

interface CreateGroupFormProps {
  onSuccess?: () => void;
}

export function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const { open: openModal } = useModal();

  const form = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
    },
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
      // Validate file size
      if (file.size > 4 * 1024 * 1024) {
        setUploadError("Image must be less than 4MB");
        return;
      }
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select a valid image file");
        return;
      }
      setUploadError(null);
      setCurrentFile(file);
      form.setValue("image", file);
    }
  };

  const removeImage = () => {
    setCurrentFile(undefined);
    setPreviewUrl(null);
    setUploadError(null);
    if (imageRef.current) {
      imageRef.current.value = "";
    }
    form.setValue("image", undefined);
  };

  async function handleImageUpload(file: File): Promise<string | null> {
    setUploading(true);
    setUploadError(null);
    try {
      // Add random suffix to filename
      const ext = file.name.split(".").pop();
      const base = file.name.replace(/\.[^/.]+$/, "");
      const uniqueName = `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const renamedFile = new File([file], uniqueName, { type: file.type });

      const formData = new FormData();
      formData.append("file", renamedFile);
      const uploadRes = await fetch("/api/blob/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        setUploadError(errorData.error || "Image upload failed");
        return null;
      }
      const { url } = await uploadRes.json();
      if (!url) {
        setUploadError("No URL returned from upload");
        return null;
      }
      return url;
    } catch (err) {
      setUploadError("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  }

  function onSubmit(values: CreateGroupValues) {
    startTransition(async () => {
      let imageUrl: string | undefined = undefined;
      if (currentFile) {
        imageUrl = (await handleImageUpload(currentFile)) || undefined;
        if (!imageUrl) {
          return;
        }
      }
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.description)
        formData.append("description", values.description);
      if (imageUrl) formData.append("image", imageUrl);
      const res = await createGroupAction(formData);
      if (res?.error) {
        toast.error(
          typeof res.error === "string" ? res.error : "Failed to create group"
        );
      } else if (res?.success && res.group) {
        toast.success("Group created!");
        form.reset();
        setCurrentFile(undefined);
        setPreviewUrl(null);
        setUploadError(null);
        onSuccess?.();
        openModal("invite-group", {
          groupId: res.group.id,
          groupName: res.group.name,
        });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter group name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <AutosizeTextarea
                  placeholder="Enter group description (optional)"
                  minHeight={52}
                  maxHeight={200}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>Group Image</FormLabel>
              <FormControl>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageRef}
                    onChange={handleImageChange}
                    disabled={isPending || uploading}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => imageRef.current?.click()}
                      disabled={isPending || uploading}
                    >
                      {currentFile ? "Change Image" : "Upload Image"}
                    </Button>
                    {currentFile && (
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={isPending || uploading}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {previewUrl && (
                    <div className="mt-2">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={160}
                        height={160}
                        className="rounded-md max-h-32 object-contain border"
                      />
                    </div>
                  )}
                  {uploading && (
                    <div className="text-xs text-muted-foreground">
                      Uploading image...
                    </div>
                  )}
                  {uploadError && (
                    <div className="text-xs text-destructive">
                      {uploadError}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton
          type="submit"
          className="w-full"
          loading={isPending || uploading}
          disabled={uploading}
        >
          {isPending || uploading ? "Creating..." : "Create Group"}
        </LoadingButton>
      </form>
    </Form>
  );
}
