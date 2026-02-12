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
import { ALL_LETTERS } from "@/lib/letters";
import type { Dispatch, SetStateAction } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";

type LetterSelectorProps = {
  selectedLetters: string[];
  setSelectedLetters: Dispatch<SetStateAction<string[]>>;
  isPhonicsMode: boolean;
  setIsPhonicsMode: Dispatch<SetStateAction<boolean>>;
};

export function LetterSelector({
  selectedLetters,
  setSelectedLetters,
  isPhonicsMode,
  setIsPhonicsMode,
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
            <ScrollArea className="h-48">
              <div className="grid grid-cols-4 gap-4 pr-4">
                {ALL_LETTERS.map((letter) => (
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
            </ScrollArea>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium leading-none font-headline">Settings</h4>
              <div className="flex items-center justify-between rounded-lg border p-3">
                 <div className="space-y-0.5">
                    <Label htmlFor="phonics-mode" className="cursor-pointer font-medium">Phonics Mode</Label>
                     <p className="text-sm text-muted-foreground">
                        Say the letter's sound when it appears.
                    </p>
                 </div>
                <Switch
                    id="phonics-mode"
                    checked={isPhonicsMode}
                    onCheckedChange={setIsPhonicsMode}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
