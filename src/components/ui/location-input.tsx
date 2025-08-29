"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Edit, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounced-search";
import { ActionLoader } from "@/components/ui/loading-animations";

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
  onSelectSuggestion?: (value: {
    displayName: string;
    lat: number;
    lon: number;
  }) => void;
}

export function LocationInput({
  value,
  onChange,
  className,
  disabled = false,
  onSelectSuggestion,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use debounced search
  const {
    value: inputValue,
    debouncedValue: debouncedSearch,
    setValue: setInputValue,
  } = useDebounce(value, 300);

  // Debounced search function
  const searchLocations = useCallback(
    async (query: string): Promise<NominatimResult[]> => {
      if (query.length < 3) return [];

      // Format address to show only essential parts
      const formatAddress = (displayName: string): string => {
        const parts = displayName.split(", ");

        // Filter out administrative divisions and keep essential parts
        const essentialParts = parts.filter((part) => {
          const lowerPart = part.toLowerCase();
          return (
            !lowerPart.startsWith("city of ") &&
            !lowerPart.startsWith("borough of ") &&
            !lowerPart.startsWith("district of ") &&
            !lowerPart.startsWith("county of ") &&
            !lowerPart.startsWith("region of ") &&
            !lowerPart.startsWith("municipality of ") &&
            !lowerPart.startsWith("shire of ") &&
            !lowerPart.includes(" on the ") && // Filter out "on the Park" type phrases
            !lowerPart.includes(" estate") && // Filter out estate names
            !lowerPart.includes(" village") && // Filter out village names
            !lowerPart.includes(" complex") && // Filter out complex names
            !lowerPart.includes(" center") && // Filter out center names
            !lowerPart.includes(" centre") // Filter out centre names
          );
        });

        // Clean up and remove duplicates
        const cleanedParts = [
          ...new Set(
            essentialParts
              .map((part) => part.trim())
              .filter((part) => part.length > 0)
          ),
        ];

        // Organize address parts in proper order: street, suburb, postcode, city, state, country
        const postcodeParts = cleanedParts.filter(
          (part) => part.match(/^\d{4}$/) // 4-digit postcodes only
        );

        const streetParts = cleanedParts.filter(
          (part) =>
            (part.toLowerCase().includes("street") ||
              part.toLowerCase().includes("road") ||
              part.toLowerCase().includes("avenue") ||
              part.toLowerCase().includes("drive") ||
              part.toLowerCase().includes("lane") ||
              part.toLowerCase().includes("walk") ||
              part.toLowerCase().includes("court") ||
              part.toLowerCase().includes("place") ||
              part.toLowerCase().includes("close") ||
              part.toLowerCase().includes("crescent") ||
              part.toLowerCase().includes("way") ||
              (/\d/.test(part) && !part.match(/^\d{4}$/))) && // Contains numbers but not 4-digit postcodes
            !postcodeParts.includes(part)
        );

        const suburbParts = cleanedParts.filter(
          (part) =>
            !streetParts.includes(part) &&
            !postcodeParts.includes(part) &&
            !part.toLowerCase().includes("melbourne") &&
            !part.toLowerCase().includes("victoria") &&
            !part.toLowerCase().includes("australia")
        );

        const cityStateCountryParts = cleanedParts.filter(
          (part) =>
            !streetParts.includes(part) &&
            !suburbParts.includes(part) &&
            !postcodeParts.includes(part)
        );

        // Combine in proper order: street, suburb, postcode, city/state/country
        return [
          ...streetParts,
          ...suburbParts,
          ...postcodeParts,
          ...cityStateCountryParts,
        ].join(", ");
      };

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=us,ca,gb,au,nz`
        );

        if (!response.ok) {
          return [];
        }

        const results = await response.json();

        const formattedResults = results.map(
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

        return formattedResults;
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
    if (onSelectSuggestion) {
      const latNum = Number(suggestion.lat);
      const lonNum = Number(suggestion.lon);
      onSelectSuggestion({
        displayName: suggestion.display_name,
        lat: Number.isFinite(latNum) ? latNum : 0,
        lon: Number.isFinite(lonNum) ? lonNum : 0,
      });
    }
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
            <ActionLoader
              action="sync"
              size="sm"
              className="text-muted-foreground"
            />
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
