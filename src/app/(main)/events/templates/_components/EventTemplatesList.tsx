"use client";

import { useState } from "react";
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
import { useGroups } from "@/hooks/queries/useGroups";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventTemplateForm } from "@/app/(main)/events/forms/EventTemplateForm";

interface EventTemplatesListProps {
  onEditTemplate?: (template: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    time: string | null;
    groupId: string | null;
  }) => void;
}

type EditingTemplate = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  time: string | null;
  groupId: string | null;
};

export function EventTemplatesList({
  onEditTemplate,
}: EventTemplatesListProps) {
  const { data: templates = [], isLoading, error } = useEventTemplates();
  const { data: groupsData } = useGroups();
  const groups = groupsData ? [...groupsData.groupsOwned, ...groupsData.groupsIn] : [];
  const deleteMutation = useDeleteEventTemplate();
  const modal = useModal();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<EditingTemplate | null>(null);

  const handleDelete = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(templateId);
    }
  };

  const handleUseTemplate = (template: any) => {
    modal.open("create-event", {
      name: template.name,
      description: template.description,
      location: template.location,
      time: template.time,
      groupId: template.groupId,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading templates...</p>
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

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setEditingTemplate(null);
  };

  if (templates.length === 0) {
    return (
      <>
        <Card className="text-center py-8">
          <CardContent className="pt-6">
            <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No Templates Yet</CardTitle>
            <CardDescription className="mb-4">
              Create your first event template to save time when creating
              similar events.
            </CardDescription>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>

        {/* Create Template Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Event Template</DialogTitle>
            </DialogHeader>
            <EventTemplateForm groups={groups} onSuccess={handleCloseModals} />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* Create Template Button */}
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4">
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
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Use Template
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(template.id)}
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

      {/* Create Template Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Event Template</DialogTitle>
          </DialogHeader>
          <EventTemplateForm groups={groups} onSuccess={handleCloseModals} />
        </DialogContent>
      </Dialog>

      {/* Edit Template Modal */}
      <Dialog
        open={!!editingTemplate}
        onOpenChange={() => setEditingTemplate(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <EventTemplateForm
              groups={groups}
              editingTemplate={editingTemplate}
              onSuccess={handleCloseModals}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
