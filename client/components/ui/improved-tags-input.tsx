"use client";

import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ImprovedTagsInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxTags?: number;
  suggestions?: string[];
}

export default function ImprovedTagsInput({ 
  tags, 
  setTags, 
  placeholder = "Add a tag and press Enter",
  className = "",
  disabled = false,
  maxTags = 10,
  suggestions = []
}: ImprovedTagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const defaultSuggestions = [
    "Increase brand awareness",
    "Drive sales",
    "Generate leads",
    "Improve engagement",
    "Build community",
    "Launch new product",
    "Boost website traffic",
    "Increase followers"
  ];

  const allSuggestions = [...suggestions, ...defaultSuggestions];
  const filteredSuggestions = allSuggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion) &&
      inputValue.length > 0
  );

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const addTag = (tagToAdd?: string) => {
    const trimmedValue = (tagToAdd || inputValue).trim();
    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      setTags([...tags, trimmedValue]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={placeholder}
            disabled={disabled || tags.length >= maxTags}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={() => addTag()}
            disabled={!inputValue.trim() || disabled || tags.length >= maxTags}
            variant="outline"
            size="sm"
          >
            Add
          </Button>
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addTag(suggestion)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b last:border-b-0"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="flex items-center gap-1 pr-1"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                disabled={disabled}
                className="ml-1 hover:bg-destructive/10 rounded-full p-0.5 disabled:opacity-50"
                aria-label={`Remove ${tag} tag`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {/* Helper Text */}
      <div className="text-xs text-muted-foreground">
        {tags.length > 0 && (
          <span>{tags.length} of {maxTags} tags • </span>
        )}
        <span>Press Enter or click Add to create a tag</span>
        {tags.length === 0 && (
          <span> • Try typing &quot;brand awareness&quot; or &quot;drive sales&quot;</span>
        )}
      </div>
    </div>
  );
}
