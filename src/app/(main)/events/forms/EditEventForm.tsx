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

interface EditEventFormProps {
  eventId: string;
  initialValues: CreateEventValues;
  groups: { id: string; name: string }[];
  onSuccess?: () => void;
  isAdmin?: boolean;
  editAllInSeries?: boolean;
}

export default function EditEventForm({
  eventId,
  initialValues,
  groups,
  onSuccess,
  isAdmin = false,
  editAllInSeries = false,
}: EditEventFormProps) {
  const editEventMutation = useEditEvent();
  const adminEditEventMutation = useAdminEditEvent();

  const form = useForm<CreateEventValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: initialValues,
  });

  function onSubmit(values: CreateEventValues) {
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

  const isLoading = isAdmin
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
