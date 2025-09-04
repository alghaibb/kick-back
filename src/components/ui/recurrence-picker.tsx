"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import { Repeat } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "custom";
export type RecurrenceEndType = "never" | "after" | "on";

export interface RecurrenceConfig {
  enabled: boolean;
  frequency: RecurrenceFrequency;
  interval: number; // Every X days/weeks/months
  endType: RecurrenceEndType;
  endAfter?: number; // Number of occurrences
  endDate?: Date; // End date
  weekDays?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
}

interface RecurrencePickerProps {
  value: RecurrenceConfig;
  onChange: (config: RecurrenceConfig) => void;
  eventDate?: Date;
}

const WEEKDAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

export function RecurrencePicker({
  value,
  onChange,
  eventDate = new Date(),
}: RecurrencePickerProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleToggle = (enabled: boolean) => {
    onChange({
      ...value,
      enabled,
      // Set defaults when enabling
      frequency: enabled && !value.frequency ? "weekly" : value.frequency,
      interval: enabled && !value.interval ? 1 : value.interval,
      endType: enabled && !value.endType ? "never" : value.endType,
      weekDays:
        enabled && !value.weekDays ? [eventDate.getDay()] : value.weekDays,
    });
  };

  const handleFrequencyChange = (frequency: RecurrenceFrequency) => {
    onChange({
      ...value,
      frequency,
      // Reset weekdays if changing from weekly
      weekDays: frequency === "weekly" ? [eventDate.getDay()] : undefined,
    });
  };

  const handleWeekDayToggle = (day: number) => {
    const currentDays = value.weekDays || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort();

    // Ensure at least one day is selected
    if (newDays.length === 0) return;

    onChange({ ...value, weekDays: newDays });
  };

  const getRecurrenceDescription = () => {
    if (!value.enabled) return "";

    let desc = "";
    const interval = value.interval || 1;

    switch (value.frequency) {
      case "daily":
        desc = interval === 1 ? "Daily" : `Every ${interval} days`;
        break;
      case "weekly":
        if (interval === 1) {
          const days = value.weekDays?.map((d) => WEEKDAYS[d].label).join(", ");
          desc = `Weekly on ${days || "selected days"}`;
        } else {
          desc = `Every ${interval} weeks`;
        }
        break;
      case "monthly":
        const dayOfMonth = eventDate.getDate();
        desc =
          interval === 1
            ? `Monthly on the ${dayOfMonth}${getOrdinalSuffix(dayOfMonth)}`
            : `Every ${interval} months`;
        break;
      default:
        desc = "Custom recurrence";
    }

    // Add end condition
    if (value.endType === "after" && value.endAfter) {
      desc += ` (${value.endAfter} times)`;
    } else if (value.endType === "on" && value.endDate) {
      desc += ` until ${format(value.endDate, "MMM d, yyyy")}`;
    }

    return desc;
  };

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return (
    <div className="space-y-4">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Repeat className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="recurrence-toggle">Repeat this event</Label>
        </div>
        <Switch
          id="recurrence-toggle"
          checked={value.enabled}
          onCheckedChange={handleToggle}
        />
      </div>

      {value.enabled && (
        <>
          {/* Recurrence Description */}
          {getRecurrenceDescription() && (
            <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              {getRecurrenceDescription()}
            </div>
          )}

          {/* Frequency Selector */}
          <div className="space-y-3">
            <Label>Repeat frequency</Label>
            <Select
              value={value.frequency}
              onValueChange={(v) =>
                handleFrequencyChange(v as RecurrenceFrequency)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weekly Day Selector */}
          {value.frequency === "weekly" && (
            <div className="space-y-3">
              <Label>Repeat on</Label>
              <div className="flex gap-1">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => handleWeekDayToggle(day.value)}
                    className={cn(
                      "flex-1 py-2 px-1 text-xs font-medium rounded-md transition-colors",
                      value.weekDays?.includes(day.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* End Condition */}
          <div className="space-y-3">
            <Label>Ends</Label>
            <RadioGroup
              value={value.endType}
              onValueChange={(v) =>
                onChange({ ...value, endType: v as RecurrenceEndType })
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="never" />
                <Label htmlFor="never" className="font-normal">
                  Never
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="after" id="after" />
                <Label htmlFor="after" className="font-normal">
                  After
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="365"
                  value={value.endAfter || 10}
                  onChange={(e) =>
                    onChange({
                      ...value,
                      endAfter: parseInt(e.target.value) || 10,
                    })
                  }
                  className="w-16 h-8"
                  disabled={value.endType !== "after"}
                />
                <span className="text-sm text-muted-foreground">
                  occurrences
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="on" id="on" />
                <Label htmlFor="on" className="font-normal">
                  On
                </Label>
                <DatePicker
                  date={value.endDate}
                  onDateChange={(date) => onChange({ ...value, endDate: date })}
                  disabled={value.endType !== "on"}
                  minDate={eventDate}
                  className="w-40"
                  placeholder="End date"
                />
              </div>
            </RadioGroup>
          </div>
        </>
      )}
    </div>
  );
}
