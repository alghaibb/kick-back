"use client";

import { Button, LoadingButton } from "@/components/ui/button";
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
import { PasswordInput } from "@/components/ui/password-input";
import {
  changePasswordSchema,
  ChangePasswordValues,
  updateProfileSchema,
  UpdateProfileValues,
} from "@/validations/profile/profileSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageUpload } from "./_components/ImageUpload";
import { changePasswordAction, updateProfileAction } from "./actions";

interface ProfileFormProps {
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    nickname: string | null;
    image: string | null;
  };
  hasPassword: boolean;
}

export function ProfileForm({ user, hasPassword }: ProfileFormProps) {
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [isPendingPassword, startPasswordTransition] = useTransition();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(user.image);

  // Profile form
  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || "",
      nickname: user.nickname || "",
      email: user.email,
      image: user.image,
    },
  });

  // Password form
  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  function onProfileSubmit(values: UpdateProfileValues) {
    startProfileTransition(async () => {
      // Include the current image URL in the submission
      const submitValues = { ...values, image: imageUrl };
      const res = await updateProfileAction(submitValues);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Profile updated successfully!");
    });
  }

  function onPasswordSubmit(values: ChangePasswordValues) {
    startPasswordTransition(async () => {
      const res = await changePasswordAction(values);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Password changed successfully!");
      passwordForm.reset();
      setShowPasswordForm(false);
    });
  }

  return (
    <div className="space-y-6">
      {/* Profile Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <ImageUpload
            currentImage={imageUrl}
            onImageChange={setImageUrl}
            fallbackText={`${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ""}`}
            className="w-24 h-24"
          />
        </CardContent>
      </Card>

      {/* Profile Information Form */}
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
                loading={isPendingProfile}
                className="w-full"
              >
                Update Profile
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Change Section - Only show for users with passwords */}
      {hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Password</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Change your account password for enhanced security.
            </p>

            {!showPasswordForm ? (
              <Button
                variant="outline"
                onClick={() => setShowPasswordForm(true)}
                className="w-full"
              >
                Change Password
              </Button>
            ) : (
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="Enter current password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="Enter new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmNewPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder="Confirm new password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <LoadingButton
                      type="submit"
                      loading={isPendingPassword}
                      className="flex-1"
                    >
                      Change Password
                    </LoadingButton>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false);
                        passwordForm.reset();
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
