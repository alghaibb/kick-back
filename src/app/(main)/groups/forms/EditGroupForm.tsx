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
import { editGroupAction } from "../actions";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { useImageUpload } from "@/hooks/mutations/useFileUpload";
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
  const [isPending, startTransition] = useTransition();
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialValues.imageUrl || null
  );
  const imageRef = useRef<HTMLInputElement>(null);

  const {
    uploadAsync,
    isUploading: uploading,
    error: uploadError,
  } = useImageUpload({
    showToasts: false, // We'll handle success/error in the form submission
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

  function onSubmit(values: CreateGroupValues) {
    startTransition(async () => {
      let imageUrl: string | null | undefined = previewUrl;
      if (currentFile) {
        imageUrl = (await handleImageUpload(currentFile)) || undefined;
        if (!imageUrl) {
          return;
        }
      }
      const res = await editGroupAction(groupId, {
        name: values.name,
        description: values.description,
        image: imageUrl === null ? null : imageUrl,
      });
      if (res?.error) {
        toast.error(
          typeof res.error === "string" ? res.error : "Failed to update group"
        );
      } else if (res?.success && res.group) {
        toast.success("Group updated!");
        onSuccess?.();
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
        <LoadingButton type="submit" loading={isPending || uploading}>
          {isPending ? "Saving..." : "Save Changes"}
        </LoadingButton>
      </form>
    </Form>
  );
}
