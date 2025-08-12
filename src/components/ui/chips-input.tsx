"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type Chip = {
  id?: string;
  label: string;
  value: string;
};

interface ChipsInputProps {
  value: Chip[];
  onChange: (chips: Chip[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onQueryChange?: (q: string) => void;
  suggestions?: Chip[];
  isLoading?: boolean;
  className?: string;
  validateEmailOnly?: boolean;
}

export function ChipsInput({
  value,
  onChange,
  placeholder,
  disabled,
  onQueryChange,
  suggestions = [],
  isLoading,
  className,
  validateEmailOnly = false,
}: ChipsInputProps) {
  const [input, setInput] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const listboxId = React.useId();

  const isValidEmail = (text: string) => {
    return /^(?:[a-zA-Z0-9_.'%+-]+)@(?:[a-zA-Z0-9.-]+)\.[a-zA-Z]{2,}$/.test(
      text
    );
  };

  const addChip = (chip: Chip) => {
    if (value.some((c) => c.value.toLowerCase() === chip.value.toLowerCase())) {
      return;
    }
    onChange([...value, chip]);
    setInput("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const removeChip = (idx: number) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeChip(value.length - 1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((idx) =>
        Math.min((idx < 0 ? -1 : idx) + 1, suggestions.length - 1)
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((idx) =>
        Math.max((idx < 0 ? suggestions.length : idx) - 1, -1)
      );
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === "Enter") {
      if (open && activeIndex >= 0 && activeIndex < suggestions.length) {
        e.preventDefault();
        addChip(suggestions[activeIndex]);
        setActiveIndex(-1);
        return;
      }
    }
    if (e.key === "," || e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed !== "") {
        if (validateEmailOnly && !isValidEmail(trimmed)) {
          return;
        }
        addChip({ label: trimmed, value: trimmed });
      }
    }
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setInput(e.target.value);
    setOpen(true);
    onQueryChange?.(e.target.value);
  };

  React.useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30",
          "border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm",
          "ring-offset-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] ring-offset-2",
          "flex-wrap items-center gap-1",
          disabled && "opacity-50"
        )}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
      >
        {value.map((chip, idx) => (
          <Badge
            key={`${chip.value}-${idx}`}
            variant="secondary"
            size="sm"
            className="gap-1"
          >
            {chip.label}
            <button
              type="button"
              onClick={() => removeChip(idx)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${chip.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground text-base md:text-sm"
          placeholder={value.length > 0 ? "" : placeholder}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 && suggestions[activeIndex]
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
        />
      </div>

      {open && (suggestions.length > 0 || isLoading) && (
        <div
          id={listboxId}
          role="listbox"
          className="mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {isLoading && (
            <div className="px-2 py-1 text-xs text-muted-foreground">
              Searching…
            </div>
          )}
          {!isLoading &&
            suggestions.map((s, idx) => (
              <button
                key={s.value}
                type="button"
                onClick={() => addChip(s)}
                role="option"
                id={`${listboxId}-option-${idx}`}
                aria-selected={idx === activeIndex}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground",
                  idx === activeIndex && "bg-accent text-accent-foreground"
                )}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                {s.label}
                <span className="ml-auto text-xs text-muted-foreground">
                  {s.value}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
