
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type GameModeToggleProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  enableWords: boolean;
};

export function GameModeToggle({
  value,
  onValueChange,
  className,
  enableWords,
}: GameModeToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full p-1 bg-muted",
        className
      )}
    >
      <Button
        variant={value === "letters" ? "default" : "ghost"}
        className="rounded-full w-full"
        onClick={() => onValueChange("letters")}
      >
        Letters
      </Button>
      {enableWords && (
        <Button
          variant={value === "words" ? "default" : "ghost"}
          className="rounded-full w-full"
          onClick={() => onValueChange("words")}
        >
          Words
        </Button>
      )}
    </div>
  );
}
