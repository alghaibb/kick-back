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
import { PasswordInput } from "@/components/ui/password-input";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  ChangePasswordValues,
} from "@/validations/profile/profileSchema";
import { updateSettingsAction, changePasswordAction } from "./actions";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { TimezoneCombobox } from "@/components/ui/timezone-combobox";
import { settingsSchema, SettingsValues } from "@/validations/settingsSchema";
import { Switch } from "@/components/ui/switch";
import { formatToE164 } from "@/utils/formatPhoneNumber";
import { detectCountryForSMS } from "@/utils/detectCountry";

interface SettingsFormProps {
  user: {
    id: string;
    password?: string | null;
    timezone?: string | null;
    reminderType: "email" | "sms" | "both";
    reminderTime: string;
    phoneNumber?: string | null;
    notificationOptIn?: boolean | null;
  };
  hasPassword: boolean;
}

export function SettingsForm({ user, hasPassword }: SettingsFormProps) {
  const [isPendingSettings, startSettingsTransition] = useTransition();
  const [isPendingPassword, startPasswordTransition] = useTransition();

  // Settings form (reminderType, reminderTime, timezone)
  const settingsForm = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      reminderType: user.reminderType,
      reminderTime: user.reminderTime,
      timezone: user.timezone || "",
      notificationOptIn: user.notificationOptIn ?? true,
      phoneNumber: user.phoneNumber || "",
    },
    mode: "onChange",
  });
  const isSettingsDirty = settingsForm.formState.isDirty;
  const isSettingsValid = settingsForm.formState.isValid;
  const reminderType = settingsForm.watch("reminderType");
  const phoneNumberValue = settingsForm.watch("phoneNumber");
  const timezoneValue = settingsForm.watch("timezone");
  let phoneError: string | null = null;
  if ((reminderType === "sms" || reminderType === "both") && phoneNumberValue) {
    let country = detectCountryForSMS(phoneNumberValue, timezoneValue);
    // Defensive: ensure country is a valid 2-letter code
    if (!country || typeof country !== "string" || country.length !== 2) {
      country = "AU";
    }
    const formatted = formatToE164(phoneNumberValue, country);
    if (!formatted) phoneError = "Invalid phone number for your country";
  }

  // Password form
  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });
  const isPasswordDirty = passwordForm.formState.isDirty;
  const isPasswordValid = passwordForm.formState.isValid;

  async function onSettingsSubmit(values: SettingsValues) {
    startSettingsTransition(async () => {
      const res = await updateSettingsAction(values);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Settings updated successfully!");
      settingsForm.reset(values);
    });
  }

  async function onPasswordSubmit(values: ChangePasswordValues) {
    startPasswordTransition(async () => {
      const res = await changePasswordAction(values);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Password changed successfully!");
      passwordForm.reset();
    });
  }

  return (
    <div className="space-y-6">
      {/* Reminder Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...settingsForm}>
            <form
              onSubmit={settingsForm.handleSubmit(onSettingsSubmit)}
              className="space-y-4"
            >
              <FormField
                control={settingsForm.control}
                name="notificationOptIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enable Reminders</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPendingSettings}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={settingsForm.control}
                name="reminderType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Type</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={
                          isPendingSettings ||
                          !settingsForm.watch("notificationOptIn")
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select reminder type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(reminderType === "sms" || reminderType === "both") && (
                <FormField
                  control={settingsForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your phone number"
                          {...field}
                          disabled={
                            isPendingSettings ||
                            !settingsForm.watch("notificationOptIn")
                          }
                        />
                      </FormControl>
                      <FormMessage />
                      {phoneError && (
                        <div className="text-destructive text-sm mt-1">
                          {phoneError}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={settingsForm.control}
                name="reminderTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reminder Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={
                          isPendingSettings ||
                          !settingsForm.watch("notificationOptIn")
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={settingsForm.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <TimezoneCombobox
                        value={field.value}
                        onChange={field.onChange}
                        disabled={
                          isPendingSettings ||
                          !settingsForm.watch("notificationOptIn")
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton
                type="submit"
                loading={isPendingSettings}
                className="w-full"
                disabled={
                  !isSettingsDirty ||
                  !isSettingsValid ||
                  ((reminderType === "sms" || reminderType === "both") &&
                    !!phoneError)
                }
              >
                Update Reminder Settings
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Section */}
      {hasPassword && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Password</CardTitle>
          </CardHeader>
          <CardContent>
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
                  name="confirmPassword"
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
                <LoadingButton
                  type="submit"
                  loading={isPendingPassword}
                  className="w-full"
                  disabled={!isPasswordDirty || !isPasswordValid}
                >
                  Change Password
                </LoadingButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
