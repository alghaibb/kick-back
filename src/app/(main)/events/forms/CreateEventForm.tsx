"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { LocationInput } from "@/components/ui/location-input";
import { SmartDateTimePicker } from "@/components/ui/smart-datetime-picker";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import { useModal } from "@/hooks/use-modal";
import { useCreateEvent } from "@/hooks/mutations/useEventMutations";
import { useEventTemplates } from "@/hooks/queries/useEventTemplates";
import { useCreateEventTemplate } from "@/hooks/mutations/useEventTemplateMutations";
import { Bookmark, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

interface CreateEventFormProps {
  groups: { id: string; name: string }[];
  onSuccess?: () => void;
  defaultDate?: string;
}

export function CreateEventForm({
  groups: initialGroups,
  onSuccess,
  defaultDate,
}: CreateEventFormProps) {
  const [groups] = useState(initialGroups);
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const modal = useModal();
  const createEventMutation = useCreateEvent();
  const createTemplateMutation = useCreateEventTemplate();
  const { data: templates = [] } = useEventTemplates();

  // Check if we have template data from modal
  const templateData = modal.data;
  const hasTemplateData = templateData?.name && templateData !== undefined;

  const form = useForm<CreateEventValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      name: hasTemplateData ? templateData.name || "" : "",
      description: hasTemplateData ? templateData.description || "" : "",
      location: hasTemplateData ? templateData.location || "" : "",
      time: hasTemplateData ? templateData.time || "" : "",
      date: defaultDate || "",
      groupId: hasTemplateData ? templateData.groupId || undefined : undefined,
    },
  });

  function onSubmit(values: CreateEventValues) {
    createEventMutation.mutate(values, {
      onSuccess: () => {
        // Save as template if requested
        if (showSaveAsTemplate) {
          createTemplateMutation.mutate({
            name: `${values.name} Template`,
            description: values.description,
            location: values.location,
            time: values.time,
            groupId: values.groupId,
          });
        }
        form.reset();
        setShowSaveAsTemplate(false);
        onSuccess?.();
      },
    });
  }

  function loadTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    form.setValue("name", template.name);
    form.setValue("description", template.description || "");
    form.setValue("location", template.location || "");
    form.setValue("time", template.time || "");
    form.setValue("groupId", template.groupId || undefined);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Template Selection */}
        {templates.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Use Template (optional)
            </Label>
            <Select onValueChange={loadTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template to pre-fill" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <Bookmark className="h-4 w-4" />
                      <span>{template.name}</span>
                      {template.group && (
                        <span className="text-xs text-muted-foreground">
                          ({template.group.name})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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

        {/* Save as Template Option */}
        <div className="flex items-center space-x-2 p-3 rounded-lg border border-dashed">
          <input
            type="checkbox"
            id="saveAsTemplate"
            checked={showSaveAsTemplate}
            onChange={(e) => setShowSaveAsTemplate(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="saveAsTemplate" className="text-sm cursor-pointer">
            <div className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Save as template for future use
            </div>
          </Label>
        </div>

        <EnhancedLoadingButton
          type="submit"
          loading={createEventMutation.isPending}
          action="create"
          loadingText="Creating Event..."
        >
          Create Event
        </EnhancedLoadingButton>
      </form>
    </Form>
  );
}
