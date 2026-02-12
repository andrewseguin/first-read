"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LETTER_LEVELS } from "@/lib/letters";
import type { Dispatch, SetStateAction } from "react";
import { ScrollArea } from "./ui/scroll-area";

type LetterSelectorProps = {
  selectedLetters: string[];
  setSelectedLetters: Dispatch<SetStateAction<string[]>>;
};

export function LetterSelector({
  selectedLetters,
  setSelectedLetters,
}: LetterSelectorProps) {
  const handleParentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleLetterChange = (letter: string, checked: boolean) => {
    setSelectedLetters((prev) => {
      const newSelection = checked
        ? [...prev, letter]
        : prev.filter((l) => l !== letter);
      return newSelection.sort((a, b) => a.localeCompare(b));
    });
  };

  return (
    <div onClick={handleParentClick}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-foreground/50 hover:text-foreground active:scale-95 transition-transform"
            aria-label="Select letters"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none font-headline">
                Choose Letters
              </h4>
              <p className="text-sm text-muted-foreground">
                Select the letters you want to practice.
              </p>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-4 pr-4">
                {LETTER_LEVELS.map((level) => (
                  <div key={level.level}>
                    <h5 className="mb-2 text-sm font-semibold font-headline text-muted-foreground">
                      {level.name}
                    </h5>
                    <div className="grid grid-cols-4 gap-4">
                      {level.letters.map((letter) => (
                        <div key={letter} className="flex items-center space-x-2">
                          <Checkbox
                            id={`letter-${letter}`}
                            checked={selectedLetters.includes(letter)}
                            onCheckedChange={(checked) =>
                              handleLetterChange(letter, !!checked)
                            }
                            aria-label={letter}
                          />
                          <Label
                            htmlFor={`letter-${letter}`}
                            className="text-lg font-medium font-headline cursor-pointer"
                          >
                            {letter}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
