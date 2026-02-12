"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { DEFAULT_LETTERS, getLetterData, LETTER_LEVELS } from "@/lib/letters";
import { LetterSelector } from "@/components/letter-selector";
import { LetterDisplay } from "@/components/letter-display";
import { getEncouragement } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

const ENCOURAGEMENT_INTERVAL = 5;

const shuffle = (array: string[]) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

type DisplayContent = {
  key: string;
  type: "letter" | "message";
  value: string;
  color?: string;
};

export default function Home() {
  const [selectedLetters, setSelectedLetters] = useLocalStorage<string[]>(
    "peek-a-letter-selection",
    DEFAULT_LETTERS
  );

  const [lettersInCycle, setLettersInCycle] = useState<string[]>([]);

  const availableLetters = useMemo(() => {
    return selectedLetters.length > 0 ? selectedLetters : [];
  }, [selectedLetters]);
  
  const getInitialLetter = () => {
    const letter = availableLetters.length > 0 ? availableLetters[0] : 'a';
    const data = getLetterData(letter);
    return {
      key: "initial",
      type: "letter" as const,
      value: letter,
      color: data?.color,
    }
  }

  const [displayContent, setDisplayContent] = useState<DisplayContent>(getInitialLetter());
  const [sessionCount, setSessionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setLettersInCycle([]);
  }, [availableLetters]);

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
      const firstLetter = availableLetters[0];
      const data = getLetterData(firstLetter);
      setDisplayContent({
        key: "update-from-selection",
        type: "letter",
        value: firstLetter,
        color: data?.color,
      });
    }
  }, [availableLetters, displayContent]);

  const showNextContent = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    const newCount = sessionCount + 1;
    setSessionCount(newCount);

    try {
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
        if (availableLetters.length === 0) {
          setDisplayContent({
            key: "no-letters-msg",
            type: "message",
            value: "Choose some letters in the menu!",
          });
          setIsLoading(false);
          return;
        }

        let currentCycle = lettersInCycle;
        if (currentCycle.length === 0) {
          currentCycle = shuffle([...availableLetters]);
        }
        
        const newLetter = currentCycle[0];
        const newCycle = currentCycle.slice(1);
        setLettersInCycle(newCycle);

        const letterData = getLetterData(newLetter);

        setDisplayContent({
          key: Date.now().toString(),
          type: "letter",
          value: newLetter,
          color: letterData?.color,
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
    lettersInCycle,
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
