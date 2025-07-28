"use client";

import { LoadingButton } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  updateProfileSchema,
  UpdateProfileValues,
} from "@/validations/profile/profileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useProfileMutation } from "@/hooks/mutations/useProfileMutation";
import {
  useImageUploadForm,
  IMAGE_UPLOAD_PRESETS,
} from "@/hooks/useImageUploadForm";
import { AvatarUpload } from "@/components/ui/image-upload-section";

interface ProfileFormProps {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    nickname: string | null;
    image: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const profileMutation = useProfileMutation();

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || "",
      nickname: user.nickname || "",
      email: user.email,
      image: user.image, // String URL, not File
    },
    mode: "onChange",
  });

  // Handle file upload separately from form validation
  const imageUpload = useImageUploadForm(undefined, undefined, {
    ...IMAGE_UPLOAD_PRESETS.profile,
    initialImageUrl: user.image,
    showToasts: false,
  });

  // Fix image dirty detection for File vs string comparison
  const isImageDirty =
    imageUpload.isDeleted ||
    imageUpload.currentFile !== undefined ||
    imageUpload.displayUrl !== user.image;
  const isFormDirty = profileForm.formState.isDirty;
  const canSubmit = isFormDirty || isImageDirty;

  async function onProfileSubmit(values: UpdateProfileValues) {
    let imageUrl: string | null = user.image;

    // Handle image changes - convert File to URL
    if (imageUpload.isDeleted) {
      imageUrl = null; // Explicitly delete the image
    } else if (imageUpload.currentFile) {
      imageUrl = await imageUpload.uploadImage(imageUpload.currentFile);
      if (!imageUrl) {
        return; // Upload failed - error already shown by toast
      }
    } else {
      imageUrl = imageUpload.displayUrl; // Keep existing or no change
    }

    // Simple - just pass the URL string
    const submitValues: UpdateProfileValues = {
      firstName: values.firstName,
      lastName: values.lastName,
      nickname: values.nickname,
      email: values.email,
      image: imageUrl,
    };

    profileMutation.mutate(submitValues);
  }

  function getInitials() {
    return `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ""}`;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <AvatarUpload
            imageUpload={imageUpload}
            fallbackText={getInitials()}
            className="w-24 h-24"
          />
          <p className="text-xs text-muted-foreground text-center max-w-[200px]">
            Upload a profile picture. Max size: 2MB.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <FormField
                control={profileForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your first name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a nickname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <LoadingButton
                type="submit"
                loading={profileMutation.isPending || imageUpload.isUploading}
                className="w-full"
                disabled={!canSubmit || imageUpload.isUploading}
              >
                {profileMutation.isPending || imageUpload.isUploading
                  ? "Updating..."
                  : "Update Profile"}
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
