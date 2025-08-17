"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
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
  {
    label: "Premium",
    options: [
      { name: "Purple", value: "purple" },
      { name: "Rose", value: "rose" },
      { name: "Emerald", value: "emerald" },
      { name: "Indigo", value: "indigo" },
      { name: "Teal", value: "teal" },
      { name: "Violet", value: "violet" },
    ],
  },
];

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  // Theme color indicators for visual appeal
  const getThemeColor = (themeValue: string) => {
    switch (themeValue) {
      case "default":
        return "bg-zinc-500";
      case "blue":
        return "bg-blue-500";
      case "green":
        return "bg-green-500";
      case "amber":
        return "bg-amber-500";
      case "purple":
        return "bg-purple-600";
      case "rose":
        return "bg-rose-500";
      case "emerald":
        return "bg-emerald-500";
      case "indigo":
        return "bg-indigo-500";
      case "teal":
        return "bg-teal-500";
      case "violet":
        return "bg-violet-500";
      default:
        return "bg-zinc-500";
    }
  };

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
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${getThemeColor(activeTheme)}`}
            />
            <Paintbrush className="w-4 h-4 text-muted-foreground" />
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="w-48">
          {THEMES.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                {group.label}
              </SelectLabel>
              {group.options.map((theme) => (
                <SelectItem
                  key={theme.value}
                  value={theme.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className={`w-3 h-3 rounded-full ${getThemeColor(theme.value)}`}
                  />
                  <span>{theme.name}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
