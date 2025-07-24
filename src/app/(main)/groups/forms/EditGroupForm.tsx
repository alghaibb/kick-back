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
import { editGroupAction } from "../actions";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { useImageUpload } from "@/hooks/mutations/useFileUpload";
import { useDashboardInvalidation } from "@/hooks/queries/useDashboardInvalidation";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { X } from "lucide-react";

interface EditGroupFormProps {
  groupId: string;
  initialValues: CreateGroupValues & { imageUrl?: string | null };
  onSuccess?: () => void;
}

export default function EditGroupForm({
  groupId,
  initialValues,
  onSuccess,
}: EditGroupFormProps) {
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialValues.imageUrl || null
  );
  const imageRef = useRef<HTMLInputElement>(null);
  const { invalidateDashboard } = useDashboardInvalidation();
  const queryClient = useQueryClient();

  const {
    uploadAsync,
    isUploading: uploading,
    error: uploadError,
  } = useImageUpload({
    showToasts: false, // We'll handle success/error in the form submission
  });

  const editGroupMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      image: string | null | undefined;
    }) => {
      const res = await editGroupAction(groupId, data);
      if (res?.error) {
        throw new Error(
          typeof res.error === "string" ? res.error : "Failed to update group"
        );
      }
      return res;
    },
    onSuccess: (res) => {
      if (res?.success) {
        toast.success("Group updated successfully!");
        // Invalidate dashboard stats in case group name/details changed
        invalidateDashboard();
        // Invalidate groups data to show updated group
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        onSuccess?.();
      }
    },
    onError: (error: Error) => {
      console.error("Failed to update group:", error);
      toast.error(error.message);
    },
  });

  const form = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: initialValues.name,
      description: initialValues.description || "",
      image: undefined,
    },
  });

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
    let imageUrl: string | null | undefined = previewUrl;
    if (currentFile) {
      imageUrl = (await handleImageUpload(currentFile)) || undefined;
      if (!imageUrl) {
        return;
      }
    }

    editGroupMutation.mutate({
      name: values.name,
      description: values.description || "",
      image: imageUrl === null ? null : imageUrl,
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
                  {previewUrl ? (
                    <div className="mt-2 flex items-center gap-2">
                      <Image
                        src={previewUrl}
                        alt="Group Image"
                        width={64}
                        height={64}
                        className="rounded"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeImage}
                      >
                        <X />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => imageRef.current?.click()}
                        disabled={uploading}
                      >
                        Change
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={imageRef}
                        onChange={handleImageChange}
                        disabled={uploading}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <Input
                      type="file"
                      accept="image/*"
                      ref={imageRef}
                      onChange={handleImageChange}
                      disabled={uploading}
                    />
                  )}
                  {uploadError && (
                    <div className="text-destructive text-sm mt-1">
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
          loading={editGroupMutation.isPending || uploading}
        >
          {editGroupMutation.isPending ? "Saving..." : "Save Changes"}
        </LoadingButton>
      </form>
    </Form>
  );
}
