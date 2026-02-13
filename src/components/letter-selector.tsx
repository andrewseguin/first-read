
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LETTER_LEVELS, LetterInfo } from "@/lib/letters";
import type { Dispatch, SetStateAction } from "react";
import { GameModeToggle } from "./game-mode-toggle";

type LetterSelectorProps = {
  selectedLetters: string[];
  setSelectedLetters: Dispatch<SetStateAction<string[]>>;
  onOpenChange?: (open: boolean) => void;
  gameMode: string;
  onGameModeChange: (mode: string) => void;
};

export function LetterSelector({
  selectedLetters,
  setSelectedLetters,
  onOpenChange,
  gameMode,
  onGameModeChange,
}: LetterSelectorProps) {
  const handleLetterChange = (letter: string, checked: boolean) => {
    setSelectedLetters((prev) => {
      const newSelection = checked
        ? [...prev, letter]
        : prev.filter((l) => l !== letter);
      return newSelection.sort((a, b) => a.localeCompare(b));
    });
  };

  const handleSelectAll = (levelLetters: LetterInfo[]) => {
    setSelectedLetters((prev) => {
      const newSelection = [...prev];
      for (const letter of levelLetters) {
        if (!newSelection.includes(letter.char)) {
          newSelection.push(letter.char);
        }
      }
      return newSelection.sort((a, b) => a.localeCompare(b));
    });
  };

  const handleClearAll = (levelLetters: LetterInfo[]) => {
    setSelectedLetters((prev) => {
      const levelChars = levelLetters.map((l) => l.char);
      const newSelection = prev.filter((l) => !levelChars.includes(l));
      return newSelection;
    });
  };

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground/50 hover:text-foreground active:scale-95 transition-transform"
          aria-label="Select letters"
        >
          <GraduationCap className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[90vw] sm:w-[500px] max-h-[90vh] overflow-y-auto" align="end" onPointerDown={(e) => e.stopPropagation()}>
        <div className="grid gap-4">
          <div>
            <h4 className="font-medium leading-none font-headline text-lg mb-4">
              Game Mode
            </h4>
            <GameModeToggle
              value={gameMode}
              onValueChange={onGameModeChange}
              className="w-full mb-8"
            />
            <h4 className="font-medium leading-none font-headline text-lg">
              Letters
            </h4>
          </div>
          <div className="space-y-4 pr-4">
              {LETTER_LEVELS.map((level) => (
                <div key={level.level}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: level.color }}
                    />
                    <h5 className="text-lg font-bold font-headline text-foreground">
                      {level.name}
                    </h5>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleSelectAll(level.letters)}
                    >
                      All
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleClearAll(level.letters)}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-5">
                    {level.letters.map((letter) => (
                      <div
                        key={letter.char}
                        className="flex items-center space-x-2 p-3 rounded-md hover:bg-accent cursor-pointer transition-colors min-w-[60px]"
                        onClick={() => {
                          const isChecked = selectedLetters.includes(letter.char);
                          handleLetterChange(letter.char, !isChecked);
                        }}
                      >
                        <Checkbox
                          id={`letter-${letter.char}`}
                          checked={selectedLetters.includes(letter.char)}
                          onCheckedChange={(checked) =>
                            handleLetterChange(letter.char, !!checked)
                          }
                          aria-label={letter.char}
                          className="h-5 w-5"
                        />
                        <Label
                          htmlFor={`letter-${letter.char}`}
                          className="text-xl font-medium font-headline cursor-pointer pointer-events-none"
                        >
                          {letter.char}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
