"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon, Zap } from "lucide-react";
import {
  isBefore,
  startOfDay,
  addDays,
  addHours,
  addWeeks,
  format,
  parseISO,
} from "date-fns";

interface SmartDateTimePickerProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
}

interface QuickOption {
  label: string;
  date: Date;
  time: string;
  description: string;
}

export function SmartDateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  disabled = false,
}: SmartDateTimePickerProps) {
  const [showQuickOptions, setShowQuickOptions] = useState(false);

  // Generate quick options based on current time
  const generateQuickOptions = (): QuickOption[] => {
    const now = new Date();
    const today = startOfDay(now);
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Round to next 30-minute interval
    const nextHalfHour = new Date(now);
    if (currentMinute < 30) {
      nextHalfHour.setMinutes(30, 0, 0);
    } else {
      nextHalfHour.setHours(currentHour + 1, 0, 0, 0);
    }

    const options: QuickOption[] = [
      {
        label: "In 1 hour",
        date: addHours(now, 1),
        time: format(addHours(now, 1), "HH:mm"),
        description: "Perfect for quick meetups",
      },
      {
        label: "Tonight",
        date: today,
        time: "19:00",
        description: "7:00 PM today",
      },
      {
        label: "Tomorrow morning",
        date: addDays(today, 1),
        time: "09:00",
        description: "9:00 AM tomorrow",
      },
      {
        label: "Tomorrow evening",
        date: addDays(today, 1),
        time: "18:00",
        description: "6:00 PM tomorrow",
      },
      {
        label: "This weekend",
        date: addDays(today, 6 - now.getDay()), // Next Saturday
        time: "14:00",
        description: "2:00 PM this Saturday",
      },
      {
        label: "Next week",
        date: addWeeks(today, 1),
        time: "19:00",
        description: "7:00 PM next week",
      },
    ];

    return options;
  };

  const quickOptions = generateQuickOptions();

  const handleQuickOption = (option: QuickOption) => {
    const year = option.date.getFullYear();
    const month = String(option.date.getMonth() + 1).padStart(2, "0");
    const day = String(option.date.getDate()).padStart(2, "0");

    onDateChange(`${year}-${month}-${day}`);
    onTimeChange(option.time);
    setShowQuickOptions(false);
  };

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return "No date selected";
    try {
      const date = parseISO(dateStr);
      return format(date, "EEEE, MMMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const formatTimeForDisplay = (timeStr: string) => {
    if (!timeStr) return "No time selected";
    try {
      const [hours, minutes] = timeStr.split(":");
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, "h:mm a");
    } catch {
      return "Invalid time";
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Options */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Quick Options</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowQuickOptions(!showQuickOptions)}
            disabled={disabled}
            className="h-auto p-1"
          >
            {showQuickOptions ? "Hide" : "Show"}
          </Button>
        </div>

        {showQuickOptions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickOptions.map((option) => (
              <Button
                key={option.label}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickOption(option)}
                disabled={disabled}
                className="h-auto p-3 justify-start text-left"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Current Selection Display */}
      {(date || time) && (
        <div className="flex flex-wrap gap-2">
          {date && (
            <Badge variant="secondary" className="gap-1">
              <CalendarIcon className="h-3 w-3" />
              {formatDateForDisplay(date)}
            </Badge>
          )}
          {time && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeForDisplay(time)}
            </Badge>
          )}
        </div>
      )}

      {/* Date Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>
        <Calendar
          selected={date ? new Date(date) : undefined}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(
                2,
                "0"
              );
              const day = String(selectedDate.getDate()).padStart(2, "0");
              onDateChange(`${year}-${month}-${day}`);
            } else {
              onDateChange("");
            }
          }}
          mode="single"
          disabled={(date) =>
            isBefore(startOfDay(date), startOfDay(new Date()))
          }
          className="rounded-md border"
        />
      </div>

      {/* Time Picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Time</label>
        <Input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          disabled={disabled}
          className="w-full"
        />
      </div>

      {/* Smart Time Suggestions */}
      {date && !time && (
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Popular times:</span>
          <div className="flex flex-wrap gap-2">
            {["09:00", "12:00", "14:00", "18:00", "19:00", "20:00"].map(
              (suggestedTime) => (
                <Button
                  key={suggestedTime}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onTimeChange(suggestedTime)}
                  disabled={disabled}
                  className="text-xs"
                >
                  {formatTimeForDisplay(suggestedTime)}
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
