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
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageUpload } from "./_components/ImageUpload";
import { updateProfileAction } from "./actions";
import { useAuth } from "@/hooks/use-auth";

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
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(user.image);
  const { refreshUser } = useAuth();

  const profileForm = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || "",
      nickname: user.nickname || "",
      email: user.email,
      image: user.image,
    },
    mode: "onChange",
  });

  const initialImage = user.image;
  const isImageDirty = imageUrl !== initialImage;
  const isFormDirty = profileForm.formState.isDirty;
  const canSubmit = isFormDirty || isImageDirty;

  function onProfileSubmit(values: UpdateProfileValues) {
    startProfileTransition(async () => {
      const submitValues = { ...values, image: imageUrl };
      const res = await updateProfileAction(submitValues);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Profile updated successfully!");

      await refreshUser();
    });
  }

  return (
    <div className="space-y-6">
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
                disabled={!canSubmit}
              >
                Update Profile
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
