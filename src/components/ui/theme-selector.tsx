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
          className="
            h-9 w-9 p-0 border-none bg-transparent shadow-none
            flex items-center justify-center gap-2 rounded-md
            transition-colors focus:outline-none focus:ring-1 focus:ring-ring
            [&>svg:last-child]:hidden
          "
        >
          <Paintbrush className="w-5 h-5 text-muted-foreground mx-auto" />
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