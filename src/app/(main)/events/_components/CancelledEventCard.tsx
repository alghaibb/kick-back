"use client";

import { useState } from "react";
import { formatDate } from "@/lib/date-utils";
import {
  Calendar,
  MapPin,
  Users,
  MoreVertical,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useModal } from "@/hooks/use-modal";
import { useReenableEvent } from "@/hooks/mutations/useEventMutations";

interface CancelledEventCardProps {
  id: string;
  name: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  groupId?: string;
  groups: { id: string; name: string; image?: string }[];
  createdByCurrentUser: boolean;
  isRecurring: boolean;
  cancelledDate?: string;
}

export function CancelledEventCard({
  id,
  name,
  description,
  date,
  time,
  location,
  groupId,
  groups,
  createdByCurrentUser,
  isRecurring,
  cancelledDate,
}: CancelledEventCardProps) {
  const { open } = useModal();
  const reenableMutation = useReenableEvent();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isReenabling, setIsReenabling] = useState(false);

  const group = groups.find((g) => g.id === groupId);
  const eventDate = new Date(date);
  const cancelledAt = cancelledDate ? new Date(cancelledDate) : null;

  const handleReenable = async () => {
    setIsReenabling(true);
    try {
      await reenableMutation.mutateAsync({ eventId: id });
    } catch (error) {
      console.error("Failed to re-enable event:", error);
    } finally {
      setIsReenabling(false);
    }
  };

  const handlePermanentDelete = () => {
    setIsDeleting(true);
    open("delete-event", {
      eventId: id,
      eventName: name,
      userRole: createdByCurrentUser ? "creator" : "attendee",
    });
  };

  return (
    <Card className="group relative overflow-hidden border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-br from-orange-50/30 to-red-50/30 dark:from-orange-950/10 dark:to-red-950/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {name}
            </CardTitle>
            {description && (
              <CardDescription className="mt-1 line-clamp-2">
                {description}
              </CardDescription>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleReenable}
                disabled={isReenabling}
                className="text-green-600 dark:text-green-400"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Re-enable Event
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handlePermanentDelete}
                disabled={isDeleting}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Event Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {formatDate(eventDate, { includeTime: false })} at {time || "TBD"}
            </span>
          </div>

          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}

          {group && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>{group.name}</span>
            </div>
          )}
        </div>

        {/* Cancelled Status */}
        <div className="flex items-center justify-between pt-2 border-t border-orange-200/30 dark:border-orange-800/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-orange-700 dark:text-orange-300">
              Cancelled{" "}
              {cancelledAt
                ? formatDate(cancelledAt, { includeTime: true })
                : "recently"}
            </span>
          </div>

          {isRecurring && (
            <Badge
              variant="outline"
              className="text-xs border-orange-300 text-orange-700 dark:text-orange-300"
            >
              Recurring
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReenable}
            disabled={isReenabling}
            className="flex-1 border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Re-enable
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handlePermanentDelete}
            disabled={isDeleting}
            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
