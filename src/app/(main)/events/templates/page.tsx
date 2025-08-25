"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventTemplatesList } from "./_components/EventTemplatesList";
import { EventTemplateForm } from "../forms/EventTemplateForm";
import { useGroups } from "@/hooks/queries/useGroups";
import { Plus, Bookmark } from "lucide-react";

type EditingTemplate = {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  time: string | null;
  groupId: string | null;
};

export default function EventTemplatesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<EditingTemplate | null>(null);
  const { data: groups = [] } = useGroups();

  const handleEditTemplate = (template: EditingTemplate) => {
    setEditingTemplate(template);
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Event Templates</h1>
          </div>
          <p className="text-muted-foreground">
            Create reusable templates to quickly set up similar events.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      <EventTemplatesList onEditTemplate={handleEditTemplate} />

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
