"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useEventTemplates } from "@/hooks/queries/useEventTemplates";
import { useDeleteEventTemplate } from "@/hooks/mutations/useEventTemplateMutations";
import { format } from "date-fns";
import {
  Bookmark,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Users,
  Plus,
} from "lucide-react";
import { useModal } from "@/hooks/use-modal";
import { useState } from "react";
import {
  SkeletonLoader,
  ActionLoader,
} from "@/components/ui/loading-animations";

export function EventTemplatesList() {
  const { data: templates = [], isLoading, error } = useEventTemplates();
  const deleteMutation = useDeleteEventTemplate();
  const modal = useModal();
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const handleDelete = (template: {
    id: string;
    name: string;
  }) => {
    modal.open("delete-template", {
      templateId: template.id,
      templateName: template.name,
    });
  };

  const handleUseTemplate = (template: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    time: string | null;
    groupId: string | null;
  }) => {
    modal.open("create-event", {
      name: template.name,
      description: template.description ?? undefined,
      location: template.location ?? undefined,
      time: template.time ?? undefined,
      groupId: template.groupId ?? undefined,
    });
  };

  const handleCreateTemplate = () => {
    modal.open("create-template");
  };

  const handleEditTemplate = (template: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    time: string | null;
    groupId: string | null;
  }) => {
    modal.open("edit-template", {
      templateId: template.id,
      templateName: template.name,
      templateDescription: template.description,
      templateLocation: template.location,
      templateTime: template.time,
      templateGroupId: template.groupId,
    });
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <SkeletonLoader type="avatar" />
              <div className="flex-1 space-y-2">
                <SkeletonLoader type="text" />
                <SkeletonLoader type="text" className="w-2/3" />
              </div>
            </div>
            <SkeletonLoader type="card" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>Error loading templates: {error.message}</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent className="pt-6">
          <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="mb-2">No Templates Yet</CardTitle>
          <CardDescription className="mb-4">
            Create your first event template to save time when creating similar
            events.
          </CardDescription>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Template Button */}
      <div className="flex justify-end">
        <Button onClick={handleCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setApplyingId(template.id);
                        handleUseTemplate(template);
                        setTimeout(() => setApplyingId(null), 600);
                      }}
                      disabled={applyingId === template.id}
                    >
                      {applyingId === template.id ? (
                        <span className="flex items-center gap-2">
                          <ActionLoader action="create" size="sm" />
                          Applying...
                        </span>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Use Template
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete({ id: template.id, name: template.name })}
                      className="text-destructive"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {template.time && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {template.time}
                  </div>
                )}
                {template.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {template.location}
                  </div>
                )}
                {template.group && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <Badge variant="secondary" className="text-xs">
                      {template.group.name}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Updated {format(new Date(template.updatedAt), "MMM d, yyyy")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
