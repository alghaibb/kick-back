"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Edit, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounced-search";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function LocationInput({
  value,
  onChange,
  className,
  disabled = false,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use debounced search
  const { debouncedValue: debouncedSearch } = useDebounce(inputValue, 300);

  // Format address to show only essential parts
  const formatAddress = (displayName: string): string => {
    const parts = displayName.split(", ");

    // Filter out administrative divisions and keep essential parts
    const essentialParts = parts.filter((part) => {
      const lowerPart = part.toLowerCase();
      return (
        !lowerPart.includes("city of") &&
        !lowerPart.includes("borough of") &&
        !lowerPart.includes("district of") &&
        !lowerPart.includes("county of") &&
        !lowerPart.includes("region of") &&
        !lowerPart.includes("municipality of") &&
        !lowerPart.includes("shire of")
      );
    });

    return essentialParts.join(", ");
  };

  // Debounced search function
  const searchLocations = useCallback(
    async (query: string): Promise<NominatimResult[]> => {
      if (query.length < 3) return [];

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=us,ca,gb,au,nz`
        );

        if (!response.ok) return [];

        const results = await response.json();
        return results.map(
          (result: {
            display_name: string;
            lat: string;
            lon: string;
            type: string;
          }) => ({
            display_name: formatAddress(result.display_name),
            lat: result.lat,
            lon: result.lon,
            type: result.type,
          })
        );
      } catch (error) {
        console.error("Location search error:", error);
        return [];
      }
    },
    []
  );

  // Handle input change
  const handleInputChange = (input: string) => {
    setInputValue(input);
    onChange(input);

    if (input.length < 3 || isCustom) {
      setShowSuggestions(false);
      setIsLoading(false);
    }
  };

  // Effect to handle debounced search
  useEffect(() => {
    if (debouncedSearch.length >= 3 && !isCustom) {
      setIsLoading(true);
      setShowSuggestions(false);

      searchLocations(debouncedSearch).then((results) => {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setIsLoading(false);
      });
    }
  }, [debouncedSearch, isCustom, searchLocations]);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: NominatimResult) => {
    setInputValue(suggestion.display_name);
    onChange(suggestion.display_name);
    setShowSuggestions(false);
    setIsCustom(false);
  };

  // Handle mode toggle
  const handleModeToggle = (custom: boolean) => {
    setIsCustom(custom);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsLoading(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Mode Toggle Buttons */}
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          variant={!isCustom ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeToggle(false)}
          disabled={disabled}
          className="flex-1 sm:flex-none"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Auto-suggest
        </Button>
        <Button
          type="button"
          variant={isCustom ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeToggle(true)}
          disabled={disabled}
          className="flex-1 sm:flex-none"
        >
          <Edit className="h-4 w-4 mr-2" />
          Custom
        </Button>
      </div>

      {/* Input Field */}
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={
            isCustom
              ? "Enter custom location..."
              : "Start typing for address suggestions..."
          }
          disabled={disabled}
          className="pr-10"
        />

        {/* Loading Indicator */}
        {isLoading && !isCustom && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Search Icon */}
        {!isLoading && !isCustom && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.display_name}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b last:border-b-0"
            >
              <div className="font-medium text-sm">
                {suggestion.display_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showSuggestions &&
        suggestions.length === 0 &&
        inputValue.length >= 3 &&
        !isLoading && (
          <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg p-3">
            <p className="text-sm text-muted-foreground text-center">
              No locations found. Try a different search term or switch to
              custom mode.
            </p>
          </div>
        )}
    </div>
  );
}
