"use client";

import { GenericModal } from "@/components/ui/generic-modal";
import { useModal } from "@/hooks/use-modal";
import { Calendar, CalendarDays } from "lucide-react";
import { ResponsiveModalFooter } from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";

export function DeleteRecurringEventModal() {
  const { type, close, data } = useModal();

  const handleDeleteSingle = () => {
    close();
    setTimeout(() => {
      if (data?.onSingleDelete) {
        data.onSingleDelete();
      }
    }, 100);
  };

  const handleDeleteSeries = () => {
    close();
    setTimeout(() => {
      if (data?.onSeriesDelete) {
        data.onSeriesDelete();
      }
    }, 100);
  };

  if (type !== "delete-recurring-event") return null;

  return (
    <GenericModal
      type="delete-recurring-event"
      title="Delete Recurring Event"
      className="space-y-4"
      showCancel={false}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This is a recurring event. Do you want to delete only this occurrence
          or all events in the series?
        </p>

        <div className="space-y-3">
          <button
            onClick={handleDeleteSingle}
            className="w-full p-4 text-left border rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground group-hover:text-destructive/70 mt-0.5" />
              <div>
                <div className="font-medium">This event only</div>
                <div className="text-sm text-muted-foreground">
                  Delete only this occurrence on {data?.eventDate}
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleDeleteSeries}
            className="w-full p-4 text-left border rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <CalendarDays className="h-5 w-5 text-muted-foreground group-hover:text-destructive/70 mt-0.5" />
              <div>
                <div className="font-medium">All events in series</div>
                <div className="text-sm text-muted-foreground">
                  Delete all future occurrences in this series
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

export function CancelRecurringEventModal() {
  const { type, close, data } = useModal();

  const handleCancelOccurrence = () => {
    close();
    setTimeout(() => {
      if (data?.onCancelOccurrence) {
        data.onCancelOccurrence();
      }
    }, 100);
  };

  if (type !== "cancel-recurring-event") return null;

  return (
    <GenericModal
      type="cancel-recurring-event"
      title="Cancel Recurring Event"
      className="space-y-4"
      showCancel={false}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
            <span className="text-orange-600 dark:text-orange-400 text-sm">⚠️</span>
          </div>
          <div>
            <div className="font-medium text-orange-800 dark:text-orange-200">Cancel Event</div>
            <div className="text-sm text-orange-600 dark:text-orange-300">
              This will hide the event from your calendar but you can re-enable it later.
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCancelOccurrence}
            className="w-full p-4 text-left border rounded-lg hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-orange-100 dark:bg-orange-900/50 rounded flex items-center justify-center mt-0.5">
                <span className="text-orange-600 dark:text-orange-400 text-xs">🚫</span>
              </div>
              <div>
                <div className="font-medium">Cancel this event</div>
                <div className="text-sm text-muted-foreground">
                  Hide this occurrence from your calendar. You can re-enable it from the &quot;Cancelled Events&quot; tab.
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <ResponsiveModalFooter className="flex flex-col md:flex-row space-y-4 md:space-y-0">
        <Button onClick={close} variant="outline" className="w-full md:w-auto">
          Keep Event
        </Button>
        <Button
          onClick={handleCancelOccurrence}
          variant="outline"
          className="w-full md:w-auto border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-950/20"
        >
          Cancel Event
        </Button>
      </ResponsiveModalFooter>
    </GenericModal>
  );
}
