"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WordLengthSelectorProps = {
  selectedLengths: number[];
  onSelectedLengthsChange: (lengths: number[]) => void;
};

const AVAILABLE_LENGTHS = [2, 3, 4, 5];

export function WordLengthSelector({
  selectedLengths,
  onSelectedLengthsChange,
}: WordLengthSelectorProps) {
  const toggleLength = (length: number) => {
    const isSelected = selectedLengths.includes(length);
    const newSelection = isSelected
      ? selectedLengths.filter((l) => l !== length)
      : [...selectedLengths, length];
    onSelectedLengthsChange(newSelection.sort());
  };

  return (
    <div className="flex items-center gap-1 rounded-full p-1 bg-muted">
      {AVAILABLE_LENGTHS.map((length) => {
        const isSelected = selectedLengths.includes(length);
        return (
          <Button
            key={length}
            variant={isSelected ? "default" : "ghost"}
            onClick={() => toggleLength(length)}
            className="rounded-full flex-1"
            aria-pressed={isSelected}
            size="sm"
          >
            {length}
          </Button>
        );
      })}
    </div>
  );
}
