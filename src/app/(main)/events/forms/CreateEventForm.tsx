"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { LocationInput } from "@/components/ui/location-input";
import { SmartDateTimePicker } from "@/components/ui/smart-datetime-picker";

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
import { useMemo, useState } from "react";
import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import { useModal } from "@/hooks/use-modal";
import {
  useCreateEvent,
  useCreateRecurringEvent,
} from "@/hooks/mutations/useEventMutations";
import { useEventTemplates } from "@/hooks/queries/useEventTemplates";
import { useCreateEventTemplate } from "@/hooks/mutations/useEventTemplateMutations";
import { Bookmark, Clock, MapPin, Repeat } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SmartLoader } from "@/components/ui/loading-animations";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  RecurrencePicker,
  RecurrenceConfig,
} from "@/components/ui/recurrence-picker";
import { formatTime } from "@/lib/date-utils";

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
  const [recurrenceConfig, setRecurrenceConfig] = useState<RecurrenceConfig>({
    enabled: false,
    frequency: "weekly",
    interval: 1,
    endType: "never",
  });
  const modal = useModal();
  const createEventMutation = useCreateEvent();
  const createRecurringEventMutation = useCreateRecurringEvent();
  const createTemplateMutation = useCreateEventTemplate();
  const { data: templates = [], isLoading: templatesLoading } =
    useEventTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
  );

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
      color: hasTemplateData ? templateData.color || "#3b82f6" : "#3b82f6",
      groupId: hasTemplateData ? templateData.groupId || undefined : undefined,
    },
  });

  function onSubmit(values: CreateEventValues) {
    // Use recurring mutation if recurrence is enabled
    if (recurrenceConfig.enabled) {
      // Convert recurrence config to match backend schema
      const recurrence = {
        enabled: recurrenceConfig.enabled,
        frequency: recurrenceConfig.frequency as "daily" | "weekly" | "monthly",
        interval: recurrenceConfig.interval,
        endType: recurrenceConfig.endType,
        endAfter: recurrenceConfig.endAfter,
        endDate: recurrenceConfig.endDate
          ? recurrenceConfig.endDate.toISOString().split("T")[0]
          : undefined,
        weekDays: recurrenceConfig.weekDays,
      };
      const recurringValues = {
        ...values,
        recurrence,
      };
      createRecurringEventMutation.mutate(recurringValues, {
        onSuccess: () => {
          if (showSaveAsTemplate) {
            createTemplateMutation.mutate({
              name: `${values.name} Template`,
              description: values.description,
              location: values.location,
              time: values.time,
              color: values.color,
              groupId: values.groupId,
            });
          }
          form.reset();
          setShowSaveAsTemplate(false);
          setRecurrenceConfig({
            enabled: false,
            frequency: "weekly",
            interval: 1,
            endType: "never",
          });
          onSuccess?.();
        },
      });
    } else {
      createEventMutation.mutate(values, {
        onSuccess: () => {
          if (showSaveAsTemplate) {
            createTemplateMutation.mutate({
              name: `${values.name} Template`,
              description: values.description,
              location: values.location,
              time: values.time,
              color: values.color,
              groupId: values.groupId,
            });
          }
          form.reset();
          setShowSaveAsTemplate(false);
          onSuccess?.();
        },
      });
    }
  }

  function loadTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    // Set all template values with proper options to notify form state
    form.setValue("name", template.name, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("description", template.description || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("location", template.location || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("time", template.time || "", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    form.setValue(
      "color",
      "color" in template ? (template.color as string) || "#3b82f6" : "#3b82f6",
      { shouldValidate: true, shouldDirty: true }
    );
    form.setValue("groupId", template.groupId || undefined, {
      shouldValidate: true,
      shouldDirty: true,
    });
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
            <Select
              onValueChange={(id) => {
                if (id === "__none__") {
                  setSelectedTemplateId(null);
                  return;
                }
                setSelectedTemplateId(id);
                loadTemplate(id);
              }}
            >
              <SelectTrigger className="truncate">
                <SelectValue placeholder="Choose a template to pre-fill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No template</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {templatesLoading && (
              <div className="relative h-0">
                <div className="absolute right-2 -top-8">
                  <SmartLoader context="data" action="load" size="sm" />
                </div>
              </div>
            )}

            {/* Live Preview */}
            <Card className="mt-2">
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedTemplate?.name || "Preview"}
                </CardTitle>
                <CardDescription>
                  {selectedTemplate?.description ||
                    "Select a template to preview details"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {selectedTemplate?.time && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(selectedTemplate.time)}
                  </span>
                )}
                {selectedTemplate?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-5 w-5 shrink-0" strokeWidth={2} />
                    {selectedTemplate.location}
                  </span>
                )}
                {selectedTemplate?.group?.name && (
                  <Badge variant="outline" className="text-xs">
                    {selectedTemplate.group.name}
                  </Badge>
                )}
              </CardContent>
            </Card>
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
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Color</FormLabel>
              <FormControl>
                <ColorPicker value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Only show recurrence picker after date is selected */}
        {form.watch("date") ? (
          <div className="space-y-2">
            <RecurrencePicker
              value={recurrenceConfig}
              onChange={setRecurrenceConfig}
              eventDate={new Date(form.watch("date"))}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            <Repeat className="mx-auto mb-2 h-6 w-6 opacity-50" />
            Select a date first to set up recurring events
          </div>
        )}

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
          loading={
            createEventMutation.isPending ||
            createRecurringEventMutation.isPending
          }
          action="create"
          loadingText={
            recurrenceConfig.enabled
              ? "Creating Recurring Events..."
              : "Creating Event..."
          }
        >
          {recurrenceConfig.enabled
            ? "Create Recurring Events"
            : "Create Event"}
        </EnhancedLoadingButton>
      </form>
    </Form>
  );
}
