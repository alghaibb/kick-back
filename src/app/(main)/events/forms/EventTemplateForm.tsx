"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AutosizeTextarea } from "@/components/ui/textarea";
import { LocationInput } from "@/components/ui/location-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EnhancedLoadingButton } from "@/components/ui/enhanced-loading-button";
import {
  createEventTemplateSchema,
  type CreateEventTemplateValues,
} from "@/validations/events/eventTemplateSchema";
import {
  useCreateEventTemplate,
  useEditEventTemplate,
} from "@/hooks/mutations/useEventTemplateMutations";

interface EventTemplateFormProps {
  groups: { id: string; name: string }[];
  onSuccess?: () => void;
  editingTemplate?: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    time: string | null;
    groupId: string | null;
  };
}

export function EventTemplateForm({
  groups,
  onSuccess,
  editingTemplate,
}: EventTemplateFormProps) {
  const createMutation = useCreateEventTemplate();
  const editMutation = useEditEventTemplate();

  const form = useForm<CreateEventTemplateValues>({
    resolver: zodResolver(createEventTemplateSchema),
    defaultValues: {
      name: editingTemplate?.name || "",
      description: editingTemplate?.description || "",
      location: editingTemplate?.location || "",
      time: editingTemplate?.time || "",
      groupId: editingTemplate?.groupId || undefined,
    },
  });

  const isEditing = !!editingTemplate;
  const mutation = isEditing ? editMutation : createMutation;

  function onSubmit(values: CreateEventTemplateValues) {
    if (isEditing) {
      editMutation.mutate(
        { templateId: editingTemplate.id, values },
        {
          onSuccess: () => {
            form.reset();
            onSuccess?.();
          },
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">
          {isEditing ? "Edit Template" : "Create Event Template"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Save event details as a template for quick reuse.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder="Weekly Team Meeting" {...field} />
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
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <AutosizeTextarea
                    placeholder="Default description for events created from this template"
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
                <FormLabel>Location (optional)</FormLabel>
                <FormControl>
                  <LocationInput
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Default location"
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
                <FormLabel>Default Time (optional)</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="09:00" {...field} />
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
                <FormLabel>Default Group (optional)</FormLabel>
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? null : value)
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a default group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No group</SelectItem>
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
            loading={mutation.isPending}
            disabled={mutation.isPending}
            className="w-full"
            action={isEditing ? "update" : "create"}
            loadingText={
              isEditing ? "Updating Template..." : "Creating Template..."
            }
          >
            {isEditing ? "Update Template" : "Create Template"}
          </EnhancedLoadingButton>
        </form>
      </Form>
    </div>
  );
}
