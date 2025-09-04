"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { SmartDateTimePicker } from "@/components/ui/smart-datetime-picker";
import { LocationInput } from "@/components/ui/location-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  createEventSchema,
  CreateEventValues,
} from "@/validations/events/createEventSchema";
import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import {
  useEditEvent,
  useAdminEditEvent,
} from "@/hooks/mutations/useEventMutations";
import { editSingleOccurrenceAction } from "../actions";
import { ColorPicker } from "@/components/ui/color-picker";

interface EditEventFormProps {
  eventId: string;
  initialValues: CreateEventValues;
  groups: { id: string; name: string }[];
  onSuccess?: () => void;
  isAdmin?: boolean;
  editAllInSeries?: boolean;
  editSingleOccurrence?: boolean;
}

export default function EditEventForm({
  eventId,
  initialValues,
  groups,
  onSuccess,
  isAdmin = false,
  editAllInSeries = false,
  editSingleOccurrence = false,
}: EditEventFormProps) {
  const editEventMutation = useEditEvent();
  const adminEditEventMutation = useAdminEditEvent();

  const form = useForm<CreateEventValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: initialValues,
  });

  async function onSubmit(values: CreateEventValues) {
    if (editSingleOccurrence) {
      // Handle single occurrence editing
      try {
        const result = await editSingleOccurrenceAction(eventId, values);
        if (result.success) {
          onSuccess?.();
        } else {
          // Handle error - you might want to show a toast here
          console.error("Failed to edit single occurrence:", result.error);
        }
      } catch (error) {
        console.error("Error editing single occurrence:", error);
      }
      return;
    }

    const mutation = isAdmin ? adminEditEventMutation : editEventMutation;

    mutation.mutate(
      { eventId, values, editAllInSeries },
      {
        onSuccess: () => {
          onSuccess?.();
        },
      }
    );
  }

  const isLoading = editSingleOccurrence
    ? false // For single occurrence, we don't have a loading state
    : isAdmin
      ? adminEditEventMutation.isPending
      : editEventMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Event Name" {...field} />
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
                  placeholder="Description (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationInput
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Location (optional)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <SmartDateTimePicker
                  date={field.value}
                  time={form.watch("time")}
                  onDateChange={(date) => {
                    field.onChange(date);
                    form.trigger("date");
                  }}
                  onTimeChange={(time) => {
                    form.setValue("time", time);
                    form.trigger("time");
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="groupId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group (Optional)</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value === "none" ? null : value);
                }}
                defaultValue={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No Group</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <ColorPicker
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <EnhancedLoadingButton
          type="submit"
          className="w-full"
          loading={isLoading}
          action="update"
          loadingText="Updating..."
        >
          {isAdmin ? "Update Event (Admin)" : "Update Event"}
        </EnhancedLoadingButton>
      </form>
    </Form>
  );
}
