"use client";

import { Button } from "@/components/ui/button";
import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  ChangePasswordValues,
} from "@/validations/profile/profileSchema";
import {
  useSettingsMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} from "@/hooks/mutations/useSettingsMutation";
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
import { useModal } from "@/hooks/use-modal";
import { GenericModal } from "@/components/ui/generic-modal";
import PushNotificationToggle from "@/components/ui/push-notification-toggle";
import { BackgroundCustomizer } from "@/components/background-customizer/BackgroundCustomizer";

interface SettingsFormProps {
  user: {
    id: string;
    password?: string | null;
    timezone?: string | null;
    reminderType: "email" | "sms" | "both";
    reminderTime: string;
    phoneNumber?: string | null;
    notificationOptIn?: boolean | null;
    inAppNotifications?: boolean | null;
    pushNotifications?: boolean | null;
  };
  hasPassword: boolean;
}

export function SettingsForm({ user, hasPassword }: SettingsFormProps) {
  const settingsMutation = useSettingsMutation();
  const passwordMutation = useChangePasswordMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const { open } = useModal();

  // Settings form (reminderType, reminderTime, timezone)
  const settingsForm = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      reminderType: user.reminderType,
      reminderTime: user.reminderTime,
      timezone: user.timezone || "",
      notificationOptIn: user.notificationOptIn ?? true,
      inAppNotifications: user.inAppNotifications ?? true,
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
  if (
    (reminderType === "sms" || reminderType === "both") &&
    phoneNumberValue &&
    phoneNumberValue.trim() !== "" &&
    phoneNumberValue.replace(/[\s\-\(\)\+]/g, "").length >= 8
  ) {
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
    settingsMutation.mutate(values, {
      onSuccess: () => {
        settingsForm.reset(values);
      },
    });
  }

  async function onPasswordSubmit(values: ChangePasswordValues) {
    passwordMutation.mutate(values, {
      onSuccess: () => {
        passwordForm.reset();
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Reminder Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifications & Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...settingsForm}>
            <form
              onSubmit={settingsForm.handleSubmit(onSettingsSubmit)}
              className="space-y-4"
            >
              {/* SMS/Email Reminders */}
              <FormField
                control={settingsForm.control}
                name="notificationOptIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>SMS & Email Reminders</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Receive event reminders via SMS and email
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={settingsMutation.isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* In-App Notifications */}
              <FormField
                control={settingsForm.control}
                name="inAppNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>In-App Notifications</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for comments, likes, RSVPs, and
                        event updates
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={settingsMutation.isPending}
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
                          settingsMutation.isPending ||
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
                            settingsMutation.isPending ||
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
                          settingsMutation.isPending ||
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
                          settingsMutation.isPending ||
                          !settingsForm.watch("notificationOptIn")
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <EnhancedLoadingButton
                type="submit"
                loading={settingsMutation.isPending}
                action="save"
                loadingText="Updating..."
                className="w-full"
                disabled={
                  !isSettingsDirty ||
                  !isSettingsValid ||
                  ((reminderType === "sms" || reminderType === "both") &&
                    !!phoneError)
                }
              >
                Update Reminder Settings
              </EnhancedLoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Push Notifications Section */}
      <div className="relative">
        <PushNotificationToggle />
      </div>

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
                <EnhancedLoadingButton
                  type="submit"
                  loading={passwordMutation.isPending}
                  action="save"
                  loadingText="Changing Password..."
                  className="w-full"
                  disabled={!isPasswordDirty || !isPasswordValid}
                >
                  Change Password
                </EnhancedLoadingButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Background Customization */}
      <BackgroundCustomizer />

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground">Delete Account</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Delete your account and all associated data. You can recover
                your account within 30 days after deletion.
              </p>
            </div>
            <EnhancedLoadingButton
              variant="destructive"
              loading={deleteAccountMutation.isPending}
              action="delete"
              loadingText="Processing..."
              onClick={() => {
                open("delete-account");
              }}
            >
              Delete Account
            </EnhancedLoadingButton>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Modal */}
      <GenericModal
        type="delete-account"
        title="Delete Account"
        description="Are you sure you want to delete your account? Your account will be deleted but can be recovered within 30 days. After 30 days, it will be permanently deleted."
        showCancel={false}
      >
        <div className="flex flex-col gap-3 p-6">
          <EnhancedLoadingButton
            variant="destructive"
            loading={deleteAccountMutation.isPending}
            action="delete"
            loadingText="Deleting..."
            onClick={() => {
              useModal.getState().close();
              deleteAccountMutation.mutate();
            }}
            className="w-full"
          >
            Yes, Delete My Account
          </EnhancedLoadingButton>
          <Button
            variant="outline"
            onClick={() => useModal.getState().close()}
            disabled={deleteAccountMutation.isPending}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </GenericModal>
    </div>
  );
}
