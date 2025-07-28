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
import { LoadingButton } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { createGroupAction } from "../actions";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { useModal } from "@/hooks/use-modal";
import { useDashboardInvalidation } from "@/hooks/queries/useDashboardInvalidation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useImageUploadForm,
  IMAGE_UPLOAD_PRESETS,
} from "@/hooks/useImageUploadForm";
import { ImageUploadSection } from "@/components/ui/image-upload-section";

interface CreateGroupFormProps {
  onSuccess?: () => void;
}

export function CreateGroupForm({ onSuccess }: CreateGroupFormProps) {
  const { open: openModal } = useModal();
  const { invalidateDashboard } = useDashboardInvalidation();
  const queryClient = useQueryClient();

  const form = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      // Don't include image in form validation - handle separately
    },
  });

  // Handle file upload separately from form validation
  const imageUpload = useImageUploadForm(undefined, undefined, {
    ...IMAGE_UPLOAD_PRESETS.group,
    showToasts: false,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (values: CreateGroupValues) => {
      const res = await createGroupAction(values);
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
        imageUpload.reset();
        // Invalidate dashboard stats to show new group count
        invalidateDashboard();
        // Invalidate groups data to show new group
        queryClient.invalidateQueries({ queryKey: ["groups"] });
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

  async function onSubmit(values: CreateGroupValues) {
    let imageUrl: string | null = null;

    // Handle image upload if file is selected
    if (imageUpload.currentFile) {
      imageUrl = await imageUpload.uploadImage(imageUpload.currentFile);
      if (!imageUrl) {
        return; // Upload failed
      }
    }

    // Pass regular object instead of FormData
    const submitValues: CreateGroupValues = {
      name: values.name,
      description: values.description,
      image: imageUrl,
    };

    createGroupMutation.mutate(submitValues);
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
        <ImageUploadSection
          control={form.control}
          name="image"
          label="Group Image"
          imageUpload={imageUpload}
        />
        <LoadingButton
          type="submit"
          className="w-full"
          loading={createGroupMutation.isPending || imageUpload.isUploading}
          disabled={imageUpload.isUploading}
        >
          {createGroupMutation.isPending || imageUpload.isUploading
            ? "Creating..."
            : "Create Group"}
        </LoadingButton>
      </form>
    </Form>
  );
}
