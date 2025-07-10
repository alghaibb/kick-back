"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { createEventAction } from "../actions";
import { LoadingButton } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";

interface CreateEventFormProps {
  groups: { id: string; name: string }[];
  onSuccess?: () => void;
}

export function CreateEventForm({
  groups: initialGroups,
  onSuccess,
}: CreateEventFormProps) {
  const [isPending, startTransition] = useTransition();
  const [groups] = useState(initialGroups);
  const modal = useModal();

  const form = useForm<CreateEventValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      time: "",
      date: undefined,
      groupId: undefined,
    },
  });

  function onSubmit(values: CreateEventValues) {
    startTransition(async () => {
      const res = await createEventAction(values);

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Event created successfully!");
      form.reset();
      onSuccess?.();
    });
  }

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
                <Input placeholder="Location (optional)" {...field} />
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
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Calendar
                  selected={field.value}
                  onSelect={field.onChange}
                  mode="single"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
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
              <FormLabel>Assign to Group (optional)</FormLabel>
              <Select
                value={field.value ?? undefined}
                onValueChange={(val) => {
                  if (val === "__create__") {
                    modal.open("create-group");
                    return;
                  }
                  field.onChange(val);
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a group (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__create__">+ Create New Group</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton type="submit" loading={isPending}>
          {isPending ? "Creating Event..." : "Create Event"}
        </LoadingButton>
      </form>
    </Form>
  );
}
