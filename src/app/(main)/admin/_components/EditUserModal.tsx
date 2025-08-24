"use client";

import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import { useEditUserProfile } from "@/hooks/queries/useAdminUsers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Info, Upload, X } from "lucide-react";
import { z } from "zod";
import { firstNameField } from "@/validations/fieldsSchema";
import { useEffect, useMemo } from "react";
import { useImageUploadForm } from "@/hooks/useImageUploadForm";
import Image from "next/image";

// Define the form schema directly in the component to avoid type conflicts
const editUserFormSchema = z
  .object({
    firstName: firstNameField,
    lastName: z.string(),
    nickname: z.string(),
    role: z.enum(["USER", "ADMIN"]),
    hasOnboarded: z.boolean(),
    image: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.confirmPassword === data.newPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

type EditUserFormValues = z.infer<typeof editUserFormSchema>;

interface User {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  image: string | null;
  nickname: string | null;
  role: "USER" | "ADMIN";
  hasOnboarded: boolean;
  accounts?: Array<{ provider: string }>;
  hasPassword?: boolean;
}

export default function EditUserModal() {
  const { data, close } = useModal();
  const editUserMutation = useEditUserProfile();

  const user = data?.user as User;

  // Image upload hook
  const imageUpload = useImageUploadForm(
    undefined, // No form setValue needed, we'll handle manually
    undefined, // No field name needed
    {
      maxSize: 2 * 1024 * 1024, // 2MB for profile images
      initialImageUrl: user?.image,
      showToasts: true,
      folder: "profile",
      generateUniqueName: true,
    }
  );

  // Always call useForm hook, even when user is null
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName ?? "",
      nickname: user?.nickname ?? "",
      role: user?.role || "USER",
      hasOnboarded: user?.hasOnboarded || false,
      image: user?.image || "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Watch form values for changes (must be called before conditional return)
  const formValues = form.watch();

  // Update form when user data becomes available
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName,
        lastName: user.lastName ?? "",
        nickname: user.nickname ?? "",
        role: user.role,
        hasOnboarded: user.hasOnboarded,
        image: user.image || "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, form]);

  // Check if user signed up with OAuth (Google, etc.) - they might not have a password
  const hasOAuthAccount = user?.accounts?.some(
    (account) =>
      account.provider === "google" || account.provider === "facebook"
  );

  // Determine if user has a password or can set one
  // If hasPassword is explicitly false or user only has OAuth accounts, don't show password fields
  const canChangePassword = user?.hasPassword !== false && !hasOAuthAccount;

  // Check if form has changes compared to original user data (must be called before conditional return)
  const hasChanges = useMemo(() => {
    if (!user) return false;

    const originalValues = {
      firstName: user.firstName,
      lastName: user.lastName ?? "",
      nickname: user.nickname ?? "",
      role: user.role,
      hasOnboarded: user.hasOnboarded,
      image: user.image || "",
    };

    const currentValues = {
      firstName: formValues.firstName || "",
      lastName: formValues.lastName || "",
      nickname: formValues.nickname || "",
      role: formValues.role,
      hasOnboarded: formValues.hasOnboarded,
      image: formValues.image || "",
    };

    // Check if any field has changed
    const fieldsChanged = Object.keys(originalValues).some((key) => {
      return (
        originalValues[key as keyof typeof originalValues] !==
        currentValues[key as keyof typeof currentValues]
      );
    });

    // Check if password fields have content (only if user can change password)
    const passwordChanged =
      canChangePassword &&
      ((formValues.newPassword && formValues.newPassword.length > 0) ||
        (formValues.confirmPassword && formValues.confirmPassword.length > 0));

    // Check if image has changed
    const imageChanged = imageUpload.currentFile || imageUpload.isDeleted;

    return fieldsChanged || passwordChanged || imageChanged;
  }, [
    user,
    formValues,
    canChangePassword,
    imageUpload.currentFile,
    imageUpload.isDeleted,
  ]);

  // Early return after all hooks are called
  if (!user) return null;

  const handleSubmit = async (values: EditUserFormValues) => {
    try {
      let imageUrl = user.image; // Keep existing image by default

      // Handle image upload if there's a new file
      if (imageUpload.currentFile) {
        toast.info("Uploading image...");
        const uploadedUrl = await imageUpload.uploadImage(
          imageUpload.currentFile
        );
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast.error("Image upload failed");
          return;
        }
      } else if (imageUpload.isDeleted) {
        // User explicitly removed the image
        imageUrl = null;
      }

      // Transform form values to match the API expected format
      const apiData = {
        firstName: values.firstName,
        lastName: values.lastName === "" ? null : values.lastName,
        nickname: values.nickname === "" ? null : values.nickname,
        role: values.role,
        hasOnboarded: values.hasOnboarded,
        image: imageUrl,
        newPassword:
          values.newPassword && values.newPassword.length > 0
            ? values.newPassword
            : undefined,
        confirmPassword:
          values.confirmPassword && values.confirmPassword.length > 0
            ? values.confirmPassword
            : undefined,
      };

      await editUserMutation.mutateAsync({
        userId: user.id,
        data: apiData,
      });

      const hasPasswordChange = apiData.newPassword;
      toast.success(
        hasPasswordChange
          ? "User profile and password updated successfully!"
          : "User profile updated successfully!"
      );
      close();
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("Failed to update user profile");
    }
  };

  return (
    <GenericModal
      type="edit-user"
      title={hasChanges ? "Edit User Profile *" : "Edit User Profile"}
      description={`Editing profile for ${user.firstName} ${user.lastName || ""} (${user.email})${hasChanges ? " • Unsaved changes" : ""}`}
      showCancel={false}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* User Info Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">User Information</h3>
              {hasOAuthAccount && (
                <Badge variant="secondary" className="text-xs">
                  OAuth Account
                </Badge>
              )}
            </div>

            {/* Email (Disabled) */}
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input
                value={user.email}
                disabled
                className="bg-muted cursor-not-allowed mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter last name (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nickname */}
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nickname</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter nickname (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profile Image Upload */}
            <div className="space-y-2">
              <FormLabel>Profile Image</FormLabel>
              <div className="flex items-center gap-4">
                {/* Current/Preview Image */}
                {imageUpload.displayUrl && !imageUpload.isDeleted && (
                  <div className="relative">
                    <Image
                      src={imageUpload.displayUrl}
                      alt="Profile"
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border"
                    />
                    <button
                      type="button"
                      onClick={imageUpload.removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      disabled={imageUpload.isUploading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex flex-col gap-2">
                  <input
                    ref={imageUpload.imageRef}
                    type="file"
                    accept="image/*"
                    onChange={imageUpload.handleImageChange}
                    className="hidden"
                    disabled={imageUpload.isUploading}
                  />
                  <EnhancedLoadingButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => imageUpload.imageRef.current?.click()}
                    disabled={imageUpload.isUploading}
                    loading={imageUpload.isUploading}
                    action="upload"
                    loadingText="Uploading..."
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {imageUpload.displayUrl ? "Change Image" : "Upload Image"}
                  </EnhancedLoadingButton>
                  <p className="text-xs text-muted-foreground">
                    Max 2MB • JPEG, PNG, WebP, GIF
                  </p>
                </div>
              </div>
              {imageUpload.uploadError && (
                <p className="text-sm text-red-500">
                  {imageUpload.uploadError}
                </p>
              )}
            </div>

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Has Onboarded */}
            <FormField
              control={form.control}
              name="hasOnboarded"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Onboarding Status</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Whether the user has completed onboarding
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Password Section - Only show for users who can change passwords */}
          {canChangePassword && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Password Settings</h3>
                {hasOAuthAccount && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span>User may not have a password</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {hasOAuthAccount
                  ? "This user signed up with OAuth. Setting a password will allow them to login with email/password as well."
                  : "Leave blank to keep current password unchanged."}
              </p>

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {hasOAuthAccount ? "Set Password" : "New Password"}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={
                          hasOAuthAccount
                            ? "Set a password"
                            : "Enter new password"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Confirm password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <EnhancedLoadingButton
              type="button"
              variant="outline"
              onClick={close}
              disabled={editUserMutation.isPending}
            >
              Cancel
            </EnhancedLoadingButton>
            <EnhancedLoadingButton
              type="submit"
              loading={editUserMutation.isPending}
              action="update"
              loadingText="Updating..."
              disabled={
                !form.formState.isValid ||
                !hasChanges ||
                editUserMutation.isPending
              }
            >
              {hasChanges ? "Update User" : "No Changes"}
            </EnhancedLoadingButton>
          </div>
        </form>
      </Form>
    </GenericModal>
  );
}
