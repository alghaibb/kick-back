"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";

import {
  onboardingSchema,
  OnboardingValues,
} from "@/validations/onboardingSchema";

import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { onboarding } from "./actions";
import { TimezoneCombobox } from "@/components/ui/timezone-combobox";
import {
  useImageUploadForm,
  IMAGE_UPLOAD_PRESETS,
} from "@/hooks/useImageUploadForm";
import { AvatarUpload } from "@/components/ui/image-upload-section";

type OnboardingUser = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  nickname: string | null;
  image: string | null;
  hasOnboarded: boolean;
};

export default function OnboardingForm({ user }: { user: OnboardingUser }) {
  const router = useRouter();

  const onboardingMutation = useMutation({
    mutationFn: async (
      data: Omit<OnboardingValues, "image"> & {
        image: string | null;
        previousImage: string | null;
      }
    ) => {
      const res = await onboarding(data);
      if (res?.error) {
        throw new Error(
          typeof res.error === "string" ? res.error : "Failed to update profile"
        );
      }
      return res;
    },
    onSuccess: (res) => {
      if (res?.success) {
        toast.success("Profile updated successfully!");
        router.push("/dashboard");
      }
    },
    onError: (error: Error) => {
      console.error("Onboarding error:", error);
      toast.error(error.message);
    },
  });

  const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName || "",
      nickname: user.nickname || "",
      // Don't include image in form validation - handle separately
      reminderType: "email",
      phoneNumber: "",
      reminderTime: "09:00",
      timezone: detectedTz,
    },
  });

  // Handle file upload separately from form validation
  const imageUpload = useImageUploadForm(undefined, undefined, {
    ...IMAGE_UPLOAD_PRESETS.profile,
    initialImageUrl: user.image,
    showToasts: false,
  });

  // Watch reminder type to conditionally show phone number
  const reminderType = form.watch("reminderType");

  // Clear phone number when switching to email-only
  useEffect(() => {
    if (reminderType === "email") {
      form.setValue("phoneNumber", "");
    }
  }, [reminderType, form]);

  async function onSubmit(values: z.infer<typeof onboardingSchema>) {
    try {
      let imageUrl = user.image ?? null;

      if (imageUpload.isDeleted) {
        // Explicitly delete the image
        imageUrl = null;
      } else if (imageUpload.currentFile) {
        // Upload new file
        imageUrl = await imageUpload.uploadImage(imageUpload.currentFile);
        if (!imageUrl) {
          toast.error("Image upload failed");
          return;
        }
      }

      onboardingMutation.mutate({
        ...values,
        image: imageUrl,
        previousImage: user.image,
      });
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  const getInitials = () => {
    const firstName = form.watch("firstName") || user.firstName || "";
    const nickname = form.watch("nickname") || user.nickname || "";
    return (firstName[0] || nickname[0] || "U").toUpperCase();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Image Section */}
        <div className="text-center">
          <AvatarUpload
            imageUpload={imageUpload}
            fallbackText={getInitials()}
            className="size-24"
          />
          <div className="mt-2 text-sm text-muted-foreground">
            Click to upload image (max 2MB)
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your first name"
                    {...field}
                    disabled={onboardingMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
                    {...field}
                    disabled={onboardingMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nickname (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="What should we call you?"
                    {...field}
                    disabled={onboardingMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Reminder Preferences Section */}
        <div className="space-y-4">
          <div>
            <FormLabel className="text-base font-medium">
              Reminder Preferences
            </FormLabel>
            <FormDescription>
              {" "}
              Choose how you&apos;d like to receive event reminders. You can
              change them later in your settings.
            </FormDescription>
          </div>

          <FormField
            control={form.control}
            name="reminderType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2"
                      >
                        <span>Email</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sms" id="sms" />
                      <Label htmlFor="sms" className="flex items-center gap-2">
                        <span>SMS</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both" className="flex items-center gap-2">
                        <span>Both</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(reminderType === "sms" || reminderType === "both") && (
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your phone number"
                      {...field}
                      disabled={onboardingMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="reminderTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder Time</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    disabled={onboardingMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <FormControl>
                  <TimezoneCombobox
                    value={field.value}
                    onChange={field.onChange}
                    disabled={onboardingMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <LoadingButton
          type="submit"
          className="w-full"
          loading={onboardingMutation.isPending || imageUpload.isUploading}
          disabled={onboardingMutation.isPending || imageUpload.isUploading}
        >
          {onboardingMutation.isPending || imageUpload.isUploading
            ? "Setting up your profile..."
            : "Complete Setup"}
        </LoadingButton>
      </form>
    </Form>
  );
}
