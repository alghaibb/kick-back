"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import { Calendar, CalendarDays } from "lucide-react";
import { ResponsiveModalFooter } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";

export function EditRecurringEventModal() {
  const { type, close, data } = useModal();

  const handleEditSingle = () => {
    close();
    setTimeout(() => {
      if (data?.onSingleEdit) {
        data.onSingleEdit();
      }
    }, 100);
  };

  const handleEditSeries = () => {
    close();
    setTimeout(() => {
      if (data?.onSeriesEdit) {
        data.onSeriesEdit();
      }
    }, 100);
  };

  if (type !== "edit-recurring-event") return null;

  return (
    <GenericModal
      type="edit-recurring-event"
      title="Edit Recurring Event"
      className="space-y-4"
      showCancel={false}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This is a recurring event. Do you want to edit only this occurrence or
          all events in the series?
        </p>

        <div className="space-y-3">
          <button
            onClick={handleEditSingle}
            className="w-full p-4 text-left border rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground group-hover:text-primary/70 mt-0.5" />
              <div>
                <div className="font-medium">This event only</div>
                <div className="text-sm text-muted-foreground">
                  Changes will apply only to this occurrence on{" "}
                  {data?.eventDate}
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleEditSeries}
            className="w-full p-4 text-left border rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground group-hover:text-primary/70 mt-0.5" />
              <div>
                <div className="font-medium">All events in series</div>
                <div className="text-sm text-muted-foreground">
                  Changes will apply to all future occurrences in this series
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <ResponsiveModalFooter className="flex flex-col md:flex-row space-y-4 md:space-y-0">
        <Button onClick={close} variant="outline" className="w-full md:w-auto">
          Cancel
        </Button>
      </ResponsiveModalFooter>
    </GenericModal>
  );
}
