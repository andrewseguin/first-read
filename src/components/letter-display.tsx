"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type DisplayContent = {
  key: string;
  type: "letter" | "message";
  value: string;
  color?: string;
};

type LetterDisplayProps = {
  content: DisplayContent;
};

export function LetterDisplay({ content }: LetterDisplayProps) {
  if (content.type === "message") {
    return (
      <div
        key={content.key}
        className="max-w-xl font-body text-3xl sm:text-4xl md:text-5xl font-semibold text-accent px-8 text-center select-none animate-in fade-in duration-500"
      >
        {content.value}
      </div>
    );
  }

  return (
    <Card
      key={content.key}
      className={cn(
        "shadow-xl animate-in fade-in zoom-in-95 duration-300",
        content.color
      )}
    >
      <CardContent className="p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <span
          className={cn(
            "font-headline font-normal text-[15rem] sm:text-[20rem] md:text-[25rem] lg:text-[30rem] leading-none text-white",
            "select-none [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]"
          )}
        >
          {content.value}
        </span>
      </CardContent>
    </Card>
  );
}
