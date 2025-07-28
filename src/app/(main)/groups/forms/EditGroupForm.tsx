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
import { editGroupAction } from "../actions";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { useDashboardInvalidation } from "@/hooks/queries/useDashboardInvalidation";
import { useQueryClient } from "@tanstack/react-query";
import {
  useImageUploadForm,
  IMAGE_UPLOAD_PRESETS,
} from "@/hooks/useImageUploadForm";
import { ImageUploadSection } from "@/components/ui/image-upload-section";

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
  const { invalidateDashboard } = useDashboardInvalidation();
  const queryClient = useQueryClient();

  const form = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: initialValues.name,
      description: initialValues.description || "",
      // Don't include image in form validation - handle separately
    },
  });

  // Handle file upload separately from form validation
  const imageUpload = useImageUploadForm(undefined, undefined, {
    ...IMAGE_UPLOAD_PRESETS.group,
    initialImageUrl: initialValues.imageUrl,
    showToasts: false,
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

  async function onSubmit(values: CreateGroupValues) {
    let imageUrl: string | null | undefined;

    if (imageUpload.isDeleted) {
      // Explicitly delete the image
      imageUrl = null;
    } else if (imageUpload.currentFile) {
      // Upload new file
      imageUrl =
        (await imageUpload.uploadImage(imageUpload.currentFile)) || undefined;
      if (!imageUrl) {
        return;
      }
    } else {
      // No change - keep existing image
      imageUrl = imageUpload.displayUrl || initialValues.imageUrl;
    }

    editGroupMutation.mutate({
      name: values.name,
      description: values.description || "",
      image: imageUrl,
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
        <ImageUploadSection
          control={form.control}
          name="image"
          label="Group Image"
          imageUpload={imageUpload}
        />
        <LoadingButton
          type="submit"
          loading={editGroupMutation.isPending || imageUpload.isUploading}
          disabled={imageUpload.isUploading}
        >
          {editGroupMutation.isPending || imageUpload.isUploading
            ? "Saving..."
            : "Save Changes"}
        </LoadingButton>
      </form>
    </Form>
  );
}
