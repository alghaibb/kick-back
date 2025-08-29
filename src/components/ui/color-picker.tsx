"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Palette } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  className?: string;
  disabled?: boolean;
}

const PRESET_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Orange", value: "#f97316" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Lime", value: "#84cc16" },
  { name: "Emerald", value: "#10b981" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Slate", value: "#64748b" },
  { name: "Zinc", value: "#71717a" },
];

export function ColorPicker({
  value = "#3b82f6",
  onChange,
  className,
  disabled = false,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedColor = PRESET_COLORS.find((c) => c.value === value) || {
    name: "Custom",
    value,
  };

  const handleColorSelect = (color: string) => {
    onChange?.(color);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2 w-full">
            <div
              className="h-5 w-5 rounded border border-border"
              style={{ backgroundColor: value }}
            />
            <span className="flex-1 truncate">{selectedColor.name}</span>
            <Palette className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((color, i) => (
            <button
              key={`${color.value}-${i}`}
              className={cn(
                "relative h-10 w-full rounded-md border border-border transition-all",
                "hover:scale-105 hover:shadow-md",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => handleColorSelect(color.value)}
              title={color.name}
            >
              {value === color.value && (
                <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="text-xs text-muted-foreground">Custom color</label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={value}
              onChange={(e) => handleColorSelect(e.target.value)}
              className="h-10 w-full rounded border border-border cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleColorSelect(e.target.value)}
              placeholder="#000000"
              className="h-10 w-full rounded border border-border px-2 text-sm"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
