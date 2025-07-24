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
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { createGroupAction } from "../actions";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { useModal } from "@/hooks/use-modal";
import { useImageUpload } from "@/hooks/mutations/useFileUpload";
import Image from "next/image";

interface CreateGroupFormProps {
  onSuccess?: () => void;
}

export function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const { open: openModal } = useModal();

  const {
    uploadAsync,
    isUploading: uploading,
    error: uploadError,
  } = useImageUpload({
    showToasts: false, // We'll handle success/error in the form submission
  });

  const createGroupMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await createGroupAction(formData);
      if (res?.error) {
        throw new Error(
          typeof res.error === "string" ? res.error : "Failed to create group"
        );
      }
      return res;
    },
    onSuccess: (res) => {
      if (res?.success && res.group) {
        toast.success("Group created!");
        form.reset();
        setCurrentFile(undefined);
        setPreviewUrl(null);
        onSuccess?.();
        openModal("invite-group", {
          groupId: res.group.id,
          groupName: res.group.name,
        });
      }
    },
    onError: (error: Error) => {
      console.error("Failed to create group:", error);
      toast.error(error.message);
    },
  });

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
      setCurrentFile(file);
      form.setValue("image", file);
    }
  };

  const removeImage = () => {
    setCurrentFile(undefined);
    setPreviewUrl(null);
    if (imageRef.current) {
      imageRef.current.value = "";
    }
    form.setValue("image", undefined);
  };

  async function handleImageUpload(file: File): Promise<string | null> {
    try {
      return await uploadAsync(file);
    } catch (error) {
      console.error("Failed to upload image:", error);
      return null;
    }
  }

  async function onSubmit(values: CreateGroupValues) {
    let imageUrl: string | undefined = undefined;
    if (currentFile) {
      imageUrl = (await handleImageUpload(currentFile)) || undefined;
      if (!imageUrl) {
        return;
      }
    }
    const formData = new FormData();
    formData.append("name", values.name);
    if (values.description) formData.append("description", values.description);
    if (imageUrl) formData.append("image", imageUrl);

    createGroupMutation.mutate(formData);
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
                    disabled={createGroupMutation.isPending || uploading}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => imageRef.current?.click()}
                      disabled={createGroupMutation.isPending || uploading}
                    >
                      {currentFile ? "Change Image" : "Upload Image"}
                    </Button>
                    {currentFile && (
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={createGroupMutation.isPending || uploading}
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
          loading={createGroupMutation.isPending || uploading}
          disabled={uploading}
        >
          {createGroupMutation.isPending || uploading
            ? "Creating..."
            : "Create Group"}
        </LoadingButton>
      </form>
    </Form>
  );
}
