"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onDateChange,
  disabled = false,
  minDate,
  maxDate,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    date
  );
  const selectedDate = date !== undefined ? date : internalDate;

  const handleSelect = (newDate: Date | undefined) => {
    if (date === undefined) {
      setInternalDate(newDate);
    }
    onDateChange?.(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-empty={!selectedDate}
          className={cn(
            "data-[empty=true]:text-muted-foreground justify-start text-left font-normal",
            className || "w-[280px]"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            format(selectedDate, "PPP")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          disabled={(date) => {
            if (disabled) return true;
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
