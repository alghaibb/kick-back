"use client";

import { useEffect, useRef, useState } from "react";
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

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Camera, Upload, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { onboarding } from "./actions";
import { TimezoneCombobox } from "@/components/ui/timezone-combobox";
import { useImageUpload } from "@/hooks/mutations/useFileUpload";

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

  const imageRef = useRef<HTMLInputElement>(null);
  const [currentFile, setCurrentFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.image ?? null
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { uploadAsync, isUploading } = useImageUpload({
    showToasts: false,
    onProgress: (progress) => setUploadProgress(progress),
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: any) => {
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

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      nickname: user.nickname ?? "",
      reminderType: "email",
      phoneNumber: "",
      reminderTime: "09:00",
      timezone: detectedTz,
    },
  });

  // Watch reminder type to conditionally show phone number
  const reminderType = form.watch("reminderType");

  // Handle image preview cleanup
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
    setPreviewUrl(user.image ?? null);
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  async function onSubmit(values: z.infer<typeof onboardingSchema>) {
    try {
      let imageUrl = user.image ?? null;

      if (currentFile) {
        setUploadProgress(0);
        try {
          imageUrl = await uploadAsync(currentFile);
          setUploadProgress(100);
        } catch (error) {
          console.error("Failed to upload image:", error);
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
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <Avatar className="mx-auto size-24 ring-4 ring-background">
              <AvatarImage
                src={previewUrl ?? undefined}
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            {/* Upload Button Overlay */}
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Camera className="size-4" />
            </button>
          </div>

          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              disabled={onboardingMutation.isPending}
              ref={imageRef}
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Upload className="size-4" />
              <span>Click to upload image (max 4MB)</span>
            </div>

            {currentFile && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {currentFile.name}
                </span>
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={onboardingMutation.isPending}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
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
          loading={onboardingMutation.isPending}
          disabled={onboardingMutation.isPending}
        >
          {onboardingMutation.isPending
            ? "Setting up your profile..."
            : "Complete Setup"}
        </LoadingButton>
      </form>
    </Form>
  );
}
