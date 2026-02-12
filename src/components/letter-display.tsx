"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

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
  // Generate random rotation for exit animation on render
  // This is safe because exit animations only happen on client side updates
  const exitRotation = Math.random() * 60 - 30;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <AnimatePresence>
        {content.type === "message" ? (
          <motion.div
            key={content.key}
            initial={{ x: "-50%", y: "-60%", opacity: 0, scale: 0.9 }}
            animate={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
            exit={{ x: "-50%", y: "100%", opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="max-w-xl font-body text-3xl sm:text-4xl md:text-5xl font-semibold text-accent px-8 text-center select-none absolute left-1/2 top-1/2 w-full"
          >
            {content.value}
          </motion.div>
        ) : (
          <motion.div
            key={content.key}
            initial={{ x: "-50%", y: "-60%", opacity: 0, scale: 0.9 }}
            animate={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
            exit={{
              x: "-50%",
              y: "100vh",
              opacity: 0,
              rotate: exitRotation,
              transition: { duration: 0.5, ease: "easeIn" },
            }}
            className="absolute left-1/2 top-1/2"
            style={{ zIndex: 10 }}
          >
            <Card
              className="w-[700px] h-[350px] border-none"
              style={{
                backgroundColor: content.color,
                boxShadow:
                  "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12), 0 16px 16px rgba(0,0,0,0.12)",
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
                    color: content.textColor || "white",
                    transform: `translateY(${content.verticalOffset || 0}rem)`,
                  }}
                >
                  {content.value}
                </span>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}