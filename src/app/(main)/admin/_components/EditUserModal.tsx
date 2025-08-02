"use client";

import { LoadingButton } from "@/components/ui/button";
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
import { Info } from "lucide-react";
import { z } from "zod";
import { firstNameField } from "@/validations/fieldsSchema";

// Define the form schema directly in the component to avoid type conflicts
const editUserFormSchema = z
  .object({
    firstName: firstNameField,
    lastName: z.string(),
    nickname: z.string(),
    role: z.enum(["USER", "ADMIN"]),
    hasOnboarded: z.boolean(),
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
  nickname: string | null;
  role: "USER" | "ADMIN";
  hasOnboarded: boolean;
  accounts?: Array<{ provider: string }>;
}

export default function EditUserModal() {
  const { data, close } = useModal();
  const editUserMutation = useEditUserProfile();

  const user = data?.user as User;

  if (!user) return null;

  // Check if user signed up with OAuth (Google, etc.) - they might not have a password
  const hasOAuthAccount = user.accounts?.some(
    (account) =>
      account.provider === "google" || account.provider === "facebook"
  );

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserFormSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName ?? "",
      nickname: user.nickname ?? "",
      role: user.role,
      hasOnboarded: user.hasOnboarded,
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const handleSubmit = async (values: EditUserFormValues) => {
    try {
      // Transform form values to match the API expected format
      const apiData = {
        firstName: values.firstName,
        lastName: values.lastName === "" ? null : values.lastName,
        nickname: values.nickname === "" ? null : values.nickname,
        role: values.role,
        hasOnboarded: values.hasOnboarded,
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
      title="Edit User Profile"
      description={`Editing profile for ${user.firstName} ${user.lastName || ""} (${user.email})`}
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

          {/* Password Section */}
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
                    <PasswordInput placeholder="Confirm password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <LoadingButton
              type="button"
              variant="outline"
              onClick={close}
              disabled={editUserMutation.isPending}
            >
              Cancel
            </LoadingButton>
            <LoadingButton
              type="submit"
              loading={editUserMutation.isPending}
              disabled={!form.formState.isValid}
            >
              Update User
            </LoadingButton>
          </div>
        </form>
      </Form>
    </GenericModal>
  );
}
