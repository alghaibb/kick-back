"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeConfig } from "@/providers/ActiveThemeProvider";
import { Paintbrush } from "lucide-react";

const THEMES = [
  {
    label: "Default",
    options: [
      { name: "Default", value: "default" },
      { name: "Blue", value: "blue" },
      { name: "Green", value: "green" },
      { name: "Amber", value: "amber" },
    ],
  },
];

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="theme-selector" className="sr-only">
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={setActiveTheme}>
        <SelectTrigger
          id="theme-selector"
          className="h-10 w-10 sm:w-auto px-0 sm:px-3 sm:min-w-[150px] flex items-center justify-center sm:justify-start gap-2 rounded-md border border-input bg-transparent transition-colors focus:outline-none focus:ring-1 focus:ring-ring [&>svg:last-child]:hidden"
        >
          {/* Desktop: Text and value */}
          <span className="hidden sm:block text-muted-foreground text-sm">
            Select Theme:
          </span>
          <span className="hidden sm:block">
            <SelectValue placeholder="Select a theme" />
          </span>

          {/* Mobile: Centered Paintbrush */}
          <Paintbrush className="sm:hidden w-4 h-4 text-muted-foreground mx-auto" />
        </SelectTrigger>
        <SelectContent align="end">
          {THEMES.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.options.map((theme) => (
                <SelectItem key={theme.value} value={theme.value}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
