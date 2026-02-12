
"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { DEFAULT_LETTERS, getLetterInfo } from "@/lib/letters";
import { LetterSelector } from "@/components/letter-selector";
import { LetterDisplay } from "@/components/letter-display";
import { FullscreenToggle } from "@/components/fullscreen-toggle";
import { ModeToggle } from "@/components/mode-toggle";

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
  textColor?: string;
  verticalOffset?: number;
};

export default function Home() {
  const [selectedLetters, setSelectedLetters] = useLocalStorage<string[]>(
    "peek-a-letter-selection",
    DEFAULT_LETTERS
  );

  const [lettersInCycle, setLettersInCycle] = useLocalStorage<string[]>(
    "peek-a-letter-cycle",
    []
  );
  const lastChangeTimeRef = useRef(0);

  const availableLetters = useMemo(() => {
    return selectedLetters.length > 0 ? selectedLetters : [];
  }, [selectedLetters]);
  
  const getInitialLetter = () => {
    const letter = availableLetters.length > 0 ? availableLetters[0] : 'a';
    const data = getLetterInfo(letter);
    return {
      key: "initial",
      type: "letter" as const,
      value: letter,
      color: data?.color,
      textColor: data?.textColor,
      verticalOffset: data?.verticalOffset,
    }
  }

  const [displayContent, setDisplayContent] = useState<DisplayContent>(getInitialLetter());
  
  useEffect(() => {
    setLettersInCycle([]);
  }, [availableLetters, setLettersInCycle]);

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
      const data = getLetterInfo(firstLetter);
      setDisplayContent({
        key: "update-from-selection",
        type: "letter",
        value: firstLetter,
        color: data?.color,
        textColor: data?.textColor,
        verticalOffset: data?.verticalOffset,
      });
    }
  }, [availableLetters, displayContent]);

  const showNextContent = useCallback(() => {
    const now = Date.now();
    if (now - lastChangeTimeRef.current < 100) {
      return;
    }
    lastChangeTimeRef.current = now;

    if (availableLetters.length === 0) {
      setDisplayContent({
        key: "no-letters-msg",
        type: "message",
        value: "Choose some letters in the menu!",
      });
      return;
    }

    let currentCycle = lettersInCycle;
    if (currentCycle.length === 0) {
      currentCycle = shuffle([...availableLetters]);
    }
    
    const newLetter = currentCycle[0];
    const newCycle = currentCycle.slice(1);
    setLettersInCycle(newCycle);

    const letterData = getLetterInfo(newLetter);

    setDisplayContent({
      key: Date.now().toString(),
      type: "letter",
      value: newLetter,
      color: letterData?.color,
      textColor: letterData?.textColor,
      verticalOffset: letterData?.verticalOffset,
    });
  }, [availableLetters, lettersInCycle, setLettersInCycle]);

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
      onPointerDown={showNextContent}
      tabIndex={-1}
    >
      <LetterDisplay content={displayContent} />
      <ModeToggle />
      <FullscreenToggle />
      <LetterSelector
        selectedLetters={selectedLetters}
        setSelectedLetters={setSelectedLetters}
      />
    </main>
  );
}
