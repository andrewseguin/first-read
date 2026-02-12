
"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

type DisplayContent = {
  key: string;
  type: "letter" | "message";
  value: string;
  color?: string;
  textColor?: string;
  verticalOffset?: number;
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
      className="animate-in fade-in zoom-in-95 duration-300 w-[700px] h-[350px] border-none"
      style={{ 
        backgroundColor: content.color,
        boxShadow: "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)",
        borderTop: "1px solid rgba(255,255,255,0.2)",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <CardContent className="p-0 h-full flex items-center justify-center">
        <span
          className={cn(
            "font-headline font-normal text-[17.5rem] leading-none",
            "select-none [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)]"
          )}
          style={{
            color: content.textColor || 'white',
            transform: `translateY(${content.verticalOffset || 0}rem)`,
            transition: 'transform 0.2s ease-out'
          }}
        >
          {content.value}
        </span>
      </CardContent>
    </Card>
  );
}
