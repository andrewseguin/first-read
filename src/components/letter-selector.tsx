
import { GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LETTER_LEVELS, LetterInfo } from "@/lib/letters";
import type { Dispatch, SetStateAction } from "react";
import { GameModeToggle } from "./game-mode-toggle";

type LetterSelectorProps = {
  open: boolean;
  selectedLetters: string[];
  setSelectedLetters: Dispatch<SetStateAction<string[]>>;
  onOpenChange?: (open: boolean) => void;
  gameMode: string;
  onGameModeChange: (mode: string) => void;
  wordDifficulty: string;
  onWordDifficultyChange: (difficulty: string) => void;
  selectedWordLengths: number[];
  onSelectedWordLengthsChange: (lengths: number[]) => void;
};

import { WordDifficultyToggle } from "./word-difficulty-toggle";
import { WordLengthSelector } from "./word-length-selector";

export function LetterSelector({
  open,
  selectedLetters,
  setSelectedLetters,
  onOpenChange,
  gameMode,
  onGameModeChange,
  wordDifficulty,
  onWordDifficultyChange,
  selectedWordLengths,
  onSelectedWordLengthsChange,
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
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="active:scale-95 transition-transform"
          aria-label="Select letters"
        >
          <GraduationCap className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="mobile-fullscreen [@media(max-width:640px)]:!z-50 [@media(max-width:640px)]:!w-screen [@media(max-width:640px)]:!h-screen [@media(max-width:640px)]:!max-w-none [@media(max-width:640px)]:!m-0 [@media(max-width:640px)]:!rounded-none [@media(max-width:640px)]:!border-none sm:w-[400px] sm:h-auto sm:max-h-[90vh] sm:rounded-md sm:border bg-background p-0 flex flex-col"
        align="end"
        sideOffset={0}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end p-4 border-b sm:hidden sticky top-0 bg-background z-10">
          <h4 className="font-medium font-headline text-lg mr-auto">
            Settings
          </h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange?.(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-4 sm:mt-0">
            <div>
              <h4 className="font-medium leading-none font-headline text-lg mb-4 hidden sm:block">
                Game Mode
              </h4>
              <h4 className="font-medium leading-none font-headline text-lg mb-4 sm:hidden">
                Game Mode
              </h4>
              <GameModeToggle
                value={gameMode}
                onValueChange={onGameModeChange}
                className="w-full mb-8"
              />
              {gameMode === 'words' && (
                <>
                  <div className="mb-8">
                    <h4 className="font-medium leading-none font-headline text-lg mb-4">
                      Word Difficulty
                    </h4>
                    <WordDifficultyToggle
                      value={wordDifficulty}
                      onValueChange={onWordDifficultyChange}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Hard mode: includes words where vowels sound long or irregular. Cards will display a star.
                    </p>
                  </div>
                  <div className="mb-8">
                    <h4 className="font-medium leading-none font-headline text-lg mb-4">
                      Word Length
                    </h4>
                    <WordLengthSelector
                      selectedLengths={selectedWordLengths}
                      onSelectedLengthsChange={onSelectedWordLengthsChange}
                    />
                  </div>
                </>
              )}
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
                    {level.letters.map((letter) => {
                      const isSelected = selectedLetters.includes(letter.char);
                      return (
                        <div
                          key={letter.char}
                          className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer transition-all duration-200 shadow-sm",
                            isSelected
                              ? "scale-110 font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                          onClick={() => handleLetterChange(letter.char, !isSelected)}
                          role="checkbox"
                          aria-checked={isSelected}
                          aria-label={`Select letter ${letter.char}`}
                        >
                          <span className="text-2xl font-headline pb-1">
                            {letter.char}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
