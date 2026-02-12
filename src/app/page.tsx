"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { DEFAULT_LETTERS } from "@/lib/letters";
import { LetterSelector } from "@/components/letter-selector";
import { LetterDisplay } from "@/components/letter-display";
import { getEncouragement } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

const ENCOURAGEMENT_INTERVAL = 5;

type DisplayContent = {
  key: string;
  type: "letter" | "message";
  value: string;
};

export default function Home() {
  const [selectedLetters, setSelectedLetters] = useLocalStorage<string[]>(
    "peek-a-letter-selection",
    DEFAULT_LETTERS
  );

  const availableLetters = useMemo(() => {
    return selectedLetters.length > 0 ? selectedLetters : [];
  }, [selectedLetters]);

  const [displayContent, setDisplayContent] = useState<DisplayContent>({
    key: "initial",
    type: "letter",
    value: "a",
  });
  const [sessionCount, setSessionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (availableLetters.length === 0) {
      setDisplayContent((prev) =>
        prev.value !== "Choose some letters in the menu!"
          ? {
              key: "no-letters",
              type: "message",
              value: "Choose some letters in the menu!",
            }
          : prev
      );
    } else if (
      displayContent.type === "letter" &&
      !availableLetters.includes(displayContent.value)
    ) {
      setDisplayContent({
        key: "update-from-selection",
        type: "letter",
        value: availableLetters[0],
      });
    }
  }, [availableLetters, displayContent]);

  const showNextContent = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    const newCount = sessionCount + 1;
    setSessionCount(newCount);

    try {
      // Show encouragement message
      if (
        newCount % ENCOURAGEMENT_INTERVAL === 0 &&
        availableLetters.length > 0
      ) {
        const message = await getEncouragement();
        setDisplayContent({
          key: Date.now().toString(),
          type: "message",
          value: message,
        });
      } else {
        // Show letter
        if (availableLetters.length === 0) {
          setDisplayContent({
            key: "no-letters-msg",
            type: "message",
            value: "Choose some letters in the menu!",
          });
          setIsLoading(false);
          return;
        }

        let newLetter =
          availableLetters[Math.floor(Math.random() * availableLetters.length)];

        if (availableLetters.length > 1) {
          while (newLetter === displayContent.value) {
            newLetter =
              availableLetters[
                Math.floor(Math.random() * availableLetters.length)
              ];
          }
        }

        setDisplayContent({
          key: Date.now().toString(),
          type: "letter",
          value: newLetter,
        });
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    isLoading,
    sessionCount,
    availableLetters,
    toast,
    displayContent.value,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        showNextContent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNextContent]);

  return (
    <main
      className="flex h-svh w-screen cursor-pointer items-center justify-center bg-background overflow-hidden relative focus:outline-none"
      onClick={showNextContent}
      tabIndex={-1}
    >
      <LetterDisplay content={displayContent} />
      <LetterSelector
        selectedLetters={selectedLetters}
        setSelectedLetters={setSelectedLetters}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader className="h-16 w-16 animate-spin text-primary" />
        </div>
      )}
    </main>
  );
}
