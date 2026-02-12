"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { DEFAULT_LETTERS } from "@/lib/letters";
import { LetterSelector } from "@/components/letter-selector";
import { LetterDisplay } from "@/components/letter-display";
import { getEncouragement } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

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
      setDisplayContent({
        key: 'no-letters',
        type: 'message',
        value: 'Choose some letters in the menu!',
      });
    } else if (!availableLetters.includes(displayContent.value)) {
      setDisplayContent({
        key: 'update-from-selection',
        type: 'letter',
        value: availableLetters[0]
      });
    }
  }, [availableLetters, displayContent.value]);


  const showNextLetter = useCallback(() => {
    if (availableLetters.length === 0) {
        setDisplayContent({
            key: 'no-letters-msg',
            type: 'message',
            value: 'Choose some letters in the menu!',
        });
        return;
    }

    let newLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    
    if (availableLetters.length > 1) {
      while (newLetter === displayContent.value) {
        newLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
      }
    }

    setDisplayContent({
      key: Date.now().toString(),
      type: "letter",
      value: newLetter,
    });
  }, [availableLetters, displayContent.value]);

  const showNext = useCallback(async () => {
    if (isLoading) return;

    const newCount = sessionCount + 1;
    setSessionCount(newCount);

    if (newCount % ENCOURAGEMENT_INTERVAL === 0 && availableLetters.length > 0) {
      setIsLoading(true);
      try {
        const message = await getEncouragement();
        setDisplayContent({
          key: Date.now().toString(),
          type: "message",
          value: message,
        });
      } catch (error) {
        console.error("Failed to get encouragement:", error);
        toast({
          title: "Error",
          description: "Could not fetch encouragement. Keep going!",
          variant: "destructive"
        });
        showNextLetter();
      } finally {
        setIsLoading(false);
      }
    } else {
      showNextLetter();
    }
  }, [isLoading, sessionCount, showNextLetter, toast, availableLetters.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        showNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNext]);

  return (
    <main
      className="flex h-svh w-screen cursor-pointer items-center justify-center bg-background overflow-hidden relative focus:outline-none"
      onClick={showNext}
      tabIndex={-1}
    >
      <LetterDisplay content={displayContent} />
      <LetterSelector
        selectedLetters={selectedLetters}
        setSelectedLetters={setSelectedLetters}
      />
    </main>
  );
}
