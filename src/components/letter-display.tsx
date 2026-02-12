"use client";

import { cn } from "@/lib/utils";

type DisplayContent = {
  key: string;
  type: "letter" | "message";
  value: string;
};

type LetterDisplayProps = {
  content: DisplayContent;
};

export function LetterDisplay({ content }: LetterDisplayProps) {
  return (
    <div
      key={content.key}
      className={cn(
        "flex items-center justify-center text-center select-none animate-in fade-in zoom-in-95 duration-500",
        content.type === "letter"
          ? "font-headline text-[15rem] sm:text-[20rem] md:text-[25rem] lg:text-[30rem] leading-none font-bold text-primary"
          : "max-w-xl font-body text-3xl sm:text-4xl md:text-5xl font-semibold text-accent px-8"
      )}
    >
      {content.value}
    </div>
  );
}
